import { useEffect } from 'react';
import { jwtDecode } from "jwt-decode";
import { notifyGlobal } from '../../utils/globalNotification';
import { useNavigate } from 'react-router-dom';

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

            const logout = () => {
                notifyGlobal('Tu sesión ha expirado. Serás redirigido al login.', 'warning');
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