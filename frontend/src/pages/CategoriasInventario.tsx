import React, { useEffect, useState } from 'react';
import { InventarioNav } from '../components/layout/InventarioNav';
import { CategoriaModal } from '../components/modals/CategoriaModal';
import { api, ApiError } from '../lib/api';
import { useToast } from '../context/ToastContext';

interface Categoria {
    id: string;
    nombre: string;
    descripcion: string | null;
    activa: boolean;
    productos: number;
    createdAt: string;
}

export const CategoriasInventario = () => {
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [filtroEstado, setFiltroEstado] = useState('todos');
    const [busqueda, setBusqueda] = useState('');
    const [isCategoriaModalOpen, setIsCategoriaModalOpen] = useState(false);
    const [categoriaEditando, setCategoriaEditando] = useState<Categoria | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { mostrarToast } = useToast();

    function cargar() {
        api.get<Categoria[]>('/categorias').then(setCategorias).catch((err) => setError(err instanceof ApiError ? err.message : 'No se pudieron cargar las categorías'));
    }

    useEffect(() => { cargar(); }, []);

    const categoriasFiltradas = categorias.filter((c) => {
        const matchEstado = filtroEstado === 'todos' || (filtroEstado === 'activa') === c.activa;
        const matchBusqueda = c.nombre.toLowerCase().includes(busqueda.toLowerCase()) || (c.descripcion ?? '').toLowerCase().includes(busqueda.toLowerCase());
        return matchEstado && matchBusqueda;
    });

    const handleEditar = (cat: Categoria) => { setCategoriaEditando(cat); setIsCategoriaModalOpen(true); };
    const handleNueva = () => { setCategoriaEditando(null); setIsCategoriaModalOpen(true); };
    const handleGuardado = () => {
        setIsCategoriaModalOpen(false);
        mostrarToast(categoriaEditando ? 'Categoría actualizada correctamente' : 'Categoría creada correctamente', 'success');
        cargar();
    };

    async function toggleActiva(cat: Categoria) {
        try {
            await api.patch(`/categorias/${cat.id}`, { activa: !cat.activa });
            mostrarToast(cat.activa ? 'Categoría desactivada' : 'Categoría activada', 'success');
            cargar();
        } catch (err) {
            mostrarToast(err instanceof ApiError ? err.message : 'No se pudo actualizar la categoría', 'error');
            setError(err instanceof ApiError ? err.message : 'No se pudo actualizar la categoría');
        }
    }

    return (
        <div className="max-w-container-max mx-auto w-full pb-20">
            <div className="border-b border-outline-variant pb-4 mb-4">
                <InventarioNav />
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-stack-lg">
                <div>
                    <h1 className="text-display-lg font-display-lg text-on-surface mb-2">Categorías</h1>
                    <p className="text-body-md font-body-md text-on-surface-variant">Administra las categorías utilizadas para organizar los productos del inventario.</p>
                </div>
                <button onClick={handleNueva} className="bg-primary text-on-primary hover:bg-primary/90 px-6 py-2.5 rounded flex items-center gap-2 transition-colors font-body-sm text-body-sm shadow-sm">
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    Nueva categoría
                </button>
            </div>

            {error && <div className="mb-4 p-3 rounded-lg bg-error/10 text-error text-body-sm">{error}</div>}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter mb-stack-lg">
                <div className="bg-surface-container-lowest border border-surface-variant rounded-lg p-5 shadow-sm">
                    <h3 className="text-label-caps font-label-caps text-on-surface-variant uppercase mb-2">Total de categorías</h3>
                    <p className="text-display-lg font-display-lg text-on-surface">{categorias.length}</p>
                </div>
                <div className="bg-surface-container-lowest border border-surface-variant rounded-lg p-5 shadow-sm">
                    <h3 className="text-label-caps font-label-caps text-on-surface-variant uppercase mb-2">Categorías activas</h3>
                    <p className="text-display-lg font-display-lg text-on-surface">{categorias.filter((c) => c.activa).length}</p>
                </div>
                <div className="bg-surface-container-lowest border border-surface-variant rounded-lg p-5 shadow-sm">
                    <h3 className="text-label-caps font-label-caps text-on-surface-variant uppercase mb-2">Categorías inactivas</h3>
                    <p className="text-display-lg font-display-lg text-on-surface">{categorias.filter((c) => !c.activa).length}</p>
                </div>
                <div className="bg-surface-container-lowest border border-surface-variant rounded-lg p-5 shadow-sm">
                    <h3 className="text-label-caps font-label-caps text-on-surface-variant uppercase mb-2">Productos categorizados</h3>
                    <p className="text-display-lg font-display-lg text-on-surface">{categorias.reduce((acc, c) => acc + c.productos, 0)}</p>
                </div>
            </div>

            <div className="bg-surface-container-lowest border border-surface-variant rounded-t-lg p-4 flex flex-col sm:flex-row gap-4 justify-between items-center shadow-sm border-b-0">
                <div className="relative w-full sm:w-96">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
                    <input
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-outline-variant rounded bg-surface focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-all text-body-sm font-body-sm text-on-surface"
                        placeholder="Buscar categoría..."
                        type="text"
                    />
                </div>
                <div className="w-full sm:w-auto flex items-center gap-3">
                    <label className="text-body-sm font-body-sm text-on-surface-variant">Estado:</label>
                    <div className="relative">
                        <select
                            value={filtroEstado}
                            onChange={(e) => setFiltroEstado(e.target.value)}
                            className="appearance-none border border-outline-variant rounded bg-surface pl-4 pr-9 py-2 focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none text-body-sm font-body-sm text-on-surface cursor-pointer"
                        >
                            <option value="todos">Todos los estados</option>
                            <option value="activa">Activa</option>
                            <option value="inactiva">Inactiva</option>
                        </select>
                        <span className="material-symbols-outlined pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-outline text-[20px]">expand_more</span>
                    </div>
                </div>
            </div>

            <div className="bg-surface-container-lowest border border-surface-variant rounded-b-lg overflow-x-auto shadow-sm custom-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-surface-container-low border-b border-surface-variant sticky top-0 z-10">
                        <tr>
                            <th className="p-4 text-label-caps font-label-caps text-on-surface-variant uppercase tracking-wider">Categoría</th>
                            <th className="p-4 text-label-caps font-label-caps text-on-surface-variant uppercase tracking-wider">Descripción</th>
                            <th className="p-4 text-label-caps font-label-caps text-on-surface-variant uppercase tracking-wider text-right">Productos</th>
                            <th className="p-4 text-label-caps font-label-caps text-on-surface-variant uppercase tracking-wider text-center">Estado</th>
                            <th className="p-4 text-label-caps font-label-caps text-on-surface-variant uppercase tracking-wider text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-variant">
                        {categoriasFiltradas.length === 0 && (
                            <tr><td colSpan={5} className="p-6 text-center text-on-surface-variant">Sin categorías.</td></tr>
                        )}
                        {categoriasFiltradas.map((c) => (
                            <tr key={c.id} className="hover:bg-surface transition-colors group">
                                <td className={`p-4 text-body-sm font-body-sm font-medium ${c.activa ? 'text-on-surface' : 'text-outline'}`}>{c.nombre}</td>
                                <td className={`p-4 text-body-sm font-body-sm truncate max-w-xs ${c.activa ? 'text-on-surface-variant' : 'text-outline'}`}>{c.descripcion}</td>
                                <td className="p-4 text-data-mono font-data-mono text-on-surface text-right">{c.productos}</td>
                                <td className="p-4 text-center">
                                    <span className={c.activa
                                        ? 'bg-[#dcfce7] text-[#166534] px-2.5 py-1 rounded-full text-label-caps font-label-caps border border-[#bbf7d0]'
                                        : 'bg-surface-variant text-on-surface-variant px-2.5 py-1 rounded-full text-label-caps font-label-caps border border-outline-variant'}>
                                        {c.activa ? 'Activa' : 'Inactiva'}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button onClick={() => handleEditar(c)} className="text-on-surface-variant hover:text-primary p-1 rounded hover:bg-surface-variant transition-colors" title="Editar">
                                            <span className="material-symbols-outlined text-[18px]">edit</span>
                                        </button>
                                        <button onClick={() => toggleActiva(c)} className="text-on-surface-variant hover:text-outline p-1 rounded hover:bg-surface-variant transition-colors" title={c.activa ? 'Desactivar' : 'Activar'}>
                                            <span className="material-symbols-outlined text-[18px]">{c.activa ? 'block' : 'check_circle'}</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-4 flex items-center justify-between text-body-sm font-body-sm text-on-surface-variant">
                <p>Mostrando {categoriasFiltradas.length} de {categorias.length} resultados</p>
            </div>

            {isCategoriaModalOpen && (
                <CategoriaModal categoriaEditando={categoriaEditando} onClose={() => setIsCategoriaModalOpen(false)} onGuardado={handleGuardado} />
            )}
        </div>
    );
};
