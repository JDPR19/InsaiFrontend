import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePermiso } from './hooks/usePermiso';

function ProtectedRoute({ pantalla, accion = 'ver', children }) {
    const token = localStorage.getItem('token');
    const tienePermiso = usePermiso();

    if (!token) {
        // Si no hay token, redirige al login
        return <Navigate to="/" replace />;
    }

    if (!tienePermiso(pantalla, accion)) {
        // Si no tiene permiso, redirige a una página de no autorizado
        return <Navigate to="/no-autorizado" replace />;
    }

    // Si hay token y permiso, renderiza la página protegida
    return children;
}

export default ProtectedRoute;