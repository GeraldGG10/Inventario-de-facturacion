import { prisma } from '../config/prisma';

interface RegistrarAuditoriaParams {
  usuarioId?: string | null;
  accion: string;
  entidad: string;
  entidadId?: string | null;
  datosAntes?: unknown;
  datosDespues?: unknown;
}

export function registrarAuditoria(params: RegistrarAuditoriaParams) {
  return prisma.auditoria.create({
    data: {
      usuarioId: params.usuarioId ?? null,
      accion: params.accion,
      entidad: params.entidad,
      entidadId: params.entidadId ?? null,
      datosAntes: params.datosAntes as any,
      datosDespues: params.datosDespues as any,
    },
  });
}
