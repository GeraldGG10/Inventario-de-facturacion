import express from 'express';
import cors from 'cors';
import path from 'path';
import { env } from './config/env';
import { prisma } from './config/prisma';
import { authRouter } from './routes/auth';
import { usuariosRouter } from './routes/usuarios';
import { rolesRouter } from './routes/roles';
import { auditoriaRouter } from './routes/auditoria';
import { dashboardRouter } from './routes/dashboard';
import { categoriasRouter } from './routes/categorias';
import { ubicacionesRouter } from './routes/ubicaciones';
import { proveedoresRouter } from './routes/proveedores';
import { productosRouter } from './routes/productos';
import { movimientosRouter } from './routes/movimientos';
import { alertasRouter } from './routes/alertas';
import { entradasRouter } from './routes/entradas';
import { clientesRouter } from './routes/clientes';
import { facturasRouter } from './routes/facturas';
import { reportesRouter } from './routes/reportes';
import { configuracionRouter } from './routes/configuracion';
import { iniciarRespaldoAutomatico } from './services/backup';
import {
  postgresPortableDisponible,
  esInicializacionNueva,
  encenderPostgresPortable,
  crearBaseDeDatos,
  apagarPostgresAlCerrar,
  getPgPort,
} from './services/postgres-portable';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Rutas de API
const apiRouter = express.Router();
apiRouter.use('/auth', authRouter);
apiRouter.use('/usuarios', usuariosRouter);
apiRouter.use('/roles', rolesRouter);
apiRouter.use('/auditoria', auditoriaRouter);
apiRouter.use('/dashboard', dashboardRouter);
apiRouter.use('/categorias', categoriasRouter);
apiRouter.use('/ubicaciones', ubicacionesRouter);
apiRouter.use('/proveedores', proveedoresRouter);
apiRouter.use('/productos', productosRouter);
apiRouter.use('/movimientos', movimientosRouter);
apiRouter.use('/alertas', alertasRouter);
apiRouter.use('/entradas', entradasRouter);
apiRouter.use('/clientes', clientesRouter);
apiRouter.use('/facturas', facturasRouter);
apiRouter.use('/reportes', reportesRouter);
apiRouter.use('/configuracion', configuracionRouter);

app.use('/api', apiRouter);

// Servir frontend compilado
// En modo exe (pkg), __dirname apunta al snapshot; el frontend está junto al exe.
const frontendPath = (process as any).pkg
  ? path.join(path.dirname(process.execPath), 'frontend_dist')
  : path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

import { exec, execSync } from 'child_process';
import os from 'os';

// ─── Abrir navegador automáticamente ─────────────────────────────────────────
function abrirNavegador(puerto: number) {
  const url = `http://localhost:${puerto}`;
  setTimeout(() => {
    if (os.platform() === 'win32') exec(`start ${url}`);
    else if (os.platform() === 'darwin') exec(`open ${url}`);
    else exec(`xdg-open ${url}`);
  }, 1500);
}

// ─── Verificación de base de datos con reintentos ───────────────────────────
async function verificarBaseDeDatos(intentos = 8, esperaMs = 3000): Promise<void> {
  for (let i = 1; i <= intentos; i++) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log('✅ Base de datos conectada correctamente.');
      return;
    } catch (err) {
      console.warn(`⚠️  Intento ${i}/${intentos} — Esperando que PostgreSQL inicie (${esperaMs / 1000}s)...`);
      if (i === intentos) {
        console.error('❌ No se pudo conectar a PostgreSQL después de varios intentos.');
        console.error('   Detalle:', (err as Error).message);
        process.exit(1);
      }
      await new Promise((res) => setTimeout(res, esperaMs));
    }
  }
}

// ─── Inicio del servidor ─────────────────────────────────────────────────────
async function iniciar() {
  console.log('');
  console.log('  ╔═══════════════════════════════╗');
  console.log('  ║       TECNO-LASER  v1.0       ║');
  console.log('  ╚═══════════════════════════════╝');
  console.log('');

  // ── Modo PostgreSQL Portable ─────────────────────────────────────────────

  if (postgresPortableDisponible()) {
    console.log('🗃️  Modo PostgreSQL Portable detectado.');
    const primeraVez = esInicializacionNueva();

    // Encender (e inicializar si es la primera vez)
    await encenderPostgresPortable();

    // Crear la base de datos "tecnolaser" si no existe
    await crearBaseDeDatos();

    // Si es primera vez: ejecutar migraciones de Prisma para crear tablas
    if (primeraVez) {
      console.log('⚙️  Configurando tablas de la base de datos (primera vez)...');
      try {
        const exeDir = path.dirname(process.execPath);
        const schemaPath = path.join(exeDir, 'schema.sql');
        const psqlPath = path.join(exeDir, 'pgsql', 'bin', 'psql.exe');
        const fs = require('fs');

        if (fs.existsSync(schemaPath) && fs.existsSync(psqlPath)) {
          const pushCmd = `"${psqlPath}" -U postgres -p ${getPgPort()} -d tecnolaser -f "${schemaPath}"`;
          execSync(pushCmd, {
            stdio: 'pipe',
            env: { ...process.env, PGPASSWORD: 'tecnolaser2026' },
          });
          console.log('✅ Tablas configuradas correctamente.');
        } else {
          console.warn('⚠️  schema.sql o psql.exe no encontrados. Las tablas deben existir o crearse manualmente.');
        }
      } catch (e: any) {
        console.warn('⚠️  No se pudo configurar las tablas:', e?.message?.split('\n')[0]);
      }
    }

    // Registrar apagado limpio al cerrar el proceso
    apagarPostgresAlCerrar();

    // Verificar conexión final con Prisma
    console.log('🔍 Verificando conexión a la base de datos...');
    await verificarBaseDeDatos(10, 2000);

  } else {
    // ── Modo PostgreSQL del Sistema (instalación estándar) ─────────────────
    console.log('🔍 Verificando base de datos...');
    await verificarBaseDeDatos();
  }

  app.listen(env.port, '0.0.0.0', () => {
    console.log('');
    console.log(`🚀 ¡Tecno-laser iniciado correctamente!`);
    console.log(`   ➜ Local:   http://localhost:${env.port}`);
    console.log(`   ➜ Red LAN: Ve a Configuración > Empresa para ver tu dirección de red`);
    console.log('');
    abrirNavegador(env.port);
    iniciarRespaldoAutomatico().catch((error) => console.error('No se pudo iniciar el respaldo automático:', error));
  });
}

iniciar();
