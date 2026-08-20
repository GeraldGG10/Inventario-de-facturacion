# Guía de Instalación y Distribución: Stockly

Sigue estos pasos para convertir el proyecto a un ejecutable (`.exe`) y configurar la máquina principal donde correrá el sistema.

## 1. Convertir el proyecto a `.exe`

Para compilar todo el código y generar el archivo ejecutable, solo necesitas ejecutar el script automatizado que hemos creado.

1. Abre **PowerShell** como Administrador.
2. Navega a la carpeta principal del proyecto:
   ```powershell
   cd C:\Users\user\Desktop\Inventario-de-facturacion-master
   ```
3. Ejecuta el script de compilación:
   ```powershell
   .\build_exe.ps1
   ```

El script hará lo siguiente automáticamente:
- Compilará el frontend (React).
- Compilará el backend (TypeScript a JavaScript).
- Instalará la herramienta `pkg`.
- Empaquetará todo en el archivo **`Stockly.exe`**.
- Copiará el archivo `.env` y el motor de Prisma (`*.node`) junto al `.exe`.

### 📦 Archivos resultantes para distribuir
Una vez termine, tendrás los siguientes archivos en la carpeta raíz. **Estos tres archivos deben estar siempre juntos en la misma carpeta** en la máquina principal:
- `Stockly.exe` (El programa principal)
- `.env` (Configuración y contraseñas)
- `query_engine-windows.dll.node` (Motor de base de datos de Prisma)

---

## 2. Configurar la Máquina Principal (Servidor) por Primera Vez

La máquina principal es el computador donde estará guardada la base de datos y donde se ejecutará el `Stockly.exe`. 

### A. Instalar PostgreSQL
Como Stockly usa PostgreSQL, debes instalarlo en la máquina principal antes de correr el sistema por primera vez:

1. Descarga el instalador de PostgreSQL para Windows desde [postgresql.org](https://www.postgresql.org/download/windows/).
2. Ejecuta el instalador y sigue los pasos.
3. **¡IMPORTANTE!** Durante la instalación, te pedirá que crees una contraseña para el superusuario `postgres`. 
   - Debes poner la contraseña que está configurada en tu archivo `.env`. Por defecto es: `stockly2026`.
   - Si eliges otra contraseña, asegúrate de abrir el archivo `.env` y cambiarla allí también.
4. Completa la instalación.

### B. Crear la base de datos y las tablas (Una sola vez)
1. Abre **pgAdmin 4** (se instaló junto con PostgreSQL).
2. Conéctate con la contraseña (`stockly2026`).
3. Haz clic derecho en "Databases" -> Create -> Database.
4. Nombra la base de datos como **`stockly`** y guárdala.
5. Abre la consola de tu editor en la ruta del proyecto y sincroniza la base de datos ejecutando:
   ```powershell
   cd backend
   npx prisma db push
   npm run seed
   ```
   *(Esto creará las tablas y el usuario Administrador inicial).*

### C. Configuración de Red (¡Totalmente Automática!)
¡Buenas noticias! Stockly está diseñado para funcionar sin que tengas que configurar la red de forma manual. 
El sistema usa el **Nombre de tu Computadora (Hostname)** para crear un enlace universal en tu red Wi-Fi. Esto significa que **no necesitas configurar una IP estática**. Aunque tu router se reinicie y asigne una IP diferente, el enlace seguirá funcionando siempre.

---

## 3. Uso Diario: Ejecutar el Sistema

En el día a día, el dueño o administrador solo tiene que hacer lo siguiente:

1. Hacer **doble clic en `Stockly.exe`**.
2. El programa automáticamente:
   - Verificará si el servicio de PostgreSQL está corriendo (si se apagó la PC, **el exe lo encenderá automáticamente**).
   - Verificará la conexión a la base de datos local.
   - **Abrirá el navegador por defecto** llevándote a la pantalla de Login (`http://localhost:4000`).

### ¿Cómo conecto a las Cajeras y demás usuarios?
1. En la máquina principal (donde corriste el `.exe`), entra al sistema con el usuario Administrador.
2. Ve al menú **Configuración** -> Pestaña **Empresa**.
3. Verás una nueva tarjeta azul que dice **Acceso Automático en Red Local (LAN)**.
4. Haz clic en el botón **Copiar**. Te copiará un enlace parecido a `http://TU-PC:4000`.
5. Envía ese enlace a los empleados por WhatsApp, correo o guárdalo como favorito en las computadoras de ellos.
6. Los empleados solo deben abrir ese enlace en sus navegadores y verán la pantalla de login de Stockly. *(Recuerda: todos deben estar conectados a la misma red Wi-Fi o cableada).*
