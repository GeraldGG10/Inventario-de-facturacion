import React, { useEffect, useState } from 'react';
import { AuditoriaModal } from '../components/modals/AuditoriaModal';
import { NuevoUsuarioModal } from '../components/modals/NuevoUsuarioModal';
import { api, ApiError } from '../lib/api';

type Tab = 'empresa' | 'usuarios' | 'facturacion' | 'auditoria';

interface Usuario {
    id: string; nombre: string; nombreUsuario: string; email: string; activo: boolean;
    ultimoAcceso: string | null; rol: { nombre: string };
}
interface RegistroAuditoria { id: string; timestamp: string; accion: string; entidad: string; usuario: { nombre: string } | null }

export const Configuracion = () => {
    const [activeTab, setActiveTab] = useState<Tab>('empresa');
    const [isAuditoriaOpen, setIsAuditoriaOpen] = useState(false);
    const [isNuevoUsuarioOpen, setIsNuevoUsuarioOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [guardado, setGuardado] = useState<string | null>(null);

    const [empresa, setEmpresa] = useState({ nombre: '', rnc: '', telefono: '', direccion: '' });
    const [facturacion, setFacturacion] = useState({ impuestoPorcentaje: 18, moneda: 'DOP', descuentoMaximoSinAprobar: 10, serieFactura: 'FAC-', permiteCredito: false, mostrarDesgloseImpuesto: true });
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [auditoriaReciente, setAuditoriaReciente] = useState<RegistroAuditoria[]>([]);
    const [networkIp, setNetworkIp] = useState<string>('');
    const [networkHostname, setNetworkHostname] = useState<string>('');

    function cargarConfiguracion() {
        api.get('/configuracion').then((data) => {
            setEmpresa({ nombre: data.empresa.nombre ?? '', rnc: data.empresa.rnc ?? '', telefono: data.empresa.telefono ?? '', direccion: data.empresa.direccion ?? '' });
            setFacturacion({
                impuestoPorcentaje: data.facturacion.impuestoPorcentaje,
                moneda: data.facturacion.moneda,
                descuentoMaximoSinAprobar: data.facturacion.descuentoMaximoSinAprobar,
                serieFactura: data.facturacion.serieFactura,
                permiteCredito: data.facturacion.permiteCredito,
                mostrarDesgloseImpuesto: data.facturacion.mostrarDesgloseImpuesto,
            });
        }).catch(() => {});
        api.get('/configuracion/network').then((data: any) => {
            setNetworkIp(data.ip);
            setNetworkHostname(data.hostname);
        }).catch(() => {});
    }
    function cargarUsuarios() {
        api.get<Usuario[]>('/usuarios').then(setUsuarios).catch((err) => setError(err instanceof ApiError ? err.message : 'No se pudieron cargar los usuarios'));
    }
    function cargarAuditoria() {
        api.get('/auditoria', { pageSize: 5 }).then((data: any) => setAuditoriaReciente(data.registros)).catch(() => {});
    }

    useEffect(() => { cargarConfiguracion(); cargarUsuarios(); cargarAuditoria(); }, []);

    async function guardarEmpresa() {
        setError(null);
        try {
            await api.patch('/configuracion/empresa', empresa);
            setGuardado('Datos de la empresa guardados.');
        } catch (err) {
            setError(err instanceof ApiError ? err.message : 'No se pudo guardar');
        }
    }

    async function guardarFacturacion() {
        setError(null);
        try {
            await api.patch('/configuracion/facturacion', facturacion);
            setGuardado('Configuración de facturación guardada.');
        } catch (err) {
            setError(err instanceof ApiError ? err.message : 'No se pudo guardar');
        }
    }

    async function toggleActivoUsuario(u: Usuario) {
        try {
            await api.patch(`/usuarios/${u.id}`, { activo: !u.activo });
            cargarUsuarios();
        } catch (err) {
            setError(err instanceof ApiError ? err.message : 'No se pudo actualizar el usuario');
        }
    }

    const tabs: { id: Tab; label: string; icon: string }[] = [
        { id: 'empresa', label: 'Datos de la Empresa', icon: 'business' },
        { id: 'usuarios', label: 'Usuarios y Roles', icon: 'manage_accounts' },
        { id: 'facturacion', label: 'Ajustes de Facturación', icon: 'receipt_long' },
        { id: 'auditoria', label: 'Auditoría', icon: 'history' },
    ];

    return (
        <div className="max-w-[1440px] mx-auto flex flex-col gap-6 pb-20">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="col-span-12 md:col-span-3 flex flex-col gap-2">
                    {tabs.map((tab) => (
                        <button key={tab.id} onClick={() => { setActiveTab(tab.id); setError(null); setGuardado(null); }} className={`text-left px-4 py-3 rounded-lg font-body-md text-body-md font-medium transition-colors flex items-center gap-3 ${activeTab === tab.id ? 'bg-primary-container text-on-primary-container' : 'text-secondary hover:bg-surface-container'}`}>
                            <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}

                    {networkHostname && (
                        <div className="mt-8 px-2 flex flex-col gap-1.5">
                            <label className="text-[11px] font-semibold text-secondary uppercase tracking-wider pl-2">Acceso Cajeros (LAN)</label>
                            <div className="relative">
                                <input 
                                    className="w-full bg-surface border border-outline-variant rounded-lg pl-3 pr-10 py-2.5 font-data-mono text-[12px] text-on-surface truncate cursor-default shadow-sm focus:outline-none focus:border-primary" 
                                    type="text" 
                                    readOnly 
                                    value={`http://${networkHostname || networkIp}:4000`} 
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        navigator.clipboard.writeText(`http://${networkHostname || networkIp}:4000`);
                                        setGuardado('✅ Enlace copiado');
                                        setTimeout(() => setGuardado(null), 3000);
                                    }}
                                    className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 text-primary hover:bg-primary/10 rounded-md transition-colors flex items-center justify-center"
                                    title="Copiar enlace"
                                >
                                    <span className="material-symbols-outlined text-[18px]">content_copy</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="col-span-12 md:col-span-9 flex flex-col gap-6">
                    {error && <div className="p-3 rounded-lg bg-error/10 text-error text-body-sm">{error}</div>}
                    {guardado && <div className="p-3 rounded-lg bg-[#008a00]/10 text-[#008a00] text-body-sm">{guardado}</div>}

                    {activeTab === 'empresa' && (
                        <div className="flex flex-col gap-6">
                            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-6">
                                <h3 className="font-headline-md text-headline-md text-on-surface mb-6">Datos de la Empresa</h3>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                                    <div className="sm:col-span-2">
                                    <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">Razón Social</label>
                                    <input className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2 font-body-md text-body-md text-on-surface" type="text" value={empresa.nombre} onChange={(e) => setEmpresa({ ...empresa, nombre: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">RNC</label>
                                    <input className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2 font-data-mono text-data-mono text-on-surface" type="text" maxLength={11} value={empresa.rnc} onChange={(e) => setEmpresa({ ...empresa, rnc: e.target.value.replace(/[^0-9]/g, '') })} placeholder="Ej. 13012345619" />
                                </div>
                                <div>
                                    <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">Teléfono</label>
                                    <input className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2 font-body-md text-body-md text-on-surface" type="tel" maxLength={10} value={empresa.telefono} onChange={(e) => setEmpresa({ ...empresa, telefono: e.target.value.replace(/[^0-9]/g, '') })} placeholder="Ej. 8095550123" />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">Dirección Principal</label>
                                    <textarea className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2 font-body-md text-body-md text-on-surface" rows={2} value={empresa.direccion} onChange={(e) => setEmpresa({ ...empresa, direccion: e.target.value })} />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 border-t border-outline-variant pt-4">
                                <button onClick={guardarEmpresa} className="px-4 py-2 font-body-sm text-body-sm font-medium bg-primary text-on-primary rounded-lg shadow-sm hover:bg-primary/90 transition-colors">Guardar Cambios</button>
                            </div>
                        </div>
                        </div>
                    )}

                    {activeTab === 'usuarios' && (
                        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-headline-md text-headline-md text-on-surface">Usuarios y Roles</h3>
                                <button onClick={() => setIsNuevoUsuarioOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg text-body-sm font-medium hover:bg-primary/90 transition-colors shadow-sm">
                                    <span className="material-symbols-outlined text-[18px]">person_add</span>
                                    Nuevo Usuario
                                </button>
                            </div>
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-outline-variant bg-surface">
                                        <th className="py-3 px-4 font-label-caps text-label-caps text-secondary">Nombre</th>
                                        <th className="py-3 px-4 font-label-caps text-label-caps text-secondary">Usuario</th>
                                        <th className="py-3 px-4 font-label-caps text-label-caps text-secondary">Rol</th>
                                        <th className="py-3 px-4 font-label-caps text-label-caps text-secondary text-center">Estado</th>
                                        <th className="py-3 px-4 font-label-caps text-label-caps text-secondary">Último acceso</th>
                                        <th className="py-3 px-4 font-label-caps text-label-caps text-secondary text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {usuarios.length === 0 && (
                                        <tr><td colSpan={6} className="py-6 text-center text-on-surface-variant">Sin usuarios.</td></tr>
                                    )}
                                    {usuarios.map((u) => (
                                        <tr key={u.id} className="border-b border-outline-variant hover:bg-surface-container-lowest transition-colors">
                                            <td className="py-3 px-4 font-body-sm text-body-sm text-on-surface flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center text-xs font-bold">{u.nombre.slice(0, 2).toUpperCase()}</div>
                                                {u.nombre}
                                            </td>
                                            <td className="py-3 px-4 font-data-mono text-data-mono text-on-surface-variant">{u.nombreUsuario}</td>
                                            <td className="py-3 px-4 font-body-sm text-body-sm text-on-surface capitalize">{u.rol.nombre}</td>
                                            <td className="py-3 px-4 text-center">
                                                <span className={`px-2 py-1 rounded text-xs ${u.activo ? 'bg-[#dcfce7] text-[#166534]' : 'bg-surface-container-high text-on-surface-variant'}`}>{u.activo ? 'Activo' : 'Inactivo'}</span>
                                            </td>
                                            <td className="py-3 px-4 font-data-mono text-data-mono text-secondary">{u.ultimoAcceso ? new Date(u.ultimoAcceso).toLocaleString('es-DO') : 'Nunca'}</td>
                                            <td className="py-3 px-4 text-right">
                                                <button onClick={() => toggleActivoUsuario(u)} className="text-xs px-3 py-1 rounded-lg border border-outline-variant hover:bg-surface-container transition-colors">
                                                    {u.activo ? 'Desactivar' : 'Activar'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'facturacion' && (
                        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-6">
                            <h3 className="font-headline-md text-headline-md text-on-surface mb-6">Ajustes de Facturación</h3>
                            <div className="flex flex-col gap-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2">Tasa ITBIS / IVA (%)</label>
                                        <input type="number" value={facturacion.impuestoPorcentaje} onChange={(e) => setFacturacion({ ...facturacion, impuestoPorcentaje: Number(e.target.value) })} className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2 font-data-mono text-data-mono text-on-surface" />
                                    </div>
                                    <div>
                                        <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2">Moneda Principal</label>
                                        <select value={facturacion.moneda} onChange={(e) => setFacturacion({ ...facturacion, moneda: e.target.value })} className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2 font-body-md text-body-md text-on-surface">
                                            <option value="DOP">DOP - Peso Dominicano</option>
                                            <option value="USD">USD - Dólar Estadounidense</option>
                                            <option value="EUR">EUR - Euro</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2">Descuento Máximo sin Aprobación (%)</label>
                                        <input type="number" value={facturacion.descuentoMaximoSinAprobar} onChange={(e) => setFacturacion({ ...facturacion, descuentoMaximoSinAprobar: Number(e.target.value) })} className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2 font-data-mono text-data-mono text-on-surface" />
                                    </div>
                                    <div>
                                        <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2">Serie de Factura</label>
                                        <input type="text" value={facturacion.serieFactura} onChange={(e) => setFacturacion({ ...facturacion, serieFactura: e.target.value })} className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2 font-data-mono text-data-mono text-on-surface" />
                                    </div>
                                </div>
                                <div className="border-t border-outline-variant pt-4 flex flex-col gap-3">
                                    <p className="font-label-caps text-label-caps text-on-surface-variant uppercase">Opciones adicionales</p>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input type="checkbox" checked={facturacion.permiteCredito} onChange={(e) => setFacturacion({ ...facturacion, permiteCredito: e.target.checked })} className="w-4 h-4 text-primary rounded border-outline focus:ring-primary" />
                                        <span className="text-body-sm text-on-surface">Permitir facturación a crédito</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input type="checkbox" checked={facturacion.mostrarDesgloseImpuesto} onChange={(e) => setFacturacion({ ...facturacion, mostrarDesgloseImpuesto: e.target.checked })} className="w-4 h-4 text-primary rounded border-outline focus:ring-primary" />
                                        <span className="text-body-sm text-on-surface">Mostrar desglose de impuesto en factura</span>
                                    </label>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 border-t border-outline-variant pt-4 mt-4">
                                <button onClick={guardarFacturacion} className="px-4 py-2 font-body-sm text-body-sm font-medium bg-primary text-on-primary rounded-lg shadow-sm hover:bg-primary/90 transition-colors">Guardar Cambios</button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'auditoria' && (
                        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-title-sm text-title-sm text-on-surface">Actividad Reciente</h3>
                                <button onClick={() => setIsAuditoriaOpen(true)} className="text-primary font-body-sm text-body-sm font-medium hover:underline">Ver Auditoría Completa</button>
                            </div>
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-outline-variant bg-surface">
                                        <th className="py-3 px-4 font-label-caps text-label-caps text-secondary">Fecha/Hora</th>
                                        <th className="py-3 px-4 font-label-caps text-label-caps text-secondary">Usuario</th>
                                        <th className="py-3 px-4 font-label-caps text-label-caps text-secondary">Acción</th>
                                        <th className="py-3 px-4 font-label-caps text-label-caps text-secondary">Entidad</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {auditoriaReciente.length === 0 && (
                                        <tr><td colSpan={4} className="py-6 text-center text-on-surface-variant">Sin actividad todavía.</td></tr>
                                    )}
                                    {auditoriaReciente.map((log) => (
                                        <tr key={log.id} className="border-b border-outline-variant hover:bg-surface-container-lowest transition-colors">
                                            <td className="py-3 px-4 font-data-mono text-data-mono text-on-surface">{new Date(log.timestamp).toLocaleString('es-DO')}</td>
                                            <td className="py-3 px-4 font-body-sm text-body-sm text-on-surface">{log.usuario?.nombre ?? 'Sistema'}</td>
                                            <td className="py-3 px-4 font-body-sm text-body-sm text-on-surface"><span className="px-2 py-1 bg-surface-container-high rounded text-xs">{log.accion}</span></td>
                                            <td className="py-3 px-4 font-body-sm text-body-sm text-secondary">{log.entidad}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {isAuditoriaOpen && <AuditoriaModal onClose={() => setIsAuditoriaOpen(false)} />}
            {isNuevoUsuarioOpen && <NuevoUsuarioModal onClose={() => setIsNuevoUsuarioOpen(false)} onCreado={() => { setIsNuevoUsuarioOpen(false); cargarUsuarios(); }} />}
        </div>
    );
};
