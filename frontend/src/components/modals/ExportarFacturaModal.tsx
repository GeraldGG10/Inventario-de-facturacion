import React, { useState } from 'react';
import { abrirArchivoConAuth } from '../../lib/api';

interface Props {
    onClose: () => void;
    facturaId: number;
    numero: string;
}

export const ExportarFacturaModal = ({ onClose, facturaId, numero }: Props) => {
    const [error, setError] = useState<string | null>(null);

    async function handlePdf() {
        try {
            await abrirArchivoConAuth(`/facturas/${facturaId}/pdf`);
            onClose();
        } catch {
            setError('No se pudo generar el PDF');
        }
    }

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
                    <p className="font-body-sm text-body-sm text-on-surface-variant">Selecciona el formato de exportación para la factura <span className="font-data-mono text-primary">{numero}</span>.</p>
                    {error && <p className="text-body-sm text-error">{error}</p>}
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={handlePdf} className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-outline-variant hover:border-primary bg-surface-container-lowest hover:bg-primary-container/10 transition-colors group">
                            <span className="material-symbols-outlined text-[32px] text-red-600 group-hover:text-primary">picture_as_pdf</span>
                            <span className="font-title-sm text-title-sm text-on-surface">PDF</span>
                            <span className="font-body-sm text-body-sm text-on-surface-variant text-center">Listo para imprimir</span>
                        </button>
                        <button onClick={handlePdf} className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-outline-variant hover:border-primary bg-surface-container-lowest hover:bg-primary-container/10 transition-colors group">
                            <span className="material-symbols-outlined text-[32px] text-on-surface group-hover:text-primary">print</span>
                            <span className="font-title-sm text-title-sm text-on-surface">Imprimir</span>
                            <span className="font-body-sm text-body-sm text-on-surface-variant text-center">Abre el PDF para imprimir</span>
                        </button>
                    </div>
                </div>
                <div className="p-4 border-t border-outline-variant flex justify-end">
                    <button onClick={onClose} className="px-5 py-2 rounded-lg text-body-sm font-medium text-secondary hover:bg-surface-variant transition-colors">Cerrar</button>
                </div>
            </div>
        </div>
    );
};
