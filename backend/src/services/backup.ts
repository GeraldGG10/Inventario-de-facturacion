import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { prisma } from '../config/prisma';
import { env } from '../config/env';
import { getBasePath, getPgsqlPath } from './postgres-portable';

interface ConexionPostgres {
  usuario: string;
  password: string;
  host: string;
  puerto: string;
  baseDeDatos: string;
}

function parsearDatabaseUrl(url: string): ConexionPostgres {
  const match = /^postgresql:\/\/([^:@]+):([^@]*)@([^:/]+):(\d+)\/([^?]+)/.exec(url);
  if (!match) throw new Error('DATABASE_URL no tiene el formato postgresql://usuario:password@host:puerto/db esperado para respaldar');
  const [, usuario, password, host, puerto, baseDeDatos] = match;
  return { usuario, password: decodeURIComponent(password), host, puerto, baseDeDatos };
}

function rutaPgDump(): string {
  const empaquetado = path.join(getPgsqlPath(), 'bin', 'pg_dump.exe');
  if (fs.existsSync(empaquetado)) return empaquetado;
  // Fuera del modo portable (Postgres instalado por el sistema), depende del PATH.
  return 'pg_dump';
}

function carpetaBackups(carpeta: string): string {
  return path.resolve(getBasePath(), carpeta);
}

export async function ejecutarBackup(): Promise<string> {
  const config = await prisma.configuracionSistema.upsert({ where: { id: 'default' }, update: {}, create: { id: 'default' } });
  const conexion = parsearDatabaseUrl(env.databaseUrl);

  const destinoDir = carpetaBackups(config.backupCarpeta);
  fs.mkdirSync(destinoDir, { recursive: true });

  const marca = new Date().toISOString().replace(/[:.]/g, '-');
  const destino = path.join(destinoDir, `stockly-${marca}.sql`);

  execFileSync(
    rutaPgDump(),
    ['-h', conexion.host, '-p', conexion.puerto, '-U', conexion.usuario, '-d', conexion.baseDeDatos, '-f', destino],
    { env: { ...process.env, PGPASSWORD: conexion.password }, stdio: 'pipe' },
  );

  const archivos = fs
    .readdirSync(destinoDir)
    .filter((f) => f.startsWith('stockly-') && f.endsWith('.sql'))
    .sort();
  const exceso = archivos.length - config.backupMaxArchivos;
  for (let i = 0; i < exceso; i++) {
    fs.unlinkSync(path.join(destinoDir, archivos[i]));
  }

  return destino;
}

let temporizador: ReturnType<typeof setInterval> | null = null;

export function reprogramarBackups(config: { backupFrecuenciaHoras: number }) {
  if (temporizador) clearInterval(temporizador);
  temporizador = setInterval(() => {
    ejecutarBackup().catch((error) => console.error('Respaldo automático falló:', error));
  }, config.backupFrecuenciaHoras * 3_600_000);
}

export async function iniciarRespaldoAutomatico() {
  try {
    const config = await prisma.configuracionSistema.upsert({ where: { id: 'default' }, update: {}, create: { id: 'default' } });
    reprogramarBackups(config);
  } catch (error) {
    console.error('No se pudo iniciar el respaldo automático (¿tablas aún no creadas?):', error);
  }
}
