import React from 'react';

interface Props {
    onClose: () => void;
}

export const NuevoArticuloModal = ({ onClose }: Props) => {
    return (
        <>
            {/* Ambient Shadow Overlay for Modal Background */}
            <div className="fixed inset-0 bg-[#0f172a] bg-opacity-40 backdrop-blur-[2px] z-40 transition-opacity" onClick={onClose}></div>
            
            {/* Modal Container */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <main className="relative w-full max-w-3xl bg-surface-container-lowest rounded-xl shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)] border border-outline-variant/30 flex flex-col max-h-[90vh] pointer-events-auto">
                    {/* Modal Header */}
                    <header className="flex items-start justify-between px-6 py-5 border-b border-outline-variant/30 shrink-0">
                        <div>
                            <h2 className="font-headline-md text-headline-md text-on-surface">Nuevo artículo</h2>
                            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Registra un nuevo producto en el inventario</p>
                        </div>
                        <button 
                            onClick={onClose}
                            className="text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-full p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                        >
                            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>close</span>
                        </button>
                    </header>
                    
                    {/* Modal Body (Scrollable) */}
                    <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
                        {/* Información principal */}
                        <section className="space-y-4">
                            <h3 className="font-label-caps text-label-caps text-secondary uppercase tracking-wider">Información principal</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="block font-body-sm text-body-sm text-on-surface font-medium" htmlFor="codigo">
                                        Código <span className="text-error">*</span>
                                    </label>
                                    <input className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-body-sm text-body-sm" id="codigo" placeholder="Ej. PRD-001" type="text" />
                                </div>
                                <div className="space-y-1">
                                    <label className="block font-body-sm text-body-sm text-on-surface font-medium" htmlFor="codigoBarras">
                                        Código de barras
                                    </label>
                                    <input className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-body-sm text-body-sm" id="codigoBarras" placeholder="Opcional" type="text" />
                                </div>
                                <div className="space-y-1 md:col-span-2">
                                    <label className="block font-body-sm text-body-sm text-on-surface font-medium" htmlFor="nombre">
                                        Nombre <span className="text-error">*</span>
                                    </label>
                                    <input className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-body-sm text-body-sm" id="nombre" placeholder="Nombre del producto" type="text" />
                                </div>
                                <div className="space-y-1 md:col-span-2">
                                    <label className="block font-body-sm text-body-sm text-on-surface font-medium" htmlFor="descripcion">
                                        Descripción
                                    </label>
                                    <textarea className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-body-sm text-body-sm resize-none" id="descripcion" placeholder="Descripción detallada (opcional)" rows={2}></textarea>
                                </div>
                            </div>
                        </section>
                        
                        {/* Categorización y Precios */}
                        <section className="space-y-4">
                            <h3 className="font-label-caps text-label-caps text-secondary uppercase tracking-wider">Categorización y Precios</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="block font-body-sm text-body-sm text-on-surface font-medium" htmlFor="categoria">
                                        Categoría <span className="text-error">*</span>
                                    </label>
                                    <select className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-body-sm text-body-sm" id="categoria">
                                        <option disabled selected value="">Selecciona una categoría</option>
                                        <option value="electronica">Electrónica</option>
                                        <option value="mobiliario">Mobiliario</option>
                                        <option value="accesorios">Accesorios</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="block font-body-sm text-body-sm text-on-surface font-medium" htmlFor="proveedor">
                                        Proveedor
                                    </label>
                                    <select className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-body-sm text-body-sm" id="proveedor">
                                        <option disabled selected value="">Selecciona un proveedor</option>
                                        <option value="prov1">Proveedor A</option>
                                        <option value="prov2">Proveedor B</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="block font-body-sm text-body-sm text-on-surface font-medium" htmlFor="precioCosto">
                                        Precio de costo <span className="text-error">*</span>
                                    </label>
                                    <input className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-body-sm text-body-sm" id="precioCosto" placeholder="0.00" type="number" step="0.01" />
                                </div>
                                <div className="space-y-1">
                                    <label className="block font-body-sm text-body-sm text-on-surface font-medium" htmlFor="precioVenta">
                                        Precio de venta <span className="text-error">*</span>
                                    </label>
                                    <input className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-body-sm text-body-sm" id="precioVenta" placeholder="0.00" type="number" step="0.01" />
                                </div>
                            </div>
                        </section>

                        {/* Inventario */}
                        <section className="space-y-4">
                            <h3 className="font-label-caps text-label-caps text-secondary uppercase tracking-wider">Inventario</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <label className="block font-body-sm text-body-sm text-on-surface font-medium" htmlFor="stockActual">
                                        Stock actual <span className="text-error">*</span>
                                    </label>
                                    <input className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-body-sm text-body-sm" id="stockActual" placeholder="0" type="number" />
                                </div>
                                <div className="space-y-1">
                                    <label className="block font-body-sm text-body-sm text-on-surface font-medium" htmlFor="stockMinimo">
                                        Stock mínimo
                                    </label>
                                    <input className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-body-sm text-body-sm" id="stockMinimo" placeholder="0" type="number" />
                                </div>
                                <div className="space-y-1">
                                    <label className="block font-body-sm text-body-sm text-on-surface font-medium" htmlFor="ubicacion">
                                        Ubicación / Bodega
                                    </label>
                                    <input className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-body-sm text-body-sm" id="ubicacion" placeholder="Ej. Estante A" type="text" />
                                </div>
                            </div>
                        </section>
                        
                        {/* Estado */}
                        <section className="space-y-4">
                            <h3 className="font-label-caps text-label-caps text-secondary uppercase tracking-wider">Estado</h3>
                            <div className="flex items-center gap-3 bg-surface-container-low p-1 rounded-lg w-fit">
                                <button className="px-4 py-1.5 rounded-md font-body-sm text-body-sm font-medium bg-surface-container-lowest shadow-sm text-on-surface transition-all">Disponible</button>
                                <button className="px-4 py-1.5 rounded-md font-body-sm text-body-sm font-medium text-on-surface-variant hover:text-on-surface transition-all">Inactivo</button>
                            </div>
                        </section>
                    </div>
                    
                    {/* Modal Footer */}
                    <footer className="flex items-center justify-end gap-3 px-6 py-4 border-t border-outline-variant/30 bg-surface-container-low/50 shrink-0 rounded-b-xl">
                        <button 
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg font-body-md text-body-md font-medium text-on-surface-variant hover:bg-surface-container-highest transition-colors border border-transparent"
                        >
                            Cancelar
                        </button>
                        <button className="px-4 py-2 rounded-lg font-body-md text-body-md font-medium text-on-primary bg-primary hover:bg-primary/90 transition-colors shadow-sm">
                            Guardar artículo
                        </button>
                    </footer>
                </main>
            </div>
        </>
    );
};
