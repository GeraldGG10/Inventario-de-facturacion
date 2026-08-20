# Tecno-laser — Sistema de Inventario y Facturación

Aplicación de escritorio para gestión de inventario, facturación, panel de
control y administración. Corre como un único ejecutable (`Tecno-laser.exe`)
que expone la interfaz por red local, para que varias computadoras trabajen
sobre la misma base de datos simultáneamente. Ver
[docs/MANUAL_USUARIO.md](docs/MANUAL_USUARIO.md) para el manual completo,
incluyendo cómo funciona el acceso multiusuario en red.

Backend Node.js/Express/Prisma sobre PostgreSQL (portable, embebido en el
`.exe`); frontend React/Vite/Tailwind.

## Estructura

```
backend/    API (Express + Prisma + PostgreSQL)
frontend/   Interfaz web (React + Vite), servida por el propio backend
docs/       Manual de usuario y documentación
```

## Desarrollo

```bash
# Backend
cd backend
npm install
cp .env.example .env
npx prisma db push
npm run seed
npm run dev            # http://localhost:4000

# Frontend (en otra terminal)
cd frontend
npm install
npm run dev             # http://localhost:5173
```

Usuario de prueba tras el seed: `admin@facturacion.local` / `CambiarEsta123!`
(cámbiala después del primer inicio de sesión).

## Generar el ejecutable

```powershell
.\build_exe.ps1
```

Compila frontend y backend, descarga PostgreSQL portable (~300 MB, solo la
primera vez) y empaqueta todo con `pkg` en `Tecno-laser.exe`. El resultado
queda en `Tecno-laser_Distribuir/` — ver
[Tecnolaser_Reporte_Paquete.md](Tecnolaser_Reporte_Paquete.md) para el detalle
técnico del empaquetado y [Guia_Instalacion.md](Guia_Instalacion.md) para la
guía de instalación en la máquina principal.

Los datos quedan en `db_data/`, junto al ejecutable, en la PC donde corre
`Tecno-laser.exe`. El respaldo automático se configura desde
Configuración → Sistema.
