import { useEffect } from 'react';
import { jwtDecode } from "jwt-decode";
import { notifyGlobal } from '../../utils/globalNotification';
import { useNavigate } from 'react-router-dom';

const API_URL =
    import.meta.env.VITE_API_URL ||
    'http://localhost:4000';

const AutoLogout = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const decoded = jwtDecode(token);
            const exp = decoded.exp * 1000;
            const now = Date.now();
            const timeout = exp - now;

            const logout = async () => {
                notifyGlobal('Tu sesión ha expirado. Serás redirigido al login.', 'warning');
                // Intenta cerrar sesión en el backend antes de limpiar localStorage
                if (token) {
                    try {
                        await fetch(`${API_URL}/auth/logout`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${token}`,
                            },
                        });
                    } catch (e) {
                        // Si el backend no responde, igual limpia el localStorage
                        console.error('Error cerrando sesión en backend:', e);
                    }
                }
                setTimeout(() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    localStorage.removeItem('permisos');
                    navigate('/');
                }, 3000);
            };

            if (timeout > 0) {
                const timer = setTimeout(logout, timeout);
                return () => clearTimeout(timer);
            } else {
                logout();
            }
        } catch (e) {
            console.log(e);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('permisos');
            navigate('/');
        }
    }, [navigate]);

    return null;
};

export default AutoLogout;