import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { requireAuth } from '../middleware/requireAuth';
import { requirePermission } from '../middleware/requirePermission';
import { registrarAuditoria } from '../services/auditoria';

export const proveedoresRouter = Router();

proveedoresRouter.use(requireAuth);

proveedoresRouter.get('/', requirePermission('inventario.ver'), async (req, res) => {
  const { busqueda } = req.query;
  const proveedores = await prisma.proveedor.findMany({
    where:
      typeof busqueda === 'string' && busqueda
        ? { OR: [{ nombre: { contains: busqueda, mode: 'insensitive' } }, { rnc: { contains: busqueda, mode: 'insensitive' } }] }
        : undefined,
    include: { _count: { select: { productos: true } } },
    orderBy: { nombre: 'asc' },
  });

  res.json(
    proveedores.map((p) => ({
      id: p.id,
      nombre: p.nombre,
      rnc: p.rnc,
      tipo: p.tipo,
      contactoNombre: p.contactoNombre,
      telefono: p.telefono,
      correo: p.correo,
      direccion: p.direccion,
      ciudad: p.ciudad,
      categoria: p.categoria,
      condicionesPago: p.condicionesPago,
      observaciones: p.observaciones,
      activo: p.activo,
      productosSuministrados: p._count.productos,
    })),
  );
});

proveedoresRouter.get('/:id', requirePermission('inventario.ver'), async (req, res) => {
  const proveedor = await prisma.proveedor.findUnique({
    where: { id: req.params.id },
    include: {
      productos: { select: { id: true, codigo: true, nombre: true, stockActual: true } },
      entradas: {
        orderBy: { fecha: 'desc' },
        take: 20,
        include: { detalles: true },
      },
    },
  });
  if (!proveedor) return res.status(404).json({ error: 'Proveedor no encontrado' });

  const totalMercanciaAdquirida = proveedor.entradas.reduce(
    (acc, entrada) => acc + entrada.detalles.reduce((s, d) => s + d.subtotal, 0),
    0,
  );

  res.json({ ...proveedor, totalMercanciaAdquirida });
});

const proveedorSchema = z.object({
  nombre: z.string().min(1),
  rnc: z.string().optional().nullable(),
  tipo: z.enum(['empresa', 'persona']).optional(),
  contactoNombre: z.string().optional().nullable(),
  telefono: z.string().optional().nullable(),
  correo: z.string().email().optional().nullable().or(z.literal('')),
  direccion: z.string().optional().nullable(),
  ciudad: z.string().optional().nullable(),
  categoria: z.string().optional().nullable(),
  condicionesPago: z.string().optional(),
  observaciones: z.string().optional().nullable(),
  activo: z.boolean().optional(),
});

proveedoresRouter.post('/', requirePermission('proveedores.administrar'), async (req, res) => {
  const parsed = proveedorSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const proveedor = await prisma.proveedor.create({ data: parsed.data });

  await registrarAuditoria({
    usuarioId: req.auth!.sub,
    accion: 'crear_proveedor',
    entidad: 'Proveedor',
    entidadId: proveedor.id,
    datosDespues: proveedor,
  });

  res.status(201).json(proveedor);
});

proveedoresRouter.patch('/:id', requirePermission('proveedores.administrar'), async (req, res) => {
  const parsed = proveedorSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const antes = await prisma.proveedor.findUnique({ where: { id: req.params.id } });
  if (!antes) return res.status(404).json({ error: 'Proveedor no encontrado' });

  const proveedor = await prisma.proveedor.update({ where: { id: req.params.id }, data: parsed.data });

  await registrarAuditoria({
    usuarioId: req.auth!.sub,
    accion: 'actualizar_proveedor',
    entidad: 'Proveedor',
    entidadId: proveedor.id,
    datosAntes: antes,
    datosDespues: proveedor,
  });

  res.json(proveedor);
});
