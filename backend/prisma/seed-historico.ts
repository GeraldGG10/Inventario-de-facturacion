import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Generando data histórica para gráficas...');

  const clientes = await prisma.cliente.findMany();
  const productos = await prisma.producto.findMany();
  const admin = await prisma.usuario.findFirst({ where: { email: 'admin@facturacion.local' } });

  if (clientes.length === 0 || productos.length === 0) {
    console.log('Faltan clientes o productos. Saliendo.');
    return;
  }

  // Eliminar facturas previas
  await prisma.detalleFactura.deleteMany();
  await prisma.factura.deleteMany();

  // Generar 60 facturas distribuidas en los últimos 30 días
  for (let i = 1; i <= 60; i++) {
    const cliente = clientes[Math.floor(Math.random() * clientes.length)];
    const producto1 = productos[Math.floor(Math.random() * ((productos.length / 2) - 1))];
    const producto2 = productos[Math.floor(Math.random() * ((productos.length / 2) - 1)) + Math.floor(productos.length / 2)];
    
    let subtotal = (producto1.precioVenta * 2) + (producto2.precioVenta * 1);
    let impuestoMonto = subtotal * 0.18;
    let total = subtotal + impuestoMonto;

    // Fecha aleatoria entre hoy y hace 30 días
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - Math.floor(Math.random() * 30));
    fecha.setHours(Math.floor(Math.random() * 8) + 9); // de 9am a 5pm

    try {
      await prisma.factura.create({
        data: {
          clienteId: cliente.id,
          usuarioId: admin?.id,
          fecha,
          subtotal,
          impuestoMonto,
          total,
          metodoPago: ['efectivo', 'tarjeta', 'transferencia'][Math.floor(Math.random() * 3)],
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
    } catch (e) {
      console.error(`Error creando factura historica ${i}:`, e);
      throw e;
    }
  }
  
  // Generar algunas devoluciones para pruebas
  const facturasRecientes = await prisma.factura.findMany({ take: 3 });
  for (let f of facturasRecientes) {
     const detalles = await prisma.detalleFactura.findMany({ where: { facturaId: f.id }});
     if (detalles.length > 0) {
        await prisma.devolucion.create({
           data: {
              facturaId: f.id,
              usuarioId: admin?.id,
              motivo: 'Producto defectuoso de prueba',
              fecha: new Date(),
              detalles: {
                  create: [
                      {
                         productoId: detalles[0].productoId,
                         cantidadDevuelta: 1
                      }
                  ]
              }
           }
        });
     }
  }

  // Generar movimientos de inventario y entradas para que se vean en las pruebas
  const proveedores = await prisma.proveedor.findMany();
  if (proveedores.length > 0) {
      const entrada = await prisma.entradaMercancia.create({
          data: {
              proveedorId: proveedores[0].id,
              usuarioId: admin?.id,
              observaciones: 'Entrada inicial de prueba',
              fecha: new Date(),
              detalles: {
                  create: [
                      { productoId: productos[0].id, cantidad: 50, costoUnitario: productos[0].precioCosto, subtotal: 50 * productos[0].precioCosto },
                      { productoId: productos[1].id, cantidad: 30, costoUnitario: productos[1].precioCosto, subtotal: 30 * productos[1].precioCosto }
                  ]
              }
          }
      });
  }

  console.log('Datos históricos insertados correctamente. Gráficas deben funcionar.');
}

main()
  .catch((e) => {
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
