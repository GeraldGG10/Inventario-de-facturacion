-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "nombre_usuario" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "rol_id" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "ultimo_acceso" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "usuarios_rol_id_fkey" FOREIGN KEY ("rol_id") REFERENCES "roles" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "permisos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT
);

-- CreateTable
CREATE TABLE "rol_permisos" (
    "rol_id" TEXT NOT NULL,
    "permiso_id" TEXT NOT NULL,

    PRIMARY KEY ("rol_id", "permiso_id"),
    CONSTRAINT "rol_permisos_rol_id_fkey" FOREIGN KEY ("rol_id") REFERENCES "roles" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "rol_permisos_permiso_id_fkey" FOREIGN KEY ("permiso_id") REFERENCES "permisos" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "token" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "revocado" BOOLEAN NOT NULL DEFAULT false,
    "expires_at" DATETIME NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "refresh_tokens_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "auditoria" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "usuario_id" TEXT,
    "accion" TEXT NOT NULL,
    "entidad" TEXT NOT NULL,
    "entidad_id" TEXT,
    "datos_antes" TEXT,
    "datos_despues" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "auditoria_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "configuracion_empresa" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "nombre" TEXT NOT NULL DEFAULT 'Mi Empresa',
    "rnc" TEXT,
    "telefono" TEXT,
    "correo" TEXT,
    "direccion" TEXT,
    "logo_path" TEXT,
    "notas_factura" TEXT
);

-- CreateTable
CREATE TABLE "configuracion_facturacion" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "serie_factura" TEXT NOT NULL DEFAULT 'FAC-',
    "impuesto_porcentaje" REAL NOT NULL DEFAULT 18,
    "moneda" TEXT NOT NULL DEFAULT 'DOP',
    "metodos_pago_habilitados" TEXT NOT NULL DEFAULT 'efectivo,tarjeta,transferencia,mixto',
    "descuento_maximo_sin_aprobar" REAL NOT NULL DEFAULT 10,
    "permite_credito" BOOLEAN NOT NULL DEFAULT false,
    "mostrar_desglose_impuesto" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "configuracion_inventario" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "stock_minimo_default" INTEGER NOT NULL DEFAULT 5,
    "umbral_stock_bajo_porcentaje" INTEGER NOT NULL DEFAULT 30,
    "umbral_stock_critico_porcentaje" INTEGER NOT NULL DEFAULT 10,
    "notificar_app" BOOLEAN NOT NULL DEFAULT true,
    "notificar_email" BOOLEAN NOT NULL DEFAULT false,
    "notificar_sms" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "configuracion_sistema" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "backup_frecuencia_horas" INTEGER NOT NULL DEFAULT 24,
    "backup_carpeta" TEXT NOT NULL DEFAULT 'backups',
    "backup_max_archivos" INTEGER NOT NULL DEFAULT 14
);

-- CreateTable
CREATE TABLE "categorias" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ubicaciones" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "proveedores" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "rnc" TEXT,
    "tipo" TEXT NOT NULL DEFAULT 'empresa',
    "contacto_nombre" TEXT,
    "telefono" TEXT,
    "correo" TEXT,
    "direccion" TEXT,
    "ciudad" TEXT,
    "categoria" TEXT,
    "condiciones_pago" TEXT NOT NULL DEFAULT 'contado',
    "observaciones" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "productos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "codigo" TEXT NOT NULL,
    "codigo_barras" TEXT,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "categoria_id" TEXT,
    "proveedor_id" TEXT,
    "ubicacion_id" TEXT,
    "unidad_medida" TEXT NOT NULL DEFAULT 'unidad',
    "precio_costo" REAL NOT NULL,
    "precio_venta" REAL NOT NULL,
    "stock_actual" INTEGER NOT NULL DEFAULT 0,
    "stock_minimo" INTEGER NOT NULL DEFAULT 5,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "productos_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "productos_proveedor_id_fkey" FOREIGN KEY ("proveedor_id") REFERENCES "proveedores" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "productos_ubicacion_id_fkey" FOREIGN KEY ("ubicacion_id") REFERENCES "ubicaciones" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "movimientos_inventario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "producto_id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "stock_anterior" INTEGER NOT NULL,
    "stock_nuevo" INTEGER NOT NULL,
    "motivo" TEXT,
    "referencia" TEXT,
    "usuario_id" TEXT,
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "movimientos_inventario_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "productos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "movimientos_inventario_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "alertas_inventario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "producto_id" TEXT NOT NULL,
    "stock_actual" INTEGER NOT NULL,
    "stock_minimo" INTEGER NOT NULL,
    "cantidad_sugerida" INTEGER NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "fecha_generada" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_atendida" DATETIME,
    CONSTRAINT "alertas_inventario_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "productos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "entradas_mercancia" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "proveedor_id" TEXT NOT NULL,
    "usuario_id" TEXT,
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "observaciones" TEXT,
    CONSTRAINT "entradas_mercancia_proveedor_id_fkey" FOREIGN KEY ("proveedor_id") REFERENCES "proveedores" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "entradas_mercancia_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "entradas_mercancia_detalle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entrada_id" TEXT NOT NULL,
    "producto_id" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "costo_unitario" REAL NOT NULL,
    "subtotal" REAL NOT NULL,
    CONSTRAINT "entradas_mercancia_detalle_entrada_id_fkey" FOREIGN KEY ("entrada_id") REFERENCES "entradas_mercancia" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "entradas_mercancia_detalle_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "productos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "documento" TEXT,
    "telefono" TEXT,
    "correo" TEXT,
    "direccion" TEXT,
    "limite_credito" REAL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "facturas" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "cliente_id" TEXT NOT NULL,
    "usuario_id" TEXT,
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "subtotal" REAL NOT NULL,
    "descuento_porcentaje" REAL NOT NULL DEFAULT 0,
    "descuento_monto" REAL NOT NULL DEFAULT 0,
    "impuesto_porcentaje" REAL NOT NULL DEFAULT 18,
    "impuesto_monto" REAL NOT NULL,
    "total" REAL NOT NULL,
    "metodo_pago" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'emitida',
    "motivo_anulacion" TEXT,
    "anulada_en" DATETIME,
    "anulada_por_id" TEXT,
    CONSTRAINT "facturas_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "facturas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "detalle_factura" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "factura_id" INTEGER NOT NULL,
    "producto_id" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precio_unitario" REAL NOT NULL,
    "costo_unitario" REAL NOT NULL,
    "descuento_porcentaje" REAL NOT NULL DEFAULT 0,
    "subtotal" REAL NOT NULL,
    CONSTRAINT "detalle_factura_factura_id_fkey" FOREIGN KEY ("factura_id") REFERENCES "facturas" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "detalle_factura_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "productos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "devoluciones" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "factura_id" INTEGER NOT NULL,
    "usuario_id" TEXT,
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "motivo" TEXT NOT NULL,
    CONSTRAINT "devoluciones_factura_id_fkey" FOREIGN KEY ("factura_id") REFERENCES "facturas" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "devoluciones_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "devoluciones_detalle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "devolucion_id" TEXT NOT NULL,
    "producto_id" TEXT NOT NULL,
    "cantidad_devuelta" INTEGER NOT NULL,
    CONSTRAINT "devoluciones_detalle_devolucion_id_fkey" FOREIGN KEY ("devolucion_id") REFERENCES "devoluciones" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "devoluciones_detalle_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "productos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_nombre_usuario_key" ON "usuarios"("nombre_usuario");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "roles_nombre_key" ON "roles"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "permisos_nombre_key" ON "permisos"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "auditoria_entidad_entidad_id_idx" ON "auditoria"("entidad", "entidad_id");

-- CreateIndex
CREATE INDEX "auditoria_usuario_id_idx" ON "auditoria"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "categorias_nombre_key" ON "categorias"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "ubicaciones_nombre_key" ON "ubicaciones"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "productos_codigo_key" ON "productos"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "productos_codigo_barras_key" ON "productos"("codigo_barras");

-- CreateIndex
CREATE INDEX "productos_categoria_id_idx" ON "productos"("categoria_id");

-- CreateIndex
CREATE INDEX "productos_proveedor_id_idx" ON "productos"("proveedor_id");

-- CreateIndex
CREATE INDEX "movimientos_inventario_producto_id_idx" ON "movimientos_inventario"("producto_id");

-- CreateIndex
CREATE INDEX "movimientos_inventario_fecha_idx" ON "movimientos_inventario"("fecha");

-- CreateIndex
CREATE INDEX "alertas_inventario_producto_id_estado_idx" ON "alertas_inventario"("producto_id", "estado");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_documento_key" ON "clientes"("documento");

-- CreateIndex
CREATE INDEX "facturas_cliente_id_idx" ON "facturas"("cliente_id");

-- CreateIndex
CREATE INDEX "facturas_fecha_idx" ON "facturas"("fecha");

-- CreateIndex
CREATE INDEX "facturas_estado_idx" ON "facturas"("estado");

-- CreateIndex
CREATE INDEX "detalle_factura_factura_id_idx" ON "detalle_factura"("factura_id");

-- CreateIndex
CREATE INDEX "detalle_factura_producto_id_idx" ON "detalle_factura"("producto_id");
