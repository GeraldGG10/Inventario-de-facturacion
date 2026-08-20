import React, { useState } from 'react';
import { api, ApiError } from '../../lib/api';

interface Cliente {
    id: string;
    nombre: string;
    documento: string | null;
    telefono: string | null;
    correo?: string | null;
    direccion?: string | null;
    limiteCredito?: number | null;
}

interface Props {
    cliente: Cliente;
    onClose: () => void;
    onEditado: () => void;
}

export const EditarClienteModal = ({ cliente, onClose, onEditado }: Props) => {
    const [nombre, setNombre] = useState(cliente.nombre);
    const [documento, setDocumento] = useState(cliente.documento || '');
    const [telefono, setTelefono] = useState(cliente.telefono || '');
    const [correo, setCorreo] = useState(cliente.correo || '');
    const [direccion, setDireccion] = useState(cliente.direccion || '');
    const [limiteCredito, setLimiteCredito] = useState(cliente.limiteCredito !== null && cliente.limiteCredito !== undefined ? String(cliente.limiteCredito) : '');
    const [error, setError] = useState<string | null>(null);
    const [guardando, setGuardando] = useState(false);

    async function handleGuardar() {
        if (!nombre.trim()) { setError('El nombre es obligatorio'); return; }
        setError(null);
        setGuardando(true);
        try {
            await api.patch(`/clientes/${cliente.id}`, {
                nombre,
                documento: documento || null,
                telefono: telefono || null,
                correo: correo || null,
                direccion: direccion || null,
                limiteCredito: limiteCredito ? Number(limiteCredito) : null,
            });
            onEditado();
        } catch (err) {
            setError(err instanceof ApiError ? err.message : 'No se pudo actualizar el cliente');
        } finally {
            setGuardando(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/50 backdrop-blur-sm p-4">
            <div className="bg-surface-container-lowest w-full max-w-lg rounded-2xl shadow-2xl flex flex-col border border-outline-variant max-h-[90vh]">
                <div className="flex justify-between items-center p-6 border-b border-outline-variant/50">
                    <div>
                        <h2 className="text-[22px] font-bold text-on-surface">Editar Cliente</h2>
                        <p className="text-body-sm text-on-surface-variant mt-0.5">Modifica los datos del cliente</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full text-on-surface-variant hover:bg-surface-variant/50 transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="p-6 flex flex-col gap-4 overflow-y-auto max-h-[60vh] custom-scrollbar">
                    {error && <div className="p-3 rounded-lg bg-error/10 text-error text-body-sm">{error}</div>}
                    <div>
                        <label className="block text-body-sm font-semibold text-on-surface mb-2">Nombre o Razón Social <span className="text-error">*</span></label>
                        <input value={nombre} onChange={(e) => setNombre(e.target.value)} type="text" placeholder="Ej. Acme Corp" className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg text-body-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none" />
                    </div>
                    <div>
                        <label className="block text-body-sm font-semibold text-on-surface mb-2">RNC / Cédula</label>
                        <input value={documento} onChange={(e) => setDocumento(e.target.value.replace(/[^0-9]/g, ''))} maxLength={11} type="text" placeholder="Ej. 1301234561" className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg text-body-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-body-sm font-semibold text-on-surface mb-2">Teléfono</label>
                            <input value={telefono} onChange={(e) => setTelefono(e.target.value.replace(/[^0-9]/g, ''))} maxLength={10} type="tel" placeholder="Ej. 8095550123" className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg text-body-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none" />
                        </div>
                        <div>
                            <label className="block text-body-sm font-semibold text-on-surface mb-2">Email</label>
                            <input value={correo} onChange={(e) => setCorreo(e.target.value)} type="email" placeholder="contacto@empresa.com" className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg text-body-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-body-sm font-semibold text-on-surface mb-2">Dirección</label>
                        <input value={direccion} onChange={(e) => setDireccion(e.target.value)} type="text" placeholder="Ej. Av. Winston Churchill #123, Santo Domingo" className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg text-body-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none" />
                    </div>
                    <div>
                        <label className="block text-body-sm font-semibold text-on-surface mb-2">Límite de Crédito</label>
                        <input value={limiteCredito} onChange={(e) => setLimiteCredito(e.target.value.replace(/[^0-9.]/g, ''))} type="text" placeholder="0.00" className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg text-body-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none font-data-mono" />
                    </div>
                </div>

                <div className="p-6 border-t border-outline-variant/50 flex justify-end gap-3 bg-surface-container/30 rounded-b-2xl">
                    <button onClick={onClose} className="px-5 py-2 rounded-lg text-body-sm font-medium text-secondary hover:bg-surface-variant transition-colors">Cancelar</button>
                    <button onClick={handleGuardar} disabled={guardando} className="px-5 py-2 rounded-lg text-body-sm font-medium bg-primary text-on-primary hover:bg-primary-container transition-colors shadow-sm disabled:opacity-60">
                        {guardando ? 'Guardando…' : 'Guardar Cambios'}
                    </button>
                </div>
            </div>
        </div>
    );
};
