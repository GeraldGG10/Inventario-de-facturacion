import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { requireAuth } from '../middleware/requireAuth';
import { requirePermission } from '../middleware/requirePermission';
import { registrarAuditoria } from '../services/auditoria';
import { registrarMovimiento, TipoMovimiento } from '../services/inventario';

export const movimientosRouter = Router();

movimientosRouter.use(requireAuth, requirePermission('inventario.ver'));

const PERIODOS_A_DIAS: Record<string, number> = { hoy: 1, semana: 7, mes: 30, anio: 365 };

const listQuerySchema = z.object({
  tipo: z.enum(['entrada', 'salida', 'ajuste', 'devolucion']).optional(),
  periodo: z.enum(['hoy', 'semana', 'mes', 'anio']).optional(),
  usuarioId: z.string().optional(),
  busqueda: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});

movimientosRouter.get('/', async (req, res) => {
  const parsed = listQuerySchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { tipo, periodo, usuarioId, busqueda, page, pageSize } = parsed.data;

  const where: any = {
    ...(tipo ? { tipo } : {}),
    ...(usuarioId ? { usuarioId } : {}),
    ...(periodo ? { fecha: { gte: new Date(Date.now() - PERIODOS_A_DIAS[periodo] * 86_400_000) } } : {}),
    ...(busqueda ? { producto: { nombre: { contains: busqueda } } } : {}),
  };

  const [total, movimientos, resumen] = await Promise.all([
    prisma.movimientoInventario.count({ where }),
    prisma.movimientoInventario.findMany({
      where,
      include: { producto: { select: { id: true, codigo: true, nombre: true } }, usuario: { select: { id: true, nombre: true } } },
      orderBy: { fecha: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.movimientoInventario.groupBy({
      by: ['tipo'],
      where: periodo ? { fecha: { gte: new Date(Date.now() - PERIODOS_A_DIAS[periodo] * 86_400_000) } } : undefined,
      _count: { _all: true },
    }),
  ]);

  res.json({
    total,
    page,
    pageSize,
    movimientos,
    resumen: Object.fromEntries(resumen.map((r) => [r.tipo, r._count._all])),
  });
});

const crearMovimientoSchema = z.object({
  productoId: z.string().min(1),
  tipo: z.enum(['entrada', 'salida', 'ajuste']),
  cantidad: z.number().int().refine((v) => v !== 0, 'La cantidad no puede ser 0'),
  motivo: z.string().optional().nullable(),
  referencia: z.string().optional().nullable(),
});

movimientosRouter.post('/', requirePermission('inventario.editar'), async (req, res) => {
  const parsed = crearMovimientoSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  try {
    const movimiento = await registrarMovimiento({
      ...parsed.data,
      tipo: parsed.data.tipo as TipoMovimiento,
      usuarioId: req.auth!.sub,
    });

    await registrarAuditoria({
      usuarioId: req.auth!.sub,
      accion: `movimiento_${parsed.data.tipo}`,
      entidad: 'Producto',
      entidadId: parsed.data.productoId,
      datosDespues: movimiento,
    });

    res.status(201).json(movimiento);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});
