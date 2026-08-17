// Datos mock que siguen el contrato propuesto en docs/SCHEMA_DASHBOARD.md.
// Reemplazar por queries reales (Prisma) cuando Inventario/Facturación
// confirmen el schema — el ajuste debe quedar contenido en esta capa.

export interface ClienteMock {
  id: string;
  nombre: string;
}

export interface ProductoMock {
  id: string;
  nombre: string;
  costo: number;
  precio: number;
  stockActual: number;
  stockMinimo: number;
}

export interface DetalleFacturaMock {
  facturaId: string;
  productoId: string;
  cantidad: number;
  precioUnitario: number;
  costoUnitario: number;
}

export interface FacturaMock {
  id: string;
  clienteId: string;
  fecha: string; // ISO
  subtotal: number;
  impuestos: number;
  total: number;
  anulada: boolean;
}

export const clientesMock: ClienteMock[] = [
  { id: 'cli-1', nombre: 'Acme Corp.' },
  { id: 'cli-2', nombre: 'Tech Solutions SAC' },
  { id: 'cli-3', nombre: 'Global Imports' },
  { id: 'cli-4', nombre: 'Juan Pérez' },
  { id: 'cli-5', nombre: 'Design Studio SA' },
];

export const productosMock: ProductoMock[] = [
  { id: 'prod-1', nombre: 'Laptop Pro X15', costo: 850, precio: 1250, stockActual: 12, stockMinimo: 5 },
  { id: 'prod-2', nombre: 'Monitor UltraWide', costo: 220, precio: 340, stockActual: 8, stockMinimo: 10 },
  { id: 'prod-3', nombre: 'Teclado Mecánico', costo: 35, precio: 65, stockActual: 40, stockMinimo: 15 },
  { id: 'prod-4', nombre: 'Mouse Inalámbrico', costo: 12, precio: 25, stockActual: 60, stockMinimo: 20 },
  { id: 'prod-5', nombre: 'Cartuchos Tinta Negra HP', costo: 18, precio: 32, stockActual: 0, stockMinimo: 10 },
  { id: 'prod-6', nombre: 'Papel Bond A4 Resma', costo: 4, precio: 8, stockActual: 15, stockMinimo: 20 },
  { id: 'prod-7', nombre: 'Cable HDMI 2m', costo: 3, precio: 9, stockActual: 5, stockMinimo: 15 },
];

function diasAtras(dias: number): string {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() - dias);
  return fecha.toISOString();
}

export const facturasMock: FacturaMock[] = [
  { id: 'fac-2023-0891', clienteId: 'cli-1', fecha: diasAtras(0), subtotal: 1150, impuestos: 100, total: 1250, anulada: false },
  { id: 'fac-2023-0890', clienteId: 'cli-2', fecha: diasAtras(0), subtotal: 313, impuestos: 27.5, total: 340.5, anulada: false },
  { id: 'fac-2023-0889', clienteId: 'cli-3', fecha: diasAtras(1), subtotal: 4700, impuestos: 400, total: 5100, anulada: false },
  { id: 'fac-2023-0888', clienteId: 'cli-4', fecha: diasAtras(1), subtotal: 78, impuestos: 7, total: 85, anulada: false },
  { id: 'fac-2023-0887', clienteId: 'cli-5', fecha: diasAtras(3), subtotal: 820, impuestos: 70, total: 890, anulada: true },
  { id: 'fac-2023-0886', clienteId: 'cli-1', fecha: diasAtras(6), subtotal: 640, impuestos: 55, total: 695, anulada: false },
  { id: 'fac-2023-0885', clienteId: 'cli-2', fecha: diasAtras(10), subtotal: 260, impuestos: 22, total: 282, anulada: false },
  { id: 'fac-2023-0884', clienteId: 'cli-3', fecha: diasAtras(20), subtotal: 1980, impuestos: 170, total: 2150, anulada: false },
];

export const detalleFacturaMock: DetalleFacturaMock[] = [
  { facturaId: 'fac-2023-0891', productoId: 'prod-1', cantidad: 1, precioUnitario: 1250, costoUnitario: 850 },
  { facturaId: 'fac-2023-0890', productoId: 'prod-3', cantidad: 2, precioUnitario: 65, costoUnitario: 35 },
  { facturaId: 'fac-2023-0890', productoId: 'prod-4', cantidad: 8, precioUnitario: 25, costoUnitario: 12 },
  { facturaId: 'fac-2023-0889', productoId: 'prod-1', cantidad: 4, precioUnitario: 1250, costoUnitario: 850 },
  { facturaId: 'fac-2023-0888', productoId: 'prod-4', cantidad: 3, precioUnitario: 25, costoUnitario: 12 },
  { facturaId: 'fac-2023-0887', productoId: 'prod-2', cantidad: 2, precioUnitario: 340, costoUnitario: 220 },
  { facturaId: 'fac-2023-0886', productoId: 'prod-2', cantidad: 1, precioUnitario: 340, costoUnitario: 220 },
  { facturaId: 'fac-2023-0886', productoId: 'prod-3', cantidad: 4, precioUnitario: 65, costoUnitario: 35 },
  { facturaId: 'fac-2023-0885', productoId: 'prod-4', cantidad: 10, precioUnitario: 25, costoUnitario: 12 },
  { facturaId: 'fac-2023-0884', productoId: 'prod-1', cantidad: 1, precioUnitario: 1250, costoUnitario: 850 },
  { facturaId: 'fac-2023-0884', productoId: 'prod-2', cantidad: 2, precioUnitario: 340, costoUnitario: 220 },
];
