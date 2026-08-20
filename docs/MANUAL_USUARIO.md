# Manual de Usuario — Stockly

Sistema de Inventario y Facturación. Este manual cubre el uso de la interfaz y cómo funciona el acceso en red (LAN) para múltiples equipos.

---

## 1. Primer acceso

1. En la PC principal (donde corre `Stockly.exe`), hacer doble clic en el ejecutable.
2. El sistema arranca su propio motor de base de datos, verifica la conexión y abre el navegador automáticamente en `http://localhost:4000`.
3. Iniciar sesión con el usuario administrador inicial:
   - **Correo:** `admin@facturacion.local`
   - **Contraseña:** `CambiarEsta123!`
4. Cambiar esa contraseña de inmediato desde Configuración, o crear usuarios nuevos y desactivar el admin genérico.

## 2. Roles y qué ve cada uno

| Rol | Dashboard | Inventario | Facturación | Clientes | Proveedores | Reportes | Configuración |
|---|---|---|---|---|---|---|---|
| Administrador | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| Cajero | ✔ | ✔ (solo ver) | ✔ | ✔ | — | ✔ | — |
| Almacenista | ✔ | ✔ | — | — | ✔ | ✔ | — |
| Reportes | ✔ | — | — | — | — | ✔ | — |

El menú lateral se adapta solo: un cajero nunca ve "Proveedores" ni "Configuración", por ejemplo. Esto no es solo cosmético — el backend rechaza la acción igual aunque alguien intente llamarla directamente.

## 3. Dashboard

Pantalla de inicio. Muestra:
- Tarjetas de ventas del día/semana y ganancia neta del mes.
- Gráfica de ventas y ganancias, con selector Hoy / Semana / Mes.
- Top productos del mes.
- Alertas de inventario (stock bajo/agotado) con acceso directo a "Revisar Reabastecimiento".
- Últimas transacciones, con acceso al detalle de cada factura.

## 4. Inventario

Submenú: **Productos · Movimientos · Alertas · Categorías**

### 4.1 Productos
- Búsqueda por código, nombre o código de barras — filtra en vivo mientras se escribe.
- Filtros por categoría y estado (Disponible / Stock Bajo / Agotado / Inactivo).
- **Nuevo artículo**: código, nombre, categoría, proveedor, precios de costo/venta, stock inicial, stock mínimo, ubicación.
- Acciones por fila: Ver detalles, Editar, Desactivar (no se elimina físicamente — se conserva el historial de movimientos y facturas).
- Desde "Ver detalles" se puede registrar una entrada rápida de stock sin pasar por el flujo completo de Movimientos.

### 4.2 Movimientos
Historial de entradas, salidas, ajustes y devoluciones de cada producto, con usuario y fecha. Se puede registrar un movimiento manual (entrada/salida/ajuste) desde acá — útil para conteos físicos o correcciones que no vienen de una venta.

### 4.3 Alertas
Lista de productos en stock bajo o agotado. Se recalcula contra el inventario real cada vez que se abre, así que siempre refleja el estado actual — no depende de que alguien haya "generado" la alerta manualmente.

### 4.4 Categorías
Alta, edición y activar/desactivar categorías. El contador de "Productos" por categoría ayuda a saber si se puede reorganizar sin dejar productos huérfanos.

## 5. Facturación (Nueva Venta)

1. **Cliente**: buscar por nombre, RNC o teléfono, o crear uno nuevo sin salir de la pantalla.
2. **Productos**: "Agregar producto" abre un buscador; los productos agotados o inactivos no aparecen, pero los de stock bajo sí (se puede vender hasta la última unidad).
3. Ajustar cantidades directamente en la tabla de la venta.
4. **Método de pago**: efectivo, tarjeta, transferencia o mixto. Transferencia/mixto piden un paso adicional de referencia/montos.
5. **Confirmar Venta**: descuenta el stock automáticamente y genera el número de factura.

### Anular una factura
Desde "Facturas Recientes", click en el badge verde "Emitida" → elegir motivo → confirmar. La factura queda marcada como **Anulada** (nunca se borra) y el stock vendido se repone, descontando lo que ya se hubiera devuelto por separado.

### Devolución parcial
Distinto de anular: el cliente devuelve *algunas* unidades, la factura sigue vigente.
1. Click en el número de la factura para ver su detalle.
2. Si queda algo por devolver, aparece **Registrar Devolución**.
3. Indicar cuánto se devuelve de cada producto (no deja poner más de lo que queda disponible) y el motivo.
4. El stock se repone al confirmar.

### Exportar / imprimir
Ícono de PDF en cada factura, o el botón "Exportar" dentro del detalle.

## 6. Clientes

- Tabla con búsqueda en vivo, documento, teléfono, total comprado.
- **Perfil Rápido** (panel derecho): al hacer click en un cliente de la tabla, se resume ahí — avatar, cantidad de compras, total gastado — sin abrir un modal. "Ver Historial Completo" sí abre el detalle con todas sus facturas.
- Editar / Desactivar cliente (no elimina, conserva el historial de facturación).

## 7. Proveedores

- Tabla con búsqueda, RNC, cantidad de productos suministrados.
- Alta/edición completa (contacto, dirección, ciudad, condiciones de pago, observaciones).
- Registrar entradas de mercancía desde el perfil del proveedor: eso aumenta el stock de los productos recibidos y actualiza su costo.

## 8. Reportes

- **Financiero**: ingresos, costos, ganancia, margen — filtrable por Hoy/Semana/Mes/Año.
- **Ventas por categoría**: gráfica de barras.
- **Estado de Inventario**: agotados y stock bajo, con acceso directo al inventario completo.
- **Exportar**: PDF o Excel (.xlsx) del reporte de ventas del período seleccionado.
- **Orden de compra sugerida**: PDF con los productos por debajo de su mínimo y la cantidad sugerida a pedir, agrupados por proveedor.

## 9. Configuración (solo Administrador)

### Datos de la Empresa
Razón social, RNC, teléfono, dirección — aparecen en las facturas y reportes en PDF.

### Usuarios y Roles
Alta de usuarios (nombre, usuario, correo, rol, contraseña temporal) y activar/desactivar accesos. No hay edición de permisos individuales: los permisos vienen dados por el rol asignado.

### Ajustes de Facturación
Tasa de impuesto, moneda, serie de numeración de facturas, descuento máximo sin aprobación, si se permite crédito.

### Auditoría
Registro de quién hizo qué y cuándo: creación/edición de productos, ventas, anulaciones, cambios de configuración, inicios de sesión. Es de solo lectura — sirve para trazabilidad, no se puede editar ni borrar.

### Acceso en Red (LAN)
Tarjeta con el enlace `http://<nombre-de-tu-pc>:4000` y un botón para copiarlo — ver sección siguiente.

---

## 10. Cómo funciona el acceso desde varias computadoras

**La idea en una frase:** `Stockly.exe` corre en **una sola PC** (la "principal"), y todos los demás equipos simplemente abren un navegador y entran a esa PC por la red — no instalan nada.

### ¿Dónde vive la base de datos?
Dentro de `Stockly.exe` corre un motor de PostgreSQL portátil — un gestor de base de datos real, no un archivo simple. Los datos quedan guardados en una carpeta `db_data/` al lado del ejecutable, en la PC principal. **Todos los usuarios, sin importar desde qué computadora entren, leen y escriben sobre esa misma base de datos.** No hay copias ni sincronización: es una sola fuente de verdad.

### ¿Por qué no cada PC tiene su propia base?
Porque perderías la razón de ser del sistema: si cada caja tuviera su propio inventario, una venta en la Caja 1 no descontaría el stock que ve la Caja 2, y terminarías vendiendo lo mismo dos veces. Con una base central, en el instante que alguien vende algo, todas las pantallas ven el stock actualizado.

### ¿Cómo se conectan las otras PCs?
1. En la PC principal, entrar a **Configuración → Empresa** con el usuario administrador.
2. Copiar el enlace de la tarjeta "Acceso en Red Local" (algo como `http://ESCRITORIO-CAJA1:4000`).
3. En cualquier otra computadora **conectada a la misma red WiFi o cableada**, abrir ese enlace en Chrome, Edge o el navegador que sea.
4. Va a aparecer la misma pantalla de login. Cada persona entra con su propio usuario y ve solo lo que su rol permite.

No hace falta configurar una IP fija: el enlace usa el **nombre de la computadora** (hostname), así que sigue funcionando aunque el router reinicie y cambie las IPs internas.

### Requisitos para que esto funcione
- Todas las computadoras (la principal y las que se conectan) deben estar **en la misma red** — mismo WiFi o mismo switch/cable. Esto no funciona a través de internet ni desde otra red distinta.
- La PC principal debe quedar **encendida** con `Stockly.exe` abierto mientras otros la usan — si la apagás, nadie más puede facturar hasta que la prendas de nuevo.
- El firewall de Windows puede preguntar la primera vez si permitir la conexión: hay que aceptar ("permitir en redes privadas").

### ¿Qué tan seguro es?
- Nadie desde internet puede llegar a este sistema — solo queda expuesto dentro de la red local del negocio. Es tan seguro como lo sea la contraseña del WiFi.
- Cada persona necesita su propio usuario y contraseña para entrar; sin eso, ve solo la pantalla de login.
- Los roles se aplican siempre en el servidor (la PC principal), no en el navegador de cada quien — aunque alguien manipulara su propia pantalla, el servidor sigue rechazando lo que su rol no permite.

### Respaldo
La PC principal puede generar respaldos automáticos (frecuencia configurable en Configuración → Sistema) o manuales, con `pg_dump` (una copia completa y restaurable de la base). Se guardan localmente en esa misma PC — vale la pena copiarlos periódicamente a un disco externo o nube.

---

## 11. Preguntas frecuentes

**¿Qué pasa si apago la PC principal por error mientras alguien está facturando?**
Esa persona pierde la conexión y no puede seguir hasta que se vuelva a prender la PC principal y abrir `Stockly.exe`. Ninguna venta a medias se guarda parcialmente — o se completó antes del corte, o no quedó registrada.

**¿Puedo usar Stockly desde mi celular?**
Sí, siempre que el celular esté conectado a la misma red WiFi del negocio — es solo abrir el navegador y entrar al mismo enlace.

**¿Se puede acceder desde fuera del negocio (otra sucursal, desde casa)?**
No con la configuración actual — está diseñado para funcionar solo dentro de la red local, por seguridad y simplicidad. Acceder desde afuera requeriría una configuración de red adicional (VPN) que no viene incluida.

**Un producto "Stock Bajo" no me deja vender la última unidad, ¿es normal?**
No — "Stock Bajo" es solo una alerta para reponer pronto, nunca bloquea la venta. Solo un producto realmente "Agotado" (0 unidades) o "Inactivo" no aparece en el buscador de facturación.

**¿Cómo cambio la contraseña del administrador inicial?**
Configuración → Usuarios y Roles no permite editar contraseñas de otros usuarios ya creados desde ahí en esta versión; la forma más simple es crear un usuario administrador nuevo con tu propia contraseña y desactivar el genérico.
