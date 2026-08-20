import React from 'react';
import { formatearMoneda } from '../../lib/formatters';

interface FacturaDetalle {
    id: number;
    numero: string;
    fecha: string;
    estado: string;
    metodoPago: string;
    subtotal: number;
    descuentoMonto: number;
    impuestoMonto: number;
    total: number;
    cliente: { nombre: string; documento: string | null; telefono: string | null; correo: string | null };
    usuario: { nombre: string } | null;
    detalles: Array<{
        cantidad: number;
        precioUnitario: number;
        subtotal: number;
        producto: { codigo: string; nombre: string };
    }>;
}

interface Props {
    factura: FacturaDetalle;
    onClose: () => void;
}

export const FacturaDetallesModal = ({ factura, onClose }: Props) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/50 backdrop-blur-sm p-4">
            <div className="bg-surface-container-lowest w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col border border-outline-variant max-h-[90vh]">
                <div className="flex justify-between items-center p-6 border-b border-outline-variant/50">
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-[22px] font-bold text-on-surface">Factura {factura.numero}</h2>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${factura.estado === 'emitida' ? 'bg-[#008a00]/10 text-[#008a00]' : 'bg-error/10 text-error'}`}>
                                {factura.estado}
                            </span>
                        </div>
                        <p className="text-body-sm text-on-surface-variant mt-1">
                            Emitida el {new Date(factura.fecha).toLocaleString()} por {factura.usuario?.nombre || 'Sistema'}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full text-on-surface-variant hover:bg-surface-variant/50 transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar flex flex-col gap-6">
                    {/* Datos del Cliente */}
                    <div className="bg-surface-container/30 p-4 rounded-xl border border-outline-variant/50">
                        <h3 className="font-semibold text-body-md text-on-surface mb-3 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px] text-primary">person</span>
                            Datos del Cliente
                        </h3>
                        <div className="grid grid-cols-2 gap-4 text-body-sm">
                            <div>
                                <span className="text-on-surface-variant block mb-1">Nombre / Razón Social</span>
                                <span className="font-medium text-on-surface">{factura.cliente.nombre}</span>
                            </div>
                            <div>
                                <span className="text-on-surface-variant block mb-1">Documento (RNC/Cédula)</span>
                                <span className="font-medium text-on-surface">{factura.cliente.documento || 'N/A'}</span>
                            </div>
                            <div>
                                <span className="text-on-surface-variant block mb-1">Teléfono</span>
                                <span className="font-medium text-on-surface">{factura.cliente.telefono || 'N/A'}</span>
                            </div>
                            <div>
                                <span className="text-on-surface-variant block mb-1">Método de Pago</span>
                                <span className="font-medium text-on-surface capitalize">{factura.metodoPago}</span>
                            </div>
                        </div>
                    </div>

                    {/* Detalles de Productos */}
                    <div>
                        <h3 className="font-semibold text-body-md text-on-surface mb-3 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px] text-primary">shopping_cart</span>
                            Productos Comprados
                        </h3>
                        <div className="border border-outline-variant rounded-xl overflow-hidden">
                            <table className="w-full text-left text-body-sm">
                                <thead className="bg-surface border-b border-outline-variant">
                                    <tr>
                                        <th className="py-2 px-4 font-semibold text-secondary">Código</th>
                                        <th className="py-2 px-4 font-semibold text-secondary">Descripción</th>
                                        <th className="py-2 px-4 font-semibold text-secondary text-right">Cant.</th>
                                        <th className="py-2 px-4 font-semibold text-secondary text-right">Precio</th>
                                        <th className="py-2 px-4 font-semibold text-secondary text-right">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {factura.detalles.map((det, i) => (
                                        <tr key={i} className="border-b border-outline-variant/50 last:border-0 hover:bg-surface-container-lowest transition-colors">
                                            <td className="py-2 px-4 text-on-surface-variant">{det.producto.codigo}</td>
                                            <td className="py-2 px-4 font-medium text-on-surface">{det.producto.nombre}</td>
                                            <td className="py-2 px-4 text-right text-on-surface">{det.cantidad}</td>
                                            <td className="py-2 px-4 text-right text-on-surface">{formatearMoneda(det.precioUnitario)}</td>
                                            <td className="py-2 px-4 text-right font-medium text-on-surface">{formatearMoneda(det.subtotal)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Resumen de Totales */}
                    <div className="flex justify-end">
                        <div className="w-64 flex flex-col gap-2 text-body-sm">
                            <div className="flex justify-between text-on-surface-variant">
                                <span>Subtotal</span>
                                <span>{formatearMoneda(factura.subtotal)}</span>
                            </div>
                            {factura.descuentoMonto > 0 && (
                                <div className="flex justify-between text-error">
                                    <span>Descuento</span>
                                    <span>-{formatearMoneda(factura.descuentoMonto)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-on-surface-variant">
                                <span>Impuestos</span>
                                <span>{formatearMoneda(factura.impuestoMonto)}</span>
                            </div>
                            <div className="flex justify-between text-title-md font-bold text-primary border-t border-outline-variant pt-2 mt-1">
                                <span>Total</span>
                                <span>{formatearMoneda(factura.total)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-outline-variant/50 flex justify-end bg-surface-container/30 rounded-b-2xl">
                    <button onClick={onClose} className="px-6 py-2 rounded-lg text-body-sm font-medium bg-primary text-on-primary shadow-sm hover:bg-primary/90 transition-colors">
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};
