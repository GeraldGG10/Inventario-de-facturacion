import { Router } from 'express';
import { z } from 'zod';
import PDFDocument from 'pdfkit';
import { prisma } from '../config/prisma';
import { requireAuth } from '../middleware/requireAuth';
import { requirePermission } from '../middleware/requirePermission';

export const reportesRouter = Router();

reportesRouter.use(requireAuth, requirePermission('reportes.ver'));

const rangoSchema = z.object({
  periodo: z.enum(['hoy', 'semana', 'mes', 'anio', 'personalizado']).default('mes'),
  desde: z.string().datetime().optional(),
  hasta: z.string().datetime().optional(),
});

const PERIODOS_A_DIAS: Record<string, number> = { hoy: 1, semana: 7, mes: 30, anio: 365 };

function resolverRango(data: z.infer<typeof rangoSchema>): { desde: Date; hasta: Date } {
  if (data.periodo === 'personalizado' && data.desde && data.hasta) {
    return { desde: new Date(data.desde), hasta: new Date(data.hasta) };
  }
  const dias = PERIODOS_A_DIAS[data.periodo] ?? 30;
  return { desde: new Date(Date.now() - dias * 86_400_000), hasta: new Date() };
}

reportesRouter.get('/ventas', async (req, res) => {
  const parsed = rangoSchema.extend({
    agruparPor: z.enum(['producto', 'categoria', 'vendedor', 'metodoPago', 'fecha']).default('fecha'),
  }).safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { desde, hasta } = resolverRango(parsed.data);
  const facturas = await prisma.factura.findMany({
    where: { estado: { not: 'anulada' }, fecha: { gte: desde, lte: hasta } },
    include: {
      usuario: { select: { id: true, nombre: true } },
      detalles: { include: { producto: { select: { nombre: true, categoria: { select: { nombre: true } } } } } },
    },
  });

  const grupos = new Map<string, { etiqueta: string; ventas: number; unidades: number; facturas: number }>();

  function acumular(clave: string, etiqueta: string, ventas: number, unidades: number) {
    const actual = grupos.get(clave) ?? { etiqueta, ventas: 0, unidades: 0, facturas: 0 };
    actual.ventas += ventas;
    actual.unidades += unidades;
    grupos.set(clave, actual);
  }

  for (const factura of facturas) {
    if (parsed.data.agruparPor === 'metodoPago') {
      acumular(factura.metodoPago, factura.metodoPago, factura.total, 0);
    } else if (parsed.data.agruparPor === 'vendedor') {
      const etiqueta = factura.usuario?.nombre ?? 'Sin asignar';
      acumular(factura.usuarioId ?? 'sin_asignar', etiqueta, factura.total, 0);
    } else if (parsed.data.agruparPor === 'fecha') {
      const clave = factura.fecha.toISOString().slice(0, 10);
      acumular(clave, clave, factura.total, 0);
    } else {
      for (const detalle of factura.detalles) {
        const clave = parsed.data.agruparPor === 'categoria' ? detalle.producto.categoria?.nombre ?? 'Sin categoría' : detalle.producto.nombre;
        acumular(clave, clave, detalle.subtotal, detalle.cantidad);
      }
    }
  }

  res.json(
    Array.from(grupos.values())
      .map((g) => ({ ...g, ventas: Number(g.ventas.toFixed(2)) }))
      .sort((a, b) => b.ventas - a.ventas),
  );
});

reportesRouter.get('/inventario', async (_req, res) => {
  const productos = await prisma.producto.findMany({
    where: { activo: true },
    include: { movimientos: { orderBy: { fecha: 'desc' }, take: 1 }, categoria: true },
  });

  const detalles = await prisma.detalleFactura.groupBy({
    by: ['productoId'],
    _sum: { cantidad: true },
    where: { factura: { estado: { not: 'anulada' } } },
  });
  const unidadesVendidas = new Map(detalles.map((d) => [d.productoId, d._sum.cantidad ?? 0]));

  const inventarioActual = productos.map((p) => ({
    id: p.id,
    codigo: p.codigo,
    nombre: p.nombre,
    categoria: p.categoria?.nombre ?? null,
    stockActual: p.stockActual,
    stockMinimo: p.stockMinimo,
    unidadesVendidas: unidadesVendidas.get(p.id) ?? 0,
    ultimoMovimiento: p.movimientos[0]?.fecha ?? null,
  }));

  const agotados = inventarioActual.filter((p) => p.stockActual === 0);
  const stockBajo = inventarioActual.filter((p) => p.stockActual > 0 && p.stockActual <= p.stockMinimo);
  const sinMovimiento = inventarioActual.filter((p) => !p.ultimoMovimiento);
  const masVendidos = [...inventarioActual].sort((a, b) => b.unidadesVendidas - a.unidadesVendidas).slice(0, 10);
  const menosVendidos = [...inventarioActual].sort((a, b) => a.unidadesVendidas - b.unidadesVendidas).slice(0, 10);

  res.json({ inventarioActual, agotados, stockBajo, sinMovimiento, masVendidos, menosVendidos });
});

reportesRouter.get('/financiero', async (req, res) => {
  const parsed = rangoSchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { desde, hasta } = resolverRango(parsed.data);

  const facturas = await prisma.factura.findMany({
    where: { estado: { not: 'anulada' }, fecha: { gte: desde, lte: hasta } },
    include: { detalles: true },
  });

  let ingresos = 0;
  let costos = 0;
  let descuentos = 0;
  for (const factura of facturas) {
    ingresos += factura.subtotal;
    descuentos += factura.descuentoMonto;
    costos += factura.detalles.reduce((acc, d) => acc + d.costoUnitario * d.cantidad, 0);
  }
  const ganancias = ingresos - costos;

  res.json({
    periodo: parsed.data.periodo,
    ingresos: Number(ingresos.toFixed(2)),
    costos: Number(costos.toFixed(2)),
    ganancias: Number(ganancias.toFixed(2)),
    margen: ingresos > 0 ? Number(((ganancias / ingresos) * 100).toFixed(2)) : 0,
    descuentos: Number(descuentos.toFixed(2)),
  });
});

reportesRouter.get('/exportar', async (req, res) => {
  const formato = req.query.formato === 'csv' ? 'csv' : 'pdf';
  const parsed = rangoSchema.safeParse(req.query);
  const { desde, hasta } = resolverRango(parsed.success ? parsed.data : { periodo: 'mes' });

  const facturas = await prisma.factura.findMany({
    where: { estado: { not: 'anulada' }, fecha: { gte: desde, lte: hasta } },
    include: { cliente: true },
    orderBy: { fecha: 'asc' },
  });

  if (formato === 'csv') {
    const filas = ['numero,fecha,cliente,metodoPago,total'];
    for (const f of facturas) {
      filas.push(`${f.id},${f.fecha.toISOString()},"${f.cliente.nombre}",${f.metodoPago},${f.total.toFixed(2)}`);
    }
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="reporte-ventas.csv"');
    return res.send(filas.join('\n'));
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'inline; filename="reporte-ventas.pdf"');
  const doc = new PDFDocument({ margin: 50 });
  doc.pipe(res);
  doc.fontSize(16).text('Reporte de ventas');
  doc.fontSize(9).text(`Del ${desde.toLocaleDateString('es-DO')} al ${hasta.toLocaleDateString('es-DO')}`);
  doc.moveDown();
  const total = facturas.reduce((acc, f) => acc + f.total, 0);
  for (const f of facturas) {
    doc.fontSize(9).text(`#${f.id}  ${f.fecha.toLocaleDateString('es-DO')}  ${f.cliente.nombre}  ${f.metodoPago}  ${f.total.toFixed(2)}`);
  }
  doc.moveDown();
  doc.fontSize(11).text(`Total: ${total.toFixed(2)}`);
  doc.end();
});
