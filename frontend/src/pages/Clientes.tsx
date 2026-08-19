import React, { useEffect, useState } from 'react';
import { NuevoClienteModal } from '../components/modals/NuevoClienteModal';
import { NuevoProveedorModal } from '../components/modals/NuevoProveedorModal';
import { ClienteModal } from '../components/modals/ClienteModal';
import { api, ApiError } from '../lib/api';

interface Cliente {
    id: string; nombre: string; documento: string | null; telefono: string | null;
    totalComprado: number; activo: boolean; cantidadCompras: number;
}

const formatoMoneda = new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' });

export const Clientes = () => {
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [busqueda, setBusqueda] = useState('');
    const [isNuevoClienteModalOpen, setIsNuevoClienteModalOpen] = useState(false);
    const [isNuevoProveedorOpen, setIsNuevoProveedorOpen] = useState(false);
    const [clienteSeleccionadoId, setClienteSeleccionadoId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    function cargar() {
        api.get<Cliente[]>('/clientes', { busqueda }).then(setClientes).catch((err) => setError(err instanceof ApiError ? err.message : 'No se pudieron cargar los clientes'));
    }

    useEffect(() => { cargar(); }, [busqueda]);

    const clientePerfil = clientes.find((c) => c.id === clienteSeleccionadoId) ?? clientes[0] ?? null;

    return (
        <div className="max-w-[1440px] mx-auto space-y-6 pb-20">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h3 className="font-headline-md text-headline-md text-on-surface">Gestión de Clientes</h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Administra tu cartera de clientes.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setIsNuevoClienteModalOpen(true)} className="bg-primary hover:bg-primary-container text-on-primary font-body-sm text-body-sm py-2 px-4 rounded transition-colors flex items-center gap-2 shadow-sm">
                        <span className="material-symbols-outlined text-[18px]">add</span>
                        Nuevo Cliente
                    </button>
                    <button onClick={() => setIsNuevoProveedorOpen(true)} className="bg-surface hover:bg-surface-container text-on-surface border border-outline-variant font-body-sm text-body-sm py-2 px-4 rounded transition-colors flex items-center gap-2 shadow-sm">
                        <span className="material-symbols-outlined text-[18px]">add</span>
                        Nuevo Proveedor
                    </button>
                </div>
            </div>

            {error && <div className="p-3 rounded-lg bg-error/10 text-error text-body-sm">{error}</div>}

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                <div className="xl:col-span-8 space-y-6">
                    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden flex flex-col h-[500px]">
                        <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface">
                            <h4 className="font-title-sm text-title-sm text-on-surface">Clientes</h4>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
                                <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="pl-10 pr-4 py-2 border border-outline-variant rounded bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary font-body-sm text-body-sm w-64" placeholder="Buscar cliente..." type="text" />
                            </div>
                        </div>
                        <div className="flex-1 overflow-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="sticky top-0 bg-surface z-10">
                                    <tr>
                                        <th className="px-6 py-3 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Nombre</th>
                                        <th className="px-6 py-3 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Documento</th>
                                        <th className="px-6 py-3 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Teléfono</th>
                                        <th className="px-6 py-3 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider text-right">Compras Totales</th>
                                        <th className="px-6 py-3 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider text-center">Estado</th>
                                    </tr>
                                </thead>
                                <tbody className="font-body-sm text-body-sm text-on-surface">
                                    {clientes.length === 0 && (
                                        <tr><td colSpan={5} className="px-6 py-8 text-center text-on-surface-variant">Sin clientes registrados.</td></tr>
                                    )}
                                    {clientes.map((c) => (
                                        <tr key={c.id} className="hover:bg-surface-container-low transition-colors cursor-pointer border-b border-outline-variant/50" onClick={() => setClienteSeleccionadoId(c.id)}>
                                            <td className="px-6 py-4 font-medium">{c.nombre}</td>
                                            <td className="px-6 py-4 font-data-mono text-on-surface-variant">{c.documento ?? '—'}</td>
                                            <td className="px-6 py-4 font-data-mono text-on-surface-variant">{c.telefono ?? '—'}</td>
                                            <td className="px-6 py-4 font-data-mono text-right">{formatoMoneda.format(c.totalComprado)}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full font-label-caps text-[10px] ${c.activo ? 'bg-secondary-container/50 text-on-secondary-container' : 'bg-error-container/50 text-on-error-container'}`}>{c.activo ? 'Activo' : 'Inactivo'}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="xl:col-span-4 space-y-6">
                    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-6 flex flex-col h-[500px]">
                        <h4 className="font-title-sm text-title-sm text-on-surface mb-4">Perfil Rápido</h4>
                        {clientePerfil ? (
                            <>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-16 h-16 rounded-full bg-primary-container/20 flex items-center justify-center text-primary text-2xl font-bold">
                                        {clientePerfil.nombre.slice(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <h5 className="font-title-sm text-title-sm text-on-surface">{clientePerfil.nombre}</h5>
                                        <p className="font-body-sm text-body-sm text-on-surface-variant">{clientePerfil.cantidadCompras} compras registradas</p>
                                    </div>
                                </div>
                                <div className="space-y-4 flex-1">
                                    <div>
                                        <span className="font-label-caps text-label-caps text-on-surface-variant block mb-1">Total comprado</span>
                                        <p className="font-body-sm text-body-sm text-on-surface">{formatoMoneda.format(clientePerfil.totalComprado)}</p>
                                    </div>
                                </div>
                                <button onClick={() => setClienteSeleccionadoId(clientePerfil.id)} className="w-full mt-4 bg-surface hover:bg-surface-container text-primary border border-outline-variant font-body-sm text-body-sm py-2 px-4 rounded transition-colors text-center">
                                    Ver Historial Completo
                                </button>
                            </>
                        ) : (
                            <p className="text-on-surface-variant text-body-sm">Selecciona un cliente para ver su perfil.</p>
                        )}
                    </div>
                </div>
            </div>

            {isNuevoClienteModalOpen && (
                <NuevoClienteModal onClose={() => setIsNuevoClienteModalOpen(false)} onCreado={() => { setIsNuevoClienteModalOpen(false); cargar(); }} />
            )}
            {isNuevoProveedorOpen && <NuevoProveedorModal onClose={() => setIsNuevoProveedorOpen(false)} onGuardado={() => setIsNuevoProveedorOpen(false)} />}
            {clienteSeleccionadoId && <ClienteModal clienteId={clienteSeleccionadoId} onClose={() => setClienteSeleccionadoId(null)} />}
        </div>
    );
};
