import React, { useState } from 'react';
import { api, ApiError } from '../../lib/api';
import { useToast } from '../../context/ToastContext';

export interface FacturaParaAnular {
    id: number;
    numero: string;
    cliente: { nombre: string };
    usuario: { nombre: string } | null;
    fecha: string;
    total: number;
}

interface Props {
    onClose: () => void;
    factura: FacturaParaAnular;
    onAnulada: () => void;
}

const formatoMoneda = new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' });

const MOTIVOS = [
    { value: 'error', label: 'Error en la factura' },
    { value: 'producto', label: 'Producto incorrecto' },
    { value: 'cantidad', label: 'Cantidad incorrecta' },
    { value: 'precio', label: 'Precio incorrecto' },
    { value: 'cliente', label: 'Cliente incorrecto' },
    { value: 'devolucion', label: 'Devolución de productos' },
    { value: 'cancelada', label: 'Venta cancelada' },
    { value: 'duplicada', label: 'Factura duplicada' },
    { value: 'otro', label: 'Otro' },
];

export const AnularFacturaModal = ({ onClose, factura, onAnulada }: Props) => {
    const [motivo, setMotivo] = useState('');
    const [especificacion, setEspecificacion] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [enviando, setEnviando] = useState(false);
    const { mostrarToast } = useToast();

    async function confirmar() {
        const motivoTexto = motivo === 'otro' ? especificacion : MOTIVOS.find((m) => m.value === motivo)?.label;
        if (!motivo || (motivo === 'otro' && !especificacion.trim())) {
            setError('Selecciona (y especifica, si aplica) el motivo de anulación');
            return;
        }
        setError(null);
        setEnviando(true);
        try {
            await api.post(`/facturas/${factura.id}/anular`, { motivo: motivoTexto });
            mostrarToast(`Factura ${factura.numero} anulada`, 'success');
            onAnulada();
        } catch (err) {
            mostrarToast(err instanceof ApiError ? err.message : 'No se pudo anular la factura', 'error');
            setError(err instanceof ApiError ? err.message : 'No se pudo anular la factura');
        } finally {
            setEnviando(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-[#0f172a] bg-opacity-40 backdrop-blur-sm z-50 transition-opacity flex items-center justify-center p-4">
            <div className="bg-surface-container-lowest w-full max-w-2xl rounded-xl shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)] flex flex-col overflow-hidden relative z-50 max-h-[90vh]">
                <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant">
                    <h2 className="font-title-sm text-title-sm text-on-surface">Anular Factura</h2>
                    <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface transition-colors p-1 rounded-full hover:bg-surface-container-high">
                        <span className="material-symbols-outlined text-[24px]">close</span>
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex flex-col gap-6">
                    {error && <div className="p-3 rounded-lg bg-error/10 text-error text-body-sm">{error}</div>}
                    <section>
                        <h3 className="font-label-caps text-label-caps text-on-surface-variant mb-2 uppercase tracking-wider">Información de la factura</h3>
                        <div className="bg-surface-container-low border border-outline-variant rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                            <div><span className="block font-body-sm text-body-sm text-on-surface-variant">Número</span><span className="block font-data-mono text-data-mono text-on-surface">{factura.numero}</span></div>
                            <div><span className="block font-body-sm text-body-sm text-on-surface-variant">Cliente</span><span className="block font-body-md text-body-md text-on-surface">{factura.cliente.nombre}</span></div>
                            <div><span className="block font-body-sm text-body-sm text-on-surface-variant">Fecha / Hora</span><span className="block font-data-mono text-data-mono text-on-surface">{new Date(factura.fecha).toLocaleString('es-DO')}</span></div>
                            <div><span className="block font-body-sm text-body-sm text-on-surface-variant">Total</span><span className="block font-data-mono text-data-mono text-on-surface font-semibold text-primary">{formatoMoneda.format(factura.total)}</span></div>
                            <div className="md:col-span-2"><span className="block font-body-sm text-body-sm text-on-surface-variant">Usuario Registró</span><span className="block font-body-md text-body-md text-on-surface">{factura.usuario?.nombre ?? '—'}</span></div>
                        </div>
                    </section>

                    <section>
                        <div className="flex flex-col gap-4">
                            <div>
                                <label className="block font-body-sm text-body-sm text-on-surface mb-2 font-medium">Motivo de anulación <span className="text-error">*</span></label>
                                <select value={motivo} onChange={(e) => setMotivo(e.target.value)} className="w-full bg-surface-container-lowest border border-outline-variant rounded px-4 py-2 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary cursor-pointer">
                                    <option value="">Seleccione un motivo...</option>
                                    {MOTIVOS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                                </select>
                            </div>
                            {motivo === 'otro' && (
                                <div className="flex flex-col gap-2">
                                    <label className="block font-body-sm text-body-sm text-on-surface font-medium">Especifique el motivo <span className="text-error">*</span></label>
                                    <textarea value={especificacion} onChange={(e) => setEspecificacion(e.target.value)} className="w-full bg-surface-container-lowest border border-outline-variant rounded px-4 py-2 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none" placeholder="Detalle la razón de la anulación aquí..." rows={3} />
                                </div>
                            )}
                        </div>
                    </section>

                    <section>
                        <div className="bg-tertiary-container/10 border border-tertiary-container/30 rounded-lg p-4 flex gap-4 items-start">
                            <span className="material-symbols-outlined text-tertiary-container mt-0.5">warning</span>
                            <p className="font-body-sm text-body-sm text-on-surface">
                                <strong className="text-tertiary-container font-semibold">Atención:</strong> Esta acción no puede deshacerse. La factura será marcada como anulada y los productos asociados serán devueltos al inventario automáticamente.
                            </p>
                        </div>
                    </section>
                </div>

                <div className="bg-surface px-6 py-4 border-t border-outline-variant flex justify-end gap-3 rounded-b-xl shrink-0">
                    <button onClick={onClose} className="px-4 py-2 rounded font-label-caps text-label-caps bg-transparent border border-outline-variant text-on-surface hover:bg-surface-container-high transition-colors">Cancelar</button>
                    <button onClick={confirmar} disabled={enviando} className="px-4 py-2 rounded font-label-caps text-label-caps bg-error text-on-error hover:bg-on-error-container transition-colors shadow-sm flex items-center gap-2 disabled:opacity-60">
                        <span className="material-symbols-outlined text-[18px]">delete_forever</span>
                        {enviando ? 'Anulando…' : 'Confirmar anulación'}
                    </button>
                </div>
            </div>
        </div>
    );
};
