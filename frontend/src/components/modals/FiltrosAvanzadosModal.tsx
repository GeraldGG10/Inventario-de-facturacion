import React from 'react';

interface Props {
    onClose: () => void;
}

export const FiltrosAvanzadosModal = ({ onClose }: Props) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/50 backdrop-blur-sm p-4">
            <div className="bg-surface-container-lowest w-full max-w-lg rounded-2xl shadow-2xl flex flex-col border border-outline-variant max-h-[90vh]">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-outline-variant/50">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">tune</span>
                        <div>
                            <h2 className="text-[22px] font-bold text-on-surface">Filtros Avanzados</h2>
                            <p className="text-body-sm text-on-surface-variant mt-0.5">Refina los resultados de búsqueda</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full text-on-surface-variant hover:bg-surface-variant/50 transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex flex-col gap-6">
                    {/* Rango de Precios */}
                    <div>
                        <label className="block text-body-sm font-semibold text-on-surface mb-3">Rango de Precio</label>
                        <div className="flex items-center gap-3">
                            <input type="number" placeholder="Mínimo" className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg text-body-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none" />
                            <span className="text-on-surface-variant">-</span>
                            <input type="number" placeholder="Máximo" className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg text-body-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none" />
                        </div>
                    </div>
                    
                    {/* Nivel de Stock */}
                    <div>
                        <label className="block text-body-sm font-semibold text-on-surface mb-3">Nivel de Stock</label>
                        <div className="flex items-center gap-3">
                            <input type="number" placeholder="Mínimo" className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg text-body-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none" />
                            <span className="text-on-surface-variant">-</span>
                            <input type="number" placeholder="Máximo" className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg text-body-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none" />
                        </div>
                    </div>

                    {/* Proveedor */}
                    <div>
                        <label className="block text-body-sm font-semibold text-on-surface mb-3">Proveedor</label>
                        <select className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-lg text-body-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all">
                            <option value="">Cualquier Proveedor</option>
                            <option value="1">Acme Corp</option>
                            <option value="2">Tech Solutions</option>
                            <option value="3">Global Imports</option>
                        </select>
                    </div>

                    {/* Otros Atributos */}
                    <div>
                        <label className="block text-body-sm font-semibold text-on-surface mb-3">Opciones Adicionales</label>
                        <div className="flex flex-col gap-3">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" className="w-4 h-4 text-primary rounded border-outline focus:ring-primary" />
                                <span className="text-body-sm text-on-surface">Solo productos con imágenes</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" className="w-4 h-4 text-primary rounded border-outline focus:ring-primary" />
                                <span className="text-body-sm text-on-surface">Productos recientemente añadidos</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-outline-variant/50 flex justify-between items-center bg-surface-container/30 rounded-b-2xl">
                    <button className="px-4 py-2 rounded-lg text-body-sm font-medium text-error hover:bg-error/10 transition-colors">Limpiar Filtros</button>
                    <div className="flex gap-3">
                        <button onClick={onClose} className="px-5 py-2 rounded-lg text-body-sm font-medium text-secondary hover:bg-surface-variant transition-colors">Cancelar</button>
                        <button onClick={onClose} className="px-6 py-2 rounded-lg text-body-sm font-medium bg-primary text-on-primary shadow-sm hover:bg-primary-container hover:text-on-primary-container transition-colors">
                            Aplicar Filtros
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
