import React, { useState } from 'react';

interface Props {
    onClose: () => void;
}

export const AnularFacturaModal = ({ onClose }: Props) => {
    const [motivo, setMotivo] = useState('otro');

    return (
        <>
            {/* Ambient Shadow Overlay for Modal Background */}
            <div className="fixed inset-0 bg-[#0f172a] bg-opacity-40 backdrop-blur-sm z-50 transition-opacity flex items-center justify-center p-4">

                <div className="bg-surface-container-lowest w-full max-w-2xl rounded-xl shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)] flex flex-col overflow-hidden relative z-50 max-h-[90vh]"
                    role="dialog"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant">
                        <h2 className="font-title-sm text-title-sm text-on-surface" id="modal-title">Anular Factura</h2>
                        <button
                            aria-label="Cerrar modal"
                            onClick={onClose}
                            className="text-on-surface-variant hover:text-on-surface transition-colors p-1 rounded-full hover:bg-surface-container-high focus:outline-none"
                        >
                            <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 0" }}>close</span>
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6 overflow-y-auto flex flex-col gap-6">
                        {/* Invoice Info Section */}
                        <section>
                            <h3 className="font-label-caps text-label-caps text-on-surface-variant mb-2 uppercase tracking-wider">
                                Información de la factura
                            </h3>
                            <div className="bg-surface-container-low border border-outline-variant rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                                <div>
                                    <span className="block font-body-sm text-body-sm text-on-surface-variant">Número</span>
                                    <span className="block font-data-mono text-data-mono text-on-surface">FAC-000125</span>
                                </div>
                                <div>
                                    <span className="block font-body-sm text-body-sm text-on-surface-variant">Cliente</span>
                                    <span className="block font-body-md text-body-md text-on-surface">Juan Pérez</span>
                                </div>
                                <div>
                                    <span className="block font-body-sm text-body-sm text-on-surface-variant">Fecha / Hora</span>
                                    <span className="block font-data-mono text-data-mono text-on-surface">13/08/2026 - 10:32 AM</span>
                                </div>
                                <div>
                                    <span className="block font-body-sm text-body-sm text-on-surface-variant">Total</span>
                                    <span className="block font-data-mono text-data-mono text-on-surface font-semibold text-primary">RD$5,500.00</span>
                                </div>
                                <div className="md:col-span-2">
                                    <span className="block font-body-sm text-body-sm text-on-surface-variant">Usuario Registró</span>
                                    <span className="block font-body-md text-body-md text-on-surface">Carlos Rodríguez</span>
                                </div>
                            </div>
                        </section>

                        {/* Form Section */}
                        <section>
                            <form className="flex flex-col gap-4">
                                <div>
                                    <label className="block font-body-sm text-body-sm text-on-surface mb-2 font-medium" htmlFor="motivo">
                                        Motivo de anulación <span className="text-error">*</span>
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={motivo}
                                            onChange={(e) => setMotivo(e.target.value)}
                                            className="w-full bg-surface-container-lowest border border-outline-variant rounded px-4 py-2 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary appearance-none cursor-pointer"
                                            id="motivo"
                                            name="motivo"
                                        >
                                            <option disabled value="">Seleccione un motivo...</option>
                                            <option value="error">Error en la factura</option>
                                            <option value="producto">Producto incorrecto</option>
                                            <option value="cantidad">Cantidad incorrecta</option>
                                            <option value="precio">Precio incorrecto</option>
                                            <option value="cliente">Cliente incorrecto</option>
                                            <option value="devolucion">Devolución de productos</option>
                                            <option value="cancelada">Venta cancelada</option>
                                            <option value="duplicada">Factura duplicada</option>
                                            <option value="otro">Otro</option>
                                        </select>
                                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
                                    </div>
                                </div>

                                {/* Dynamic Field */}
                                {motivo === 'otro' && (
                                    <div className="flex flex-col gap-2 transition-all duration-300" id="dynamic-field-otro">
                                        <label className="block font-body-sm text-body-sm text-on-surface font-medium" htmlFor="especificacion">
                                            Especifique el motivo <span className="text-error">*</span>
                                        </label>
                                        <textarea
                                            className="w-full bg-surface-container-lowest border border-outline-variant rounded px-4 py-2 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none"
                                            id="especificacion"
                                            name="especificacion"
                                            placeholder="Detalle la razón de la anulación aquí..."
                                            rows={3}
                                        ></textarea>
                                    </div>
                                )}
                            </form>
                        </section>

                        {/* Warning Banner */}
                        <section>
                            <div className="bg-tertiary-container/10 border border-tertiary-container/30 rounded-lg p-4 flex gap-4 items-start">
                                <span className="material-symbols-outlined text-tertiary-container mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                                <div>
                                    <p className="font-body-sm text-body-sm text-on-surface">
                                        <strong className="text-tertiary-container font-semibold">Atención:</strong> Esta acción no puede deshacerse. La factura será marcada como anulada y permanecerá registrada en el historial. Los productos asociados serán devueltos al inventario automáticamente.
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Footer Actions */}
                    <div className="bg-surface px-6 py-4 border-t border-outline-variant flex justify-end gap-3 rounded-b-xl shrink-0">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 rounded font-label-caps text-label-caps bg-transparent border border-outline-variant text-on-surface hover:bg-surface-container-high transition-colors"
                            type="button"
                        >
                            Cancelar
                        </button>
                        <button
                            className="px-4 py-2 rounded font-label-caps text-label-caps bg-error text-on-error hover:bg-on-error-container transition-colors shadow-sm flex items-center gap-2"
                            type="button"
                        >
                            <span className="material-symbols-outlined text-[18px]">delete_forever</span>
                            Confirmar anulación
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};
