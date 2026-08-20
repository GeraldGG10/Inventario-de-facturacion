import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { requireAuth } from '../middleware/requireAuth';
import { requirePermission } from '../middleware/requirePermission';
import { registrarAuditoria } from '../services/auditoria';

export const clientesRouter = Router();

clientesRouter.use(requireAuth);

clientesRouter.get('/', requirePermission('clientes.administrar'), async (req, res) => {
  const { busqueda } = req.query;
  const clientes = await prisma.cliente.findMany({
    where: typeof busqueda === 'string' && busqueda
      ? { OR: [{ nombre: { contains: busqueda, mode: 'insensitive' } }, { documento: { contains: busqueda, mode: 'insensitive' } }] }
      : undefined,
    include: { facturas: { where: { estado: { not: 'anulada' } }, select: { total: true, fecha: true } } },
    orderBy: { nombre: 'asc' },
  });

  res.json(
    clientes.map((c) => {
      const facturas = c.facturas;
      const totalComprado = facturas.reduce((acc, f) => acc + f.total, 0);
      const ultimaCompra = facturas.length ? facturas.map((f) => f.fecha).sort((a, b) => +b - +a)[0] : null;
      return {
        id: c.id,
        nombre: c.nombre,
        documento: c.documento,
        telefono: c.telefono,
        correo: c.correo,
        direccion: c.direccion,
        limiteCredito: c.limiteCredito,
        activo: c.activo,
        cantidadCompras: facturas.length,
        totalComprado,
        ultimaCompra,
      };
    }),
  );
});

clientesRouter.get('/:id', requirePermission('clientes.administrar'), async (req, res) => {
  const cliente = await prisma.cliente.findUnique({
    where: { id: req.params.id },
    include: { facturas: { orderBy: { fecha: 'desc' }, include: { detalles: true } } },
  });
  if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });

  const facturasVigentes = cliente.facturas.filter((f) => f.estado !== 'anulada');
  res.json({
    ...cliente,
    totalGastado: facturasVigentes.reduce((acc, f) => acc + f.total, 0),
    numeroCompras: facturasVigentes.length,
    ultimaCompra: facturasVigentes[0]?.fecha ?? null,
  });
});

const clienteSchema = z.object({
  nombre: z.string().min(1),
  documento: z.string().optional().nullable(),
  telefono: z.string().optional().nullable(),
  correo: z.string().email().optional().nullable().or(z.literal('')),
  direccion: z.string().optional().nullable(),
  limiteCredito: z.number().nonnegative().optional().nullable(),
});

clientesRouter.post('/', requirePermission('clientes.administrar'), async (req, res) => {
  const parsed = clienteSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const cliente = await prisma.cliente.create({ data: parsed.data });

  await registrarAuditoria({
    usuarioId: req.auth!.sub,
    accion: 'crear_cliente',
    entidad: 'Cliente',
    entidadId: cliente.id,
    datosDespues: cliente,
  });

  res.status(201).json(cliente);
});

clientesRouter.patch('/:id', requirePermission('clientes.administrar'), async (req, res) => {
  const parsed = clienteSchema.partial().extend({ activo: z.boolean().optional() }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const antes = await prisma.cliente.findUnique({ where: { id: req.params.id } });
  if (!antes) return res.status(404).json({ error: 'Cliente no encontrado' });

  const cliente = await prisma.cliente.update({ where: { id: req.params.id }, data: parsed.data });

  await registrarAuditoria({
    usuarioId: req.auth!.sub,
    accion: 'actualizar_cliente',
    entidad: 'Cliente',
    entidadId: cliente.id,
    datosAntes: antes,
    datosDespues: cliente,
  });

  res.json(cliente);
});
