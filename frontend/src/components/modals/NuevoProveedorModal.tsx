import React, { useState } from 'react';

interface Props {
    onClose: () => void;
}

export const NuevoProveedorModal = ({ onClose }: Props) => {
    const [tipoProveedor, setTipoProveedor] = useState('empresa');
    const [estado, setEstado] = useState('activo');

    return (
        <>
            {/* Modal Backdrop / Focus Overlay */}
            <div className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-[2px] z-40 transition-opacity duration-300" onClick={onClose}></div>
            
            {/* Modal Container */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <div className="relative bg-surface-container-lowest w-full max-w-3xl rounded-xl shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),_0_0_0_1px_rgba(0,0,0,0.05)] flex flex-col max-h-[90vh] overflow-hidden pointer-events-auto">
                    
                    {/* Modal Header */}
                    <div className="flex items-start justify-between px-6 py-5 border-b border-outline-variant/30 shrink-0">
                        <div>
                            <h2 className="font-headline-md text-headline-md text-on-surface">Nuevo proveedor</h2>
                            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Registra un nuevo proveedor para gestionar tus compras e inventario</p>
                        </div>
                        <button 
                            onClick={onClose}
                            className="text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-container focus:ring-offset-2"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    
                    {/* Modal Body (Scrollable) */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-6 bg-surface">
                        <form className="space-y-8">
                            {/* Section: Información del proveedor */}
                            <section>
                                <h3 className="font-label-caps text-label-caps uppercase text-secondary mb-4 tracking-wider">Información del proveedor</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="col-span-1">
                                        <label className="block font-body-sm text-body-sm text-on-surface mb-1.5" htmlFor="nombre_proveedor">
                                            Nombre/Razón social <span className="text-error">*</span>
                                        </label>
                                        <input className="w-full bg-surface-container-lowest border border-outline-variant/60 rounded focus:border-primary focus:ring-2 focus:ring-primary/20 text-on-surface font-body-md text-body-md px-3 py-2 transition-shadow" id="nombre_proveedor" name="nombre_proveedor" placeholder="Ej. Proveedora Industrial S.A." type="text" />
                                    </div>
                                    <div className="col-span-1">
                                        <label className="block font-body-sm text-body-sm text-on-surface mb-1.5" htmlFor="rnc">
                                            RNC <span className="text-error">*</span>
                                        </label>
                                        <input className="w-full bg-surface-container-lowest border border-outline-variant/60 rounded focus:border-primary focus:ring-2 focus:ring-primary/20 text-on-surface font-body-md text-body-md px-3 py-2 transition-shadow" id="rnc" name="rnc" placeholder="000000000" type="text" />
                                    </div>
                                    <div className="col-span-1 md:col-span-2">
                                        <label className="block font-body-sm text-body-sm text-on-surface mb-2">Tipo</label>
                                        <div className="flex items-center gap-6">
                                            <label className="flex items-center gap-2 cursor-pointer group">
                                                <input 
                                                    checked={tipoProveedor === 'empresa'}
                                                    onChange={() => setTipoProveedor('empresa')}
                                                    className="w-4 h-4 text-primary bg-surface border-outline-variant focus:ring-primary" 
                                                    name="tipo_proveedor" 
                                                    type="radio" 
                                                    value="empresa" 
                                                />
                                                <span className="font-body-sm text-body-sm text-on-surface-variant group-hover:text-on-surface transition-colors">Empresa</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer group">
                                                <input 
                                                    checked={tipoProveedor === 'persona'}
                                                    onChange={() => setTipoProveedor('persona')}
                                                    className="w-4 h-4 text-primary bg-surface border-outline-variant focus:ring-primary" 
                                                    name="tipo_proveedor" 
                                                    type="radio" 
                                                    value="persona" 
                                                />
                                                <span className="font-body-sm text-body-sm text-on-surface-variant group-hover:text-on-surface transition-colors">Persona</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </section>
                            
                            <hr className="border-outline-variant/30" />
                            
                            {/* Section: Información de contacto */}
                            <section>
                                <h3 className="font-label-caps text-label-caps uppercase text-secondary mb-4 tracking-wider">Información de contacto</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="col-span-1 md:col-span-2">
                                        <label className="block font-body-sm text-body-sm text-on-surface mb-1.5" htmlFor="contacto_nombre">
                                            Nombre del contacto <span className="text-error">*</span>
                                        </label>
                                        <input className="w-full bg-surface-container-lowest border border-outline-variant/60 rounded focus:border-primary focus:ring-2 focus:ring-primary/20 text-on-surface font-body-md text-body-md px-3 py-2 transition-shadow" id="contacto_nombre" name="contacto_nombre" placeholder="Nombre de la persona a contactar" type="text" />
                                    </div>
                                    <div className="col-span-1">
                                        <label className="block font-body-sm text-body-sm text-on-surface mb-1.5" htmlFor="telefono">
                                            Teléfono <span className="text-error">*</span>
                                        </label>
                                        <input className="w-full bg-surface-container-lowest border border-outline-variant/60 rounded focus:border-primary focus:ring-2 focus:ring-primary/20 text-on-surface font-body-md text-body-md px-3 py-2 transition-shadow" id="telefono" name="telefono" placeholder="(000) 000-0000" type="tel" />
                                    </div>
                                    <div className="col-span-1">
                                        <label className="block font-body-sm text-body-sm text-on-surface mb-1.5" htmlFor="email">
                                            Correo electrónico
                                        </label>
                                        <input className="w-full bg-surface-container-lowest border border-outline-variant/60 rounded focus:border-primary focus:ring-2 focus:ring-primary/20 text-on-surface font-body-md text-body-md px-3 py-2 transition-shadow" id="email" name="email" placeholder="correo@empresa.com" type="email" />
                                    </div>
                                </div>
                            </section>
                            
                            <hr className="border-outline-variant/30" />
                            
                            {/* Section: Ubicación */}
                            <section>
                                <h3 className="font-label-caps text-label-caps uppercase text-secondary mb-4 tracking-wider">Ubicación</h3>
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="col-span-1">
                                        <label className="block font-body-sm text-body-sm text-on-surface mb-1.5" htmlFor="direccion">
                                            Dirección
                                        </label>
                                        <input className="w-full bg-surface-container-lowest border border-outline-variant/60 rounded focus:border-primary focus:ring-2 focus:ring-primary/20 text-on-surface font-body-md text-body-md px-3 py-2 transition-shadow" id="direccion" name="direccion" placeholder="Calle, número, sector" type="text" />
                                    </div>
                                    <div className="col-span-1 md:w-1/2">
                                        <label className="block font-body-sm text-body-sm text-on-surface mb-1.5" htmlFor="ciudad">
                                            Ciudad / Municipio
                                        </label>
                                        <input className="w-full bg-surface-container-lowest border border-outline-variant/60 rounded focus:border-primary focus:ring-2 focus:ring-primary/20 text-on-surface font-body-md text-body-md px-3 py-2 transition-shadow" id="ciudad" name="ciudad" placeholder="Ciudad" type="text" />
                                    </div>
                                </div>
                            </section>
                            
                            <hr className="border-outline-variant/30" />
                            
                            {/* Section: Información comercial */}
                            <section>
                                <h3 className="font-label-caps text-label-caps uppercase text-secondary mb-4 tracking-wider">Información comercial</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="col-span-1">
                                        <label className="block font-body-sm text-body-sm text-on-surface mb-1.5" htmlFor="categoria">
                                            Categoría
                                        </label>
                                        <div className="relative">
                                            <select className="w-full bg-surface-container-lowest border border-outline-variant/60 rounded focus:border-primary focus:ring-2 focus:ring-primary/20 text-on-surface font-body-md text-body-md px-3 py-2 appearance-none transition-shadow" id="categoria" name="categoria">
                                                <option disabled selected value="">Seleccione una categoría</option>
                                                <option value="electronica">Electrónica</option>
                                                <option value="computacion">Computación</option>
                                                <option value="mobiliario">Mobiliario</option>
                                                <option value="oficina">Oficina</option>
                                                <option value="accesorios">Accesorios</option>
                                                <option value="otros">Otros</option>
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-on-surface-variant">
                                                <span className="material-symbols-outlined text-[20px]">expand_more</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-span-1">
                                        <label className="block font-body-sm text-body-sm text-on-surface mb-1.5" htmlFor="condiciones_pago">
                                            Condiciones de pago
                                        </label>
                                        <div className="relative">
                                            <select className="w-full bg-surface-container-lowest border border-outline-variant/60 rounded focus:border-primary focus:ring-2 focus:ring-primary/20 text-on-surface font-body-md text-body-md px-3 py-2 appearance-none transition-shadow" id="condiciones_pago" name="condiciones_pago">
                                                <option value="contado">Contado</option>
                                                <option value="credito">Crédito</option>
                                                <option value="15_dias">15 días</option>
                                                <option value="30_dias">30 días</option>
                                                <option value="60_dias">60 días</option>
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-on-surface-variant">
                                                <span className="material-symbols-outlined text-[20px]">expand_more</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>
                            
                            <hr className="border-outline-variant/30" />
                            
                            {/* Section: Estado & Observaciones */}
                            <section>
                                <div className="grid grid-cols-1 gap-6">
                                    <div>
                                        <h3 className="font-label-caps text-label-caps uppercase text-secondary mb-3 tracking-wider">Estado</h3>
                                        <div className="flex items-center gap-6">
                                            <label className="flex items-center gap-2 cursor-pointer group">
                                                <input 
                                                    checked={estado === 'activo'}
                                                    onChange={() => setEstado('activo')}
                                                    className="w-4 h-4 text-primary bg-surface border-outline-variant focus:ring-primary" 
                                                    name="estado" 
                                                    type="radio" 
                                                    value="activo" 
                                                />
                                                <span className="font-body-sm text-body-sm text-on-surface-variant group-hover:text-on-surface transition-colors">Activo</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer group">
                                                <input 
                                                    checked={estado === 'inactivo'}
                                                    onChange={() => setEstado('inactivo')}
                                                    className="w-4 h-4 text-primary bg-surface border-outline-variant focus:ring-primary" 
                                                    name="estado" 
                                                    type="radio" 
                                                    value="inactivo" 
                                                />
                                                <span className="font-body-sm text-body-sm text-on-surface-variant group-hover:text-on-surface transition-colors">Inactivo</span>
                                            </label>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block font-label-caps text-label-caps uppercase text-secondary mb-2 tracking-wider" htmlFor="observaciones">
                                            Observaciones (Opcional)
                                        </label>
                                        <textarea className="w-full bg-surface-container-lowest border border-outline-variant/60 rounded focus:border-primary focus:ring-2 focus:ring-primary/20 text-on-surface font-body-md text-body-md px-3 py-2 transition-shadow resize-none" id="observaciones" name="observaciones" placeholder="Notas adicionales sobre este proveedor..." rows={3}></textarea>
                                    </div>
                                </div>
                            </section>
                        </form>
                    </div>
                    
                    {/* Modal Footer / Actions */}
                    <div className="flex items-center justify-end gap-3 px-6 py-4 bg-surface-container-lowest border-t border-outline-variant/30 shrink-0">
                        <button 
                            onClick={onClose}
                            className="px-4 py-2 bg-surface-container-lowest border border-outline-variant/60 text-on-surface font-body-md text-body-md font-medium rounded hover:bg-surface-container-low transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20" 
                            type="button"
                        >
                            Cancelar
                        </button>
                        <button className="px-4 py-2 bg-primary hover:bg-primary/90 text-on-primary font-body-md text-body-md font-medium rounded shadow-sm transition-colors">
                            Guardar proveedor
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};
