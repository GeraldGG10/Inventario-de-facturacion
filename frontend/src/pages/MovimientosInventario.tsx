import React, { useEffect, useState } from 'react';
import { InventarioNav } from '../components/layout/InventarioNav';
import { NuevoMovimientoModal } from '../components/modals/NuevoMovimientoModal';
import { api, ApiError } from '../lib/api';

interface Movimiento {
    id: string;
    tipo: string;
    cantidad: number;
    stockAnterior: number;
    stockNuevo: number;
    motivo: string | null;
    fecha: string;
    producto: { nombre: string };
    usuario: { nombre: string } | null;
}

const TIPO_BADGE: Record<string, string> = {
    entrada: 'bg-green-100 text-green-800 border border-green-200',
    salida: 'bg-red-100 text-red-800 border border-red-200',
    ajuste: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    devolucion: 'bg-blue-100 text-blue-800 border border-blue-200',
};
const TIPO_LABEL: Record<string, string> = { entrada: 'Entrada', salida: 'Salida', ajuste: 'Ajuste', devolucion: 'Devolución' };
const PAGE_SIZE = 20;

export const MovimientosInventario = () => {
    const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
    const [resumen, setResumen] = useState<Record<string, number>>({});
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [tipoFiltro, setTipoFiltro] = useState('');
    const [fechaFiltro, setFechaFiltro] = useState('');
    const [busqueda, setBusqueda] = useState('');
    const [isNuevoMovimientoOpen, setIsNuevoMovimientoOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    function cargar() {
        api
            .get('/movimientos', { tipo: tipoFiltro || undefined, periodo: fechaFiltro || undefined, busqueda: busqueda || undefined, page, pageSize: PAGE_SIZE })
            .then((data) => { setMovimientos(data.movimientos); setTotal(data.total); setResumen(data.resumen); })
            .catch((err) => setError(err instanceof ApiError ? err.message : 'No se pudieron cargar los movimientos'));
    }

    useEffect(() => { cargar(); }, [page, tipoFiltro, fechaFiltro]);

    function buscar(e: React.FormEvent) { e.preventDefault(); setPage(1); cargar(); }

    const totalPaginas = Math.max(1, Math.ceil(total / PAGE_SIZE));

    return (
        <div className="max-w-container-max mx-auto space-y-stack-lg pb-20">
            <div className="border-b border-outline-variant pb-4 mb-4">
                <InventarioNav />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-display-lg font-display-lg text-on-surface">Movimientos de inventario</h1>
                    <p className="text-body-md font-body-md text-on-surface-variant mt-1">Consulta y controla las entradas, salidas y ajustes realizados en el inventario.</p>
                </div>
                <button onClick={() => setIsNuevoMovimientoOpen(true)} className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg font-body-md text-body-md hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm w-full sm:w-auto">
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    Nuevo movimiento
                </button>
            </div>

            {error && <div className="p-3 rounded-lg bg-error/10 text-error text-body-sm">{error}</div>}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm">
                    <span className="text-label-caps font-label-caps text-on-surface-variant uppercase tracking-wider">Entradas</span>
                    <div className="mt-2 text-display-lg font-display-lg text-on-surface">{resumen.entrada ?? 0}</div>
                </div>
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm">
                    <span className="text-label-caps font-label-caps text-on-surface-variant uppercase tracking-wider">Salidas</span>
                    <div className="mt-2 text-display-lg font-display-lg text-on-surface">{resumen.salida ?? 0}</div>
                </div>
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm">
                    <span className="text-label-caps font-label-caps text-on-surface-variant uppercase tracking-wider">Ajustes</span>
                    <div className="mt-2 text-display-lg font-display-lg text-on-surface">{resumen.ajuste ?? 0}</div>
                </div>
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm">
                    <span className="text-label-caps font-label-caps text-on-surface-variant uppercase tracking-wider">Movimientos totales</span>
                    <div className="mt-2 text-display-lg font-display-lg text-on-surface">{total}</div>
                </div>
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden flex flex-col">
                <form onSubmit={buscar} className="p-4 border-b border-outline-variant bg-surface-container-lowest flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full sm:max-w-xs">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
                        <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-surface border border-outline-variant rounded-lg text-body-sm font-body-sm text-on-surface focus:ring-2 focus:ring-primary focus:border-primary transition-all" placeholder="Buscar producto..." type="text" />
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 custom-scrollbar">
                        <select value={tipoFiltro} onChange={(e) => setTipoFiltro(e.target.value)} className="px-3 py-2 bg-surface border border-outline-variant rounded-lg text-body-sm font-body-sm text-on-surface">
                            <option value="">Tipo</option>
                            <option value="entrada">Entrada</option>
                            <option value="salida">Salida</option>
                            <option value="ajuste">Ajuste</option>
                            <option value="devolucion">Devolución</option>
                        </select>
                        <select value={fechaFiltro} onChange={(e) => setFechaFiltro(e.target.value)} className="px-3 py-2 bg-surface border border-outline-variant rounded-lg text-body-sm font-body-sm text-on-surface">
                            <option value="">Fecha</option>
                            <option value="hoy">Hoy</option>
                            <option value="semana">Esta Semana</option>
                            <option value="mes">Este Mes</option>
                            <option value="anio">Este Año</option>
                        </select>
                        <button type="submit" className="px-3 py-2 border border-outline-variant rounded-lg text-body-sm text-secondary hover:bg-surface-container">Buscar</button>
                    </div>
                </form>

                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-outline-variant bg-surface-container text-label-caps font-label-caps text-on-surface-variant uppercase tracking-wider">
                                <th className="p-4 font-semibold whitespace-nowrap">Fecha</th>
                                <th className="p-4 font-semibold">Producto</th>
                                <th className="p-4 font-semibold whitespace-nowrap">Tipo</th>
                                <th className="p-4 font-semibold text-right whitespace-nowrap">Cantidad</th>
                                <th className="p-4 font-semibold text-right whitespace-nowrap hidden lg:table-cell">Stock ant.</th>
                                <th className="p-4 font-semibold text-right whitespace-nowrap">Stock nuevo</th>
                                <th className="p-4 font-semibold hidden md:table-cell">Motivo</th>
                                <th className="p-4 font-semibold hidden xl:table-cell">Usuario</th>
                            </tr>
                        </thead>
                        <tbody className="text-body-sm font-body-sm text-on-surface divide-y divide-outline-variant">
                            {movimientos.length === 0 && (
                                <tr><td colSpan={8} className="p-8 text-center text-on-surface-variant">Sin movimientos.</td></tr>
                            )}
                            {movimientos.map((m) => (
                                <tr key={m.id} className="hover:bg-surface-container-low transition-colors">
                                    <td className="p-4 text-on-surface-variant whitespace-nowrap">{new Date(m.fecha).toLocaleString('es-DO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                                    <td className="p-4 font-medium text-on-surface">{m.producto.nombre}</td>
                                    <td className="p-4"><span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${TIPO_BADGE[m.tipo]}`}>{TIPO_LABEL[m.tipo]}</span></td>
                                    <td className={`p-4 text-right text-data-mono font-data-mono font-medium ${m.cantidad >= 0 ? 'text-green-700' : 'text-red-700'}`}>{m.cantidad >= 0 ? '+' : ''}{m.cantidad}</td>
                                    <td className="p-4 text-right text-data-mono font-data-mono text-on-surface-variant hidden lg:table-cell">{m.stockAnterior}</td>
                                    <td className="p-4 text-right text-data-mono font-data-mono font-medium">{m.stockNuevo}</td>
                                    <td className="p-4 text-on-surface-variant hidden md:table-cell truncate max-w-[150px]" title={m.motivo ?? ''}>{m.motivo ?? '—'}</td>
                                    <td className="p-4 text-on-surface-variant hidden xl:table-cell">{m.usuario?.nombre ?? '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 border-t border-outline-variant bg-surface-container flex items-center justify-between text-body-sm text-on-surface-variant">
                    <span>Mostrando {movimientos.length} de {total} resultados</span>
                    <div className="flex gap-1">
                        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant hover:bg-surface-variant transition-colors disabled:opacity-50">
                            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                        </button>
                        <span className="px-2 flex items-center">{page} / {totalPaginas}</span>
                        <button onClick={() => setPage((p) => Math.min(totalPaginas, p + 1))} disabled={page >= totalPaginas} className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant hover:bg-surface-variant transition-colors disabled:opacity-50">
                            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                        </button>
                    </div>
                </div>
            </div>

            {isNuevoMovimientoOpen && (
                <NuevoMovimientoModal onClose={() => setIsNuevoMovimientoOpen(false)} onRegistrado={() => { setIsNuevoMovimientoOpen(false); cargar(); }} />
            )}
        </div>
    );
};
