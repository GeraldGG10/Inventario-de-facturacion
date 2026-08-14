import React from 'react';

interface Props {
    onClose: () => void;
}

export const FiltroTransaccionesModal = ({ onClose }: Props) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
<div className="bg-surface-container-lowest w-full max-w-md rounded-2xl shadow-2xl flex flex-col border border-outline-variant max-h-[90vh]">
                
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-outline-variant/50">
                    <h2 className="font-title-sm text-[20px] font-bold text-on-surface dark:text-inverse-on-surface flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">filter_list</span>
                        Filtrar Transacciones
                    </h2>
                    <button 
                        onClick={onClose}
                        className="p-2 rounded-full text-on-surface-variant hover:bg-surface-variant/50 transition-colors"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Body / Form */}
                <div className="p-6 flex flex-col gap-5">
                    
                    {/* Fecha */}
                    <div>
                        <label className="block text-body-sm font-semibold text-on-surface mb-2">Rango de Fechas</label>
                        <select className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-lg text-body-sm text-on-surface focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all">
                            <option value="hoy">Hoy</option>
                            <option value="semana">Últimos 7 días</option>
                            <option value="mes" selected>Este Mes</option>
                            <option value="anio">Este Año</option>
                            <option value="personalizado">Personalizado...</option>
                        </select>
                    </div>

                    {/* Estado */}
                    <div>
                        <label className="block text-body-sm font-semibold text-on-surface mb-2">Estado de la Factura</label>
                        <div className="flex gap-3">
                            <label className="flex items-center gap-2 cursor-pointer p-3 border border-outline-variant rounded-lg flex-1 hover:bg-surface-container transition-colors">
                                <input type="checkbox" className="w-4 h-4 text-primary rounded border-outline focus:ring-primary" defaultChecked />
                                <span className="text-body-sm text-on-surface font-medium">Pagado</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer p-3 border border-outline-variant rounded-lg flex-1 hover:bg-surface-container transition-colors">
                                <input type="checkbox" className="w-4 h-4 text-primary rounded border-outline focus:ring-primary" defaultChecked />
                                <span className="text-body-sm text-on-surface font-medium">Pendiente</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer p-3 border border-outline-variant rounded-lg flex-1 hover:bg-surface-container transition-colors">
                                <input type="checkbox" className="w-4 h-4 text-primary rounded border-outline focus:ring-primary" />
                                <span className="text-body-sm text-on-surface font-medium">Anulada</span>
                            </label>
                        </div>
                    </div>

                    {/* Cliente */}
                    <div>
                        <label className="block text-body-sm font-semibold text-on-surface mb-2">Cliente (Opcional)</label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
                            <input 
                                type="text" 
                                placeholder="Buscar cliente por nombre o RUC..."
                                className="w-full pl-9 pr-4 py-2.5 bg-surface border border-outline-variant rounded-lg text-body-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none"
                            />
                        </div>
                    </div>

                </div>

                {/* Footer / Actions */}
                <div className="p-6 border-t border-outline-variant/50 flex justify-end gap-3 bg-surface-container/30 rounded-b-2xl">
                    <button 
                        onClick={onClose}
                        className="px-5 py-2 rounded-lg text-body-sm font-medium text-secondary hover:bg-surface-variant transition-colors"
                    >
                        Limpiar Filtros
                    </button>
                    <button 
                        onClick={onClose}
                        className="px-6 py-2 rounded-lg text-body-sm font-medium bg-primary text-on-primary shadow-sm hover:bg-primary-container hover:text-on-primary-container transition-colors"
                    >
                        Aplicar Filtros
                    </button>
                </div>

            </div>
        </div>
    );
};
