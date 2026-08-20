const { app, BrowserWindow, dialog } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const kill = require('tree-kill');

const PORT = 4000;
const isPackaged = app.isPackaged;

// En desarrollo, backend/ y frontend/ viven junto a app/. Empaquetado, todo
// vive dentro de resources/ (ver la sección "files" de package.json).
const backendDir = isPackaged
  ? path.join(process.resourcesPath, 'backend')
  : path.join(__dirname, '../backend');
const frontendIndex = isPackaged
  ? path.join(process.resourcesPath, 'frontend', 'index.html')
  : path.join(__dirname, '../frontend/dist/index.html');

const dbPath = path.join(app.getPath('userData'), 'inventario.db');
const backendEnv = {
  ...process.env,
  DATABASE_URL: `file:${dbPath}`,
  PORT: String(PORT),
  JWT_ACCESS_SECRET: 'tecnolaser-local-access-secret',
  JWT_REFRESH_SECRET: 'tecnolaser-local-refresh-secret',
};

let mainWindow;
let backendProcess;

function runNodeScript(scriptRelativePath, args, env) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [scriptRelativePath, ...args], {
      cwd: backendDir,
      env: { ...env, ELECTRON_RUN_AS_NODE: '1' },
      stdio: 'inherit',
    });
    child.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`${scriptRelativePath} salió con código ${code}`))));
    child.on('error', reject);
  });
}

async function prepararBaseDeDatos() {
  const prismaCli = path.join(backendDir, 'node_modules', 'prisma', 'build', 'index.js');
  await runNodeScript(prismaCli, ['migrate', 'deploy'], backendEnv);

  // El seed es idempotente (usa upsert / busca-antes-de-crear), así que
  // correrlo en cada arranque solo garantiza roles/permisos/usuario admin,
  // nunca duplica datos.
  const seedScript = path.join(backendDir, 'dist', 'prisma', 'seed.js');
  if (fs.existsSync(seedScript)) {
    await runNodeScript(seedScript, [], backendEnv);
  }
}

function iniciarBackend() {
  const serverEntry = path.join(backendDir, 'dist', 'index.js');
  backendProcess = spawn(process.execPath, [serverEntry], {
    cwd: backendDir,
    env: { ...backendEnv, ELECTRON_RUN_AS_NODE: '1' },
  });

  backendProcess.stdout.on('data', (data) => console.log(`[backend] ${data}`));
  backendProcess.stderr.on('data', (data) => console.error(`[backend] ${data}`));
}

function esperarBackendListo(intentos = 40) {
  return new Promise((resolve, reject) => {
    const intentar = (restantes) => {
      fetch(`http://localhost:${PORT}/health`)
        .then(() => resolve())
        .catch(() => {
          if (restantes <= 0) return reject(new Error('El backend no respondió a tiempo'));
          setTimeout(() => intentar(restantes - 1), 250);
        });
    };
    intentar(intentos);
  });
}

function crearVentana() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    title: 'Tecno-laser — Inventario y Facturación',
    icon: path.join(__dirname, 'assets', process.platform === 'win32' ? 'icon.ico' : 'icon.png'),
    show: false,
  });

  mainWindow.loadFile(frontendIndex);
  mainWindow.once('ready-to-show', () => mainWindow.show());
  mainWindow.on('closed', () => { mainWindow = null; });
}

app.whenReady().then(async () => {
  try {
    await prepararBaseDeDatos();
    iniciarBackend();
    await esperarBackendListo();
    crearVentana();
  } catch (error) {
    console.error(error);
    dialog.showErrorBox('Error al iniciar', `No se pudo iniciar el sistema:\n${error.message}`);
    app.quit();
  }
});

app.on('window-all-closed', () => {
  if (backendProcess) kill(backendProcess.pid);
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  if (backendProcess) kill(backendProcess.pid);
});
