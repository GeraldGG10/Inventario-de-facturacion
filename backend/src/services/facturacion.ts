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
      devoluciones: { include: { detalles: true }, orderBy: { fecha: 'desc' } },
    },
  });
}

export async function generarPdfFactura(factura: FacturaConDetalle, res: Response) {
  const [empresa, config] = await Promise.all([
    prisma.configuracionEmpresa.findUnique({ where: { id: 'default' } }),
    prisma.configuracionFacturacion.findUnique({ where: { id: 'default' } }),
  ]);

  const numero        = formatearNumeroFactura(config?.serieFactura ?? '', factura.id);
  const moneda        = config?.moneda ?? 'DOP';
  const money         = (n: number) => `${n.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${moneda}`;
  const nombreEmpresa = empresa?.nombre && empresa.nombre !== 'Mi Empresa' ? empresa.nombre : 'Tecno-laser';

  const fechaStr      = factura.fecha.toISOString().split('T')[0];
  const nombreCliente = factura.cliente?.nombre ? factura.cliente.nombre.replace(/[^a-zA-Z0-9]/g, '_') : 'ConsumidorFinal';
  const nombreArchivo = `Factura_${numero}_${nombreCliente}_${fechaStr}.pdf`;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${nombreArchivo}"`);

  const doc = new PDFDocument({ size: 'A4', margin: 0, bufferPages: true });
  doc.pipe(res);

  // ─────────────────────────────────────────────
  // COLORES Y ESTILOS FILES (Inspirados en la imagen)
  // ─────────────────────────────────────────────
  const C_DARK     = '#1a1a1a';    // Texto principal oscuro
  const C_GRAY     = '#555555';    // Texto secundario (direcciones, descripciones)
  const C_LIGHT    = '#999999';    // Textos muy tenues
  const C_SLATE    = '#4a5568';    // Cuadro logo y línea gruesa superior
  const C_LINE     = '#e2e8f0';    // Líneas divisorias suaves
  const C_BLUE     = '#3182ce';    // Link footer
  const C_RED      = '#e53e3e';    // Texto anulado

  const ML = 50;  // Margen Izquierdo
  const MR = 545; // Margen Derecho
  const CW = MR - ML; // 495
  const PAGE_H = 841;

  // Helpers para dibujar líneas
  const drawThickLine = (y: number) => {
    doc.moveTo(ML, y).lineTo(MR, y).lineWidth(3).strokeColor(C_SLATE).stroke();
  };
  const drawThinLine = (y: number) => {
    doc.moveTo(ML, y).lineTo(MR, y).lineWidth(1).strokeColor(C_LINE).stroke();
  };

  // ─────────────────────────────────────────────
  // HEADER
  // ─────────────────────────────────────────────
  let y = 45;

  // 1. LOGO Y DATOS EMPRESA (Izquierda)
  const LOGO_SIZE = 48;
  doc.roundedRect(ML, y, LOGO_SIZE, LOGO_SIZE, 6).fillColor(C_SLATE).fill();
  doc.font('Helvetica-Bold').fontSize(11).fillColor('#ffffff')
     .text('TL', ML, y + 18, { width: LOGO_SIZE, align: 'center', lineBreak: false });

  const EMP_X = ML + LOGO_SIZE + 15;
  let empY = y + 4;
  // Solo mostrar nombre al lado del logo si hay datos extra que acompañen
  const tieneInfoEmpresa = empresa?.direccion || empresa?.rnc || empresa?.telefono;
  if (tieneInfoEmpresa) {
    doc.font('Helvetica-Bold').fontSize(9).fillColor(C_DARK)
       .text(nombreEmpresa, EMP_X, empY); empY += 12;
  }
  doc.font('Helvetica').fontSize(9).fillColor(C_GRAY);
  if (empresa?.direccion) {
    doc.text(empresa.direccion, EMP_X, empY, { width: 200 }); empY += 12;
  }
  if (empresa?.rnc) {
    doc.text(`RNC/Código: ${empresa.rnc}`, EMP_X, empY);
  }

  // 2. DATOS DE FACTURA (Derecha)
  let factY = y + 4;
  doc.font('Helvetica-Bold').fontSize(9).fillColor(C_DARK)
     .text(`Factura# ${numero}`, MR - 200, factY, { width: 200, align: 'right' }); factY += 16;
  
  doc.font('Helvetica-Bold').fontSize(9).fillColor(C_DARK)
     .text('Fecha de emisión', MR - 200, factY, { width: 200, align: 'right' }); factY += 12;
  doc.font('Helvetica').fontSize(9).fillColor(C_GRAY)
     .text(factura.fecha.toLocaleDateString('es-DO'), MR - 200, factY, { width: 200, align: 'right' });

  y += LOGO_SIZE + 25;

  // Línea doble superior
  drawThickLine(y);
  drawThinLine(y + 4);
  y += 30;

  // ─────────────────────────────────────────────
  // TÍTULO PRINCIPAL Y MENSAJE
  // ─────────────────────────────────────────────
  doc.font('Helvetica-Bold').fontSize(24).fillColor(C_DARK)
     .text(nombreEmpresa, ML, y); y += 30;

  const mensajeTexto = empresa?.notasFactura || 'Añade un mensaje aquí para el cliente.';
  doc.font('Helvetica').fontSize(10).fillColor(C_GRAY)
     .text(mensajeTexto, ML, y); y += 35;

  drawThinLine(y);
  y += 15;

  // ─────────────────────────────────────────────
  // 3 COLUMNAS: FACTURAR A | DETALLES | PAGO
  // ─────────────────────────────────────────────
  const COL1_X = ML;
  const COL2_X = ML + (CW * 0.35);
  const COL3_X = ML + (CW * 0.70);
  const COL_W  = (CW * 0.30);

  doc.font('Helvetica-Bold').fontSize(8).fillColor(C_DARK);
  doc.text('FACTURAR A', COL1_X, y);
  doc.text('DETALLES',    COL2_X, y);
  doc.text('PAGO',        COL3_X, y);
  y += 15;

  const colStartY = y;
  
  // Col 1: Cliente
  let c1 = y;
  doc.font('Helvetica').fontSize(9).fillColor(C_GRAY)
     .text(factura.cliente.nombre, COL1_X, c1, { width: COL_W }); c1 += 12;
  if (factura.cliente.correo) {
    doc.text(factura.cliente.correo, COL1_X, c1, { width: COL_W }); c1 += 12;
  }
  if (factura.cliente.telefono) {
    doc.text(factura.cliente.telefono, COL1_X, c1, { width: COL_W }); c1 += 12;
  }
  if (factura.cliente.direccion) {
    doc.text(factura.cliente.direccion, COL1_X, c1, { width: COL_W }); c1 += 12;
  }
  if (factura.cliente.documento) {
    doc.text(`Doc: ${factura.cliente.documento}`, COL1_X, c1, { width: COL_W }); c1 += 12;
  }

  // Col 2: Detalles
  let c2 = y;
  doc.font('Helvetica').fontSize(9).fillColor(C_GRAY);
  if (factura.estado === 'anulada') {
    doc.font('Helvetica-Bold').fillColor(C_RED).text('FACTURA ANULADA', COL2_X, c2, { width: COL_W }); c2 += 12;
    if (factura.motivoAnulacion) {
      doc.font('Helvetica').fillColor(C_GRAY).text(`Motivo: ${factura.motivoAnulacion}`, COL2_X, c2, { width: COL_W }); c2 += 12;
    }
  }
  if (factura.usuario?.nombre) {
    doc.text(`Atendido por: ${factura.usuario.nombre}`, COL2_X, c2, { width: COL_W }); c2 += 12;
  }

  // Col 3: Pago
  let c3 = y;
  doc.font('Helvetica').fontSize(9).fillColor(C_GRAY)
     .text(`Fecha de vencimiento ${factura.fecha.toLocaleDateString('es-DO')}`, COL3_X, c3, { width: COL_W }); c3 += 12;
  doc.text(money(factura.total), COL3_X, c3, { width: COL_W }); c3 += 12;
  
  const metodos: Record<string, string> = { efectivo: 'Efectivo', tarjeta: 'Tarjeta', transferencia: 'Transferencia', mixto: 'Mixto' };
  doc.text(`Método: ${metodos[factura.metodoPago] || factura.metodoPago}`, COL3_X, c3, { width: COL_W }); c3 += 12;

  y = Math.max(c1, c2, c3) + 20;
  drawThinLine(y);
  y += 10;

  // ─────────────────────────────────────────────
  // TABLA DE ARTÍCULOS
  // ─────────────────────────────────────────────
  const T_CANT = ML + CW * 0.55;
  const T_PREC = ML + CW * 0.70;
  const T_IMP  = ML + CW * 0.85;

  function drawTableHeader(yPos: number) {
    doc.font('Helvetica-Bold').fontSize(8).fillColor(C_DARK);
    doc.text('ARTÍCULO', ML, yPos);
    doc.text('CANT.', T_CANT, yPos, { width: 40, align: 'right' });
    doc.text('PRECIO', T_PREC, yPos, { width: 50, align: 'right' });
    doc.text('IMPORTE', T_IMP, yPos, { width: 60, align: 'right' });
    drawThinLine(yPos + 15);
    return yPos + 25;
  }

  y = drawTableHeader(y);

  for (const det of factura.detalles) {
    if (y > 700) {
      doc.addPage();
      y = 40;
      y = drawTableHeader(y);
    }

    // Nombre y descripción
    doc.font('Helvetica').fontSize(9).fillColor(C_GRAY)
       .text(det.producto.nombre, ML, y, { width: T_CANT - ML - 10 });
    doc.font('Helvetica').fontSize(8).fillColor(C_LIGHT)
       .text(`Cód. ${det.producto.codigo}`, ML, y + 12, { width: T_CANT - ML - 10 });

    // Valores
    doc.font('Helvetica').fontSize(9).fillColor(C_GRAY)
       .text(String(det.cantidad), T_CANT, y, { width: 40, align: 'right' });
    doc.text(money(det.precioUnitario), T_PREC, y, { width: 50, align: 'right' });
    doc.text(money(det.subtotal), T_IMP, y, { width: 60, align: 'right' });

    y += 30;
    drawThinLine(y);
    y += 10;
  }

  // ─────────────────────────────────────────────
  // TOTALES
  // ─────────────────────────────────────────────
  if (y > 650) { doc.addPage(); y = 40; }
  y += 10;

  const TOT_X = ML;
  const VAL_X = MR - 100;
  const VAL_W = 100;

  doc.font('Helvetica').fontSize(9).fillColor(C_GRAY);
  doc.text('Subtotal', TOT_X, y);
  doc.text(money(factura.subtotal), VAL_X, y, { width: VAL_W, align: 'right' });
  y += 15;

  if (factura.descuentoMonto > 0) {
    doc.text(`Descuento (${factura.descuentoPorcentaje}%)`, TOT_X, y);
    doc.text(`-${money(factura.descuentoMonto)}`, VAL_X, y, { width: VAL_W, align: 'right' });
    y += 15;
  }

  doc.text('IVA (Incluido)', TOT_X, y);
  doc.text(money(factura.impuestoMonto), VAL_X, y, { width: VAL_W, align: 'right' });
  y += 20;

  drawThinLine(y);
  y += 10;

  doc.font('Helvetica-Bold').fontSize(11).fillColor(C_DARK);
  doc.text('Total a pagar', TOT_X, y);
  doc.text(money(factura.total), VAL_X, y, { width: VAL_W, align: 'right' });

  // ─────────────────────────────────────────────
  // PIE DE PÁGINA (Footer en cada página)
  // ─────────────────────────────────────────────
  const totalPages = doc.bufferedPageRange();
  for (let i = 0; i < totalPages.count; i++) {
    doc.switchToPage(i);

    const fY = PAGE_H - 70;

    // Número de página centrado en el footer
    doc.font('Helvetica').fontSize(8).fillColor(C_LIGHT)
       .text(`Página ${i + 1}`, ML, fY + 24, { width: MR - ML, align: 'right' });
  }

  doc.end();
}
