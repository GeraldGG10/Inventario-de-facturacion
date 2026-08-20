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

    IMPORTANTE: backend/prisma/schema_seed.sql es un dump estatico (schema +
    datos semilla) que se copia tal cual dentro del .exe para el primer
    arranque. NO se regenera solo. Si cambia backend/prisma/schema.prisma,
    hay que regenerarlo a mano contra una base ya migrada y sembrada:
      npx prisma db push && npx prisma db seed
      pg_dump -h localhost -p 5432 -U postgres -d tecnolaser --no-owner --no-privileges -f backend/prisma/schema_seed.sql
    Si este archivo queda desactualizado (o vacio), el primer arranque del
    .exe no crea las tablas y la app no funciona aunque "parezca" arrancar bien.
#>

# "Stop" convertía CUALQUIER escritura a stderr de un comando nativo (npm,
# vite, tsc, pkg) en un error fatal que abortaba el script entero, incluso
# cuando el comando en si habia terminado con exito (ej. el aviso normal de
# vite sobre el tamano de un chunk). Los pasos criticos ya verifican
# $LASTEXITCODE explicitamente mas abajo, asi que "Continue" es seguro aqui;
# los cmdlets que si deben frenar el script en caso de error (descargas,
# copias) usan -ErrorAction Stop de forma explicita.
$ErrorActionPreference = "Continue"
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
    Invoke-WebRequest -Uri $PgsqlUrl -OutFile $PgsqlZip -UseBasicParsing -ErrorAction Stop
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
# El 'pkg' original (vercel/pkg) esta discontinuado desde 2021 y no maneja
# bien el campo "exports" de package.json modernos (crashea con un
# AssertionError interno en su Walker). @yao-pkg/pkg es un fork mantenido
# que corrige esto — mismo CLI, drop-in replacement. Tambien: node16 ya no
# tiene binario precompilado en el fork (fuerza compilar desde codigo
# fuente, lo cual falla en Windows por falta de la utilidad 'patch'), asi
# que usamos node22, que si esta precompilado.
Write-Step 4 "Instalando @yao-pkg/pkg (fork mantenido) globalmente..."
npm uninstall -g pkg --silent 2>$null
npm install -g "@yao-pkg/pkg" --silent

# Resolver la ruta real del binario de pkg en lugar de depender de que la
# carpeta global de npm este en el PATH de quien ejecute este script (no
# siempre lo esta, aunque "npm install -g" haya funcionado bien).
$NpmPrefix = npm config get prefix
$PkgCmd = Join-Path $NpmPrefix "pkg.cmd"
if (-Not (Test-Path $PkgCmd)) {
    throw "No se encontro pkg.cmd en '$NpmPrefix'. Revisa que 'npm install -g @yao-pkg/pkg' haya terminado sin errores."
}

# Parchear es-get-iterator: su package.json trae un campo "exports" que
# pkg no resuelve bien sin importar el target ni las versiones (crashea
# el Walker interno). Como esta paqueteado como "asset" (no "script") en
# el pkg config de backend/package.json, alcanza con quitarle el campo
# "exports" para que la resolucion caiga de nuevo a "main". Esto se repite
# en cada build porque "npm install" restaura el package.json original
# cada vez.
Write-Host "  Parcheando es-get-iterator para compatibilidad con pkg..." -ForegroundColor Gray
$EsGetIteratorPkg = "$RootDir\backend\node_modules\es-get-iterator\package.json"
if (Test-Path $EsGetIteratorPkg) {
    $json = Get-Content $EsGetIteratorPkg -Raw | ConvertFrom-Json
    if ($json.PSObject.Properties.Name -contains 'exports') {
        $json.PSObject.Properties.Remove('exports')
        # OJO: Set-Content -Encoding UTF8 en PowerShell 5.1 escribe BOM, y un
        # BOM al inicio de este JSON tambien hace crashear al Walker de pkg.
        # Hay que escribir el archivo sin BOM explicitamente.
        $utf8NoBom = New-Object System.Text.UTF8Encoding $false
        [System.IO.File]::WriteAllText($EsGetIteratorPkg, ($json | ConvertTo-Json -Depth 10), $utf8NoBom)
    }
}

# ──────────────────────────────────────────────────────────────
Write-Step 5 "Generando Tecno-laser.exe..."
Set-Location "$RootDir\backend"

& $PkgCmd dist/index.js `
    --target node22-win-x64 `
    --output "$RootDir\Tecno-laser.exe" `
    --public
if ($LASTEXITCODE -ne 0) { throw "Error al generar el ejecutable con pkg" }

# ──────────────────────────────────────────────────────────────
Write-Step 6 "Armando carpeta de distribucion..."
Set-Location $RootDir

$DistDir = "$RootDir\Tecno-laser_Distribuir"
if (Test-Path $DistDir) { Remove-Item $DistDir -Recurse -Force -ErrorAction Stop }
New-Item -ItemType Directory -Path $DistDir -ErrorAction Stop | Out-Null

# Copiar .exe principal
Copy-Item "$RootDir\Tecno-laser.exe" -Destination $DistDir -Force -ErrorAction Stop

# Copiar carpeta pgsql (PostgreSQL Portable)
Write-Host "  Copiando PostgreSQL Portable (~300 MB, puede tardar)..." -ForegroundColor Yellow
Copy-Item $PgsqlDir -Destination $DistDir -Recurse -Force -ErrorAction Stop
Write-Host "  Copiado: pgsql/" -ForegroundColor Gray

# Copiar frontend compilado como frontend_dist (accesible en modo exe)
Copy-Item "$RootDir\frontend\dist" -Destination "$DistDir\frontend_dist" -Recurse -Force -ErrorAction Stop
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
