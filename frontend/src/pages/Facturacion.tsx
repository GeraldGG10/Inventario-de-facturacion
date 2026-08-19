import React, { useEffect, useState } from 'react';
import { AnularFacturaModal, FacturaParaAnular } from '../components/modals/AnularFacturaModal';
import { NuevoClienteModal } from '../components/modals/NuevoClienteModal';
import { AgregarProductoFacturaModal, ProductoFacturable } from '../components/modals/AgregarProductoFacturaModal';
import { ExportarFacturaModal } from '../components/modals/ExportarFacturaModal';
import { api, ApiError } from '../lib/api';

interface Cliente { id: string; nombre: string; documento: string | null; telefono: string | null; limiteCredito: number | null }
interface LineaFactura { producto: ProductoFacturable; cantidad: number }
interface FacturaReciente { id: number; numero: string; cliente: { nombre: string }; usuario: { nombre: string } | null; fecha: string; total: number; estado: string; metodoPago: string }

const formatoMoneda = new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' });
const METODOS_PAGO = [
    { val: 'tarjeta', label: 'Tarjeta', icon: 'credit_card' },
    { val: 'efectivo', label: 'Efectivo', icon: 'payments' },
    { val: 'transferencia', label: 'Transf.', icon: 'account_balance' },
    { val: 'mixto', label: 'Mixto', icon: 'splitscreen' },
];

export const Facturacion = () => {
    const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
    const [busquedaCliente, setBusquedaCliente] = useState('');
    const [resultadosCliente, setResultadosCliente] = useState<Cliente[]>([]);
    const [isNuevoClienteOpen, setIsNuevoClienteOpen] = useState(false);

    const [lineas, setLineas] = useState<LineaFactura[]>([]);
    const [isAgregarProductoOpen, setIsAgregarProductoOpen] = useState(false);

    const [metodoPago, setMetodoPago] = useState('efectivo');
    const [impuestoPorcentaje, setImpuestoPorcentaje] = useState(18);
    const [enviando, setEnviando] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [exito, setExito] = useState<string | null>(null);

    const [facturasRecientes, setFacturasRecientes] = useState<FacturaReciente[]>([]);
    const [facturaAnular, setFacturaAnular] = useState<FacturaReciente | null>(null);
    const [facturaExportar, setFacturaExportar] = useState<FacturaReciente | null>(null);

    function cargarFacturasRecientes() {
        api.get('/facturas', { pageSize: 5 }).then((data) => setFacturasRecientes(data.facturas)).catch(() => {});
    }

    useEffect(() => {
        api.get('/configuracion').then((data) => setImpuestoPorcentaje(data.facturacion.impuestoPorcentaje)).catch(() => {});
        cargarFacturasRecientes();
    }, []);

    useEffect(() => {
        if (busquedaCliente.length < 2) { setResultadosCliente([]); return; }
        api.get('/clientes', { busqueda: busquedaCliente }).then(setResultadosCliente).catch(() => {});
    }, [busquedaCliente]);

    function agregarProducto(producto: ProductoFacturable) {
        setLineas((prev) => {
            const existente = prev.find((l) => l.producto.id === producto.id);
            if (existente) {
                return prev.map((l) => (l.producto.id === producto.id ? { ...l, cantidad: l.cantidad + 1 } : l));
            }
            return [...prev, { producto, cantidad: 1 }];
        });
        setIsAgregarProductoOpen(false);
    }

    function actualizarCantidad(productoId: string, cantidad: number) {
        setLineas((prev) => prev.map((l) => (l.producto.id === productoId ? { ...l, cantidad: Math.max(1, cantidad) } : l)));
    }

    function eliminarLinea(productoId: string) {
        setLineas((prev) => prev.filter((l) => l.producto.id !== productoId));
    }

    const subtotal = lineas.reduce((acc, l) => acc + l.producto.precioVenta * l.cantidad, 0);
    const impuestoMonto = subtotal * (impuestoPorcentaje / 100);
    const total = subtotal + impuestoMonto;

    async function confirmarVenta() {
        setError(null);
        setExito(null);
        if (!clienteSeleccionado) { setError('Selecciona un cliente'); return; }
        if (lineas.length === 0) { setError('Agrega al menos un producto'); return; }

        setEnviando(true);
        try {
            const factura = await api.post('/facturas', {
                clienteId: clienteSeleccionado.id,
                metodoPago,
                lineas: lineas.map((l) => ({ productoId: l.producto.id, cantidad: l.cantidad })),
            });
            setExito(`Venta registrada: factura ${factura.numero}`);
            setLineas([]);
            setClienteSeleccionado(null);
            setBusquedaCliente('');
            cargarFacturasRecientes();
        } catch (err) {
            setError(err instanceof ApiError ? err.message : 'No se pudo registrar la venta');
        } finally {
            setEnviando(false);
        }
    }

    return (
        <div className="max-w-[1440px] mx-auto space-y-6 pb-20">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="font-headline-md text-headline-md text-on-background mb-1">Nueva Venta</h2>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">Registra una venta y actualiza el inventario automáticamente</p>
                </div>
            </div>

            {error && <div className="p-3 rounded-lg bg-error/10 text-error text-body-sm">{error}</div>}
            {exito && <div className="p-3 rounded-lg bg-[#008a00]/10 text-[#008a00] text-body-sm">{exito}</div>}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-auto lg:h-[calc(100%-80px)] min-h-[600px]">
                <div className="col-span-12 xl:col-span-8 flex flex-col gap-6">
                    <section className="bg-surface-container-lowest rounded-xl border border-outline-variant/50 p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.1)] relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-title-sm text-title-sm text-on-surface flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">person</span>
                                Información del Cliente
                            </h3>
                            <button onClick={() => setIsNuevoClienteOpen(true)} className="text-primary font-body-sm text-body-sm hover:underline flex items-center gap-1 font-medium">
                                <span className="material-symbols-outlined text-[18px]">add</span>
                                Nuevo Cliente
                            </button>
                        </div>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary">search</span>
                            <input
                                className="w-full pl-10 pr-10 py-2 bg-surface rounded-lg border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none font-body-sm text-body-sm transition-all"
                                placeholder="Buscar cliente por nombre, RNC o teléfono..."
                                value={clienteSeleccionado ? clienteSeleccionado.nombre : busquedaCliente}
                                onChange={(e) => { setBusquedaCliente(e.target.value); setClienteSeleccionado(null); }}
                            />
                            {clienteSeleccionado && (
                                <button onClick={() => { setClienteSeleccionado(null); setBusquedaCliente(''); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-error transition-colors" title="Cambiar cliente">
                                    <span className="material-symbols-outlined text-[18px]">close</span>
                                </button>
                            )}
                        </div>
                        {resultadosCliente.length > 0 && !clienteSeleccionado && (
                            <div className="mt-1 border border-outline-variant rounded-lg overflow-hidden max-h-40 overflow-y-auto">
                                {resultadosCliente.map((c) => (
                                    <button key={c.id} onClick={() => { setClienteSeleccionado(c); setResultadosCliente([]); }} className="w-full text-left px-3 py-2 hover:bg-surface-container text-body-sm">
                                        {c.nombre} {c.documento ? `— ${c.documento}` : ''}
                                    </button>
                                ))}
                            </div>
                        )}

                        {clienteSeleccionado && (
                            <div className="mt-4 p-4 bg-surface rounded-lg border border-outline-variant/50 flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-title-sm text-title-sm font-semibold shrink-0">
                                    {clienteSeleccionado.nombre.slice(0, 2).toUpperCase()}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-body-md text-body-md font-medium text-on-surface">{clienteSeleccionado.nombre}</h4>
                                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 font-body-sm text-body-sm text-on-surface-variant">
                                        {clienteSeleccionado.documento && <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">tag</span> RNC: {clienteSeleccionado.documento}</span>}
                                        {clienteSeleccionado.telefono && <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">call</span> {clienteSeleccionado.telefono}</span>}
                                        {clienteSeleccionado.limiteCredito != null && <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">credit_card</span> Límite: {formatoMoneda.format(clienteSeleccionado.limiteCredito)}</span>}
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>

                    <section className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.1)] flex-1 flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-title-sm text-title-sm text-on-surface flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">shopping_cart</span>
                                Detalle de Factura
                            </h3>
                            <button onClick={() => setIsAgregarProductoOpen(true)} className="px-4 py-2 bg-primary text-on-primary rounded-lg font-body-sm text-body-sm font-medium hover:bg-surface-tint transition-colors">
                                Agregar producto
                            </button>
                        </div>

                        <div className="overflow-x-auto flex-1 border border-outline-variant rounded-lg">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-surface sticky top-0 z-10 border-b border-outline-variant">
                                    <tr>
                                        <th className="p-3 font-label-caps text-label-caps text-on-surface-variant">CÓDIGO</th>
                                        <th className="p-3 font-label-caps text-label-caps text-on-surface-variant w-2/5">PRODUCTO</th>
                                        <th className="p-3 font-label-caps text-label-caps text-on-surface-variant text-right">CANT.</th>
                                        <th className="p-3 font-label-caps text-label-caps text-on-surface-variant text-right">PRECIO</th>
                                        <th className="p-3 font-label-caps text-label-caps text-on-surface-variant text-right">SUBTOTAL</th>
                                        <th className="p-3 font-label-caps text-label-caps text-on-surface-variant text-center w-12"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-outline-variant font-data-mono text-data-mono">
                                    {lineas.length === 0 && (
                                        <tr><td colSpan={6} className="p-6 text-center text-on-surface-variant font-body-sm">Agrega productos a la venta.</td></tr>
                                    )}
                                    {lineas.map((l) => (
                                        <tr key={l.producto.id} className="hover:bg-surface transition-colors group">
                                            <td className="p-3 text-secondary">{l.producto.codigo}</td>
                                            <td className="p-3 text-on-surface font-body-sm text-body-sm">
                                                {l.producto.nombre}
                                                <div className="text-xs text-primary mt-0.5 font-normal">Stock: {l.producto.stockActual}</div>
                                            </td>
                                            <td className="p-3 text-right">
                                                <div className="inline-flex items-center border border-outline-variant rounded-md bg-surface-container-lowest">
                                                    <button onClick={() => actualizarCantidad(l.producto.id, l.cantidad - 1)} className="px-2 py-1 text-secondary hover:text-primary transition-colors">-</button>
                                                    <input className="w-12 text-center bg-transparent border-none p-0 focus:ring-0 font-data-mono text-data-mono h-7" type="number" value={l.cantidad} onChange={(e) => actualizarCantidad(l.producto.id, Number(e.target.value) || 1)} />
                                                    <button onClick={() => actualizarCantidad(l.producto.id, l.cantidad + 1)} className="px-2 py-1 text-secondary hover:text-primary transition-colors">+</button>
                                                </div>
                                            </td>
                                            <td className="p-3 text-right">{formatoMoneda.format(l.producto.precioVenta)}</td>
                                            <td className="p-3 text-right font-medium">{formatoMoneda.format(l.producto.precioVenta * l.cantidad)}</td>
                                            <td className="p-3 text-center">
                                                <button onClick={() => eliminarLinea(l.producto.id)} className="text-outline hover:text-error transition-colors">
                                                    <span className="material-symbols-outlined text-[20px]">delete</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>

                <div className="col-span-12 xl:col-span-4 flex flex-col gap-6">
                    <section className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.1)]">
                        <h3 className="font-title-sm text-title-sm text-on-surface mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">request_quote</span>
                            Resumen de Venta
                        </h3>
                        <div className="space-y-3 font-data-mono text-data-mono text-on-surface">
                            <div className="flex justify-between items-center border-b border-outline-variant pb-3">
                                <span className="text-on-surface-variant">Subtotal</span>
                                <span>{formatoMoneda.format(subtotal)}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-outline-variant pb-3">
                                <span className="text-on-surface-variant">ITBIS ({impuestoPorcentaje}%)</span>
                                <span>{formatoMoneda.format(impuestoMonto)}</span>
                            </div>
                            <div className="flex justify-between items-center pt-2">
                                <span className="font-headline-md text-headline-md text-on-surface font-bold">TOTAL</span>
                                <span className="font-headline-md text-headline-md text-primary font-bold">{formatoMoneda.format(total)}</span>
                            </div>
                        </div>
                    </section>

                    <section className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.1)] flex-1 flex flex-col">
                        <h3 className="font-title-sm text-title-sm text-on-surface mb-4">Método de Pago</h3>
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            {METODOS_PAGO.map((m) => (
                                <button key={m.val} onClick={() => setMetodoPago(m.val)} className={`flex flex-col items-center justify-center p-3 border-2 rounded-lg transition-colors ${metodoPago === m.val ? 'border-primary bg-primary-container/10' : 'border-outline-variant hover:border-primary/50 bg-surface'}`}>
                                    <span className={`material-symbols-outlined mb-1 ${metodoPago === m.val ? 'text-primary' : 'text-secondary'}`}>{m.icon}</span>
                                    <span className={`font-body-sm text-body-sm font-medium ${metodoPago === m.val ? 'text-primary' : 'text-on-surface-variant'}`}>{m.label}</span>
                                </button>
                            ))}
                        </div>

                        <div className="mt-auto">
                            <button onClick={confirmarVenta} disabled={enviando} className="w-full py-4 bg-primary text-on-primary rounded-xl font-title-sm text-title-sm font-bold hover:bg-surface-tint shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] transition-all active:scale-[0.98] flex justify-center items-center gap-2 disabled:opacity-60">
                                <span className="material-symbols-outlined">check_circle</span>
                                {enviando ? 'Registrando…' : 'Confirmar Venta'}
                            </button>
                        </div>
                    </section>
                </div>
            </div>

            <div className="mt-8">
                <h3 className="font-title-sm text-title-sm text-on-surface mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary">history</span>
                    Facturas Recientes
                </h3>
                <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-[0_1px_3px_0_rgba(0,0,0,0.1)] overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-surface border-b border-outline-variant">
                            <tr>
                                <th className="p-3 font-label-caps text-label-caps text-on-surface-variant pl-6">NO. FACTURA</th>
                                <th className="p-3 font-label-caps text-label-caps text-on-surface-variant">CLIENTE</th>
                                <th className="p-3 font-label-caps text-label-caps text-on-surface-variant">FECHA</th>
                                <th className="p-3 font-label-caps text-label-caps text-on-surface-variant text-right">TOTAL</th>
                                <th className="p-3 font-label-caps text-label-caps text-on-surface-variant text-center pr-6">ESTADO</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant font-data-mono text-data-mono">
                            {facturasRecientes.length === 0 && (
                                <tr><td colSpan={5} className="p-6 text-center text-on-surface-variant font-body-sm">Sin facturas todavía.</td></tr>
                            )}
                            {facturasRecientes.map((f) => (
                                <tr key={f.id} className="hover:bg-surface transition-colors">
                                    <td className="p-3 pl-6 text-primary font-medium cursor-pointer hover:underline" onClick={() => setFacturaExportar(f)}>{f.numero}</td>
                                    <td className="p-3 text-on-surface font-body-sm text-body-sm">{f.cliente.nombre}</td>
                                    <td className="p-3 text-secondary font-body-sm text-body-sm">{new Date(f.fecha).toLocaleString('es-DO')}</td>
                                    <td className="p-3 text-right">{formatoMoneda.format(f.total)}</td>
                                    <td className="p-3 text-center pr-6">
                                        {f.estado === 'anulada' ? (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-error-container/20 text-error-container">Anulada</span>
                                        ) : (
                                            <button onClick={() => setFacturaAnular(f)} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#dcfce7] text-[#166534] hover:bg-error-container/30 hover:text-error transition-colors" title="Anular factura">Emitida</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isNuevoClienteOpen && (
                <NuevoClienteModal onClose={() => setIsNuevoClienteOpen(false)} onCreado={(c) => { setClienteSeleccionado(c); setIsNuevoClienteOpen(false); }} />
            )}
            {isAgregarProductoOpen && (
                <AgregarProductoFacturaModal onClose={() => setIsAgregarProductoOpen(false)} onAgregar={agregarProducto} />
            )}
            {facturaAnular && (
                <AnularFacturaModal
                    factura={facturaAnular}
                    onClose={() => setFacturaAnular(null)}
                    onAnulada={() => { setFacturaAnular(null); cargarFacturasRecientes(); }}
                />
            )}
            {facturaExportar && (
                <ExportarFacturaModal facturaId={facturaExportar.id} numero={facturaExportar.numero} onClose={() => setFacturaExportar(null)} />
            )}
        </div>
    );
};
