import React, { useEffect, useState } from 'react';
import { NuevoProveedorModal, ProveedorForm } from '../components/modals/NuevoProveedorModal';
import { FiltrosAvanzadosModal } from '../components/modals/FiltrosAvanzadosModal';
import { EliminarConfirmModal } from '../components/modals/EliminarConfirmModal';
import { api, ApiError } from '../lib/api';
import { useToast } from '../context/ToastContext';

interface Proveedor {
    id: string; nombre: string; rnc: string | null; tipo: 'empresa' | 'persona'; contactoNombre: string | null; telefono: string | null;
    correo: string | null; direccion: string | null; ciudad: string | null; categoria: string | null;
    condicionesPago: string; observaciones: string | null; activo: boolean; productosSuministrados: number;
}

export const Proveedores = () => {
    const [proveedores, setProveedores] = useState<Proveedor[]>([]);
    const [busqueda, setBusqueda] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isFiltrosOpen, setIsFiltrosOpen] = useState(false);
    const [proveedorEditar, setProveedorEditar] = useState<Proveedor | null>(null);
    const [proveedorDesactivar, setProveedorDesactivar] = useState<Proveedor | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { mostrarToast } = useToast();

    function cargar() {
        api.get<Proveedor[]>('/proveedores', { busqueda }).then(setProveedores).catch((err) => setError(err instanceof ApiError ? err.message : 'No se pudieron cargar los proveedores'));
    }

    useEffect(() => { cargar(); }, [busqueda]);

    async function desactivar() {
        if (!proveedorDesactivar) return;
        try {
            await api.patch(`/proveedores/${proveedorDesactivar.id}`, { activo: false });
            mostrarToast('Proveedor desactivado correctamente', 'success');
            setProveedorDesactivar(null);
            cargar();
        } catch (err) {
            mostrarToast(err instanceof ApiError ? err.message : 'No se pudo desactivar el proveedor', 'error');
            setError(err instanceof ApiError ? err.message : 'No se pudo desactivar el proveedor');
        }
    }

    const activos = proveedores.filter((p) => p.activo).length;

    return (
        <div className="max-w-[1440px] mx-auto flex flex-col gap-6 pb-20">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div className="flex gap-4 flex-wrap w-full lg:w-auto">
                    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex items-center gap-4 shadow-sm flex-1 min-w-[200px]">
                        <div className="p-3 bg-secondary-container/50 rounded-lg text-primary">
                            <span className="material-symbols-outlined">storefront</span>
                        </div>
                        <div>
                            <p className="font-label-caps text-label-caps text-secondary uppercase tracking-wider">Total Proveedores</p>
                            <p className="text-3xl font-bold text-on-surface">{proveedores.length}</p>
                        </div>
                    </div>
                    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex items-center gap-4 shadow-sm flex-1 min-w-[200px]">
                        <div className="p-3 bg-green-100 rounded-lg text-green-700">
                            <span className="material-symbols-outlined">check_circle</span>
                        </div>
                        <div>
                            <p className="font-label-caps text-label-caps text-secondary uppercase tracking-wider">Proveedores Activos</p>
                            <p className="text-3xl font-bold text-on-surface">{activos}</p>
                        </div>
                    </div>
                </div>

                <button onClick={() => { setProveedorEditar(null); setIsModalOpen(true); }} className="bg-primary hover:bg-primary-fixed-variant text-on-primary px-6 py-3 rounded-lg font-body-md text-body-md font-medium shadow-sm transition-all flex items-center gap-2 w-full lg:w-auto justify-center">
                    <span className="material-symbols-outlined text-sm">add</span>
                    Nuevo Proveedor
                </button>
            </div>

            {error && <div className="p-3 rounded-lg bg-error/10 text-error text-body-sm">{error}</div>}

            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm flex flex-col flex-1 overflow-hidden">
                <div className="p-4 border-b border-outline-variant flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="relative w-full sm:w-96">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">search</span>
                        <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-surface border border-outline-variant rounded-lg font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Buscar por nombre o RNC..." type="text" />
                    </div>
                    <button onClick={() => setIsFiltrosOpen(true)} className="px-4 py-2 border border-outline-variant rounded-lg text-on-surface font-body-sm text-body-sm flex items-center gap-2 hover:bg-surface-container transition-colors">
                        <span className="material-symbols-outlined text-sm">filter_list</span>
                        Filtros
                    </button>
                </div>

                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead className="bg-surface-container-lowest sticky top-0 z-10">
                            <tr>
                                <th className="py-3 px-6 font-label-caps text-label-caps text-secondary uppercase border-b border-outline-variant whitespace-nowrap">Nombre / Empresa</th>
                                <th className="py-3 px-6 font-label-caps text-label-caps text-secondary uppercase border-b border-outline-variant whitespace-nowrap">RNC</th>
                                <th className="py-3 px-6 font-label-caps text-label-caps text-secondary uppercase border-b border-outline-variant whitespace-nowrap">Contacto Principal</th>
                                <th className="py-3 px-6 font-label-caps text-label-caps text-secondary uppercase border-b border-outline-variant whitespace-nowrap">Teléfono</th>
                                <th className="py-3 px-6 font-label-caps text-label-caps text-secondary uppercase border-b border-outline-variant whitespace-nowrap text-center">Estado</th>
                                <th className="py-3 px-6 font-label-caps text-label-caps text-secondary uppercase border-b border-outline-variant whitespace-nowrap text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant font-body-sm text-body-sm">
                            {proveedores.length === 0 && (
                                <tr><td colSpan={6} className="py-8 px-6 text-center text-on-surface-variant">Sin proveedores registrados.</td></tr>
                            )}
                            {proveedores.map((p) => (
                                <tr key={p.id} className="hover:bg-surface-container-low transition-colors group">
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded bg-surface-container flex items-center justify-center text-primary font-bold text-xs">{p.nombre.slice(0, 2).toUpperCase()}</div>
                                            <div>
                                                <p className="font-medium text-on-surface">{p.nombre}</p>
                                                <p className="text-xs text-secondary">{p.categoria ?? 'Sin categoría'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 font-data-mono text-data-mono text-on-surface-variant">{p.rnc ?? '—'}</td>
                                    <td className="py-4 px-6"><p className="text-on-surface">{p.contactoNombre ?? '—'}</p></td>
                                    <td className="py-4 px-6 font-data-mono text-data-mono text-on-surface-variant">{p.telefono ?? '—'}</td>
                                    <td className="py-4 px-6 text-center">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${p.activo ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-gray-100 text-gray-800 border border-gray-200'}`}>{p.activo ? 'Activo' : 'Inactivo'}</span>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => { setProveedorEditar(p); setIsModalOpen(true); }} className="p-1.5 text-secondary hover:text-primary hover:bg-secondary-container rounded-md transition-colors" title="Editar">
                                                <span className="material-symbols-outlined text-sm">edit</span>
                                            </button>
                                            {p.activo && (
                                                <button onClick={() => setProveedorDesactivar(p)} className="p-1.5 text-secondary hover:text-error hover:bg-error-container rounded-md transition-colors" title="Desactivar">
                                                    <span className="material-symbols-outlined text-sm">block</span>
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 border-t border-outline-variant flex items-center justify-between">
                    <p className="font-body-sm text-body-sm text-secondary">Mostrando {proveedores.length} proveedores</p>
                </div>
            </div>

            {isModalOpen && (
                <NuevoProveedorModal
                    proveedor={proveedorEditar ? {
                        id: proveedorEditar.id,
                        nombre: proveedorEditar.nombre,
                        rnc: proveedorEditar.rnc ?? '',
                        tipo: proveedorEditar.tipo,
                        contactoNombre: proveedorEditar.contactoNombre ?? '',
                        telefono: proveedorEditar.telefono ?? '',
                        correo: proveedorEditar.correo ?? '',
                        direccion: proveedorEditar.direccion ?? '',
                        ciudad: proveedorEditar.ciudad ?? '',
                        categoria: proveedorEditar.categoria ?? '',
                        condicionesPago: proveedorEditar.condicionesPago,
                        activo: proveedorEditar.activo,
                        observaciones: proveedorEditar.observaciones ?? '',
                    } : null}
                    onClose={() => setIsModalOpen(false)}
                    onGuardado={() => { setIsModalOpen(false); mostrarToast(proveedorEditar ? 'Proveedor actualizado correctamente' : 'Proveedor creado correctamente', 'success'); cargar(); }}
                />
            )}
            {isFiltrosOpen && <FiltrosAvanzadosModal onClose={() => setIsFiltrosOpen(false)} />}
            {proveedorDesactivar && (
                <EliminarConfirmModal
                    titulo="¿Desactivar proveedor?"
                    mensaje={`"${proveedorDesactivar.nombre}" dejará de estar disponible para nuevas entradas de mercancía.`}
                    labelConfirmar="Sí, desactivar"
                    onClose={() => setProveedorDesactivar(null)}
                    onConfirmar={desactivar}
                />
            )}
        </div>
    );
};
