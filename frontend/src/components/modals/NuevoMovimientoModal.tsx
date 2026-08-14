import React from 'react';

interface Props {
    onClose: () => void;
}

export const NuevoMovimientoModal = ({ onClose }: Props) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/50 backdrop-blur-sm p-4">
            <div className="bg-surface-container-lowest w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[90vh] border border-outline-variant">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-outline-variant/50">
                    <div>
                        <h2 className="text-[22px] font-bold text-on-surface">Registrar Movimiento</h2>
                        <p className="text-body-sm text-on-surface-variant mt-0.5">Entrada, salida o ajuste de inventario</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full text-on-surface-variant hover:bg-surface-variant/50 transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex flex-col gap-5">
                    {/* Tipo de movimiento */}
                    <div>
                        <label className="block text-body-sm font-semibold text-on-surface mb-2">Tipo de Movimiento</label>
                        <div className="flex gap-2">
                            {[
                                { val: 'entrada', label: 'Entrada', icon: 'add_circle', color: 'green' },
                                { val: 'salida', label: 'Salida', icon: 'remove_circle', color: 'red' },
                                { val: 'ajuste', label: 'Ajuste', icon: 'tune', color: 'yellow' },
                            ].map((t) => (
                                <label key={t.val} className="flex-1 flex flex-col items-center gap-1 p-3 border border-outline-variant rounded-xl cursor-pointer hover:bg-surface-container transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                                    <input type="radio" name="tipoMovimiento" value={t.val} className="sr-only" defaultChecked={t.val === 'entrada'} />
                                    <span className="material-symbols-outlined text-[24px]">{t.icon}</span>
                                    <span className="text-body-sm font-medium">{t.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Producto */}
                    <div>
                        <label className="block text-body-sm font-semibold text-on-surface mb-2">Producto <span className="text-error">*</span></label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
                            <input type="text" placeholder="Buscar producto por nombre o SKU..." className="w-full pl-9 pr-4 py-2.5 bg-surface border border-outline-variant rounded-lg text-body-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none" />
                        </div>
                    </div>

                    {/* Cantidad y Motivo */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-body-sm font-semibold text-on-surface mb-2">Cantidad <span className="text-error">*</span></label>
                            <input type="number" min="1" defaultValue={1} className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-lg text-body-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none" />
                        </div>
                        <div>
                            <label className="block text-body-sm font-semibold text-on-surface mb-2">Almacén</label>
                            <select className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-lg text-body-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all">
                                <option>Principal</option>
                                <option>Secundario</option>
                                <option>Depósito</option>
                            </select>
                        </div>
                    </div>

                    {/* Motivo */}
                    <div>
                        <label className="block text-body-sm font-semibold text-on-surface mb-2">Motivo / Referencia</label>
                        <input type="text" placeholder="Ej: Recepción OC-992, Venta V-8890, Ajuste por conteo..." className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-lg text-body-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none" />
                    </div>

                    {/* Notas */}
                    <div>
                        <label className="block text-body-sm font-semibold text-on-surface mb-2">Notas adicionales</label>
                        <textarea rows={3} placeholder="Notas opcionales sobre este movimiento..." className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-lg text-body-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none resize-none" />
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-outline-variant/50 flex justify-end gap-3 bg-surface-container/30 rounded-b-2xl">
                    <button onClick={onClose} className="px-5 py-2 rounded-lg text-body-sm font-medium text-secondary hover:bg-surface-variant transition-colors">Cancelar</button>
                    <button onClick={onClose} className="px-6 py-2 rounded-lg text-body-sm font-medium bg-primary text-on-primary shadow-sm hover:bg-primary-container hover:text-on-primary-container transition-colors">
                        Registrar Movimiento
                    </button>
                </div>
            </div>
        </div>
    );
};
