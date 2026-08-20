import path from 'path';
import { PrismaClient } from '@prisma/client';

// Cuando corre dentro de un .exe generado por pkg, apuntar al motor de Prisma
// que está en la carpeta del ejecutable (junto al .exe distribuido).
if ((process as any).pkg) {
  const exeDir = path.dirname(process.execPath);
  const enginePath = path.join(exeDir, 'query_engine-windows.dll.node');
  process.env['PRISMA_QUERY_ENGINE_LIBRARY'] = enginePath;
}

export const prisma = new PrismaClient();
