import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Generando datos adicionales de pruebas (Alertas, Hoy, etc.)...');

  const admin = await prisma.usuario.findFirst({ where: { email: 'admin@facturacion.local' } });
  const clientes = await prisma.cliente.findMany();
  const productos = await prisma.producto.findMany();

  if (productos.length < 5) return;

  // 1. Alertar stock crítico y agotado
  await prisma.producto.update({
      where: { id: productos[0].id },
      data: { stockActual: 0 }
  });
  await prisma.alertaInventario.create({
      data: {
          productoId: productos[0].id,
          stockActual: 0,
          stockMinimo: productos[0].stockMinimo,
          cantidadSugerida: 50
      }
  });

  await prisma.producto.update({
      where: { id: productos[1].id },
      data: { stockActual: 2 } // Menor al mínimo que es 10
  });
  await prisma.alertaInventario.create({
      data: {
          productoId: productos[1].id,
          stockActual: 2,
          stockMinimo: productos[1].stockMinimo,
          cantidadSugerida: 20
      }
  });

  // 2. Generar facturas para HOY en distintos horarios
  const hoy = new Date();
  
  for (let i = 0; i < 5; i++) {
    const p1 = productos[Math.floor(Math.random() * productos.length)];
    const p2 = productos[Math.floor(Math.random() * productos.length)];
    const date = new Date(hoy);
    date.setHours(9 + i * 2, 30, 0, 0); // 9:30, 11:30, 13:30, 15:30, 17:30

    let subtotal = (p1.precioVenta * 1) + (p2.precioVenta * 1);
    let impuestoMonto = subtotal * 0.18;
    
    await prisma.factura.create({
      data: {
        clienteId: clientes[Math.floor(Math.random() * clientes.length)].id,
        usuarioId: admin?.id,
        fecha: date,
        subtotal,
        impuestoMonto,
        total: subtotal + impuestoMonto,
        metodoPago: 'efectivo',
        detalles: {
          create: [
            { productoId: p1.id, cantidad: 1, precioUnitario: p1.precioVenta, costoUnitario: p1.precioCosto, subtotal: p1.precioVenta },
            { productoId: p2.id, cantidad: 1, precioUnitario: p2.precioVenta, costoUnitario: p2.precioCosto, subtotal: p2.precioVenta },
          ]
        }
      }
    });

    // Movimiento
    await prisma.movimientoInventario.create({
        data: {
            productoId: p1.id, tipo: 'salida', cantidad: 1, stockAnterior: 10, stockNuevo: 9, motivo: 'Venta Hoy', fecha: date
        }
    });
  }

  console.log('Datos adicionales generados correctamente.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
