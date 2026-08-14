import React, { useState } from 'react';

interface Props {
    onClose: () => void;
    clienteNombre?: string;
}

export const ClienteModal = ({ onClose, clienteNombre = 'Acme Corp' }: Props) => {
    const [tab, setTab] = useState<'info' | 'historial'>('info');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/40 backdrop-blur-sm p-4">
            <div className="bg-surface-container-lowest w-full max-w-lg rounded-2xl shadow-2xl flex flex-col border border-outline-variant max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-primary font-bold text-sm">
                            {clienteNombre.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                            <h2 className="font-title-sm text-title-sm text-on-surface">{clienteNombre}</h2>
                            <p className="font-body-sm text-body-sm text-on-surface-variant">Cliente activo</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-surface-container-high transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                {/* Tabs */}
                <div className="flex gap-0 px-6 pt-4 border-b border-outline-variant">
                    {(['info', 'historial'] as const).map(t => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`px-4 py-2 font-body-sm text-body-sm capitalize border-b-2 transition-colors ${tab === t ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}
                        >
                            {t === 'info' ? 'Información' : 'Historial'}
                        </button>
                    ))}
                </div>
                {/* Body */}
                <div className="p-6 overflow-y-auto flex-1">
                    {tab === 'info' ? (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">Documento</label>
                                    <p className="font-data-mono text-data-mono text-on-surface">DOC-8472</p>
                                </div>
                                <div>
                                    <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">Teléfono</label>
                                    <p className="font-data-mono text-data-mono text-on-surface">+1 555-0198</p>
                                </div>
                                <div>
                                    <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">Email</label>
                                    <p className="font-body-sm text-body-sm text-on-surface">contacto@acmecorp.com</p>
                                </div>
                                <div>
                                    <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">Crédito disponible</label>
                                    <p className="font-data-mono text-data-mono text-primary">$48,000.00</p>
                                </div>
                                <div className="col-span-2">
                                    <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">Dirección</label>
                                    <p className="font-body-sm text-body-sm text-on-surface">Av. Principal 123, Santo Domingo</p>
                                </div>
                            </div>
                            <div className="bg-surface-container rounded-lg p-4 flex justify-between items-center">
                                <span className="font-label-caps text-label-caps text-on-surface-variant">Total en compras</span>
                                <span className="font-data-mono text-data-mono text-on-surface font-bold">$12,450.00</span>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {[
                                { id: 'FAC-2023-10-A', monto: '$1,200.00', fecha: '12 Oct 2023', estado: 'Pagada' },
                                { id: 'FAC-2023-08-B', monto: '$3,450.00', fecha: '28 Ago 2023', estado: 'Pagada' },
                                { id: 'FAC-2023-06-C', monto: '$780.00', fecha: '14 Jun 2023', estado: 'Pagada' },
                            ].map(f => (
                                <div key={f.id} className="flex items-center justify-between p-3 rounded-lg border border-outline-variant bg-surface-container-lowest hover:bg-surface-container transition-colors">
                                    <div>
                                        <p className="font-data-mono text-data-mono text-primary">{f.id}</p>
                                        <p className="font-body-sm text-body-sm text-on-surface-variant">{f.fecha}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-data-mono text-data-mono text-on-surface">{f.monto}</p>
                                        <span className="inline-block px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-[10px] font-semibold">{f.estado}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                {/* Footer */}
                <div className="p-4 border-t border-outline-variant flex justify-end gap-3 bg-surface-container/30 rounded-b-2xl">
                    <button onClick={onClose} className="px-5 py-2 rounded-lg text-body-sm font-medium text-secondary hover:bg-surface-variant transition-colors">
                        Cerrar
                    </button>
                    <button className="px-5 py-2 rounded-lg text-body-sm font-medium bg-primary text-on-primary hover:bg-primary/90 transition-colors">
                        Editar Cliente
                    </button>
                </div>
            </div>
        </div>
    );
};
