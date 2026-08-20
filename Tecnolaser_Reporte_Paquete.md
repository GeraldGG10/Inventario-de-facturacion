# Reporte Técnico: Empaquetado de Tecno-laser a `.exe`

Este documento sirve como referencia sobre los bloqueos técnicos experimentados al transformar el proyecto Stack MERN (con PostgreSQL y Prisma) en un único binario ejecutable mediante `pkg`, y cómo fueron resueltos para asegurar un entorno de ejecución Zero-Config.

## 1. Problemas de Módulos (Resolución de Dependencias en PKG)

### 1.1 Módulos Nativos / Binarios (Bcrypt)

**Problema:** La librería nativa `bcrypt` (usada para encriptar contraseñas) causaba bloqueos al ejecutar el binario debido a su naturaleza compilada en C++. `pkg` no permite empaquetar de forma transparente archivos `.node` sin configuración explícita, y tiende a fallar al importar binarios externos con arquitecturas distintas.
**Solución:** Se reemplazó por completo el uso de `bcrypt` con `bcryptjs`, la cual es una implementación 100% JavaScript (Pure JS). Esto resolvió inmediatamente los problemas de importación.

### 1.2 Módulos Dinámicos y ECMAScript Modules (es-get-iterator)

**Problema:** La dependencia `es-get-iterator` lanzaba errrores de `MODULE_NOT_FOUND` dentro del `.exe`. `pkg` tiene problemas para resolver el mapa de exportes (`"exports": { "." : ... }`) de los `package.json` modernos para ES modules obligados, ocultando los archivos del sistema interno de archivos del ejecutable (`snapshot`).
**Solución:** Se editó el `package.json` de la librería problemática para declarar un `"main": "index.js"` directo. Adicionalmente, se configuró el target de construcción de `pkg` a `--target node16-win-x64` para forzar alta compatibilidad de NodeJS con la resolución de módulos.

## 2. Inyección y Compilación del Frontend (React + Vite)

**Problema:** El servidor Express.js estaba configurado para servir los archivos estáticos desde `../../frontend/dist`. Al pre-compilar a binario de `pkg`, la ruta `__dirname` apunta a un snapshot en memoria estática. El frontend no se incluía o no se resolvía correctamente, causando que todas las visitas a `localhost:4000` dieran página en blanco o `ERR_CONNECTION_REFUSED` / errores ENOENT.
**Solución:** Se configuró el punto de entrada de Express (`backend/src/index.ts`) para detectar que corre sobre un empaquetador verificando `(process as any).pkg`. Se programó el script `build_exe.ps1` para copiar el frontend de react bajo el nombre de `frontend_dist` **junto al exe** generado, y se re-rutearon los request estáticos a esa carpeta local con `path.dirname(process.execPath)`.

## 3. Integración del Cliente Prisma y ORM

**Problema Crítico:** Prisma Client depende de un Motor Binario para realizar las consultas (Query Engine, un DLL compilado). `pkg` no es tolerante a ejecutar binarios de base de datos desde memoria. Lanzaba errores catástróficos al tratar de invocar su engine.
**Solución:**

1. `build_exe.ps1` extrae el archivo `query_engine-windows.dll.node` de la compilación y lo pone al mismo nivel que el `.exe`.
2. Se modificó la instanciación de Prisma (`config/prisma.ts`) para sobreescribir la variable `PRISMA_QUERY_ENGINE_LIBRARY`, dirigiéndolo explícitamente hacia el DLL en la misma carpeta física del directorio externo (`path.dirname(process.execPath)`).

## 4. Inicialización de la Base de Datos PostgreSQL (Portable)

### 4.1 Bloqueo del Hilo Principal

**Problema:** Enviar el comando manual de encendido `pg_ctl start -D db_data` mediante NodeJS `execSync` causaba que todo el servidor se congelara permanentemente esperando que finalizara un subproceso que nunca acababa (estaba en modo 'demonio').
**Solución:** Se eliminó `execSync` y se transformó al uso de `spawnSync` pasándole `windowsHide: true` y un `timeout` de seguridad, previniendo el ahogo del proceso del servidor web si la DB tomaba tiempo en levantar.

### 4.2 Migraciones y Problemas del Cliente de Consola Psql/Prisma

**Problema Crítico:** El sistema necesitaba ejecutar la creación inicial de las tablas en la base de datos la _primera vez_ que un usuario abre el `.exe`. Inicialmente buscábamos usar `prisma db push` mediante sub-procesos de `node`, lo que requería que el usuario tuviera JS instalado. Si se usaba el compilado nativo, `pkg` secuestraba los comandos `node`.
Adicionalmente, cuando las tablas no existían, servicios globales en el inicio de express (ej. Backups automáticos de las configuraciones en SQLite) crasheaban pidiendo campos como 'ConfiguracionesSistema' arruinando el arranque del backend.

**Solución Máxima (Data Seed Dump):**
Para evitar que el cliente dependa de tener NodeJS en su equipo o usar el CLI de Prisma, **abandonamos las migraciones por consola embebida**.

1. Modificamos los scripts para que atrapen sutilmente las llamadas a tablas faltantes (`backup.ts` wrap en try-catch).
2. Agregamos el archivo pre-calculado `schema_seed.sql` al repositorio. Este contiene **el esquema final + Data Semilla** (permisos, usuario administrador base `admin@facturacion.local`, data por defecto).
3. `build_exe.ps1` empaqueta este archivo SQL junto con la aplicación.
4. `Tecno-laser.exe`, al detectar la creación de la DB limpia portátil, invoca de manera oculta a `psql.exe` con este script en texto plano (`schema.sql`). La inserción de las tablas ocurre instantánea, sin depender de JS, generando un backend 100% autónomo.

## Resumen del Entorno de Distribución

El producto completo para distribución se empaqueta sin dependencia de Node.js en el sistema final, generando la estructura:

```
Tecno-laser_Distribuir/
 ├── Tecno-laser.exe (Backend + Control portátil)
 ├── pgsql/ (Motor Base de Datos autónomo)
 ├── frontend_dist/ (Interfaz HTML)
 ├── schema.sql (Modelo final + Data seed)
 ├── .env
 └── *.node (Motor de prisma)
```

**Resultado Final:** Un click despliega el motor, importa datos por defecto en menos de un segundo, y abre el puerto 4000. Al cerrar, se apaga de forma segura.
