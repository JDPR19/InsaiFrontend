import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './header.module.css';
import icon from '../../components/iconos/iconos';
import insai from '../../../public/assets/image.png';
import NotificationDropdown from './NotificationDropdown';
import { BaseUrl } from '../../utils/constans';

function Header() {
    const [user, setUser] = useState({ name: '', roles_nombre: '', id: null });
    const [notificaciones, setNotificaciones] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [tabActivo, setTabActivo] = useState('todas'); // <-- Estado global para el tab
    const [darkLight, setDarkLight] = useState(false);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
            setUser({ name: storedUser.username, roles_nombre: storedUser.roles_nombre, id: storedUser.id });
        }
    }, []);

    useEffect(() => {
        if (user.id) {
            axios.get(`${BaseUrl}/notificaciones?usuario_id=${user.id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            })
            .then(res => setNotificaciones(res.data))
            .catch(() => setNotificaciones([]));
        }
    }, [user.id]);

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

    const notificacionesNoLeidas = notificaciones.filter(n => !n.leida).length;

    const marcarLeida = async (id) => {
        await axios.put(`${BaseUrl}/notificaciones/${id}/leida`, {}, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setNotificaciones(prev =>
            prev.map(n => n.id === id ? { ...n, leida: true } : n)
        );
    };

    return (
        <header className={styles.header}>
            <div className={styles.logoContainer}>
                <img src={insai} alt="Logo Institucional" className={styles.logo} />
            </div>
            <div className={styles.titleContainer}>
                <h1 className={styles.title}>{getPanelTitle()}</h1>
            </div>
            <div className={styles.userMenu}>

                <div className={styles.campanaWrapper}>
                    <img 
                    src={darkLight ? icon.sun : icon.moon} 
                    alt='Light and Dark'
                    title='Modo Oscuro'
                    className={styles.campanaIcon}
                    onClick={() => setDarkLight(!darkLight)}
                    />
                </div>

                <div className={styles.campanaWrapper}>
                    <img 
                    src={icon.lupa2} 
                    alt='Buscador Universal'
                    title='Buscador Universal'
                    className={styles.lupaIcon}
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
                </div>

                
                <hr />
                <span className={styles.username}>Hola, {user.name}</span>
            </div>
        </header>
    );
}

export default Header;