import React from 'react';

interface Props {
    onClose: () => void;
}

export const DetalleProductoModal = ({ onClose }: Props) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/50 backdrop-blur-sm p-4">
            <div className="bg-surface-container-lowest w-full max-w-lg rounded-2xl shadow-2xl flex flex-col border border-outline-variant max-h-[90vh]">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-outline-variant/50">
                    <h2 className="text-[22px] font-bold text-on-surface">Detalle del Producto</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-on-surface-variant hover:bg-surface-variant/50 transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex flex-col gap-5">
                    {/* Product Header */}
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl bg-surface-variant flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-on-surface-variant text-[36px]">laptop_mac</span>
                        </div>
                        <div>
                            <h3 className="text-[18px] font-bold text-on-surface">Laptop Pro X15</h3>
                            <p className="text-xs text-on-surface-variant">SKU: LPT-X15-001 • Electrónica</p>
                            <span className="inline-flex mt-1 items-center px-2 py-0.5 rounded-full bg-error/10 text-error text-[11px] font-bold uppercase">Agotado</span>
                        </div>
                    </div>

                    {/* Stock Details */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-surface-container p-4 rounded-xl text-center">
                            <p className="text-2xl font-bold text-error">0</p>
                            <p className="text-xs text-on-surface-variant mt-1">Stock Actual</p>
                        </div>
                        <div className="bg-surface-container p-4 rounded-xl text-center">
                            <p className="text-2xl font-bold text-on-surface">5</p>
                            <p className="text-xs text-on-surface-variant mt-1">Stock Mínimo</p>
                        </div>
                        <div className="bg-surface-container p-4 rounded-xl text-center">
                            <p className="text-2xl font-bold text-on-surface">100</p>
                            <p className="text-xs text-on-surface-variant mt-1">Stock Máximo</p>
                        </div>
                    </div>

                    {/* Info */}
                    <div className="flex flex-col gap-3">
                        {[
                            { label: 'Precio Unitario', value: '$1,499.00' },
                            { label: 'Proveedor Principal', value: 'TechWorld Supply' },
                            { label: 'Última Entrada', value: '2023-10-01 (50 ud.)' },
                            { label: 'Última Salida', value: '2023-10-24 (15 ud.)' },
                        ].map((item) => (
                            <div key={item.label} className="flex justify-between items-center border-b border-outline-variant/30 pb-2">
                                <span className="text-body-sm text-on-surface-variant">{item.label}</span>
                                <span className="text-body-sm font-medium text-on-surface font-data-mono">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-outline-variant/50 flex justify-end gap-3 bg-surface-container/30 rounded-b-2xl">
                    <button onClick={onClose} className="px-5 py-2 rounded-lg text-body-sm font-medium text-secondary hover:bg-surface-variant transition-colors">Cerrar</button>
                    <button onClick={onClose} className="px-6 py-2 rounded-lg text-body-sm font-medium bg-primary text-on-primary shadow-sm hover:bg-primary-container hover:text-on-primary-container transition-colors flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">add_circle</span>
                        Registrar Entrada
                    </button>
                </div>
            </div>
        </div>
    );
};
