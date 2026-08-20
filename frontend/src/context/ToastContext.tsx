import React, { createContext, useCallback, useContext, useState } from 'react';

type ToastTipo = 'success' | 'error' | 'info';
interface ToastItem { id: number; tipo: ToastTipo; mensaje: string }

interface ToastContextValue {
    mostrarToast: (mensaje: string, tipo?: ToastTipo) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

let idCounter = 0;

const ICONO: Record<ToastTipo, string> = { success: 'check_circle', error: 'error', info: 'info' };
const COLOR: Record<ToastTipo, string> = {
    success: 'bg-on-surface text-inverse-on-surface',
    error: 'bg-error text-on-error',
    info: 'bg-secondary text-on-secondary',
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const mostrarToast = useCallback((mensaje: string, tipo: ToastTipo = 'success') => {
        const id = ++idCounter;
        setToasts((prev) => [...prev, { id, tipo, mensaje }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3500);
    }, []);

    return (
        <ToastContext.Provider value={{ mostrarToast }}>
            {children}
            <div className="fixed bottom-5 right-5 z-[200] flex flex-col gap-2 pointer-events-none max-w-sm">
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        className={`pointer-events-auto flex items-start gap-2 px-4 py-3 rounded-lg shadow-md text-body-sm font-body-sm ${COLOR[t.tipo]}`}
                    >
                        <span className="material-symbols-outlined text-[18px] shrink-0">{ICONO[t.tipo]}</span>
                        <span>{t.mensaje}</span>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast debe usarse dentro de ToastProvider');
    return ctx;
}
