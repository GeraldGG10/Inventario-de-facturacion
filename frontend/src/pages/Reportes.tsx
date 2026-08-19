import React, { useEffect, useState } from 'react';
import { ExportarReporteModal } from '../components/modals/ExportarReporteModal';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';

const PERIODOS = [{ label: 'Hoy', val: 'hoy' }, { label: 'Semana', val: 'semana' }, { label: 'Mes', val: 'mes' }, { label: 'Año', val: 'anio' }];
const formatoMoneda = new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' });

interface Financiero { ingresos: number; costos: number; ganancias: number; margen: number }
interface VentaGrupo { etiqueta: string; ventas: number }
interface ProductoInventario { id: string; codigo: string; nombre: string; stockActual: number; stockMinimo: number }

export const Reportes = () => {
    const [isExportarModalOpen, setIsExportarModalOpen] = useState(false);
    const [periodo, setPeriodo] = useState('mes');
    const [financiero, setFinanciero] = useState<Financiero | null>(null);
    const [ventasPorCategoria, setVentasPorCategoria] = useState<VentaGrupo[]>([]);
    const [masVendidos, setMasVendidos] = useState<ProductoInventario[]>([]);
    const [agotados, setAgotados] = useState<ProductoInventario[]>([]);

    useEffect(() => {
        api.get<Financiero>('/reportes/financiero', { periodo }).then(setFinanciero).catch(() => {});
        api.get<VentaGrupo[]>('/reportes/ventas', { periodo, agruparPor: 'categoria' }).then(setVentasPorCategoria).catch(() => {});
    }, [periodo]);

    useEffect(() => {
        api.get('/reportes/inventario').then((data) => { setMasVendidos(data.masVendidos); setAgotados([...data.agotados, ...data.stockBajo].slice(0, 6)); }).catch(() => {});
    }, []);

    const maxVenta = Math.max(1, ...ventasPorCategoria.map((v) => v.ventas));

    return (
        <div className="max-w-[1440px] mx-auto flex flex-col gap-6 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <div>
                    <h2 className="font-display-lg text-display-lg text-on-surface">Análisis de Rendimiento</h2>
                    <p className="font-body-sm text-body-sm text-secondary mt-1">Resumen financiero y operativo actualizado.</p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                    <div className="bg-surface-container-low border border-outline-variant rounded-lg p-1 flex">
                        {PERIODOS.map((tf) => (
                            <button key={tf.val} onClick={() => setPeriodo(tf.val)} className={`px-4 py-1.5 rounded-md font-body-sm text-body-sm transition-colors ${periodo === tf.val ? 'text-primary font-bold bg-surface-container-lowest shadow-sm' : 'text-secondary hover:bg-surface-container'}`}>
                                {tf.label}
                            </button>
                        ))}
                    </div>
                    <button onClick={() => setIsExportarModalOpen(true)} className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg font-body-sm text-body-sm hover:bg-primary-fixed-variant transition-colors shadow-sm">
                        <span className="material-symbols-outlined text-sm">download</span>
                        Exportar
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm flex flex-col gap-2">
                    <span className="font-label-caps text-label-caps text-secondary uppercase tracking-wider">Ingresos Totales</span>
                    <h3 className="text-3xl font-bold text-on-surface mt-2">{formatoMoneda.format(financiero?.ingresos ?? 0)}</h3>
                </div>
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm flex flex-col gap-2">
                    <span className="font-label-caps text-label-caps text-secondary uppercase tracking-wider">Costos Operativos</span>
                    <h3 className="text-3xl font-bold text-on-surface mt-2">{formatoMoneda.format(financiero?.costos ?? 0)}</h3>
                </div>
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm flex flex-col gap-2">
                    <span className="font-label-caps text-label-caps text-secondary uppercase tracking-wider">Margen Neto</span>
                    <h3 className="text-3xl font-bold text-on-surface mt-2">{financiero?.margen ?? 0}%</h3>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm flex flex-col min-h-[400px]">
                    <h3 className="font-title-sm text-title-sm text-on-surface mb-6">Ventas por Categoría</h3>
                    {ventasPorCategoria.length === 0 ? (
                        <p className="text-on-surface-variant text-body-sm flex-1 flex items-center justify-center">Sin ventas en este período.</p>
                    ) : (
                        <div className="flex-1 w-full flex items-end justify-around gap-4 pb-8 pt-4 border-l border-b border-outline-variant/50">
                            {ventasPorCategoria.slice(0, 6).map((v) => (
                                <div key={v.etiqueta} className="flex-1 flex flex-col items-center justify-end h-full">
                                    <div className="w-full bg-primary/50 rounded-t-sm relative group cursor-default" style={{ height: `${Math.max(4, (v.ventas / maxVenta) * 100)}%` }}>
                                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-medium text-on-surface whitespace-nowrap">{formatoMoneda.format(v.ventas)}</div>
                                    </div>
                                    <div className="mt-2 font-label-caps text-label-caps text-secondary whitespace-nowrap">{v.etiqueta}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm flex flex-col min-h-[400px]">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-title-sm text-title-sm text-on-surface">Estado de Inventario</h3>
                        <span className="material-symbols-outlined text-secondary">inventory</span>
                    </div>
                    <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2">
                        {agotados.length === 0 && <p className="text-on-surface-variant text-body-sm">Sin alertas de stock.</p>}
                        {agotados.map((p) => (
                            <div key={p.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-container-low transition-colors border border-transparent hover:border-outline-variant">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded flex items-center justify-center ${p.stockActual === 0 ? 'bg-error/10 text-error' : 'bg-tertiary/10 text-tertiary'}`}>
                                        <span className="material-symbols-outlined">inventory_2</span>
                                    </div>
                                    <div>
                                        <p className="font-data-mono text-on-surface">{p.codigo}</p>
                                        <p className="font-label-caps text-label-caps text-secondary">{p.nombre}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-body-md text-body-md font-semibold text-on-surface">{p.stockActual}</p>
                                    <p className={`font-label-caps text-label-caps ${p.stockActual === 0 ? 'text-error' : 'text-tertiary'}`}>{p.stockActual === 0 ? 'Crítico' : 'Reorden'}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <Link to="/inventario" className="mt-4 w-full text-center font-label-caps text-label-caps text-primary hover:bg-surface-container py-2 rounded-lg transition-colors block">
                        VER INVENTARIO COMPLETO
                    </Link>
                </div>
            </div>

            {isExportarModalOpen && <ExportarReporteModal periodo={periodo} onClose={() => setIsExportarModalOpen(false)} />}
        </div>
    );
};
