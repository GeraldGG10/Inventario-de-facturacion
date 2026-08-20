#Requires -Version 5.1
<#
.SYNOPSIS
    Script de construccion de Tecno-laser.exe (con PostgreSQL Portable)
.DESCRIPTION
    1. Compila el frontend (React) y el backend (Express+Prisma).
    2. Descarga PostgreSQL Portable para Windows (binarios sin instalacion).
    3. Empaqueta todo en un unico ejecutable Tecno-laser.exe con 'pkg'.
    
    RESULTADO FINAL (carpeta Tecno-laser_Distribuir/):
      Tecno-laser.exe              <- el ejecutable principal
      pgsql/                   <- motor de PostgreSQL portable
      .env                     <- variables de entorno
      *.node                   <- motor de Prisma

    REQUISITOS PREVIOS:
      - Node.js 18+ instalado
      - npm disponible en PATH
      - Conexion a Internet (para descargar PostgreSQL Portable la primera vez)
      - Ejecutar desde la raiz del proyecto
#>

$ErrorActionPreference = "Stop"
$RootDir = Split-Path -Parent $MyInvocation.MyCommand.Path

function Write-Step($n, $msg) {
    Write-Host ""
    Write-Host "[$n] $msg" -ForegroundColor Cyan
    Write-Host ("-" * 55) -ForegroundColor DarkGray
}

# ──────────────────────────────────────────────────────────────
Write-Step 1 "Construyendo Frontend (React)..."
Set-Location "$RootDir\frontend"
npm install --silent
npm run build
if ($LASTEXITCODE -ne 0) { throw "Error al compilar el frontend" }

# ──────────────────────────────────────────────────────────────
Write-Step 2 "Construyendo Backend (TypeScript a JavaScript)..."
Set-Location "$RootDir\backend"
npm install --silent
npm run build
if ($LASTEXITCODE -ne 0) { throw "Error al compilar el backend" }

# ──────────────────────────────────────────────────────────────
Write-Step 3 "Descargando PostgreSQL Portable para Windows..."
Set-Location $RootDir

$PgsqlDir = "$RootDir\pgsql"
$PgsqlZip = "$RootDir\pgsql_portable.zip"

# URL de PostgreSQL 16 portable (zip) para Windows x64
# Fuente oficial: https://www.enterprisedb.com/download-postgresql-binaries
$PgsqlUrl = "https://get.enterprisedb.com/postgresql/postgresql-16.4-1-windows-x64-binaries.zip"

if (-Not (Test-Path "$PgsqlDir\bin\pg_ctl.exe")) {
    Write-Host "  Descargando PostgreSQL 16 portable (~300 MB)..." -ForegroundColor Yellow
    Write-Host "  Esto solo ocurre una vez al construir el proyecto." -ForegroundColor Gray
    
    # Descargar con progreso
    $ProgressPreference = 'SilentlyContinue'
    Invoke-WebRequest -Uri $PgsqlUrl -OutFile $PgsqlZip -UseBasicParsing
    $ProgressPreference = 'Continue'
    
    Write-Host "  Extrayendo binarios (puede tomar 2-5 minutos)..." -ForegroundColor Yellow
    # Usar .NET ZipFile directamente — 10x más rápido que Expand-Archive
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    [System.IO.Compression.ZipFile]::ExtractToDirectory($PgsqlZip, $RootDir)
    
    # La carpeta extraída se llama "pgsql"
    if (-Not (Test-Path $PgsqlDir)) {
        throw "No se pudo extraer PostgreSQL. Revisa que el ZIP no esté corrupto."
    }
    
    # Limpiar ZIP descargado
    Remove-Item $PgsqlZip -Force
    Write-Host "  PostgreSQL Portable listo en: $PgsqlDir" -ForegroundColor Green
}
else {
    Write-Host "  PostgreSQL Portable ya existe, saltando descarga." -ForegroundColor Gray
}

# ──────────────────────────────────────────────────────────────
Write-Step 4 "Instalando pkg globalmente..."
npm install -g pkg --silent

# ──────────────────────────────────────────────────────────────
Write-Step 5 "Generando Tecno-laser.exe..."
Set-Location "$RootDir\backend"

pkg dist/index.js `
    --target node16-win-x64 `
    --output "$RootDir\Tecno-laser.exe" `
    --public
if ($LASTEXITCODE -ne 0) { throw "Error al generar el ejecutable con pkg" }

# ──────────────────────────────────────────────────────────────
Write-Step 6 "Armando carpeta de distribucion..."
Set-Location $RootDir

$DistDir = "$RootDir\Tecno-laser_Distribuir"
if (Test-Path $DistDir) { Remove-Item $DistDir -Recurse -Force }
New-Item -ItemType Directory -Path $DistDir | Out-Null

# Copiar .exe principal
Copy-Item "$RootDir\Tecno-laser.exe" -Destination $DistDir -Force

# Copiar carpeta pgsql (PostgreSQL Portable)
Write-Host "  Copiando PostgreSQL Portable (~300 MB, puede tardar)..." -ForegroundColor Yellow
Copy-Item $PgsqlDir -Destination $DistDir -Recurse -Force
Write-Host "  Copiado: pgsql/" -ForegroundColor Gray

# Copiar frontend compilado como frontend_dist (accesible en modo exe)
Copy-Item "$RootDir\frontend\dist" -Destination "$DistDir\frontend_dist" -Recurse -Force
Write-Host "  Copiado: frontend_dist/" -ForegroundColor Gray

# Copiar motor de Prisma (.node)
$queryEngines = Get-ChildItem "backend\node_modules\.prisma\client" -Filter "*.node" -ErrorAction SilentlyContinue
foreach ($qe in $queryEngines) {
    Copy-Item $qe.FullName -Destination $DistDir -Force
    Write-Host "  Copiado: $($qe.Name)" -ForegroundColor Gray
}

# Copiar init.sql para crear tablas e insertar admin/default data en la primera ejecución
if (Test-Path "backend\prisma\schema_seed.sql") {
    Copy-Item "backend\prisma\schema_seed.sql" -Destination "$DistDir\schema.sql" -Force
    Write-Host "  Copiado: schema.sql (con seed data)" -ForegroundColor Gray
}

# Copiar .env
if (Test-Path "backend\.env") {
    Copy-Item "backend\.env" -Destination $DistDir -Force
    Write-Host "  Copiado: .env" -ForegroundColor Gray
}

# ──────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host "  OK  Tecno-laser.exe generado exitosamente!"                    -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
Write-Host ""
Write-Host "PARA DISTRIBUIR, entrega la carpeta completa:" -ForegroundColor Yellow
Write-Host "  $DistDir" -ForegroundColor White
Write-Host ""
Write-Host "Contenido de la carpeta de distribución:" -ForegroundColor Yellow
Write-Host "  Tecno-laser.exe     <- doble clic para ejecutar" -ForegroundColor White
Write-Host "  pgsql/          <- motor de DB (NO eliminar)" -ForegroundColor White
Write-Host "  .env            <- configuracion del sistema" -ForegroundColor White
Write-Host "  *.node          <- motor de Prisma" -ForegroundColor White
Write-Host ""
Write-Host "Al hacer doble clic en Tecno-laser.exe (ZERO CONFIG):" -ForegroundColor Yellow
Write-Host "  1a vez: Inicializa PostgreSQL + crea tablas automaticamente" -ForegroundColor White
Write-Host "  Siempre: Enciende la DB, verifica conexion y abre el navegador" -ForegroundColor White
Write-Host "  Al cerrar: Apaga la DB de forma segura (sin corrupcion de datos)" -ForegroundColor White
Write-Host ""
