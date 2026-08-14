import React from 'react';

interface Props {
    onClose: () => void;
    facturaId?: string;
}

export const ExportarFacturaModal = ({ onClose, facturaId = 'INV-2023-4050' }: Props) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/40 backdrop-blur-sm p-4">
            <div className="bg-surface-container-lowest w-full max-w-md rounded-2xl shadow-2xl flex flex-col border border-outline-variant">
                <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant">
                    <h2 className="font-title-sm text-title-sm text-on-surface">Exportar Factura</h2>
                    <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-surface-container-high transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <p className="font-body-sm text-body-sm text-on-surface-variant">Selecciona el formato de exportación para la factura <span className="font-data-mono text-primary">{facturaId}</span>.</p>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { icon: 'picture_as_pdf', label: 'PDF', desc: 'Listo para imprimir', color: 'text-red-600' },
                            { icon: 'table_view', label: 'Excel', desc: 'Hoja de cálculo', color: 'text-green-600' },
                            { icon: 'code', label: 'XML/DGII', desc: 'Para declaración', color: 'text-blue-600' },
                            { icon: 'print', label: 'Imprimir', desc: 'Imprimir ahora', color: 'text-on-surface' },
                        ].map(opt => (
                            <button
                                key={opt.label}
                                onClick={onClose}
                                className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-outline-variant hover:border-primary bg-surface-container-lowest hover:bg-primary-container/10 transition-colors group"
                            >
                                <span className={`material-symbols-outlined text-[32px] ${opt.color} group-hover:text-primary`}>{opt.icon}</span>
                                <span className="font-title-sm text-title-sm text-on-surface">{opt.label}</span>
                                <span className="font-body-sm text-body-sm text-on-surface-variant text-center">{opt.desc}</span>
                            </button>
                        ))}
                    </div>
                </div>
                <div className="p-4 border-t border-outline-variant flex justify-end">
                    <button onClick={onClose} className="px-5 py-2 rounded-lg text-body-sm font-medium text-secondary hover:bg-surface-variant transition-colors">
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
};
