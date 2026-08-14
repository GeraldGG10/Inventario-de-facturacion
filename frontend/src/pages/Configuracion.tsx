import React, { useState } from 'react';
import { AuditoriaModal } from '../components/modals/AuditoriaModal';
import { ConfirmacionModal } from '../components/modals/ConfirmacionModal';
import { NuevoUsuarioModal } from '../components/modals/NuevoUsuarioModal';

type Tab = 'empresa' | 'usuarios' | 'facturacion' | 'auditoria';

export const Configuracion = () => {
    const [activeTab, setActiveTab] = useState<Tab>('empresa');
    const [isAuditoriaOpen, setIsAuditoriaOpen] = useState(false);
    const [isNuevoUsuarioOpen, setIsNuevoUsuarioOpen] = useState(false);
    const [isConfirmacionOpen, setIsConfirmacionOpen] = useState(false);
    const [itbis, setItbis] = useState('18');
    const [moneda, setMoneda] = useState('USD');
    const [descuento, setDescuento] = useState('10');

    const tabs: { id: Tab; label: string; icon: string }[] = [
        { id: 'empresa', label: 'Datos de la Empresa', icon: 'business' },
        { id: 'usuarios', label: 'Usuarios y Roles', icon: 'manage_accounts' },
        { id: 'facturacion', label: 'Ajustes de Facturación', icon: 'receipt_long' },
        { id: 'auditoria', label: 'Auditoría', icon: 'history' },
    ];

    return (
        <div className="max-w-[1440px] mx-auto flex flex-col gap-6 pb-20">
            {/* Configuration Module */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Sidebar Nav */}
                <div className="col-span-12 md:col-span-3 flex flex-col gap-2">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`text-left px-4 py-3 rounded-lg font-body-md text-body-md font-medium transition-colors flex items-center gap-3 ${activeTab === tab.id ? 'bg-primary-container text-on-primary-container' : 'text-secondary hover:bg-surface-container'}`}
                        >
                            <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>
                
                {/* Config Content Area */}
                <div className="col-span-12 md:col-span-9 flex flex-col gap-6">

                    {/* --- TAB: EMPRESA --- */}
                    {activeTab === 'empresa' && (
                        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-6">
                            <h3 className="font-headline-md text-headline-md text-on-surface mb-6">Datos de la Empresa</h3>
                            <div className="flex flex-col sm:flex-row gap-8 items-start mb-8">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-32 h-32 rounded-lg border-2 border-dashed border-outline flex flex-col items-center justify-center bg-surface-container-low text-secondary cursor-pointer hover:bg-surface-container transition-colors">
                                        <span className="material-symbols-outlined text-4xl mb-2">add_photo_alternate</span>
                                        <span className="font-body-sm text-body-sm">Subir Logo</span>
                                    </div>
                                    <span className="font-body-sm text-body-sm text-secondary">JPG, PNG máx 2MB</span>
                                </div>
                                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                                    <div className="sm:col-span-2">
                                        <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">Razón Social</label>
                                        <input className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-shadow" type="text" defaultValue="StockPro Logistics S.R.L." />
                                    </div>
                                    <div>
                                        <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">RNC / NIT</label>
                                        <input className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2 font-data-mono text-data-mono text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-shadow" type="text" defaultValue="130-948293-2" />
                                    </div>
                                    <div>
                                        <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">Teléfono</label>
                                        <input className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-shadow" type="tel" defaultValue="+1 (555) 123-4567" />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">Dirección Principal</label>
                                        <textarea className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-shadow" rows={2} defaultValue="Av. Central 404, Edificio Empresarial, Suite 302"></textarea>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 border-t border-outline-variant pt-4">
                                <button className="px-4 py-2 font-body-sm text-body-sm font-medium text-secondary hover:bg-surface-container rounded-lg transition-colors">Cancelar</button>
                                <button onClick={() => setIsConfirmacionOpen(true)} className="px-4 py-2 font-body-sm text-body-sm font-medium bg-primary text-on-primary rounded-lg shadow-sm hover:bg-primary/90 transition-colors">Guardar Cambios</button>
                            </div>
                        </div>
                    )}

                    {/* --- TAB: USUARIOS --- */}
                    {activeTab === 'usuarios' && (
                        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-headline-md text-headline-md text-on-surface">Usuarios y Roles</h3>
                                <button onClick={() => setIsNuevoUsuarioOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg text-body-sm font-medium hover:bg-primary/90 transition-colors shadow-sm">
                                    <span className="material-symbols-outlined text-[18px]">person_add</span>
                                    Nuevo Usuario
                                </button>
                            </div>
                            <div className="overflow-x-auto w-full pb-2">
<table className="w-full text-left border-collapse">
<thead>
<tr className="border-b border-outline-variant bg-surface">
<th className="py-3 px-4 font-label-caps text-label-caps text-secondary">Fecha/Hora</th>
<th className="py-3 px-4 font-label-caps text-label-caps text-secondary">Usuario</th>
<th className="py-3 px-4 font-label-caps text-label-caps text-secondary">Acción</th>
<th className="py-3 px-4 font-label-caps text-label-caps text-secondary">Detalle</th>
</tr>
</thead>
<tbody>
<tr className="border-b border-outline-variant hover:bg-surface-container-lowest transition-colors">
<td className="py-3 px-4 font-data-mono text-data-mono text-on-surface">2023-10-27 14:32</td>
<td className="py-3 px-4 font-body-sm text-body-sm text-on-surface flex items-center gap-2">
<div className="w-6 h-6 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center text-xs font-bold">AJ</div>
                                            Admin Juan
                                        </td>
<td className="py-3 px-4 font-body-sm text-body-sm text-on-surface"><span className="px-2 py-1 bg-surface-container-high rounded text-xs">Actualización</span></td>
<td className="py-3 px-4 font-body-sm text-body-sm text-secondary truncate max-w-xs">Modificó tasa de ITBIS a 18%</td>
</tr>
<tr className="hover:bg-surface-container-lowest transition-colors">
<td className="py-3 px-4 font-data-mono text-data-mono text-on-surface">2023-10-27 11:15</td>
<td className="py-3 px-4 font-body-sm text-body-sm text-on-surface flex items-center gap-2">
<div className="w-6 h-6 rounded-full bg-tertiary-container text-on-tertiary-container flex items-center justify-center text-xs font-bold">MP</div>
                                            Cajero María
                                        </td>
<td className="py-3 px-4 font-body-sm text-body-sm text-on-surface"><span className="px-2 py-1 bg-error-container text-on-error-container rounded text-xs">Eliminación</span></td>
<td className="py-3 px-4 font-body-sm text-body-sm text-secondary truncate max-w-xs">Anuló factura FAC-2093</td>
</tr>
</tbody>
</table>
</div>
                        </div>
                    )}

                    {/* --- TAB: FACTURACIÓN --- */}
                    {activeTab === 'facturacion' && (
                        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-6">
                            <h3 className="font-headline-md text-headline-md text-on-surface mb-6">Ajustes de Facturación</h3>
                            <div className="flex flex-col gap-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2">Tasa ITBIS / IVA (%)</label>
                                        <input
                                            type="number"
                                            value={itbis}
                                            onChange={e => setItbis(e.target.value)}
                                            className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2 font-data-mono text-data-mono text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-shadow"
                                        />
                                        <p className="text-xs text-on-surface-variant mt-1">Tasa de impuesto aplicada a las facturas.</p>
                                    </div>
                                    <div>
                                        <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2">Moneda Principal</label>
                                        <select value={moneda} onChange={e => setMoneda(e.target.value)} className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary">
                                            <option value="USD">USD - Dólar Estadounidense</option>
                                            <option value="DOP">DOP - Peso Dominicano</option>
                                            <option value="EUR">EUR - Euro</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2">Descuento Máximo por Venta (%)</label>
                                        <input
                                            type="number"
                                            value={descuento}
                                            onChange={e => setDescuento(e.target.value)}
                                            className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2 font-data-mono text-data-mono text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-shadow"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2">Serie de Factura</label>
                                        <input type="text" defaultValue="FAC-2023-" className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2 font-data-mono text-data-mono text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-shadow" />
                                    </div>
                                </div>
                                <div className="border-t border-outline-variant pt-4 flex flex-col gap-3">
                                    <p className="font-label-caps text-label-caps text-on-surface-variant uppercase">Opciones adicionales</p>
                                    {[
                                        { label: 'Requerir aprobación para descuentos mayores al 10%', defaultChecked: true },
                                        { label: 'Permitir facturación a crédito', defaultChecked: false },
                                        { label: 'Mostrar desglose de impuesto en factura', defaultChecked: true },
                                    ].map(opt => (
                                        <label key={opt.label} className="flex items-center gap-3 cursor-pointer">
                                            <input type="checkbox" defaultChecked={opt.defaultChecked} className="w-4 h-4 text-primary rounded border-outline focus:ring-primary" />
                                            <span className="text-body-sm text-on-surface">{opt.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 border-t border-outline-variant pt-4 mt-4">
                                <button className="px-4 py-2 font-body-sm text-body-sm font-medium text-secondary hover:bg-surface-container rounded-lg transition-colors">Cancelar</button>
                                <button onClick={() => setIsConfirmacionOpen(true)} className="px-4 py-2 font-body-sm text-body-sm font-medium bg-primary text-on-primary rounded-lg shadow-sm hover:bg-primary/90 transition-colors">Guardar Cambios</button>
                            </div>
                        </div>
                    )}

                    {/* --- TAB: AUDITORÍA --- */}
                    {activeTab === 'auditoria' && (
                        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-title-sm text-title-sm text-on-surface">Actividad Reciente</h3>
                                <button onClick={() => setIsAuditoriaOpen(true)} className="text-primary font-body-sm text-body-sm font-medium hover:underline">Ver Auditoría Completa</button>
                            </div>
                            <div className="overflow-x-auto">
                                <div className="overflow-x-auto w-full pb-2">
<table className="w-full text-left border-collapse">
<thead>
<tr className="border-b border-outline-variant bg-surface">
<th className="py-3 px-4 font-label-caps text-label-caps text-secondary">Fecha/Hora</th>
<th className="py-3 px-4 font-label-caps text-label-caps text-secondary">Usuario</th>
<th className="py-3 px-4 font-label-caps text-label-caps text-secondary">Acción</th>
<th className="py-3 px-4 font-label-caps text-label-caps text-secondary">Detalle</th>
</tr>
</thead>
<tbody>
<tr className="border-b border-outline-variant hover:bg-surface-container-lowest transition-colors">
<td className="py-3 px-4 font-data-mono text-data-mono text-on-surface">2023-10-27 14:32</td>
<td className="py-3 px-4 font-body-sm text-body-sm text-on-surface flex items-center gap-2">
<div className="w-6 h-6 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center text-xs font-bold">AJ</div>
                                            Admin Juan
                                        </td>
<td className="py-3 px-4 font-body-sm text-body-sm text-on-surface"><span className="px-2 py-1 bg-surface-container-high rounded text-xs">Actualización</span></td>
<td className="py-3 px-4 font-body-sm text-body-sm text-secondary truncate max-w-xs">Modificó tasa de ITBIS a 18%</td>
</tr>
<tr className="hover:bg-surface-container-lowest transition-colors">
<td className="py-3 px-4 font-data-mono text-data-mono text-on-surface">2023-10-27 11:15</td>
<td className="py-3 px-4 font-body-sm text-body-sm text-on-surface flex items-center gap-2">
<div className="w-6 h-6 rounded-full bg-tertiary-container text-on-tertiary-container flex items-center justify-center text-xs font-bold">MP</div>
                                            Cajero María
                                        </td>
<td className="py-3 px-4 font-body-sm text-body-sm text-on-surface"><span className="px-2 py-1 bg-error-container text-on-error-container rounded text-xs">Eliminación</span></td>
<td className="py-3 px-4 font-body-sm text-body-sm text-secondary truncate max-w-xs">Anuló factura FAC-2093</td>
</tr>
</tbody>
</table>
</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            {isAuditoriaOpen && <AuditoriaModal onClose={() => setIsAuditoriaOpen(false)} />}
            {isNuevoUsuarioOpen && <NuevoUsuarioModal onClose={() => setIsNuevoUsuarioOpen(false)} />}
            {isConfirmacionOpen && <ConfirmacionModal onClose={() => setIsConfirmacionOpen(false)} />}
        </div>
    );
};
