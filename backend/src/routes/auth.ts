import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../config/prisma";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt";
import { env } from "../config/env";
import { registrarAuditoria } from "../services/auditoria";
import { requireAuth } from "../middleware/requireAuth";

export const authRouter = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function expiresInMsToDate(expiresIn: string): Date {
  const match = /^(\d+)([smhd])$/.exec(expiresIn);
  if (!match) return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const value = Number(match[1]);
  const unitMs = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[match[2]]!;
  return new Date(Date.now() + value * unitMs);
}

authRouter.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Email y contraseña son requeridos" });
  }
  const { email, password } = parsed.data;

  const usuario = await prisma.usuario.findUnique({
    where: { email },
    include: { rol: { include: { permisos: { include: { permiso: true } } } } },
  });

  if (!usuario || !usuario.activo) {
    return res.status(401).json({ error: "Credenciales inválidas" });
  }

  const passwordValida = await bcrypt.compare(password, usuario.passwordHash);
  if (!passwordValida) {
    return res.status(401).json({ error: "Credenciales inválidas" });
  }

  const permisos = usuario.rol.permisos.map((rp) => rp.permiso.nombre);
  const accessToken = signAccessToken({
    sub: usuario.id,
    rol: usuario.rol.nombre,
    permisos,
  });
  const refreshToken = signRefreshToken(usuario.id);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      usuarioId: usuario.id,
      expiresAt: expiresInMsToDate(env.jwtRefreshExpiresIn),
    },
  });

  await prisma.usuario.update({
    where: { id: usuario.id },
    data: { ultimoAcceso: new Date() },
  });

  await registrarAuditoria({
    usuarioId: usuario.id,
    accion: "login",
    entidad: "Usuario",
    entidadId: usuario.id,
  });

  res.json({
    accessToken,
    refreshToken,
    usuario: {
      id: usuario.id,
      nombre: usuario.nombre,
      nombreUsuario: usuario.nombreUsuario,
      email: usuario.email,
      rol: usuario.rol.nombre,
      permisos,
    },
  });
});

authRouter.get("/me", requireAuth, async (req, res) => {
  const usuario = await prisma.usuario.findUnique({
    where: { id: req.auth!.sub },
    select: {
      id: true,
      nombre: true,
      nombreUsuario: true,
      email: true,
      activo: true,
      rol: { select: { nombre: true } },
    },
  });
  if (!usuario || !usuario.activo) {
    return res.status(401).json({ error: "Usuario inválido" });
  }
  res.json({
    ...usuario,
    rol: usuario.rol.nombre,
    permisos: req.auth!.permisos,
  });
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

authRouter.post("/refresh", async (req, res) => {
  const parsed = refreshSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "refreshToken es requerido" });
  }
  const { refreshToken } = parsed.data;

  const stored = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
  });
  if (!stored || stored.revocado || stored.expiresAt < new Date()) {
    return res.status(401).json({ error: "Refresh token inválido o expirado" });
  }

  let payload: { sub: string };
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    return res.status(401).json({ error: "Refresh token inválido o expirado" });
  }

  const usuario = await prisma.usuario.findUnique({
    where: { id: payload.sub },
    include: { rol: { include: { permisos: { include: { permiso: true } } } } },
  });

  if (!usuario || !usuario.activo) {
    return res.status(401).json({ error: "Usuario inválido" });
  }

  await prisma.refreshToken.update({
    where: { token: refreshToken },
    data: { revocado: true },
  });

  const permisos = usuario.rol.permisos.map((rp) => rp.permiso.nombre);
  const newAccessToken = signAccessToken({
    sub: usuario.id,
    rol: usuario.rol.nombre,
    permisos,
  });
  const newRefreshToken = signRefreshToken(usuario.id);

  await prisma.refreshToken.create({
    data: {
      token: newRefreshToken,
      usuarioId: usuario.id,
      expiresAt: expiresInMsToDate(env.jwtRefreshExpiresIn),
    },
  });

  res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
});

authRouter.post("/logout", async (req, res) => {
  const parsed = refreshSchema.safeParse(req.body);
  if (parsed.success) {
    await prisma.refreshToken.updateMany({
      where: { token: parsed.data.refreshToken },
      data: { revocado: true },
    });
  }
  res.status(204).send();
});
