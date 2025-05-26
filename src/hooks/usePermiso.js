export function usePermiso() {
    const permisos = JSON.parse(localStorage.getItem('permisos') || '{}');
    return (pantalla, accion) => !!(permisos[pantalla] && permisos[pantalla][accion]);
}