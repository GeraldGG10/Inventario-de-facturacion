import React, { useState, useEffect, useCallback } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { tiempoRelativo } from '../../lib/formatters';

interface Notificacion {
    id: string;
    tipo: 'stock_bajo' | 'agotado' | 'venta';
    titulo: string;
    descripcion: string;
    fecha: string;
    ruta: string;
}

export const Sidebar = ({ children }: { children: React.ReactNode }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
    const [marcandoLeidas, setMarcandoLeidas] = useState(false);
    const { usuario, logout } = useAuth();
    const navigate = useNavigate();

    const cargarNotificaciones = useCallback(async () => {
        try {
            const [alertasData, facturasData] = await Promise.all([
                api.get('/alertas', { estado: 'pendiente' }).catch(() => []),
                api.get('/facturas', { pageSize: 3 }).catch(() => ({ facturas: [] })),
            ]);

            const notifs: Notificacion[] = [];

            // Alertas de inventario
            for (const a of (alertasData as any[]).slice(0, 5)) {
                notifs.push({
                    id: a.id,
                    tipo: a.estadoAlerta === 'agotado' ? 'agotado' : 'stock_bajo',
                    titulo: a.estadoAlerta === 'agotado' ? 'Stock Agotado' : 'Stock Bajo',
                    descripcion: `${a.nombre} — Stock actual: ${a.stockActual} (mín: ${a.stockMinimo})`,
                    fecha: a.fechaGenerada,
                    ruta: '/alertas',
                });
            }

            // Ventas recientes
            for (const f of ((facturasData as any).facturas ?? []).slice(0, 3)) {
                notifs.push({
                    id: `factura-${f.id}`,
                    tipo: 'venta',
                    titulo: 'Nueva Venta Registrada',
                    descripcion: `Factura ${f.numero} — ${f.cliente.nombre}`,
                    fecha: f.fecha,
                    ruta: '/facturacion',
                });
            }

            // Ordenar por fecha más reciente
            notifs.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
            setNotificaciones(notifs);
        } catch {
            // Silenciar errores
        }
    }, []);

    useEffect(() => {
        cargarNotificaciones();
        const interval = setInterval(cargarNotificaciones, 60000); // Actualizar cada 60s
        return () => clearInterval(interval);
    }, [cargarNotificaciones]);

    async function marcarTodasLeidas() {
        setMarcandoLeidas(true);
        try {
            const alertas = notificaciones.filter(n => n.tipo !== 'venta');
            await Promise.all(alertas.map(a => api.post(`/alertas/${a.id}/atender`).catch(() => {})));
            await cargarNotificaciones();
            setIsNotificationsOpen(false);
        } finally {
            setMarcandoLeidas(false);
        }
    }

    const iniciales = usuario?.nombre
        ? usuario.nombre.split(' ').slice(0, 2).map((p) => p[0]?.toUpperCase()).join('')
        : '?';

    function handleLogout() {
        logout();
        navigate('/login');
    }

    const toggleSidebar = () => setIsOpen(!isOpen);

    const getNavLinkClass = ({ isActive }: { isActive: boolean }) => {
        const baseClass = "flex items-center gap-4 px-4 py-3 rounded-lg cursor-pointer active:scale-95 duration-150 group transition-all ";
        if (isActive) {
            return baseClass + "text-primary dark:text-primary-fixed border-r-4 border-primary dark:border-primary-fixed bg-secondary-container/30 font-semibold";
        }
        return baseClass + "text-secondary dark:text-secondary-fixed-dim hover:bg-surface-container-high dark:hover:bg-on-secondary-fixed-variant border-r-4 border-transparent font-medium";
    };

    const getIconClass = ({ isActive }: { isActive: boolean }) => {
        const baseClass = "material-symbols-outlined transition-colors ";
        if (isActive) {
            return baseClass + "text-primary dark:text-primary-fixed";
        }
        return baseClass + "group-hover:text-primary dark:group-hover:text-primary-fixed";
    };

    return (
        <div className="font-body-md text-body-md text-on-surface dark:text-inverse-on-surface antialiased flex h-full min-h-screen">
            {/* NavigationDrawer */}
            <aside 
                className={`bg-surface dark:bg-background w-[260px] h-screen fixed left-0 top-0 border-r border-outline-variant dark:border-outline z-50 flex flex-col transition-all duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} xl:translate-x-0`} 
                id="sidebar"
            >
                <div className="px-6 h-[64px] flex items-center shrink-0 border-b border-outline-variant dark:border-outline/30">
                    <h1 className="font-display-lg text-display-lg font-bold text-primary dark:text-primary-fixed truncate">Tecno-laser</h1>
                    <button 
                        className="xl:hidden ml-auto text-on-surface-variant p-2 rounded-lg hover:bg-surface-container-high transition-colors" 
                        onClick={toggleSidebar}
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                
                <nav className="flex flex-col gap-2 py-6 px-4 flex-1 overflow-y-auto">
                    {/* Dashboard: Visible para todos (admin, cajero, almacenista, reportes) */}
                    <NavLink to="/" className={getNavLinkClass} onClick={() => window.innerWidth < 1280 && setIsOpen(false)}>
                        {(props) => (
                            <>
                                <span className={getIconClass(props)} style={props.isActive ? {fontVariationSettings: "'FILL' 1"} : {}}>dashboard</span>
                                <span>Dashboard</span>
                            </>
                        )}
                    </NavLink>
                    
                    {/* Inventario: Visible para admin, cajero, almacenista */}
                    {['administrador', 'cajero', 'almacenista'].includes(usuario?.rol || '') && (
                        <NavLink to="/inventario" className={getNavLinkClass} onClick={() => window.innerWidth < 1280 && setIsOpen(false)}>
                            {(props) => (
                                <>
                                    <span className={getIconClass(props)} style={props.isActive ? {fontVariationSettings: "'FILL' 1"} : {}}>inventory_2</span>
                                    <span>Inventario</span>
                                </>
                            )}
                        </NavLink>
                    )}
                    
                    {/* Facturación: Visible para admin, cajero */}
                    {['administrador', 'cajero'].includes(usuario?.rol || '') && (
                        <NavLink to="/facturacion" className={getNavLinkClass} onClick={() => window.innerWidth < 1280 && setIsOpen(false)}>
                            {(props) => (
                                <>
                                    <span className={getIconClass(props)} style={props.isActive ? {fontVariationSettings: "'FILL' 1"} : {}}>receipt_long</span>
                                    <span>Facturación</span>
                                </>
                            )}
                        </NavLink>
                    )}
                    
                    {/* Clientes: Visible para admin, cajero */}
                    {['administrador', 'cajero'].includes(usuario?.rol || '') && (
                        <NavLink to="/clientes" className={getNavLinkClass} onClick={() => window.innerWidth < 1280 && setIsOpen(false)}>
                            {(props) => (
                                <>
                                    <span className={getIconClass(props)} style={props.isActive ? {fontVariationSettings: "'FILL' 1"} : {}}>group</span>
                                    <span>Clientes</span>
                                </>
                            )}
                        </NavLink>
                    )}
                    
                    {/* Proveedores: Visible para admin, almacenista */}
                    {['administrador', 'almacenista'].includes(usuario?.rol || '') && (
                        <NavLink to="/proveedores" className={getNavLinkClass} onClick={() => window.innerWidth < 1280 && setIsOpen(false)}>
                            {(props) => (
                                <>
                                    <span className={getIconClass(props)} style={props.isActive ? {fontVariationSettings: "'FILL' 1"} : {}}>local_shipping</span>
                                    <span>Proveedores</span>
                                </>
                            )}
                        </NavLink>
                    )}
                    
                    {/* Reportes: Visible para todos (admin, cajero, almacenista, reportes) */}
                    <NavLink to="/reportes" className={getNavLinkClass} onClick={() => window.innerWidth < 1280 && setIsOpen(false)}>
                        {(props) => (
                            <>
                                <span className={getIconClass(props)} style={props.isActive ? {fontVariationSettings: "'FILL' 1"} : {}}>analytics</span>
                                <span>Reportes</span>
                            </>
                        )}
                    </NavLink>
                    
                    {/* Configuración: Solo para admin */}
                    {['administrador'].includes(usuario?.rol || '') && (
                        <NavLink to="/configuracion" className={getNavLinkClass} onClick={() => window.innerWidth < 1280 && setIsOpen(false)}>
                            {(props) => (
                                <>
                                    <span className={getIconClass(props)} style={props.isActive ? {fontVariationSettings: "'FILL' 1"} : {}}>settings</span>
                                    <span>Configuración</span>
                                </>
                            )}
                        </NavLink>
                    )}
                </nav>
            </aside>

            {/* Overlay for mobile sidebar */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-surface-container-lowest/80 dark:bg-inverse-surface/80 backdrop-blur-sm z-40 xl:hidden transition-opacity opacity-100" 
                    onClick={toggleSidebar}
                ></div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col xl:ml-[260px] min-h-screen min-w-0">
                {/* TopAppBar */}
                <header className="bg-surface dark:bg-background h-[64px] sticky top-0 z-30 shadow-sm border-b border-outline-variant dark:border-outline flex justify-between items-center px-6 w-full transition-all duration-200 ease-in-out">
                    <div className="flex items-center gap-4">
                        <button 
                            className="xl:hidden p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high dark:hover:bg-surface-container-highest transition-colors" 
                            onClick={toggleSidebar}
                        >
                            <span className="material-symbols-outlined">menu</span>
                        </button>
                        <h2 className="font-title-sm text-title-sm font-semibold text-on-surface dark:text-inverse-on-surface">Panel de Control</h2>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div 
                                className="relative cursor-pointer"
                                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                            >
                                <span className={`material-symbols-outlined p-2 rounded-full transition-colors ${isNotificationsOpen ? 'bg-surface-container text-primary' : 'text-secondary hover:bg-surface-container dark:hover:bg-surface-container-highest'}`}>notifications</span>
                                {notificaciones.length > 0 && (
                                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-error rounded-full border-2 border-surface dark:border-background"></span>
                                )}
                            </div>

                            {/* Dropdown de Notificaciones */}
                            {isNotificationsOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)}></div>
                                    <div className="absolute right-0 mt-2 w-80 bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline/30 rounded-xl shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="p-4 border-b border-outline-variant/50 flex justify-between items-center">
                                            <h3 className="font-title-sm text-[16px] font-semibold text-on-surface dark:text-inverse-on-surface">Notificaciones</h3>
                                            {notificaciones.length > 0 && (
                                                <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">{notificaciones.length} {notificaciones.length === 1 ? 'Nueva' : 'Nuevas'}</span>
                                            )}
                                        </div>
                                        <div className="max-h-[320px] overflow-y-auto custom-scrollbar flex flex-col">
                                            {notificaciones.length === 0 && (
                                                <div className="p-8 text-center text-on-surface-variant">
                                                    <span className="material-symbols-outlined text-[40px] opacity-40 block mb-2">notifications_off</span>
                                                    <p className="text-body-sm">Sin notificaciones nuevas</p>
                                                </div>
                                            )}
                                            {notificaciones.map((n, idx) => (
                                                <div
                                                    key={n.id}
                                                    onClick={() => { setIsNotificationsOpen(false); navigate(n.ruta); }}
                                                    className={`p-4 hover:bg-surface-container transition-colors cursor-pointer flex gap-3 ${idx < notificaciones.length - 1 ? 'border-b border-outline-variant/30' : ''}`}
                                                >
                                                    <div className={`mt-0.5 w-10 h-10 flex items-center justify-center rounded-full shrink-0 ${
                                                        n.tipo === 'agotado' ? 'bg-error/10 text-error' :
                                                        n.tipo === 'stock_bajo' ? 'bg-orange-500/10 text-orange-500' :
                                                        'bg-primary/10 text-primary'
                                                    }`}>
                                                        <span className="material-symbols-outlined text-[20px]">
                                                            {n.tipo === 'agotado' ? 'warning' : n.tipo === 'stock_bajo' ? 'inventory_2' : 'receipt_long'}
                                                        </span>
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-body-sm font-medium text-on-surface">{n.titulo}</p>
                                                        <p className="text-xs text-on-surface-variant mt-0.5 truncate">{n.descripcion}</p>
                                                        <p className="text-[10px] text-secondary mt-1">{tiempoRelativo(n.fecha)}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        {notificaciones.some(n => n.tipo !== 'venta') && (
                                            <div className="p-3 bg-surface-container/30 border-t border-outline-variant/50 text-center">
                                                <button
                                                    onClick={marcarTodasLeidas}
                                                    disabled={marcandoLeidas}
                                                    className="text-sm font-medium text-primary hover:text-primary/70 transition-colors disabled:opacity-50"
                                                >
                                                    {marcandoLeidas ? 'Marcando...' : 'Marcar alertas como atendidas'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="relative">
                            <div
                                className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-primary font-bold cursor-pointer hover:bg-secondary-fixed-dim transition-colors border border-outline-variant"
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                title={usuario ? `${usuario.nombre} (${usuario.rol})` : ''}
                            >
                                {iniciales}
                            </div>
                            {isUserMenuOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)}></div>
                                    <div className="absolute right-0 mt-2 w-56 bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline/30 rounded-xl shadow-lg z-50 overflow-hidden">
                                        <div className="p-4 border-b border-outline-variant/50">
                                            <p className="text-body-sm font-semibold text-on-surface">{usuario?.nombre}</p>
                                            <p className="text-xs text-on-surface-variant capitalize">{usuario?.rol}</p>
                                        </div>
                                        <button
                                            className="w-full text-left p-3 text-body-sm text-error hover:bg-error/10 transition-colors"
                                            onClick={handleLogout}
                                        >
                                            Cerrar sesión
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 md:p-6 max-w-[1440px] mx-auto w-full overflow-y-auto bg-background dark:bg-inverse-surface">
                    {children}
                </main>
            </div>
        </div>
    );
};
