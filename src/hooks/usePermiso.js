export default function usePermiso() {
  let permisos = {};
  if (typeof window !== "undefined") {
    const user = JSON.parse(localStorage.getItem('user'));
    permisos = user?.permisos || {};
  }
  return (pantalla, accion) => {
    if (!permisos[pantalla]) return false;
    return !!permisos[pantalla][accion];
  };
}