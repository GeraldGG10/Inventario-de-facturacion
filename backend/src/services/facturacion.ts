import PDFDocument from 'pdfkit';
import { Response } from 'express';
import { prisma } from '../config/prisma';

export function formatearNumeroFactura(serie: string, id: number): string {
  return `${serie}${String(id).padStart(6, '0')}`;
}

type FacturaConDetalle = NonNullable<Awaited<ReturnType<typeof obtenerFacturaCompleta>>>;

export async function obtenerFacturaCompleta(id: number) {
  return prisma.factura.findUnique({
    where: { id },
    include: {
      cliente: true,
      usuario: { select: { id: true, nombre: true } },
      detalles: { include: { producto: { select: { id: true, nombre: true, codigo: true } } } },
    },
  });
}

export async function generarPdfFactura(factura: FacturaConDetalle, res: Response) {
  const [empresa, config] = await Promise.all([
    prisma.configuracionEmpresa.findUnique({ where: { id: 'default' } }),
    prisma.configuracionFacturacion.findUnique({ where: { id: 'default' } }),
  ]);

  const numero   = formatearNumeroFactura(config?.serieFactura ?? 'FAC-', factura.id);
  const moneda   = config?.moneda ?? 'DOP';
  const money    = (n: number) => `${moneda} ${n.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const nombreEmpresa = empresa?.nombre && empresa.nombre !== 'Mi Empresa' ? empresa.nombre : 'Stocly';

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${numero}.pdf"`);

  const doc = new PDFDocument({ size: 'A4', margin: 0, bufferPages: true });
  doc.pipe(res);

  // ================================================================
  // PALETA CORPORATIVA
  // ================================================================
  const C_DARK    = '#111827'; // casi negro
  const C_MID     = '#374151'; // gris oscuro
  const C_LIGHT   = '#6B7280'; // gris medio
  const C_BORDER  = '#E5E7EB'; // borde
  const C_BG      = '#F9FAFB'; // fondo filas alternas
  const C_ACCENT  = '#1D4ED8'; // azul corporativo (NO. factura)
  const C_GREEN   = '#16A34A'; // estado pagada
  const C_RED     = '#DC2626'; // anulada

  // Márgenes internos
  const ML = 50;  // margin left
  const MR = 545; // margin right (595 - 50)
  const CW = 495; // content width

  // ================================================================
  // BANDA SUPERIOR DE COLOR
  // ================================================================
  doc.rect(0, 0, 595, 8).fillColor(C_ACCENT).fill();

  // ================================================================
  // BLOQUE EMPRESA (izquierda) — y fija, sin flujo automático
  // ================================================================
  let eY = 28;
  doc.font('Helvetica-Bold').fontSize(26).fillColor(C_DARK)
     .text(nombreEmpresa, ML, eY, { lineBreak: false });

  eY += 36;
  doc.font('Helvetica').fontSize(9).fillColor(C_LIGHT);
  if (empresa?.rnc)       { doc.text(`RNC: ${empresa.rnc}`,      ML, eY, { lineBreak: false }); eY += 13; }
  if (empresa?.direccion) { doc.text(empresa.direccion,          ML, eY, { lineBreak: false, width: 250 }); eY += 13; }
  if (empresa?.telefono)  { doc.text(`Tel: ${empresa.telefono}`, ML, eY, { lineBreak: false }); eY += 13; }
  if (empresa?.correo)    { doc.text(empresa.correo,             ML, eY, { lineBreak: false }); eY += 13; }

  // ================================================================
  // BLOQUE FACTURA (derecha) — columna derecha completamente aislada
  // ================================================================
  const RX = 370; // inicio columna derecha
  const RW = 175; // ancho columna derecha

  // Título "FACTURA"
  doc.font('Helvetica-Bold').fontSize(26).fillColor(C_DARK)
     .text('FACTURA', RX, 28, { width: RW, align: 'right', lineBreak: false });

  // Helper: dibuja una fila label | valor en la columna derecha
  function rightRow(label: string, value: string, y: number, valueColor = C_DARK) {
    doc.font('Helvetica').fontSize(9).fillColor(C_LIGHT)
       .text(label, RX, y, { width: 75, align: 'left', lineBreak: false });
    doc.font('Helvetica-Bold').fontSize(9).fillColor(valueColor)
       .text(value, RX + 75, y, { width: RW - 75, align: 'right', lineBreak: false });
  }

  let rY = 68;
  rightRow('No.:', numero, rY, C_ACCENT); rY += 14;
  rightRow('Fecha:', factura.fecha.toLocaleDateString('es-DO'), rY); rY += 14;

  if (factura.estado === 'anulada') {
    rightRow('Estado:', 'ANULADA', rY, C_RED);
  } else {
    rightRow('Estado:', 'PAGADA', rY, C_GREEN);
  }
  rY += 14;

  // Método de pago
  const metodoLabel: Record<string, string> = {
    efectivo: 'Efectivo',
    tarjeta: 'Tarjeta',
    transferencia: 'Transferencia',
    mixto: 'Mixto',
  };
  rightRow('Pago:', metodoLabel[factura.metodoPago] ?? factura.metodoPago, rY); rY += 14;

  if (factura.metodoPago === 'transferencia' || factura.metodoPago === 'mixto') {
    rightRow('Ref. Banco:', factura.referenciaTransferencia ?? 'N/A', rY); rY += 14;
  }
  if (factura.metodoPago === 'mixto') {
    rightRow('Efectivo:', money(factura.montoEfectivo ?? 0), rY); rY += 14;
    rightRow('Transf.:', money(factura.montoTransferencia ?? 0), rY); rY += 14;
  }
  if (factura.usuario?.nombre) {
    rightRow('Atendido por:', factura.usuario.nombre, rY); rY += 14;
  }

  // ================================================================
  // LÍNEA SEPARADORA
  // ================================================================
  const sepY = Math.max(eY, rY) + 14;
  doc.moveTo(ML, sepY).lineTo(MR, sepY).lineWidth(1).strokeColor(C_BORDER).stroke();

  // ================================================================
  // BLOQUE CLIENTE
  // ================================================================
  let cliY = sepY + 16;

  // Etiqueta pequeña en mayúsculas
  doc.font('Helvetica-Bold').fontSize(8).fillColor(C_LIGHT)
     .text('FACTURADO A', ML, cliY); cliY += 14;

  doc.font('Helvetica-Bold').fontSize(12).fillColor(C_DARK)
     .text(factura.cliente.nombre, ML, cliY, { width: 280, lineBreak: false }); cliY += 16;

  doc.font('Helvetica').fontSize(9).fillColor(C_LIGHT);
  if (factura.cliente.documento) { doc.text(`Cédula / RNC: ${factura.cliente.documento}`, ML, cliY, { lineBreak: false }); cliY += 13; }
  if (factura.cliente.telefono)  { doc.text(`Tel: ${factura.cliente.telefono}`,            ML, cliY, { lineBreak: false }); cliY += 13; }
  if (factura.cliente.correo)    { doc.text(factura.cliente.correo,                        ML, cliY, { lineBreak: false }); cliY += 13; }
  if (factura.cliente.direccion) { doc.text(factura.cliente.direccion,                     ML, cliY, { lineBreak: false, width: 280 }); cliY += 13; }

  // ================================================================
  // TABLA DE PRODUCTOS
  // ================================================================
  const tableStartY = cliY + 20;
  const COL = { desc: ML, cant: 320, precio: 390, sub: 460 };
  const COLW = { desc: 250, cant: 60, precio: 65, sub: 85 };

  // Encabezado de tabla
  doc.rect(ML, tableStartY, CW, 22).fillColor('#1F2937').fill();
  doc.font('Helvetica-Bold').fontSize(9).fillColor('#FFFFFF');
  doc.text('Descripción',     COL.desc  + 8, tableStartY + 7, { width: COLW.desc  - 8,  lineBreak: false });
  doc.text('Cant.',           COL.cant,      tableStartY + 7, { width: COLW.cant,  align: 'center', lineBreak: false });
  doc.text('P. Unitario',     COL.precio,    tableStartY + 7, { width: COLW.precio, align: 'right',  lineBreak: false });
  doc.text('Subtotal',        COL.sub,       tableStartY + 7, { width: COLW.sub,    align: 'right',  lineBreak: false });

  let ty = tableStartY + 22;

  for (let i = 0; i < factura.detalles.length; i++) {
    const det = factura.detalles[i];

    // Paginación
    if (ty > 720) {
      doc.addPage();
      ty = 30;
      // reprint header
      doc.rect(ML, ty, CW, 22).fillColor('#1F2937').fill();
      doc.font('Helvetica-Bold').fontSize(9).fillColor('#FFFFFF');
      doc.text('Descripción', COL.desc + 8, ty + 7, { width: COLW.desc - 8,  lineBreak: false });
      doc.text('Cant.',       COL.cant,     ty + 7,  { width: COLW.cant,  align: 'center', lineBreak: false });
      doc.text('P. Unitario', COL.precio,   ty + 7,  { width: COLW.precio, align: 'right',  lineBreak: false });
      doc.text('Subtotal',    COL.sub,      ty + 7,  { width: COLW.sub,    align: 'right',  lineBreak: false });
      ty += 22;
    }

    const rowH = 20;
    // Fila alternada
    if (i % 2 === 1) {
      doc.rect(ML, ty, CW, rowH).fillColor(C_BG).fill();
    }

    doc.font('Helvetica').fontSize(9).fillColor(C_DARK);
    doc.text(det.producto.nombre,          COL.desc  + 8, ty + 6, { width: COLW.desc - 8,  lineBreak: false });
    doc.text(String(det.cantidad),         COL.cant,      ty + 6,  { width: COLW.cant,  align: 'center', lineBreak: false });
    doc.text(money(det.precioUnitario),    COL.precio,    ty + 6,  { width: COLW.precio, align: 'right',  lineBreak: false });
    doc.text(money(det.subtotal),          COL.sub,       ty + 6,  { width: COLW.sub,    align: 'right',  lineBreak: false });

    ty += rowH;

    // línea divisora debajo de cada fila
    doc.moveTo(ML, ty).lineTo(MR, ty).lineWidth(0.3).strokeColor(C_BORDER).stroke();
  }

  // ================================================================
  // BLOQUE DE TOTALES
  // ================================================================
  if (ty > 680) { doc.addPage(); ty = 40; }
  ty += 14;

  const TX  = 350;
  const TLW = 110; // ancho columna label
  const TVW = 85;  // ancho columna valor

  function totalRow(label: string, value: string, bold = false, color = C_MID, bgColor?: string) {
    if (bgColor) doc.rect(TX - 8, ty - 3, TLW + TVW + 16, 22).fillColor(bgColor).fill();
    doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(bold ? 11 : 9)
       .fillColor(color).text(label, TX, ty, { width: TLW, align: 'left', lineBreak: false });
    doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(bold ? 11 : 9)
       .fillColor(color).text(value, TX + TLW, ty, { width: TVW, align: 'right', lineBreak: false });
    ty += bold ? 26 : 18;
  }

  totalRow('Subtotal:',                    money(factura.subtotal));
  if (factura.descuentoMonto > 0) {
    totalRow(`Descuento (${factura.descuentoPorcentaje}%):`, `-${money(factura.descuentoMonto)}`, false, C_RED);
  }
  totalRow(`ITBIS (${factura.impuestoPorcentaje}%):`, money(factura.impuestoMonto));

  // Separador antes del total
  doc.moveTo(TX - 8, ty - 6).lineTo(TX + TLW + TVW + 8, ty - 6).lineWidth(0.5).strokeColor(C_BORDER).stroke();
  totalRow('TOTAL:', money(factura.total), true, C_DARK, '#F3F4F6');

  // ================================================================
  // DESGLOSE PAGO MIXTO
  // ================================================================
  if (factura.metodoPago === 'mixto') {
    ty += 6;
    doc.font('Helvetica').fontSize(8).fillColor(C_LIGHT);
    doc.text(`Efectivo: ${money(factura.montoEfectivo ?? 0)}`, TX, ty, { lineBreak: false }); ty += 12;
    doc.text(`Transferencia: ${money(factura.montoTransferencia ?? 0)}  |  Ref: ${factura.referenciaTransferencia ?? '—'}`, TX, ty, { width: TLW + TVW, lineBreak: false }); ty += 12;
  }

  // ================================================================
  // NOTAS / TÉRMINOS
  // ================================================================
  if (ty < 670) {
    const notY = ty + 20;
    doc.moveTo(ML, notY).lineTo(MR, notY).lineWidth(0.5).strokeColor(C_BORDER).stroke();
    doc.font('Helvetica-Bold').fontSize(8).fillColor(C_LIGHT)
       .text('TÉRMINOS Y CONDICIONES', ML, notY + 10);
    if (empresa?.notasFactura) {
      doc.font('Helvetica').fontSize(8).fillColor(C_LIGHT)
         .text(empresa.notasFactura, ML, notY + 22, { width: 280, lineBreak: false });
    }
    if (factura.motivoAnulacion && factura.estado === 'anulada') {
      doc.font('Helvetica-Bold').fontSize(9).fillColor(C_RED)
         .text(`MOTIVO DE ANULACIÓN: ${factura.motivoAnulacion}`, ML, notY + 10, { width: 280 });
    }
  }

  // ================================================================
  // BANDA INFERIOR + PIE DE PÁGINA
  // ================================================================
  const totalPages = doc.bufferedPageRange();
  for (let i = 0; i < totalPages.count; i++) {
    doc.switchToPage(i);
    // Banda de color inferior
    doc.rect(0, 820, 595, 5).fillColor(C_ACCENT).fill();
    // Texto pie
    doc.font('Helvetica').fontSize(8).fillColor(C_LIGHT)
       .text(
         `${nombreEmpresa}  ·  ${numero}  ·  Página ${i + 1} de ${totalPages.count}`,
         ML, 808, { width: CW, align: 'center', lineBreak: false }
       );
  }

  doc.end();
}
