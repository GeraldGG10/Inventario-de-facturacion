# Contrato de datos propuesto — Módulo Dashboard

> Este documento propone los campos mínimos que el Dashboard necesita leer de las tablas de Inventario y Facturación. No es definitivo: es la base para validar con el equipo de esos módulos antes de que el schema de Prisma quede cerrado.

## `facturas`
| Campo | Tipo | Uso en Dashboard |
|---|---|---|
| `id` | int/uuid | referencia |
| `cliente_id` | FK | top clientes por volumen |
| `fecha` | datetime | resumen por período, tendencia |
| `subtotal` | decimal | ingresos |
| `impuestos` | decimal | ingresos |
| `total` | decimal | resumen de ventas |
| `anulada` | boolean | excluir de métricas si es `true` |

## `detalle_factura`
| Campo | Tipo | Uso en Dashboard |
|---|---|---|
| `factura_id` | FK | agrupación |
| `producto_id` | FK | rotación de productos |
| `cantidad` | int | rotación, ingresos por producto |
| `precio_unitario` | decimal | ingresos, margen |
| `costo_unitario` | decimal | **necesario** para calcular margen — confirmar si vive aquí o en `productos` |

## `productos`
| Campo | Tipo | Uso en Dashboard |
|---|---|---|
| `id` | int/uuid | referencia |
| `nombre` | string | display |
| `costo` | decimal | margen (si no está en detalle_factura) |
| `precio` | decimal | margen |
| `stock_actual` | int | reposición |
| `stock_minimo` | int | reposición |

## `movimientos_inventario` (opcional para dashboard, útil si se quiere histórico de stock)
| Campo | Tipo | Uso en Dashboard |
|---|---|---|
| `producto_id` | FK | reposición histórica |
| `tipo` | enum (entrada/salida/ajuste) | — |
| `cantidad` | int | — |
| `fecha` | datetime | — |

## `clientes`
| Campo | Tipo | Uso en Dashboard |
|---|---|---|
| `id` | int/uuid | referencia |
| `nombre` | string | top clientes |

---

## Preguntas abiertas para el equipo de Inventario/Facturación
1. ¿`costo_unitario` se guarda en `detalle_factura` (snapshot al momento de la venta) o se calcula siempre desde `productos.costo` actual? Esto afecta si el margen histórico es exacto o aproximado.
2. ¿Las facturas anuladas se marcan con un campo `anulada`/`estado`, o se eliminan/mueven a otra tabla?
3. ¿`stock_minimo` es fijo por producto o configurable por sucursal (si en el futuro hay multi-sucursal)?

## Mientras se confirma
El Dashboard se construye contra estos nombres de campo usando datos mock (mismo formato que ya usa el frontend con chart.js). Si al validar cambian nombres o tipos, el ajuste es solo en la capa de queries, no en la lógica de agregación ni en el frontend.
