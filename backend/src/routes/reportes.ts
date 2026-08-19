import { Router } from 'express';
import { z } from 'zod';
import PDFDocument from 'pdfkit';
import { prisma } from '../config/prisma';
import { requireAuth } from '../middleware/requireAuth';
import { requirePermission } from '../middleware/requirePermission';

export const reportesRouter = Router();

reportesRouter.use(requireAuth, requirePermission('reportes.ver'));

const rangoSchema = z.object({
  periodo: z.enum(['hoy', 'semana', 'mes', 'anio', 'personalizado']).default('mes'),
  desde: z.string().datetime().optional(),
  hasta: z.string().datetime().optional(),
});

const PERIODOS_A_DIAS: Record<string, number> = { hoy: 1, semana: 7, mes: 30, anio: 365 };

function resolverRango(data: z.infer<typeof rangoSchema>): { desde: Date; hasta: Date } {
  if (data.periodo === 'personalizado' && data.desde && data.hasta) {
    return { desde: new Date(data.desde), hasta: new Date(data.hasta) };
  }
  const dias = PERIODOS_A_DIAS[data.periodo] ?? 30;
  return { desde: new Date(Date.now() - dias * 86_400_000), hasta: new Date() };
}

reportesRouter.get('/ventas', async (req, res) => {
  const parsed = rangoSchema.extend({
    agruparPor: z.enum(['producto', 'categoria', 'vendedor', 'metodoPago', 'fecha']).default('fecha'),
  }).safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { desde, hasta } = resolverRango(parsed.data);
  const facturas = await prisma.factura.findMany({
    where: { estado: { not: 'anulada' }, fecha: { gte: desde, lte: hasta } },
    include: {
      usuario: { select: { id: true, nombre: true } },
      detalles: { include: { producto: { select: { nombre: true, categoria: { select: { nombre: true } } } } } },
    },
  });

  const grupos = new Map<string, { etiqueta: string; ventas: number; unidades: number; facturas: number }>();

  function acumular(clave: string, etiqueta: string, ventas: number, unidades: number) {
    const actual = grupos.get(clave) ?? { etiqueta, ventas: 0, unidades: 0, facturas: 0 };
    actual.ventas += ventas;
    actual.unidades += unidades;
    grupos.set(clave, actual);
  }

  for (const factura of facturas) {
    if (parsed.data.agruparPor === 'metodoPago') {
      acumular(factura.metodoPago, factura.metodoPago, factura.total, 0);
    } else if (parsed.data.agruparPor === 'vendedor') {
      const etiqueta = factura.usuario?.nombre ?? 'Sin asignar';
      acumular(factura.usuarioId ?? 'sin_asignar', etiqueta, factura.total, 0);
    } else if (parsed.data.agruparPor === 'fecha') {
      const clave = factura.fecha.toISOString().slice(0, 10);
      acumular(clave, clave, factura.total, 0);
    } else {
      for (const detalle of factura.detalles) {
        const clave = parsed.data.agruparPor === 'categoria' ? detalle.producto.categoria?.nombre ?? 'Sin categoría' : detalle.producto.nombre;
        acumular(clave, clave, detalle.subtotal, detalle.cantidad);
      }
    }
  }

  res.json(
    Array.from(grupos.values())
      .map((g) => ({ ...g, ventas: Number(g.ventas.toFixed(2)) }))
      .sort((a, b) => b.ventas - a.ventas),
  );
});

reportesRouter.get('/inventario', async (_req, res) => {
  const productos = await prisma.producto.findMany({
    where: { activo: true },
    include: { movimientos: { orderBy: { fecha: 'desc' }, take: 1 }, categoria: true },
  });

  const detalles = await prisma.detalleFactura.groupBy({
    by: ['productoId'],
    _sum: { cantidad: true },
    where: { factura: { estado: { not: 'anulada' } } },
  });
  const unidadesVendidas = new Map(detalles.map((d) => [d.productoId, d._sum.cantidad ?? 0]));

  const inventarioActual = productos.map((p) => ({
    id: p.id,
    codigo: p.codigo,
    nombre: p.nombre,
    categoria: p.categoria?.nombre ?? null,
    stockActual: p.stockActual,
    stockMinimo: p.stockMinimo,
    unidadesVendidas: unidadesVendidas.get(p.id) ?? 0,
    ultimoMovimiento: p.movimientos[0]?.fecha ?? null,
  }));

  const agotados = inventarioActual.filter((p) => p.stockActual === 0);
  const stockBajo = inventarioActual.filter((p) => p.stockActual > 0 && p.stockActual <= p.stockMinimo);
  const sinMovimiento = inventarioActual.filter((p) => !p.ultimoMovimiento);
  const masVendidos = [...inventarioActual].sort((a, b) => b.unidadesVendidas - a.unidadesVendidas).slice(0, 10);
  const menosVendidos = [...inventarioActual].sort((a, b) => a.unidadesVendidas - b.unidadesVendidas).slice(0, 10);

  res.json({ inventarioActual, agotados, stockBajo, sinMovimiento, masVendidos, menosVendidos });
});

reportesRouter.get('/financiero', async (req, res) => {
  const parsed = rangoSchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { desde, hasta } = resolverRango(parsed.data);

  const facturas = await prisma.factura.findMany({
    where: { estado: { not: 'anulada' }, fecha: { gte: desde, lte: hasta } },
    include: { detalles: true },
  });

  let ingresos = 0;
  let costos = 0;
  let descuentos = 0;
  for (const factura of facturas) {
    ingresos += factura.subtotal;
    descuentos += factura.descuentoMonto;
    costos += factura.detalles.reduce((acc, d) => acc + d.costoUnitario * d.cantidad, 0);
  }
  const ganancias = ingresos - costos;

  res.json({
    periodo: parsed.data.periodo,
    ingresos: Number(ingresos.toFixed(2)),
    costos: Number(costos.toFixed(2)),
    ganancias: Number(ganancias.toFixed(2)),
    margen: ingresos > 0 ? Number(((ganancias / ingresos) * 100).toFixed(2)) : 0,
    descuentos: Number(descuentos.toFixed(2)),
  });
});

reportesRouter.get('/exportar', async (req, res) => {
  const formato = (req.query.formato as string) ?? 'pdf';
  const parsed = rangoSchema.safeParse(req.query);
  const { desde, hasta } = resolverRango(parsed.success ? parsed.data : { periodo: 'mes' });

  const [empresa, config, facturas] = await Promise.all([
    prisma.configuracionEmpresa.findUnique({ where: { id: 'default' } }),
    prisma.configuracionFacturacion.findUnique({ where: { id: 'default' } }),
    prisma.factura.findMany({
      where: { estado: { not: 'anulada' }, fecha: { gte: desde, lte: hasta } },
      include: { cliente: true },
      orderBy: { fecha: 'asc' },
    }),
  ]);

  const nombreEmpresa = empresa?.nombre && empresa.nombre !== 'Mi Empresa' ? empresa.nombre : 'Stocly';
  const moneda = config?.moneda ?? 'DOP';
  const serie = config?.serieFactura ?? 'FAC-';
  const money = (n: number) => `${moneda} ${n.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const totalGeneral = facturas.reduce((acc, f) => acc + f.total, 0);

  // ================= EXCEL (XLSX) =================
  if (formato === 'xlsx') {
    const ExcelJS = require('exceljs');
    const wb = new ExcelJS.Workbook();
    wb.creator = nombreEmpresa;
    wb.created = new Date();

    const ws = wb.addWorksheet('Reporte de Ventas');

    // Colores corporativos
    const COLOR_HEADER_BG = '1F2937';  // gris oscuro
    const COLOR_HEADER_FG = 'FFFFFF';  // blanco
    const COLOR_TOTAL_BG  = 'F3F4F6';  // gris claro
    const COLOR_ALT_ROW   = 'F9FAFB';  // fila alternada

    ws.columns = [
      { key: 'numero',     width: 18 },
      { key: 'fecha',      width: 22 },
      { key: 'cliente',    width: 32 },
      { key: 'metodoPago', width: 18 },
      { key: 'subtotal',   width: 18 },
      { key: 'impuesto',   width: 18 },
      { key: 'total',      width: 20 },
    ];

    // Fila 1: título empresa
    ws.mergeCells('A1:G1');
    const empresaCell = ws.getCell('A1');
    empresaCell.value = nombreEmpresa.toUpperCase();
    empresaCell.font = { bold: true, size: 16, color: { argb: COLOR_HEADER_BG } };
    empresaCell.alignment = { horizontal: 'center', vertical: 'middle' };
    ws.getRow(1).height = 30;

    // Fila 2: subtítulo
    ws.mergeCells('A2:G2');
    const subCell = ws.getCell('A2');
    subCell.value = `REPORTE DE VENTAS — Del ${desde.toLocaleDateString('es-DO')} al ${hasta.toLocaleDateString('es-DO')}`;
    subCell.font = { size: 10, italic: true, color: { argb: '6B7280' } };
    subCell.alignment = { horizontal: 'center', vertical: 'middle' };
    ws.getRow(2).height = 20;

    // Fila 3: vacía separadora
    ws.addRow([]);

    // Fila 4: encabezado de tabla
    const headerRow = ws.addRow(['No. Factura', 'Fecha', 'Cliente', 'Método de Pago', 'Subtotal', 'ITBIS', 'Total']);
    headerRow.height = 22;
    headerRow.eachCell((cell: any) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_HEADER_BG } };
      cell.font = { bold: true, color: { argb: COLOR_HEADER_FG }, size: 10 };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = { bottom: { style: 'thin', color: { argb: 'E5E7EB' } } };
    });

    // Filas de datos
    facturas.forEach((f, idx) => {
      const row = ws.addRow([
        `${serie}${String(f.id).padStart(6, '0')}`,
        f.fecha.toLocaleString('es-DO'),
        f.cliente.nombre,
        f.metodoPago,
        f.subtotal,
        f.impuestoMonto,
        f.total,
      ]);
      row.height = 18;
      // Fila alternada
      if (idx % 2 === 1) {
        row.eachCell((cell: any) => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_ALT_ROW } };
        });
      }
      // Formato moneda en columnas numéricas
      ['E', 'F', 'G'].forEach(col => {
        const cell = row.getCell(col);
        cell.numFmt = `"${moneda}" #,##0.00`;
        cell.alignment = { horizontal: 'right' };
      });
      row.getCell('A').font = { bold: true, color: { argb: '1D4ED8' } };
    });

    // Fila de total
    const totalRow = ws.addRow(['', '', '', 'TOTAL GENERAL', '', '', totalGeneral]);
    totalRow.height = 22;
    totalRow.eachCell((cell: any) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_TOTAL_BG } };
      cell.font = { bold: true, size: 11 };
    });
    totalRow.getCell('D').alignment = { horizontal: 'right' };
    totalRow.getCell('G').numFmt = `"${moneda}" #,##0.00`;
    totalRow.getCell('G').alignment = { horizontal: 'right' };

    // Bordes a toda la tabla
    const startRow = 4;
    const endRow = ws.rowCount;
    for (let r = startRow; r <= endRow; r++) {
      for (let c = 1; c <= 7; c++) {
        const cell = ws.getRow(r).getCell(c);
        cell.border = {
          top: { style: 'hair', color: { argb: 'E5E7EB' } },
          bottom: { style: 'hair', color: { argb: 'E5E7EB' } },
          left: { style: 'hair', color: { argb: 'E5E7EB' } },
          right: { style: 'hair', color: { argb: 'E5E7EB' } },
        };
      }
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="reporte-ventas-${new Date().toISOString().slice(0,10)}.xlsx"`);
    await wb.xlsx.write(res);
    return res.end();
  }

  // ================= PDF =================
  const primaryColor = '#1F2937';
  const secondaryColor = '#6B7280';
  const tableHeaderBg = '#E5E7EB';

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="reporte-ventas-${new Date().toISOString().slice(0,10)}.pdf"`);

  const doc = new PDFDocument({ size: 'A4', margin: 50, bufferPages: true });
  doc.pipe(res);

  // ENCABEZADO
  doc.font('Helvetica-Bold').fontSize(24).fillColor(primaryColor).text(nombreEmpresa, 50, 50);
  doc.font('Helvetica').fontSize(10).fillColor(secondaryColor);
  if (empresa?.rnc) doc.text(`RNC: ${empresa.rnc}`, 50, 80);
  if (empresa?.telefono) doc.text(`Tel: ${empresa.telefono}`, 50, 95);
  if (empresa?.correo) doc.text(empresa.correo, 50, 110);

  doc.font('Helvetica-Bold').fontSize(18).fillColor(primaryColor).text('REPORTE DE VENTAS', 300, 50, { width: 245, align: 'right' });
  doc.font('Helvetica').fontSize(10).fillColor(secondaryColor);
  doc.text(`Período: ${desde.toLocaleDateString('es-DO')} – ${hasta.toLocaleDateString('es-DO')}`, 300, 78, { width: 245, align: 'right' });
  doc.text(`Generado: ${new Date().toLocaleString('es-DO')}`, 300, 93, { width: 245, align: 'right' });
  doc.text(`Total registros: ${facturas.length}`, 300, 108, { width: 245, align: 'right' });

  // Línea separadora
  doc.moveTo(50, 135).lineTo(545, 135).lineWidth(1).strokeColor(tableHeaderBg).stroke();

  // RESUMEN FINANCIERO
  const ingresos = facturas.reduce((a, f) => a + f.subtotal, 0);
  const impuestos = facturas.reduce((a, f) => a + f.impuestoMonto, 0);

  const boxY = 150;
  const boxW = 145;
  const boxes = [
    { label: 'Subtotal Ventas', value: money(ingresos) },
    { label: 'Total ITBIS',     value: money(impuestos) },
    { label: 'Total General',   value: money(totalGeneral) },
  ];
  boxes.forEach((b, i) => {
    const bx = 50 + i * (boxW + 10);
    doc.rect(bx, boxY, boxW, 50).fillColor('#F9FAFB').fill();
    doc.font('Helvetica').fontSize(8).fillColor(secondaryColor).text(b.label.toUpperCase(), bx + 8, boxY + 8, { width: boxW - 16 });
    doc.font('Helvetica-Bold').fontSize(13).fillColor(primaryColor).text(b.value, bx + 8, boxY + 22, { width: boxW - 16 });
  });

  // TABLA DE FACTURAS
  const startY = 220;
  doc.rect(50, startY, 495, 22).fillColor(tableHeaderBg).fill();
  doc.font('Helvetica-Bold').fontSize(9).fillColor(primaryColor);
  doc.text('No. Factura', 55, startY + 7, { width: 80 });
  doc.text('Fecha', 140, startY + 7, { width: 90 });
  doc.text('Cliente', 235, startY + 7, { width: 140 });
  doc.text('Método', 378, startY + 7, { width: 60 });
  doc.text('Total', 445, startY + 7, { width: 95, align: 'right' });

  let y = startY + 30;
  doc.font('Helvetica').fontSize(9).fillColor(primaryColor);

  for (const f of facturas) {
    if (y > 740) {
      doc.addPage();
      y = 50;
      // Repetir encabezado de tabla
      doc.rect(50, y, 495, 22).fillColor(tableHeaderBg).fill();
      doc.font('Helvetica-Bold').fontSize(9).fillColor(primaryColor);
      doc.text('No. Factura', 55, y + 7, { width: 80 });
      doc.text('Fecha', 140, y + 7, { width: 90 });
      doc.text('Cliente', 235, y + 7, { width: 140 });
      doc.text('Método', 378, y + 7, { width: 60 });
      doc.text('Total', 445, y + 7, { width: 95, align: 'right' });
      doc.font('Helvetica').fontSize(9).fillColor(primaryColor);
      y += 30;
    }
    const numero = `${serie}${String(f.id).padStart(6, '0')}`;
    doc.fillColor('#1D4ED8').text(numero, 55, y, { width: 80 });
    doc.fillColor(primaryColor);
    doc.text(f.fecha.toLocaleDateString('es-DO'), 140, y, { width: 90 });
    doc.text(f.cliente.nombre, 235, y, { width: 138 });
    doc.text(f.metodoPago, 378, y, { width: 60 });
    doc.text(money(f.total), 445, y, { width: 95, align: 'right' });
    y += 16;
    doc.moveTo(50, y - 2).lineTo(545, y - 2).lineWidth(0.3).strokeColor('#F3F4F6').stroke();
  }

  // TOTAL FINAL
  y += 8;
  doc.rect(350, y - 4, 195, 26).fillColor('#F3F4F6').fill();
  doc.font('Helvetica-Bold').fontSize(11).fillColor(primaryColor);
  doc.text('TOTAL GENERAL:', 355, y + 2, { width: 100 });
  doc.text(money(totalGeneral), 445, y + 2, { width: 95, align: 'right' });

  // FOOTER
  const pages = doc.bufferedPageRange();
  for (let i = 0; i < pages.count; i++) {
    doc.switchToPage(i);
    doc.font('Helvetica').fontSize(8).fillColor('#9CA3AF');
    doc.text(
      `${nombreEmpresa} | Reporte de ventas generado el ${new Date().toLocaleString('es-DO')} | Página ${i + 1} de ${pages.count}`,
      50, 785, { align: 'center', width: 495 }
    );
  }

  doc.end();
});
