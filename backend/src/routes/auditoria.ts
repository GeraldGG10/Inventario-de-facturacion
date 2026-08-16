import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { requireAuth } from '../middleware/requireAuth';
import { requirePermission } from '../middleware/requirePermission';

export const auditoriaRouter = Router();

auditoriaRouter.use(requireAuth, requirePermission('auditoria.ver'));

const querySchema = z.object({
  entidad: z.string().optional(),
  usuario_id: z.string().uuid().optional(),
  desde: z.string().datetime().optional(),
  hasta: z.string().datetime().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});

auditoriaRouter.get('/', async (req, res) => {
  const parsed = querySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const { entidad, usuario_id, desde, hasta, page, pageSize } = parsed.data;

  const where = {
    ...(entidad ? { entidad } : {}),
    ...(usuario_id ? { usuarioId: usuario_id } : {}),
    ...(desde || hasta
      ? {
          timestamp: {
            ...(desde ? { gte: new Date(desde) } : {}),
            ...(hasta ? { lte: new Date(hasta) } : {}),
          },
        }
      : {}),
  };

  const [total, registros] = await Promise.all([
    prisma.auditoria.count({ where }),
    prisma.auditoria.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { usuario: { select: { id: true, nombre: true, email: true } } },
    }),
  ]);

  res.json({ total, page, pageSize, registros });
});
