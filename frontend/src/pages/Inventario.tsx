import React, { useState } from 'react';
import { NuevoArticuloModal } from '../components/modals/NuevoArticuloModal';
import { InventarioNav } from '../components/layout/InventarioNav';
import { FiltrosAvanzadosModal } from '../components/modals/FiltrosAvanzadosModal';

export const Inventario = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isFiltrosOpen, setIsFiltrosOpen] = useState(false);

    return (
        <div className="max-w-[1440px] mx-auto space-y-6 pb-20">
            {/* Page Header & Secondary Nav */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-outline-variant pb-4">
                <div className="w-full md:w-auto overflow-hidden">
                    <InventarioNav />
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg font-body-sm text-body-sm font-medium hover:bg-primary-container transition-colors shadow-sm"
                    >
                        <span className="material-symbols-outlined text-[20px]">add</span>
                        Nuevo artículo
                    </button>
                </div>
            </div>

            {/* Toolbar (Filters & Search) */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-[0_1px_3px_0_rgba(0,0,0,0.1)] flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex-1 w-full relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-outline">search</span>
                    <input className="w-full pl-10 pr-4 py-2 border border-outline-variant rounded-lg bg-surface focus:border-primary focus:ring-2 focus:ring-primary-fixed-dim font-body-sm text-body-sm text-on-surface transition-all" placeholder="Buscar por código, nombre o categoría..." type="text" />
                </div>
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <div className="relative">
                        <select className="appearance-none pl-4 pr-10 py-2 border border-outline-variant rounded-lg bg-surface text-on-surface font-body-sm text-body-sm focus:border-primary focus:ring-2 focus:ring-primary-fixed-dim outline-none cursor-pointer w-full md:w-auto">
                            <option>Todas las Categorías</option>
                            <option>Electrónica</option>
                            <option>Mobiliario</option>
                            <option>Suministros</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-1/2 transform -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
                    </div>
                    <div className="relative">
                        <select className="appearance-none pl-4 pr-10 py-2 border border-outline-variant rounded-lg bg-surface text-on-surface font-body-sm text-body-sm focus:border-primary focus:ring-2 focus:ring-primary-fixed-dim outline-none cursor-pointer w-full md:w-auto">
                            <option>Todos los Estados</option>
                            <option>Disponible</option>
                            <option>Stock Bajo</option>
                            <option>Agotado</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-1/2 transform -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
                    </div>
                    <button onClick={() => setIsFiltrosOpen(true)} className="p-2 border border-outline-variant rounded-lg text-secondary hover:bg-surface-container transition-colors flex items-center justify-center bg-surface w-full md:w-auto" title="Filtros Avanzados">
                        <span className="material-symbols-outlined">tune</span>
                    </button>
                </div>
            </div>

            {/* Data Table Container */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-[0_1px_3px_0_rgba(0,0,0,0.1)] overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                    <div className="overflow-x-auto w-full pb-2">
<table className="w-full text-left border-collapse">
<thead>
<tr className="bg-surface border-b border-outline-variant text-on-surface-variant font-label-caps text-label-caps uppercase tracking-wider">
<th className="px-4 py-3 font-semibold sticky left-0 bg-surface z-10 w-12 text-center">
<input className="rounded border-outline-variant text-primary focus:ring-primary" type="checkbox"/>
</th>
<th className="px-4 py-3 font-semibold whitespace-nowrap cursor-pointer hover:text-on-surface group">
                                        Código
                                        <span className="material-symbols-outlined text-[14px] opacity-0 group-hover:opacity-100 align-middle">arrow_upward</span>
</th>
<th className="px-4 py-3 font-semibold whitespace-nowrap min-w-[250px]">Nombre del Producto</th>
<th className="px-4 py-3 font-semibold whitespace-nowrap">Categoría</th>
<th className="px-4 py-3 font-semibold whitespace-nowrap text-right">Precio Venta</th>
<th className="px-4 py-3 font-semibold whitespace-nowrap text-right group cursor-pointer">
                                        Stock
                                        <span className="material-symbols-outlined text-[14px] opacity-50 align-middle">unfold_more</span>
</th>
<th className="px-4 py-3 font-semibold whitespace-nowrap text-center">Estado</th>
<th className="px-4 py-3 font-semibold whitespace-nowrap text-right sticky right-0 bg-surface z-10">Acciones</th>
</tr>
</thead>
<tbody className="font-body-sm text-body-sm divide-y divide-outline-variant">

<tr className="hover:bg-surface-container-lowest transition-colors bg-white">
<td className="px-4 py-3 sticky left-0 bg-inherit text-center">
<input className="rounded border-outline-variant text-primary focus:ring-primary" type="checkbox"/>
</td>
<td className="px-4 py-3 font-data-mono text-data-mono text-secondary">PRD-001</td>
<td className="px-4 py-3">
<div className="font-medium text-on-surface">Laptop ThinkPad T14</div>
<div className="text-xs text-secondary mt-0.5">Lenovo Inc.</div>
</td>
<td className="px-4 py-3 text-secondary">Electrónica</td>
<td className="px-4 py-3 font-data-mono text-data-mono text-right">$1,250.00</td>
<td className="px-4 py-3 text-right">
<div className="font-data-mono text-data-mono font-medium">45 <span className="text-xs text-secondary font-normal">un</span></div>
<div className="text-[10px] text-secondary">Min: 10</div>
</td>
<td className="px-4 py-3 text-center">
<span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-secondary-fixed/50 text-on-secondary-fixed text-[11px] font-semibold tracking-wide">
                                            Disponible
                                        </span>
</td>
<td className="px-4 py-3 sticky right-0 bg-inherit text-right">
<div className="flex items-center justify-end gap-1">
<button className="p-1.5 text-secondary hover:text-primary hover:bg-surface-container rounded transition-colors" title="Ver Detalles">
<span className="material-symbols-outlined text-[20px]">visibility</span>
</button>
<button className="p-1.5 text-secondary hover:text-primary hover:bg-surface-container rounded transition-colors" title="Editar">
<span className="material-symbols-outlined text-[20px]">edit</span>
</button>
<button className="p-1.5 text-secondary hover:text-primary hover:bg-surface-container rounded transition-colors" title="Más acciones">
<span className="material-symbols-outlined text-[20px]">more_vert</span>
</button>
</div>
</td>
</tr>

<tr className="hover:bg-surface-container-lowest transition-colors bg-white">
<td className="px-4 py-3 sticky left-0 bg-inherit text-center">
<input className="rounded border-outline-variant text-primary focus:ring-primary" type="checkbox"/>
</td>
<td className="px-4 py-3 font-data-mono text-data-mono text-secondary">PRD-042</td>
<td className="px-4 py-3">
<div className="font-medium text-on-surface">Monitor UltraSharp 27"</div>
<div className="text-xs text-secondary mt-0.5">Dell Technologies</div>
</td>
<td className="px-4 py-3 text-secondary">Electrónica</td>
<td className="px-4 py-3 font-data-mono text-data-mono text-right">$380.00</td>
<td className="px-4 py-3 text-right">
<div className="font-data-mono text-data-mono font-medium text-tertiary-container">8 <span className="text-xs text-secondary font-normal">un</span></div>
<div className="text-[10px] text-secondary">Min: 15</div>
</td>
<td className="px-4 py-3 text-center">
<span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-tertiary-fixed/50 text-tertiary text-[11px] font-semibold tracking-wide">
                                            Stock Bajo
                                        </span>
</td>
<td className="px-4 py-3 sticky right-0 bg-inherit text-right">
<div className="flex items-center justify-end gap-1">
<button className="p-1.5 text-secondary hover:text-primary hover:bg-surface-container rounded transition-colors" title="Ver Detalles">
<span className="material-symbols-outlined text-[20px]">visibility</span>
</button>
<button className="p-1.5 text-secondary hover:text-primary hover:bg-surface-container rounded transition-colors" title="Editar">
<span className="material-symbols-outlined text-[20px]">edit</span>
</button>
<button className="p-1.5 text-secondary hover:text-primary hover:bg-surface-container rounded transition-colors" title="Más acciones">
<span className="material-symbols-outlined text-[20px]">more_vert</span>
</button>
</div>
</td>
</tr>

<tr className="hover:bg-surface-container-lowest transition-colors bg-white">
<td className="px-4 py-3 sticky left-0 bg-inherit text-center">
<input className="rounded border-outline-variant text-primary focus:ring-primary" type="checkbox"/>
</td>
<td className="px-4 py-3 font-data-mono text-data-mono text-secondary">PRD-105</td>
<td className="px-4 py-3">
<div className="font-medium text-on-surface opacity-60">Silla Ergonómica Pro</div>
<div className="text-xs text-secondary mt-0.5 opacity-60">Herman Miller</div>
</td>
<td className="px-4 py-3 text-secondary">Mobiliario</td>
<td className="px-4 py-3 font-data-mono text-data-mono text-right">$850.00</td>
<td className="px-4 py-3 text-right">
<div className="font-data-mono text-data-mono font-medium text-error">0 <span className="text-xs text-secondary font-normal">un</span></div>
<div className="text-[10px] text-secondary">Min: 5</div>
</td>
<td className="px-4 py-3 text-center">
<span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-error-container/30 text-error text-[11px] font-semibold tracking-wide">
                                            Agotado
                                        </span>
</td>
<td className="px-4 py-3 sticky right-0 bg-inherit text-right">
<div className="flex items-center justify-end gap-1">
<button className="p-1.5 text-secondary hover:text-primary hover:bg-surface-container rounded transition-colors" title="Ver Detalles">
<span className="material-symbols-outlined text-[20px]">visibility</span>
</button>
<button className="p-1.5 text-secondary hover:text-primary hover:bg-surface-container rounded transition-colors" title="Editar">
<span className="material-symbols-outlined text-[20px]">edit</span>
</button>
<button className="p-1.5 text-secondary hover:text-primary hover:bg-surface-container rounded transition-colors" title="Más acciones">
<span className="material-symbols-outlined text-[20px]">more_vert</span>
</button>
</div>
</td>
</tr>
</tbody>
</table>
</div>
                </div>

                {/* Table Pagination/Footer */}
                <div className="bg-surface border-t border-outline-variant p-4 flex flex-col sm:flex-row items-center justify-between gap-4 font-body-sm text-body-sm text-secondary">
                    <div className="flex items-center gap-2">
                        <span>Mostrando</span>
                        <select className="border border-outline-variant rounded p-1 text-on-surface bg-surface focus:outline-none focus:border-primary">
                            <option>10</option>
                            <option>25</option>
                            <option>50</option>
                        </select>
                        <span>de 1,245 registros</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <button className="p-1 border border-outline-variant rounded hover:bg-surface-container disabled:opacity-50" disabled>
                            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center rounded bg-primary text-on-primary font-medium">1</button>
                        <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-surface-container text-on-surface">2</button>
                        <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-surface-container text-on-surface">3</button>
                        <span className="px-1">...</span>
                        <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-surface-container text-on-surface">125</button>
                        <button className="p-1 border border-outline-variant rounded hover:bg-surface-container">
                            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal de Nuevo Artículo */}
            {isModalOpen && <NuevoArticuloModal onClose={() => setIsModalOpen(false)} />}
            
            {/* Modal de Filtros Avanzados */}
            {isFiltrosOpen && <FiltrosAvanzadosModal onClose={() => setIsFiltrosOpen(false)} />}
        </div>
    );
};
