import React, { useEffect, useState } from 'react';
import { api, ApiError } from '../../lib/api';
import { useToast } from '../../context/ToastContext';

interface Props {
    onClose: () => void;
    onCreado: () => void;
}

export const NuevoUsuarioModal = ({ onClose, onCreado }: Props) => {
    const [nombre, setNombre] = useState('');
    const [nombreUsuario, setNombreUsuario] = useState('');
    const [email, setEmail] = useState('');
    const [rolId, setRolId] = useState('');
    const [password, setPassword] = useState('');
    const [roles, setRoles] = useState<{ id: string; nombre: string }[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [guardando, setGuardando] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { mostrarToast } = useToast();

    useEffect(() => { api.get('/roles').then(setRoles).catch(() => { }); }, []);

    async function handleCrear() {
        if (!nombre || !nombreUsuario || !email || !rolId || password.length < 8) {
            setError('Completa todos los campos; la contraseña debe tener al menos 8 caracteres');
            return;
        }
        setError(null);
        setGuardando(true);
        try {
            await api.post('/usuarios', { nombre, nombreUsuario, email, rolId, password });
            mostrarToast('Usuario creado correctamente', 'success');
            onCreado();
        } catch (err) {
            mostrarToast(err instanceof ApiError ? err.message : 'No se pudo crear el usuario', 'error');
            setError(err instanceof ApiError ? err.message : 'No se pudo crear el usuario');
        } finally {
            setGuardando(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/50 backdrop-blur-sm p-4">
            <div className="bg-surface-container-lowest w-full max-w-md rounded-2xl shadow-2xl flex flex-col border border-outline-variant max-h-[90vh]">
                <div className="flex justify-between items-center p-6 border-b border-outline-variant/50">
                    <div>
                        <h2 className="text-[22px] font-bold text-on-surface">Nuevo Usuario</h2>
                        <p className="text-body-sm text-on-surface-variant mt-0.5">Crea una cuenta de acceso al sistema</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full text-on-surface-variant hover:bg-surface-variant/50 transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar flex flex-col gap-5">
                    {error && <div className="p-3 rounded-lg bg-error/10 text-error text-body-sm">{error}</div>}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-body-sm font-semibold text-on-surface mb-2">Nombre Completo <span className="text-error">*</span></label>
                            <input value={nombre} onChange={(e) => setNombre(e.target.value)} type="text" placeholder="Ej. María García" className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-lg text-body-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none" />
                        </div>
                        <div>
                            <label className="block text-body-sm font-semibold text-on-surface mb-2">Nombre de usuario <span className="text-error">*</span></label>
                            <input value={nombreUsuario} onChange={(e) => setNombreUsuario(e.target.value)} type="text" placeholder="Ej. m.garcia" className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-lg text-body-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-body-sm font-semibold text-on-surface mb-2">Correo Electrónico <span className="text-error">*</span></label>
                        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="usuario@empresa.com" className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-lg text-body-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none" />
                    </div>
                    <div>
                        <label className="block text-body-sm font-semibold text-on-surface mb-2">Rol <span className="text-error">*</span></label>
                        <select value={rolId} onChange={(e) => setRolId(e.target.value)} className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-lg text-body-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all">
                            <option value="">Seleccionar rol...</option>
                            {roles.map((r) => <option key={r.id} value={r.id} className="capitalize">{r.nombre}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-body-sm font-semibold text-on-surface mb-2">Contraseña temporal <span className="text-error">*</span></label>
                        <div className="relative">
                            <input value={password} onChange={(e) => setPassword(e.target.value)} type={showPassword ? 'text' : 'password'} placeholder="Mínimo 8 caracteres" className="w-full px-4 py-2.5 pr-11 bg-surface border border-outline-variant rounded-lg text-body-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none" />
                            <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors" tabIndex={-1}>
                                <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-outline-variant/50 flex justify-end gap-3 bg-surface-container/30 rounded-b-2xl">
                    <button onClick={onClose} className="px-5 py-2 rounded-lg text-body-sm font-medium text-secondary hover:bg-surface-variant transition-colors">Cancelar</button>
                    <button onClick={handleCrear} disabled={guardando} className="px-6 py-2 rounded-lg text-body-sm font-medium bg-primary text-on-primary shadow-sm hover:bg-primary-container hover:text-on-primary-container transition-colors disabled:opacity-60">
                        {guardando ? 'Creando…' : 'Crear Usuario'}
                    </button>
                </div>
            </div>
        </div>
    );
};
