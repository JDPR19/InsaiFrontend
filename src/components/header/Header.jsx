import { useState, useEffect } from 'react';
import styles from './header.module.css';
import icon from '../../components/iconos/iconos';
import insai from '../../../public/assets/image.png';

function Header() {
    const [user, setUser] = useState({ name: '', roles_nombre: '' }); 

    useEffect(() => {
        // Obtén los datos del usuario desde localStorage
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
            setUser({ name: storedUser.username, roles_nombre: storedUser.roles_nombre }); // Cambia aquí
        }
    }, []);

    // Determina el título dinámico según el rol del usuario
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

    return (
        <header className={styles.header}>
            {/* Logo a la izquierda */}
            <div className={styles.logoContainer}>
                <img src={insai} alt="Logo Institucional" className={styles.logo} />
            </div>
            
            {/* Título centrado */}
            <div className={styles.titleContainer}>
                <h1 className={styles.title}>{getPanelTitle()}</h1>
            </div>
            
            {/* Campana y saludo del usuario */}
            <div className={styles.userMenu}>
                <img src={icon.campana} alt="Notificaciones" className={styles.campanaIcon} />
                <span className={styles.username}>Hola, {user.name}</span>
            </div>
        </header>
    );
}

export default Header;