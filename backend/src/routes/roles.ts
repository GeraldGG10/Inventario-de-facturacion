import { Router } from 'express';
import { prisma } from '../config/prisma';
import { requireAuth } from '../middleware/requireAuth';
import { requirePermission } from '../middleware/requirePermission';

export const rolesRouter = Router();

rolesRouter.use(requireAuth, requirePermission('usuarios.administrar'));

rolesRouter.get('/', async (_req, res) => {
  const roles = await prisma.rol.findMany({
    select: {
      id: true,
      nombre: true,
      permisos: { select: { permiso: { select: { id: true, nombre: true } } } },
    },
    orderBy: { nombre: 'asc' },
  });

  res.json(
    roles.map((rol) => ({
      id: rol.id,
      nombre: rol.nombre,
      permisos: rol.permisos.map((rp) => rp.permiso),
    })),
  );
});
