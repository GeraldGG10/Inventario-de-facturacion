// Endpoints del Módulo 3 (Dashboard). Construidos sobre datos mock que siguen
// el contrato propuesto en docs/SCHEMA_DASHBOARD.md — NO consultan la base de
// datos real todavía. Cuando Inventario/Facturación confirmen su schema, solo
// hay que reemplazar las lecturas de src/mocks/dashboardData.ts por queries
// Prisma equivalentes; la forma de las respuestas no debería cambiar.
import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/requireAuth';
import { requirePermission } from '../middleware/requirePermission';
import {
  clientesMock,
  detalleFacturaMock,
  facturasMock,
  productosMock,
  DetalleFacturaMock,
  FacturaMock,
} from '../mocks/dashboardData';

export const dashboardRouter = Router();

dashboardRouter.use(requireAuth, requirePermission('dashboard.ver'));

function facturasVigentes(): FacturaMock[] {
  return facturasMock.filter((f) => !f.anulada);
}

function detallesDe(facturaId: string): DetalleFacturaMock[] {
  return detalleFacturaMock.filter((d) => d.facturaId === facturaId);
}

const PERIODOS_A_DIAS: Record<string, number> = {
  diario: 1,
  semanal: 7,
  mensual: 30,
  anual: 365,
};

const ventasQuerySchema = z.object({
  periodo: z.enum(['diario', 'semanal', 'mensual', 'anual']).default('mensual'),
});

dashboardRouter.get('/ventas', (req, res) => {
  const parsed = ventasQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const dias = PERIODOS_A_DIAS[parsed.data.periodo];
  const desde = new Date();
  desde.setDate(desde.getDate() - dias);

  const facturasPeriodo = facturasVigentes().filter((f) => new Date(f.fecha) >= desde);
  const totalVentas = facturasPeriodo.reduce((acc, f) => acc + f.total, 0);
  const totalFacturas = facturasPeriodo.length;

  res.json({
    periodo: parsed.data.periodo,
    totalVentas: Number(totalVentas.toFixed(2)),
    totalFacturas,
    ticketPromedio: totalFacturas > 0 ? Number((totalVentas / totalFacturas).toFixed(2)) : 0,
  });
});

dashboardRouter.get('/margen', (_req, res) => {
  let ingresos = 0;
  let costos = 0;

  for (const factura of facturasVigentes()) {
    ingresos += factura.subtotal;
    for (const detalle of detallesDe(factura.id)) {
      costos += detalle.costoUnitario * detalle.cantidad;
    }
  }

  const margen = ingresos - costos;
  const margenPorcentaje = ingresos > 0 ? (margen / ingresos) * 100 : 0;

  res.json({
    ingresos: Number(ingresos.toFixed(2)),
    costos: Number(costos.toFixed(2)),
    margen: Number(margen.toFixed(2)),
    margenPorcentaje: Number(margenPorcentaje.toFixed(2)),
  });
});

const rotacionQuerySchema = z.object({
  orden: z.enum(['asc', 'desc']).default('desc'),
});

dashboardRouter.get('/productos/rotacion', (req, res) => {
  const parsed = rotacionQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const unidadesPorProducto = new Map<string, number>();
  const totalPorProducto = new Map<string, number>();

  for (const factura of facturasVigentes()) {
    for (const detalle of detallesDe(factura.id)) {
      unidadesPorProducto.set(detalle.productoId, (unidadesPorProducto.get(detalle.productoId) ?? 0) + detalle.cantidad);
      totalPorProducto.set(
        detalle.productoId,
        (totalPorProducto.get(detalle.productoId) ?? 0) + detalle.cantidad * detalle.precioUnitario,
      );
    }
  }

  const ranking = productosMock
    .map((producto) => ({
      id: producto.id,
      nombre: producto.nombre,
      unidadesVendidas: unidadesPorProducto.get(producto.id) ?? 0,
      totalGenerado: Number((totalPorProducto.get(producto.id) ?? 0).toFixed(2)),
    }))
    .sort((a, b) => (parsed.data.orden === 'asc' ? a.unidadesVendidas - b.unidadesVendidas : b.unidadesVendidas - a.unidadesVendidas));

  res.json(ranking);
});

dashboardRouter.get('/clientes/top', (_req, res) => {
  const totalPorCliente = new Map<string, { volumen: number; facturas: number }>();

  for (const factura of facturasVigentes()) {
    const actual = totalPorCliente.get(factura.clienteId) ?? { volumen: 0, facturas: 0 };
    actual.volumen += factura.total;
    actual.facturas += 1;
    totalPorCliente.set(factura.clienteId, actual);
  }

  const ranking = clientesMock
    .map((cliente) => {
      const datos = totalPorCliente.get(cliente.id) ?? { volumen: 0, facturas: 0 };
      return {
        id: cliente.id,
        nombre: cliente.nombre,
        totalComprado: Number(datos.volumen.toFixed(2)),
        cantidadCompras: datos.facturas,
      };
    })
    .filter((cliente) => cliente.cantidadCompras > 0)
    .sort((a, b) => b.totalComprado - a.totalComprado);

  res.json(ranking);
});

dashboardRouter.get('/reposicion', (_req, res) => {
  const alertas = productosMock
    .filter((producto) => producto.stockActual <= producto.stockMinimo)
    .map((producto) => ({
      id: producto.id,
      nombre: producto.nombre,
      stockActual: producto.stockActual,
      stockMinimo: producto.stockMinimo,
      cantidadSugerida: Math.max(producto.stockMinimo * 2 - producto.stockActual, producto.stockMinimo),
      estado: producto.stockActual === 0 ? 'agotado' : 'stock_bajo',
    }))
    .sort((a, b) => a.stockActual - b.stockActual);

  res.json(alertas);
});
