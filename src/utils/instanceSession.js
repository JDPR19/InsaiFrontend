import axios from "axios";
import { notifyGlobal } from './globalNotification';
import { BaseUrl } from "./constans";

let sessionExpired = false;

const API_URL =
    import.meta.env.VITE_API_URL || BaseUrl;

axios.interceptors.response.use(
    response => response,
    async error => {
        if (
            error.response &&
            error.response.status === 401 &&
            !sessionExpired
        ) {
            sessionExpired = true;
            notifyGlobal('Tu sesión ha expirado. Serás redirigido al login.', 'warning');
            
            // Llama al backend para cerrar la sesión en la base de datos
            const token = localStorage.getItem('token');
            if (token) {
                // Intenta cerrar sesión en el backend, pero elimina el token local SIEMPRE
                try {
                    await axios.post(
                        `${API_URL}/auth/logout`,
                        {},
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );
                } catch (error) {
                    // Si el backend no responde, igual elimina el token local
                    console.error('error cerrando sesión en backend:', error);
                }
                localStorage.removeItem('token');
            } else {
                // Si no hay token, igual limpia el localStorage
                localStorage.removeItem('token');
            }
            localStorage.removeItem('user');
            localStorage.removeItem('permisos');
            setTimeout(() => {
                window.location.href = '/Login'; 
            }, 5000); 
        }
        return Promise.reject(error);
    }
);