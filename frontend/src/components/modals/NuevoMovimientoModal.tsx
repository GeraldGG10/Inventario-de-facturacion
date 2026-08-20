import React, { useState } from 'react';
import { api, ApiError } from '../../lib/api';
import { useToast } from '../../context/ToastContext';

interface Props {
    onClose: () => void;
    onRegistrado: () => void;
}

interface ProductoOpcion { id: string; codigo: string; nombre: string; stockActual: number }

export const NuevoMovimientoModal = ({ onClose, onRegistrado }: Props) => {
    const [tipo, setTipo] = useState<'entrada' | 'salida' | 'ajuste'>('entrada');
    const [busquedaProducto, setBusquedaProducto] = useState('');
    const [opciones, setOpciones] = useState<ProductoOpcion[]>([]);
    const [productoSeleccionado, setProductoSeleccionado] = useState<ProductoOpcion | null>(null);
    const [cantidad, setCantidad] = useState('1');
    const [motivo, setMotivo] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [enviando, setEnviando] = useState(false);
    const { mostrarToast } = useToast();

    async function buscarProductos(texto: string) {
        setBusquedaProducto(texto);
        setProductoSeleccionado(null);
        if (texto.length < 2) { setOpciones([]); return; }
        try {
            const data = await api.get('/productos', { busqueda: texto, pageSize: 8 });
            setOpciones(data.productos);
        } catch {
            setOpciones([]);
        }
    }

    async function handleRegistrar() {
        setError(null);
        if (!productoSeleccionado) { setError('Selecciona un producto'); return; }
        const cant = Number(cantidad);
        if (!cant || cant <= 0) { setError('La cantidad debe ser mayor a 0'); return; }
        if (tipo === 'ajuste' && !motivo) { setError('El motivo es obligatorio para ajustes'); return; }

        setEnviando(true);
        try {
            await api.post('/movimientos', {
                productoId: productoSeleccionado.id,
                tipo,
                cantidad: tipo === 'ajuste' ? cant : Math.abs(cant),
                motivo: motivo || null,
            });
            mostrarToast('Movimiento registrado correctamente', 'success');
            onRegistrado();
        } catch (err) {
            mostrarToast(err instanceof ApiError ? err.message : 'No se pudo registrar el movimiento', 'error');
            setError(err instanceof ApiError ? err.message : 'No se pudo registrar el movimiento');
        } finally {
            setEnviando(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/50 backdrop-blur-sm p-4">
            <div className="bg-surface-container-lowest w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[90vh] border border-outline-variant">
                <div className="flex justify-between items-center p-6 border-b border-outline-variant/50">
                    <div>
                        <h2 className="text-[22px] font-bold text-on-surface">Registrar Movimiento</h2>
                        <p className="text-body-sm text-on-surface-variant mt-0.5">Entrada, salida o ajuste de inventario</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full text-on-surface-variant hover:bg-surface-variant/50 transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar flex flex-col gap-5">
                    {error && <div className="p-3 rounded-lg bg-error/10 text-error text-body-sm">{error}</div>}

                    <div>
                        <label className="block text-body-sm font-semibold text-on-surface mb-2">Tipo de Movimiento</label>
                        <div className="flex gap-2">
                            {[
                                { val: 'entrada', label: 'Entrada', icon: 'add_circle' },
                                { val: 'salida', label: 'Salida', icon: 'remove_circle' },
                                { val: 'ajuste', label: 'Ajuste', icon: 'tune' },
                            ].map((t) => (
                                <button key={t.val} onClick={() => setTipo(t.val as any)} className={`flex-1 flex flex-col items-center gap-1 p-3 border rounded-xl transition-colors ${tipo === t.val ? 'border-primary bg-primary/5' : 'border-outline-variant hover:bg-surface-container'}`}>
                                    <span className="material-symbols-outlined text-[24px]">{t.icon}</span>
                                    <span className="text-body-sm font-medium">{t.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-body-sm font-semibold text-on-surface mb-2">Producto <span className="text-error">*</span></label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
                            <input
                                type="text"
                                value={productoSeleccionado ? `${productoSeleccionado.codigo} — ${productoSeleccionado.nombre}` : busquedaProducto}
                                onChange={(e) => buscarProductos(e.target.value)}
                                placeholder="Buscar producto por nombre o código..."
                                className="w-full pl-9 pr-4 py-2.5 bg-surface border border-outline-variant rounded-lg text-body-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none"
                            />
                        </div>
                        {opciones.length > 0 && !productoSeleccionado && (
                            <div className="mt-1 border border-outline-variant rounded-lg overflow-hidden max-h-40 overflow-y-auto">
                                {opciones.map((p) => (
                                    <button key={p.id} onClick={() => { setProductoSeleccionado(p); setOpciones([]); }} className="w-full text-left px-3 py-2 hover:bg-surface-container text-body-sm flex justify-between">
                                        <span>{p.codigo} — {p.nombre}</span>
                                        <span className="text-on-surface-variant">Stock: {p.stockActual}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-body-sm font-semibold text-on-surface mb-2">Cantidad <span className="text-error">*</span></label>
                            <input type="number" min={tipo === 'ajuste' ? undefined : 1} value={cantidad} onChange={(e) => setCantidad(e.target.value)} className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-lg text-body-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none" />
                            {tipo === 'ajuste' && <p className="text-xs text-on-surface-variant mt-1">Usa un número negativo para reducir el stock.</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-body-sm font-semibold text-on-surface mb-2">Motivo / Referencia {tipo === 'ajuste' && <span className="text-error">*</span>}</label>
                        <input type="text" value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Ej: Recepción OC-992, Ajuste por conteo..." className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-lg text-body-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none" />
                    </div>
                </div>

                <div className="p-6 border-t border-outline-variant/50 flex justify-end gap-3 bg-surface-container/30 rounded-b-2xl">
                    <button onClick={onClose} className="px-5 py-2 rounded-lg text-body-sm font-medium text-secondary hover:bg-surface-variant transition-colors">Cancelar</button>
                    <button onClick={handleRegistrar} disabled={enviando} className="px-6 py-2 rounded-lg text-body-sm font-medium bg-primary text-on-primary shadow-sm hover:bg-primary-container hover:text-on-primary-container transition-colors disabled:opacity-60">
                        {enviando ? 'Registrando…' : 'Registrar Movimiento'}
                    </button>
                </div>
            </div>
        </div>
    );
};
