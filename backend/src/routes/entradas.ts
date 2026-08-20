import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { requireAuth } from '../middleware/requireAuth';
import { requirePermission } from '../middleware/requirePermission';
import { registrarAuditoria } from '../services/auditoria';
import { registrarMovimientoTx } from '../services/inventario';

export const entradasRouter = Router();

entradasRouter.use(requireAuth, requirePermission('proveedores.administrar'));

entradasRouter.get('/', async (req, res) => {
  const { proveedorId } = req.query;
  const entradas = await prisma.entradaMercancia.findMany({
    where: typeof proveedorId === 'string' ? { proveedorId } : undefined,
    include: {
      proveedor: { select: { id: true, nombre: true } },
      usuario: { select: { id: true, nombre: true } },
      detalles: { include: { producto: { select: { id: true, nombre: true, codigo: true } } } },
    },
    orderBy: { fecha: 'desc' },
    take: 100,
  });
  res.json(entradas);
});

const detalleSchema = z.object({
  productoId: z.string().min(1),
  cantidad: z.number().int().positive(),
  costoUnitario: z.number().nonnegative(),
});

const entradaSchema = z.object({
  proveedorId: z.string().min(1),
  observaciones: z.string().optional().nullable(),
  detalles: z.array(detalleSchema).min(1),
});

entradasRouter.post('/', async (req, res) => {
  const parsed = entradaSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { proveedorId, observaciones, detalles } = parsed.data;

  try {
    const entrada = await prisma.$transaction(async (tx) => {
      const nuevaEntrada = await tx.entradaMercancia.create({
        data: {
          proveedorId,
          usuarioId: req.auth!.sub,
          observaciones,
          detalles: {
            create: detalles.map((d) => ({
              productoId: d.productoId,
              cantidad: d.cantidad,
              costoUnitario: d.costoUnitario,
              subtotal: d.cantidad * d.costoUnitario,
            })),
          },
        },
        include: { detalles: true },
      });

      // El stock aumenta vía el mismo servicio que usan movimientos y facturas,
      // así la alerta de reposición del producto también se re-evalúa aquí.
      // Todo corre en la misma transacción: si un producto no existe o falla
      // a mitad de camino, la entrada completa se revierte (no queda a medias).
      for (const detalle of detalles) {
        await registrarMovimientoTx(tx, {
          productoId: detalle.productoId,
          tipo: 'entrada',
          cantidad: detalle.cantidad,
          motivo: 'Entrada de mercancía',
          referencia: nuevaEntrada.id,
          usuarioId: req.auth!.sub,
        });
        await tx.producto.update({ where: { id: detalle.productoId }, data: { precioCosto: detalle.costoUnitario } });
      }

      return nuevaEntrada;
    });

    await registrarAuditoria({
      usuarioId: req.auth!.sub,
      accion: 'registrar_entrada_mercancia',
      entidad: 'EntradaMercancia',
      entidadId: entrada.id,
      datosDespues: entrada,
    });

    res.status(201).json(entrada);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});
