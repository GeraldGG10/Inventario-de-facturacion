import React, { useState } from 'react';
import { AnularFacturaModal } from '../components/modals/AnularFacturaModal';
import { ConfirmacionModal } from '../components/modals/ConfirmacionModal';
import { NuevoClienteModal } from '../components/modals/NuevoClienteModal';
import { AgregarProductoFacturaModal } from '../components/modals/AgregarProductoFacturaModal';

export const Facturacion = () => {
    const [isAnularModalOpen, setIsAnularModalOpen] = useState(false);
    const [isConfirmacionOpen, setIsConfirmacionOpen] = useState(false);
    const [isNuevoClienteOpen, setIsNuevoClienteOpen] = useState(false);
    const [isAgregarProductoOpen, setIsAgregarProductoOpen] = useState(false);
    
    // Simulate payment method selection
    const [paymentMethod, setPaymentMethod] = useState('tarjeta');

    return (
        <div className="max-w-[1440px] mx-auto space-y-6 pb-20">
            {/* Header / Actions */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="font-headline-md text-headline-md text-on-background mb-1">Nueva Venta</h2>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">Factura #INV-2023-4051</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => setIsConfirmacionOpen(true)} className="px-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-secondary font-body-sm text-body-sm hover:bg-surface-container transition-colors flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">draft</span>
                        Guardar Borrador
                    </button>
                </div>
            </div>

            {/* Complex Bento-style Layout for Invoicing */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-auto lg:h-[calc(100%-80px)] min-h-[600px]">
                {/* Left Column (Client & Products) */}
                <div className="col-span-12 xl:col-span-8 flex flex-col gap-6">
                    {/* Client Section (Glassmorphism inspired card) */}
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
                                className="w-full pl-10 pr-4 py-2 bg-surface rounded-lg border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none font-body-sm text-body-sm transition-all" 
                                placeholder="Buscar cliente por nombre, RNC o teléfono..." 
                                type="text" 
                                defaultValue="Construmart Dominicana S.A."
                            />
                            <button className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-error transition-colors">
                                <span className="material-symbols-outlined text-[18px]">close</span>
                            </button>
                        </div>
                        
                        {/* Selected Client Info */}
                        <div className="mt-4 p-4 bg-surface rounded-lg border border-outline-variant/50 flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-title-sm text-title-sm font-semibold shrink-0">
                                CD
                            </div>
                            <div className="flex-1">
                                <h4 className="font-body-md text-body-md font-medium text-on-surface">Construmart Dominicana S.A.</h4>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 font-body-sm text-body-sm text-on-surface-variant">
                                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">tag</span> RNC: 1-01-85934-2</span>
                                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">call</span> 809-555-0192</span>
                                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">credit_card</span> Límite: $500,000</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Product Selection & Invoice Details (Main Table) */}
                    <section className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.1)] flex-1 flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-title-sm text-title-sm text-on-surface flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">shopping_cart</span>
                                Detalle de Factura
                            </h3>
                        </div>
                        
                        {/* Product Search Bar */}
                        <div className="flex gap-2 mb-4">
                            <div className="relative flex-1">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary">barcode_scanner</span>
                                <input className="w-full pl-10 pr-4 py-2 bg-surface rounded-lg border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none font-body-sm text-body-sm transition-all" placeholder="Escanear código o buscar producto..." type="text" />
                            </div>
                            <button onClick={() => setIsAgregarProductoOpen(true)} className="px-4 py-2 bg-primary text-on-primary rounded-lg font-body-sm text-body-sm font-medium hover:bg-surface-tint transition-colors">
                                Agregar
                            </button>
                        </div>
                        
                        {/* Main Table */}
                        <div className="overflow-x-auto flex-1 border border-outline-variant rounded-lg">
                            <div className="overflow-x-auto w-full pb-2">
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
<tr className="hover:bg-surface transition-colors group">
<td className="p-3 text-secondary">CEM-045</td>
<td className="p-3 text-on-surface font-body-sm text-body-sm">
                                            Cemento Titán Gris 42.5kg
                                            <div className="text-xs text-primary mt-0.5 font-normal">Stock: 1,240 sacos</div>
</td>
<td className="p-3 text-right">
<div className="inline-flex items-center border border-outline-variant rounded-md bg-surface-container-lowest">
<button className="px-2 py-1 text-secondary hover:text-primary transition-colors">-</button>
<input className="w-12 text-center bg-transparent border-none p-0 focus:ring-0 font-data-mono text-data-mono h-7" type="number" value="100"/>
<button className="px-2 py-1 text-secondary hover:text-primary transition-colors">+</button>
</div>
</td>
<td className="p-3 text-right">$450.00</td>
<td className="p-3 text-right font-medium">$45,000.00</td>
<td className="p-3 text-center">
<button className="text-outline hover:text-error transition-colors opacity-0 group-hover:opacity-100">
<span className="material-symbols-outlined text-[20px]">delete</span>
</button>
</td>
</tr>
<tr className="hover:bg-surface transition-colors group">
<td className="p-3 text-secondary">VAR-3/8</td>
<td className="p-3 text-on-surface font-body-sm text-body-sm">
                                            Varilla Corrugada 3/8" x 20'
                                            <div className="text-xs text-primary mt-0.5 font-normal">Stock: 850 qq</div>
</td>
<td className="p-3 text-right">
<div className="inline-flex items-center border border-outline-variant rounded-md bg-surface-container-lowest">
<button className="px-2 py-1 text-secondary hover:text-primary transition-colors">-</button>
<input className="w-12 text-center bg-transparent border-none p-0 focus:ring-0 font-data-mono text-data-mono h-7" type="number" value="50"/>
<button className="px-2 py-1 text-secondary hover:text-primary transition-colors">+</button>
</div>
</td>
<td className="p-3 text-right">$2,800.00</td>
<td className="p-3 text-right font-medium">$140,000.00</td>
<td className="p-3 text-center">
<button className="text-outline hover:text-error transition-colors opacity-0 group-hover:opacity-100">
<span className="material-symbols-outlined text-[20px]">delete</span>
</button>
</td>
</tr>
<tr className="hover:bg-surface transition-colors group">
<td className="p-3 text-secondary">BLO-06</td>
<td className="p-3 text-on-surface font-body-sm text-body-sm">
                                            Block de Concreto 6"
                                            <div className="text-xs text-error mt-0.5 font-normal">Stock Bajo: 120 uds</div>
</td>
<td className="p-3 text-right">
<div className="inline-flex items-center border border-outline-variant rounded-md bg-surface-container-lowest">
<button className="px-2 py-1 text-secondary hover:text-primary transition-colors">-</button>
<input className="w-12 text-center bg-transparent border-none p-0 focus:ring-0 font-data-mono text-data-mono h-7" type="number" value="100"/>
<button className="px-2 py-1 text-secondary hover:text-primary transition-colors">+</button>
</div>
</td>
<td className="p-3 text-right">$38.00</td>
<td className="p-3 text-right font-medium">$3,800.00</td>
<td className="p-3 text-center">
<button className="text-outline hover:text-error transition-colors opacity-0 group-hover:opacity-100">
<span className="material-symbols-outlined text-[20px]">delete</span>
</button>
</td>
</tr>
</tbody>
</table>
</div>
                            
                            {/* Empty State / Add More row */}
                            <div className="p-4 flex justify-center border-t border-outline-variant bg-surface-container-lowest">
                                <button onClick={() => setIsAgregarProductoOpen(true)} className="text-primary font-body-sm text-body-sm font-medium hover:underline flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[18px]">add_circle</span>
                                    Agregar otra línea
                                </button>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Right Column (Summary & Payment) */}
                <div className="col-span-12 xl:col-span-4 flex flex-col gap-6">
                    {/* Summary Panel */}
                    <section className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.1)]">
                        <h3 className="font-title-sm text-title-sm text-on-surface mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">request_quote</span>
                            Resumen de Venta
                        </h3>
                        <div className="space-y-3 font-data-mono text-data-mono text-on-surface">
                            <div className="flex justify-between items-center">
                                <span className="text-on-surface-variant">Subtotal</span>
                                <span>$188,800.00</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-on-surface-variant">Descuento (5%)</span>
                                <span className="text-error">-$9,440.00</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-on-surface-variant">Subtotal Neto</span>
                                <span>$179,360.00</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-outline-variant pb-3">
                                <span className="text-on-surface-variant">ITBIS (18%)</span>
                                <span>$32,284.80</span>
                            </div>
                            <div className="flex justify-between items-center pt-2">
                                <span className="font-headline-md text-headline-md text-on-surface font-bold">TOTAL</span>
                                <span className="font-headline-md text-headline-md text-primary font-bold">$211,644.80</span>
                            </div>
                        </div>
                    </section>

                    {/* Payment Methods */}
                    <section className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.1)] flex-1 flex flex-col">
                        <h3 className="font-title-sm text-title-sm text-on-surface mb-4">Método de Pago</h3>
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            <label onClick={() => setPaymentMethod('tarjeta')} className={`flex flex-col items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-colors ${paymentMethod === 'tarjeta' ? 'border-primary bg-primary-container/10' : 'border-outline-variant hover:border-primary/50 bg-surface'}`}>
                                <input checked={paymentMethod === 'tarjeta'} onChange={() => {}} className="hidden" name="payment" type="radio" />
                                <span className={`material-symbols-outlined mb-1 ${paymentMethod === 'tarjeta' ? 'text-primary' : 'text-secondary'}`}>credit_card</span>
                                <span className={`font-body-sm text-body-sm font-medium ${paymentMethod === 'tarjeta' ? 'text-primary' : 'text-on-surface-variant'}`}>Tarjeta</span>
                            </label>
                            <label onClick={() => setPaymentMethod('efectivo')} className={`flex flex-col items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-colors ${paymentMethod === 'efectivo' ? 'border-primary bg-primary-container/10' : 'border-outline-variant hover:border-primary/50 bg-surface'}`}>
                                <input checked={paymentMethod === 'efectivo'} onChange={() => {}} className="hidden" name="payment" type="radio" />
                                <span className={`material-symbols-outlined mb-1 ${paymentMethod === 'efectivo' ? 'text-primary' : 'text-secondary'}`}>payments</span>
                                <span className={`font-body-sm text-body-sm font-medium ${paymentMethod === 'efectivo' ? 'text-primary' : 'text-on-surface-variant'}`}>Efectivo</span>
                            </label>
                            <label onClick={() => setPaymentMethod('transferencia')} className={`flex flex-col items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-colors ${paymentMethod === 'transferencia' ? 'border-primary bg-primary-container/10' : 'border-outline-variant hover:border-primary/50 bg-surface'}`}>
                                <input checked={paymentMethod === 'transferencia'} onChange={() => {}} className="hidden" name="payment" type="radio" />
                                <span className={`material-symbols-outlined mb-1 ${paymentMethod === 'transferencia' ? 'text-primary' : 'text-secondary'}`}>account_balance</span>
                                <span className={`font-body-sm text-body-sm font-medium ${paymentMethod === 'transferencia' ? 'text-primary' : 'text-on-surface-variant'}`}>Transf.</span>
                            </label>
                            <label onClick={() => setPaymentMethod('mixto')} className={`flex flex-col items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-colors ${paymentMethod === 'mixto' ? 'border-primary bg-primary-container/10' : 'border-outline-variant hover:border-primary/50 bg-surface'}`}>
                                <input checked={paymentMethod === 'mixto'} onChange={() => {}} className="hidden" name="payment" type="radio" />
                                <span className={`material-symbols-outlined mb-1 ${paymentMethod === 'mixto' ? 'text-primary' : 'text-secondary'}`}>splitscreen</span>
                                <span className={`font-body-sm text-body-sm font-medium ${paymentMethod === 'mixto' ? 'text-primary' : 'text-on-surface-variant'}`}>Mixto</span>
                            </label>
                        </div>
                        
                        {/* Action Button */}
                        <div className="mt-auto">
                            <button onClick={() => setIsConfirmacionOpen(true)} className="w-full py-4 bg-primary text-on-primary rounded-xl font-title-sm text-title-sm font-bold hover:bg-surface-tint shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] transition-all active:scale-[0.98] flex justify-center items-center gap-2">
                                <span className="material-symbols-outlined">check_circle</span>
                                Confirmar Venta
                            </button>
                        </div>
                    </section>
                </div>
            </div>

            {/* Recent Invoices (Quick Access) */}
            <div className="mt-8">
                <h3 className="font-title-sm text-title-sm text-on-surface mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary">history</span>
                    Facturas Recientes
                </h3>
                <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-[0_1px_3px_0_rgba(0,0,0,0.1)] overflow-hidden">
                    <div className="overflow-x-auto w-full pb-2">
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
<tr className="hover:bg-surface transition-colors">
<td className="p-3 pl-6 text-primary font-medium cursor-pointer hover:underline">INV-2023-4050</td>
<td className="p-3 text-on-surface font-body-sm text-body-sm">Ferretería El Progreso</td>
<td className="p-3 text-secondary font-body-sm text-body-sm">Hoy, 10:23 AM</td>
<td className="p-3 text-right">$45,890.00</td>
<td className="p-3 text-center pr-6">
<span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#dcfce7] text-[#166534]">Pagada</span>
</td>
</tr>
<tr className="hover:bg-surface transition-colors">
<td className="p-3 pl-6 text-primary font-medium cursor-pointer hover:underline">INV-2023-4049</td>
<td className="p-3 text-on-surface font-body-sm text-body-sm">Ingeniería del Norte SRL</td>
<td className="p-3 text-secondary font-body-sm text-body-sm">Ayer, 04:45 PM</td>
<td className="p-3 text-right">$124,500.00</td>
<td className="p-3 text-center pr-6">
<span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#fef08a] text-[#854d0e]">Crédito</span>
</td>
</tr>
</tbody>
</table>
</div>
                </div>
            </div>

            {/* Modals */}
            {isAnularModalOpen && <AnularFacturaModal onClose={() => setIsAnularModalOpen(false)} />}
            {isConfirmacionOpen && <ConfirmacionModal onClose={() => setIsConfirmacionOpen(false)} />}
            {isNuevoClienteOpen && <NuevoClienteModal onClose={() => setIsNuevoClienteOpen(false)} />}
            {isAgregarProductoOpen && <AgregarProductoFacturaModal onClose={() => setIsAgregarProductoOpen(false)} />}
        </div>
    );
};
