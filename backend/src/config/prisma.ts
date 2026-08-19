import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

// SQLite: WAL permite lecturas concurrentes mientras hay una escritura en curso
// (varios cajeros facturando a la vez) y busy_timeout evita "database is locked"
// inmediato cuando dos escrituras coinciden, dejando que Prisma reintente.
prisma.$executeRawUnsafe('PRAGMA journal_mode = WAL;').catch(() => {});
prisma.$executeRawUnsafe('PRAGMA busy_timeout = 5000;').catch(() => {});
