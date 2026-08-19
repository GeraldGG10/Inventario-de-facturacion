import React, { useState } from 'react';
import { api, ApiError } from '../../lib/api';

interface Props {
    categoriaEditando?: { id: string; nombre: string; descripcion: string | null; activa: boolean } | null;
    onClose: () => void;
    onGuardado: () => void;
}

export const CategoriaModal = ({ categoriaEditando, onClose, onGuardado }: Props) => {
    const esEdicion = !!categoriaEditando;
    const [nombre, setNombre] = useState(categoriaEditando?.nombre ?? '');
    const [descripcion, setDescripcion] = useState(categoriaEditando?.descripcion ?? '');
    const [activa, setActiva] = useState(categoriaEditando?.activa ?? true);
    const [error, setError] = useState<string | null>(null);
    const [guardando, setGuardando] = useState(false);

    async function handleGuardar() {
        if (!nombre.trim()) {
            setError('El nombre es obligatorio');
            return;
        }
        setError(null);
        setGuardando(true);
        try {
            if (esEdicion) {
                await api.patch(`/categorias/${categoriaEditando!.id}`, { nombre, descripcion: descripcion || null, activa });
            } else {
                await api.post('/categorias', { nombre, descripcion: descripcion || null });
            }
            onGuardado();
        } catch (err) {
            setError(err instanceof ApiError ? err.message : 'No se pudo guardar la categoría');
        } finally {
            setGuardando(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/50 backdrop-blur-sm p-4">
            <div className="bg-surface-container-lowest w-full max-w-md rounded-2xl shadow-2xl flex flex-col border border-outline-variant max-h-[90vh]">
                <div className="flex justify-between items-center p-6 border-b border-outline-variant/50">
                    <div>
                        <h2 className="text-[22px] font-bold text-on-surface">{esEdicion ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
                        <p className="text-body-sm text-on-surface-variant mt-0.5">{esEdicion ? `Editando: ${categoriaEditando?.nombre}` : 'Agrega una nueva categoría al inventario'}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full text-on-surface-variant hover:bg-surface-variant/50 transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="p-6 flex flex-col gap-5">
                    {error && <div className="p-3 rounded-lg bg-error/10 text-error text-body-sm">{error}</div>}
                    <div>
                        <label className="block text-body-sm font-semibold text-on-surface mb-2">Nombre de la categoría <span className="text-error">*</span></label>
                        <input
                            type="text"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            placeholder="Ej: Electrónica, Mobiliario..."
                            className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-lg text-body-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-body-sm font-semibold text-on-surface mb-2">Descripción</label>
                        <textarea
                            rows={3}
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                            placeholder="Descripción breve de la categoría..."
                            className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-lg text-body-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none resize-none"
                        />
                    </div>
                    {esEdicion && (
                        <div>
                            <label className="block text-body-sm font-semibold text-on-surface mb-2">Estado</label>
                            <div className="flex items-center gap-3 bg-surface-container-low p-1 rounded-lg w-fit">
                                <button onClick={() => setActiva(true)} className={`px-4 py-1.5 rounded-md font-body-sm font-medium transition-all ${activa ? 'bg-surface-container-lowest shadow-sm text-on-surface' : 'text-on-surface-variant hover:text-on-surface'}`}>Activa</button>
                                <button onClick={() => setActiva(false)} className={`px-4 py-1.5 rounded-md font-body-sm font-medium transition-all ${!activa ? 'bg-surface-container-lowest shadow-sm text-on-surface' : 'text-on-surface-variant hover:text-on-surface'}`}>Inactiva</button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-outline-variant/50 flex justify-end gap-3 bg-surface-container/30 rounded-b-2xl">
                    <button onClick={onClose} className="px-5 py-2 rounded-lg text-body-sm font-medium text-secondary hover:bg-surface-variant transition-colors">Cancelar</button>
                    <button onClick={handleGuardar} disabled={guardando} className="px-6 py-2 rounded-lg text-body-sm font-medium bg-primary text-on-primary shadow-sm hover:bg-primary-container hover:text-on-primary-container transition-colors disabled:opacity-60">
                        {guardando ? 'Guardando…' : esEdicion ? 'Guardar Cambios' : 'Crear Categoría'}
                    </button>
                </div>
            </div>
        </div>
    );
};
