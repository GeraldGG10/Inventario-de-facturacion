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

  const numero = formatearNumeroFactura(config?.serieFactura ?? 'FAC-', factura.id);
  const moneda = config?.moneda ?? 'DOP';
  const money = (n: number) => `${moneda} ${n.toFixed(2)}`;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${numero}.pdf"`);

  const doc = new PDFDocument({ margin: 50 });
  doc.pipe(res);

  doc.fontSize(18).text(empresa?.nombre ?? 'Mi Empresa', { continued: false });
  if (empresa?.rnc) doc.fontSize(9).text(`RNC: ${empresa.rnc}`);
  if (empresa?.direccion) doc.fontSize(9).text(empresa.direccion);
  if (empresa?.telefono) doc.fontSize(9).text(`Tel: ${empresa.telefono}`);

  doc.moveDown();
  doc.fontSize(14).text(`Factura ${numero}`, { align: 'right' });
  doc.fontSize(9).text(`Fecha: ${factura.fecha.toLocaleString('es-DO')}`, { align: 'right' });
  doc.text(`Estado: ${factura.estado === 'anulada' ? 'ANULADA' : 'Emitida'}`, { align: 'right' });

  doc.moveDown();
  doc.fontSize(11).text(`Cliente: ${factura.cliente.nombre}`);
  if (factura.cliente.documento) doc.fontSize(9).text(`Documento: ${factura.cliente.documento}`);

  doc.moveDown();
  const top = doc.y;
  doc.fontSize(9).text('Producto', 50, top).text('Cant.', 300, top).text('Precio', 360, top).text('Subtotal', 450, top);
  doc.moveDown(0.5);
  doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();

  for (const detalle of factura.detalles) {
    const y = doc.y + 5;
    doc
      .fontSize(9)
      .text(detalle.producto.nombre, 50, y, { width: 240 })
      .text(String(detalle.cantidad), 300, y)
      .text(money(detalle.precioUnitario), 360, y)
      .text(money(detalle.subtotal), 450, y);
    doc.moveDown();
  }

  doc.moveDown();
  doc.moveTo(350, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown(0.3);
  doc.fontSize(9).text(`Subtotal: ${money(factura.subtotal)}`, 350, doc.y, { align: 'right', width: 195 });
  if (factura.descuentoMonto > 0) {
    doc.text(`Descuento (${factura.descuentoPorcentaje}%): -${money(factura.descuentoMonto)}`, 350, doc.y, { align: 'right', width: 195 });
  }
  doc.text(`ITBIS/Impuesto (${factura.impuestoPorcentaje}%): ${money(factura.impuestoMonto)}`, 350, doc.y, { align: 'right', width: 195 });
  doc.fontSize(12).text(`TOTAL: ${money(factura.total)}`, 350, doc.y + 4, { align: 'right', width: 195 });

  if (factura.estado === 'anulada' && factura.motivoAnulacion) {
    doc.moveDown(2);
    doc.fontSize(10).fillColor('red').text(`Factura anulada — motivo: ${factura.motivoAnulacion}`);
    doc.fillColor('black');
  }

  if (empresa?.notasFactura) {
    doc.moveDown();
    doc.fontSize(8).text(empresa.notasFactura);
  }

  doc.end();
}
