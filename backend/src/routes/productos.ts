import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { requireAuth } from '../middleware/requireAuth';
import { requirePermission } from '../middleware/requirePermission';
import { registrarAuditoria } from '../services/auditoria';
import { estadoProducto, evaluarAlertaProducto, registrarMovimiento } from '../services/inventario';

export const productosRouter = Router();

productosRouter.use(requireAuth);

function serializar(producto: any) {
  return { ...producto, estado: estadoProducto(producto) };
}

const listQuerySchema = z.object({
  busqueda: z.string().optional(),
  categoriaId: z.string().optional(),
  proveedorId: z.string().optional(),
  estado: z.enum(['disponible', 'stock_bajo', 'agotado', 'inactivo']).optional(),
  precioMin: z.coerce.number().optional(),
  precioMax: z.coerce.number().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});

productosRouter.get('/', requirePermission('inventario.ver'), async (req, res) => {
  const parsed = listQuerySchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { busqueda, categoriaId, proveedorId, estado, precioMin, precioMax, page, pageSize } = parsed.data;

  const where: any = {
    ...(categoriaId ? { categoriaId } : {}),
    ...(proveedorId ? { proveedorId } : {}),
    ...(precioMin !== undefined || precioMax !== undefined
      ? { precioVenta: { ...(precioMin !== undefined ? { gte: precioMin } : {}), ...(precioMax !== undefined ? { lte: precioMax } : {}) } }
      : {}),
    ...(busqueda
      ? { OR: [{ nombre: { contains: busqueda } }, { codigo: { contains: busqueda } }, { codigoBarras: { contains: busqueda } }] }
      : {}),
    ...(estado === 'inactivo' ? { activo: false } : estado ? { activo: true } : {}),
  };

  const [total, productos] = await Promise.all([
    prisma.producto.count({ where }),
    prisma.producto.findMany({
      where,
      include: { categoria: true, proveedor: true, ubicacion: true },
      orderBy: { nombre: 'asc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  let items = productos.map(serializar);
  if (estado && estado !== 'inactivo') {
    items = items.filter((p) => p.estado === estado);
  }

  res.json({ total, page, pageSize, productos: items });
});

productosRouter.get('/:id', requirePermission('inventario.ver'), async (req, res) => {
  const producto = await prisma.producto.findUnique({
    where: { id: req.params.id },
    include: { categoria: true, proveedor: true, ubicacion: true },
  });
  if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
  res.json(serializar(producto));
});

productosRouter.get('/:id/movimientos', requirePermission('inventario.ver'), async (req, res) => {
  const movimientos = await prisma.movimientoInventario.findMany({
    where: { productoId: req.params.id },
    include: { usuario: { select: { id: true, nombre: true } } },
    orderBy: { fecha: 'desc' },
    take: 100,
  });
  res.json(movimientos);
});

const productoSchema = z.object({
  codigo: z.string().min(1),
  codigoBarras: z.string().optional().nullable(),
  nombre: z.string().min(1),
  descripcion: z.string().optional().nullable(),
  categoriaId: z.string().optional().nullable(),
  proveedorId: z.string().optional().nullable(),
  ubicacionId: z.string().optional().nullable(),
  unidadMedida: z.string().optional(),
  precioCosto: z.number().nonnegative(),
  precioVenta: z.number().nonnegative(),
  stockActual: z.number().int().nonnegative().optional(),
  stockMinimo: z.number().int().nonnegative().optional(),
});

productosRouter.post('/', requirePermission('inventario.editar'), async (req, res) => {
  const parsed = productoSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const existente = await prisma.producto.findUnique({ where: { codigo: parsed.data.codigo } });
  if (existente) return res.status(409).json({ error: 'Ya existe un producto con ese código' });

  const producto = await prisma.producto.create({ data: parsed.data });
  await evaluarAlertaProducto(producto.id);

  await registrarAuditoria({
    usuarioId: req.auth!.sub,
    accion: 'crear_producto',
    entidad: 'Producto',
    entidadId: producto.id,
    datosDespues: producto,
  });

  res.status(201).json(serializar(producto));
});

const actualizarProductoSchema = productoSchema.omit({ stockActual: true }).partial().extend({
  activo: z.boolean().optional(),
});

productosRouter.patch('/:id', requirePermission('inventario.editar'), async (req, res) => {
  const parsed = actualizarProductoSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const antes = await prisma.producto.findUnique({ where: { id: req.params.id } });
  if (!antes) return res.status(404).json({ error: 'Producto no encontrado' });

  const producto = await prisma.producto.update({ where: { id: req.params.id }, data: parsed.data });
  if (parsed.data.stockMinimo !== undefined) await evaluarAlertaProducto(producto.id);

  await registrarAuditoria({
    usuarioId: req.auth!.sub,
    accion: 'actualizar_producto',
    entidad: 'Producto',
    entidadId: producto.id,
    datosAntes: antes,
    datosDespues: producto,
  });

  res.json(serializar(producto));
});

// No hay eliminación física: "desactivar" conserva el historial de movimientos y facturas.
productosRouter.post('/:id/desactivar', requirePermission('inventario.editar'), async (req, res) => {
  const producto = await prisma.producto.update({ where: { id: req.params.id }, data: { activo: false } });

  await registrarAuditoria({
    usuarioId: req.auth!.sub,
    accion: 'desactivar_producto',
    entidad: 'Producto',
    entidadId: producto.id,
  });

  res.json(serializar(producto));
});

const ajusteSchema = z.object({
  cantidad: z.number().int().refine((v) => v !== 0, 'La cantidad no puede ser 0'),
  motivo: z.string().min(1),
});

productosRouter.post('/:id/ajustar', requirePermission('inventario.editar'), async (req, res) => {
  const parsed = ajusteSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  try {
    const movimiento = await registrarMovimiento({
      productoId: req.params.id,
      tipo: 'ajuste',
      cantidad: parsed.data.cantidad,
      motivo: parsed.data.motivo,
      usuarioId: req.auth!.sub,
    });

    await registrarAuditoria({
      usuarioId: req.auth!.sub,
      accion: 'ajustar_inventario',
      entidad: 'Producto',
      entidadId: req.params.id,
      datosDespues: movimiento,
    });

    res.status(201).json(movimiento);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});
