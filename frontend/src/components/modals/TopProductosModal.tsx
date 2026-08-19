import React from 'react';

interface ProductoRotacion {
    id: string;
    nombre: string;
    categoria: string | null;
    unidadesVendidas: number;
    totalGenerado: number;
}

interface Props {
    onClose: () => void;
    productos?: ProductoRotacion[];
}

const formatoMoneda = new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' });

export const TopProductosModal = ({ onClose, productos = [] }: Props) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-surface-container-lowest dark:bg-inverse-surface w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] border border-outline-variant dark:border-outline/30">
                
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-outline-variant/50">
                    <div>
                        <h2 className="font-display-lg text-[24px] font-bold text-on-surface dark:text-inverse-on-surface">Todos los Top Productos</h2>
                        <p className="text-body-sm font-body-sm text-on-surface-variant mt-1">Rendimiento de ventas en el mes actual</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 rounded-full text-on-surface-variant hover:bg-surface-variant/50 transition-colors"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Body (Scrollable) */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                    <div className="overflow-x-auto w-full pb-2">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-outline-variant">
                                    <th className="text-left pb-3 font-label-caps text-label-caps text-secondary uppercase tracking-wider">#</th>
                                    <th className="text-left pb-3 font-label-caps text-label-caps text-secondary uppercase tracking-wider">Producto</th>
                                    <th className="text-left pb-3 font-label-caps text-label-caps text-secondary uppercase tracking-wider">Categoría</th>
                                    <th className="text-right pb-3 font-label-caps text-label-caps text-secondary uppercase tracking-wider">Unidades</th>
                                    <th className="text-right pb-3 font-label-caps text-label-caps text-secondary uppercase tracking-wider">Ingresos</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant/50">
                                {productos.length === 0 && (
                                    <tr><td colSpan={5} className="py-6 text-center text-on-surface-variant">Sin ventas registradas todavía.</td></tr>
                                )}
                                {productos.map((p, i) => (
                                    <tr key={p.id} className="hover:bg-surface-container-low transition-colors">
                                        <td className="py-3 pr-4">
                                            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i < 3 ? 'bg-primary text-on-primary' : 'bg-surface-container text-secondary'}`}>{i + 1}</span>
                                        </td>
                                        <td className="py-3 pr-6 font-medium text-on-surface whitespace-nowrap">{p.nombre}</td>
                                        <td className="py-3 pr-6 whitespace-nowrap">
                                            <span className="px-2 py-0.5 rounded-full text-xs bg-secondary-container text-on-secondary-container">{p.categoria ?? 'Sin categoría'}</span>
                                        </td>
                                        <td className="py-3 pr-6 text-right font-medium text-on-surface">{p.unidadesVendidas}</td>
                                        <td className="py-3 pr-6 text-right font-medium text-primary">{formatoMoneda.format(p.totalGenerado)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};
