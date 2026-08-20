import React, { useState } from 'react';
import { api, ApiError } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { formatearMoneda } from '../../lib/formatters';

interface FacturaParaDevolucion {
    id: number;
    numero: string;
    detalles: Array<{
        productoId: string;
        cantidad: number;
        precioUnitario: number;
        producto: { codigo: string; nombre: string };
    }>;
    devoluciones?: Array<{
        detalles: Array<{ productoId: string; cantidadDevuelta: number }>;
    }>;
}

interface Props {
    factura: FacturaParaDevolucion;
    onClose: () => void;
    onDevuelto: () => void;
}

const MOTIVOS = [
    { value: 'defectuoso', label: 'Producto defectuoso' },
    { value: 'incorrecto', label: 'Producto incorrecto' },
    { value: 'no_satisfecho', label: 'Cliente no satisfecho' },
    { value: 'otro', label: 'Otro' },
];

export const DevolucionModal = ({ factura, onClose, onDevuelto }: Props) => {
    const yaDevueltoPorProducto = new Map<string, number>();
    for (const devolucion of factura.devoluciones ?? []) {
        for (const det of devolucion.detalles) {
            yaDevueltoPorProducto.set(det.productoId, (yaDevueltoPorProducto.get(det.productoId) ?? 0) + det.cantidadDevuelta);
        }
    }

    const lineasDevolvibles = factura.detalles
        .map((det) => ({ ...det, restante: det.cantidad - (yaDevueltoPorProducto.get(det.productoId) ?? 0) }))
        .filter((det) => det.restante > 0);

    const [cantidades, setCantidades] = useState<Record<string, string>>({});
    const [motivo, setMotivo] = useState('');
    const [especificacion, setEspecificacion] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [enviando, setEnviando] = useState(false);
    const { mostrarToast } = useToast();

    function setCantidad(productoId: string, restante: number, valor: string) {
        const num = Number(valor);
        if (valor !== '' && (Number.isNaN(num) || num < 0)) return;
        if (num > restante) return;
        setCantidades((prev) => ({ ...prev, [productoId]: valor }));
    }

    async function confirmar() {
        const items = lineasDevolvibles
            .map((l) => ({ productoId: l.productoId, cantidad: Number(cantidades[l.productoId] || 0) }))
            .filter((i) => i.cantidad > 0);

        if (items.length === 0) {
            setError('Indica la cantidad a devolver de al menos un producto');
            return;
        }
        if (!motivo || (motivo === 'otro' && !especificacion.trim())) {
            setError('Selecciona (y especifica, si aplica) el motivo de la devolución');
            return;
        }

        setError(null);
        setEnviando(true);
        try {
            const motivoTexto = motivo === 'otro' ? especificacion : MOTIVOS.find((m) => m.value === motivo)?.label;
            await api.post(`/facturas/${factura.id}/devoluciones`, { motivo: motivoTexto, items });
            mostrarToast(`Devolución registrada sobre la factura ${factura.numero}`, 'success');
            onDevuelto();
        } catch (err) {
            mostrarToast(err instanceof ApiError ? err.message : 'No se pudo registrar la devolución', 'error');
            setError(err instanceof ApiError ? err.message : 'No se pudo registrar la devolución');
        } finally {
            setEnviando(false);
        }
    }

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-inverse-surface/50 backdrop-blur-sm p-4">
            <div className="bg-surface-container-lowest w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col border border-outline-variant max-h-[90vh]">
                <div className="flex justify-between items-center p-6 border-b border-outline-variant/50">
                    <div>
                        <h2 className="text-[22px] font-bold text-on-surface">Registrar Devolución</h2>
                        <p className="text-body-sm text-on-surface-variant mt-0.5">Factura {factura.numero} — el stock devuelto se repone automáticamente</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full text-on-surface-variant hover:bg-surface-variant/50 transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar flex flex-col gap-5">
                    {error && <div className="p-3 rounded-lg bg-error/10 text-error text-body-sm">{error}</div>}

                    <div>
                        <label className="block text-body-sm font-semibold text-on-surface mb-2">Productos a devolver</label>
                        <div className="border border-outline-variant rounded-xl overflow-hidden">
                            <table className="w-full text-left text-body-sm">
                                <thead className="bg-surface border-b border-outline-variant">
                                    <tr>
                                        <th className="py-2 px-4 font-semibold text-secondary">Producto</th>
                                        <th className="py-2 px-4 font-semibold text-secondary text-right">Comprado</th>
                                        <th className="py-2 px-4 font-semibold text-secondary text-right">Disponible p/devolver</th>
                                        <th className="py-2 px-4 font-semibold text-secondary text-right w-32">Cantidad</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {lineasDevolvibles.map((l) => (
                                        <tr key={l.productoId} className="border-b border-outline-variant/50 last:border-0">
                                            <td className="py-2 px-4">
                                                <div className="font-medium text-on-surface">{l.producto.nombre}</div>
                                                <div className="text-xs text-on-surface-variant">{l.producto.codigo} • {formatearMoneda(l.precioUnitario)} c/u</div>
                                            </td>
                                            <td className="py-2 px-4 text-right text-on-surface-variant">{l.cantidad}</td>
                                            <td className="py-2 px-4 text-right text-on-surface-variant">{l.restante}</td>
                                            <td className="py-2 px-4 text-right">
                                                <input
                                                    type="number"
                                                    min={0}
                                                    max={l.restante}
                                                    value={cantidades[l.productoId] ?? ''}
                                                    onChange={(e) => setCantidad(l.productoId, l.restante, e.target.value)}
                                                    placeholder="0"
                                                    className="w-20 px-2 py-1.5 text-right bg-surface border border-outline-variant rounded-lg text-body-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none"
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div>
                        <label className="block text-body-sm font-semibold text-on-surface mb-2">Motivo de la devolución <span className="text-error">*</span></label>
                        <div className="relative">
                            <select value={motivo} onChange={(e) => setMotivo(e.target.value)} className="appearance-none w-full px-4 py-2.5 pr-9 bg-surface border border-outline-variant rounded-lg text-body-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all">
                                <option value="">Seleccione un motivo...</option>
                                {MOTIVOS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                            </select>
                            <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">expand_more</span>
                        </div>
                    </div>
                    {motivo === 'otro' && (
                        <div>
                            <label className="block text-body-sm font-semibold text-on-surface mb-2">Especifique el motivo <span className="text-error">*</span></label>
                            <textarea value={especificacion} onChange={(e) => setEspecificacion(e.target.value)} rows={2} className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg text-body-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none resize-none" placeholder="Detalle la razón de la devolución..." />
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-outline-variant/50 flex justify-end gap-3 bg-surface-container/30 rounded-b-2xl">
                    <button onClick={onClose} className="px-5 py-2 rounded-lg text-body-sm font-medium text-secondary hover:bg-surface-variant transition-colors">Cancelar</button>
                    <button onClick={confirmar} disabled={enviando} className="px-6 py-2 rounded-lg text-body-sm font-medium bg-primary text-on-primary shadow-sm hover:bg-primary-container hover:text-on-primary-container transition-colors disabled:opacity-60">
                        {enviando ? 'Registrando…' : 'Confirmar Devolución'}
                    </button>
                </div>
            </div>
        </div>
    );
};
