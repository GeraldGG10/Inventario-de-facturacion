import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const PERMISOS = [
  { nombre: 'usuarios.administrar', descripcion: 'Crear, editar y desactivar usuarios y roles' },
  { nombre: 'auditoria.ver', descripcion: 'Consultar el historial de auditoría' },
  { nombre: 'dashboard.ver', descripcion: 'Ver el panel de control y sus métricas' },
  { nombre: 'reportes.ver', descripcion: 'Consultar reportes de ventas, inventario y finanzas' },
  { nombre: 'inventario.ver', descripcion: 'Consultar productos e inventario' },
  { nombre: 'inventario.editar', descripcion: 'Crear, editar y ajustar productos e inventario' },
  { nombre: 'proveedores.administrar', descripcion: 'Gestionar proveedores y entradas de mercancía' },
  { nombre: 'factura.crear', descripcion: 'Registrar nuevas ventas/facturas' },
  { nombre: 'factura.anular', descripcion: 'Anular facturas existentes' },
  { nombre: 'clientes.administrar', descripcion: 'Crear y editar clientes' },
  { nombre: 'configuracion.administrar', descripcion: 'Editar configuración de empresa, facturación e inventario' },
];

const ROLES: Record<string, string[]> = {
  administrador: PERMISOS.map((p) => p.nombre),
  cajero: ['factura.crear', 'inventario.ver', 'clientes.administrar', 'dashboard.ver', 'reportes.ver'],
  almacenista: ['inventario.ver', 'inventario.editar', 'proveedores.administrar', 'dashboard.ver', 'reportes.ver'],
  reportes: ['dashboard.ver', 'reportes.ver'],
};

async function seedPermisosYRoles() {
  for (const permiso of PERMISOS) {
    await prisma.permiso.upsert({ where: { nombre: permiso.nombre }, update: {}, create: permiso });
  }

  for (const [rolNombre, permisos] of Object.entries(ROLES)) {
    const rol = await prisma.rol.upsert({ where: { nombre: rolNombre }, update: {}, create: { nombre: rolNombre } });

    for (const permisoNombre of permisos) {
      const permiso = await prisma.permiso.findUniqueOrThrow({ where: { nombre: permisoNombre } });
      await prisma.rolPermiso.upsert({
        where: { rolId_permisoId: { rolId: rol.id, permisoId: permiso.id } },
        update: {},
        create: { rolId: rol.id, permisoId: permiso.id },
      });
    }
  }
}

async function seedUsuarioAdmin() {
  const adminEmail = 'admin@facturacion.local';
  const rolAdmin = await prisma.rol.findUniqueOrThrow({ where: { nombre: 'administrador' } });
  const existente = await prisma.usuario.findUnique({ where: { email: adminEmail } });

  if (!existente) {
    // TODO: 'CambiarEsta123!' es solo para desarrollo local. En cualquier ambiente
    // que no sea local (staging, producción) esta contraseña debe rotarse de
    // inmediato tras el seed inicial, o reemplazarse por una generada aleatoriamente
    // y entregada de forma segura (nunca hardcodeada en el repo).
    const passwordHash = await bcrypt.hash('CambiarEsta123!', 10);
    await prisma.usuario.create({
      data: {
        nombre: 'Administrador',
        nombreUsuario: 'admin',
        email: adminEmail,
        passwordHash,
        rolId: rolAdmin.id,
      },
    });
    console.log(`Usuario admin creado: ${adminEmail} / CambiarEsta123! (cambiar tras el primer login)`);
  }
}

async function seedConfiguracion() {
  await prisma.configuracionEmpresa.upsert({ where: { id: 'default' }, update: {}, create: { id: 'default' } });
  await prisma.configuracionFacturacion.upsert({ where: { id: 'default' }, update: {}, create: { id: 'default' } });
  await prisma.configuracionInventario.upsert({ where: { id: 'default' }, update: {}, create: { id: 'default' } });
  await prisma.configuracionSistema.upsert({ where: { id: 'default' }, update: {}, create: { id: 'default' } });
}

async function seedCatalogoDemo() {
  const categoriasExistentes = await prisma.categoria.count();
  if (categoriasExistentes > 0) return;

  const categorias = await Promise.all(
    ['Electrónica', 'Mobiliario', 'Suministros', 'Materiales de Construcción'].map((nombre) =>
      prisma.categoria.create({ data: { nombre } }),
    ),
  );

  const ubicacion = await prisma.ubicacion.create({ data: { nombre: 'Almacén Principal' } });

  const proveedor = await prisma.proveedor.create({
    data: {
      nombre: 'Distribuidora Los Andes S.A.',
      rnc: '1-01-85934-2',
      contactoNombre: 'Jane Doe',
      telefono: '809-555-0192',
      correo: 'contacto@losandes.example',
      categoria: 'Suministros de Oficina',
      condicionesPago: 'contado',
    },
  });

  await prisma.producto.createMany({
    data: [
      {
        codigo: 'PRD-001',
        nombre: 'Laptop Pro X15',
        categoriaId: categorias[0].id,
        proveedorId: proveedor.id,
        ubicacionId: ubicacion.id,
        precioCosto: 1100,
        precioVenta: 1499,
        stockActual: 0,
        stockMinimo: 5,
      },
      {
        codigo: 'PRD-002',
        nombre: 'Cemento Titán Gris 42.5kg',
        categoriaId: categorias[3].id,
        proveedorId: proveedor.id,
        ubicacionId: ubicacion.id,
        unidadMedida: 'saco',
        precioCosto: 280,
        precioVenta: 340,
        stockActual: 120,
        stockMinimo: 30,
      },
      {
        codigo: 'PRD-003',
        nombre: 'Varilla Corrugada 3/8"x20\'',
        categoriaId: categorias[3].id,
        proveedorId: proveedor.id,
        ubicacionId: ubicacion.id,
        precioCosto: 210,
        precioVenta: 265,
        stockActual: 8,
        stockMinimo: 15,
      },
    ],
  });

  await prisma.cliente.create({
    data: {
      nombre: 'Construmart Dominicana S.A.',
      documento: '1-01-85934-2',
      telefono: '809-555-0192',
      limiteCredito: 500000,
    },
  });
}

async function main() {
  await seedPermisosYRoles();
  await seedUsuarioAdmin();
  await seedConfiguracion();
  await seedCatalogoDemo();
  console.log('Seed completado.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
