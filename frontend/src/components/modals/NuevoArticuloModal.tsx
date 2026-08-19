import React, { useEffect, useState } from 'react';
import { api, ApiError } from '../../lib/api';

export interface ProductoForm {
    id?: string;
    codigo: string;
    codigoBarras: string;
    nombre: string;
    descripcion: string;
    categoriaId: string;
    proveedorId: string;
    precioCosto: string;
    precioVenta: string;
    stockActual: string;
    stockMinimo: string;
    ubicacionId: string;
}

interface Props {
    onClose: () => void;
    onGuardado: () => void;
    producto?: ProductoForm | null;
}

const VACIO: ProductoForm = {
    codigo: '', codigoBarras: '', nombre: '', descripcion: '', categoriaId: '', proveedorId: '',
    precioCosto: '', precioVenta: '', stockActual: '0', stockMinimo: '5', ubicacionId: '',
};

export const NuevoArticuloModal = ({ onClose, onGuardado, producto }: Props) => {
    const [form, setForm] = useState<ProductoForm>(producto ?? VACIO);
    const [categorias, setCategorias] = useState<{ id: string; nombre: string }[]>([]);
    const [proveedores, setProveedores] = useState<{ id: string; nombre: string }[]>([]);
    const [ubicaciones, setUbicaciones] = useState<{ id: string; nombre: string }[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [guardando, setGuardando] = useState(false);
    const esEdicion = Boolean(producto?.id);

    useEffect(() => {
        api.get('/categorias').then(setCategorias).catch(() => {});
        api.get('/proveedores').then(setProveedores).catch(() => {});
        api.get('/ubicaciones').then(setUbicaciones).catch(() => {});
    }, []);

    function set<K extends keyof ProductoForm>(key: K, value: ProductoForm[K]) {
        setForm((f) => ({ ...f, [key]: value }));
    }

    async function handleGuardar() {
        setError(null);
        if (!form.codigo || !form.nombre || !form.precioCosto || !form.precioVenta) {
            setError('Completa los campos obligatorios: código, nombre, precio de costo y precio de venta.');
            return;
        }
        setGuardando(true);
        try {
            const payload = {
                codigo: form.codigo,
                codigoBarras: form.codigoBarras || null,
                nombre: form.nombre,
                descripcion: form.descripcion || null,
                categoriaId: form.categoriaId || null,
                proveedorId: form.proveedorId || null,
                ubicacionId: form.ubicacionId || null,
                precioCosto: Number(form.precioCosto),
                precioVenta: Number(form.precioVenta),
                ...(esEdicion ? {} : { stockActual: Number(form.stockActual || 0) }),
                stockMinimo: Number(form.stockMinimo || 0),
            };
            if (esEdicion && form.id) {
                await api.patch(`/productos/${form.id}`, payload);
            } else {
                await api.post('/productos', payload);
            }
            onGuardado();
        } catch (err) {
            setError(err instanceof ApiError ? err.message : 'No se pudo guardar el artículo');
        } finally {
            setGuardando(false);
        }
    }

    return (
        <>
            <div className="fixed inset-0 bg-[#0f172a] bg-opacity-40 backdrop-blur-[2px] z-40 transition-opacity" onClick={onClose}></div>

            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <main className="relative w-full max-w-3xl bg-surface-container-lowest rounded-xl shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)] border border-outline-variant/30 flex flex-col max-h-[90vh] pointer-events-auto">
                    <header className="flex items-start justify-between px-6 py-5 border-b border-outline-variant/30 shrink-0">
                        <div>
                            <h2 className="font-headline-md text-headline-md text-on-surface">{esEdicion ? 'Editar artículo' : 'Nuevo artículo'}</h2>
                            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                                {esEdicion ? 'Actualiza los datos del producto' : 'Registra un nuevo producto en el inventario'}
                            </p>
                        </div>
                        <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-full p-2 transition-colors">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </header>

                    <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
                        {error && <div className="p-3 rounded-lg bg-error/10 text-error text-body-sm">{error}</div>}

                        <section className="space-y-4">
                            <h3 className="font-label-caps text-label-caps text-secondary uppercase tracking-wider">Información principal</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="block font-body-sm text-body-sm text-on-surface font-medium">Código <span className="text-error">*</span></label>
                                    <input className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-body-sm text-body-sm" value={form.codigo} onChange={(e) => set('codigo', e.target.value)} placeholder="Ej. PRD-001" disabled={esEdicion} />
                                </div>
                                <div className="space-y-1">
                                    <label className="block font-body-sm text-body-sm text-on-surface font-medium">Código de barras</label>
                                    <input className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-body-sm text-body-sm" value={form.codigoBarras} onChange={(e) => set('codigoBarras', e.target.value)} placeholder="Opcional" />
                                </div>
                                <div className="space-y-1 md:col-span-2">
                                    <label className="block font-body-sm text-body-sm text-on-surface font-medium">Nombre <span className="text-error">*</span></label>
                                    <input className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-body-sm text-body-sm" value={form.nombre} onChange={(e) => set('nombre', e.target.value)} placeholder="Nombre del producto" />
                                </div>
                                <div className="space-y-1 md:col-span-2">
                                    <label className="block font-body-sm text-body-sm text-on-surface font-medium">Descripción</label>
                                    <textarea className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-body-sm text-body-sm resize-none" rows={2} value={form.descripcion} onChange={(e) => set('descripcion', e.target.value)} placeholder="Descripción detallada (opcional)" />
                                </div>
                            </div>
                        </section>

                        <section className="space-y-4">
                            <h3 className="font-label-caps text-label-caps text-secondary uppercase tracking-wider">Categorización y Precios</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="block font-body-sm text-body-sm text-on-surface font-medium">Categoría</label>
                                    <select className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-body-sm text-body-sm" value={form.categoriaId} onChange={(e) => set('categoriaId', e.target.value)}>
                                        <option value="">Selecciona una categoría</option>
                                        {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="block font-body-sm text-body-sm text-on-surface font-medium">Proveedor</label>
                                    <select className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-body-sm text-body-sm" value={form.proveedorId} onChange={(e) => set('proveedorId', e.target.value)}>
                                        <option value="">Selecciona un proveedor</option>
                                        {proveedores.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="block font-body-sm text-body-sm text-on-surface font-medium">Precio de costo <span className="text-error">*</span></label>
                                    <input className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-body-sm text-body-sm" type="number" step="0.01" value={form.precioCosto} onChange={(e) => set('precioCosto', e.target.value)} placeholder="0.00" />
                                </div>
                                <div className="space-y-1">
                                    <label className="block font-body-sm text-body-sm text-on-surface font-medium">Precio de venta <span className="text-error">*</span></label>
                                    <input className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-body-sm text-body-sm" type="number" step="0.01" value={form.precioVenta} onChange={(e) => set('precioVenta', e.target.value)} placeholder="0.00" />
                                </div>
                            </div>
                        </section>

                        <section className="space-y-4">
                            <h3 className="font-label-caps text-label-caps text-secondary uppercase tracking-wider">Inventario</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <label className="block font-body-sm text-body-sm text-on-surface font-medium">Stock actual {!esEdicion && <span className="text-error">*</span>}</label>
                                    <input className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-body-sm text-body-sm disabled:opacity-60" type="number" value={form.stockActual} onChange={(e) => set('stockActual', e.target.value)} disabled={esEdicion} title={esEdicion ? 'Usa "Ajustar inventario" para cambiar el stock' : ''} />
                                </div>
                                <div className="space-y-1">
                                    <label className="block font-body-sm text-body-sm text-on-surface font-medium">Stock mínimo</label>
                                    <input className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-body-sm text-body-sm" type="number" value={form.stockMinimo} onChange={(e) => set('stockMinimo', e.target.value)} />
                                </div>
                                <div className="space-y-1">
                                    <label className="block font-body-sm text-body-sm text-on-surface font-medium">Ubicación / Bodega</label>
                                    <select className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-body-sm text-body-sm" value={form.ubicacionId} onChange={(e) => set('ubicacionId', e.target.value)}>
                                        <option value="">Sin asignar</option>
                                        {ubicaciones.map((u) => <option key={u.id} value={u.id}>{u.nombre}</option>)}
                                    </select>
                                </div>
                            </div>
                        </section>
                    </div>

                    <footer className="flex items-center justify-end gap-3 px-6 py-4 border-t border-outline-variant/30 bg-surface-container-low/50 shrink-0 rounded-b-xl">
                        <button onClick={onClose} className="px-4 py-2 rounded-lg font-body-md text-body-md font-medium text-on-surface-variant hover:bg-surface-container-highest transition-colors">Cancelar</button>
                        <button onClick={handleGuardar} disabled={guardando} className="px-4 py-2 rounded-lg font-body-md text-body-md font-medium text-on-primary bg-primary hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-60">
                            {guardando ? 'Guardando…' : 'Guardar artículo'}
                        </button>
                    </footer>
                </main>
            </div>
        </>
    );
};
