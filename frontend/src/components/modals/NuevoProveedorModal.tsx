import React, { useState } from 'react';
import { api, ApiError } from '../../lib/api';

export interface ProveedorForm {
    id?: string;
    nombre: string;
    rnc: string;
    tipo: 'empresa' | 'persona';
    contactoNombre: string;
    telefono: string;
    correo: string;
    direccion: string;
    ciudad: string;
    categoria: string;
    condicionesPago: string;
    activo: boolean;
    observaciones: string;
}

interface Props {
    onClose: () => void;
    onGuardado: () => void;
    proveedor?: ProveedorForm | null;
}

const VACIO: ProveedorForm = {
    nombre: '', rnc: '', tipo: 'empresa', contactoNombre: '', telefono: '', correo: '',
    direccion: '', ciudad: '', categoria: '', condicionesPago: 'contado', activo: true, observaciones: '',
};

export const NuevoProveedorModal = ({ onClose, onGuardado, proveedor }: Props) => {
    const [form, setForm] = useState<ProveedorForm>(proveedor ?? VACIO);
    const [error, setError] = useState<string | null>(null);
    const [guardando, setGuardando] = useState(false);
    const esEdicion = Boolean(proveedor?.id);

    function set<K extends keyof ProveedorForm>(key: K, value: ProveedorForm[K]) {
        setForm((f) => ({ ...f, [key]: value }));
    }

    async function handleGuardar() {
        if (!form.nombre || !form.contactoNombre || !form.telefono) {
            setError('Completa nombre, contacto y teléfono');
            return;
        }
        setError(null);
        setGuardando(true);
        try {
            const payload = { ...form, rnc: form.rnc || null, correo: form.correo || null };
            if (esEdicion && form.id) {
                await api.patch(`/proveedores/${form.id}`, payload);
            } else {
                await api.post('/proveedores', payload);
            }
            onGuardado();
        } catch (err) {
            setError(err instanceof ApiError ? err.message : 'No se pudo guardar el proveedor');
        } finally {
            setGuardando(false);
        }
    }

    return (
        <>
            <div className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-[2px] z-40 transition-opacity duration-300" onClick={onClose}></div>

            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <div className="relative bg-surface-container-lowest w-full max-w-3xl rounded-xl shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)] flex flex-col max-h-[90vh] overflow-hidden pointer-events-auto">
                    <div className="flex items-start justify-between px-6 py-5 border-b border-outline-variant/30 shrink-0">
                        <div>
                            <h2 className="font-headline-md text-headline-md text-on-surface">{esEdicion ? 'Editar proveedor' : 'Nuevo proveedor'}</h2>
                            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Registra un proveedor para gestionar tus compras e inventario</p>
                        </div>
                        <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high p-2 rounded-full transition-colors">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-6 bg-surface space-y-8">
                        {error && <div className="p-3 rounded-lg bg-error/10 text-error text-body-sm">{error}</div>}

                        <section>
                            <h3 className="font-label-caps text-label-caps uppercase text-secondary mb-4 tracking-wider">Información del proveedor</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-body-sm text-body-sm text-on-surface mb-1.5">Nombre/Razón social <span className="text-error">*</span></label>
                                    <input value={form.nombre} onChange={(e) => set('nombre', e.target.value)} className="w-full bg-surface-container-lowest border border-outline-variant/60 rounded focus:border-primary focus:ring-2 focus:ring-primary/20 text-on-surface font-body-md text-body-md px-3 py-2" placeholder="Ej. Proveedora Industrial S.A." />
                                </div>
                                <div>
                                    <label className="block font-body-sm text-body-sm text-on-surface mb-1.5">RNC</label>
                                    <input value={form.rnc} onChange={(e) => set('rnc', e.target.value.replace(/[^0-9]/g, ''))} maxLength={11} className="w-full bg-surface-container-lowest border border-outline-variant/60 rounded focus:border-primary focus:ring-2 focus:ring-primary/20 text-on-surface font-body-md text-body-md px-3 py-2" placeholder="Ej. 13012345619" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block font-body-sm text-body-sm text-on-surface mb-2">Tipo</label>
                                    <div className="flex items-center gap-6">
                                        {(['empresa', 'persona'] as const).map((t) => (
                                            <label key={t} className="flex items-center gap-2 cursor-pointer">
                                                <input checked={form.tipo === t} onChange={() => set('tipo', t)} className="w-4 h-4 text-primary" type="radio" />
                                                <span className="font-body-sm text-body-sm text-on-surface-variant capitalize">{t}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h3 className="font-label-caps text-label-caps uppercase text-secondary mb-4 tracking-wider">Información de contacto</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block font-body-sm text-body-sm text-on-surface mb-1.5">Nombre del contacto <span className="text-error">*</span></label>
                                    <input value={form.contactoNombre} onChange={(e) => set('contactoNombre', e.target.value)} className="w-full bg-surface-container-lowest border border-outline-variant/60 rounded focus:border-primary focus:ring-2 focus:ring-primary/20 text-on-surface font-body-md text-body-md px-3 py-2" placeholder="Nombre de la persona a contactar" />
                                </div>
                                <div>
                                    <label className="block font-body-sm text-body-sm text-on-surface mb-1.5">Teléfono <span className="text-error">*</span></label>
                                    <input value={form.telefono} onChange={(e) => set('telefono', e.target.value.replace(/[^0-9]/g, ''))} maxLength={10} className="w-full bg-surface-container-lowest border border-outline-variant/60 rounded focus:border-primary focus:ring-2 focus:ring-primary/20 text-on-surface font-body-md text-body-md px-3 py-2" placeholder="Ej. 8095550123" />
                                </div>
                                <div>
                                    <label className="block font-body-sm text-body-sm text-on-surface mb-1.5">Correo electrónico</label>
                                    <input value={form.correo} onChange={(e) => set('correo', e.target.value)} className="w-full bg-surface-container-lowest border border-outline-variant/60 rounded focus:border-primary focus:ring-2 focus:ring-primary/20 text-on-surface font-body-md text-body-md px-3 py-2" placeholder="correo@empresa.com" />
                                </div>
                            </div>
                        </section>

                        <section>
                            <h3 className="font-label-caps text-label-caps uppercase text-secondary mb-4 tracking-wider">Ubicación</h3>
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block font-body-sm text-body-sm text-on-surface mb-1.5">Dirección</label>
                                    <input value={form.direccion} onChange={(e) => set('direccion', e.target.value)} className="w-full bg-surface-container-lowest border border-outline-variant/60 rounded focus:border-primary focus:ring-2 focus:ring-primary/20 text-on-surface font-body-md text-body-md px-3 py-2" placeholder="Calle, número, sector" />
                                </div>
                                <div className="md:w-1/2">
                                    <label className="block font-body-sm text-body-sm text-on-surface mb-1.5">Ciudad / Municipio</label>
                                    <input value={form.ciudad} onChange={(e) => set('ciudad', e.target.value)} className="w-full bg-surface-container-lowest border border-outline-variant/60 rounded focus:border-primary focus:ring-2 focus:ring-primary/20 text-on-surface font-body-md text-body-md px-3 py-2" placeholder="Ciudad" />
                                </div>
                            </div>
                        </section>

                        <section>
                            <h3 className="font-label-caps text-label-caps uppercase text-secondary mb-4 tracking-wider">Información comercial</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-body-sm text-body-sm text-on-surface mb-1.5">Categoría</label>
                                    <input value={form.categoria} onChange={(e) => set('categoria', e.target.value)} className="w-full bg-surface-container-lowest border border-outline-variant/60 rounded focus:border-primary focus:ring-2 focus:ring-primary/20 text-on-surface font-body-md text-body-md px-3 py-2" placeholder="Ej. Suministros de Oficina" />
                                </div>
                                <div>
                                    <label className="block font-body-sm text-body-sm text-on-surface mb-1.5">Condiciones de pago</label>
                                    <select value={form.condicionesPago} onChange={(e) => set('condicionesPago', e.target.value)} className="w-full bg-surface-container-lowest border border-outline-variant/60 rounded focus:border-primary focus:ring-2 focus:ring-primary/20 text-on-surface font-body-md text-body-md px-3 py-2">
                                        <option value="contado">Contado</option>
                                        <option value="credito">Crédito</option>
                                        <option value="15_dias">15 días</option>
                                        <option value="30_dias">30 días</option>
                                        <option value="60_dias">60 días</option>
                                    </select>
                                </div>
                            </div>
                        </section>

                        <section className="space-y-6">
                            {esEdicion && (
                                <div>
                                    <h3 className="font-label-caps text-label-caps uppercase text-secondary mb-3 tracking-wider">Estado</h3>
                                    <div className="flex items-center gap-6">
                                        <label className="flex items-center gap-2 cursor-pointer"><input checked={form.activo} onChange={() => set('activo', true)} className="w-4 h-4 text-primary" type="radio" /><span className="font-body-sm text-body-sm text-on-surface-variant">Activo</span></label>
                                        <label className="flex items-center gap-2 cursor-pointer"><input checked={!form.activo} onChange={() => set('activo', false)} className="w-4 h-4 text-primary" type="radio" /><span className="font-body-sm text-body-sm text-on-surface-variant">Inactivo</span></label>
                                    </div>
                                </div>
                            )}
                            <div>
                                <label className="block font-label-caps text-label-caps uppercase text-secondary mb-2 tracking-wider">Observaciones (Opcional)</label>
                                <textarea value={form.observaciones} onChange={(e) => set('observaciones', e.target.value)} className="w-full bg-surface-container-lowest border border-outline-variant/60 rounded focus:border-primary focus:ring-2 focus:ring-primary/20 text-on-surface font-body-md text-body-md px-3 py-2 resize-none" rows={3} placeholder="Notas adicionales sobre este proveedor..." />
                            </div>
                        </section>
                    </div>

                    <div className="flex items-center justify-end gap-3 px-6 py-4 bg-surface-container-lowest border-t border-outline-variant/30 shrink-0">
                        <button onClick={onClose} className="px-4 py-2 bg-surface-container-lowest border border-outline-variant/60 text-on-surface font-body-md text-body-md font-medium rounded hover:bg-surface-container-low transition-colors">Cancelar</button>
                        <button onClick={handleGuardar} disabled={guardando} className="px-4 py-2 bg-primary hover:bg-primary/90 text-on-primary font-body-md text-body-md font-medium rounded shadow-sm transition-colors disabled:opacity-60">
                            {guardando ? 'Guardando…' : 'Guardar proveedor'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};
