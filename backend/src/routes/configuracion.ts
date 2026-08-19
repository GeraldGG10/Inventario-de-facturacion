import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { requireAuth } from '../middleware/requireAuth';
import { requirePermission } from '../middleware/requirePermission';
import { registrarAuditoria } from '../services/auditoria';
import { reprogramarBackups } from '../services/backup';

export const configuracionRouter = Router();

configuracionRouter.use(requireAuth);

configuracionRouter.get('/', async (_req, res) => {
  const [empresa, facturacion, inventario, sistema] = await Promise.all([
    prisma.configuracionEmpresa.upsert({ where: { id: 'default' }, update: {}, create: { id: 'default' } }),
    prisma.configuracionFacturacion.upsert({ where: { id: 'default' }, update: {}, create: { id: 'default' } }),
    prisma.configuracionInventario.upsert({ where: { id: 'default' }, update: {}, create: { id: 'default' } }),
    prisma.configuracionSistema.upsert({ where: { id: 'default' }, update: {}, create: { id: 'default' } }),
  ]);
  res.json({ empresa, facturacion, inventario, sistema });
});

const empresaSchema = z.object({
  nombre: z.string().min(1).optional(),
  rnc: z.string().optional().nullable(),
  telefono: z.string().optional().nullable(),
  correo: z.string().email().optional().nullable().or(z.literal('')),
  direccion: z.string().optional().nullable(),
  logoPath: z.string().optional().nullable(),
  notasFactura: z.string().optional().nullable(),
});

configuracionRouter.patch('/empresa', requirePermission('configuracion.administrar'), async (req, res) => {
  const parsed = empresaSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const empresa = await prisma.configuracionEmpresa.upsert({
    where: { id: 'default' },
    update: parsed.data,
    create: { id: 'default', ...parsed.data },
  });

  await registrarAuditoria({ usuarioId: req.auth!.sub, accion: 'actualizar_configuracion_empresa', entidad: 'ConfiguracionEmpresa', datosDespues: empresa });
  res.json(empresa);
});

const facturacionSchema = z.object({
  serieFactura: z.string().min(1).optional(),
  impuestoPorcentaje: z.number().min(0).max(100).optional(),
  moneda: z.string().optional(),
  metodosPagoHabilitados: z.string().optional(),
  descuentoMaximoSinAprobar: z.number().min(0).max(100).optional(),
  permiteCredito: z.boolean().optional(),
  mostrarDesgloseImpuesto: z.boolean().optional(),
});

configuracionRouter.patch('/facturacion', requirePermission('configuracion.administrar'), async (req, res) => {
  const parsed = facturacionSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const config = await prisma.configuracionFacturacion.upsert({
    where: { id: 'default' },
    update: parsed.data,
    create: { id: 'default', ...parsed.data },
  });

  await registrarAuditoria({ usuarioId: req.auth!.sub, accion: 'actualizar_configuracion_facturacion', entidad: 'ConfiguracionFacturacion', datosDespues: config });
  res.json(config);
});

const inventarioSchema = z.object({
  stockMinimoDefault: z.number().int().min(0).optional(),
  umbralStockBajoPorcentaje: z.number().int().min(0).max(100).optional(),
  umbralStockCriticoPorcentaje: z.number().int().min(0).max(100).optional(),
  notificarApp: z.boolean().optional(),
  notificarEmail: z.boolean().optional(),
  notificarSms: z.boolean().optional(),
});

configuracionRouter.patch('/inventario', requirePermission('configuracion.administrar'), async (req, res) => {
  const parsed = inventarioSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const config = await prisma.configuracionInventario.upsert({
    where: { id: 'default' },
    update: parsed.data,
    create: { id: 'default', ...parsed.data },
  });

  await registrarAuditoria({ usuarioId: req.auth!.sub, accion: 'actualizar_configuracion_inventario', entidad: 'ConfiguracionInventario', datosDespues: config });
  res.json(config);
});

const sistemaSchema = z.object({
  backupFrecuenciaHoras: z.number().int().min(1).max(168).optional(),
  backupMaxArchivos: z.number().int().min(1).max(365).optional(),
});

configuracionRouter.patch('/sistema', requirePermission('configuracion.administrar'), async (req, res) => {
  const parsed = sistemaSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const config = await prisma.configuracionSistema.upsert({
    where: { id: 'default' },
    update: parsed.data,
    create: { id: 'default', ...parsed.data },
  });

  reprogramarBackups(config);

  await registrarAuditoria({ usuarioId: req.auth!.sub, accion: 'actualizar_configuracion_sistema', entidad: 'ConfiguracionSistema', datosDespues: config });
  res.json(config);
});

configuracionRouter.post('/sistema/respaldar-ahora', requirePermission('configuracion.administrar'), async (req, res) => {
  const { ejecutarBackup } = await import('../services/backup');
  try {
    const archivo = await ejecutarBackup();
    await registrarAuditoria({ usuarioId: req.auth!.sub, accion: 'respaldo_manual', entidad: 'ConfiguracionSistema', datosDespues: { archivo } });
    res.json({ archivo });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});
