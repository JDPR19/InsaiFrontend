import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import styles from './header.module.css';
import icon from '../../components/iconos/iconos';
import sicic from '../../../public/assets/logo-sisic4.png';
import NotificationDropdown from './NotificationDropdown';
import { BaseUrl } from '../../utils/constans';
import { useTheme } from 'next-themes'; 
import SearchModal from '../searchbart/SearchModal';
import { useNavigate } from 'react-router-dom';

const SOCKET_URL = import.meta.env.VITE_API_URL || `${BaseUrl}`;
const socket = io(SOCKET_URL);

function Header() {
    const [user, setUser] = useState({ name: '', roles_nombre: '', id: null });
    const [notificaciones, setNotificaciones] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [tabActivo, setTabActivo] = useState('no-leidas');
    const [showSearchModal, setShowSearchModal] = useState(false);
    const audioRef = useRef(null);
    const { theme, setTheme } = useTheme(); 
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
            setUser({ name: storedUser.username, roles_nombre: storedUser.roles_nombre, id: storedUser.id });
        }
    }, []);

    useEffect(() => {
        const fetchUsuario = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${BaseUrl}/miusuario/ficha/completa`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const usuario = res.data;
                setUser({
                    name: usuario.username,
                    roles_nombre: usuario.rol,
                    id: usuario.usuario_id,
                    avatar_imagen: usuario.avatar_imagen,
                    cargo_nombre: usuario.cargo || usuario.cargo_nombre || '—'
                });
            } catch (error) {
                console.error('Error Obteniendo imagen de avatar del usuario', error);
                setUser({ name: '', roles_nombre: '', id: null });
            }
        };
        fetchUsuario();
}, []);

    useEffect(() => {
        if (user.id) {
            socket.emit('join', user.id);
            axios.get(`${BaseUrl}/notificaciones?usuario_id=${user.id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            })
            .then(res => setNotificaciones(res.data))
            .catch(() => setNotificaciones([]));
        }
    }, [user.id]);

    useEffect(() => {
        socket.on('nueva_notificacion', (notificacion) => {
            setNotificaciones(prev => [notificacion, ...prev]);
            if (audioRef.current) {
                audioRef.current.play();
            }
        });
        return () => {
            socket.off('nueva_notificacion');
        };
    }, []);

    const getPanelTitle = () => {
        const rol = (user.roles_nombre || '').toLowerCase().trim();
        switch (rol) {
            case 'administrador':
                return 'Panel Administrador';
            case 'moderador':
                return 'Panel Moderador';
            default:
                return 'Panel';
        }
    };

    const notificacionesNoLeidas = Array.isArray(notificaciones) ? notificaciones.filter(n => !n.leida).length : 0;

    const marcarLeida = async (id) => {
        await axios.put(`${BaseUrl}/notificaciones/${id}/leida`, {}, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setNotificaciones(prev =>
            prev.map(n => n.id === id ? { ...n, leida: true } : n)
        );
    };

    const isDark = theme === 'dark';

    const HandleHome = () => {
        navigate('/Home');
    }

    return (
        <header className={styles.header}>
            <div className={styles.logoContainer}>
                <img src={sicic} alt="Logo Institucional" onClick={HandleHome} title='Logo SICIC-INSAI • Sistema de Información para el Control de Operaciones de Campo' className={styles.logo} />
                <span className={styles.tituloSistema} title='Eslogan' >• SICIC-INSAI • "Comprometidos con la sanidad agrícola de Venezuela"</span>
            </div>
            <div className={styles.titleContainer}>
                <h1 className={styles.title} title='Titulo Panel'>{getPanelTitle()}</h1>
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

                <div className={styles.campanaWrapper} >
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
                    <span className={styles.username}>Hola, {user.name}</span>
                    <span className={styles.cargo}>{user.cargo_nombre || '—'}</span>
                </div>
            </div>
            {/* Modal del buscador universal */}
            <SearchModal
                abierto={showSearchModal}
                titulo="Buscador Universal"
                onClose={() => setShowSearchModal(false)}
            />
        </header>
    );
}

export default Header;