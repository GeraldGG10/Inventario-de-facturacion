import React, { useState } from 'react';
import { InventarioNav } from '../components/layout/InventarioNav';
import { ConfigurarAlertasModal } from '../components/modals/ConfigurarAlertasModal';
import { DetalleProductoModal } from '../components/modals/DetalleProductoModal';
import { ConfirmacionModal } from '../components/modals/ConfirmacionModal';
import { FiltrosAvanzadosModal } from '../components/modals/FiltrosAvanzadosModal';

type FiltroTipo = 'todos' | 'agotados' | 'stock bajo' | 'próximos a agotarse';

const alertasData = [
    { id: 1, nombre: 'Laptop Pro X15', sku: 'LPT-X15-001', categoria: 'Electrónica', icon: 'laptop_mac', stockActual: 0, stockMinimo: 5, estado: 'agotados' },
    { id: 2, nombre: 'Impresora Laser Z200', sku: 'PRT-Z200-042', categoria: 'Oficina', icon: 'print', stockActual: 2, stockMinimo: 10, estado: 'stock bajo' },
    { id: 3, nombre: 'Auriculares Inalámbricos Q5', sku: 'AUD-Q5-099', categoria: 'Accesorios', icon: 'headphones', stockActual: 15, stockMinimo: 12, estado: 'próximos a agotarse' },
    { id: 4, nombre: 'Ratón Ergonómico M2', sku: 'MOU-M2-112', categoria: 'Accesorios', icon: 'mouse', stockActual: 45, stockMinimo: 15, estado: 'normal' },
];

const estadoBadge = (estado: string) => {
    if (estado === 'agotados') return 'bg-error/10 text-error';
    if (estado === 'stock bajo') return 'bg-tertiary-container/10 text-tertiary-container';
    if (estado === 'próximos a agotarse') return 'bg-yellow-500/10 text-yellow-700';
    return 'bg-green-600/10 text-green-700';
};
const estadoLabel = (estado: string) => {
    if (estado === 'agotados') return 'Agotado';
    if (estado === 'stock bajo') return 'Stock Bajo';
    if (estado === 'próximos a agotarse') return 'Próximo a agotar';
    return 'Normal';
};
const stockColor = (estado: string) => {
    if (estado === 'agotados') return 'text-error font-bold';
    if (estado === 'stock bajo') return 'text-tertiary-container font-semibold';
    if (estado === 'próximos a agotarse') return 'text-yellow-600 font-medium';
    return 'text-on-surface font-medium';
};

export const AlertasInventario = () => {
    const [filtroActivo, setFiltroActivo] = useState<FiltroTipo>('todos');
    const [busqueda, setBusqueda] = useState('');
    const [isConfigAlertasOpen, setIsConfigAlertasOpen] = useState(false);
    const [isDetalleOpen, setIsDetalleOpen] = useState(false);
    const [isConfirmacionOpen, setIsConfirmacionOpen] = useState(false);
    const [isFiltroCategoriaOpen, setIsFiltroCategoriaOpen] = useState(false);

    const alertasFiltradas = alertasData.filter(a => {
        const matchFiltro = filtroActivo === 'todos' || a.estado === filtroActivo;
        const matchBusqueda = a.nombre.toLowerCase().includes(busqueda.toLowerCase()) || a.sku.toLowerCase().includes(busqueda.toLowerCase());
        return matchFiltro && matchBusqueda;
    });

    const filtros: { label: string; val: FiltroTipo }[] = [
        { label: 'Todos', val: 'todos' },
        { label: 'Agotados', val: 'agotados' },
        { label: 'Stock bajo', val: 'stock bajo' },
        { label: 'Próximos a agotarse', val: 'próximos a agotarse' },
    ];

    return (
        <div className="max-w-container-max mx-auto space-y-stack-lg pb-12">
            <div className="border-b border-outline-variant pb-4 mb-4">
                <InventarioNav />
            </div>
            
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-display-lg font-display-lg text-on-surface">Alertas de inventario</h1>
                    <p className="text-body-md font-body-md text-on-surface-variant mt-1">Supervisa productos con stock bajo, agotado o con otras condiciones que requieren atención.</p>
                </div>
                <button
                    onClick={() => setIsConfigAlertasOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg text-body-sm font-body-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
                >
                    <span className="material-symbols-outlined text-sm">settings</span>
                    Configurar alertas
                </button>
            </div>
            
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Agotados', value: alertasData.filter(a => a.estado === 'agotados').length, subtitle: 'Stock 0', icon: 'warning', border: 'border-error/30', iconColor: 'text-error', subtitleColor: 'text-error' },
                    { label: 'Stock bajo', value: alertasData.filter(a => a.estado === 'stock bajo').length, subtitle: 'Por debajo del mínimo', icon: 'trending_down', border: 'border-tertiary-container/30', iconColor: 'text-tertiary-container', subtitleColor: 'text-tertiary-container' },
                    { label: 'Próximos a agotarse', value: alertasData.filter(a => a.estado === 'próximos a agotarse').length, subtitle: 'Cerca del límite', icon: 'hourglass_bottom', border: 'border-yellow-500/30', iconColor: 'text-yellow-600', subtitleColor: 'text-yellow-700' },
                    { label: 'Stock normal', value: alertasData.filter(a => a.estado === 'normal').length, subtitle: 'Niveles óptimos', icon: 'check_circle', border: 'border-green-600/30', iconColor: 'text-green-600', subtitleColor: 'text-green-700' },
                ].map(card => (
                    <button key={card.label} onClick={() => setFiltroActivo(card.label.toLowerCase() as FiltroTipo)} className={`bg-surface-container-lowest border ${card.border} rounded-xl p-4 shadow-sm relative overflow-hidden group text-left hover:shadow-md transition-shadow`}>
                        <div className="flex justify-between items-start mb-2">
                            <span className={`text-label-caps font-label-caps uppercase ${card.iconColor}`}>{card.label}</span>
                            <span className={`material-symbols-outlined ${card.iconColor}`} style={{ fontVariationSettings: "'FILL' 1" }}>{card.icon}</span>
                        </div>
                        <div className="text-display-lg font-display-lg text-on-surface">{card.value}</div>
                        <div className={`text-body-sm font-body-sm mt-1 ${card.subtitleColor}`}>{card.subtitle}</div>
                    </button>
                ))}
            </div>
            
            {/* Filters & Controls */}
            <div className="flex flex-col md:flex-row justify-between gap-4 items-center bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-sm">
                <div className="flex overflow-x-auto w-full md:w-auto custom-scrollbar gap-2 pb-2 md:pb-0">
                    {filtros.map(f => (
                        <button
                            key={f.val}
                            onClick={() => setFiltroActivo(f.val)}
                            className={`px-4 py-1.5 rounded-full text-body-sm font-body-sm font-medium whitespace-nowrap transition-colors ${filtroActivo === f.val ? 'bg-secondary-container text-on-secondary-container' : 'border border-outline-variant text-on-surface-variant hover:bg-surface-variant'}`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
                <div className="flex w-full md:w-auto gap-2">
                    <div className="relative flex-1 md:w-64">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
                        <input value={busqueda} onChange={e => setBusqueda(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-surface border border-outline-variant rounded-lg text-body-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none" placeholder="Buscar producto..." type="text" />
                    </div>
                    <button onClick={() => setIsFiltroCategoriaOpen(true)} className="flex items-center gap-2 px-3 py-2 border border-outline-variant rounded-lg text-on-surface-variant hover:bg-surface-variant transition-colors">
                        <span className="material-symbols-outlined text-sm">filter_list</span>
                        <span className="text-body-sm hidden sm:inline">Categoría</span>
                    </button>
                </div>
            </div>
            
            {/* Data Table */}
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden flex flex-col">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface-container-low border-b border-outline-variant">
                                <th className="p-4 text-label-caps font-label-caps text-on-surface-variant uppercase tracking-wider font-semibold">Producto</th>
                                <th className="p-4 text-label-caps font-label-caps text-on-surface-variant uppercase tracking-wider font-semibold">Categoría</th>
                                <th className="p-4 text-label-caps font-label-caps text-on-surface-variant uppercase tracking-wider font-semibold text-right">Stock actual</th>
                                <th className="p-4 text-label-caps font-label-caps text-on-surface-variant uppercase tracking-wider font-semibold text-right">Stock mínimo</th>
                                <th className="p-4 text-label-caps font-label-caps text-on-surface-variant uppercase tracking-wider font-semibold text-center">Estado</th>
                                <th className="p-4 text-label-caps font-label-caps text-on-surface-variant uppercase tracking-wider font-semibold text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant">
                            {alertasFiltradas.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-on-surface-variant text-body-sm">No hay productos con este estado.</td>
                                </tr>
                            )}
                            {alertasFiltradas.map(a => (
                                <tr key={a.id} className="hover:bg-surface-container-lowest/50 transition-colors group">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded bg-surface-variant flex items-center justify-center shrink-0">
                                                <span className="material-symbols-outlined text-on-surface-variant">{a.icon}</span>
                                            </div>
                                            <div>
                                                <p className="text-body-sm font-body-sm font-medium text-on-surface">{a.nombre}</p>
                                                <p className="text-label-caps font-label-caps text-on-surface-variant">SKU: {a.sku}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-body-sm font-body-sm text-on-surface-variant">{a.categoria}</td>
                                    <td className={`p-4 text-data-mono font-data-mono text-right ${stockColor(a.estado)}`}>{a.stockActual}</td>
                                    <td className="p-4 text-data-mono font-data-mono text-on-surface-variant text-right">{a.stockMinimo}</td>
                                    <td className="p-4 text-center">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase ${estadoBadge(a.estado)}`}>
                                            {estadoLabel(a.estado)}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => setIsDetalleOpen(true)} className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded transition-colors" title="Ver detalle">
                                                <span className="material-symbols-outlined text-sm">visibility</span>
                                            </button>
                                            <button onClick={() => setIsDetalleOpen(true)} className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded transition-colors" title="Editar stock">
                                                <span className="material-symbols-outlined text-sm">edit</span>
                                            </button>
                                            <button onClick={() => { setIsDetalleOpen(false); setIsConfirmacionOpen(true); }} className="p-1.5 text-on-surface-variant hover:text-success hover:bg-success/10 rounded transition-colors" title="Registrar entrada">
                                                <span className="material-symbols-outlined text-sm">add_circle</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination */}
                <div className="p-4 border-t border-outline-variant bg-surface-container-low flex items-center justify-between">
                    <span className="text-body-sm font-body-sm text-on-surface-variant">Mostrando 1 - {alertasFiltradas.length} de {alertasData.length} resultados</span>
                    <div className="flex items-center gap-2">
                        <button className="p-1 rounded text-on-surface-variant hover:bg-surface-variant disabled:opacity-50" disabled>
                            <span className="material-symbols-outlined text-sm">chevron_left</span>
                        </button>
                        <button className="p-1 rounded text-on-surface-variant hover:bg-surface-variant">
                            <span className="material-symbols-outlined text-sm">chevron_right</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {isConfigAlertasOpen && <ConfigurarAlertasModal onClose={() => setIsConfigAlertasOpen(false)} />}
            {isDetalleOpen && <DetalleProductoModal onClose={() => setIsDetalleOpen(false)} />}
            {isConfirmacionOpen && <ConfirmacionModal onClose={() => setIsConfirmacionOpen(false)} />}
            {isFiltroCategoriaOpen && <FiltrosAvanzadosModal onClose={() => setIsFiltroCategoriaOpen(false)} />}
        </div>
    );
};
