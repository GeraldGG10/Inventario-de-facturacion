import React, { useState } from 'react';

interface Props {
    categoriaEditando?: { id: number; nombre: string; descripcion: string; estado?: string } | null;
    onClose: () => void;
}

export const CategoriaModal = ({ categoriaEditando, onClose }: Props) => {
    const esEdicion = !!categoriaEditando;
    const [estadoActivo, setEstadoActivo] = useState(categoriaEditando?.estado !== 'Inactiva');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/50 backdrop-blur-sm p-4">
<div className="bg-surface-container-lowest w-full max-w-md rounded-2xl shadow-2xl flex flex-col border border-outline-variant max-h-[90vh]">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-outline-variant/50">
                    <div>
                        <h2 className="text-[22px] font-bold text-on-surface">{esEdicion ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
                        <p className="text-body-sm text-on-surface-variant mt-0.5">{esEdicion ? `Editando: ${categoriaEditando?.nombre}` : 'Agrega una nueva categoría al inventario'}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full text-on-surface-variant hover:bg-surface-variant/50 transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 flex flex-col gap-5">
                    <div>
                        <label className="block text-body-sm font-semibold text-on-surface mb-2">Nombre de la categoría <span className="text-error">*</span></label>
                        <input
                            type="text"
                            defaultValue={categoriaEditando?.nombre || ''}
                            placeholder="Ej: Electrónica, Mobiliario..."
                            className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-lg text-body-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-body-sm font-semibold text-on-surface mb-2">Descripción</label>
                        <textarea
                            rows={3}
                            defaultValue={categoriaEditando?.descripcion || ''}
                            placeholder="Descripción breve de la categoría..."
                            className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-lg text-body-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none resize-none"
                        />
                    </div>
                    <div>
                        <label className="block text-body-sm font-semibold text-on-surface mb-2">Estado</label>
                        <div className="flex items-center gap-3 bg-surface-container-low p-1 rounded-lg w-fit">
                            <button onClick={() => setEstadoActivo(true)} className={`px-4 py-1.5 rounded-md font-body-sm font-medium transition-all ${estadoActivo ? 'bg-surface-container-lowest shadow-sm text-on-surface' : 'text-on-surface-variant hover:text-on-surface'}`}>Activa</button>
                            <button onClick={() => setEstadoActivo(false)} className={`px-4 py-1.5 rounded-md font-body-sm font-medium transition-all ${!estadoActivo ? 'bg-surface-container-lowest shadow-sm text-on-surface' : 'text-on-surface-variant hover:text-on-surface'}`}>Inactiva</button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-outline-variant/50 flex justify-end gap-3 bg-surface-container/30 rounded-b-2xl">
                    <button onClick={onClose} className="px-5 py-2 rounded-lg text-body-sm font-medium text-secondary hover:bg-surface-variant transition-colors">Cancelar</button>
                    <button onClick={onClose} className="px-6 py-2 rounded-lg text-body-sm font-medium bg-primary text-on-primary shadow-sm hover:bg-primary-container hover:text-on-primary-container transition-colors">
                        {esEdicion ? 'Guardar Cambios' : 'Crear Categoría'}
                    </button>
                </div>
            </div>
        </div>
    );
};
