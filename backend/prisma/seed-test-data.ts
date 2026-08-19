import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando generacion de datos de prueba...');

  // 1. Crear Categorías
  const categorias = [];
  for (let i = 1; i <= 5; i++) {
    const cat = await prisma.categoria.create({
      data: {
        nombre: `Categoría Prueba ${i}`,
        descripcion: `Descripción de categoría ${i}`,
      },
    });
    categorias.push(cat);
  }
  console.log(`Creadas ${categorias.length} categorías.`);

  // 2. Crear Ubicaciones
  const ubicaciones = [];
  for (let i = 1; i <= 2; i++) {
    const ubi = await prisma.ubicacion.create({
      data: {
        nombre: `Estante ${i}`,
      },
    });
    ubicaciones.push(ubi);
  }
  console.log(`Creadas ${ubicaciones.length} ubicaciones.`);

  // 3. Crear Proveedores
  const proveedores = [];
  for (let i = 1; i <= 5; i++) {
    const prov = await prisma.proveedor.create({
      data: {
        nombre: `Proveedor Prueba ${i}`,
        rnc: `10000000${i}`,
        telefono: `809-555-000${i}`,
        correo: `prov${i}@prueba.com`,
      },
    });
    proveedores.push(prov);
  }
  console.log(`Creados ${proveedores.length} proveedores.`);

  // 4. Crear 20 Productos
  const productos = [];
  for (let i = 1; i <= 20; i++) {
    const costo = Math.floor(Math.random() * 500) + 100;
    const prod = await prisma.producto.create({
      data: {
        codigo: `PROD-${i.toString().padStart(4, '0')}`,
        codigoBarras: `74600000000${i.toString().padStart(2, '0')}`,
        nombre: `Producto de Prueba ${i}`,
        descripcion: `Este es el producto de prueba número ${i}`,
        categoriaId: categorias[i % categorias.length].id,
        proveedorId: proveedores[i % proveedores.length].id,
        ubicacionId: ubicaciones[i % ubicaciones.length].id,
        precioCosto: costo,
        precioVenta: costo * 1.5,
        stockActual: Math.floor(Math.random() * 100) + 20,
        stockMinimo: 10,
      },
    });
    productos.push(prod);
  }
  console.log(`Creados ${productos.length} productos.`);

  // 5. Crear 20 Clientes
  const clientes = [];
  for (let i = 1; i <= 20; i++) {
    const cli = await prisma.cliente.create({
      data: {
        nombre: `Cliente Prueba ${i}`,
        documento: `402-0000000-${i}`,
        telefono: `829-555-00${i.toString().padStart(2, '0')}`,
        correo: `cliente${i}@prueba.com`,
        direccion: `Calle Falsa ${i}, Ciudad`,
      },
    });
    clientes.push(cli);
  }
  console.log(`Creados ${clientes.length} clientes.`);

  // 6. Crear 20 Facturas
  const admin = await prisma.usuario.findFirst({ where: { email: 'admin@facturacion.local' } });
  
  for (let i = 1; i <= 20; i++) {
    const cliente = clientes[i - 1];
    const producto1 = productos[Math.floor(Math.random() * 10)];
    const producto2 = productos[Math.floor(Math.random() * 10) + 10];
    
    let subtotal = (producto1.precioVenta * 2) + (producto2.precioVenta * 1);
    let impuestoMonto = subtotal * 0.18;
    let total = subtotal + impuestoMonto;

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
  console.log(`Creadas 20 facturas.`);

  console.log('Generación de datos finalizada exitosamente.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
