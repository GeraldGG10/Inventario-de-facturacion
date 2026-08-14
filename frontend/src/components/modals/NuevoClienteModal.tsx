import React from 'react';

interface Props {
    onClose: () => void;
}

export const NuevoClienteModal = ({ onClose }: Props) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/50 backdrop-blur-sm p-4">
<div className="bg-surface-container-lowest w-full max-w-lg rounded-2xl shadow-2xl flex flex-col border border-outline-variant max-h-[90vh]">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-outline-variant/50">
                    <div>
                        <h2 className="text-[22px] font-bold text-on-surface">Nuevo Cliente</h2>
                        <p className="text-body-sm text-on-surface-variant mt-0.5">Registra un nuevo cliente en el sistema</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full text-on-surface-variant hover:bg-surface-variant/50 transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 flex flex-col gap-4 overflow-y-auto max-h-[60vh] custom-scrollbar">
                    <div>
                        <label className="block text-body-sm font-semibold text-on-surface mb-2">Nombre o Razón Social <span className="text-error">*</span></label>
                        <input type="text" placeholder="Ej. Acme Corp" className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg text-body-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none" />
                    </div>
                    <div>
                        <label className="block text-body-sm font-semibold text-on-surface mb-2">RNC / Cédula <span className="text-error">*</span></label>
                        <input type="text" placeholder="Ej. 130-123456-1" className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg text-body-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-body-sm font-semibold text-on-surface mb-2">Teléfono</label>
                            <input type="tel" placeholder="(809) 555-0123" className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg text-body-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none" />
                        </div>
                        <div>
                            <label className="block text-body-sm font-semibold text-on-surface mb-2">Email</label>
                            <input type="email" placeholder="contacto@empresa.com" className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg text-body-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-body-sm font-semibold text-on-surface mb-2">Límite de Crédito</label>
                        <input type="number" placeholder="0.00" className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg text-body-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none font-data-mono" />
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-outline-variant/50 flex justify-end gap-3 bg-surface-container/30 rounded-b-2xl">
                    <button onClick={onClose} className="px-5 py-2 rounded-lg text-body-sm font-medium text-secondary hover:bg-surface-variant transition-colors">Cancelar</button>
                    <button onClick={onClose} className="px-5 py-2 rounded-lg text-body-sm font-medium bg-primary text-on-primary hover:bg-primary-container transition-colors shadow-sm">Guardar Cliente</button>
                </div>
            </div>
        </div>
    );
};
