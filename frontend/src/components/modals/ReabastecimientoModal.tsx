import React from 'react';

interface AlertaReposicion {
    id: string;
    nombre: string;
    stockActual: number;
    stockMinimo: number;
    estado: string;
}

interface Props {
    onClose: () => void;
    alertas?: AlertaReposicion[];
}

export const ReabastecimientoModal = ({ onClose, alertas = [] }: Props) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/50 backdrop-blur-sm p-4">
            <div className="bg-surface-container-lowest w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col border border-outline-variant max-h-[90vh]">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-outline-variant/50">
                    <div>
                        <h2 className="text-[22px] font-bold text-on-surface">Revisar Reabastecimiento</h2>
                        <p className="text-body-sm text-on-surface-variant mt-0.5">Productos que necesitan ser reabastecidos pronto</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full text-on-surface-variant hover:bg-surface-variant/50 transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Body */}
                <div className="overflow-y-auto custom-scrollbar flex-1 p-6">
                    <div className="overflow-x-auto w-full pb-2">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-outline-variant">
                                    <th className="text-left pb-3 font-label-caps text-label-caps text-secondary uppercase tracking-wider">Producto</th>
                                    <th className="text-center pb-3 font-label-caps text-label-caps text-secondary uppercase tracking-wider">Stock Actual</th>
                                    <th className="text-center pb-3 font-label-caps text-label-caps text-secondary uppercase tracking-wider">Stock Mínimo</th>
                                    <th className="text-center pb-3 font-label-caps text-label-caps text-secondary uppercase tracking-wider">Prioridad</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant/50">
                                {alertas.length === 0 && (
                                    <tr><td colSpan={4} className="py-6 text-center text-on-surface-variant">No hay productos por reabastecer.</td></tr>
                                )}
                                {alertas.map((item) => (
                                    <tr key={item.id} className="hover:bg-surface-container-low transition-colors">
                                        <td className="py-3 pr-4 font-medium text-on-surface whitespace-nowrap">{item.nombre}</td>
                                        <td className="py-3 pr-4 text-center">
                                            <span className={`font-bold ${item.stockActual === 0 ? 'text-error' : 'text-tertiary'}`}>{item.stockActual}</span>
                                        </td>
                                        <td className="py-3 pr-4 text-center text-secondary">{item.stockMinimo}</td>
                                        <td className="py-3 pr-4 text-center">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.estado === 'agotado' ? 'bg-error-container text-on-error-container' : 'bg-tertiary-container/20 text-tertiary'}`}>
                                                {item.estado === 'agotado' ? 'Crítico' : 'Bajo'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-outline-variant/50 flex justify-end gap-3 bg-surface-container/30 rounded-b-2xl">
                    <button onClick={onClose} className="px-5 py-2 rounded-lg text-body-sm font-medium text-secondary hover:bg-surface-variant transition-colors">Cerrar</button>
                    <button onClick={onClose} className="px-5 py-2 rounded-lg text-body-sm font-medium bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm">Generar Orden Compra</button>
                </div>
            </div>
        </div>
    );
};
