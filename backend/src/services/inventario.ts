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
  const delta = tipo === 'salida' ? -Math.abs(params.cantidad) : params.cantidad;

  // Update atómico condicionado por WHERE en vez de leer-calcular-escribir:
  // bajo cajeros concurrentes, dos transacciones que lean el mismo stock
  // antes de que ninguna escriba pueden pisarse el resultado la una a la
  // otra ("lost update"). Con `increment` + condición en el WHERE, Postgres
  // serializa las escrituras fila por fila y cada una parte del valor real
  // más reciente, sin importar el orden de llegada.
  const resultado = await tx.producto.updateMany({
    where: {
      id: productoId,
      ...(delta < 0 ? { stockActual: { gte: -delta } } : {}),
    },
    data: { stockActual: { increment: delta } },
  });

  if (resultado.count === 0) {
    // count === 0 es "no existe" o "stock insuficiente"; reconsultamos solo
    // para dar un mensaje de error claro, no para decidir la escritura.
    const producto = await tx.producto.findUniqueOrThrow({ where: { id: productoId } });
    throw new Error(`Stock insuficiente para ${producto.nombre}: disponible ${producto.stockActual}, se solicitaron ${Math.abs(delta)}`);
  }

  const producto = await tx.producto.findUniqueOrThrow({ where: { id: productoId } });
  const stockNuevo = producto.stockActual;
  const stockAnterior = stockNuevo - delta;

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

/**
 * Reconcilia la tabla AlertaInventario contra el estado real de los productos.
 *
 * Las alertas normalmente se mantienen al día vía reevaluarAlerta() en cada
 * movimiento de stock, pero un producto puede quedar con stock bajo el
 * mínimo sin pasar por ahí (p. ej. un seed/importación masiva con
 * createMany, o una edición directa en la base). Sin esto, la página de
 * Alertas podía mostrar menos productos de los que realmente estaban en
 * "Stock Bajo"/"Agotado" en el listado de Inventario (que sí calcula el
 * estado en vivo). Se llama antes de listar alertas para que ambas vistas
 * queden siempre consistentes, sin importar cómo se haya originado el
 * desajuste.
 */
export async function reconciliarAlertas(): Promise<void> {
  const productosBajos = await prisma.producto.findMany({
    where: { activo: true, stockActual: { lte: prisma.producto.fields.stockMinimo } },
    select: { id: true, stockActual: true, stockMinimo: true },
  });
  const idsBajos = new Set(productosBajos.map((p) => p.id));

  const pendientes = await prisma.alertaInventario.findMany({
    where: { estado: 'pendiente' },
    select: { id: true, productoId: true },
  });
  const idsConAlertaPendiente = new Set(pendientes.map((a) => a.productoId));

  const faltantes = productosBajos.filter((p) => !idsConAlertaPendiente.has(p.id));
  if (faltantes.length > 0) {
    await prisma.alertaInventario.createMany({
      data: faltantes.map((p) => ({
        productoId: p.id,
        stockActual: p.stockActual,
        stockMinimo: p.stockMinimo,
        cantidadSugerida: Math.max(p.stockMinimo * 2 - p.stockActual, p.stockMinimo),
        estado: 'pendiente' as const,
      })),
    });
  }

  const idsARecuperar = pendientes.filter((a) => !idsBajos.has(a.productoId)).map((a) => a.id);
  if (idsARecuperar.length > 0) {
    await prisma.alertaInventario.updateMany({
      where: { id: { in: idsARecuperar } },
      data: { estado: 'atendida', fechaAtendida: new Date() },
    });
  }
}

export function estadoProducto(producto: { activo: boolean; stockActual: number; stockMinimo: number }): string {
  if (!producto.activo) return 'inactivo';
  if (producto.stockActual <= 0) return 'agotado';
  if (producto.stockActual <= producto.stockMinimo) return 'stock_bajo';
  return 'disponible';
}
