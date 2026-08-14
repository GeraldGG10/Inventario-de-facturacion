import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import { TopProductosModal } from '../components/modals/TopProductosModal';
import { FiltroTransaccionesModal } from '../components/modals/FiltroTransaccionesModal';
import { HistorialTransaccionesModal } from '../components/modals/HistorialTransaccionesModal';
import { ReabastecimientoModal } from '../components/modals/ReabastecimientoModal';

export const Dashboard = () => {
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstance = useRef<Chart | null>(null);
    const [timeRange, setTimeRange] = useState<'Hoy' | 'Semana' | 'Mes'>('Semana');
    const [isTopProductosOpen, setIsTopProductosOpen] = useState(false);
    const [isFiltrosOpen, setIsFiltrosOpen] = useState(false);
    const [isHistorialOpen, setIsHistorialOpen] = useState(false);
    const [isReabastecimientoOpen, setIsReabastecimientoOpen] = useState(false);

    useEffect(() => {
        if (chartRef.current) {
            const ctx = chartRef.current.getContext('2d');
            if (!ctx) return;

            // Destroy previous instance if it exists
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }

            const primaryColor = '#004ac6';
            const secondaryColor = '#b7c8e1';

            // Datos dinámicos según el rango seleccionado
            let labels: string[] = [];
            let ventasData: number[] = [];
            let gananciasData: number[] = [];

            if (timeRange === 'Hoy') {
                labels = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];
                ventasData = [200, 450, 300, 800, 600, 1200, 950];
                gananciasData = [60, 150, 100, 250, 180, 400, 310];
            } else if (timeRange === 'Semana') {
                labels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
                ventasData = [1200, 1900, 1500, 2200, 1800, 2800, 2400];
                gananciasData = [400, 600, 500, 800, 650, 950, 850];
            } else if (timeRange === 'Mes') {
                labels = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'];
                ventasData = [8500, 11200, 9800, 14500];
                gananciasData = [2800, 3700, 3200, 4800];
            }

            const data = {
                labels: labels,
                datasets: [
                    {
                        label: 'Ventas',
                        data: ventasData,
                        borderColor: primaryColor,
                        backgroundColor: 'rgba(0, 74, 198, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true,
                        pointBackgroundColor: '#ffffff',
                        pointBorderColor: primaryColor,
                        pointRadius: 4,
                        pointHoverRadius: 6
                    },
                    {
                        label: 'Ganancias',
                        data: gananciasData,
                        borderColor: secondaryColor,
                        backgroundColor: 'transparent',
                        borderWidth: 2,
                        borderDash: [5, 5],
                        tension: 0.4,
                        pointBackgroundColor: secondaryColor,
                        pointBorderColor: '#ffffff',
                        pointRadius: 3
                    }
                ]
            };

            const config: any = {
                type: 'line',
                data: data,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                        mode: 'index',
                        intersect: false,
                    },
                    plugins: {
                        legend: {
                            position: 'top',
                            align: 'end',
                            labels: {
                                usePointStyle: true,
                                boxWidth: 8,
                                font: { family: 'Inter', size: 12 }
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(25, 28, 30, 0.9)',
                            titleFont: { family: 'Inter', size: 13 },
                            bodyFont: { family: 'Inter', size: 13 },
                            padding: 10,
                            cornerRadius: 4,
                            callbacks: {
                                label: function (context: any) {
                                    let label = context.dataset.label || '';
                                    if (label) label += ': ';
                                    if (context.parsed.y !== null) {
                                        label += new Intl.NumberFormat('es-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
                                    }
                                    return label;
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            grid: { display: false, drawBorder: false },
                            ticks: { font: { family: 'Inter', size: 12 }, color: '#737686' }
                        },
                        y: {
                            grid: { color: '#e0e3e5', drawBorder: false, borderDash: [5, 5] },
                            ticks: {
                                font: { family: 'Inter', size: 12 },
                                color: '#737686',
                                callback: function (value: any) { return '$' + value; }
                            }
                        }
                    }
                }
            };

            chartInstance.current = new Chart(ctx, config);
        }

        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [timeRange]);

    return (
        <>
            {/* Bento Grid Header / Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {/* Card 1 */}
                <div className="bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline/30 rounded-xl p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.1)] flex flex-col justify-between hover:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                        <span className="font-label-caps text-label-caps text-secondary dark:text-secondary-fixed-dim uppercase tracking-wider">Ventas del Día</span>
                        <div className="p-2 bg-primary-container/20 rounded-lg text-primary dark:text-primary-fixed">
                            <span className="material-symbols-outlined text-[20px]">point_of_sale</span>
                        </div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-on-surface dark:text-inverse-on-surface tracking-tight mb-1">$4,250.00</div>
                        <div className="flex items-center text-sm">
                            <span className="text-[#008a00] dark:text-[#a4f4a4] font-medium flex items-center bg-[#008a00]/10 px-1.5 py-0.5 rounded-full mr-2">
                                <span className="material-symbols-outlined text-[14px] mr-1">trending_up</span> +12.5%
                            </span>
                        </div>
                    </div>
                </div>

                {/* Card 2 */}
                <div className="bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline/30 rounded-xl p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.1)] flex flex-col justify-between hover:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                        <span className="font-label-caps text-label-caps text-secondary dark:text-secondary-fixed-dim uppercase tracking-wider">Ventas Semanales</span>
                        <div className="p-2 bg-secondary-container/30 rounded-lg text-primary dark:text-primary-fixed">
                            <span className="material-symbols-outlined text-[20px]">calendar_today</span>
                        </div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-on-surface dark:text-inverse-on-surface tracking-tight mb-1">$28,940.00</div>
                        <div className="flex items-center text-sm">
                            <span className="text-[#008a00] dark:text-[#a4f4a4] font-medium flex items-center bg-[#008a00]/10 px-1.5 py-0.5 rounded-full mr-2">
                                <span className="material-symbols-outlined text-[14px] mr-1">trending_up</span> +5.2%
                            </span>
                        </div>
                    </div>
                </div>

                {/* Card 3 */}
                <div className="bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline/30 rounded-xl p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.1)] flex flex-col justify-between hover:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                        <span className="font-label-caps text-label-caps text-secondary dark:text-secondary-fixed-dim uppercase tracking-wider">Ganancias Neta (Mes)</span>
                        <div className="p-2 bg-tertiary-container/10 rounded-lg text-tertiary">
                            <span className="material-symbols-outlined text-[20px]">attach_money</span>
                        </div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-on-surface dark:text-inverse-on-surface tracking-tight mb-1">$15,420.00</div>
                        <div className="flex items-center text-sm">
                            <span className="text-error dark:text-error-container font-medium flex items-center bg-error-container/30 px-1.5 py-0.5 rounded-full mr-2">
                                <span className="material-symbols-outlined text-[14px] mr-1">trending_down</span> -2.1%
                            </span>
                        </div>
                    </div>
                </div>

                {/* Card 4 */}
                <div className="bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline/30 rounded-xl p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.1)] flex flex-col justify-between hover:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                        <span className="font-label-caps text-label-caps text-secondary dark:text-secondary-fixed-dim uppercase tracking-wider">Alertas Stock</span>
                        <div className="p-2 bg-error-container/30 rounded-lg text-error">
                            <span className="material-symbols-outlined text-[20px]">warning</span>
                        </div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-on-surface dark:text-inverse-on-surface tracking-tight mb-1">12</div>
                        <div className="flex items-center text-sm">
                            <span className="text-error font-medium">Productos críticos</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Chart Section (Spans 2 columns) */}
                <div className="lg:col-span-2 bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline/30 rounded-xl p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.1)] flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-title-sm text-title-sm text-on-surface font-semibold">Rendimiento de Ventas y Ganancias</h3>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setTimeRange('Hoy')}
                                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${timeRange === 'Hoy' ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface border border-outline-variant text-on-surface-variant hover:bg-surface-container'}`}
                            >Hoy</button>
                            <button
                                onClick={() => setTimeRange('Semana')}
                                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${timeRange === 'Semana' ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface border border-outline-variant text-on-surface-variant hover:bg-surface-container'}`}
                            >Semana</button>
                            <button
                                onClick={() => setTimeRange('Mes')}
                                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${timeRange === 'Mes' ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface border border-outline-variant text-on-surface-variant hover:bg-surface-container'}`}
                            >Mes</button>
                        </div>
                    </div>
                    <div className="relative flex-1 w-full h-[300px]">
                        <canvas ref={chartRef}></canvas>
                    </div>
                </div>

                {/* Top Products */}
                <div className="flex flex-col gap-6">
                    <div className="bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline/30 rounded-xl p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.1)] flex-1 overflow-hidden flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-title-sm text-title-sm text-on-surface font-semibold">Top Productos (Mes)</h3>
                            <button onClick={() => setIsTopProductosOpen(true)} className="text-primary hover:text-primary-container text-sm font-medium">Ver todos</button>
                        </div>
                        <div className="overflow-x-auto flex-1">
                            <div className="overflow-x-auto w-full pb-2">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-outline-variant">
                                            <th className="pb-2 font-label-caps text-label-caps text-secondary font-medium">Producto</th>
                                            <th className="pb-2 font-label-caps text-label-caps text-secondary font-medium text-right">Cant.</th>
                                        </tr>
                                    </thead>
                                    <tbody className="font-body-sm text-body-sm text-on-surface">
                                        <tr className="border-b border-outline-variant/30 hover:bg-surface-container-lowest transition-colors">
                                            <td className="py-3">
                                                <div className="font-medium">Laptop Pro X15</div>
                                                <div className="text-xs text-on-surface-variant">Electrónica</div>
                                            </td>
                                            <td className="py-3 text-right font-data-mono text-data-mono">145</td>
                                        </tr>
                                        <tr className="border-b border-outline-variant/30 hover:bg-surface-container-lowest transition-colors">
                                            <td className="py-3">
                                                <div className="font-medium">Monitor UltraWide</div>
                                                <div className="text-xs text-on-surface-variant">Periféricos</div>
                                            </td>
                                            <td className="py-3 text-right font-data-mono text-data-mono">98</td>
                                        </tr>
                                        <tr className="border-b border-outline-variant/30 hover:bg-surface-container-lowest transition-colors">
                                            <td className="py-3">
                                                <div className="font-medium">Teclado Mecánico</div>
                                                <div className="text-xs text-on-surface-variant">Accesorios</div>
                                            </td>
                                            <td className="py-3 text-right font-data-mono text-data-mono">85</td>
                                        </tr>
                                        <tr className="hover:bg-surface-container-lowest transition-colors">
                                            <td className="py-3">
                                                <div className="font-medium">Mouse Inalámbrico</div>
                                                <div className="text-xs text-on-surface-variant">Accesorios</div>
                                            </td>
                                            <td className="py-3 text-right font-data-mono text-data-mono">72</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Section: Alertas y Últimas Ventas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Alertas de Inventario */}
                <div className="lg:col-span-1 bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline/30 rounded-xl p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.1)] flex flex-col">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="material-symbols-outlined text-error">warning</span>
                        <h3 className="font-title-sm text-title-sm text-on-surface font-semibold">Alertas de Inventario</h3>
                    </div>
                    <div className="flex flex-col gap-3">
                        <div className="p-3 border border-error/20 bg-error/5 rounded-lg flex items-start gap-3">
                            <div className="mt-0.5">
                                <span className="w-2 h-2 rounded-full bg-error inline-block animate-pulse"></span>
                            </div>
                            <div className="flex-1">
                                <div className="font-medium text-sm text-on-surface">Cartuchos Tinta Negra HP</div>
                                <div className="text-xs text-error font-medium mt-1">Agotado (0 ud. / Min: 10)</div>
                            </div>
                        </div>
                        <div className="p-3 border border-tertiary-container/20 bg-tertiary-container/5 rounded-lg flex items-start gap-3">
                            <div className="mt-0.5">
                                <span className="w-2 h-2 rounded-full bg-tertiary-container inline-block"></span>
                            </div>
                            <div className="flex-1">
                                <div className="font-medium text-sm text-on-surface">Papel Bond A4 Resma</div>
                                <div className="text-xs text-tertiary-container font-medium mt-1">Stock bajo (15 ud. / Min: 20)</div>
                            </div>
                        </div>
                        <div className="p-3 border border-tertiary-container/20 bg-tertiary-container/5 rounded-lg flex items-start gap-3">
                            <div className="mt-0.5">
                                <span className="w-2 h-2 rounded-full bg-tertiary-container inline-block"></span>
                            </div>
                            <div className="flex-1">
                                <div className="font-medium text-sm text-on-surface">Cable HDMI 2m</div>
                                <div className="text-xs text-tertiary-container font-medium mt-1">Stock bajo (5 ud. / Min: 15)</div>
                            </div>
                        </div>
                    </div>
                    <button onClick={() => setIsReabastecimientoOpen(true)} className="mt-4 w-full py-2 bg-surface hover:bg-surface-container border border-outline-variant rounded-lg text-sm font-medium text-on-surface-variant transition-colors">Revisar Reabastecimiento</button>
                </div>

                {/* Últimas Ventas Table */}
                <div className="lg:col-span-2 bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline/30 rounded-xl p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.1)] flex flex-col overflow-hidden">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-title-sm text-title-sm text-on-surface font-semibold">Últimas Transacciones</h3>
                        <button onClick={() => setIsFiltrosOpen(true)} className="px-3 py-1.5 border border-outline-variant rounded-lg text-sm font-medium text-secondary hover:bg-surface-container transition-colors flex items-center gap-1">
                            <span className="material-symbols-outlined text-[18px]">filter_list</span> Filtrar
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <div className="overflow-x-auto w-full pb-2">
                            <table className="w-full text-left border-collapse min-w-[600px]">
                                <thead>
                                    <tr className="border-b border-outline-variant bg-surface">
                                        <th className="py-3 px-4 font-label-caps text-label-caps text-secondary font-medium">Factura</th>
                                        <th className="py-3 px-4 font-label-caps text-label-caps text-secondary font-medium">Cliente</th>
                                        <th className="py-3 px-4 font-label-caps text-label-caps text-secondary font-medium">Fecha</th>
                                        <th className="py-3 px-4 font-label-caps text-label-caps text-secondary font-medium text-right">Total</th>
                                        <th className="py-3 px-4 font-label-caps text-label-caps text-secondary font-medium text-center">Estado</th>
                                        <th className="py-3 px-4 font-label-caps text-label-caps text-secondary font-medium text-center">Acción</th>
                                    </tr>
                                </thead>
                                <tbody className="font-body-sm text-body-sm text-on-surface">
                                    <tr className="border-b border-outline-variant/30 hover:bg-surface transition-colors cursor-pointer group">
                                        <td className="py-3 px-4 font-data-mono text-data-mono text-primary">#FAC-2023-0891</td>
                                        <td className="py-3 px-4 font-medium">Acme Corp.</td>
                                        <td className="py-3 px-4 text-on-surface-variant">Hoy, 14:30</td>
                                        <td className="py-3 px-4 text-right font-data-mono text-data-mono font-medium">$1,250.00</td>
                                        <td className="py-3 px-4 text-center">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#008a00]/10 text-[#008a00]">Pagado</span>
                                        </td>
                                        <td className="py-3 px-4 text-center text-on-surface-variant">
                                            <button onClick={() => setIsHistorialOpen(true)} className="p-1 rounded hover:bg-surface-container hover:text-primary transition-colors">
                                                <span className="material-symbols-outlined text-[20px]">open_in_new</span>
                                            </button>
                                        </td>
                                    </tr>
                                    <tr className="border-b border-outline-variant/30 hover:bg-surface transition-colors cursor-pointer group">
                                        <td className="py-3 px-4 font-data-mono text-data-mono text-primary">#FAC-2023-0890</td>
                                        <td className="py-3 px-4 font-medium">Tech Solutions SAC</td>
                                        <td className="py-3 px-4 text-on-surface-variant">Hoy, 11:15</td>
                                        <td className="py-3 px-4 text-right font-data-mono text-data-mono font-medium">$340.50</td>
                                        <td className="py-3 px-4 text-center">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-tertiary-container/10 text-tertiary-container">Pendiente</span>
                                        </td>
                                        <td className="py-3 px-4 text-center text-on-surface-variant">
                                            <button onClick={() => setIsHistorialOpen(true)} className="p-1 rounded hover:bg-surface-container hover:text-primary transition-colors">
                                                <span className="material-symbols-outlined text-[20px]">open_in_new</span>
                                            </button>
                                        </td>
                                    </tr>
                                    <tr className="border-b border-outline-variant/30 hover:bg-surface transition-colors cursor-pointer group">
                                        <td className="py-3 px-4 font-data-mono text-data-mono text-primary">#FAC-2023-0889</td>
                                        <td className="py-3 px-4 font-medium">Global Imports</td>
                                        <td className="py-3 px-4 text-on-surface-variant">Ayer, 16:45</td>
                                        <td className="py-3 px-4 text-right font-data-mono text-data-mono font-medium">$5,100.00</td>
                                        <td className="py-3 px-4 text-center">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#008a00]/10 text-[#008a00]">Pagado</span>
                                        </td>
                                        <td className="py-3 px-4 text-center text-on-surface-variant">
                                            <button onClick={() => setIsHistorialOpen(true)} className="p-1 rounded hover:bg-surface-container hover:text-primary transition-colors">
                                                <span className="material-symbols-outlined text-[20px]">open_in_new</span>
                                            </button>
                                        </td>
                                    </tr>
                                    <tr className="border-b border-outline-variant/30 hover:bg-surface transition-colors cursor-pointer group">
                                        <td className="py-3 px-4 font-data-mono text-data-mono text-primary">#FAC-2023-0888</td>
                                        <td className="py-3 px-4 font-medium">Juan Pérez</td>
                                        <td className="py-3 px-4 text-on-surface-variant">Ayer, 09:20</td>
                                        <td className="py-3 px-4 text-right font-data-mono text-data-mono font-medium">$85.00</td>
                                        <td className="py-3 px-4 text-center">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#008a00]/10 text-[#008a00]">Pagado</span>
                                        </td>
                                        <td className="py-3 px-4 text-center text-on-surface-variant">
                                            <button onClick={() => setIsHistorialOpen(true)} className="p-1 rounded hover:bg-surface-container hover:text-primary transition-colors">
                                                <span className="material-symbols-outlined text-[20px]">open_in_new</span>
                                            </button>
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-surface transition-colors cursor-pointer group">
                                        <td className="py-3 px-4 font-data-mono text-data-mono text-primary">#FAC-2023-0887</td>
                                        <td className="py-3 px-4 font-medium">Design Studio SA</td>
                                        <td className="py-3 px-4 text-on-surface-variant">22/10/2023</td>
                                        <td className="py-3 px-4 text-right font-data-mono text-data-mono font-medium">$890.00</td>
                                        <td className="py-3 px-4 text-center">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-error-container/20 text-error-container">Vencido</span>
                                        </td>
                                        <td className="py-3 px-4 text-center text-on-surface-variant">
                                            <button onClick={() => setIsHistorialOpen(true)} className="p-1 rounded hover:bg-surface-container hover:text-primary transition-colors">
                                                <span className="material-symbols-outlined text-[20px]">open_in_new</span>
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="mt-4 text-center">
                        <button onClick={() => setIsHistorialOpen(true)} className="text-primary hover:text-primary-container text-sm font-medium">Ver Historial Completo</button>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {isTopProductosOpen && <TopProductosModal onClose={() => setIsTopProductosOpen(false)} />}
            {isFiltrosOpen && <FiltroTransaccionesModal onClose={() => setIsFiltrosOpen(false)} />}
            {isHistorialOpen && <HistorialTransaccionesModal onClose={() => setIsHistorialOpen(false)} />}
            {isReabastecimientoOpen && <ReabastecimientoModal onClose={() => setIsReabastecimientoOpen(false)} />}
        </>
    );
};
