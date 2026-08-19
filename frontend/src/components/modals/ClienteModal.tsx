import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';

interface Factura { id: number; total: number; fecha: string; estado: string }
interface ClienteDetalle {
    id: string; nombre: string; documento: string | null; telefono: string | null; correo: string | null;
    direccion: string | null; limiteCredito: number | null; totalGastado: number; numeroCompras: number;
    facturas: Factura[];
}

interface Props {
    onClose: () => void;
    clienteId: string;
}

const formatoMoneda = new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' });

export const ClienteModal = ({ onClose, clienteId }: Props) => {
    const [tab, setTab] = useState<'info' | 'historial'>('info');
    const [cliente, setCliente] = useState<ClienteDetalle | null>(null);

    useEffect(() => { api.get<ClienteDetalle>(`/clientes/${clienteId}`).then(setCliente).catch(() => {}); }, [clienteId]);

    if (!cliente) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/40 backdrop-blur-sm p-4">
                <div className="bg-surface-container-lowest rounded-2xl p-8 text-on-surface-variant">Cargando…</div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/40 backdrop-blur-sm p-4">
            <div className="bg-surface-container-lowest w-full max-w-lg rounded-2xl shadow-2xl flex flex-col border border-outline-variant max-h-[90vh]">
                <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-primary font-bold text-sm">
                            {cliente.nombre.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                            <h2 className="font-title-sm text-title-sm text-on-surface">{cliente.nombre}</h2>
                            <p className="font-body-sm text-body-sm text-on-surface-variant">{cliente.numeroCompras} compras</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-surface-container-high transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                <div className="flex gap-0 px-6 pt-4 border-b border-outline-variant">
                    {(['info', 'historial'] as const).map((t) => (
                        <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 font-body-sm text-body-sm capitalize border-b-2 transition-colors ${tab === t ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}>
                            {t === 'info' ? 'Información' : 'Historial'}
                        </button>
                    ))}
                </div>
                <div className="p-6 overflow-y-auto flex-1">
                    {tab === 'info' ? (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">Documento</label><p className="font-data-mono text-data-mono text-on-surface">{cliente.documento ?? '—'}</p></div>
                                <div><label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">Teléfono</label><p className="font-data-mono text-data-mono text-on-surface">{cliente.telefono ?? '—'}</p></div>
                                <div><label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">Email</label><p className="font-body-sm text-body-sm text-on-surface">{cliente.correo ?? '—'}</p></div>
                                <div><label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">Límite de crédito</label><p className="font-data-mono text-data-mono text-primary">{cliente.limiteCredito != null ? formatoMoneda.format(cliente.limiteCredito) : '—'}</p></div>
                                <div className="col-span-2"><label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">Dirección</label><p className="font-body-sm text-body-sm text-on-surface">{cliente.direccion ?? '—'}</p></div>
                            </div>
                            <div className="bg-surface-container rounded-lg p-4 flex justify-between items-center">
                                <span className="font-label-caps text-label-caps text-on-surface-variant">Total en compras</span>
                                <span className="font-data-mono text-data-mono text-on-surface font-bold">{formatoMoneda.format(cliente.totalGastado)}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {cliente.facturas.length === 0 && <p className="text-on-surface-variant text-body-sm">Sin facturas todavía.</p>}
                            {cliente.facturas.map((f) => (
                                <div key={f.id} className="flex items-center justify-between p-3 rounded-lg border border-outline-variant bg-surface-container-lowest hover:bg-surface-container transition-colors">
                                    <div>
                                        <p className="font-data-mono text-data-mono text-primary">FAC-{String(f.id).padStart(6, '0')}</p>
                                        <p className="font-body-sm text-body-sm text-on-surface-variant">{new Date(f.fecha).toLocaleDateString('es-DO')}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-data-mono text-data-mono text-on-surface">{formatoMoneda.format(f.total)}</p>
                                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${f.estado === 'anulada' ? 'bg-error-container/30 text-error' : 'bg-green-100 text-green-800'}`}>{f.estado === 'anulada' ? 'Anulada' : 'Emitida'}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="p-4 border-t border-outline-variant flex justify-end gap-3 bg-surface-container/30 rounded-b-2xl">
                    <button onClick={onClose} className="px-5 py-2 rounded-lg text-body-sm font-medium text-secondary hover:bg-surface-variant transition-colors">Cerrar</button>
                </div>
            </div>
        </div>
    );
};
