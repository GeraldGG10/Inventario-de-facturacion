import React from 'react';

interface Props {
    onClose: () => void;
}

export const ConfirmacionModal = ({ onClose }: Props) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/50 backdrop-blur-sm p-4">
<div className="bg-surface-container-lowest w-full max-w-md rounded-2xl shadow-2xl flex flex-col border border-outline-variant max-h-[90vh]">
                <div className="p-6 flex flex-col items-center text-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-[#008a00]/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[#008a00] text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    </div>
                    <h2 className="font-title-sm text-[20px] font-bold text-on-surface">¡Operación Exitosa!</h2>
                    <p className="text-body-sm text-on-surface-variant">Los cambios han sido guardados correctamente en el sistema.</p>
                </div>
                <div className="p-4 border-t border-outline-variant/50 flex justify-center gap-3 bg-surface-container/30 rounded-b-2xl">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 rounded-lg text-body-sm font-medium bg-primary text-on-primary shadow-sm hover:bg-primary-container hover:text-on-primary-container transition-colors"
                    >
                        Aceptar
                    </button>
                </div>
            </div>
        </div>
    );
};
