import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Inventario } from './pages/Inventario';
import { MovimientosInventario } from './pages/MovimientosInventario';
import { CategoriasInventario } from './pages/CategoriasInventario';
import { AlertasInventario } from './pages/AlertasInventario';
import { Facturacion } from './pages/Facturacion';
import { Clientes } from './pages/Clientes';
import { Proveedores } from './pages/Proveedores';
import { Reportes } from './pages/Reportes';
import { Configuracion } from './pages/Configuracion';
import { useAuth } from './context/AuthContext';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { usuario, cargando } = useAuth();
  const location = useLocation();

  if (cargando) {
    return <div className="min-h-screen flex items-center justify-center text-on-surface-variant">Cargando…</div>;
  }
  if (!usuario) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return <>{children}</>;
}

const App = () => {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route
                path="*"
                element={
                    <RequireAuth>
                        <Sidebar>
                            <Routes>
                                <Route path="/" element={<Dashboard />} />

                                {/* Rutas de Inventario */}
                                <Route path="/inventario" element={<Inventario />} />
                                <Route path="/inventario/movimientos" element={<MovimientosInventario />} />
                                <Route path="/inventario/categorias" element={<CategoriasInventario />} />
                                <Route path="/inventario/alertas" element={<AlertasInventario />} />

                                <Route path="/facturacion" element={<Facturacion />} />
                                <Route path="/clientes" element={<Clientes />} />
                                <Route path="/proveedores" element={<Proveedores />} />
                                <Route path="/reportes" element={<Reportes />} />
                                <Route path="/configuracion" element={<Configuracion />} />

                                {/* Fallback route */}
                                <Route path="*" element={<Navigate to="/" replace />} />
                            </Routes>
                        </Sidebar>
                    </RequireAuth>
                }
            />
        </Routes>
    );
};

export default App;
