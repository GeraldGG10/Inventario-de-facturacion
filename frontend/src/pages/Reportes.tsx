import React, { useState } from 'react';
import { ExportarReporteModal } from '../components/modals/ExportarReporteModal';
import { Link } from 'react-router-dom';

export const Reportes = () => {
    const [isExportarModalOpen, setIsExportarModalOpen] = useState(false);
    const [timeFilter, setTimeFilter] = useState('Mes');

    return (
        <div className="max-w-[1440px] mx-auto flex flex-col gap-6 pb-20">
            {/* Page Header & Actions (Bento header area) */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <div>
                    <h2 className="font-display-lg text-display-lg text-on-surface">Análisis de Rendimiento</h2>
                    <p className="font-body-sm text-body-sm text-secondary mt-1">Resumen financiero y operativo actualizado.</p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                    {/* Date Range Selector */}
                    <div className="bg-surface-container-low border border-outline-variant rounded-lg p-1 flex">
                        {['Hoy', 'Semana', 'Mes', 'Año'].map((tf) => (
                            <button 
                                key={tf}
                                onClick={() => setTimeFilter(tf)}
                                className={`px-4 py-1.5 rounded-md font-body-sm text-body-sm transition-colors ${timeFilter === tf ? 'text-primary font-bold bg-surface-container-lowest shadow-sm' : 'text-secondary hover:bg-surface-container'}`}
                            >
                                {tf}
                            </button>
                        ))}
                    </div>
                    {/* Export Actions */}
                    <div className="flex gap-2 w-full sm:w-auto">
                        <button onClick={() => setIsExportarModalOpen(true)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-outline-variant rounded-lg font-body-sm text-body-sm text-on-surface hover:bg-surface-container transition-colors bg-surface-container-lowest">
                            <span className="material-symbols-outlined text-sm">description</span>
                            Exportar Excel
                        </button>
                        <button onClick={() => setIsExportarModalOpen(true)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg font-body-sm text-body-sm hover:bg-primary-fixed-variant transition-colors shadow-sm">
                            <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
                            Exportar PDF
                        </button>
                    </div>
                </div>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Ingresos */}
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm flex flex-col gap-2 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="flex justify-between items-start z-10">
                        <span className="font-label-caps text-label-caps text-secondary uppercase tracking-wider">Ingresos Totales</span>
                        <span className="material-symbols-outlined text-primary bg-primary-container text-on-primary-container p-2 rounded-lg">payments</span>
                    </div>
                    <div className="z-10 mt-2">
                        <h3 className="font-display-lg text-display-lg text-on-surface">$124,500.00</h3>
                        <div className="flex items-center gap-1 mt-1 text-sm font-data-mono text-[#006841] bg-[#006841]/10 px-2 py-0.5 rounded-full w-max">
                            <span className="material-symbols-outlined text-[14px]">trending_up</span>
                            <span>+14.5% vs mes anterior</span>
                        </div>
                    </div>
                </div>
                
                {/* Costos */}
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm flex flex-col gap-2 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-error/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="flex justify-between items-start z-10">
                        <span className="font-label-caps text-label-caps text-secondary uppercase tracking-wider">Costos Operativos</span>
                        <span className="material-symbols-outlined text-error bg-error-container text-on-error-container p-2 rounded-lg">account_balance_wallet</span>
                    </div>
                    <div className="z-10 mt-2">
                        <h3 className="font-display-lg text-display-lg text-on-surface">$82,340.50</h3>
                        <div className="flex items-center gap-1 mt-1 text-sm font-data-mono text-error bg-error/10 px-2 py-0.5 rounded-full w-max">
                            <span className="material-symbols-outlined text-[14px]">trending_down</span>
                            <span>-2.1% vs mes anterior</span>
                        </div>
                    </div>
                </div>
                
                {/* Margen */}
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm flex flex-col gap-2 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#006841]/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="flex justify-between items-start z-10">
                        <span className="font-label-caps text-label-caps text-secondary uppercase tracking-wider">Margen Neto</span>
                        <span className="material-symbols-outlined text-[#006841] bg-[#006841]/10 p-2 rounded-lg">show_chart</span>
                    </div>
                    <div className="z-10 mt-2">
                        <h3 className="font-display-lg text-display-lg text-on-surface">33.8%</h3>
                        <div className="flex items-center gap-1 mt-1 text-sm font-data-mono text-[#006841] bg-[#006841]/10 px-2 py-0.5 rounded-full w-max">
                            <span className="material-symbols-outlined text-[14px]">trending_up</span>
                            <span>+4.2% objetivo superado</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Complex Reports Area (Bento Layout) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                {/* Sales Report (Spans 2 columns) */}
                <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm flex flex-col h-[400px]">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-title-sm text-title-sm text-on-surface">Reporte de Ventas por Categoría</h3>
                        <button className="p-1 rounded hover:bg-surface-container transition-colors text-secondary">
                            <span className="material-symbols-outlined">more_vert</span>
                        </button>
                    </div>
                    
                    {/* Simulated Bar Chart Canvas */}
                    <div className="flex-1 w-full relative flex items-end justify-between px-4 pb-8 pt-4 gap-2 border-l border-b border-outline-variant/50">
                        {/* Y Axis Labels */}
                        <div className="absolute -left-10 top-0 bottom-8 flex flex-col justify-between font-label-caps text-label-caps text-secondary">
                            <span>100k</span>
                            <span>75k</span>
                            <span>50k</span>
                            <span>25k</span>
                        </div>
                        {/* Grid Lines */}
                        <div className="absolute inset-0 left-0 bottom-8 border-t border-b border-outline-variant/20 flex flex-col justify-between pointer-events-none">
                            <div className="border-t border-outline-variant/20 w-full"></div>
                            <div className="border-t border-outline-variant/20 w-full"></div>
                            <div className="border-t border-outline-variant/20 w-full"></div>
                        </div>
                        {/* Bars */}
                        <div className="w-full bg-primary/20 rounded-t-sm h-[80%] relative group cursor-pointer hover:bg-primary transition-colors">
                            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 font-label-caps text-label-caps text-secondary whitespace-nowrap">Electrónica</div>
                        </div>
                        <div className="w-full bg-primary/40 rounded-t-sm h-[45%] relative group cursor-pointer hover:bg-primary transition-colors">
                            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 font-label-caps text-label-caps text-secondary whitespace-nowrap">Hogar</div>
                        </div>
                        <div className="w-full bg-primary/60 rounded-t-sm h-[95%] relative group cursor-pointer hover:bg-primary transition-colors">
                            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 font-label-caps text-label-caps text-secondary whitespace-nowrap">Industrial</div>
                        </div>
                        <div className="w-full bg-primary/30 rounded-t-sm h-[60%] relative group cursor-pointer hover:bg-primary transition-colors">
                            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 font-label-caps text-label-caps text-secondary whitespace-nowrap">Servicios</div>
                        </div>
                        <div className="w-full bg-primary/50 rounded-t-sm h-[30%] relative group cursor-pointer hover:bg-primary transition-colors">
                            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 font-label-caps text-label-caps text-secondary whitespace-nowrap">Otros</div>
                        </div>
                    </div>
                </div>

                {/* Inventory Report (Vertical Layout) */}
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm flex flex-col h-[400px]">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-title-sm text-title-sm text-on-surface">Estado de Inventario</h3>
                        <span className="material-symbols-outlined text-secondary">inventory</span>
                    </div>
                    <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2 hide-scrollbar">
                        {/* Inventory Item Line */}
                        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer border border-transparent hover:border-outline-variant">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center text-primary">
                                    <span className="material-symbols-outlined">memory</span>
                                </div>
                                <div>
                                    <p className="font-data-mono text-on-surface">SKU-A892</p>
                                    <p className="font-label-caps text-label-caps text-secondary">Procesadores X</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-body-md text-body-md font-semibold text-on-surface">1,204</p>
                                <p className="font-label-caps text-label-caps text-[#006841]">Óptimo</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer border border-transparent hover:border-outline-variant">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded bg-tertiary/10 flex items-center justify-center text-tertiary">
                                    <span className="material-symbols-outlined">monitor</span>
                                </div>
                                <div>
                                    <p className="font-data-mono text-on-surface">SKU-B441</p>
                                    <p className="font-label-caps text-label-caps text-secondary">Monitores 27"</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-body-md text-body-md font-semibold text-on-surface">45</p>
                                <p className="font-label-caps text-label-caps text-tertiary">Reorden</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer border border-transparent hover:border-outline-variant">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded bg-error/10 flex items-center justify-center text-error">
                                    <span className="material-symbols-outlined">cable</span>
                                </div>
                                <div>
                                    <p className="font-data-mono text-on-surface">SKU-C109</p>
                                    <p className="font-label-caps text-label-caps text-secondary">Cables Red</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-body-md text-body-md font-semibold text-on-surface">12</p>
                                <p className="font-label-caps text-label-caps text-error">Crítico</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer border border-transparent hover:border-outline-variant">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded bg-secondary-container flex items-center justify-center text-on-secondary-container">
                                    <span className="material-symbols-outlined">router</span>
                                </div>
                                <div>
                                    <p className="font-data-mono text-on-surface">SKU-R002</p>
                                    <p className="font-label-caps text-label-caps text-secondary">Routers Pro</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-body-md text-body-md font-semibold text-on-surface">340</p>
                                <p className="font-label-caps text-label-caps text-[#006841]">Óptimo</p>
                            </div>
                        </div>
                    </div>
                    <Link to="/inventario" className="mt-4 w-full text-center font-label-caps text-label-caps text-primary hover:bg-surface-container py-2 rounded-lg transition-colors block">
                        VER INVENTARIO COMPLETO
                    </Link>
                </div>
            </div>

            {/* Modals */}
            {isExportarModalOpen && <ExportarReporteModal onClose={() => setIsExportarModalOpen(false)} />}
        </div>
    );
};
