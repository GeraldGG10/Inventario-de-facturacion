import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';

interface Registro {
    id: string;
    timestamp: string;
    accion: string;
    entidad: string;
    usuario: { id: string; nombre: string } | null;
}

interface Props {
    onClose: () => void;
}

export const AuditoriaModal = ({ onClose }: Props) => {
    const [registros, setRegistros] = useState<Registro[]>([]);
    const [total, setTotal] = useState(0);
    const [entidad, setEntidad] = useState('');

    useEffect(() => {
        api.get('/auditoria', { entidad: entidad || undefined, pageSize: 50 }).then((data) => { setRegistros(data.registros); setTotal(data.total); }).catch(() => {});
    }, [entidad]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/50 backdrop-blur-sm p-4">
            <div className="bg-surface-container-lowest w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col border border-outline-variant max-h-[90vh]">
                <div className="flex justify-between items-center p-6 border-b border-outline-variant/50">
                    <div>
                        <h2 className="text-[22px] font-bold text-on-surface flex items-center gap-2">
                            <span className="material-symbols-outlined text-secondary">history</span>
                            Auditoría Completa
                        </h2>
                        <p className="text-body-sm text-on-surface-variant mt-0.5">Registro de todas las acciones realizadas en el sistema</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full text-on-surface-variant hover:bg-surface-variant/50 transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="px-6 py-3 border-b border-outline-variant/30 flex gap-3">
                    <select value={entidad} onChange={(e) => setEntidad(e.target.value)} className="px-3 py-2 bg-surface border border-outline-variant rounded-lg text-body-sm text-on-surface focus:ring-2 focus:ring-primary outline-none">
                        <option value="">Todas las entidades</option>
                        <option value="Usuario">Usuarios</option>
                        <option value="Producto">Productos</option>
                        <option value="Factura">Facturas</option>
                        <option value="Categoria">Categorías</option>
                        <option value="Proveedor">Proveedores</option>
                        <option value="Cliente">Clientes</option>
                    </select>
                </div>

                <div className="overflow-y-auto custom-scrollbar flex-1">
                    <table className="w-full text-sm">
                        <thead className="sticky top-0 bg-surface-container-lowest">
                            <tr className="border-b border-outline-variant">
                                <th className="text-left p-4 font-label-caps text-label-caps text-secondary uppercase tracking-wider">Fecha</th>
                                <th className="text-left p-4 font-label-caps text-label-caps text-secondary uppercase tracking-wider">Usuario</th>
                                <th className="text-left p-4 font-label-caps text-label-caps text-secondary uppercase tracking-wider">Acción</th>
                                <th className="text-left p-4 font-label-caps text-label-caps text-secondary uppercase tracking-wider">Entidad</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/50">
                            {registros.length === 0 && (
                                <tr><td colSpan={4} className="p-6 text-center text-on-surface-variant">Sin registros.</td></tr>
                            )}
                            {registros.map((log) => (
                                <tr key={log.id} className="hover:bg-surface-container-low transition-colors">
                                    <td className="p-4 text-on-surface-variant whitespace-nowrap font-data-mono text-data-mono">{new Date(log.timestamp).toLocaleString('es-DO')}</td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <span className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">{(log.usuario?.nombre ?? '?').slice(0, 2).toUpperCase()}</span>
                                            <span className="text-on-surface whitespace-nowrap">{log.usuario?.nombre ?? 'Sistema'}</span>
                                        </div>
                                    </td>
                                    <td className="p-4"><span className="px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap bg-surface-container-high text-on-surface">{log.accion}</span></td>
                                    <td className="p-4 text-on-surface">{log.entidad}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 border-t border-outline-variant/50 flex justify-between items-center bg-surface-container/30 rounded-b-2xl">
                    <span className="text-body-sm text-on-surface-variant">Mostrando {registros.length} de {total} registros</span>
                    <button onClick={onClose} className="px-5 py-2 rounded-lg text-body-sm font-medium text-secondary hover:bg-surface-variant transition-colors">Cerrar</button>
                </div>
            </div>
        </div>
    );
};
