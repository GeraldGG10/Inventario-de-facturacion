const formatoMoneda = new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' });

export function formatearMoneda(valor: number): string {
    return formatoMoneda.format(valor);
}

export function tiempoRelativo(fecha: string | Date): string {
    const ahora = Date.now();
    const entonces = new Date(fecha).getTime();
    const diff = ahora - entonces;

    const minutos = Math.floor(diff / 60000);
    if (minutos < 1) return 'Ahora mismo';
    if (minutos < 60) return `Hace ${minutos} min`;
    const horas = Math.floor(minutos / 60);
    if (horas < 24) return `Hace ${horas} h`;
    const dias = Math.floor(horas / 24);
    return `Hace ${dias} d`;
}
