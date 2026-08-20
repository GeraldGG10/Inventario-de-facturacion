"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Creando solo facturas...');
    const clientes = await prisma.cliente.findMany({ where: { nombre: { startsWith: 'Cliente Prueba' } } });
    const productos = await prisma.producto.findMany({ where: { nombre: { startsWith: 'Producto de Prueba' } } });
    const admin = await prisma.usuario.findFirst({ where: { email: 'admin@facturacion.local' } });
    console.log(`Encontrados ${clientes.length} clientes y ${productos.length} productos.`);
    if (clientes.length === 0 || productos.length === 0) {
        console.log('Faltan clientes o productos. Saliendo.');
        return;
    }
    // Eliminar facturas existentes de prueba
    await prisma.detalleFactura.deleteMany({ where: { factura: { cliente: { nombre: { startsWith: 'Cliente Prueba' } } } } });
    await prisma.factura.deleteMany({ where: { cliente: { nombre: { startsWith: 'Cliente Prueba' } } } });
    // Crear 20 Facturas
    for (let i = 1; i <= 20; i++) {
        const cliente = clientes[i - 1]; // Tenemos 20 clientes
        const producto1 = productos[Math.floor(Math.random() * ((productos.length / 2) - 1))];
        const producto2 = productos[Math.floor(Math.random() * ((productos.length / 2) - 1)) + Math.floor(productos.length / 2)];
        let subtotal = (producto1.precioVenta * 2) + (producto2.precioVenta * 1);
        let impuestoMonto = subtotal * 0.18;
        let total = subtotal + impuestoMonto;
        try {
            await prisma.factura.create({
                data: {
                    clienteId: cliente.id,
                    usuarioId: admin?.id,
                    subtotal,
                    impuestoMonto,
                    total,
                    metodoPago: 'efectivo',
                    detalles: {
                        create: [
                            {
                                productoId: producto1.id,
                                cantidad: 2,
                                precioUnitario: producto1.precioVenta,
                                costoUnitario: producto1.precioCosto,
                                subtotal: producto1.precioVenta * 2
                            },
                            {
                                productoId: producto2.id,
                                cantidad: 1,
                                precioUnitario: producto2.precioVenta,
                                costoUnitario: producto2.precioCosto,
                                subtotal: producto2.precioVenta * 1
                            }
                        ]
                    }
                }
            });
        }
        catch (e) {
            console.error(`Error creando factura ${i}:`, e);
            throw e;
        }
    }
    console.log(`Creadas 20 facturas con existo.`);
}
main()
    .catch((e) => {
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
