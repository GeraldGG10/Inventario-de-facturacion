import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, clearTokens, getAccessToken, setTokens } from '../lib/api';

interface Usuario {
  id: string;
  nombre: string;
  nombreUsuario: string;
  email: string;
  rol: string;
  permisos: string[];
}

interface AuthContextValue {
  usuario: Usuario | null;
  cargando: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  tienePermiso: (permiso: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!getAccessToken()) {
      setCargando(false);
      return;
    }
    api
      .get<Usuario>('/auth/me')
      .then(setUsuario)
      .catch(() => clearTokens())
      .finally(() => setCargando(false));
  }, []);

  async function login(email: string, password: string) {
    const data = await api.post<{ accessToken: string; refreshToken: string; usuario: Usuario }>('/auth/login', { email, password });
    setTokens(data.accessToken, data.refreshToken);
    setUsuario(data.usuario);
  }

  function logout() {
    clearTokens();
    setUsuario(null);
  }

  function tienePermiso(permiso: string) {
    return usuario?.permisos.includes(permiso) ?? false;
  }

  return <AuthContext.Provider value={{ usuario, cargando, login, logout, tienePermiso }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
