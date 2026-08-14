import React from 'react';

interface Props {
    onClose: () => void;
}

export const NuevoUsuarioModal = ({ onClose }: Props) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/50 backdrop-blur-sm p-4">
            <div className="bg-surface-container-lowest w-full max-w-md rounded-2xl shadow-2xl flex flex-col border border-outline-variant max-h-[90vh]">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-outline-variant/50">
                    <div>
                        <h2 className="text-[22px] font-bold text-on-surface">Nuevo Usuario</h2>
                        <p className="text-body-sm text-on-surface-variant mt-0.5">Crea una cuenta de acceso al sistema</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full text-on-surface-variant hover:bg-surface-variant/50 transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex flex-col gap-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-body-sm font-semibold text-on-surface mb-2">Nombre Completo <span className="text-error">*</span></label>
                            <input type="text" placeholder="Ej. María García" className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-lg text-body-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none" />
                        </div>
                        <div>
                            <label className="block text-body-sm font-semibold text-on-surface mb-2">Nombre de usuario <span className="text-error">*</span></label>
                            <input type="text" placeholder="Ej. m.garcia" className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-lg text-body-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-body-sm font-semibold text-on-surface mb-2">Correo Electrónico <span className="text-error">*</span></label>
                        <input type="email" placeholder="usuario@empresa.com" className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-lg text-body-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none" />
                    </div>
                    <div>
                        <label className="block text-body-sm font-semibold text-on-surface mb-2">Rol / Permiso <span className="text-error">*</span></label>
                        <select className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-lg text-body-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all">
                            <option value="">Seleccionar rol...</option>
                            <option value="admin">Administrador (Acceso total)</option>
                            <option value="cajero">Cajero (Ventas y facturas)</option>
                            <option value="almacenista">Almacenista (Inventario)</option>
                            <option value="reportes">Solo Reportes (Lectura)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-body-sm font-semibold text-on-surface mb-2">Contraseña temporal <span className="text-error">*</span></label>
                        <input type="password" placeholder="El usuario deberá cambiarla en el primer inicio" className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-lg text-body-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none" />
                    </div>
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" defaultChecked className="w-4 h-4 text-primary rounded border-outline focus:ring-primary" />
                        <span className="text-body-sm text-on-surface">Enviar correo de bienvenida con credenciales</span>
                    </label>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-outline-variant/50 flex justify-end gap-3 bg-surface-container/30 rounded-b-2xl">
                    <button onClick={onClose} className="px-5 py-2 rounded-lg text-body-sm font-medium text-secondary hover:bg-surface-variant transition-colors">Cancelar</button>
                    <button onClick={onClose} className="px-6 py-2 rounded-lg text-body-sm font-medium bg-primary text-on-primary shadow-sm hover:bg-primary-container hover:text-on-primary-container transition-colors">
                        Crear Usuario
                    </button>
                </div>
            </div>
        </div>
    );
};
