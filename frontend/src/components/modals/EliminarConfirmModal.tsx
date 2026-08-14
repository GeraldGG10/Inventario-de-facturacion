import React from 'react';

interface Props {
    titulo?: string;
    mensaje?: string;
    labelConfirmar?: string;
    onClose: () => void;
    onConfirmar: () => void;
}

export const EliminarConfirmModal = ({
    titulo = '¿Eliminar registro?',
    mensaje = 'Esta acción no se puede deshacer. El registro será eliminado permanentemente del sistema.',
    labelConfirmar = 'Sí, eliminar',
    onClose,
    onConfirmar,
}: Props) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/50 backdrop-blur-sm p-4">
<div className="bg-surface-container-lowest w-full max-w-sm rounded-2xl shadow-2xl flex flex-col border border-outline-variant max-h-[90vh]">
                <div className="p-6 flex flex-col items-center text-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-error/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-error text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                    </div>
                    <h2 className="font-title-sm text-[20px] font-bold text-on-surface">{titulo}</h2>
                    <p className="text-body-sm text-on-surface-variant">{mensaje}</p>
                </div>
                <div className="p-4 border-t border-outline-variant/50 flex justify-end gap-3 bg-surface-container/30 rounded-b-2xl">
                    <button onClick={onClose} className="px-5 py-2 rounded-lg text-body-sm font-medium text-secondary hover:bg-surface-variant transition-colors">
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirmar}
                        className="px-6 py-2 rounded-lg text-body-sm font-medium bg-error text-on-error shadow-sm hover:bg-error/90 transition-colors"
                    >
                        {labelConfirmar}
                    </button>
                </div>
            </div>
        </div>
    );
};
