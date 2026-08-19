import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { requireAuth } from '../middleware/requireAuth';
import { requirePermission } from '../middleware/requirePermission';

export const dashboardRouter = Router();

dashboardRouter.use(requireAuth, requirePermission('dashboard.ver'));

const PERIODOS_A_DIAS: Record<string, number> = { diario: 1, semanal: 7, mensual: 30, anual: 365 };

function desdePeriodo(periodo: string): Date {
  const desde = new Date();
  desde.setDate(desde.getDate() - PERIODOS_A_DIAS[periodo]);
  return desde;
}

const ventasQuerySchema = z.object({
  periodo: z.enum(['diario', 'semanal', 'mensual', 'anual']).default('mensual'),
});

dashboardRouter.get('/ventas', async (req, res) => {
  const parsed = ventasQuerySchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const desde = desdePeriodo(parsed.data.periodo);
  const agregado = await prisma.factura.aggregate({
    where: { estado: { not: 'anulada' }, fecha: { gte: desde } },
    _sum: { total: true },
    _count: { _all: true },
  });

  const totalVentas = agregado._sum.total ?? 0;
  const totalFacturas = agregado._count._all;

  res.json({
    periodo: parsed.data.periodo,
    totalVentas: Number(totalVentas.toFixed(2)),
    totalFacturas,
    ticketPromedio: totalFacturas > 0 ? Number((totalVentas / totalFacturas).toFixed(2)) : 0,
  });
});

dashboardRouter.get('/tendencia', async (req, res) => {
  const parsed = ventasQuerySchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const desde = desdePeriodo(parsed.data.periodo);
  const facturas = await prisma.factura.findMany({
    where: { estado: { not: 'anulada' }, fecha: { gte: desde } },
    include: { detalles: true },
    orderBy: { fecha: 'asc' },
  });

  const porDia = new Map<string, { ventas: number; costos: number }>();
  for (const factura of facturas) {
    const clave = factura.fecha.toISOString().slice(0, 10);
    const acumulado = porDia.get(clave) ?? { ventas: 0, costos: 0 };
    acumulado.ventas += factura.total;
    acumulado.costos += factura.detalles.reduce((acc, d) => acc + d.costoUnitario * d.cantidad, 0);
    porDia.set(clave, acumulado);
  }

  const puntos = Array.from(porDia.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([fecha, valores]) => ({
      fecha,
      ventas: Number(valores.ventas.toFixed(2)),
      costos: Number(valores.costos.toFixed(2)),
      ganancias: Number((valores.ventas - valores.costos).toFixed(2)),
    }));

  res.json(puntos);
});

dashboardRouter.get('/margen', async (req, res) => {
  const parsed = ventasQuerySchema.safeParse(req.query);
  const desde = parsed.success ? desdePeriodo(parsed.data.periodo) : undefined;

  const facturas = await prisma.factura.findMany({
    where: { estado: { not: 'anulada' }, ...(desde ? { fecha: { gte: desde } } : {}) },
    include: { detalles: true },
  });

  let ingresos = 0;
  let costos = 0;
  for (const factura of facturas) {
    ingresos += factura.subtotal;
    costos += factura.detalles.reduce((acc, d) => acc + d.costoUnitario * d.cantidad, 0);
  }
  const margen = ingresos - costos;

  res.json({
    ingresos: Number(ingresos.toFixed(2)),
    costos: Number(costos.toFixed(2)),
    margen: Number(margen.toFixed(2)),
    margenPorcentaje: ingresos > 0 ? Number(((margen / ingresos) * 100).toFixed(2)) : 0,
  });
});

const rotacionQuerySchema = z.object({ orden: z.enum(['asc', 'desc']).default('desc'), limite: z.coerce.number().int().min(1).max(100).default(10) });

dashboardRouter.get('/productos/rotacion', async (req, res) => {
  const parsed = rotacionQuerySchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const detalles = await prisma.detalleFactura.findMany({
    where: { factura: { estado: { not: 'anulada' } } },
    include: { producto: { select: { id: true, nombre: true, categoria: { select: { nombre: true } } } } },
  });

  const porProducto = new Map<string, { nombre: string; categoria: string | null; unidades: number; total: number }>();
  for (const detalle of detalles) {
    const actual = porProducto.get(detalle.productoId) ?? {
      nombre: detalle.producto.nombre,
      categoria: detalle.producto.categoria?.nombre ?? null,
      unidades: 0,
      total: 0,
    };
    actual.unidades += detalle.cantidad;
    actual.total += detalle.subtotal;
    porProducto.set(detalle.productoId, actual);
  }

  const ranking = Array.from(porProducto.entries())
    .map(([id, datos]) => ({
      id,
      nombre: datos.nombre,
      categoria: datos.categoria,
      unidadesVendidas: datos.unidades,
      totalGenerado: Number(datos.total.toFixed(2)),
    }))
    .sort((a, b) => (parsed.data.orden === 'asc' ? a.unidadesVendidas - b.unidadesVendidas : b.unidadesVendidas - a.unidadesVendidas))
    .slice(0, parsed.data.limite);

  res.json(ranking);
});

dashboardRouter.get('/clientes/top', async (_req, res) => {
  const clientes = await prisma.cliente.findMany({
    include: { facturas: { where: { estado: { not: 'anulada' } }, select: { total: true } } },
  });

  const ranking = clientes
    .map((cliente) => ({
      id: cliente.id,
      nombre: cliente.nombre,
      totalComprado: Number(cliente.facturas.reduce((acc, f) => acc + f.total, 0).toFixed(2)),
      cantidadCompras: cliente.facturas.length,
    }))
    .filter((c) => c.cantidadCompras > 0)
    .sort((a, b) => b.totalComprado - a.totalComprado)
    .slice(0, 10);

  res.json(ranking);
});

dashboardRouter.get('/reposicion', async (_req, res) => {
  const alertas = await prisma.alertaInventario.findMany({
    where: { estado: 'pendiente' },
    include: { producto: { select: { id: true, nombre: true } } },
    orderBy: { stockActual: 'asc' },
  });

  res.json(
    alertas.map((a) => ({
      id: a.productoId,
      nombre: a.producto.nombre,
      stockActual: a.stockActual,
      stockMinimo: a.stockMinimo,
      cantidadSugerida: a.cantidadSugerida,
      estado: a.stockActual === 0 ? 'agotado' : 'stock_bajo',
    })),
  );
});

dashboardRouter.get('/facturas/recientes', async (_req, res) => {
  const facturas = await prisma.factura.findMany({
    include: { cliente: { select: { nombre: true } } },
    orderBy: { fecha: 'desc' },
    take: 10,
  });
  res.json(
    facturas.map((f) => ({
      id: f.id,
      cliente: f.cliente.nombre,
      fecha: f.fecha,
      total: f.total,
      metodoPago: f.metodoPago,
      estado: f.estado,
    })),
  );
});
