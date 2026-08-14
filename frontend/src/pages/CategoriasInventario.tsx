import React, { useState } from 'react';
import { InventarioNav } from '../components/layout/InventarioNav';
import { CategoriaModal } from '../components/modals/CategoriaModal';
import { EliminarConfirmModal } from '../components/modals/EliminarConfirmModal';
import { ConfirmacionModal } from '../components/modals/ConfirmacionModal';

const categoriasData = [
    { id: 1, nombre: 'Electrónica', descripcion: 'Dispositivos electrónicos de consumo, computadoras y accesorios.', productos: 345, estado: 'Activa', fecha: '12/10/2023' },
    { id: 2, nombre: 'Oficina', descripcion: 'Suministros de papelería, mobiliario y material de oficina general.', productos: 892, estado: 'Activa', fecha: '05/08/2023' },
    { id: 3, nombre: 'Software Obsoleto', descripcion: 'Licencias de software que ya no son soportadas.', productos: 12, estado: 'Inactiva', fecha: '22/01/2022' },
    { id: 4, nombre: 'Mobiliario', descripcion: 'Sillas, escritorios, estanterías y muebles de sala de reuniones.', productos: 56, estado: 'Activa', fecha: '15/11/2023' },
];

export const CategoriasInventario = () => {
    const [categorias, setCategorias] = useState(categoriasData);
    const [filtroEstado, setFiltroEstado] = useState('todos');
    const [busqueda, setBusqueda] = useState('');
    const [isCategoriaModalOpen, setIsCategoriaModalOpen] = useState(false);
    const [categoriaEditando, setCategoriaEditando] = useState<typeof categoriasData[0] | null>(null);
    const [isEliminarModalOpen, setIsEliminarModalOpen] = useState(false);
    const [isConfirmacionOpen, setIsConfirmacionOpen] = useState(false);

    const categoriasFiltradas = categorias.filter(c => {
        const matchEstado = filtroEstado === 'todos' || c.estado.toLowerCase() === filtroEstado;
        const matchBusqueda = c.nombre.toLowerCase().includes(busqueda.toLowerCase()) || c.descripcion.toLowerCase().includes(busqueda.toLowerCase());
        return matchEstado && matchBusqueda;
    });

    const handleEditar = (cat: typeof categoriasData[0]) => {
        setCategoriaEditando(cat);
        setIsCategoriaModalOpen(true);
    };

    const handleNueva = () => {
        setCategoriaEditando(null);
        setIsCategoriaModalOpen(true);
    };

    const handleGuardar = () => {
        setIsCategoriaModalOpen(false);
        setIsConfirmacionOpen(true);
    };

    const handleEliminarConfirmar = () => {
        setIsEliminarModalOpen(false);
        setIsConfirmacionOpen(true);
    };

    return (
        <div className="max-w-container-max mx-auto w-full pb-20">
            <div className="border-b border-outline-variant pb-4 mb-4">
                <InventarioNav />
            </div>
            
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-stack-lg">
                <div>
                    <h1 className="text-display-lg font-display-lg text-on-surface mb-2">Categorías</h1>
                    <p className="text-body-md font-body-md text-on-surface-variant">Administra las categorías utilizadas para organizar los productos del inventario.</p>
                </div>
                <button
                    onClick={handleNueva}
                    className="bg-primary text-on-primary hover:bg-primary/90 px-6 py-2.5 rounded flex items-center gap-2 transition-colors font-body-sm text-body-sm shadow-sm"
                >
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    Nueva categoría
                </button>
            </div>
            
            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter mb-stack-lg">
                <div className="bg-surface-container-lowest border border-surface-variant rounded-lg p-5 shadow-sm">
                    <h3 className="text-label-caps font-label-caps text-on-surface-variant uppercase mb-2">Total de categorías</h3>
                    <p className="text-display-lg font-display-lg text-on-surface">{categorias.length}</p>
                </div>
                <div className="bg-surface-container-lowest border border-surface-variant rounded-lg p-5 shadow-sm">
                    <h3 className="text-label-caps font-label-caps text-on-surface-variant uppercase mb-2">Categorías activas</h3>
                    <div className="flex items-end gap-3">
                        <p className="text-display-lg font-display-lg text-on-surface">{categorias.filter(c => c.estado === 'Activa').length}</p>
                        <span className="mb-1 bg-[#dcfce7] text-[#166534] px-2 py-0.5 rounded-full text-label-caps font-label-caps border border-[#bbf7d0]">90%</span>
                    </div>
                </div>
                <div className="bg-surface-container-lowest border border-surface-variant rounded-lg p-5 shadow-sm">
                    <h3 className="text-label-caps font-label-caps text-on-surface-variant uppercase mb-2">Categorías inactivas</h3>
                    <p className="text-display-lg font-display-lg text-on-surface">{categorias.filter(c => c.estado === 'Inactiva').length}</p>
                </div>
                <div className="bg-surface-container-lowest border border-surface-variant rounded-lg p-5 shadow-sm">
                    <h3 className="text-label-caps font-label-caps text-on-surface-variant uppercase mb-2">Productos categorizados</h3>
                    <p className="text-display-lg font-display-lg text-on-surface">1,204</p>
                </div>
            </div>
            
            {/* Filters */}
            <div className="bg-surface-container-lowest border border-surface-variant rounded-t-lg p-4 flex flex-col sm:flex-row gap-4 justify-between items-center shadow-sm border-b-0">
                <div className="relative w-full sm:w-96">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
                    <input
                        value={busqueda}
                        onChange={e => setBusqueda(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-outline-variant rounded bg-surface focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-all text-body-sm font-body-sm text-on-surface"
                        placeholder="Buscar categoría..."
                        type="text"
                    />
                </div>
                <div className="w-full sm:w-auto flex items-center gap-3">
                    <label className="text-body-sm font-body-sm text-on-surface-variant">Estado:</label>
                    <select
                        value={filtroEstado}
                        onChange={e => setFiltroEstado(e.target.value)}
                        className="border border-outline-variant rounded bg-surface px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none text-body-sm font-body-sm text-on-surface cursor-pointer"
                    >
                        <option value="todos">Todos los estados</option>
                        <option value="activa">Activa</option>
                        <option value="inactiva">Inactiva</option>
                    </select>
                </div>
            </div>
            
            {/* Data Table */}
            <div className="bg-surface-container-lowest border border-surface-variant rounded-b-lg overflow-x-auto shadow-sm custom-scrollbar">
                <div className="overflow-x-auto w-full pb-2">
<table className="w-full text-left border-collapse">
                    <thead className="bg-surface-container-low border-b border-surface-variant sticky top-0 z-10">
                        <tr>
                            <th
                                className="p-4 text-label-caps font-label-caps text-on-surface-variant uppercase tracking-wider">
                                Categoría</th>
                            <th
                                className="p-4 text-label-caps font-label-caps text-on-surface-variant uppercase tracking-wider">
                                Descripción</th>
                            <th
                                className="p-4 text-label-caps font-label-caps text-on-surface-variant uppercase tracking-wider text-right">
                                Productos</th>
                            <th
                                className="p-4 text-label-caps font-label-caps text-on-surface-variant uppercase tracking-wider text-center">
                                Estado</th>
                            <th
                                className="p-4 text-label-caps font-label-caps text-on-surface-variant uppercase tracking-wider">
                                Fecha de creación</th>
                            <th
                                className="p-4 text-label-caps font-label-caps text-on-surface-variant uppercase tracking-wider text-right">
                                Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-variant">
                        <tr className="hover:bg-surface transition-colors group">
                            <td className="p-4 text-body-sm font-body-sm text-on-surface font-medium">Electrónica</td>
                            <td className="p-4 text-body-sm font-body-sm text-on-surface-variant truncate max-w-xs">
                                Dispositivos electrónicos de consumo, computadoras y accesorios.</td>
                            <td className="p-4 text-data-mono font-data-mono text-on-surface text-right">345</td>
                            <td className="p-4 text-center">
                                <span
                                    className="bg-[#dcfce7] text-[#166534] px-2.5 py-1 rounded-full text-label-caps font-label-caps border border-[#bbf7d0]">Activa</span>
                            </td>
                            <td className="p-4 text-data-mono font-data-mono text-on-surface-variant">12/10/2023</td>
                            <td className="p-4 text-right">
                                <div
                                    className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        className="text-on-surface-variant hover:text-primary p-1 rounded hover:bg-surface-variant transition-colors"
                                        title="Editar">
                                        <span className="material-symbols-outlined text-[18px]" data-icon="edit">edit</span>
                                    </button>
                                    <button
                                        className="text-on-surface-variant hover:text-outline p-1 rounded hover:bg-surface-variant transition-colors"
                                        title="Desactivar">
                                        <span className="material-symbols-outlined text-[18px]"
                                            data-icon="block">block</span>
                                    </button>
                                    <button
                                        className="text-on-surface-variant hover:text-error p-1 rounded hover:bg-error-container transition-colors"
                                        title="Eliminar">
                                        <span className="material-symbols-outlined text-[18px]"
                                            data-icon="delete">delete</span>
                                    </button>
                                </div>
                            </td>
                        </tr>
                        <tr className="hover:bg-surface transition-colors group">
                            <td className="p-4 text-body-sm font-body-sm text-on-surface font-medium">Oficina</td>
                            <td className="p-4 text-body-sm font-body-sm text-on-surface-variant truncate max-w-xs">
                                Suministros de papelería, mobiliario y material de oficina general.</td>
                            <td className="p-4 text-data-mono font-data-mono text-on-surface text-right">892</td>
                            <td className="p-4 text-center">
                                <span
                                    className="bg-[#dcfce7] text-[#166534] px-2.5 py-1 rounded-full text-label-caps font-label-caps border border-[#bbf7d0]">Activa</span>
                            </td>
                            <td className="p-4 text-data-mono font-data-mono text-on-surface-variant">05/08/2023</td>
                            <td className="p-4 text-right">
                                <div
                                    className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        className="text-on-surface-variant hover:text-primary p-1 rounded hover:bg-surface-variant transition-colors"
                                        title="Editar">
                                        <span className="material-symbols-outlined text-[18px]" data-icon="edit">edit</span>
                                    </button>
                                    <button
                                        className="text-on-surface-variant hover:text-outline p-1 rounded hover:bg-surface-variant transition-colors"
                                        title="Desactivar">
                                        <span className="material-symbols-outlined text-[18px]"
                                            data-icon="block">block</span>
                                    </button>
                                    <button
                                        className="text-on-surface-variant hover:text-error p-1 rounded hover:bg-error-container transition-colors"
                                        title="Eliminar">
                                        <span className="material-symbols-outlined text-[18px]"
                                            data-icon="delete">delete</span>
                                    </button>
                                </div>
                            </td>
                        </tr>
                        <tr className="hover:bg-surface transition-colors group">
                            <td className="p-4 text-body-sm font-body-sm text-on-surface font-medium text-outline">Software
                                Obsoleto</td>
                            <td
                                className="p-4 text-body-sm font-body-sm text-on-surface-variant truncate max-w-xs text-outline">
                                Licencias de software que ya no son soportadas.</td>
                            <td className="p-4 text-data-mono font-data-mono text-on-surface text-right text-outline">12
                            </td>
                            <td className="p-4 text-center">
                                <span
                                    className="bg-surface-variant text-on-surface-variant px-2.5 py-1 rounded-full text-label-caps font-label-caps border border-outline-variant">Inactiva</span>
                            </td>
                            <td className="p-4 text-data-mono font-data-mono text-on-surface-variant">22/01/2022</td>
                            <td className="p-4 text-right">
                                <div
                                    className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        className="text-on-surface-variant hover:text-primary p-1 rounded hover:bg-surface-variant transition-colors"
                                        title="Editar">
                                        <span className="material-symbols-outlined text-[18px]" data-icon="edit">edit</span>
                                    </button>
                                    <button
                                        className="text-on-surface-variant hover:text-success p-1 rounded hover:bg-surface-variant transition-colors"
                                        title="Activar">
                                        <span className="material-symbols-outlined text-[18px]"
                                            data-icon="check_circle">check_circle</span>
                                    </button>
                                    <button
                                        className="text-on-surface-variant hover:text-error p-1 rounded hover:bg-error-container transition-colors"
                                        title="Eliminar">
                                        <span className="material-symbols-outlined text-[18px]"
                                            data-icon="delete">delete</span>
                                    </button>
                                </div>
                            </td>
                        </tr>
                        <tr className="hover:bg-surface transition-colors group">
                            <td className="p-4 text-body-sm font-body-sm text-on-surface font-medium">Mobiliario</td>
                            <td className="p-4 text-body-sm font-body-sm text-on-surface-variant truncate max-w-xs">Sillas,
                                escritorios, estanterías y muebles de sala de reuniones.</td>
                            <td className="p-4 text-data-mono font-data-mono text-on-surface text-right">56</td>
                            <td className="p-4 text-center">
                                <span
                                    className="bg-[#dcfce7] text-[#166534] px-2.5 py-1 rounded-full text-label-caps font-label-caps border border-[#bbf7d0]">Activa</span>
                            </td>
                            <td className="p-4 text-data-mono font-data-mono text-on-surface-variant">15/11/2023</td>
                            <td className="p-4 text-right">
                                <div
                                    className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        className="text-on-surface-variant hover:text-primary p-1 rounded hover:bg-surface-variant transition-colors"
                                        title="Editar">
                                        <span className="material-symbols-outlined text-[18px]" data-icon="edit">edit</span>
                                    </button>
                                    <button
                                        className="text-on-surface-variant hover:text-outline p-1 rounded hover:bg-surface-variant transition-colors"
                                        title="Desactivar">
                                        <span className="material-symbols-outlined text-[18px]"
                                            data-icon="block">block</span>
                                    </button>
                                    <button
                                        className="text-on-surface-variant hover:text-error p-1 rounded hover:bg-error-container transition-colors"
                                        title="Eliminar">
                                        <span className="material-symbols-outlined text-[18px]"
                                            data-icon="delete">delete</span>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
</div>
            </div>
            
            {/* Pagination */}
            <div className="mt-4 flex items-center justify-between text-body-sm font-body-sm text-on-surface-variant">
                <p>Mostrando 1 a {categoriasFiltradas.length} de {categorias.length} resultados</p>
                <div className="flex gap-1">
                    <button className="p-2 border border-outline-variant rounded bg-surface-container-lowest text-on-surface-variant disabled:opacity-50 hover:bg-surface-variant transition-colors">
                        <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                    </button>
                    <button className="px-3 py-1 border border-primary bg-primary text-on-primary rounded">1</button>
                    <button className="p-2 border border-outline-variant rounded bg-surface-container-lowest text-on-surface-variant hover:bg-surface-variant transition-colors">
                        <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                    </button>
                </div>
            </div>

            {/* Modals */}
            {isCategoriaModalOpen && <CategoriaModal categoriaEditando={categoriaEditando} onClose={handleGuardar} />}
            {isEliminarModalOpen && <EliminarConfirmModal onClose={() => setIsEliminarModalOpen(false)} onConfirmar={handleEliminarConfirmar} />}
            {isConfirmacionOpen && <ConfirmacionModal onClose={() => setIsConfirmacionOpen(false)} />}
        </div>
    );
};
