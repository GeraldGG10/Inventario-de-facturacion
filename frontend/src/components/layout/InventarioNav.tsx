import React from 'react';
import { NavLink } from 'react-router-dom';

export const InventarioNav = () => {
    const navItemClass = ({ isActive }: { isActive: boolean }) => {
        const baseClass = "font-title-sm text-title-sm pb-2 whitespace-nowrap transition-colors flex items-center gap-2 ";
        if (isActive) {
            return baseClass + "font-semibold text-primary border-b-2 border-primary";
        }
        return baseClass + "font-body-md text-body-md text-secondary hover:text-primary border-b-2 border-transparent";
    };

    return (
        <nav className="flex gap-6 overflow-x-auto w-full custom-scrollbar">
            <NavLink to="/inventario" end className={navItemClass}>
                Productos
            </NavLink>
            <NavLink to="/inventario/movimientos" className={navItemClass}>
                Movimientos
            </NavLink>
            <NavLink to="/inventario/alertas" className={navItemClass}>
                Alertas
                <span className="bg-error-container text-on-error-container text-[10px] px-2 py-0.5 rounded-full font-data-mono font-bold">3</span>
            </NavLink>
            <NavLink to="/inventario/categorias" className={navItemClass}>
                Categorías
            </NavLink>
        </nav>
    );
};
