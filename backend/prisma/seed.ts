import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const PERMISOS = [
  { nombre: 'usuarios.administrar', descripcion: 'Crear, editar y desactivar usuarios y roles' },
  { nombre: 'auditoria.ver', descripcion: 'Consultar el historial de auditoría' },
  { nombre: 'dashboard.ver', descripcion: 'Ver el panel de control y sus métricas' },
  { nombre: 'inventario.ver', descripcion: 'Consultar productos e inventario' },
  { nombre: 'inventario.editar', descripcion: 'Crear, editar y ajustar productos e inventario' },
  { nombre: 'proveedores.administrar', descripcion: 'Gestionar proveedores y entradas de mercancía' },
  { nombre: 'factura.crear', descripcion: 'Registrar nuevas ventas/facturas' },
  { nombre: 'factura.anular', descripcion: 'Anular facturas existentes' },
  { nombre: 'clientes.administrar', descripcion: 'Crear y editar clientes' },
];

const ROLES: Record<string, string[]> = {
  administrador: PERMISOS.map((p) => p.nombre),
  cajero: ['factura.crear', 'inventario.ver', 'clientes.administrar', 'dashboard.ver'],
  encargado_inventario: ['inventario.ver', 'inventario.editar', 'proveedores.administrar', 'dashboard.ver'],
};

async function main() {
  for (const permiso of PERMISOS) {
    await prisma.permiso.upsert({
      where: { nombre: permiso.nombre },
      update: {},
      create: permiso,
    });
  }

  for (const [rolNombre, permisos] of Object.entries(ROLES)) {
    const rol = await prisma.rol.upsert({
      where: { nombre: rolNombre },
      update: {},
      create: { nombre: rolNombre },
    });

    for (const permisoNombre of permisos) {
      const permiso = await prisma.permiso.findUniqueOrThrow({ where: { nombre: permisoNombre } });
      await prisma.rolPermiso.upsert({
        where: { rolId_permisoId: { rolId: rol.id, permisoId: permiso.id } },
        update: {},
        create: { rolId: rol.id, permisoId: permiso.id },
      });
    }
  }

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
        email: adminEmail,
        passwordHash,
        rolId: rolAdmin.id,
      },
    });
    console.log(`Usuario admin creado: ${adminEmail} / CambiarEsta123! (cambiar tras el primer login)`);
  }

  console.log('Seed completado.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
