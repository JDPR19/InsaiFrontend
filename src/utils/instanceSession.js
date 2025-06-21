import axios from "axios";
import { notifyGlobal } from './globalNotification';

let sessionExpired = false;

axios.interceptors.response.use(
    response => response,
    error => {
        if (
        error.response &&
        error.response.status === 401 &&
        !sessionExpired
        ) {
            sessionExpired = true;
            notifyGlobal('Tu sesión ha expirado. Serás redirigido al login.', 'warning');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('permisos');
            setTimeout(() => {
                window.location.href = '/'; 
            }, 5000); 
        }
        return Promise.reject(error);
    }
);