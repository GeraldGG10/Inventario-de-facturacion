import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';

export interface ProductoFacturable {
    id: string;
    codigo: string;
    nombre: string;
    stockActual: number;
    precioVenta: number;
}

interface Props {
    onClose: () => void;
    onAgregar: (producto: ProductoFacturable) => void;
}

const formatoMoneda = new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' });

export const AgregarProductoFacturaModal = ({ onClose, onAgregar }: Props) => {
    const [busqueda, setBusqueda] = useState('');
    const [productos, setProductos] = useState<ProductoFacturable[]>([]);

    useEffect(() => {
        api.get('/productos', { busqueda, estado: 'disponible', pageSize: 20 }).then((data) => setProductos(data.productos)).catch(() => setProductos([]));
    }, [busqueda]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/50 backdrop-blur-sm p-4">
            <div className="bg-surface-container-lowest w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col border border-outline-variant max-h-[90vh]">
                <div className="flex justify-between items-center p-6 border-b border-outline-variant/50">
                    <div>
                        <h2 className="text-[22px] font-bold text-on-surface">Agregar Producto</h2>
                        <p className="text-body-sm text-on-surface-variant mt-0.5">Busca y selecciona un producto para agregar a la factura</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full text-on-surface-variant hover:bg-surface-variant/50 transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="p-6 flex flex-col gap-4 flex-1 overflow-hidden">
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary">search</span>
                        <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} type="text" placeholder="Buscar por código o nombre..." className="w-full pl-10 pr-4 py-3 bg-surface border border-outline-variant rounded-lg text-body-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none" autoFocus />
                    </div>

                    <div className="overflow-y-auto custom-scrollbar border border-outline-variant rounded-lg mt-2 flex-1">
                        <table className="w-full text-sm">
                            <thead className="sticky top-0 bg-surface-container">
                                <tr className="border-b border-outline-variant">
                                    <th className="text-left p-3 font-label-caps text-label-caps text-secondary uppercase tracking-wider">Producto</th>
                                    <th className="text-left p-3 font-label-caps text-label-caps text-secondary uppercase tracking-wider">Código</th>
                                    <th className="text-center p-3 font-label-caps text-label-caps text-secondary uppercase tracking-wider">Stock</th>
                                    <th className="text-right p-3 font-label-caps text-label-caps text-secondary uppercase tracking-wider">Precio</th>
                                    <th className="p-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant/50">
                                {productos.length === 0 && (
                                    <tr><td colSpan={5} className="p-6 text-center text-on-surface-variant">Sin productos disponibles.</td></tr>
                                )}
                                {productos.map((p) => (
                                    <tr key={p.id} className="hover:bg-surface-container-low transition-colors">
                                        <td className="p-3 font-medium text-on-surface whitespace-nowrap">{p.nombre}</td>
                                        <td className="p-3 font-data-mono text-data-mono text-secondary">{p.codigo}</td>
                                        <td className="p-3 text-center">
                                            <span className={p.stockActual > 20 ? 'text-[#006841]' : 'text-tertiary'}>{p.stockActual}</span>
                                        </td>
                                        <td className="p-3 text-right font-medium text-on-surface whitespace-nowrap">{formatoMoneda.format(p.precioVenta)}</td>
                                        <td className="p-3 text-right">
                                            <button onClick={() => onAgregar(p)} className="text-xs px-3 py-1 rounded-lg bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container transition-colors whitespace-nowrap">
                                                Agregar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};
