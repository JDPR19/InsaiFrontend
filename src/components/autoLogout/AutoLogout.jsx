import { useEffect, useRef, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { notifyGlobal } from '../../utils/globalNotification';
import { useNavigate } from 'react-router-dom';
import { BaseUrl } from '../../utils/constans';
import { getSocket, closeSocket } from '../../utils/singleton';

const API_URL = BaseUrl;
const INACTIVITY_LIMIT = 1 * 60 * 1000; // 15 min
const HEARTBEAT_INTERVAL = 25 * 60 * 1000; // 25 min 

const AutoLogout = () => {
  const navigate = useNavigate();
  const inactivityTimer = useRef(null);
  const tokenTimer = useRef(null);
  const heartbeatTimer = useRef(null);
  const socketRef = useRef(null);

  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [sid, setSid] = useState(() => localStorage.getItem('sid')); // NUEVO

  const logout = async (msg = 'Tu sesión ha expirado. Serás redirigido al login.') => {
    const currentToken = localStorage.getItem('token');
    const currentSid = localStorage.getItem('sid');
    notifyGlobal(msg, 'warning');

    // Intento logout backend
    if (currentToken) {
      try {
        await fetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${currentToken}`,
            'x-session-id': currentSid || ''
          }
        });
      } catch (e) {
        console.error('Error cerrando sesión en backend:', e);
      }
    }

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('permisos');
    localStorage.removeItem('sid'); 
    setSid(null);
    setToken(null);

    // Cerrar el socket global SOLO en logout explícito
    closeSocket();

    navigate('/Login');
  };

  // Storage listener (token o sid cambiaron en otra pestaña)
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'token') setToken(e.newValue);
      if (e.key === 'sid') setSid(e.newValue);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    if (tokenTimer.current) clearTimeout(tokenTimer.current);
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    if (heartbeatTimer.current) { clearInterval(heartbeatTimer.current); heartbeatTimer.current = null; }

    if (!token) {
      // No desconectar el socket aquí; otros componentes pueden seguir usándolo
      return;
    }

    // Inactividad local
    const resetInactivityTimer = () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      inactivityTimer.current = setTimeout(() => logout('Sesión cerrada por inactividad.'), INACTIVITY_LIMIT);
    };
    const activityEvents = ['mousemove','mousedown','keydown','scroll','touchstart'];
    activityEvents.forEach(ev => window.addEventListener(ev, resetInactivityTimer, { passive: true }));
    resetInactivityTimer();

    // Expiración JWT
    try {
      const decoded = jwtDecode(token);
      const expMs = (decoded?.exp || 0) * 1000;
      const timeout = expMs - Date.now();
      if (timeout > 0) tokenTimer.current = setTimeout(() => logout(), timeout);
      else logout();
    } catch {
      console.warn('No se pudo decodificar el token; se mantiene la sesión.');
    }

    // Heartbeat
    const sendHeartbeat = () => {
      const t = localStorage.getItem('token');
      const s = localStorage.getItem('sid');
      if (!t || !s) return;
      fetch(`${API_URL}/sesion/heartbeat`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json', Authorization: `Bearer ${t}`, 'x-session-id': s },
        body: JSON.stringify({ session_id: s }),
        keepalive: true
      }).catch(()=>{});
    };
    sendHeartbeat();
    heartbeatTimer.current = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);

    // Socket.IO (usar singleton global)
    const socket = getSocket();
    socketRef.current = socket;

    const doJoin = () => {
      try {
        const u = JSON.parse(localStorage.getItem('user') || '{}');
        if (u?.id) socket.emit('join', u.id);
      } catch (error) {('error en autologout'), error}
    };
    const onExpired = () => logout('Sesión cerrada desde el servidor.');

    socket.on('connect', doJoin);
    doJoin();
    socket.on('session:expired', onExpired);

    return () => {
      activityEvents.forEach(ev => window.removeEventListener(ev, resetInactivityTimer));
      if (tokenTimer.current) clearTimeout(tokenTimer.current);
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      if (heartbeatTimer.current) { clearInterval(heartbeatTimer.current); heartbeatTimer.current = null; }
      if (socketRef.current) {
        socketRef.current.off('connect', doJoin);
        socketRef.current.off('session:expired', onExpired);
      }
    };
  }, [token, sid]);

  return null;
};

export default AutoLogout;