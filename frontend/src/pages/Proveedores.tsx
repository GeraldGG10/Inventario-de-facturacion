import React, { useState } from 'react';
import { NuevoProveedorModal } from '../components/modals/NuevoProveedorModal';
import { FiltrosAvanzadosModal } from '../components/modals/FiltrosAvanzadosModal';
import { ConfirmacionModal } from '../components/modals/ConfirmacionModal';

export const Proveedores = () => {
    const [isNuevoProveedorModalOpen, setIsNuevoProveedorModalOpen] = useState(false);
    const [isFiltrosOpen, setIsFiltrosOpen] = useState(false);
    const [isConfirmacionOpen, setIsConfirmacionOpen] = useState(false);

    return (
        <div className="max-w-[1440px] mx-auto flex flex-col gap-6 pb-20">
            {/* Action Bar & Stats */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                {/* Quick Stats */}
                <div className="flex gap-4 flex-wrap w-full lg:w-auto">
                    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex items-center gap-4 shadow-sm flex-1 min-w-[200px]">
                        <div className="p-3 bg-secondary-container/50 rounded-lg text-primary">
                            <span className="material-symbols-outlined">storefront</span>
                        </div>
                        <div>
                            <p className="font-label-caps text-label-caps text-secondary uppercase tracking-wider">Total Proveedores</p>
                            <p className="font-display-lg text-display-lg text-on-surface">142</p>
                        </div>
                    </div>
                    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex items-center gap-4 shadow-sm flex-1 min-w-[200px]">
                        <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg text-green-700 dark:text-green-400">
                            <span className="material-symbols-outlined">check_circle</span>
                        </div>
                        <div>
                            <p className="font-label-caps text-label-caps text-secondary uppercase tracking-wider">Proveedores Activos</p>
                            <div className="flex items-baseline gap-2">
                                <p className="font-display-lg text-display-lg text-on-surface">128</p>
                                <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">+3 este mes</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Primary Action */}
                <button 
                    onClick={() => setIsNuevoProveedorModalOpen(true)}
                    className="bg-primary hover:bg-primary-fixed-variant text-on-primary px-6 py-3 rounded-lg font-body-md text-body-md font-medium shadow-sm transition-all flex items-center gap-2 w-full lg:w-auto justify-center active:scale-95"
                >
                    <span className="material-symbols-outlined text-sm">add</span>
                    Nuevo Proveedor
                </button>
            </div>

            {/* Data Table Section */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm flex flex-col flex-1 overflow-hidden">
                {/* Table Toolbar */}
                <div className="p-4 border-b border-outline-variant flex flex-col sm:flex-row justify-between items-center gap-4 bg-surface-bright">
                    <div className="relative w-full sm:w-96">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">search</span>
                        <input className="w-full pl-10 pr-4 py-2.5 bg-surface border border-outline-variant rounded-lg font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" placeholder="Buscar por nombre, RNC o contacto..." type="text" />
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button onClick={() => setIsFiltrosOpen(true)} className="px-4 py-2 border border-outline-variant rounded-lg text-on-surface font-body-sm text-body-sm flex items-center gap-2 hover:bg-surface-container transition-colors bg-surface-container-lowest flex-1 sm:flex-none justify-center">
                            <span className="material-symbols-outlined text-sm">filter_list</span>
                            Filtros
                        </button>
                        <button onClick={() => setIsConfirmacionOpen(true)} className="px-4 py-2 border border-outline-variant rounded-lg text-on-surface font-body-sm text-body-sm flex items-center gap-2 hover:bg-surface-container transition-colors bg-surface-container-lowest flex-1 sm:flex-none justify-center">
                            <span className="material-symbols-outlined text-sm">download</span>
                            Exportar
                        </button>
                    </div>
                </div>
                
                {/* Table Container */}
                <div className="overflow-x-auto flex-1 hide-scrollbar">
                    <div className="overflow-x-auto w-full pb-2">
<table className="w-full text-left border-collapse min-w-[800px]">
<thead className="bg-surface-container-lowest sticky top-0 z-10 shadow-sm">
<tr>
<th className="py-3 px-6 font-label-caps text-label-caps text-secondary uppercase border-b border-outline-variant whitespace-nowrap">Nombre / Empresa</th>
<th className="py-3 px-6 font-label-caps text-label-caps text-secondary uppercase border-b border-outline-variant whitespace-nowrap">RNC / Documento</th>
<th className="py-3 px-6 font-label-caps text-label-caps text-secondary uppercase border-b border-outline-variant whitespace-nowrap">Contacto Principal</th>
<th className="py-3 px-6 font-label-caps text-label-caps text-secondary uppercase border-b border-outline-variant whitespace-nowrap">Teléfono</th>
<th className="py-3 px-6 font-label-caps text-label-caps text-secondary uppercase border-b border-outline-variant whitespace-nowrap text-center">Estado</th>
<th className="py-3 px-6 font-label-caps text-label-caps text-secondary uppercase border-b border-outline-variant whitespace-nowrap text-right">Acciones</th>
</tr>
</thead>
<tbody className="divide-y divide-outline-variant font-body-sm text-body-sm">

<tr className="hover:bg-slate-50 transition-colors group cursor-pointer">
<td className="py-4 px-6">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded bg-surface-container flex items-center justify-center text-primary font-bold text-xs">
                                            DL
                                        </div>
<div>
<p className="font-medium text-on-surface">Distribuidora Los Andes S.A.</p>
<p className="text-xs text-secondary">Suministros de Oficina</p>
</div>
</div>
</td>
<td className="py-4 px-6 font-data-mono text-data-mono text-on-surface-variant">101-45678-9</td>
<td className="py-4 px-6">
<p className="text-on-surface">Carlos Mendoza</p>
<p className="text-xs text-secondary">Gerente de Ventas</p>
</td>
<td className="py-4 px-6 font-data-mono text-data-mono text-on-surface-variant">+1 (809) 555-0123</td>
<td className="py-4 px-6 text-center">
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                        Activo
                                    </span>
</td>
<td className="py-4 px-6 text-right">
<div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
<button onClick={() => setIsNuevoProveedorModalOpen(true)} className="p-1.5 text-secondary hover:text-primary hover:bg-secondary-container rounded-md transition-colors" title="Editar">
<span className="material-symbols-outlined text-sm" data-icon="edit">edit</span>
</button>
<button onClick={() => setIsConfirmacionOpen(true)} className="p-1.5 text-secondary hover:text-error hover:bg-error-container rounded-md transition-colors" title="Eliminar">
<span className="material-symbols-outlined text-sm" data-icon="delete">delete</span>
</button>
</div>
</td>
</tr>

<tr className="hover:bg-slate-50 transition-colors group cursor-pointer">
<td className="py-4 px-6">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded bg-surface-container flex items-center justify-center text-primary font-bold text-xs">
                                            TP
                                        </div>
<div>
<p className="font-medium text-on-surface">Tecnología y Partes EIRL</p>
<p className="text-xs text-secondary">Equipos Informáticos</p>
</div>
</div>
</td>
<td className="py-4 px-6 font-data-mono text-data-mono text-on-surface-variant">130-98765-2</td>
<td className="py-4 px-6">
<p className="text-on-surface">Ana Ramírez</p>
<p className="text-xs text-secondary">Soporte Corporativo</p>
</td>
<td className="py-4 px-6 font-data-mono text-data-mono text-on-surface-variant">+1 (829) 555-4567</td>
<td className="py-4 px-6 text-center">
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                        Activo
                                    </span>
</td>
<td className="py-4 px-6 text-right">
<div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
<button onClick={() => setIsNuevoProveedorModalOpen(true)} className="p-1.5 text-secondary hover:text-primary hover:bg-secondary-container rounded-md transition-colors" title="Editar">
<span className="material-symbols-outlined text-sm" data-icon="edit">edit</span>
</button>
<button onClick={() => setIsConfirmacionOpen(true)} className="p-1.5 text-secondary hover:text-error hover:bg-error-container rounded-md transition-colors" title="Eliminar">
<span className="material-symbols-outlined text-sm" data-icon="delete">delete</span>
</button>
</div>
</td>
</tr>

<tr className="hover:bg-slate-50 transition-colors group cursor-pointer">
<td className="py-4 px-6">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded bg-surface-container flex items-center justify-center text-primary font-bold text-xs">
                                            IM
                                        </div>
<div>
<p className="font-medium text-on-surface">Importadora Mundial</p>
<p className="text-xs text-secondary">Materiales de Construcción</p>
</div>
</div>
</td>
<td className="py-4 px-6 font-data-mono text-data-mono text-on-surface-variant">102-11223-4</td>
<td className="py-4 px-6">
<p className="text-on-surface">Roberto Gómez</p>
<p className="text-xs text-secondary">Logística</p>
</td>
<td className="py-4 px-6 font-data-mono text-data-mono text-on-surface-variant">+1 (809) 555-7890</td>
<td className="py-4 px-6 text-center">
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                                        Inactivo
                                    </span>
</td>
<td className="py-4 px-6 text-right">
<div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
<button onClick={() => setIsNuevoProveedorModalOpen(true)} className="p-1.5 text-secondary hover:text-primary hover:bg-secondary-container rounded-md transition-colors" title="Editar">
<span className="material-symbols-outlined text-sm" data-icon="edit">edit</span>
</button>
<button onClick={() => setIsConfirmacionOpen(true)} className="p-1.5 text-secondary hover:text-error hover:bg-error-container rounded-md transition-colors" title="Eliminar">
<span className="material-symbols-outlined text-sm" data-icon="delete">delete</span>
</button>
</div>
</td>
</tr>
</tbody>
</table>
</div>
                </div>
                
                {/* Pagination */}
                <div className="p-4 border-t border-outline-variant flex items-center justify-between bg-surface-container-lowest">
                    <p className="font-body-sm text-body-sm text-secondary">Mostrando 1 a 10 de 142 proveedores</p>
                    <div className="flex items-center gap-1">
                        <button className="p-1 text-secondary hover:bg-surface-container rounded disabled:opacity-50" disabled>
                            <span className="material-symbols-outlined">chevron_left</span>
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center rounded bg-primary-container text-on-primary-container font-medium text-sm">1</button>
                        <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-surface-container text-on-surface font-medium text-sm transition-colors">2</button>
                        <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-surface-container text-on-surface font-medium text-sm transition-colors">3</button>
                        <span className="text-secondary px-1">...</span>
                        <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-surface-container text-on-surface font-medium text-sm transition-colors">15</button>
                        <button className="p-1 text-secondary hover:bg-surface-container rounded">
                            <span className="material-symbols-outlined">chevron_right</span>
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Modals */}
            {isNuevoProveedorModalOpen && <NuevoProveedorModal onClose={() => setIsNuevoProveedorModalOpen(false)} />}
            {isFiltrosOpen && <FiltrosAvanzadosModal onClose={() => setIsFiltrosOpen(false)} />}
            {isConfirmacionOpen && <ConfirmacionModal onClose={() => setIsConfirmacionOpen(false)} />}
        </div>
    );
};

