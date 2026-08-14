import React, { useState } from 'react';

interface Props {
    onClose: () => void;
}

export const ExportarReporteModal = ({ onClose }: Props) => {
    const [selectedFormat, setSelectedFormat] = useState<string | null>(null);

    return (
        <>
            {/* Modal Backdrop */}
            <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-40 transition-opacity" onClick={onClose}></div>
            
            {/* Modal Container */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <div className="relative bg-surface-container-lowest w-full max-w-3xl rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-outline-variant pointer-events-auto">
                    
                    {/* Header */}
                    <div className="flex items-start justify-between p-stack-lg border-b border-outline-variant shrink-0 bg-surface-container-lowest">
                        <div>
                            <h2 className="font-headline-md text-headline-md text-on-surface mb-2">Exportar reporte</h2>
                            <p className="font-body-sm text-body-sm text-on-surface-variant">Selecciona el formato y revisa la información que será incluida en el documento.</p>
                        </div>
                        <button 
                            onClick={onClose}
                            className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-full transition-colors"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    
                    {/* Scrollable Content */}
                    <div className="p-stack-lg overflow-y-auto flex-1 bg-surface-bright space-y-stack-lg">
                        {/* Section 1: Información del reporte */}
                        <section className="bg-surface-container-lowest border border-outline-variant rounded-lg p-stack-md shadow-sm">
                            <h3 className="font-title-sm text-title-sm text-on-surface mb-stack-md flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">info</span>
                                Información del reporte
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-md">
                                <div className="flex flex-col">
                                    <span className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">Tipo de reporte</span>
                                    <span className="font-body-md text-body-md text-on-surface font-medium">Análisis de Rendimiento</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">Período</span>
                                    <span className="font-body-md text-body-md text-on-surface font-medium">Mes</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">Rango de fechas</span>
                                    <span className="font-data-mono text-data-mono text-on-surface font-medium">01/08/2026 - 13/08/2026</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">Generado el</span>
                                    <span className="font-data-mono text-data-mono text-on-surface font-medium">13/08/2026 - 11:02 AM</span>
                                </div>
                            </div>
                        </section>
                        
                        {/* Section 2: Información incluida */}
                        <section>
                            <h3 className="font-title-sm text-title-sm text-on-surface mb-stack-sm flex items-center gap-2">
                                <span className="material-symbols-outlined text-secondary">list_alt</span>
                                Información incluida
                            </h3>
                            <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-stack-md shadow-sm">
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6">
                                    <li className="flex items-start gap-2">
                                        <span className="material-symbols-outlined text-primary text-sm mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                        <span className="font-body-sm text-body-sm text-on-surface">Ingresos totales</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="material-symbols-outlined text-primary text-sm mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                        <span className="font-body-sm text-body-sm text-on-surface">Costos operativos</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="material-symbols-outlined text-primary text-sm mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                        <span className="font-body-sm text-body-sm text-on-surface">Margen neto</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="material-symbols-outlined text-primary text-sm mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                        <span className="font-body-sm text-body-sm text-on-surface">Comparación con el período anterior</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="material-symbols-outlined text-primary text-sm mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                        <span className="font-body-sm text-body-sm text-on-surface">Ventas por categoría</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="material-symbols-outlined text-primary text-sm mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                        <span className="font-body-sm text-body-sm text-on-surface">Estado actual del inventario</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="material-symbols-outlined text-primary text-sm mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                        <span className="font-body-sm text-body-sm text-on-surface">Productos procesados</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="material-symbols-outlined text-primary text-sm mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                        <span className="font-body-sm text-body-sm text-on-surface">Resumen general de ventas</span>
                                    </li>
                                </ul>
                            </div>
                        </section>
                        
                        {/* Section 3: Format Selection */}
                        <section>
                            <h3 className="font-title-sm text-title-sm text-on-surface mb-stack-sm flex items-center gap-2">
                                <span className="material-symbols-outlined text-secondary">file_download</span>
                                Seleccionar formato de exportación
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-md">
                                {/* Excel Option */}
                                <button 
                                    onClick={() => setSelectedFormat('excel')}
                                    className={`flex flex-col text-left bg-surface-container-lowest border transition-all duration-200 rounded-lg p-stack-md group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 relative overflow-hidden shadow-sm hover:shadow-md ${selectedFormat === 'excel' ? 'border-primary ring-2 ring-primary ring-offset-1' : 'border-outline-variant hover:border-primary hover:bg-surface-container-low'}`}
                                >
                                    <div className="flex items-center gap-3 mb-3 w-full">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${selectedFormat === 'excel' ? 'bg-primary text-on-primary' : 'bg-secondary-container text-primary group-hover:bg-primary group-hover:text-on-primary'}`}>
                                            <span className="material-symbols-outlined">description</span>
                                        </div>
                                        <span className="font-title-sm text-title-sm text-on-surface font-semibold">Exportar a Excel</span>
                                    </div>
                                    <p className="font-body-sm text-body-sm text-on-surface-variant flex-1">
                                        Documento <strong className="font-medium text-on-surface">.xlsx</strong> estructurado en hojas: Resumen (Ingresos, Costos, Margen), Ventas por categoría, Inventario (SKU, Producto, Categoría, Stock) y Detalle de ventas.
                                    </p>
                                </button>
                                
                                {/* PDF Option */}
                                <button 
                                    onClick={() => setSelectedFormat('pdf')}
                                    className={`flex flex-col text-left bg-surface-container-lowest border transition-all duration-200 rounded-lg p-stack-md group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 relative overflow-hidden shadow-sm hover:shadow-md ${selectedFormat === 'pdf' ? 'border-error ring-2 ring-error ring-offset-1' : 'border-outline-variant hover:border-primary hover:bg-surface-container-low'}`}
                                >
                                    <div className="flex items-center gap-3 mb-3 w-full">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${selectedFormat === 'pdf' ? 'bg-error text-on-error' : 'bg-error-container text-error group-hover:bg-error group-hover:text-on-error'}`}>
                                            <span className="material-symbols-outlined">picture_as_pdf</span>
                                        </div>
                                        <span className="font-title-sm text-title-sm text-on-surface font-semibold">Exportar a PDF</span>
                                    </div>
                                    <p className="font-body-sm text-body-sm text-on-surface-variant flex-1">
                                        Documento de diseño profesional. Incluye gráficos visuales de ventas por categoría, resumen de inventario (Óptimo, Reorden, Crítico) y totales generales.
                                    </p>
                                </button>
                            </div>
                        </section>
                    </div>
                    
                    {/* Footer Actions */}
                    <div className="flex items-center justify-end gap-3 p-stack-md border-t border-outline-variant bg-surface-container-lowest shrink-0">
                        <button 
                            onClick={onClose}
                            className="px-4 py-2 font-body-sm text-body-sm font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                        >
                            Cancelar
                        </button>
                        <button 
                            className={`px-4 py-2 font-body-sm text-body-sm font-medium rounded transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 shadow-sm flex items-center gap-2 ${selectedFormat ? 'bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container' : 'bg-primary text-on-primary opacity-50 cursor-not-allowed'}`}
                            disabled={!selectedFormat}
                        >
                            Descargar Reporte
                            <span className="material-symbols-outlined text-sm">download</span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};
