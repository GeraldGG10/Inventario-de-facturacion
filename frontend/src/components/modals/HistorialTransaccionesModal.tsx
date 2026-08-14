import React from 'react';

interface Props {
    onClose: () => void;
}

const allTransactions = [
    { id: '#FAC-2023-0891', cliente: 'Acme Corp.', fecha: 'Hoy, 14:30', total: '$1,250.00', estado: 'Pagado' },
    { id: '#FAC-2023-0890', cliente: 'Tech Solutions SAC', fecha: 'Hoy, 11:15', total: '$340.50', estado: 'Pendiente' },
    { id: '#FAC-2023-0889', cliente: 'Global Imports', fecha: 'Ayer, 16:45', total: '$5,100.00', estado: 'Pagado' },
    { id: '#FAC-2023-0888', cliente: 'Distribuidora Sur', fecha: 'Ayer, 09:30', total: '$820.00', estado: 'Pagado' },
    { id: '#FAC-2023-0887', cliente: 'Servicios Norte', fecha: 'Hace 2 días, 15:10', total: '$2,450.00', estado: 'Anulada' },
    { id: '#FAC-2023-0886', cliente: 'Acme Corp.', fecha: 'Hace 2 días, 08:00', total: '$680.00', estado: 'Pagado' },
    { id: '#FAC-2023-0885', cliente: 'Digital Express', fecha: 'Hace 3 días, 13:20', total: '$1,900.00', estado: 'Pendiente' },
    { id: '#FAC-2023-0884', cliente: 'Tech Solutions SAC', fecha: 'Hace 3 días, 10:05', total: '$3,200.00', estado: 'Pagado' },
];

const estadoBadge = (estado: string) => {
    if (estado === 'Pagado') return 'bg-[#008a00]/10 text-[#008a00]';
    if (estado === 'Pendiente') return 'bg-yellow-500/10 text-yellow-700';
    return 'bg-error/10 text-error';
};

export const HistorialTransaccionesModal = ({ onClose }: Props) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/50 backdrop-blur-sm p-4">
            <div className="bg-surface-container-lowest w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col border border-outline-variant max-h-[90vh]">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-outline-variant/50">
                    <div>
                        <h2 className="text-[22px] font-bold text-on-surface">Historial de Transacciones</h2>
                        <p className="text-body-sm text-on-surface-variant mt-0.5">Todas las facturas y transacciones registradas</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full text-on-surface-variant hover:bg-surface-variant/50 transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Search bar */}
                <div className="px-6 py-4 border-b border-outline-variant/30">
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
                        <input type="text" placeholder="Buscar por factura, cliente..." className="w-full pl-9 pr-4 py-2.5 bg-surface border border-outline-variant rounded-lg text-body-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none" />
                    </div>
                </div>

                {/* Body */}
                <div className="overflow-y-auto custom-scrollbar flex-1">
                    <div className="overflow-x-auto w-full pb-2">
                        <table className="w-full text-sm">
                            <thead className="sticky top-0 bg-surface-container-lowest">
                                <tr className="border-b border-outline-variant">
                                    <th className="text-left p-4 font-label-caps text-label-caps text-secondary uppercase tracking-wider">Factura</th>
                                    <th className="text-left p-4 font-label-caps text-label-caps text-secondary uppercase tracking-wider">Cliente</th>
                                    <th className="text-left p-4 font-label-caps text-label-caps text-secondary uppercase tracking-wider">Fecha</th>
                                    <th className="text-right p-4 font-label-caps text-label-caps text-secondary uppercase tracking-wider">Total</th>
                                    <th className="text-center p-4 font-label-caps text-label-caps text-secondary uppercase tracking-wider">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant/50">
                                {allTransactions.map((tx, i) => (
                                    <tr key={i} className="hover:bg-surface-container-low transition-colors cursor-pointer">
                                        <td className="p-4 font-data-mono text-data-mono text-primary whitespace-nowrap">{tx.id}</td>
                                        <td className="p-4 text-on-surface whitespace-nowrap">{tx.cliente}</td>
                                        <td className="p-4 text-on-surface-variant whitespace-nowrap">{tx.fecha}</td>
                                        <td className="p-4 text-right font-medium text-on-surface whitespace-nowrap">{tx.total}</td>
                                        <td className="p-4 text-center">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${estadoBadge(tx.estado)}`}>{tx.estado}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-outline-variant/50 flex justify-between items-center bg-surface-container/30 rounded-b-2xl">
                    <span className="text-body-sm text-on-surface-variant">Mostrando {allTransactions.length} de 2,891 transacciones</span>
                    <button onClick={onClose} className="px-5 py-2 rounded-lg text-body-sm font-medium text-secondary hover:bg-surface-variant transition-colors">Cerrar</button>
                </div>
            </div>
        </div>
    );
};
