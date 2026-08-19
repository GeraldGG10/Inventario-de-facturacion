import React, { useEffect, useState } from 'react';
import { InventarioNav } from '../components/layout/InventarioNav';
import { ConfigurarAlertasModal } from '../components/modals/ConfigurarAlertasModal';
import { DetalleProductoModal, ProductoDetalle } from '../components/modals/DetalleProductoModal';
import { FiltrosAvanzadosModal } from '../components/modals/FiltrosAvanzadosModal';
import { api, ApiError } from '../lib/api';

type FiltroTipo = 'todos' | 'agotado' | 'stock_bajo';

interface Alerta {
    id: string;
    productoId: string;
    nombre: string;
    codigo: string;
    categoria: string | null;
    stockActual: number;
    stockMinimo: number;
    estadoAlerta: 'agotado' | 'stock_bajo';
}

const estadoBadge = (estado: string) => (estado === 'agotado' ? 'bg-error/10 text-error' : 'bg-tertiary-container/10 text-tertiary-container');
const estadoLabel = (estado: string) => (estado === 'agotado' ? 'Agotado' : 'Stock Bajo');
const stockColor = (estado: string) => (estado === 'agotado' ? 'text-error font-bold' : 'text-tertiary-container font-semibold');

export const AlertasInventario = () => {
    const [alertas, setAlertas] = useState<Alerta[]>([]);
    const [filtroActivo, setFiltroActivo] = useState<FiltroTipo>('todos');
    const [busqueda, setBusqueda] = useState('');
    const [isConfigAlertasOpen, setIsConfigAlertasOpen] = useState(false);
    const [productoDetalle, setProductoDetalle] = useState<ProductoDetalle | null>(null);
    const [isFiltroCategoriaOpen, setIsFiltroCategoriaOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    function cargar() {
        api.get<Alerta[]>('/alertas').then(setAlertas).catch((err) => setError(err instanceof ApiError ? err.message : 'No se pudieron cargar las alertas'));
    }

    useEffect(() => { cargar(); }, []);

    const alertasFiltradas = alertas.filter((a) => {
        const matchFiltro = filtroActivo === 'todos' || a.estadoAlerta === filtroActivo;
        const matchBusqueda = a.nombre.toLowerCase().includes(busqueda.toLowerCase()) || a.codigo.toLowerCase().includes(busqueda.toLowerCase());
        return matchFiltro && matchBusqueda;
    });

    async function verDetalle(productoId: string) {
        try {
            const producto = await api.get<ProductoDetalle>(`/productos/${productoId}`);
            setProductoDetalle(producto);
        } catch (err) {
            setError(err instanceof ApiError ? err.message : 'No se pudo cargar el producto');
        }
    }

    const filtros: { label: string; val: FiltroTipo }[] = [
        { label: 'Todos', val: 'todos' },
        { label: 'Agotados', val: 'agotado' },
        { label: 'Stock bajo', val: 'stock_bajo' },
    ];

    return (
        <div className="max-w-container-max mx-auto space-y-stack-lg pb-12">
            <div className="border-b border-outline-variant pb-4 mb-4">
                <InventarioNav />
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-display-lg font-display-lg text-on-surface">Alertas de inventario</h1>
                    <p className="text-body-md font-body-md text-on-surface-variant mt-1">Supervisa productos con stock bajo o agotado que requieren reposición.</p>
                </div>
                <button onClick={() => setIsConfigAlertasOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg text-body-sm font-body-sm font-medium hover:bg-primary/90 transition-colors shadow-sm">
                    <span className="material-symbols-outlined text-sm">settings</span>
                    Configurar alertas
                </button>
            </div>

            {error && <div className="p-3 rounded-lg bg-error/10 text-error text-body-sm">{error}</div>}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { label: 'Agotados', value: alertas.filter((a) => a.estadoAlerta === 'agotado').length, val: 'agotado' as FiltroTipo, border: 'border-error/30', iconColor: 'text-error', icon: 'warning' },
                    { label: 'Stock bajo', value: alertas.filter((a) => a.estadoAlerta === 'stock_bajo').length, val: 'stock_bajo' as FiltroTipo, border: 'border-tertiary-container/30', iconColor: 'text-tertiary-container', icon: 'trending_down' },
                    { label: 'Total pendientes', value: alertas.length, val: 'todos' as FiltroTipo, border: 'border-outline-variant', iconColor: 'text-primary', icon: 'inventory_2' },
                ].map((card) => (
                    <button key={card.label} onClick={() => setFiltroActivo(card.val)} className={`bg-surface-container-lowest border ${card.border} rounded-xl p-4 shadow-sm text-left hover:shadow-md transition-shadow`}>
                        <div className="flex justify-between items-start mb-2">
                            <span className={`text-label-caps font-label-caps uppercase ${card.iconColor}`}>{card.label}</span>
                            <span className={`material-symbols-outlined ${card.iconColor}`}>{card.icon}</span>
                        </div>
                        <div className="text-display-lg font-display-lg text-on-surface">{card.value}</div>
                    </button>
                ))}
            </div>

            <div className="flex flex-col md:flex-row justify-between gap-4 items-center bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-sm">
                <div className="flex overflow-x-auto w-full md:w-auto custom-scrollbar gap-2 pb-2 md:pb-0">
                    {filtros.map((f) => (
                        <button key={f.val} onClick={() => setFiltroActivo(f.val)} className={`px-4 py-1.5 rounded-full text-body-sm font-body-sm font-medium whitespace-nowrap transition-colors ${filtroActivo === f.val ? 'bg-secondary-container text-on-secondary-container' : 'border border-outline-variant text-on-surface-variant hover:bg-surface-variant'}`}>
                            {f.label}
                        </button>
                    ))}
                </div>
                <div className="flex w-full md:w-auto gap-2">
                    <div className="relative flex-1 md:w-64">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
                        <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-surface border border-outline-variant rounded-lg text-body-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none" placeholder="Buscar producto..." type="text" />
                    </div>
                    <button onClick={() => setIsFiltroCategoriaOpen(true)} className="flex items-center gap-2 px-3 py-2 border border-outline-variant rounded-lg text-on-surface-variant hover:bg-surface-variant transition-colors">
                        <span className="material-symbols-outlined text-sm">filter_list</span>
                    </button>
                </div>
            </div>

            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden flex flex-col">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface-container-low border-b border-outline-variant">
                                <th className="p-4 text-label-caps font-label-caps text-on-surface-variant uppercase tracking-wider font-semibold">Producto</th>
                                <th className="p-4 text-label-caps font-label-caps text-on-surface-variant uppercase tracking-wider font-semibold">Categoría</th>
                                <th className="p-4 text-label-caps font-label-caps text-on-surface-variant uppercase tracking-wider font-semibold text-right">Stock actual</th>
                                <th className="p-4 text-label-caps font-label-caps text-on-surface-variant uppercase tracking-wider font-semibold text-right">Stock mínimo</th>
                                <th className="p-4 text-label-caps font-label-caps text-on-surface-variant uppercase tracking-wider font-semibold text-center">Estado</th>
                                <th className="p-4 text-label-caps font-label-caps text-on-surface-variant uppercase tracking-wider font-semibold text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant">
                            {alertasFiltradas.length === 0 && (
                                <tr><td colSpan={6} className="p-8 text-center text-on-surface-variant text-body-sm">No hay productos con este estado.</td></tr>
                            )}
                            {alertasFiltradas.map((a) => (
                                <tr key={a.id} className="hover:bg-surface-container-lowest/50 transition-colors group">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded bg-surface-variant flex items-center justify-center shrink-0">
                                                <span className="material-symbols-outlined text-on-surface-variant">inventory_2</span>
                                            </div>
                                            <div>
                                                <p className="text-body-sm font-body-sm font-medium text-on-surface">{a.nombre}</p>
                                                <p className="text-label-caps font-label-caps text-on-surface-variant">SKU: {a.codigo}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-body-sm font-body-sm text-on-surface-variant">{a.categoria ?? 'Sin categoría'}</td>
                                    <td className={`p-4 text-data-mono font-data-mono text-right ${stockColor(a.estadoAlerta)}`}>{a.stockActual}</td>
                                    <td className="p-4 text-data-mono font-data-mono text-on-surface-variant text-right">{a.stockMinimo}</td>
                                    <td className="p-4 text-center">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase ${estadoBadge(a.estadoAlerta)}`}>{estadoLabel(a.estadoAlerta)}</span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => verDetalle(a.productoId)} className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded transition-colors" title="Ver detalle / registrar entrada">
                                                <span className="material-symbols-outlined text-sm">visibility</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 border-t border-outline-variant bg-surface-container-low flex items-center justify-between">
                    <span className="text-body-sm font-body-sm text-on-surface-variant">Mostrando {alertasFiltradas.length} de {alertas.length} resultados</span>
                </div>
            </div>

            {isConfigAlertasOpen && <ConfigurarAlertasModal onClose={() => setIsConfigAlertasOpen(false)} />}
            {productoDetalle && (
                <DetalleProductoModal producto={productoDetalle} onClose={() => setProductoDetalle(null)} onAjustado={cargar} />
            )}
            {isFiltroCategoriaOpen && <FiltrosAvanzadosModal onClose={() => setIsFiltroCategoriaOpen(false)} />}
        </div>
    );
};
