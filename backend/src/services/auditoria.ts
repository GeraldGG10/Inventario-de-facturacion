import { prisma } from '../config/prisma';

interface RegistrarAuditoriaParams {
  usuarioId?: string | null;
  accion: string;
  entidad: string;
  entidadId?: string | null;
  datosAntes?: unknown;
  datosDespues?: unknown;
}

// SQLite no soporta el tipo Json de Prisma: se guarda como texto serializado
// y se reconstruye al leer (ver auditoria.ts).
function serializar(valor: unknown): string | null {
  return valor === undefined || valor === null ? null : JSON.stringify(valor);
}

export function registrarAuditoria(params: RegistrarAuditoriaParams) {
  return prisma.auditoria.create({
    data: {
      usuarioId: params.usuarioId ?? null,
      accion: params.accion,
      entidad: params.entidad,
      entidadId: params.entidadId ?? null,
      datosAntes: serializar(params.datosAntes),
      datosDespues: serializar(params.datosDespues),
    },
  });
}
