"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Script de datos de PRUEBA (no se ejecuta en producción ni en el build).
// Corre esto aparte con `npm run seed:demo` cuando quieras llenar la base con
// un catálogo completo para probar el sistema. Para borrarlo todo y volver
// al estado mínimo (solo roles/permisos/usuario admin), corre:
//   npx prisma migrate reset
// (esto borra el .db y vuelve a aplicar migraciones + el seed base).
const client_1 = require("@prisma/client");
const inventario_1 = require("../src/services/inventario");
const prisma = new client_1.PrismaClient();
const CATEGORIAS = ['Electrónica', 'Mobiliario', 'Suministros de Oficina', 'Materiales de Construcción', 'Ferretería', 'Alimentos y Bebidas'];
const UBICACIONES = ['Almacén Principal', 'Bodega Secundaria', 'Estante A-1'];
const PROVEEDORES = [
    { nombre: 'Distribuidora Los Andes S.A.', rnc: '1-01-85934-2', contactoNombre: 'Carlos Mendoza', telefono: '809-555-0123', correo: 'ventas@losandes.example', categoria: 'Suministros de Oficina' },
    { nombre: 'Tecnología y Partes EIRL', rnc: '1-30-98765-2', contactoNombre: 'Ana Ramírez', telefono: '829-555-4567', correo: 'soporte@tecpartes.example', categoria: 'Electrónica' },
    { nombre: 'Importadora Mundial', rnc: '1-02-11223-4', contactoNombre: 'Roberto Gómez', telefono: '809-555-7890', correo: 'compras@impmundial.example', categoria: 'Materiales de Construcción' },
    { nombre: 'Ferretería Dominicana C. por A.', rnc: '1-04-55221-8', contactoNombre: 'Luis Peña', telefono: '809-555-3344', correo: 'info@ferredom.example', categoria: 'Ferretería' },
    { nombre: 'Muebles y Oficina RD', rnc: '1-05-77410-1', contactoNombre: 'Yolanda Cruz', telefono: '829-555-9021', correo: 'contacto@mueblesrd.example', categoria: 'Mobiliario' },
    { nombre: 'Distribuidora de Alimentos del Caribe', rnc: '1-06-40098-6', contactoNombre: 'Pedro Almonte', telefono: '809-555-6612', correo: 'ventas@alimcaribe.example', categoria: 'Alimentos y Bebidas' },
];
const CLIENTES = [
    { nombre: 'Construmart Dominicana S.A.', documento: '1-01-85934-9', telefono: '809-555-0192', correo: 'compras@construmart.example', limiteCredito: 500000 },
    { nombre: 'Ferretería El Progreso', documento: '1-02-22341-0', telefono: '809-555-1188', correo: 'admin@elprogreso.example', limiteCredito: 150000 },
    { nombre: 'Ingeniería del Norte SRL', documento: '1-03-99012-3', telefono: '809-555-4420', correo: 'proyectos@ingnorte.example', limiteCredito: 300000 },
    { nombre: 'Acme Corp.', documento: '1-04-10293-5', telefono: '809-555-0198', correo: 'contacto@acmecorp.example', limiteCredito: 200000 },
    { nombre: 'Globex Inc.', documento: '1-05-38221-7', telefono: '809-555-0123', correo: 'info@globex.example', limiteCredito: 100000 },
    { nombre: 'Tech Solutions SAC', documento: '1-06-77102-4', telefono: '809-555-3390', correo: 'ventas@techsolutions.example', limiteCredito: 80000 },
    { nombre: 'Distribuidora Sur', documento: '1-07-19283-6', telefono: '809-555-2244', correo: 'compras@distsur.example', limiteCredito: 120000 },
    { nombre: 'Digital Express', documento: '1-08-55672-1', telefono: '809-555-9987', correo: 'soporte@digitalexpress.example', limiteCredito: 60000 },
    { nombre: 'Servicios Norte', documento: '1-09-40021-9', telefono: '809-555-1023', correo: 'admin@serviciosnorte.example', limiteCredito: 90000 },
    { nombre: 'Juan Pérez', documento: '402-1234567-8', telefono: '809-555-7712', correo: 'juan.perez@example.com', limiteCredito: null },
    { nombre: 'María Gómez', documento: '402-7654321-2', telefono: '829-555-4498', correo: 'maria.gomez@example.com', limiteCredito: null },
    { nombre: 'Design Studio SA', documento: '1-10-88012-5', telefono: '809-555-6690', correo: 'hola@designstudio.example', limiteCredito: 70000 },
];
const PRODUCTOS = [
    { codigo: 'PRD-001', nombre: 'Laptop Pro X15', categoria: 'Electrónica', proveedor: 'Tecnología y Partes EIRL', precioCosto: 1100, precioVenta: 1499, stockActual: 0, stockMinimo: 5 },
    { codigo: 'PRD-002', nombre: 'Monitor UltraWide 27"', categoria: 'Electrónica', proveedor: 'Tecnología y Partes EIRL', precioCosto: 280, precioVenta: 380, stockActual: 8, stockMinimo: 15 },
    { codigo: 'PRD-003', nombre: 'Teclado Mecánico Keychron K2', categoria: 'Electrónica', proveedor: 'Tecnología y Partes EIRL', precioCosto: 55, precioVenta: 89, stockActual: 34, stockMinimo: 10 },
    { codigo: 'PRD-004', nombre: 'Mouse Inalámbrico MX Master', categoria: 'Electrónica', proveedor: 'Tecnología y Partes EIRL', precioCosto: 28, precioVenta: 45, stockActual: 60, stockMinimo: 15 },
    { codigo: 'PRD-005', nombre: 'Webcam 4K HD', categoria: 'Electrónica', proveedor: 'Tecnología y Partes EIRL', precioCosto: 60, precioVenta: 95, stockActual: 12, stockMinimo: 8 },
    { codigo: 'PRD-006', nombre: 'Cable Red Cat6 (rollo 100m)', categoria: 'Electrónica', proveedor: 'Tecnología y Partes EIRL', precioCosto: 45, precioVenta: 68, stockActual: 3, stockMinimo: 10 },
    { codigo: 'PRD-007', nombre: 'Silla Ergonómica Pro', categoria: 'Mobiliario', proveedor: 'Muebles y Oficina RD', precioCosto: 3200, precioVenta: 4500, stockActual: 6, stockMinimo: 3 },
    { codigo: 'PRD-008', nombre: 'Escritorio Ejecutivo 1.60m', categoria: 'Mobiliario', proveedor: 'Muebles y Oficina RD', precioCosto: 5800, precioVenta: 7900, stockActual: 4, stockMinimo: 2 },
    { codigo: 'PRD-009', nombre: 'Archivero Metálico 4 Gavetas', categoria: 'Mobiliario', proveedor: 'Muebles y Oficina RD', precioCosto: 4200, precioVenta: 5600, stockActual: 2, stockMinimo: 3 },
    { codigo: 'PRD-010', nombre: 'Papel Bond A4 (resma 500 hojas)', categoria: 'Suministros de Oficina', proveedor: 'Distribuidora Los Andes S.A.', precioCosto: 180, precioVenta: 250, stockActual: 15, stockMinimo: 20 },
    { codigo: 'PRD-011', nombre: 'Cartucho Tinta Negra HP', categoria: 'Suministros de Oficina', proveedor: 'Distribuidora Los Andes S.A.', precioCosto: 850, precioVenta: 1150, stockActual: 0, stockMinimo: 10 },
    { codigo: 'PRD-012', nombre: 'Grapadora Metálica Estándar', categoria: 'Suministros de Oficina', proveedor: 'Distribuidora Los Andes S.A.', precioCosto: 120, precioVenta: 180, stockActual: 25, stockMinimo: 8 },
    { codigo: 'PRD-013', nombre: 'Cemento Titán Gris 42.5kg', categoria: 'Materiales de Construcción', proveedor: 'Importadora Mundial', precioCosto: 280, precioVenta: 340, stockActual: 120, stockMinimo: 30, unidadMedida: 'saco' },
    { codigo: 'PRD-014', nombre: 'Varilla Corrugada 3/8"x20\'', categoria: 'Materiales de Construcción', proveedor: 'Importadora Mundial', precioCosto: 210, precioVenta: 265, stockActual: 8, stockMinimo: 15 },
    { codigo: 'PRD-015', nombre: 'Block de Concreto 6"', categoria: 'Materiales de Construcción', proveedor: 'Importadora Mundial', precioCosto: 28, precioVenta: 38, stockActual: 340, stockMinimo: 50, unidadMedida: 'unidad' },
    { codigo: 'PRD-016', nombre: 'Arena Lavada (m³)', categoria: 'Materiales de Construcción', proveedor: 'Importadora Mundial', precioCosto: 450, precioVenta: 620, stockActual: 18, stockMinimo: 5, unidadMedida: 'm3' },
    { codigo: 'PRD-017', nombre: 'Martillo de Carpintero 16oz', categoria: 'Ferretería', proveedor: 'Ferretería Dominicana C. por A.', precioCosto: 180, precioVenta: 260, stockActual: 22, stockMinimo: 10 },
    { codigo: 'PRD-018', nombre: 'Taladro Eléctrico 1/2"', categoria: 'Ferretería', proveedor: 'Ferretería Dominicana C. por A.', precioCosto: 2200, precioVenta: 2950, stockActual: 5, stockMinimo: 3 },
    { codigo: 'PRD-019', nombre: 'Juego de Llaves Allen (10 pzs)', categoria: 'Ferretería', proveedor: 'Ferretería Dominicana C. por A.', precioCosto: 150, precioVenta: 220, stockActual: 30, stockMinimo: 10 },
    { codigo: 'PRD-020', nombre: 'Cinta Métrica 5m', categoria: 'Ferretería', proveedor: 'Ferretería Dominicana C. por A.', precioCosto: 95, precioVenta: 140, stockActual: 1, stockMinimo: 8 },
    { codigo: 'PRD-021', nombre: 'Agua Mineral 500ml (paquete 24)', categoria: 'Alimentos y Bebidas', proveedor: 'Distribuidora de Alimentos del Caribe', precioCosto: 220, precioVenta: 300, stockActual: 40, stockMinimo: 15 },
    { codigo: 'PRD-022', nombre: 'Café Molido 1lb', categoria: 'Alimentos y Bebidas', proveedor: 'Distribuidora de Alimentos del Caribe', precioCosto: 180, precioVenta: 260, stockActual: 28, stockMinimo: 10 },
    { codigo: 'PRD-023', nombre: 'Refresco Cola 2L (paquete 6)', categoria: 'Alimentos y Bebidas', proveedor: 'Distribuidora de Alimentos del Caribe', precioCosto: 310, precioVenta: 420, stockActual: 4, stockMinimo: 12 },
    { codigo: 'PRD-024', nombre: 'Cámara Mirrorless 24MP', categoria: 'Electrónica', proveedor: 'Tecnología y Partes EIRL', precioCosto: 1500, precioVenta: 1980, stockActual: 3, stockMinimo: 2 },
];
const METODOS_PAGO = ['efectivo', 'tarjeta', 'transferencia', 'mixto'];
function hace(dias, horas = 10) {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - dias);
    fecha.setHours(horas, Math.floor(Math.random() * 60), 0, 0);
    return fecha;
}
async function main() {
    console.log('Cargando datos de prueba...');
    const categorias = new Map();
    for (const nombre of CATEGORIAS) {
        const c = await prisma.categoria.upsert({ where: { nombre }, update: {}, create: { nombre } });
        categorias.set(nombre, c.id);
    }
    const ubicaciones = [];
    for (const nombre of UBICACIONES) {
        const u = await prisma.ubicacion.upsert({ where: { nombre }, update: {}, create: { nombre } });
        ubicaciones.push(u.id);
    }
    const proveedores = new Map();
    for (const p of PROVEEDORES) {
        const existente = await prisma.proveedor.findFirst({ where: { nombre: p.nombre } });
        const prov = existente ?? (await prisma.proveedor.create({ data: p }));
        proveedores.set(p.nombre, prov.id);
    }
    // Generar hasta llegar a 30 PROVEEDORES
    let pIndex = 1;
    while (proveedores.size < 30) {
        const nombre = `Proveedor Prueba ${pIndex}`;
        const existente = await prisma.proveedor.findFirst({ where: { nombre } });
        const prov = existente ?? (await prisma.proveedor.create({
            data: { nombre, rnc: `1-00-${10000 + pIndex}-1`, contactoNombre: `Contacto ${pIndex}`, telefono: `809-555-${1000 + pIndex}`, correo: `prov${pIndex}@example.com`, categoria: 'General' }
        }));
        proveedores.set(nombre, prov.id);
        pIndex++;
    }
    const clientes = [];
    for (const c of CLIENTES) {
        const existente = await prisma.cliente.findFirst({ where: { nombre: c.nombre } });
        const cli = existente ?? (await prisma.cliente.create({ data: c }));
        clientes.push(cli.id);
    }
    // Generar hasta llegar a 30 CLIENTES
    let cIndex = 1;
    while (clientes.length < 30) {
        const nombre = `Cliente Prueba ${cIndex}`;
        const existente = await prisma.cliente.findFirst({ where: { nombre } });
        const cli = existente ?? (await prisma.cliente.create({ data: { nombre, documento: `402-${1000000 + cIndex}-1`, telefono: `829-555-${1000 + cIndex}`, correo: `cliente${cIndex}@example.com`, limiteCredito: 50000 } }));
        clientes.push(cli.id);
        cIndex++;
    }
    const productos = [];
    for (let i = 0; i < PRODUCTOS.length; i++) {
        const p = PRODUCTOS[i];
        const existente = await prisma.producto.findUnique({ where: { codigo: p.codigo } });
        const producto = existente
            ?? (await prisma.producto.create({
                data: {
                    codigo: p.codigo,
                    nombre: p.nombre,
                    categoriaId: categorias.get(p.categoria) || Array.from(categorias.values())[0],
                    proveedorId: proveedores.get(p.proveedor) || Array.from(proveedores.values())[0],
                    ubicacionId: ubicaciones[i % ubicaciones.length],
                    unidadMedida: p.unidadMedida ?? 'unidad',
                    precioCosto: p.precioCosto,
                    precioVenta: p.precioVenta,
                    stockActual: p.stockActual + 20, // Darles stock a los primeros para que haya qué vender
                    stockMinimo: p.stockMinimo,
                },
            }));
        productos.push({ id: producto.id, precioVenta: producto.precioVenta, precioCosto: producto.precioCosto, stockMinimo: producto.stockMinimo });
    }
    // Generar hasta llegar a 30 PRODUCTOS
    let prIndex = 1;
    const provArr = Array.from(proveedores.values());
    const catArr = Array.from(categorias.values());
    while (productos.length < 30) {
        const pcodigo = `PRD-GEN-${prIndex}`;
        const existente = await prisma.producto.findUnique({ where: { codigo: pcodigo } });
        const producto = existente ?? (await prisma.producto.create({
            data: {
                codigo: pcodigo,
                nombre: `Producto Generado ${prIndex}`,
                categoriaId: catArr[prIndex % catArr.length],
                proveedorId: provArr[prIndex % provArr.length],
                ubicacionId: ubicaciones[prIndex % ubicaciones.length],
                unidadMedida: 'unidad',
                precioCosto: 100,
                precioVenta: 150,
                stockActual: 50,
                stockMinimo: 10,
            }
        }));
        productos.push({ id: producto.id, precioVenta: producto.precioVenta, precioCosto: producto.precioCosto, stockMinimo: producto.stockMinimo });
        prIndex++;
    }
    const facturasExistentes = await prisma.factura.count();
    if (facturasExistentes < 100) {
        const admin = await prisma.usuario.findFirst({ where: { email: 'admin@facturacion.local' } });
        // Crear 80 facturas distribuidas en los últimos 45 días
        for (let i = 0; i < 80; i++) {
            const cantidadLineas = 1 + Math.floor(Math.random() * 4);
            const clienteId = clientes[Math.floor(Math.random() * clientes.length)];
            const lineas = [];
            let subtotal = 0;
            for (let l = 0; l < cantidadLineas; l++) {
                const producto = productos[Math.floor(Math.random() * productos.length)];
                const cantidad = 1 + Math.floor(Math.random() * 3);
                const lineaSubtotal = producto.precioVenta * cantidad;
                lineas.push({ productoId: producto.id, cantidad, precioUnitario: producto.precioVenta, costoUnitario: producto.precioCosto, subtotal: lineaSubtotal });
                subtotal += lineaSubtotal;
            }
            const impuestoPorcentaje = 18;
            const impuestoMonto = subtotal * (impuestoPorcentaje / 100);
            const total = subtotal + impuestoMonto;
            const esAnulada = i % 15 === 14;
            const diasAtras = Math.floor(Math.random() * 45); // Hace de 0 a 45 días
            const factura = await prisma.factura.create({
                data: {
                    clienteId,
                    usuarioId: admin?.id,
                    fecha: hace(diasAtras),
                    subtotal,
                    impuestoPorcentaje,
                    impuestoMonto,
                    total,
                    metodoPago: METODOS_PAGO[Math.floor(Math.random() * METODOS_PAGO.length)],
                    estado: esAnulada ? 'anulada' : 'emitida',
                    motivoAnulacion: esAnulada ? 'Solicitud del cliente' : null,
                    anuladaEn: esAnulada ? hace(Math.max(0, diasAtras - 1)) : null,
                    anuladaPorId: esAnulada ? admin?.id : null,
                    detalles: { create: lineas },
                },
            });
            if (!esAnulada) {
                for (const linea of lineas) {
                    try {
                        await prisma.$transaction((tx) => (0, inventario_1.registrarMovimientoTx)(tx, {
                            productoId: linea.productoId,
                            tipo: 'salida',
                            cantidad: linea.cantidad,
                            motivo: 'Venta',
                            referencia: String(factura.id),
                            usuarioId: admin?.id,
                        }));
                    }
                    catch {
                        // ignorar
                    }
                }
            }
        }
        console.log('80 facturas de prueba creadas.');
    }
    else {
        console.log('Ya existen facturas; no se generaron nuevas para no duplicar.');
    }
    console.log('Datos de prueba cargados exitosamente (30+ clientes, proveedores, productos y 80 facturas).');
}
main()
    .catch((error) => {
    console.error(error);
    process.exit(1);
})
    .finally(() => prisma.$disconnect());
