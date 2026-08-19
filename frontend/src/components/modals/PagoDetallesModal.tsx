import React, { useState, useEffect } from 'react';

interface Props {
    metodoPago: string;
    totalFactura: number;
    onClose: () => void;
    onConfirm: (detalles: { referenciaTransferencia?: string; montoEfectivo?: number; montoTransferencia?: number }) => void;
}

export const PagoDetallesModal = ({ metodoPago, totalFactura, onClose, onConfirm }: Props) => {
    const [referencia, setReferencia] = useState('');
    const [montoEfectivo, setMontoEfectivo] = useState(0);
    const [montoTransferencia, setMontoTransferencia] = useState(totalFactura);

    useEffect(() => {
        if (metodoPago === 'mixto') {
            setMontoTransferencia(Math.max(0, totalFactura - montoEfectivo));
        }
    }, [montoEfectivo, totalFactura, metodoPago]);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        
        if (metodoPago === 'transferencia' || metodoPago === 'mixto') {
            if (!referencia.trim()) {
                alert('El número de referencia es obligatorio para transferencias.');
                return;
            }
        }

        if (metodoPago === 'mixto' && (montoEfectivo + montoTransferencia !== totalFactura)) {
            alert('La suma del efectivo y transferencia debe ser igual al total de la factura.');
            return;
        }

        onConfirm({
            referenciaTransferencia: (metodoPago === 'transferencia' || metodoPago === 'mixto') ? referencia : undefined,
            montoEfectivo: metodoPago === 'mixto' ? montoEfectivo : undefined,
            montoTransferencia: metodoPago === 'mixto' ? montoTransferencia : undefined,
        });
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/40 backdrop-blur-sm p-4">
            <div className="bg-surface-container-lowest w-full max-w-md rounded-2xl shadow-2xl flex flex-col border border-outline-variant">
                <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant">
                    <h2 className="font-title-sm text-title-sm text-on-surface">Detalles de Pago</h2>
                    <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface p-1 rounded-full"><span className="material-symbols-outlined">close</span></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
                    {metodoPago === 'mixto' && (
                        <>
                            <div>
                                <label className="block text-body-sm font-medium text-on-surface-variant mb-1">Monto en Efectivo</label>
                                <input
                                    type="number" step="0.01" min="0" required max={totalFactura}
                                    className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg"
                                    value={montoEfectivo || ''}
                                    onChange={(e) => setMontoEfectivo(Number(e.target.value))}
                                />
                            </div>
                            <div>
                                <label className="block text-body-sm font-medium text-on-surface-variant mb-1">Monto en Transferencia (Restante)</label>
                                <input
                                    type="number" step="0.01" readOnly disabled
                                    className="w-full px-3 py-2 bg-surface-container border border-outline-variant rounded-lg text-on-surface-variant font-medium"
                                    value={montoTransferencia}
                                />
                            </div>
                        </>
                    )}

                    {(metodoPago === 'transferencia' || metodoPago === 'mixto') && (
                        <div>
                            <label className="block text-body-sm font-medium text-on-surface-variant mb-1">Número de Referencia (Banco)</label>
                            <input
                                type="text" inputMode="numeric" required placeholder="Ej: 12345678"
                                className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg"
                                value={referencia}
                                onChange={(e) => setReferencia(e.target.value.replace(/\D/g, ''))}
                            />
                        </div>
                    )}
                    
                    <div className="flex justify-end gap-3 mt-4">
                        <button type="button" onClick={onClose} className="px-5 py-2 text-secondary font-medium">Cancelar</button>
                        <button type="submit" className="px-5 py-2 bg-primary text-on-primary rounded-lg font-medium">Confirmar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
