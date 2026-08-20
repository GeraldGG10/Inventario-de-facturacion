import React, { useState } from 'react';
import { abrirArchivoConAuth } from '../../lib/api';

interface Props {
    onClose: () => void;
    periodo: string;
}

export const ExportarReporteModal = ({ onClose, periodo }: Props) => {
    const [selectedFormat, setSelectedFormat] = useState<'xlsx' | 'pdf' | null>(null);
    const [descargando, setDescargando] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function descargar() {
        if (!selectedFormat) return;
        setDescargando(true);
        setError(null);
        try {
            await abrirArchivoConAuth('/reportes/exportar', { formato: selectedFormat, periodo });
            onClose();
        } catch {
            setError('No se pudo generar el archivo');
        } finally {
            setDescargando(false);
        }
    }

    return (
        <>
            <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-40 transition-opacity" onClick={onClose}></div>

            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <div className="relative bg-surface-container-lowest w-full max-w-lg rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-outline-variant pointer-events-auto">
                    <div className="flex items-start justify-between p-6 border-b border-outline-variant shrink-0">
                        <div>
                            <h2 className="font-headline-md text-headline-md text-on-surface mb-2">Exportar reporte de ventas</h2>
                            <p className="font-body-sm text-body-sm text-on-surface-variant">Selecciona el formato de exportación.</p>
                        </div>
                        <button onClick={onClose} className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-full transition-colors">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    <div className="p-6 space-y-4">
                        {error && <p className="text-body-sm text-error">{error}</p>}
                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => setSelectedFormat('xlsx')} className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors ${selectedFormat === 'xlsx' ? 'border-primary bg-primary-container/10' : 'border-outline-variant hover:border-primary/50'}`}>
                                <span className="material-symbols-outlined text-[32px] text-green-600">description</span>
                                <span className="font-title-sm text-title-sm text-on-surface">Excel (.xlsx)</span>
                                <span className="font-body-sm text-body-sm text-on-surface-variant text-center text-xs">Con estilos y formato</span>
                            </button>
                            <button onClick={() => setSelectedFormat('pdf')} className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors ${selectedFormat === 'pdf' ? 'border-primary bg-primary-container/10' : 'border-outline-variant hover:border-primary/50'}`}>
                                <span className="material-symbols-outlined text-[32px] text-red-600">picture_as_pdf</span>
                                <span className="font-title-sm text-title-sm text-on-surface">PDF</span>
                                <span className="font-body-sm text-body-sm text-on-surface-variant text-center text-xs">Listo para imprimir</span>
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 p-4 border-t border-outline-variant shrink-0">
                        <button onClick={onClose} className="px-4 py-2 font-body-sm text-body-sm font-medium text-on-surface-variant hover:bg-surface-container-high rounded transition-colors">Cancelar</button>
                        <button onClick={descargar} disabled={!selectedFormat || descargando} className="px-4 py-2 font-body-sm text-body-sm font-medium rounded shadow-sm flex items-center gap-2 bg-primary text-on-primary disabled:opacity-50">
                            {descargando ? 'Generando…' : 'Descargar Reporte'}
                            <span className="material-symbols-outlined text-sm">download</span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};
