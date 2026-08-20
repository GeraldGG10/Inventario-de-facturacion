import React from 'react';

interface Props {
    onClose: () => void;
}

export const ConfigurarAlertasModal = ({ onClose }: Props) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/50 backdrop-blur-sm p-4">
            <div className="bg-surface-container-lowest w-full max-w-md rounded-2xl shadow-2xl flex flex-col border border-outline-variant max-h-[90vh]">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-outline-variant/50">
                    <div>
                        <h2 className="text-[22px] font-bold text-on-surface flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">settings</span>
                            Configurar Alertas
                        </h2>
                        <p className="text-body-sm text-on-surface-variant mt-0.5">Define los umbrales de alertas automáticas</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full text-on-surface-variant hover:bg-surface-variant/50 transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex flex-col gap-5">
                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
                        <p className="text-body-sm text-on-surface font-medium">Umbral de Stock Bajo</p>
                        <p className="text-xs text-on-surface-variant mt-1 mb-3">Notifica cuando el stock cae por debajo de este porcentaje del mínimo</p>
                        <div className="flex items-center gap-3">
                            <input type="range" min={0} max={100} defaultValue={30} className="flex-1 accent-primary" />
                            <span className="text-body-sm font-data-mono font-bold text-primary w-12 text-right">30%</span>
                        </div>
                    </div>

                    <div className="p-4 bg-error/5 border border-error/20 rounded-xl">
                        <p className="text-body-sm text-on-surface font-medium">Umbral de Stock Crítico</p>
                        <p className="text-xs text-on-surface-variant mt-1 mb-3">Alerta de máxima prioridad cuando el stock llega a este nivel</p>
                        <div className="flex items-center gap-3">
                            <input type="range" min={0} max={50} defaultValue={10} className="flex-1 accent-red-600" />
                            <span className="text-body-sm font-data-mono font-bold text-error w-12 text-right">10%</span>
                        </div>
                    </div>

                    <div>
                        <p className="text-body-sm font-semibold text-on-surface mb-3">Canales de Notificación</p>
                        <div className="flex flex-col gap-3">
                            {[
                                { icon: 'notifications', label: 'Notificaciones en la app', checked: true },
                            ].map((canal) => (
                                <label key={canal.label} className="flex items-center gap-3 cursor-pointer p-3 border border-outline-variant rounded-lg hover:bg-surface-container transition-colors">
                                    <input type="checkbox" defaultChecked={canal.checked} className="w-4 h-4 text-primary rounded border-outline focus:ring-primary" />
                                    <span className="material-symbols-outlined text-secondary text-[20px]">{canal.icon}</span>
                                    <span className="text-body-sm text-on-surface">{canal.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-outline-variant/50 flex justify-end gap-3 bg-surface-container/30 rounded-b-2xl">
                    <button onClick={onClose} className="px-5 py-2 rounded-lg text-body-sm font-medium text-secondary hover:bg-surface-variant transition-colors">Cancelar</button>
                    <button onClick={onClose} className="px-6 py-2 rounded-lg text-body-sm font-medium bg-primary text-on-primary shadow-sm hover:bg-primary-container hover:text-on-primary-container transition-colors">
                        Guardar Configuración
                    </button>
                </div>
            </div>
        </div>
    );
};
