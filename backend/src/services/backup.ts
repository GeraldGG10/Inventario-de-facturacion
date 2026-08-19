import fs from 'fs';
import path from 'path';
import { prisma } from '../config/prisma';
import { env } from '../config/env';

function rutaBaseDatos(): string {
  // DATABASE_URL tiene forma "file:./inventario.db" o "file:/ruta/absoluta/inventario.db"
  const sinPrefijo = env.databaseUrl.replace(/^file:/, '');
  return path.resolve(path.dirname(require.main?.filename ?? process.cwd()), sinPrefijo);
}

function carpetaBackups(carpeta: string): string {
  return path.resolve(path.dirname(rutaBaseDatos()), carpeta);
}

export async function ejecutarBackup(): Promise<string> {
  const config = await prisma.configuracionSistema.upsert({ where: { id: 'default' }, update: {}, create: { id: 'default' } });
  const origen = rutaBaseDatos();
  if (!fs.existsSync(origen)) throw new Error('No se encontró el archivo de base de datos para respaldar');

  const destinoDir = carpetaBackups(config.backupCarpeta);
  fs.mkdirSync(destinoDir, { recursive: true });

  const marca = new Date().toISOString().replace(/[:.]/g, '-');
  const destino = path.join(destinoDir, `inventario-${marca}.db`);
  fs.copyFileSync(origen, destino);

  const archivos = fs
    .readdirSync(destinoDir)
    .filter((f) => f.startsWith('inventario-') && f.endsWith('.db'))
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
  const config = await prisma.configuracionSistema.upsert({ where: { id: 'default' }, update: {}, create: { id: 'default' } });
  reprogramarBackups(config);
}
