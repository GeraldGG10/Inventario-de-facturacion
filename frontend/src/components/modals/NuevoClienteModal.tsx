import React, { useState } from 'react';
import { api, ApiError } from '../../lib/api';

interface Cliente { id: string; nombre: string; documento: string | null; telefono: string | null; limiteCredito: number | null }

interface Props {
    onClose: () => void;
    onCreado: (cliente: Cliente) => void;
}

export const NuevoClienteModal = ({ onClose, onCreado }: Props) => {
    const [nombre, setNombre] = useState('');
    const [documento, setDocumento] = useState('');
    const [telefono, setTelefono] = useState('');
    const [correo, setCorreo] = useState('');
    const [limiteCredito, setLimiteCredito] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [guardando, setGuardando] = useState(false);

    async function handleGuardar() {
        if (!nombre.trim()) { setError('El nombre es obligatorio'); return; }
        setError(null);
        setGuardando(true);
        try {
            const cliente = await api.post<Cliente>('/clientes', {
                nombre,
                documento: documento || null,
                telefono: telefono || null,
                correo: correo || null,
                limiteCredito: limiteCredito ? Number(limiteCredito) : null,
            });
            onCreado(cliente);
        } catch (err) {
            setError(err instanceof ApiError ? err.message : 'No se pudo guardar el cliente');
        } finally {
            setGuardando(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/50 backdrop-blur-sm p-4">
            <div className="bg-surface-container-lowest w-full max-w-lg rounded-2xl shadow-2xl flex flex-col border border-outline-variant max-h-[90vh]">
                <div className="flex justify-between items-center p-6 border-b border-outline-variant/50">
                    <div>
                        <h2 className="text-[22px] font-bold text-on-surface">Nuevo Cliente</h2>
                        <p className="text-body-sm text-on-surface-variant mt-0.5">Registra un nuevo cliente en el sistema</p>
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
                        <input value={documento} onChange={(e) => setDocumento(e.target.value)} type="text" placeholder="Ej. 130-123456-1" className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg text-body-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-body-sm font-semibold text-on-surface mb-2">Teléfono</label>
                            <input value={telefono} onChange={(e) => setTelefono(e.target.value)} type="tel" placeholder="(809) 555-0123" className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg text-body-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none" />
                        </div>
                        <div>
                            <label className="block text-body-sm font-semibold text-on-surface mb-2">Email</label>
                            <input value={correo} onChange={(e) => setCorreo(e.target.value)} type="email" placeholder="contacto@empresa.com" className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg text-body-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-body-sm font-semibold text-on-surface mb-2">Límite de Crédito</label>
                        <input value={limiteCredito} onChange={(e) => setLimiteCredito(e.target.value)} type="number" placeholder="0.00" className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg text-body-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none font-data-mono" />
                    </div>
                </div>

                <div className="p-6 border-t border-outline-variant/50 flex justify-end gap-3 bg-surface-container/30 rounded-b-2xl">
                    <button onClick={onClose} className="px-5 py-2 rounded-lg text-body-sm font-medium text-secondary hover:bg-surface-variant transition-colors">Cancelar</button>
                    <button onClick={handleGuardar} disabled={guardando} className="px-5 py-2 rounded-lg text-body-sm font-medium bg-primary text-on-primary hover:bg-primary-container transition-colors shadow-sm disabled:opacity-60">
                        {guardando ? 'Guardando…' : 'Guardar Cliente'}
                    </button>
                </div>
            </div>
        </div>
    );
};
