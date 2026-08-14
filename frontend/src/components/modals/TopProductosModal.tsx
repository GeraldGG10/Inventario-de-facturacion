import React from 'react';

interface Props {
    onClose: () => void;
}

export const TopProductosModal = ({ onClose }: Props) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-surface-container-lowest dark:bg-inverse-surface w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] border border-outline-variant dark:border-outline/30">
                
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-outline-variant/50">
                    <div>
                        <h2 className="font-display-lg text-[24px] font-bold text-on-surface dark:text-inverse-on-surface">Todos los Top Productos</h2>
                        <p className="text-body-sm font-body-sm text-on-surface-variant mt-1">Rendimiento de ventas en el mes actual</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 rounded-full text-on-surface-variant hover:bg-surface-variant/50 transition-colors"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Body (Scrollable) */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                    <div className="overflow-x-auto w-full pb-2">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-outline-variant">
                                    <th className="text-left pb-3 font-label-caps text-label-caps text-secondary uppercase tracking-wider">#</th>
                                    <th className="text-left pb-3 font-label-caps text-label-caps text-secondary uppercase tracking-wider">Producto</th>
                                    <th className="text-left pb-3 font-label-caps text-label-caps text-secondary uppercase tracking-wider">SKU</th>
                                    <th className="text-left pb-3 font-label-caps text-label-caps text-secondary uppercase tracking-wider">Categoría</th>
                                    <th className="text-right pb-3 font-label-caps text-label-caps text-secondary uppercase tracking-wider">Unidades</th>
                                    <th className="text-right pb-3 font-label-caps text-label-caps text-secondary uppercase tracking-wider">Ingresos</th>
                                    <th className="text-center pb-3 font-label-caps text-label-caps text-secondary uppercase tracking-wider">Tendencia</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant/50">
                                {[
                                    { rank: 1, name: 'Laptop Pro X15', sku: 'LAP-001', cat: 'Electrónica', units: 142, revenue: '$213,000', trend: 'up' },
                                    { rank: 2, name: 'Monitor 27" 4K', sku: 'MON-027', cat: 'Electrónica', units: 98, revenue: '$88,200', trend: 'up' },
                                    { rank: 3, name: 'Teclado Mecánico', sku: 'TEC-MEC', cat: 'Periféricos', units: 87, revenue: '$17,400', trend: 'down' },
                                    { rank: 4, name: 'Mouse Inalámbrico Pro', sku: 'MOU-PRO', cat: 'Periféricos', units: 76, revenue: '$9,120', trend: 'up' },
                                    { rank: 5, name: 'SSD 1TB NVMe', sku: 'SSD-1TB', cat: 'Almacenamiento', units: 65, revenue: '$19,500', trend: 'up' },
                                    { rank: 6, name: 'Auriculares Gaming', sku: 'AUR-GAM', cat: 'Audio', units: 54, revenue: '$10,800', trend: 'down' },
                                    { rank: 7, name: 'Webcam 4K HD', sku: 'WEB-4K', cat: 'Video', units: 48, revenue: '$7,200', trend: 'up' },
                                    { rank: 8, name: 'Router WiFi 6E', sku: 'RTR-W6E', cat: 'Redes', units: 42, revenue: '$16,800', trend: 'up' },
                                    { rank: 9, name: 'Tablet 12" Pro', sku: 'TAB-12P', cat: 'Móvil', units: 39, revenue: '$46,800', trend: 'down' },
                                    { rank: 10, name: 'Cámara Mirrorless', sku: 'CAM-MIR', cat: 'Fotografía', units: 31, revenue: '$46,500', trend: 'up' },
                                ].map(p => (
                                    <tr key={p.rank} className="hover:bg-surface-container-low transition-colors">
                                        <td className="py-3 pr-4">
                                            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${p.rank <= 3 ? 'bg-primary text-on-primary' : 'bg-surface-container text-secondary'}`}>{p.rank}</span>
                                        </td>
                                        <td className="py-3 pr-6 font-medium text-on-surface whitespace-nowrap">{p.name}</td>
                                        <td className="py-3 pr-6 font-data-mono text-data-mono text-secondary whitespace-nowrap">{p.sku}</td>
                                        <td className="py-3 pr-6 whitespace-nowrap">
                                            <span className="px-2 py-0.5 rounded-full text-xs bg-secondary-container text-on-secondary-container">{p.cat}</span>
                                        </td>
                                        <td className="py-3 pr-6 text-right font-medium text-on-surface">{p.units}</td>
                                        <td className="py-3 pr-6 text-right font-medium text-primary">{p.revenue}</td>
                                        <td className="py-3 text-center">
                                            <span className={`material-symbols-outlined text-sm ${p.trend === 'up' ? 'text-[#006841]' : 'text-error'}`}>
                                                {p.trend === 'up' ? 'trending_up' : 'trending_down'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};
