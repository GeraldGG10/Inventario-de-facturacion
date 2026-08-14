import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';
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

const App = () => {
    return (
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
    );
};

export default App;
