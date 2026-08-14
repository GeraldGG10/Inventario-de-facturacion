import React, { useState } from 'react';
import { InventarioNav } from '../components/layout/InventarioNav';
import { NuevoMovimientoModal } from '../components/modals/NuevoMovimientoModal';
import { ConfirmacionModal } from '../components/modals/ConfirmacionModal';

export const MovimientosInventario = () => {
    const [isNuevoMovimientoOpen, setIsNuevoMovimientoOpen] = useState(false);
    const [isConfirmacionOpen, setIsConfirmacionOpen] = useState(false);
    const [tipoFiltro, setTipoFiltro] = useState('');
    const [fechaFiltro, setFechaFiltro] = useState('');

    const handleNuevoMovimiento = () => {
        setIsNuevoMovimientoOpen(false);
        setIsConfirmacionOpen(true);
    };

    return (
        <div className="max-w-container-max mx-auto space-y-stack-lg pb-20">
            <div className="border-b border-outline-variant pb-4 mb-4">
                <InventarioNav />
            </div>
            
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-display-lg font-display-lg text-on-surface">Movimientos de inventario</h1>
                    <p className="text-body-md font-body-md text-on-surface-variant mt-1">
                        Consulta y controla las entradas, salidas y ajustes realizados en el inventario.
                    </p>
                </div>
                <button
                    onClick={() => setIsNuevoMovimientoOpen(true)}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg font-body-md text-body-md hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm focus:ring-2 focus:ring-primary focus:ring-offset-2 w-full sm:w-auto"
                >
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    Nuevo movimiento
                </button>
            </div>
            
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm flex flex-col justify-between">
                    <span className="text-label-caps font-label-caps text-on-surface-variant uppercase tracking-wider">Entradas</span>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-display-lg font-display-lg text-on-surface">1,245</span>
                        <span className="flex items-center text-sm font-medium text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full">
                            <span className="material-symbols-outlined text-[16px] mr-0.5">arrow_upward</span> 12%
                        </span>
                    </div>
                </div>
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm flex flex-col justify-between">
                    <span className="text-label-caps font-label-caps text-on-surface-variant uppercase tracking-wider">Salidas</span>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-display-lg font-display-lg text-on-surface">892</span>
                        <span className="flex items-center text-sm font-medium text-red-700 bg-red-100 px-1.5 py-0.5 rounded-full">
                            <span className="material-symbols-outlined text-[16px] mr-0.5">arrow_downward</span> 4%
                        </span>
                    </div>
                </div>
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm flex flex-col justify-between">
                    <span className="text-label-caps font-label-caps text-on-surface-variant uppercase tracking-wider">Ajustes</span>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-display-lg font-display-lg text-on-surface">34</span>
                        <span className="flex items-center text-sm font-medium text-on-surface-variant bg-surface-variant px-1.5 py-0.5 rounded-full">
                            <span className="material-symbols-outlined text-[16px] mr-0.5">horizontal_rule</span> 0%
                        </span>
                    </div>
                </div>
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm flex flex-col justify-between">
                    <span className="text-label-caps font-label-caps text-on-surface-variant uppercase tracking-wider">Movimientos del período</span>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-display-lg font-display-lg text-on-surface">2,171</span>
                    </div>
                </div>
            </div>
            
            {/* Main Content Area: Data Table */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden flex flex-col">
                {/* Toolbar / Filters */}
                <div className="p-4 border-b border-outline-variant bg-surface-container-lowest flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full sm:max-w-xs">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
                        <input className="w-full pl-10 pr-4 py-2 bg-surface border border-outline-variant rounded-lg text-body-sm font-body-sm text-on-surface focus:ring-2 focus:ring-primary focus:border-primary transition-all" placeholder="Buscar producto o ID..." type="text" />
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 custom-scrollbar">
                        <select
                            value={tipoFiltro}
                            onChange={e => setTipoFiltro(e.target.value)}
                            className="px-3 py-2 bg-surface border border-outline-variant rounded-lg text-body-sm font-body-sm text-on-surface focus:ring-2 focus:ring-primary focus:border-primary"
                        >
                            <option value="">Tipo</option>
                            <option value="entrada">Entrada</option>
                            <option value="salida">Salida</option>
                            <option value="ajuste">Ajuste</option>
                        </select>
                        <select
                            value={fechaFiltro}
                            onChange={e => setFechaFiltro(e.target.value)}
                            className="px-3 py-2 bg-surface border border-outline-variant rounded-lg text-body-sm font-body-sm text-on-surface focus:ring-2 focus:ring-primary focus:border-primary"
                        >
                            <option value="">Fecha</option>
                            <option value="hoy">Hoy</option>
                            <option value="semana">Esta Semana</option>
                            <option value="mes">Este Mes</option>
                            <option value="anio">Este Año</option>
                        </select>
                        <select className="px-3 py-2 bg-surface border border-outline-variant rounded-lg text-body-sm font-body-sm text-on-surface focus:ring-2 focus:ring-primary focus:border-primary hidden sm:block">
                            <option value="">Usuario</option>
                            <option>Ana López</option>
                            <option>Carlos Ruiz</option>
                        </select>
                        <select className="px-3 py-2 bg-surface border border-outline-variant rounded-lg text-body-sm font-body-sm text-on-surface focus:ring-2 focus:ring-primary focus:border-primary hidden sm:block">
                            <option value="">Motivo</option>
                            <option>Recepción</option>
                            <option>Venta</option>
                            <option>Devolución</option>
                            <option>Ajuste</option>
                        </select>
                    </div>
                </div>
                
                {/* Table */}
                <div className="overflow-x-auto custom-scrollbar">
                    <div className="overflow-x-auto w-full pb-2">
<table className="w-full text-left border-collapse">
                            <thead>
                                <tr
                                    className="border-b border-outline-variant bg-surface-container text-label-caps font-label-caps text-on-surface-variant uppercase tracking-wider">
                                    <th className="p-4 font-semibold whitespace-nowrap">ID</th>
                                    <th className="p-4 font-semibold whitespace-nowrap">Fecha</th>
                                    <th className="p-4 font-semibold">Producto</th>
                                    <th className="p-4 font-semibold whitespace-nowrap">Tipo</th>
                                    <th className="p-4 font-semibold text-right whitespace-nowrap">Cantidad</th>
                                    <th className="p-4 font-semibold text-right whitespace-nowrap hidden lg:table-cell">
                                        Stock ant.</th>
                                    <th className="p-4 font-semibold text-right whitespace-nowrap">Stock nuevo</th>
                                    <th className="p-4 font-semibold hidden md:table-cell">Motivo</th>
                                    <th className="p-4 font-semibold hidden xl:table-cell">Usuario</th>
                                </tr>
                            </thead>
                            <tbody className="text-body-sm font-body-sm text-on-surface divide-y divide-outline-variant">
                                
                                <tr className="hover:bg-surface-container-low transition-colors group">
                                    <td className="p-4 text-data-mono font-data-mono text-on-surface-variant">MOV-000125
                                    </td>
                                    <td className="p-4 text-on-surface-variant whitespace-nowrap">24 Oct, 10:45</td>
                                    <td className="p-4 font-medium text-on-surface">Laptop Dell Latitude 5000</td>
                                    <td className="p-4">
                                        <span
                                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                            Entrada
                                        </span>
                                    </td>
                                    <td className="p-4 text-right text-data-mono font-data-mono font-medium text-green-700">
                                        +50</td>
                                    <td
                                        className="p-4 text-right text-data-mono font-data-mono text-on-surface-variant hidden lg:table-cell">
                                        120</td>
                                    <td className="p-4 text-right text-data-mono font-data-mono font-medium">170</td>
                                    <td className="p-4 text-on-surface-variant hidden md:table-cell truncate max-w-[150px]"
                                        title="Recepción de orden de compra OC-992">Recepción de orden de compra OC-992
                                    </td>
                                    <td className="p-4 text-on-surface-variant hidden xl:table-cell">Ana López</td>
                                </tr>
                                
                                <tr className="hover:bg-surface-container-low transition-colors group">
                                    <td className="p-4 text-data-mono font-data-mono text-on-surface-variant">MOV-000124
                                    </td>
                                    <td className="p-4 text-on-surface-variant whitespace-nowrap">24 Oct, 09:15</td>
                                    <td className="p-4 font-medium text-on-surface">Monitor LG 27" 4K</td>
                                    <td className="p-4">
                                        <span
                                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                                            Salida
                                        </span>
                                    </td>
                                    <td className="p-4 text-right text-data-mono font-data-mono font-medium text-red-700">-5
                                    </td>
                                    <td
                                        className="p-4 text-right text-data-mono font-data-mono text-on-surface-variant hidden lg:table-cell">
                                        45</td>
                                    <td className="p-4 text-right text-data-mono font-data-mono font-medium">40</td>
                                    <td className="p-4 text-on-surface-variant hidden md:table-cell truncate max-w-[150px]"
                                        title="Asignación equipo IT">Asignación equipo IT</td>
                                    <td className="p-4 text-on-surface-variant hidden xl:table-cell">Carlos Ruiz</td>
                                </tr>
                                
                                <tr className="hover:bg-surface-container-low transition-colors group">
                                    <td className="p-4 text-data-mono font-data-mono text-on-surface-variant">MOV-000123
                                    </td>
                                    <td className="p-4 text-on-surface-variant whitespace-nowrap">23 Oct, 16:30</td>
                                    <td className="p-4 font-medium text-on-surface">Teclado Mecánico Keychron K2</td>
                                    <td className="p-4">
                                        <span
                                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                                            Ajuste
                                        </span>
                                    </td>
                                    <td
                                        className="p-4 text-right text-data-mono font-data-mono font-medium text-yellow-700">
                                        -1</td>
                                    <td
                                        className="p-4 text-right text-data-mono font-data-mono text-on-surface-variant hidden lg:table-cell">
                                        15</td>
                                    <td className="p-4 text-right text-data-mono font-data-mono font-medium">14</td>
                                    <td className="p-4 text-on-surface-variant hidden md:table-cell truncate max-w-[150px]"
                                        title="Producto dañado en almacén">Producto dañado en almacén</td>
                                    <td className="p-4 text-on-surface-variant hidden xl:table-cell">Admin Sistema</td>
                                </tr>
                                
                                <tr className="hover:bg-surface-container-low transition-colors group">
                                    <td className="p-4 text-data-mono font-data-mono text-on-surface-variant">MOV-000122
                                    </td>
                                    <td className="p-4 text-on-surface-variant whitespace-nowrap">23 Oct, 11:20</td>
                                    <td className="p-4 font-medium text-on-surface">Mouse Inalámbrico Logitech MX Master 3
                                    </td>
                                    <td className="p-4">
                                        <span
                                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                            Entrada
                                        </span>
                                    </td>
                                    <td className="p-4 text-right text-data-mono font-data-mono font-medium text-green-700">
                                        +25</td>
                                    <td
                                        className="p-4 text-right text-data-mono font-data-mono text-on-surface-variant hidden lg:table-cell">
                                        5</td>
                                    <td className="p-4 text-right text-data-mono font-data-mono font-medium">30</td>
                                    <td className="p-4 text-on-surface-variant hidden md:table-cell truncate max-w-[150px]"
                                        title="Devolución proveedor">Devolución proveedor</td>
                                    <td className="p-4 text-on-surface-variant hidden xl:table-cell">Ana López</td>
                                </tr>
                                
                                <tr className="hover:bg-surface-container-low transition-colors group">
                                    <td className="p-4 text-data-mono font-data-mono text-on-surface-variant">MOV-000121
                                    </td>
                                    <td className="p-4 text-on-surface-variant whitespace-nowrap">22 Oct, 14:00</td>
                                    <td className="p-4 font-medium text-on-surface">Hub USB-C Anker</td>
                                    <td className="p-4">
                                        <span
                                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                                            Salida
                                        </span>
                                    </td>
                                    <td className="p-4 text-right text-data-mono font-data-mono font-medium text-red-700">
                                        -10</td>
                                    <td
                                        className="p-4 text-right text-data-mono font-data-mono text-on-surface-variant hidden lg:table-cell">
                                        80</td>
                                    <td className="p-4 text-right text-data-mono font-data-mono font-medium">70</td>
                                    <td className="p-4 text-on-surface-variant hidden md:table-cell truncate max-w-[150px]"
                                        title="Venta mostrador V-8890">Venta mostrador V-8890</td>
                                    <td className="p-4 text-on-surface-variant hidden xl:table-cell">María Gómez</td>
                                </tr>
                            </tbody>
                        </table>
</div>
                </div>
                {/* Pagination */}
                <div className="p-4 border-t border-outline-variant bg-surface-container flex items-center justify-between text-body-sm text-on-surface-variant">
                    <span>Mostrando 1 a 5 de 2,171 resultados</span>
                    <div className="flex gap-1">
                        <button className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant hover:bg-surface-variant transition-colors disabled:opacity-50">
                            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center rounded border border-primary bg-primary text-on-primary font-medium">1</button>
                        <button className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant hover:bg-surface-variant transition-colors font-medium">2</button>
                        <button className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant hover:bg-surface-variant transition-colors font-medium">3</button>
                        <span className="w-8 h-8 flex items-center justify-center">...</span>
                        <button className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant hover:bg-surface-variant transition-colors disabled:opacity-50">
                            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {isNuevoMovimientoOpen && <NuevoMovimientoModal onClose={handleNuevoMovimiento} />}
            {isConfirmacionOpen && <ConfirmacionModal onClose={() => setIsConfirmacionOpen(false)} />}
        </div>
    );
};
