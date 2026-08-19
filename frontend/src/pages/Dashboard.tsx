import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import { TopProductosModal } from '../components/modals/TopProductosModal';
import { FiltroTransaccionesModal } from '../components/modals/FiltroTransaccionesModal';
import { HistorialTransaccionesModal } from '../components/modals/HistorialTransaccionesModal';
import { ReabastecimientoModal } from '../components/modals/ReabastecimientoModal';
import { api } from '../lib/api';

const formatoMoneda = new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' });

interface Ventas { totalVentas: number; totalFacturas: number; ticketPromedio: number }
interface Margen { ingresos: number; costos: number; margen: number; margenPorcentaje: number }
interface TendenciaPunto { fecha: string; ventas: number; costos: number; ganancias: number }
interface ProductoRotacion { id: string; nombre: string; categoria: string | null; unidadesVendidas: number; totalGenerado: number }
interface Alerta { id: string; nombre: string; stockActual: number; stockMinimo: number; estado: string }
interface FacturaReciente { id: number; cliente: string; fecha: string; total: number; metodoPago: string; estado: string }

const PERIODO_POR_RANGO = { Hoy: 'diario', Semana: 'semanal', Mes: 'mensual' } as const;

export const Dashboard = () => {
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstance = useRef<Chart | null>(null);
    const [timeRange, setTimeRange] = useState<'Hoy' | 'Semana' | 'Mes'>('Semana');

    const [ventasDia, setVentasDia] = useState<Ventas | null>(null);
    const [ventasSemana, setVentasSemana] = useState<Ventas | null>(null);
    const [margenMes, setMargenMes] = useState<Margen | null>(null);
    const [topProductos, setTopProductos] = useState<ProductoRotacion[]>([]);
    const [alertas, setAlertas] = useState<Alerta[]>([]);
    const [facturasRecientes, setFacturasRecientes] = useState<FacturaReciente[]>([]);
    const [tendencia, setTendencia] = useState<TendenciaPunto[]>([]);

    const [isTopProductosOpen, setIsTopProductosOpen] = useState(false);
    const [isFiltrosOpen, setIsFiltrosOpen] = useState(false);
    const [isHistorialOpen, setIsHistorialOpen] = useState(false);
    const [isReabastecimientoOpen, setIsReabastecimientoOpen] = useState(false);

    useEffect(() => {
        Promise.all([
            api.get<Ventas>('/dashboard/ventas', { periodo: 'diario' }),
            api.get<Ventas>('/dashboard/ventas', { periodo: 'semanal' }),
            api.get<Margen>('/dashboard/margen', { periodo: 'mensual' }),
            api.get<ProductoRotacion[]>('/dashboard/productos/rotacion', { limite: 4 }),
            api.get<Alerta[]>('/dashboard/reposicion'),
            api.get<FacturaReciente[]>('/dashboard/facturas/recientes'),
        ])
            .then(([dia, semana, margen, productos, reposicion, recientes]) => {
                setVentasDia(dia);
                setVentasSemana(semana);
                setMargenMes(margen);
                setTopProductos(productos);
                setAlertas(reposicion);
                setFacturasRecientes(recientes);
            })
            .catch((err) => console.error('No se pudo cargar el dashboard', err));
    }, []);

    useEffect(() => {
        api
            .get<TendenciaPunto[]>('/dashboard/tendencia', { periodo: PERIODO_POR_RANGO[timeRange] })
            .then(setTendencia)
            .catch((err) => console.error('No se pudo cargar la tendencia', err));
    }, [timeRange]);

    useEffect(() => {
        if (!chartRef.current) return;
        const ctx = chartRef.current.getContext('2d');
        if (!ctx) return;

        if (chartInstance.current) chartInstance.current.destroy();

        const primaryColor = '#004ac6';
        const secondaryColor = '#b7c8e1';
        const labels = tendencia.map((p) => new Date(p.fecha).toLocaleDateString('es-DO', { day: '2-digit', month: '2-digit' }));

        chartInstance.current = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Ventas',
                        data: tendencia.map((p) => p.ventas),
                        borderColor: primaryColor,
                        backgroundColor: 'rgba(0, 74, 198, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true,
                        pointBackgroundColor: '#ffffff',
                        pointBorderColor: primaryColor,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                    },
                    {
                        label: 'Ganancias',
                        data: tendencia.map((p) => p.ganancias),
                        borderColor: secondaryColor,
                        backgroundColor: 'transparent',
                        borderWidth: 2,
                        borderDash: [5, 5],
                        tension: 0.4,
                        pointBackgroundColor: secondaryColor,
                        pointBorderColor: '#ffffff',
                        pointRadius: 3,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                plugins: {
                    legend: { position: 'top', align: 'end', labels: { usePointStyle: true, boxWidth: 8, font: { family: 'Inter', size: 12 } } },
                    tooltip: {
                        backgroundColor: 'rgba(25, 28, 30, 0.9)',
                        callbacks: {
                            label: (context: any) => {
                                let label = context.dataset.label || '';
                                if (label) label += ': ';
                                if (context.parsed.y !== null) label += formatoMoneda.format(context.parsed.y);
                                return label;
                            },
                        },
                    },
                },
                scales: {
                    x: { grid: { display: false }, ticks: { font: { family: 'Inter', size: 12 }, color: '#737686' } },
                    y: { grid: { color: '#e0e3e5' }, ticks: { font: { family: 'Inter', size: 12 }, color: '#737686' } },
                },
            },
        });

        return () => chartInstance.current?.destroy();
    }, [tendencia]);

    return (
        <>
            {/* Bento Grid Header / Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline/30 rounded-xl p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.1)] flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-2">
                        <span className="font-label-caps text-label-caps text-secondary dark:text-secondary-fixed-dim uppercase tracking-wider">Ventas del Día</span>
                        <div className="p-2 bg-primary-container/20 rounded-lg text-primary dark:text-primary-fixed">
                            <span className="material-symbols-outlined text-[20px]">point_of_sale</span>
                        </div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-on-surface dark:text-inverse-on-surface tracking-tight mb-1">{formatoMoneda.format(ventasDia?.totalVentas ?? 0)}</div>
                        <div className="text-on-surface-variant text-xs">{ventasDia?.totalFacturas ?? 0} facturas hoy</div>
                    </div>
                </div>

                <div className="bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline/30 rounded-xl p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.1)] flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-2">
                        <span className="font-label-caps text-label-caps text-secondary dark:text-secondary-fixed-dim uppercase tracking-wider">Ventas Semanales</span>
                        <div className="p-2 bg-secondary-container/30 rounded-lg text-primary dark:text-primary-fixed">
                            <span className="material-symbols-outlined text-[20px]">calendar_today</span>
                        </div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-on-surface dark:text-inverse-on-surface tracking-tight mb-1">{formatoMoneda.format(ventasSemana?.totalVentas ?? 0)}</div>
                        <div className="text-on-surface-variant text-xs">{ventasSemana?.totalFacturas ?? 0} facturas esta semana</div>
                    </div>
                </div>

                <div className="bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline/30 rounded-xl p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.1)] flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-2">
                        <span className="font-label-caps text-label-caps text-secondary dark:text-secondary-fixed-dim uppercase tracking-wider">Ganancias Neta (Mes)</span>
                        <div className="p-2 bg-tertiary-container/10 rounded-lg text-tertiary">
                            <span className="material-symbols-outlined text-[20px]">attach_money</span>
                        </div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-on-surface dark:text-inverse-on-surface tracking-tight mb-1">{formatoMoneda.format(margenMes?.margen ?? 0)}</div>
                        <div className="text-on-surface-variant text-xs">Margen {margenMes?.margenPorcentaje ?? 0}%</div>
                    </div>
                </div>

                <div className="bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline/30 rounded-xl p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.1)] flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-2">
                        <span className="font-label-caps text-label-caps text-secondary dark:text-secondary-fixed-dim uppercase tracking-wider">Alertas Stock</span>
                        <div className="p-2 bg-error-container/30 rounded-lg text-error">
                            <span className="material-symbols-outlined text-[20px]">warning</span>
                        </div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-on-surface dark:text-inverse-on-surface tracking-tight mb-1">{alertas.length}</div>
                        <div className="flex items-center text-sm">
                            <span className="text-error font-medium">Productos críticos</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-2 bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline/30 rounded-xl p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.1)] flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-title-sm text-title-sm text-on-surface font-semibold">Rendimiento de Ventas y Ganancias</h3>
                        <div className="flex gap-2">
                            {(['Hoy', 'Semana', 'Mes'] as const).map((r) => (
                                <button
                                    key={r}
                                    onClick={() => setTimeRange(r)}
                                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${timeRange === r ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface border border-outline-variant text-on-surface-variant hover:bg-surface-container'}`}
                                >{r}</button>
                            ))}
                        </div>
                    </div>
                    <div className="relative flex-1 w-full h-[300px]">
                        <canvas ref={chartRef}></canvas>
                    </div>
                </div>

                <div className="flex flex-col gap-6">
                    <div className="bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline/30 rounded-xl p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.1)] flex-1 overflow-hidden flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-title-sm text-title-sm text-on-surface font-semibold">Top Productos (Mes)</h3>
                            <button onClick={() => setIsTopProductosOpen(true)} className="text-primary hover:text-primary-container text-sm font-medium">Ver todos</button>
                        </div>
                        <div className="overflow-x-auto flex-1">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-outline-variant">
                                        <th className="pb-2 font-label-caps text-label-caps text-secondary font-medium">Producto</th>
                                        <th className="pb-2 font-label-caps text-label-caps text-secondary font-medium text-right">Cant.</th>
                                    </tr>
                                </thead>
                                <tbody className="font-body-sm text-body-sm text-on-surface">
                                    {topProductos.length === 0 && (
                                        <tr><td colSpan={2} className="py-4 text-center text-on-surface-variant">Sin ventas todavía</td></tr>
                                    )}
                                    {topProductos.map((p) => (
                                        <tr key={p.id} className="border-b border-outline-variant/30 hover:bg-surface-container-lowest transition-colors">
                                            <td className="py-3">
                                                <div className="font-medium">{p.nombre}</div>
                                                <div className="text-xs text-on-surface-variant">{p.categoria ?? 'Sin categoría'}</div>
                                            </td>
                                            <td className="py-3 text-right font-data-mono text-data-mono">{p.unidadesVendidas}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Section: Alertas y Últimas Ventas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline/30 rounded-xl p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.1)] flex flex-col">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="material-symbols-outlined text-error">warning</span>
                        <h3 className="font-title-sm text-title-sm text-on-surface font-semibold">Alertas de Inventario</h3>
                    </div>
                    <div className="flex flex-col gap-3">
                        {alertas.length === 0 && <p className="text-body-sm text-on-surface-variant">Todo el inventario está en niveles saludables.</p>}
                        {alertas.slice(0, 4).map((a) => (
                            <div key={a.id} className={`p-3 border rounded-lg flex items-start gap-3 ${a.estado === 'agotado' ? 'border-error/20 bg-error/5' : 'border-tertiary-container/20 bg-tertiary-container/5'}`}>
                                <div className="mt-0.5">
                                    <span className={`w-2 h-2 rounded-full inline-block ${a.estado === 'agotado' ? 'bg-error animate-pulse' : 'bg-tertiary-container'}`}></span>
                                </div>
                                <div className="flex-1">
                                    <div className="font-medium text-sm text-on-surface">{a.nombre}</div>
                                    <div className={`text-xs font-medium mt-1 ${a.estado === 'agotado' ? 'text-error' : 'text-tertiary-container'}`}>
                                        {a.estado === 'agotado' ? 'Agotado' : 'Stock bajo'} ({a.stockActual} ud. / Min: {a.stockMinimo})
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button onClick={() => setIsReabastecimientoOpen(true)} className="mt-4 w-full py-2 bg-surface hover:bg-surface-container border border-outline-variant rounded-lg text-sm font-medium text-on-surface-variant transition-colors">Revisar Reabastecimiento</button>
                </div>

                <div className="lg:col-span-2 bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline/30 rounded-xl p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.1)] flex flex-col overflow-hidden">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-title-sm text-title-sm text-on-surface font-semibold">Últimas Transacciones</h3>
                        <button onClick={() => setIsFiltrosOpen(true)} className="px-3 py-1.5 border border-outline-variant rounded-lg text-sm font-medium text-secondary hover:bg-surface-container transition-colors flex items-center gap-1">
                            <span className="material-symbols-outlined text-[18px]">filter_list</span> Filtrar
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[600px]">
                            <thead>
                                <tr className="border-b border-outline-variant bg-surface">
                                    <th className="py-3 px-4 font-label-caps text-label-caps text-secondary font-medium">Factura</th>
                                    <th className="py-3 px-4 font-label-caps text-label-caps text-secondary font-medium">Cliente</th>
                                    <th className="py-3 px-4 font-label-caps text-label-caps text-secondary font-medium">Fecha</th>
                                    <th className="py-3 px-4 font-label-caps text-label-caps text-secondary font-medium text-right">Total</th>
                                    <th className="py-3 px-4 font-label-caps text-label-caps text-secondary font-medium text-center">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="font-body-sm text-body-sm text-on-surface">
                                {facturasRecientes.length === 0 && (
                                    <tr><td colSpan={5} className="py-6 text-center text-on-surface-variant">Sin facturas todavía</td></tr>
                                )}
                                {facturasRecientes.map((f) => (
                                    <tr key={f.id} onClick={() => setIsHistorialOpen(true)} className="border-b border-outline-variant/30 hover:bg-surface transition-colors cursor-pointer group">
                                        <td className="py-3 px-4 font-data-mono text-data-mono text-primary">#{f.id}</td>
                                        <td className="py-3 px-4 font-medium">{f.cliente}</td>
                                        <td className="py-3 px-4 text-on-surface-variant">{new Date(f.fecha).toLocaleString('es-DO')}</td>
                                        <td className="py-3 px-4 text-right font-data-mono text-data-mono font-medium">{formatoMoneda.format(f.total)}</td>
                                        <td className="py-3 px-4 text-center">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${f.estado === 'anulada' ? 'bg-error-container/20 text-error-container' : 'bg-[#008a00]/10 text-[#008a00]'}`}>
                                                {f.estado === 'anulada' ? 'Anulada' : 'Emitida'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-4 text-center">
                        <button onClick={() => setIsHistorialOpen(true)} className="text-primary hover:text-primary-container text-sm font-medium">Ver Historial Completo</button>
                    </div>
                </div>
            </div>

            {isTopProductosOpen && <TopProductosModal onClose={() => setIsTopProductosOpen(false)} productos={topProductos} />}
            {isFiltrosOpen && <FiltroTransaccionesModal onClose={() => setIsFiltrosOpen(false)} />}
            {isHistorialOpen && (
                <HistorialTransaccionesModal
                    onClose={() => setIsHistorialOpen(false)}
                    transacciones={facturasRecientes.map((f) => ({ id: f.id, numero: `FAC-${String(f.id).padStart(6, '0')}`, cliente: f.cliente, fecha: f.fecha, total: f.total, estado: f.estado }))}
                />
            )}
            {isReabastecimientoOpen && <ReabastecimientoModal onClose={() => setIsReabastecimientoOpen(false)} alertas={alertas} />}
        </>
    );
};
