import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';

export type TipoMovimiento = 'entrada' | 'salida' | 'ajuste' | 'devolucion';

interface RegistrarMovimientoParams {
  productoId: string;
  tipo: TipoMovimiento;
  cantidad: number;
  motivo?: string | null;
  referencia?: string | null;
  usuarioId?: string | null;
}

type Tx = Prisma.TransactionClient;

/**
 * Aplica un movimiento de inventario y re-evalúa la alerta de reposición del
 * producto dentro de la transacción `tx` recibida, para poder componerse con
 * operaciones más grandes (p. ej. registrar todas las líneas de una factura).
 */
export async function registrarMovimientoTx(tx: Tx, params: RegistrarMovimientoParams) {
  const { productoId, tipo, motivo, referencia, usuarioId } = params;

  const producto = await tx.producto.findUniqueOrThrow({ where: { id: productoId } });
  const stockAnterior = producto.stockActual;

  const delta = tipo === 'salida' ? -Math.abs(params.cantidad) : params.cantidad;
  const stockNuevo = stockAnterior + delta;

  if (stockNuevo < 0) {
    throw new Error(`Stock insuficiente para ${producto.nombre}: disponible ${stockAnterior}, se solicitaron ${Math.abs(delta)}`);
  }

  await tx.producto.update({ where: { id: productoId }, data: { stockActual: stockNuevo } });

  const movimiento = await tx.movimientoInventario.create({
    data: { productoId, tipo, cantidad: delta, stockAnterior, stockNuevo, motivo, referencia, usuarioId },
  });

  await reevaluarAlerta(tx, productoId, stockNuevo, producto.stockMinimo);

  return movimiento;
}

/** Variante que abre su propia transacción, para llamadas independientes (no anidadas en otra). */
export async function registrarMovimiento(params: RegistrarMovimientoParams) {
  return prisma.$transaction((tx) => registrarMovimientoTx(tx, params));
}

async function reevaluarAlerta(tx: Tx, productoId: string, stockActual: number, stockMinimo: number) {
  const alertaPendiente = await tx.alertaInventario.findFirst({
    where: { productoId, estado: 'pendiente' },
  });

  if (stockActual <= stockMinimo) {
    const cantidadSugerida = Math.max(stockMinimo * 2 - stockActual, stockMinimo);
    if (alertaPendiente) {
      await tx.alertaInventario.update({
        where: { id: alertaPendiente.id },
        data: { stockActual, stockMinimo, cantidadSugerida },
      });
    } else {
      await tx.alertaInventario.create({
        data: { productoId, stockActual, stockMinimo, cantidadSugerida, estado: 'pendiente' },
      });
    }
  } else if (alertaPendiente) {
    await tx.alertaInventario.update({
      where: { id: alertaPendiente.id },
      data: { estado: 'atendida', fechaAtendida: new Date() },
    });
  }
}

/**
 * Re-evalúa la alerta de un producto fuera del flujo de movimientos: al
 * crearlo (puede nacer ya por debajo del mínimo) o al editar su stockMinimo
 * (puede cruzar el umbral sin que haya habido ningún movimiento de stock).
 */
export async function evaluarAlertaProducto(productoId: string) {
  const producto = await prisma.producto.findUniqueOrThrow({ where: { id: productoId } });
  await prisma.$transaction((tx) => reevaluarAlerta(tx, productoId, producto.stockActual, producto.stockMinimo));
}

export function estadoProducto(producto: { activo: boolean; stockActual: number; stockMinimo: number }): string {
  if (!producto.activo) return 'inactivo';
  if (producto.stockActual <= 0) return 'agotado';
  if (producto.stockActual <= producto.stockMinimo) return 'stock_bajo';
  return 'disponible';
}
