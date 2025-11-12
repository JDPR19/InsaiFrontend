import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import styles from './header.module.css';
import icon from '../../components/iconos/iconos';
import sicic from '../../../public/assets/logo-sisic4.png';
import NotificationDropdown from './NotificationDropdown';
import { BaseUrl } from '../../utils/constans';
import { useTheme } from 'next-themes';
import SearchModal from '../searchbart/SearchModal';
import { useNavigate } from 'react-router-dom';
import { getSocket } from '../../utils/singleton';

function Header() {
  const [user, setUser] = useState({
    name: '',
    roles_nombre: '',
    id: null,
    cargo_nombre: '',
    avatar_imagen: ''
  });
  const [notificaciones, setNotificaciones] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [tabActivo, setTabActivo] = useState('no-leidas');
  const [showSearchModal, setShowSearchModal] = useState(false);

  const audioRef = useRef(null);
  const socketRef = useRef(null);
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    const raw = localStorage.getItem('user');
    if (!raw) return;
    try {
      const stored = JSON.parse(raw);
      setUser(prev => ({
        ...prev,
        name: stored.username || stored.name || prev.name,
        roles_nombre: stored.roles_nombre || stored.rol || prev.roles_nombre,
        id: stored.id || stored.usuario_id || prev.id,
        cargo_nombre: stored.cargo_nombre || stored.cargo || prev.cargo_nombre,
        avatar_imagen: stored.avatar_imagen || prev.avatar_imagen
      }));
    } catch (e) {
      console.error('Error parse user localStorage', e?.message);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const fetchUsuario = async () => {
      try {
        const res = await axios.get(`${BaseUrl}/miusuario/ficha/completa`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const u = res.data || {};
        setUser(prev => ({
          ...prev,
          name: u.username || prev.name,
          roles_nombre: u.rol || u.roles_nombre || prev.roles_nombre,
          id: u.usuario_id ?? u.id ?? prev.id,
          avatar_imagen: u.avatar_imagen || prev.avatar_imagen,
          cargo_nombre: u.cargo || u.cargo_nombre || prev.cargo_nombre || '—'
        }));
      } catch (err) {
        if (err?.response?.status === 401) {
          setUser({ name: '', roles_nombre: '', id: null, cargo_nombre: '', avatar_imagen: '' });
        }
        console.error('fetchUsuario error', err?.message);
      }
    };
    fetchUsuario();
  }, []);

  // Inicializa un único socket global (no se cierra en unmount)
  useEffect(() => {
    if (socketRef.current) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    socketRef.current = getSocket();

    const onConnect = () => console.log('WS conectado', socketRef.current.id);
    const onConnectError = (e) => console.error('Socket connect_error', e?.message || e);

    socketRef.current.on('connect', onConnect);
    socketRef.current.on('connect_error', onConnectError);

    return () => {
      if (!socketRef.current) return;
      socketRef.current.off('connect', onConnect);
      socketRef.current.off('connect_error', onConnectError);
    };
  }, []);

  // Unirse a sala del usuario
  useEffect(() => {
    if (!socketRef.current || !user.id) return;
    const socket = socketRef.current;
    const join = () => socket.emit('join', user.id);
    if (socket.connected) join();
    else socket.once('connect', join);
    return () => socket.off('connect', join);
  }, [user.id]);

  // Escuchar notificaciones
  useEffect(() => {
    if (!socketRef.current) return;
    const socket = socketRef.current;
    const handler = n => {
      console.log('RECIBIDA nueva_notificacion:', n);
      setNotificaciones(prev => [n, ...prev]);
      audioRef.current?.play().catch(() => {});
    };
    socket.on('nueva_notificacion', handler);
    return () => socket.off('nueva_notificacion', handler);
  }, []);

  useEffect(() => {
    if (!user.id) return;
    const token = localStorage.getItem('token');
    axios
      .get(`${BaseUrl}/notificaciones?usuario_id=${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => setNotificaciones(Array.isArray(res.data) ? res.data : []))
      .catch(err => {
        console.error('Error cargando notificaciones', err?.message);
        setNotificaciones([]);
      });
  }, [user.id]);

  const notificacionesNoLeidas = notificaciones.filter(n => !n.leida).length;

  const marcarLeida = async (id) => {
    try {
      await axios.put(
        `${BaseUrl}/notificaciones/${id}/leida`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setNotificaciones(prev =>
        prev.map(n => (n.id === id ? { ...n, leida: true } : n))
      );
    } catch (error){(error)}
  };

  const getPanelTitle = () => {
    const rol = (user.roles_nombre || '').toLowerCase().trim();
    if (rol === 'administrador') return 'Panel Administrador';
    if (rol === 'moderador') return 'Panel Moderador';
    return 'Panel';
  };

  const isDark = theme === 'dark';
  const HandleHome = () => navigate('/Home');

  return (
    <header className={styles.header}>
      <div className={styles.logoContainer}>
        <img
          src={sicic}
          alt="Logo Institucional"
          onClick={HandleHome}
          title='Logo SICIC-INSAI • Sistema de Información para el Control de Operaciones de Campo'
          className={styles.logo}
        />
        <span
          className={styles.tituloSistema}
          title='Eslogan'
        >
          • SICIC-INSAI • "Comprometidos con la sanidad agrícola de Venezuela"
        </span>
      </div>

      <div className={styles.titleContainer}>
        <h1 className={styles.title} title='Titulo Panel'>
          {getPanelTitle()}
        </h1>
      </div>

      <div className={styles.userMenu}>
        <div className={styles.campanaWrapper}>
          <img
            src={icon.lupa2}
            alt='Buscador Universal'
            title='Buscador Universal'
            className={styles.lupaIcon}
            onClick={() => setShowSearchModal(true)}
          />
        </div>

        <div className={styles.campanaWrapper}>
          <img
            src={icon.campana}
            alt="Notificaciones"
            title='Notificaciones'
            className={styles.campanaIcon}
            onClick={() => setShowDropdown(!showDropdown)}
          />
          {notificacionesNoLeidas > 0 && (
            <span className={styles.badge}>{notificacionesNoLeidas}</span>
          )}
          {showDropdown && (
            <NotificationDropdown
              notificaciones={notificaciones}
              marcarLeida={marcarLeida}
              tabActivo={tabActivo}
              setTabActivo={setTabActivo}
            />
          )}
          <audio ref={audioRef} src="/assets/notification.mp3" preload="auto" />
        </div>

        <div className={styles.campanaWrapper}>
          <img
            src={icon.question}
            alt='¿Necesitas Ayuda? Sobre Nosotros'
            title='¿Necesitas Ayuda? Sobre Nosotros'
            className={styles.lupaIcon}
            onClick={() => navigate('/informativa')}
          />
        </div>

        <div className={styles.campanaWrapper}>
          <img
            src={isDark ? icon.sun : icon.moon}
            alt='Light and Dark'
            title={isDark ? 'Modo Claro' : 'Modo Oscuro'}
            className={styles.campanaIcon}
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
          />
        </div>
      </div>

      <div className={styles.userInfoBox}>
        <img
          src={
            user.avatar_imagen
              ? `${BaseUrl}/uploads/usuarios/${user.avatar_imagen}`
              : icon.userDefault
          }
          alt="Avatar"
          title='Avatar Del Usuario'
          className={styles.avatarMini}
        />
        <div className={styles.userTextos} title='Saludo Usuario'>
          <span className={styles.username}>
            Hola{user.name ? `, ${user.name}` : ''}
          </span>
          <span className={styles.cargo}>
            {user.roles_nombre
              ? `${user.roles_nombre}${user.cargo_nombre ? ' • ' + user.cargo_nombre : ''}`
              : (user.cargo_nombre || '—')}
          </span>
        </div>
      </div>

      <SearchModal
        abierto={showSearchModal}
        titulo="Buscador Universal"
        onClose={() => setShowSearchModal(false)}
      />
    </header>
  );
}

export default Header;