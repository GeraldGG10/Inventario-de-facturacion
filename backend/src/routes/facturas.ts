import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { requireAuth } from '../middleware/requireAuth';
import { requirePermission } from '../middleware/requirePermission';
import { registrarAuditoria } from '../services/auditoria';
import { registrarMovimientoTx } from '../services/inventario';
import { formatearNumeroFactura, generarPdfFactura, obtenerFacturaCompleta } from '../services/facturacion';

export const facturasRouter = Router();

facturasRouter.use(requireAuth);

const lineaSchema = z.object({
  productoId: z.string().min(1),
  cantidad: z.number().int().positive(),
  precioUnitario: z.number().nonnegative().optional(),
  descuentoPorcentaje: z.number().min(0).max(100).optional(),
});

const crearFacturaSchema = z.object({
  clienteId: z.string().min(1),
  metodoPago: z.enum(['efectivo', 'tarjeta', 'transferencia', 'mixto']),
  descuentoPorcentaje: z.number().min(0).max(100).optional(),
  lineas: z.array(lineaSchema).min(1),
  referenciaTransferencia: z.string().optional(),
  montoEfectivo: z.number().nonnegative().optional(),
  montoTransferencia: z.number().nonnegative().optional(),
});

async function serializarFactura(id: number) {
  const factura = await obtenerFacturaCompleta(id);
  if (!factura) return null;
  const config = await prisma.configuracionFacturacion.findUnique({ where: { id: 'default' } });
  return { ...factura, numero: formatearNumeroFactura(config?.serieFactura ?? 'FAC-', factura.id) };
}

facturasRouter.post('/', requirePermission('factura.crear'), async (req, res) => {
  const parsed = crearFacturaSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { clienteId, metodoPago, descuentoPorcentaje, lineas } = parsed.data;

  try {
    const facturaId = await prisma.$transaction(async (tx) => {
      const detallesData = [];
      let subtotal = 0;

      for (const linea of lineas) {
        const producto = await tx.producto.findUniqueOrThrow({ where: { id: linea.productoId } });
        const precioUnitario = linea.precioUnitario ?? producto.precioVenta;
        const descuentoLinea = linea.descuentoPorcentaje ?? 0;
        const subtotalLinea = precioUnitario * linea.cantidad * (1 - descuentoLinea / 100);
        subtotal += subtotalLinea;
        detallesData.push({
          productoId: producto.id,
          cantidad: linea.cantidad,
          precioUnitario,
          costoUnitario: producto.precioCosto,
          descuentoPorcentaje: descuentoLinea,
          subtotal: subtotalLinea,
        });
      }

      const config = await tx.configuracionFacturacion.findUnique({ where: { id: 'default' } });
      const impuestoPorcentaje = config?.impuestoPorcentaje ?? 18;
      const descuentoGeneral = descuentoPorcentaje ?? 0;
      const descuentoMonto = subtotal * (descuentoGeneral / 100);
      const baseImponible = subtotal - descuentoMonto;
      const impuestoMonto = baseImponible * (impuestoPorcentaje / 100);
      const total = baseImponible + impuestoMonto;

      const factura = await tx.factura.create({
        data: {
          clienteId,
          usuarioId: req.auth!.sub,
          metodoPago,
          referenciaTransferencia: parsed.data.referenciaTransferencia,
          montoEfectivo: parsed.data.montoEfectivo,
          montoTransferencia: parsed.data.montoTransferencia,
          subtotal,
          descuentoPorcentaje: descuentoGeneral,
          descuentoMonto,
          impuestoPorcentaje,
          impuestoMonto,
          total,
          detalles: { create: detallesData },
        },
      });

      for (const linea of lineas) {
        await registrarMovimientoTx(tx, {
          productoId: linea.productoId,
          tipo: 'salida',
          cantidad: linea.cantidad,
          motivo: 'Venta',
          referencia: String(factura.id),
          usuarioId: req.auth!.sub,
        });
      }

      return factura.id;
    });

    const factura = await serializarFactura(facturaId);

    await registrarAuditoria({
      usuarioId: req.auth!.sub,
      accion: 'crear_factura',
      entidad: 'Factura',
      entidadId: String(facturaId),
      datosDespues: factura,
    });

    res.status(201).json(factura);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

const listQuerySchema = z.object({
  clienteId: z.string().optional(),
  estado: z.enum(['emitida', 'anulada']).optional(),
  metodoPago: z.enum(['efectivo', 'tarjeta', 'transferencia', 'mixto']).optional(),
  desde: z.string().datetime().optional(),
  hasta: z.string().datetime().optional(),
  numero: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});

facturasRouter.get('/', requirePermission('factura.crear'), async (req, res) => {
  const parsed = listQuerySchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { clienteId, estado, metodoPago, desde, hasta, numero, page, pageSize } = parsed.data;

  const where: any = {
    ...(clienteId ? { clienteId } : {}),
    ...(estado ? { estado } : {}),
    ...(metodoPago ? { metodoPago } : {}),
    ...(desde || hasta ? { fecha: { ...(desde ? { gte: new Date(desde) } : {}), ...(hasta ? { lte: new Date(hasta) } : {}) } } : {}),
    ...(numero ? { id: Number(numero.replace(/\D/g, '')) || undefined } : {}),
  };

  const config = await prisma.configuracionFacturacion.findUnique({ where: { id: 'default' } });
  const serie = config?.serieFactura ?? 'FAC-';

  const [total, facturas] = await Promise.all([
    prisma.factura.count({ where }),
    prisma.factura.findMany({
      where,
      include: { cliente: { select: { id: true, nombre: true } }, usuario: { select: { id: true, nombre: true } } },
      orderBy: { fecha: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  res.json({
    total,
    page,
    pageSize,
    facturas: facturas.map((f) => ({ ...f, numero: formatearNumeroFactura(serie, f.id) })),
  });
});

facturasRouter.get('/:id/pdf', requirePermission('factura.crear'), async (req, res) => {
  const factura = await obtenerFacturaCompleta(Number(req.params.id));
  if (!factura) return res.status(404).json({ error: 'Factura no encontrada' });
  await generarPdfFactura(factura, res);
});

facturasRouter.get('/:id', requirePermission('factura.crear'), async (req, res) => {
  const factura = await serializarFactura(Number(req.params.id));
  if (!factura) return res.status(404).json({ error: 'Factura no encontrada' });
  res.json(factura);
});

const anularSchema = z.object({ motivo: z.string().min(1) });

facturasRouter.post('/:id/anular', requirePermission('factura.anular'), async (req, res) => {
  const parsed = anularSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const facturaId = Number(req.params.id);

  try {
    await prisma.$transaction(async (tx) => {
      const factura = await tx.factura.findUnique({
        where: { id: facturaId },
        include: { detalles: true, devoluciones: { include: { detalles: true } } },
      });
      if (!factura) throw new Error('Factura no encontrada');
      if (factura.estado === 'anulada') throw new Error('La factura ya está anulada');

      await tx.factura.update({
        where: { id: facturaId },
        data: { estado: 'anulada', motivoAnulacion: parsed.data.motivo, anuladaEn: new Date(), anuladaPorId: req.auth!.sub },
      });

      // Si ya hubo devoluciones parciales sobre esta factura, esas unidades
      // regresaron al stock cuando se registró la devolución: al anular solo
      // se revierte lo que seguía vendido (cantidad original - ya devuelto),
      // para no acreditar el mismo stock dos veces.
      const devueltoPorProducto = new Map<string, number>();
      for (const devolucion of factura.devoluciones) {
        for (const detalleDevolucion of devolucion.detalles) {
          devueltoPorProducto.set(
            detalleDevolucion.productoId,
            (devueltoPorProducto.get(detalleDevolucion.productoId) ?? 0) + detalleDevolucion.cantidadDevuelta,
          );
        }
      }

      for (const detalle of factura.detalles) {
        const yaDevuelto = devueltoPorProducto.get(detalle.productoId) ?? 0;
        const cantidadARevertir = detalle.cantidad - yaDevuelto;
        if (cantidadARevertir <= 0) continue;

        await registrarMovimientoTx(tx, {
          productoId: detalle.productoId,
          tipo: 'entrada',
          cantidad: cantidadARevertir,
          motivo: 'Reversión por anulación de factura',
          referencia: String(facturaId),
          usuarioId: req.auth!.sub,
        });
      }
    });

    const factura = await serializarFactura(facturaId);

    await registrarAuditoria({
      usuarioId: req.auth!.sub,
      accion: 'anular_factura',
      entidad: 'Factura',
      entidadId: String(facturaId),
      datosDespues: factura,
    });

    res.json(factura);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

const devolucionSchema = z.object({
  motivo: z.string().min(1),
  items: z.array(z.object({ productoId: z.string().min(1), cantidad: z.number().int().positive() })).min(1),
});

facturasRouter.post('/:id/devoluciones', requirePermission('factura.anular'), async (req, res) => {
  const parsed = devolucionSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const facturaId = Number(req.params.id);

  try {
    const devolucion = await prisma.$transaction(async (tx) => {
      const factura = await tx.factura.findUnique({
        where: { id: facturaId },
        include: { detalles: true, devoluciones: { include: { detalles: true } } },
      });
      if (!factura) throw new Error('Factura no encontrada');
      if (factura.estado === 'anulada') throw new Error('No se puede registrar una devolución sobre una factura anulada');

      const yaDevueltoPorProducto = new Map<string, number>();
      for (const devolucionPrevia of factura.devoluciones) {
        for (const detalleDevolucion of devolucionPrevia.detalles) {
          yaDevueltoPorProducto.set(
            detalleDevolucion.productoId,
            (yaDevueltoPorProducto.get(detalleDevolucion.productoId) ?? 0) + detalleDevolucion.cantidadDevuelta,
          );
        }
      }

      for (const item of parsed.data.items) {
        const detalle = factura.detalles.find((d) => d.productoId === item.productoId);
        const yaDevuelto = yaDevueltoPorProducto.get(item.productoId) ?? 0;
        if (!detalle || item.cantidad + yaDevuelto > detalle.cantidad) {
          throw new Error('La cantidad a devolver excede lo comprado (o lo que queda por devolver) en esa factura');
        }
      }

      const nuevaDevolucion = await tx.devolucion.create({
        data: {
          facturaId,
          usuarioId: req.auth!.sub,
          motivo: parsed.data.motivo,
          detalles: { create: parsed.data.items.map((i) => ({ productoId: i.productoId, cantidadDevuelta: i.cantidad })) },
        },
      });

      for (const item of parsed.data.items) {
        await registrarMovimientoTx(tx, {
          productoId: item.productoId,
          tipo: 'devolucion',
          cantidad: item.cantidad,
          motivo: `Devolución de factura #${facturaId}`,
          referencia: String(facturaId),
          usuarioId: req.auth!.sub,
        });
      }

      return nuevaDevolucion;
    });

    await registrarAuditoria({
      usuarioId: req.auth!.sub,
      accion: 'registrar_devolucion',
      entidad: 'Factura',
      entidadId: String(facturaId),
      datosDespues: devolucion,
    });

    res.status(201).json(devolucion);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});
