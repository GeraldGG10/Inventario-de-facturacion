/**
 * postgres-portable.ts
 * Gestiona el ciclo de vida de una instancia de PostgreSQL Portable
 * empaquetada junto al .exe de Stockly.
 *
 * Flujo:
 *  1. Detecta si los binarios de pgsql existen (distribuidos junto al .exe).
 *  2. Si la carpeta db_data/ no existe → ejecuta initdb para crear la DB.
 *  3. Enciende postgres con pg_ctl start.
 *  4. Al cerrar el proceso (SIGINT / SIGTERM) apaga postgres limpiamente.
 */

import { execSync, exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

// ─── Rutas base ─────────────────────────────────────────────────────────────
// En modo .exe con pkg, __dirname apunta al directorio del ejecutable.
// En modo dev (ts-node), apunta a backend/src/services/.
export function getBasePath(): string {
  // pkg define process.pkg cuando el código corre dentro de un ejecutable
  if ((process as any).pkg) {
    return path.dirname(process.execPath);
  }
  // En desarrollo, sube 3 niveles: services → src → backend → proyecto
  return path.resolve(__dirname, '../../../');
}

export function getPgsqlPath(): string {
  return path.join(getBasePath(), 'pgsql');
}

export function getDbDataPath(): string {
  return path.join(getBasePath(), 'db_data');
}

function getPgCtl(): string {
  return path.join(getPgsqlPath(), 'bin', 'pg_ctl.exe');
}

function getInitDb(): string {
  return path.join(getPgsqlPath(), 'bin', 'initdb.exe');
}

function getLogPath(): string {
  return path.join(getBasePath(), 'stockly-db.log');
}

// ─── Puerto configurado en DATABASE_URL ─────────────────────────────────────
// Única fuente de verdad para el puerto: si DATABASE_URL cambia (por ejemplo
// porque el 5432 por defecto ya está tomado por otro Postgres instalado en la
// máquina), el motor portable y Prisma quedan sincronizados automáticamente.
export function getPgPort(): string {
  const match = /:(\d+)\/[^/]*$/.exec(process.env.DATABASE_URL ?? '');
  return match ? match[1] : '5432';
}

// ─── ¿Existe PostgreSQL Portable? ───────────────────────────────────────────
export function postgresPortableDisponible(): boolean {
  return fs.existsSync(getPgCtl()) && os.platform() === 'win32';
}

// ─── ¿Primera vez? (sin datos previos) ──────────────────────────────────────
export function esInicializacionNueva(): boolean {
  return !fs.existsSync(path.join(getDbDataPath(), 'PG_VERSION'));
}

// ─── Inicializar la base de datos (solo la primera vez) ─────────────────────
async function inicializarDB(): Promise<void> {
  console.log('📦 Primera ejecución detectada. Inicializando base de datos...');
  console.log('   (Esto puede tomar hasta 30 segundos — solo ocurre una vez)');

  const dataPath = getDbDataPath();
  const initdb = getInitDb();
  const pwdFile = path.join(os.tmpdir(), 'stockly_pgpwd.txt');

  // Escribir contraseña en archivo temporal (requerido por initdb)
  fs.writeFileSync(pwdFile, 'stockly2026', 'utf8');

  try {
    execSync(
      `"${initdb}" --pgdata="${dataPath}" --username=postgres --pwfile="${pwdFile}" --encoding=UTF8 --locale=es-DO`,
      { stdio: 'pipe' }
    );
    console.log('✅ Base de datos inicializada correctamente.');
  } finally {
    // Borrar el archivo de contraseña temporal
    try { fs.unlinkSync(pwdFile); } catch { /* ignorar */ }
  }

  // Ajustar pg_hba.conf para permitir conexiones locales con contraseña
  const hbaPath = path.join(dataPath, 'pg_hba.conf');
  if (fs.existsSync(hbaPath)) {
    const hba = `# TYPE  DATABASE        USER            ADDRESS                 METHOD
local   all             all                                     md5
host    all             all             127.0.0.1/32            md5
host    all             all             ::1/128                 md5
`;
    fs.writeFileSync(hbaPath, hba, 'utf8');
  }
}

// ─── Encender PostgreSQL Portable ────────────────────────────────────────────
export async function encenderPostgresPortable(): Promise<void> {
  if (!postgresPortableDisponible()) return;

  const pgCtl = getPgCtl();
  const dataPath = getDbDataPath();
  const logPath = getLogPath();

  // ── Primera vez: inicializar ─────────────────────────────────────────────
  if (esInicializacionNueva()) {
    await inicializarDB();
  }

  // ── Verificar si ya está corriendo ──────────────────────────────────────
  try {
    const status = execSync(`"${pgCtl}" status -D "${dataPath}"`, { stdio: 'pipe' }).toString();
    if (status.includes('server is running')) {
      console.log('ℹ️  PostgreSQL Portable ya está corriendo.');
      return;
    }
  } catch { /* no estaba corriendo, continuar */ }

  // ── Encender ─────────────────────────────────────────────────────────────
  const puerto = getPgPort();
  console.log(`🔌 Iniciando motor de base de datos (puerto ${puerto})...`);
  try {
    const { spawnSync } = require('child_process');
    const result = spawnSync(
      pgCtl,
      ['start', '-D', dataPath, '-l', logPath, '-o', `-p ${puerto}`],
      { stdio: 'pipe', timeout: 30000, windowsHide: true }
    );
    if (result.status !== 0 && result.status !== null) {
      const stderr = result.stderr?.toString() ?? '';
      // pg_ctl puede retornar distinto de 0 si ya está corriendo, ignorar
      if (!stderr.includes('already running')) {
        console.warn('⚠️  pg_ctl retornó código', result.status, '-', stderr.split('\n')[0]);
      }
    }
    // Esperar hasta 15s a que Postgres acepte conexiones
    const arrancoOk = await esperarPostgres(15);
    if (!arrancoOk) {
      // pg_ctl puede "arrancar" y fallar a enlazar el puerto (p. ej. si ya hay
      // otro Postgres del sistema usándolo) sin devolver un código de error
      // claro. Fallar aquí explícitamente evita que Prisma intente conectarse
      // a ciegas contra un motor que nunca quedó realmente arriba (o, peor,
      // contra un Postgres distinto que resultara estar en el mismo puerto).
      throw new Error(
        `El motor de base de datos no respondió tras 15s en el puerto ${puerto}. ` +
          `Revisa stockly-db.log — es posible que otro proceso (otro PostgreSQL instalado en esta máquina) ya esté usando ese puerto.`,
      );
    }
    console.log('✅ Motor de base de datos activo.');
  } catch (err) {
    console.error('❌ No se pudo iniciar el motor de base de datos.');
    console.error('   Revisa el archivo stockly-db.log para más detalles.');
    throw err;
  }
}

// ─── Esperar que Postgres acepte conexiones ───────────────────────────────────
async function esperarPostgres(maxSegundos: number): Promise<boolean> {
  const pgCtl = getPgCtl();
  const dataPath = getDbDataPath();

  for (let i = 0; i < maxSegundos; i++) {
    try {
      const status = execSync(`"${pgCtl}" status -D "${dataPath}"`, { stdio: 'pipe' }).toString();
      if (status.includes('server is running')) return true;
    } catch { /* seguir esperando */ }
    await new Promise((r) => setTimeout(r, 1000));
  }
  return false;
}

// ─── Crear base de datos "stockly" si no existe ───────────────────────────────
export async function crearBaseDeDatos(): Promise<void> {
  if (!postgresPortableDisponible()) return;

  const psql = path.join(getPgsqlPath(), 'bin', 'psql.exe');
  const createdb = path.join(getPgsqlPath(), 'bin', 'createdb.exe');

  try {
    // Intentar crear la base de datos 'stockly'
    execSync(
      `"${createdb}" -U postgres -p ${getPgPort()} stockly`,
      {
        stdio: 'pipe',
        env: { ...process.env, PGPASSWORD: 'stockly2026' }
      }
    );
    console.log('✅ Base de datos "stockly" creada.');
  } catch (err: any) {
    const msg = err?.stderr?.toString() ?? '';
    if (msg.includes('already exists')) {
      // Ya existe — es OK
    } else {
      console.warn('⚠️  No se pudo verificar/crear la base de datos "stockly":', msg);
    }
  }
}

// ─── Ejecutar migraciones de Prisma ──────────────────────────────────────────
export async function ejecutarMigraciones(): Promise<void> {
  if (!postgresPortableDisponible()) return;
  if (!esInicializacionNueva()) return; // Solo en la primera ejecución

  // Nota: esInicializacionNueva ya fue consultada antes de encender, 
  // guardamos el estado para saber si necesitamos migrar.
}

// ─── Apagar PostgreSQL Portable al cerrar ────────────────────────────────────
export function apagarPostgresAlCerrar(): void {
  if (!postgresPortableDisponible()) return;

  const pgCtl = getPgCtl();
  const dataPath = getDbDataPath();

  const apagar = () => {
    try {
      console.log('\n🛑 Apagando base de datos...');
      execSync(`"${pgCtl}" stop -D "${dataPath}" -m fast`, { stdio: 'pipe' });
      console.log('✅ Base de datos apagada correctamente.');
    } catch {
      // Silenciar — es posible que ya estuviera apagada
    }
    process.exit(0);
  };

  process.on('SIGINT', apagar);
  process.on('SIGTERM', apagar);

  // En Windows, pkg captura CTRL+C como SIGINT pero también hay que manejar esto:
  if (os.platform() === 'win32') {
    process.on('SIGBREAK', apagar);
  }
}
