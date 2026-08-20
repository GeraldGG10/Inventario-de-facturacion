import React, { useState } from 'react';
import { api, ApiError } from '../../lib/api';
import { useToast } from '../../context/ToastContext';

export interface ProductoDetalle {
    id: string;
    codigo: string;
    nombre: string;
    categoria?: { nombre: string } | null;
    precioVenta: number;
    proveedor?: { nombre: string } | null;
    stockActual: number;
    stockMinimo: number;
    estado: string;
}

interface Props {
    onClose: () => void;
    producto: ProductoDetalle;
    onAjustado: () => void;
}

const formatoMoneda = new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' });

const ESTADO_LABEL: Record<string, string> = { disponible: 'Disponible', stock_bajo: 'Stock bajo', agotado: 'Agotado', inactivo: 'Inactivo' };
const ESTADO_CLASE: Record<string, string> = {
    disponible: 'bg-[#008a00]/10 text-[#008a00]',
    stock_bajo: 'bg-tertiary-container/20 text-tertiary-container',
    agotado: 'bg-error/10 text-error',
    inactivo: 'bg-surface-variant text-on-surface-variant',
};

export const DetalleProductoModal = ({ onClose, producto, onAjustado }: Props) => {
    const [mostrarEntrada, setMostrarEntrada] = useState(false);
    const [cantidad, setCantidad] = useState('1');
    const [error, setError] = useState<string | null>(null);
    const [enviando, setEnviando] = useState(false);
    const { mostrarToast } = useToast();

    async function registrarEntrada() {
        setError(null);
        const cant = Number(cantidad);
        if (!cant || cant <= 0) {
            setError('Ingresa una cantidad válida');
            return;
        }
        setEnviando(true);
        try {
            await api.post(`/productos/${producto.id}/ajustar`, { cantidad: cant, motivo: 'Entrada rápida desde detalle de producto' });
            mostrarToast(`Entrada registrada: +${cant} ${producto.nombre}`, 'success');
            onAjustado();
            onClose();
        } catch (err) {
            mostrarToast(err instanceof ApiError ? err.message : 'No se pudo registrar la entrada', 'error');
            setError(err instanceof ApiError ? err.message : 'No se pudo registrar la entrada');
        } finally {
            setEnviando(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/50 backdrop-blur-sm p-4">
            <div className="bg-surface-container-lowest w-full max-w-lg rounded-2xl shadow-2xl flex flex-col border border-outline-variant max-h-[90vh]">
                <div className="flex justify-between items-center p-6 border-b border-outline-variant/50">
                    <h2 className="text-[22px] font-bold text-on-surface">Detalle del Producto</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-on-surface-variant hover:bg-surface-variant/50 transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar flex flex-col gap-5">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl bg-surface-variant flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-on-surface-variant text-[36px]">inventory_2</span>
                        </div>
                        <div>
                            <h3 className="text-[18px] font-bold text-on-surface">{producto.nombre}</h3>
                            <p className="text-xs text-on-surface-variant">SKU: {producto.codigo} • {producto.categoria?.nombre ?? 'Sin categoría'}</p>
                            <span className={`inline-flex mt-1 items-center px-2 py-0.5 rounded-full text-[11px] font-bold uppercase ${ESTADO_CLASE[producto.estado]}`}>{ESTADO_LABEL[producto.estado]}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-surface-container p-4 rounded-xl text-center">
                            <p className={`text-2xl font-bold ${producto.stockActual === 0 ? 'text-error' : 'text-on-surface'}`}>{producto.stockActual}</p>
                            <p className="text-xs text-on-surface-variant mt-1">Stock Actual</p>
                        </div>
                        <div className="bg-surface-container p-4 rounded-xl text-center">
                            <p className="text-2xl font-bold text-on-surface">{producto.stockMinimo}</p>
                            <p className="text-xs text-on-surface-variant mt-1">Stock Mínimo</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        {[
                            { label: 'Precio de venta', value: formatoMoneda.format(producto.precioVenta) },
                            { label: 'Proveedor principal', value: producto.proveedor?.nombre ?? 'Sin proveedor' },
                        ].map((item) => (
                            <div key={item.label} className="flex justify-between items-center border-b border-outline-variant/30 pb-2">
                                <span className="text-body-sm text-on-surface-variant">{item.label}</span>
                                <span className="text-body-sm font-medium text-on-surface font-data-mono">{item.value}</span>
                            </div>
                        ))}
                    </div>

                    {mostrarEntrada && (
                        <div className="p-4 bg-surface-container/50 rounded-xl flex flex-col gap-2">
                            <label className="text-body-sm font-medium text-on-surface">Cantidad a ingresar</label>
                            <input type="number" min={1} value={cantidad} onChange={(e) => setCantidad(e.target.value)} className="px-3 py-2 border border-outline-variant rounded-lg bg-surface" />
                            {error && <p className="text-body-sm text-error">{error}</p>}
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-outline-variant/50 flex justify-end gap-3 bg-surface-container/30 rounded-b-2xl">
                    <button onClick={onClose} className="px-5 py-2 rounded-lg text-body-sm font-medium text-secondary hover:bg-surface-variant transition-colors">Cerrar</button>
                    {mostrarEntrada ? (
                        <button onClick={registrarEntrada} disabled={enviando} className="px-6 py-2 rounded-lg text-body-sm font-medium bg-primary text-on-primary shadow-sm hover:bg-primary-container hover:text-on-primary-container transition-colors disabled:opacity-60">
                            {enviando ? 'Registrando…' : 'Confirmar entrada'}
                        </button>
                    ) : (
                        <button onClick={() => setMostrarEntrada(true)} className="px-6 py-2 rounded-lg text-body-sm font-medium bg-primary text-on-primary shadow-sm hover:bg-primary-container hover:text-on-primary-container transition-colors flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">add_circle</span>
                            Registrar Entrada
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
