import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { requireAuth } from '../middleware/requireAuth';
import { requirePermission } from '../middleware/requirePermission';

export const ubicacionesRouter = Router();

ubicacionesRouter.use(requireAuth);

ubicacionesRouter.get('/', requirePermission('inventario.ver'), async (_req, res) => {
  const ubicaciones = await prisma.ubicacion.findMany({ orderBy: { nombre: 'asc' } });
  res.json(ubicaciones);
});

const ubicacionSchema = z.object({ nombre: z.string().min(1), activa: z.boolean().optional() });

ubicacionesRouter.post('/', requirePermission('inventario.editar'), async (req, res) => {
  const parsed = ubicacionSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const existente = await prisma.ubicacion.findUnique({ where: { nombre: parsed.data.nombre } });
  if (existente) return res.status(409).json({ error: 'Ya existe una ubicación con ese nombre' });

  const ubicacion = await prisma.ubicacion.create({ data: parsed.data });
  res.status(201).json(ubicacion);
});

ubicacionesRouter.patch('/:id', requirePermission('inventario.editar'), async (req, res) => {
  const parsed = ubicacionSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const ubicacion = await prisma.ubicacion.update({ where: { id: req.params.id }, data: parsed.data });
  res.json(ubicacion);
});
