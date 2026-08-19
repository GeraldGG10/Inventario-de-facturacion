import React, { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../lib/api';

export const Login = () => {
  const { usuario, cargando, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  if (!cargando && usuario) {
    const destino = (location.state as { from?: string })?.from ?? '/';
    return <Navigate to={destino} replace />;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      await login(email, password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo iniciar sesión');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background dark:bg-inverse-surface px-4">
      <div className="w-full max-w-sm bg-surface dark:bg-background border border-outline-variant dark:border-outline/30 rounded-2xl shadow-lg p-8">
        <h1 className="font-display-lg text-display-lg font-bold text-primary dark:text-primary-fixed text-center mb-1">Stockly</h1>
        <p className="text-body-sm text-on-surface-variant text-center mb-6">Sistema de Inventario y Facturación</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-body-sm font-medium text-on-surface" htmlFor="email">Correo</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-outline-variant px-3 py-2 text-body-md bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="admin@facturacion.local"
              autoFocus
            />
          </div>
          <div>
            <label className="text-body-sm font-medium text-on-surface" htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-outline-variant px-3 py-2 text-body-md bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-body-sm text-error">{error}</p>}

          <button
            type="submit"
            disabled={enviando}
            className="mt-2 w-full rounded-lg bg-primary text-on-primary font-semibold py-2.5 disabled:opacity-60"
          >
            {enviando ? 'Ingresando…' : 'Iniciar sesión'}
          </button>
        </form>
      </div>
    </div>
  );
};
