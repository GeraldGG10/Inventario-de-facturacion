# Sistema de Inventario y Facturación

Aplicación de escritorio (Electron) para gestión de inventario, facturación,
panel de control y administración. Backend Node.js/Express/Prisma sobre
SQLite; frontend React/Vite/Tailwind.

## Estructura

```
backend/    API (Express + Prisma + SQLite)
frontend/   Interfaz web (React + Vite), empaquetada dentro de la app
app/        Empaquetado de escritorio (Electron)
```

## Desarrollo

```bash
# Backend
cd backend
npm install
cp .env.example .env
npx prisma migrate dev
npm run dev            # http://localhost:4000

# Frontend (en otra terminal)
cd frontend
npm install
npm run dev             # http://localhost:5173
```

Usuario de prueba tras el seed: `admin@facturacion.local` / `CambiarEsta123!`
(cámbiala después del primer inicio de sesión).

## Generar el instalador de escritorio

```bash
cd backend && npm install && npm run build
cd ../frontend && npm install && npm run build
cd ../app && npm install && npm run build
```

El instalador queda en `app/dist-electron/`. Los datos del usuario final se
guardan como archivo SQLite en su carpeta de datos de aplicación (fuera de la
carpeta de instalación), y el respaldo automático se configura desde
Configuración → Auditoría/Sistema.
