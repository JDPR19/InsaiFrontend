import { useEffect, useRef } from 'react';
import { jwtDecode } from "jwt-decode";
import { notifyGlobal } from '../../utils/globalNotification';
import { useNavigate } from 'react-router-dom';
import { BaseUrl } from '../../utils/constans';

const API_URL = import.meta.env.VITE_API_URL || BaseUrl;
const INACTIVITY_LIMIT = 15 * 60 * 1000; 

const AutoLogout = () => {
    const navigate = useNavigate();
    const inactivityTimer = useRef(null);
    const tokenTimer = useRef(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        const logout = async (msg = 'Tu sesión ha expirado. Serás redirigido al login.') => {
            const currentToken = localStorage.getItem('token');
            notifyGlobal(msg, 'warning');
            if (currentToken) {
                try {
                    await fetch(`${API_URL}/auth/logout`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${currentToken}`,
                        },
                    });
                } catch (e) {
                    console.error('Error cerrando sesión en backend:', e);
                }
            }
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('permisos');
            navigate('/');
        };

        // Inactividad
        const resetInactivityTimer = () => {
            if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
            inactivityTimer.current = setTimeout(() => {
                logout('Sesión cerrada por inactividad. Serás redirigido al login.');
            }, INACTIVITY_LIMIT);
        };

        // Eventos de usuario para detectar actividad
        const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];
        events.forEach(event =>
            window.addEventListener(event, resetInactivityTimer)
        );
        resetInactivityTimer();

        // Expiración normal del token
        try {
            const decoded = jwtDecode(token);
            const exp = decoded.exp * 1000;
            const now = Date.now();
            const timeout = exp - now;

            if (timeout > 0) {
                tokenTimer.current = setTimeout(() => {
                    logout();
                }, timeout);
            } else {
                logout();
            }
        } catch (e) {
            console.log('Error decodificando token:', e);
            logout();
        }

        // Limpieza de timers y eventos
        return () => {
            if (tokenTimer.current) clearTimeout(tokenTimer.current);
            if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
            events.forEach(event =>
                window.removeEventListener(event, resetInactivityTimer)
            );
        };
    }, [navigate]);

    return null;
};

export default AutoLogout;