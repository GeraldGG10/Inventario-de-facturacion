import React, { useState } from 'react';
import { NuevoClienteModal } from '../components/modals/NuevoClienteModal';
import { NuevoProveedorModal } from '../components/modals/NuevoProveedorModal';
import { HistorialTransaccionesModal } from '../components/modals/HistorialTransaccionesModal';
import { ClienteModal } from '../components/modals/ClienteModal';

export const Clientes = () => {
    const [isNuevoClienteModalOpen, setIsNuevoClienteModalOpen] = useState(false);
    const [isHistorialOpen, setIsHistorialOpen] = useState(false);
    const [isNuevoProveedorOpen, setIsNuevoProveedorOpen] = useState(false);
    const [isClienteModalOpen, setIsClienteModalOpen] = useState(false);
    const [clienteSeleccionado, setClienteSeleccionado] = useState('');

    return (
        <div className="max-w-[1440px] mx-auto space-y-6 pb-20">
            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h3 className="font-headline-md text-headline-md text-on-surface">Gestión de Entidades</h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Administra tus clientes y proveedores desde un solo lugar.</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setIsNuevoClienteModalOpen(true)}
                        className="bg-primary hover:bg-primary-container text-on-primary font-body-sm text-body-sm py-2 px-4 rounded transition-colors flex items-center gap-2 shadow-sm"
                    >
                        <span className="material-symbols-outlined text-[18px]">add</span>
                        Nuevo Cliente
                    </button>
                    <button
                        onClick={() => setIsNuevoProveedorOpen(true)}
                        className="bg-surface hover:bg-surface-container text-on-surface border border-outline-variant font-body-sm text-body-sm py-2 px-4 rounded transition-colors flex items-center gap-2 shadow-sm">
                        <span className="material-symbols-outlined text-[18px]">add</span>
                        Nuevo Proveedor
                    </button>
                </div>
            </div>

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                {/* Clientes Section (Takes up 8 columns on large screens) */}
                <div className="xl:col-span-8 space-y-6">
                    {/* Clientes Table Card */}
                    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden flex flex-col h-[500px]">
                        <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface">
                            <h4 className="font-title-sm text-title-sm text-on-surface">Clientes Recientes</h4>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
                                <input className="pl-10 pr-4 py-2 border border-outline-variant rounded bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary font-body-sm text-body-sm w-64" placeholder="Buscar cliente..." type="text" />
                            </div>
                        </div>
                        <div className="flex-1 overflow-auto">
                            <div className="overflow-x-auto w-full pb-2">
<table className="w-full text-left border-collapse">
<thead className="sticky top-0 bg-surface z-10 shadow-[0_1px_0_var(--tw-shadow-color)] shadow-outline-variant">
<tr>
<th className="px-6 py-3 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Nombre</th>
<th className="px-6 py-3 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Documento</th>
<th className="px-6 py-3 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Teléfono</th>
<th className="px-6 py-3 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider text-right">Compras Totales</th>
<th className="px-6 py-3 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider text-center">Estado</th>
</tr>
</thead>
<tbody className="font-body-sm text-body-sm text-on-surface">
<tr className="hover:bg-surface-container-low transition-colors cursor-pointer border-b border-outline-variant/50" onClick={() => { setClienteSeleccionado('Acme Corp'); setIsClienteModalOpen(true); }}>
<td className="px-6 py-4 font-medium">Acme Corp</td>
<td className="px-6 py-4 font-data-mono text-on-surface-variant">DOC-8472</td>
<td className="px-6 py-4 font-data-mono text-on-surface-variant">+1 555-0198</td>
<td className="px-6 py-4 font-data-mono text-right">$12,450.00</td>
<td className="px-6 py-4 text-center">
<span className="inline-flex items-center px-2 py-1 rounded-full bg-secondary-container/50 text-on-secondary-container font-label-caps text-[10px]">Activo</span>
</td>
</tr>
<tr className="hover:bg-surface-container-low transition-colors cursor-pointer border-b border-outline-variant/50" onClick={() => { setClienteSeleccionado('Globex Inc'); setIsClienteModalOpen(true); }}>
<td className="px-6 py-4 font-data-mono text-on-surface-variant">DOC-9921</td>
<td className="px-6 py-4 font-data-mono text-on-surface-variant">+1 555-0123</td>
<td className="px-6 py-4 font-data-mono text-right">$8,230.50</td>
<td className="px-6 py-4 text-center">
<span className="inline-flex items-center px-2 py-1 rounded-full bg-secondary-container/50 text-on-secondary-container font-label-caps text-[10px]">Activo</span>
</td>
</tr>
<tr className="hover:bg-surface-container-low transition-colors cursor-pointer border-b border-outline-variant/50" onClick={() => { setClienteSeleccionado('Initech'); setIsClienteModalOpen(true); }}>
<td className="px-6 py-4 font-data-mono text-on-surface-variant">DOC-1104</td>
<td className="px-6 py-4 font-data-mono text-on-surface-variant">+1 555-0177</td>
<td className="px-6 py-4 font-data-mono text-right">$450.00</td>
<td className="px-6 py-4 text-center">
<span className="inline-flex items-center px-2 py-1 rounded-full bg-error-container/50 text-on-error-container font-label-caps text-[10px]">Inactivo</span>
</td>
</tr>
</tbody>
</table>
</div>
                        </div>
                    </div>
                </div>

                {/* Client Profile Side Panel (Takes up 4 columns on large screens) */}
                <div className="xl:col-span-4 space-y-6">
                    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-6 flex flex-col h-[500px]">
                        <h4 className="font-title-sm text-title-sm text-on-surface mb-4">Perfil Rápido</h4>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 rounded-full bg-primary-container/20 flex items-center justify-center text-primary text-2xl font-bold">
                                AC
                            </div>
                            <div>
                                <h5 className="font-title-sm text-title-sm text-on-surface">Acme Corp</h5>
                                <p className="font-body-sm text-body-sm text-on-surface-variant">Cliente desde 2021</p>
                            </div>
                        </div>
                        <div className="space-y-4 flex-1">
                            <div>
                                <span className="font-label-caps text-label-caps text-on-surface-variant block mb-1">Contacto Principal</span>
                                <p className="font-body-sm text-body-sm text-on-surface">Jane Doe (Directora)</p>
                            </div>
                            <div>
                                <span className="font-label-caps text-label-caps text-on-surface-variant block mb-1">Última Factura</span>
                                <div className="flex justify-between items-center bg-surface-container-low p-2 rounded">
                                    <span className="font-data-mono text-data-mono text-on-surface">FAC-2023-10-A</span>
                                    <span className="font-data-mono text-data-mono text-primary">$1,200.00</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setIsHistorialOpen(true)} className="w-full mt-4 bg-surface hover:bg-surface-container text-primary border border-outline-variant font-body-sm text-body-sm py-2 px-4 rounded transition-colors text-center">
                            Ver Historial Completo
                        </button>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {isNuevoClienteModalOpen && <NuevoClienteModal onClose={() => setIsNuevoClienteModalOpen(false)} />}
            {isHistorialOpen && <HistorialTransaccionesModal onClose={() => setIsHistorialOpen(false)} />}
            {isNuevoProveedorOpen && <NuevoProveedorModal onClose={() => setIsNuevoProveedorOpen(false)} />}
            {isClienteModalOpen && <ClienteModal clienteNombre={clienteSeleccionado} onClose={() => setIsClienteModalOpen(false)} />}
        </div>
    );
};
