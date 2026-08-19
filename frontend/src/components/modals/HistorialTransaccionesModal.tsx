import React, { useMemo, useState } from 'react';

interface Transaccion {
    id: number;
    numero: string;
    cliente: string;
    fecha: string;
    total: number;
    estado: string;
}

interface Props {
    onClose: () => void;
    transacciones?: Transaccion[];
}

const formatoMoneda = new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' });

const estadoBadge = (estado: string) => {
    if (estado === 'anulada') return 'bg-error/10 text-error';
    return 'bg-[#008a00]/10 text-[#008a00]';
};

export const HistorialTransaccionesModal = ({ onClose, transacciones = [] }: Props) => {
    const [busqueda, setBusqueda] = useState('');
    const filtradas = useMemo(
        () => transacciones.filter((t) => `${t.numero} ${t.cliente}`.toLowerCase().includes(busqueda.toLowerCase())),
        [transacciones, busqueda],
    );
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/50 backdrop-blur-sm p-4">
            <div className="bg-surface-container-lowest w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col border border-outline-variant max-h-[90vh]">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-outline-variant/50">
                    <div>
                        <h2 className="text-[22px] font-bold text-on-surface">Historial de Transacciones</h2>
                        <p className="text-body-sm text-on-surface-variant mt-0.5">Todas las facturas y transacciones registradas</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full text-on-surface-variant hover:bg-surface-variant/50 transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Search bar */}
                <div className="px-6 py-4 border-b border-outline-variant/30">
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
                        <input
                            type="text"
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            placeholder="Buscar por factura, cliente..."
                            className="w-full pl-9 pr-4 py-2.5 bg-surface border border-outline-variant rounded-lg text-body-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none"
                        />
                    </div>
                </div>

                {/* Body */}
                <div className="overflow-y-auto custom-scrollbar flex-1">
                    <div className="overflow-x-auto w-full pb-2">
                        <table className="w-full text-sm">
                            <thead className="sticky top-0 bg-surface-container-lowest">
                                <tr className="border-b border-outline-variant">
                                    <th className="text-left p-4 font-label-caps text-label-caps text-secondary uppercase tracking-wider">Factura</th>
                                    <th className="text-left p-4 font-label-caps text-label-caps text-secondary uppercase tracking-wider">Cliente</th>
                                    <th className="text-left p-4 font-label-caps text-label-caps text-secondary uppercase tracking-wider">Fecha</th>
                                    <th className="text-right p-4 font-label-caps text-label-caps text-secondary uppercase tracking-wider">Total</th>
                                    <th className="text-center p-4 font-label-caps text-label-caps text-secondary uppercase tracking-wider">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant/50">
                                {filtradas.length === 0 && (
                                    <tr><td colSpan={5} className="p-6 text-center text-on-surface-variant">Sin transacciones.</td></tr>
                                )}
                                {filtradas.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-surface-container-low transition-colors cursor-pointer">
                                        <td className="p-4 font-data-mono text-data-mono text-primary whitespace-nowrap">{tx.numero}</td>
                                        <td className="p-4 text-on-surface whitespace-nowrap">{tx.cliente}</td>
                                        <td className="p-4 text-on-surface-variant whitespace-nowrap">{new Date(tx.fecha).toLocaleString('es-DO')}</td>
                                        <td className="p-4 text-right font-medium text-on-surface whitespace-nowrap">{formatoMoneda.format(tx.total)}</td>
                                        <td className="p-4 text-center">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${estadoBadge(tx.estado)}`}>{tx.estado === 'anulada' ? 'Anulada' : 'Emitida'}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-outline-variant/50 flex justify-between items-center bg-surface-container/30 rounded-b-2xl">
                    <span className="text-body-sm text-on-surface-variant">Mostrando {filtradas.length} de {transacciones.length} transacciones recientes</span>
                    <button onClick={onClose} className="px-5 py-2 rounded-lg text-body-sm font-medium text-secondary hover:bg-surface-variant transition-colors">Cerrar</button>
                </div>
            </div>
        </div>
    );
};
