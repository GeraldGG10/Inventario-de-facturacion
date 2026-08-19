import { Router } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { requireAuth } from '../middleware/requireAuth';
import { requirePermission } from '../middleware/requirePermission';
import { registrarAuditoria } from '../services/auditoria';

export const usuariosRouter = Router();

usuariosRouter.use(requireAuth, requirePermission('usuarios.administrar'));

const usuarioSelect = {
  id: true,
  nombre: true,
  nombreUsuario: true,
  email: true,
  activo: true,
  ultimoAcceso: true,
  createdAt: true,
  rol: { select: { id: true, nombre: true } },
} as const;

usuariosRouter.get('/', async (_req, res) => {
  const usuarios = await prisma.usuario.findMany({
    select: usuarioSelect,
    orderBy: { createdAt: 'desc' },
  });
  res.json(usuarios);
});

const crearUsuarioSchema = z.object({
  nombre: z.string().min(1),
  nombreUsuario: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8),
  rolId: z.string().uuid(),
});

usuariosRouter.post('/', async (req, res) => {
  const parsed = crearUsuarioSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const { nombre, nombreUsuario, email, password, rolId } = parsed.data;

  const existente = await prisma.usuario.findFirst({ where: { OR: [{ email }, { nombreUsuario }] } });
  if (existente) {
    return res.status(409).json({ error: 'Ya existe un usuario con ese email o nombre de usuario' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const usuario = await prisma.usuario.create({
    data: { nombre, nombreUsuario, email, passwordHash, rolId },
    select: usuarioSelect,
  });

  await registrarAuditoria({
    usuarioId: req.auth!.sub,
    accion: 'crear_usuario',
    entidad: 'Usuario',
    entidadId: usuario.id,
    datosDespues: usuario,
  });

  res.status(201).json(usuario);
});

const actualizarUsuarioSchema = z.object({
  nombre: z.string().min(1).optional(),
  rolId: z.string().uuid().optional(),
  activo: z.boolean().optional(),
  password: z.string().min(8).optional(),
});

usuariosRouter.patch('/:id', async (req, res) => {
  const parsed = actualizarUsuarioSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const usuarioAntes = await prisma.usuario.findUnique({ where: { id: req.params.id } });
  if (!usuarioAntes) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }

  const { password, ...resto } = parsed.data;
  const data: Record<string, unknown> = { ...resto };
  if (password) {
    data.passwordHash = await bcrypt.hash(password, 10);
  }

  const usuario = await prisma.usuario.update({
    where: { id: req.params.id },
    data,
    select: usuarioSelect,
  });

  await registrarAuditoria({
    usuarioId: req.auth!.sub,
    accion: 'actualizar_usuario',
    entidad: 'Usuario',
    entidadId: usuario.id,
    datosAntes: { nombre: usuarioAntes.nombre, activo: usuarioAntes.activo, rolId: usuarioAntes.rolId },
    datosDespues: usuario,
  });

  res.json(usuario);
});
