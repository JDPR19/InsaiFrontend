export default function usePermiso() {
  const user = JSON.parse(localStorage.getItem('user'));
  const permisos = user?.permisos || {};
  return (pantalla, accion) => {
    if (!permisos[pantalla]) return false;
    return !!permisos[pantalla][accion];
  };
}