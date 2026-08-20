import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { requireAuth } from '../middleware/requireAuth';
import { requirePermission } from '../middleware/requirePermission';

export const alertasRouter = Router();

alertasRouter.use(requireAuth, requirePermission('inventario.ver'));

const listQuerySchema = z.object({
  estado: z.enum(['pendiente', 'atendida']).optional().default('pendiente'),
  busqueda: z.string().optional(),
});

alertasRouter.get('/', async (req, res) => {
  const parsed = listQuerySchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const alertas = await prisma.alertaInventario.findMany({
    where: {
      estado: parsed.data.estado,
      ...(parsed.data.busqueda
        ? {
            producto: {
              OR: [
                { nombre: { contains: parsed.data.busqueda, mode: 'insensitive' } },
                { codigo: { contains: parsed.data.busqueda, mode: 'insensitive' } },
              ],
            },
          }
        : {}),
    },
    include: { producto: { include: { categoria: true } } },
    orderBy: { fechaGenerada: 'desc' },
  });

  res.json(
    alertas.map((a) => ({
      id: a.id,
      productoId: a.productoId,
      nombre: a.producto.nombre,
      codigo: a.producto.codigo,
      categoria: a.producto.categoria?.nombre ?? null,
      stockActual: a.stockActual,
      stockMinimo: a.stockMinimo,
      cantidadSugerida: a.cantidadSugerida,
      estadoAlerta: a.stockActual === 0 ? 'agotado' : 'stock_bajo',
      estado: a.estado,
      fechaGenerada: a.fechaGenerada,
      fechaAtendida: a.fechaAtendida,
    })),
  );
});

alertasRouter.post('/:id/atender', requirePermission('inventario.editar'), async (req, res) => {
  const alerta = await prisma.alertaInventario.update({
    where: { id: req.params.id },
    data: { estado: 'atendida', fechaAtendida: new Date() },
  });
  res.json(alerta);
});
