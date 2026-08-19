import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { requireAuth } from '../middleware/requireAuth';
import { requirePermission } from '../middleware/requirePermission';
import { registrarAuditoria } from '../services/auditoria';

export const categoriasRouter = Router();

categoriasRouter.use(requireAuth);

categoriasRouter.get('/', requirePermission('inventario.ver'), async (_req, res) => {
  const categorias = await prisma.categoria.findMany({
    include: { _count: { select: { productos: true } } },
    orderBy: { nombre: 'asc' },
  });

  res.json(
    categorias.map((c) => ({
      id: c.id,
      nombre: c.nombre,
      descripcion: c.descripcion,
      activa: c.activa,
      productos: c._count.productos,
      createdAt: c.createdAt,
    })),
  );
});

const categoriaSchema = z.object({
  nombre: z.string().min(1),
  descripcion: z.string().optional().nullable(),
  activa: z.boolean().optional(),
});

categoriasRouter.post('/', requirePermission('inventario.editar'), async (req, res) => {
  const parsed = categoriaSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const existente = await prisma.categoria.findUnique({ where: { nombre: parsed.data.nombre } });
  if (existente) return res.status(409).json({ error: 'Ya existe una categoría con ese nombre' });

  const categoria = await prisma.categoria.create({ data: parsed.data });

  await registrarAuditoria({
    usuarioId: req.auth!.sub,
    accion: 'crear_categoria',
    entidad: 'Categoria',
    entidadId: categoria.id,
    datosDespues: categoria,
  });

  res.status(201).json(categoria);
});

categoriasRouter.patch('/:id', requirePermission('inventario.editar'), async (req, res) => {
  const parsed = categoriaSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const antes = await prisma.categoria.findUnique({ where: { id: req.params.id } });
  if (!antes) return res.status(404).json({ error: 'Categoría no encontrada' });

  const categoria = await prisma.categoria.update({ where: { id: req.params.id }, data: parsed.data });

  await registrarAuditoria({
    usuarioId: req.auth!.sub,
    accion: 'actualizar_categoria',
    entidad: 'Categoria',
    entidadId: categoria.id,
    datosAntes: antes,
    datosDespues: categoria,
  });

  res.json(categoria);
});
