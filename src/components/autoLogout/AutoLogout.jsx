import { useEffect, useRef } from 'react';
import { jwtDecode } from "jwt-decode";
import { notifyGlobal } from '../../utils/globalNotification';
import { useNavigate } from 'react-router-dom';

const API_URL =
    import.meta.env.VITE_API_URL ||
    'http://localhost:4000';

const INACTIVITY_LIMIT = 35* 60 * 1000; // 15 minutos en ms

const AutoLogout = () => {
    const navigate = useNavigate();
    const inactivityTimer = useRef(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        // Expiración normal del token
        try {
            const decoded = jwtDecode(token);
            const exp = decoded.exp * 1000;
            const now = Date.now();
            const timeout = exp - now;

            const logout = async (msg = 'Tu sesión ha expirado. Serás redirigido al login.') => {
                notifyGlobal(msg, 'warning');
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

            // Inactividad
            const resetInactivityTimer = () => {
                if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
                inactivityTimer.current = setTimeout(() => {
                    logout('Sesión cerrada por inactividad. Serás redirigido al login.');
                }, INACTIVITY_LIMIT);
            };

            // Eventos de usuario
            const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];
            events.forEach(event =>
                window.addEventListener(event, resetInactivityTimer)
            );
            resetInactivityTimer();

            // Expiración normal del token
            let tokenTimer;
            if (timeout > 0) {
                tokenTimer = setTimeout(logout, timeout);
            } else {
                logout();
            }

            return () => {
                if (tokenTimer) clearTimeout(tokenTimer);
                if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
                events.forEach(event =>
                    window.removeEventListener(event, resetInactivityTimer)
                );
            };
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