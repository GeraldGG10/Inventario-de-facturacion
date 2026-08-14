import React from 'react';

interface Props {
    onClose: () => void;
}

export const AuditoriaModal = ({ onClose }: Props) => {
    const logs = [
        { fecha: '2023-10-27 14:32', usuario: 'AJ', nombre: 'Admin Juan', tipo: 'Actualización', tipoColor: 'bg-surface-container-high text-on-surface', detalle: 'Modificó tasa de ITBIS a 18%' },
        { fecha: '2023-10-27 11:15', usuario: 'MP', nombre: 'Cajero María', tipo: 'Eliminación', tipoColor: 'bg-error-container text-on-error-container', detalle: 'Anuló factura FAC-2093' },
        { fecha: '2023-10-26 16:50', usuario: 'JR', nombre: 'Juan Rodríguez', tipo: 'Creación', tipoColor: 'bg-[#dcfce7] text-[#166534]', detalle: 'Creó producto SKU: LPT-X16-002' },
        { fecha: '2023-10-26 10:05', usuario: 'AJ', nombre: 'Admin Juan', tipo: 'Actualización', tipoColor: 'bg-surface-container-high text-on-surface', detalle: 'Actualizó datos del proveedor TechWorld' },
        { fecha: '2023-10-25 14:20', usuario: 'MP', nombre: 'Cajero María', tipo: 'Creación', tipoColor: 'bg-[#dcfce7] text-[#166534]', detalle: 'Registró movimiento MOV-000121' },
        { fecha: '2023-10-25 09:15', usuario: 'AJ', nombre: 'Admin Juan', tipo: 'Configuración', tipoColor: 'bg-primary/10 text-primary', detalle: 'Cambió configuración de alertas de stock' },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/50 backdrop-blur-sm p-4">
            <div className="bg-surface-container-lowest w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col border border-outline-variant max-h-[90vh]">
                {/* Header */}
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

                {/* Filters */}
                <div className="px-6 py-3 border-b border-outline-variant/30 flex gap-3">
                    <select className="px-3 py-2 bg-surface border border-outline-variant rounded-lg text-body-sm text-on-surface focus:ring-2 focus:ring-primary outline-none">
                        <option>Todas las acciones</option>
                        <option>Creación</option>
                        <option>Actualización</option>
                        <option>Eliminación</option>
                        <option>Configuración</option>
                    </select>
                    <select className="px-3 py-2 bg-surface border border-outline-variant rounded-lg text-body-sm text-on-surface focus:ring-2 focus:ring-primary outline-none">
                        <option>Todos los usuarios</option>
                        <option>Admin Juan</option>
                        <option>Cajero María</option>
                    </select>
                    <select className="px-3 py-2 bg-surface border border-outline-variant rounded-lg text-body-sm text-on-surface focus:ring-2 focus:ring-primary outline-none">
                        <option>Este Mes</option>
                        <option>Esta Semana</option>
                        <option>Hoy</option>
                    </select>
                </div>

                {/* Body */}
                <div className="overflow-y-auto custom-scrollbar flex-1">
                    <div className="overflow-x-auto w-full pb-2">
                        <table className="w-full text-sm">
                            <thead className="sticky top-0 bg-surface-container-lowest">
                                <tr className="border-b border-outline-variant">
                                    <th className="text-left p-4 font-label-caps text-label-caps text-secondary uppercase tracking-wider">Fecha</th>
                                    <th className="text-left p-4 font-label-caps text-label-caps text-secondary uppercase tracking-wider">Usuario</th>
                                    <th className="text-left p-4 font-label-caps text-label-caps text-secondary uppercase tracking-wider">Tipo</th>
                                    <th className="text-left p-4 font-label-caps text-label-caps text-secondary uppercase tracking-wider">Detalle</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant/50">
                                {logs.map((log, i) => (
                                    <tr key={i} className="hover:bg-surface-container-low transition-colors">
                                        <td className="p-4 text-on-surface-variant whitespace-nowrap font-data-mono text-data-mono">{log.fecha}</td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <span className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">{log.usuario}</span>
                                                <span className="text-on-surface whitespace-nowrap">{log.nombre}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${log.tipoColor}`}>{log.tipo}</span>
                                        </td>
                                        <td className="p-4 text-on-surface">{log.detalle}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="p-4 border-t border-outline-variant/50 flex justify-between items-center bg-surface-container/30 rounded-b-2xl">
                    <span className="text-body-sm text-on-surface-variant">Mostrando {logs.length} de 1,204 registros</span>
                    <button onClick={onClose} className="px-5 py-2 rounded-lg text-body-sm font-medium text-secondary hover:bg-surface-variant transition-colors">Cerrar</button>
                </div>
            </div>
        </div>
    );
};
