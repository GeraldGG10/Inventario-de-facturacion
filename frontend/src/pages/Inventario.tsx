import React, { useEffect, useState } from 'react';
import { NuevoArticuloModal, ProductoForm } from '../components/modals/NuevoArticuloModal';
import { InventarioNav } from '../components/layout/InventarioNav';
import { FiltrosAvanzadosModal } from '../components/modals/FiltrosAvanzadosModal';
import { DetalleProductoModal, ProductoDetalle } from '../components/modals/DetalleProductoModal';
import { EliminarConfirmModal } from '../components/modals/EliminarConfirmModal';
import { api, ApiError } from '../lib/api';

interface Producto extends ProductoDetalle {
    descripcion: string | null;
    codigoBarras: string | null;
    categoriaId: string | null;
    proveedorId: string | null;
    ubicacionId: string | null;
    precioCosto: number;
}

const ESTADO_LABEL: Record<string, string> = { disponible: 'Disponible', stock_bajo: 'Stock Bajo', agotado: 'Agotado', inactivo: 'Inactivo' };
const ESTADO_CLASE: Record<string, string> = {
    disponible: 'bg-secondary-fixed/50 text-on-secondary-fixed',
    stock_bajo: 'bg-tertiary-fixed/50 text-tertiary',
    agotado: 'bg-error-container/30 text-error',
    inactivo: 'bg-surface-variant text-on-surface-variant',
};
const formatoMoneda = new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' });
const PAGE_SIZE = 10;

export const Inventario = () => {
    const [productos, setProductos] = useState<Producto[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [busqueda, setBusqueda] = useState('');
    const [categoriaId, setCategoriaId] = useState('');
    const [estado, setEstado] = useState('');
    const [categorias, setCategorias] = useState<{ id: string; nombre: string }[]>([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isFiltrosOpen, setIsFiltrosOpen] = useState(false);
    const [productoDetalle, setProductoDetalle] = useState<Producto | null>(null);
    const [productoEditar, setProductoEditar] = useState<Producto | null>(null);
    const [productoEliminar, setProductoEliminar] = useState<Producto | null>(null);

    useEffect(() => {
        api.get('/categorias').then(setCategorias).catch(() => {});
    }, []);

    function cargar() {
        setCargando(true);
        api
            .get('/productos', { busqueda, categoriaId, estado, page, pageSize: PAGE_SIZE })
            .then((data) => { setProductos(data.productos); setTotal(data.total); })
            .catch((err) => setError(err instanceof ApiError ? err.message : 'No se pudo cargar el inventario'))
            .finally(() => setCargando(false));
    }

    useEffect(() => { cargar(); }, [page, categoriaId, estado]);

    function buscar(e: React.FormEvent) {
        e.preventDefault();
        setPage(1);
        cargar();
    }

    async function desactivar() {
        if (!productoEliminar) return;
        try {
            await api.post(`/productos/${productoEliminar.id}/desactivar`);
            setProductoEliminar(null);
            cargar();
        } catch (err) {
            setError(err instanceof ApiError ? err.message : 'No se pudo desactivar el producto');
        }
    }

    const totalPaginas = Math.max(1, Math.ceil(total / PAGE_SIZE));

    return (
        <div className="max-w-[1440px] mx-auto space-y-6 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-outline-variant pb-4">
                <div className="w-full md:w-auto overflow-hidden">
                    <InventarioNav />
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button onClick={() => setIsModalOpen(true)} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg font-body-sm text-body-sm font-medium hover:bg-primary-container transition-colors shadow-sm">
                        <span className="material-symbols-outlined text-[20px]">add</span>
                        Nuevo artículo
                    </button>
                </div>
            </div>

            <form onSubmit={buscar} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-[0_1px_3px_0_rgba(0,0,0,0.1)] flex flex-col gap-3">
                <div className="relative w-full">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-outline">search</span>
                    <input
                        className="w-full pl-10 pr-4 py-2 border border-outline-variant rounded-lg bg-surface focus:border-primary focus:ring-2 focus:ring-primary-fixed-dim font-body-sm text-body-sm text-on-surface transition-all"
                        placeholder="Buscar por código, nombre o código de barras..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="relative flex-1">
                        <select
                            className="appearance-none pl-4 pr-10 py-2 border border-outline-variant rounded-lg bg-surface text-on-surface font-body-sm text-body-sm outline-none cursor-pointer w-full"
                            value={categoriaId}
                            onChange={(e) => setCategoriaId(e.target.value)}
                        >
                            <option value="">Todas las Categorías</option>
                            {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                        </select>
                    </div>
                    <div className="relative flex-1">
                        <select
                            className="appearance-none pl-4 pr-10 py-2 border border-outline-variant rounded-lg bg-surface text-on-surface font-body-sm text-body-sm outline-none cursor-pointer w-full"
                            value={estado}
                            onChange={(e) => setEstado(e.target.value)}
                        >
                            <option value="">Todos los Estados</option>
                            <option value="disponible">Disponible</option>
                            <option value="stock_bajo">Stock Bajo</option>
                            <option value="agotado">Agotado</option>
                            <option value="inactivo">Inactivo</option>
                        </select>
                    </div>
                    <button type="submit" className="px-4 py-2 bg-surface border border-outline-variant rounded-lg text-secondary hover:bg-surface-container transition-colors">Buscar</button>
                    <button type="button" onClick={() => setIsFiltrosOpen(true)} className="p-2 border border-outline-variant rounded-lg text-secondary hover:bg-surface-container transition-colors flex items-center justify-center gap-2 bg-surface sm:w-auto" title="Filtros Avanzados">
                        <span className="material-symbols-outlined">tune</span>
                    </button>
                </div>
            </form>

            {error && <div className="p-3 rounded-lg bg-error/10 text-error text-body-sm">{error}</div>}

            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-[0_1px_3px_0_rgba(0,0,0,0.1)] overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface border-b border-outline-variant text-on-surface-variant font-label-caps text-label-caps uppercase tracking-wider">
                                <th className="px-4 py-3 font-semibold whitespace-nowrap">Código</th>
                                <th className="px-4 py-3 font-semibold whitespace-nowrap min-w-[250px]">Nombre del Producto</th>
                                <th className="px-4 py-3 font-semibold whitespace-nowrap">Categoría</th>
                                <th className="px-4 py-3 font-semibold whitespace-nowrap text-right">Precio Venta</th>
                                <th className="px-4 py-3 font-semibold whitespace-nowrap text-right">Stock</th>
                                <th className="px-4 py-3 font-semibold whitespace-nowrap text-center">Estado</th>
                                <th className="px-4 py-3 font-semibold whitespace-nowrap text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="font-body-sm text-body-sm divide-y divide-outline-variant">
                            {cargando && <tr><td colSpan={7} className="px-4 py-6 text-center text-on-surface-variant">Cargando…</td></tr>}
                            {!cargando && productos.length === 0 && <tr><td colSpan={7} className="px-4 py-6 text-center text-on-surface-variant">No se encontraron productos.</td></tr>}
                            {productos.map((p) => (
                                <tr key={p.id} className="hover:bg-surface-container-lowest transition-colors">
                                    <td className="px-4 py-3 font-data-mono text-data-mono text-secondary">{p.codigo}</td>
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-on-surface">{p.nombre}</div>
                                        <div className="text-xs text-secondary mt-0.5">{p.proveedor?.nombre ?? ''}</div>
                                    </td>
                                    <td className="px-4 py-3 text-secondary">{p.categoria?.nombre ?? 'Sin categoría'}</td>
                                    <td className="px-4 py-3 font-data-mono text-data-mono text-right">{formatoMoneda.format(p.precioVenta)}</td>
                                    <td className="px-4 py-3 text-right">
                                        <div className={`font-data-mono text-data-mono font-medium ${p.estado === 'agotado' ? 'text-error' : p.estado === 'stock_bajo' ? 'text-tertiary-container' : ''}`}>{p.stockActual} <span className="text-xs text-secondary font-normal">un</span></div>
                                        <div className="text-[10px] text-secondary">Min: {p.stockMinimo}</div>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide ${ESTADO_CLASE[p.estado]}`}>{ESTADO_LABEL[p.estado]}</span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button onClick={() => setProductoDetalle(p)} className="p-1.5 text-secondary hover:text-primary hover:bg-surface-container rounded transition-colors" title="Ver Detalles">
                                                <span className="material-symbols-outlined text-[20px]">visibility</span>
                                            </button>
                                            <button onClick={() => setProductoEditar(p)} className="p-1.5 text-secondary hover:text-primary hover:bg-surface-container rounded transition-colors" title="Editar">
                                                <span className="material-symbols-outlined text-[20px]">edit</span>
                                            </button>
                                            {p.estado !== 'inactivo' && (
                                                <button onClick={() => setProductoEliminar(p)} className="p-1.5 text-secondary hover:text-error hover:bg-surface-container rounded transition-colors" title="Desactivar">
                                                    <span className="material-symbols-outlined text-[20px]">block</span>
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="bg-surface border-t border-outline-variant p-4 flex flex-col sm:flex-row items-center justify-between gap-4 font-body-sm text-body-sm text-secondary">
                    <span>Mostrando {productos.length} de {total} registros</span>
                    <div className="flex items-center gap-1">
                        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="p-1 border border-outline-variant rounded hover:bg-surface-container disabled:opacity-50">
                            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                        </button>
                        <span className="px-2">Página {page} de {totalPaginas}</span>
                        <button onClick={() => setPage((p) => Math.min(totalPaginas, p + 1))} disabled={page >= totalPaginas} className="p-1 border border-outline-variant rounded hover:bg-surface-container disabled:opacity-50">
                            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                        </button>
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <NuevoArticuloModal onClose={() => setIsModalOpen(false)} onGuardado={() => { setIsModalOpen(false); cargar(); }} />
            )}

            {isFiltrosOpen && <FiltrosAvanzadosModal onClose={() => setIsFiltrosOpen(false)} />}

            {productoDetalle && (
                <DetalleProductoModal producto={productoDetalle} onClose={() => setProductoDetalle(null)} onAjustado={cargar} />
            )}

            {productoEditar && (
                <NuevoArticuloModal
                    producto={{
                        id: productoEditar.id,
                        codigo: productoEditar.codigo,
                        codigoBarras: productoEditar.codigoBarras ?? '',
                        nombre: productoEditar.nombre,
                        descripcion: productoEditar.descripcion ?? '',
                        categoriaId: productoEditar.categoriaId ?? '',
                        proveedorId: productoEditar.proveedorId ?? '',
                        precioCosto: String(productoEditar.precioCosto),
                        precioVenta: String(productoEditar.precioVenta),
                        stockActual: String(productoEditar.stockActual),
                        stockMinimo: String(productoEditar.stockMinimo),
                        ubicacionId: productoEditar.ubicacionId ?? '',
                    }}
                    onClose={() => setProductoEditar(null)}
                    onGuardado={() => { setProductoEditar(null); cargar(); }}
                />
            )}

            {productoEliminar && (
                <EliminarConfirmModal
                    titulo="¿Desactivar producto?"
                    mensaje={`"${productoEliminar.nombre}" dejará de aparecer disponible para venta, pero se conserva su historial.`}
                    labelConfirmar="Sí, desactivar"
                    onClose={() => setProductoEliminar(null)}
                    onConfirmar={desactivar}
                />
            )}
        </div>
    );
};
