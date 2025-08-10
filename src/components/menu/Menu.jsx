import React, { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import styles from './menu.module.css';
import icon from '../../components/iconos/iconos';
import { usePermiso } from '../../hooks/usePermiso';
import { BaseUrl } from '../../utils/constans';
import { useNotification } from '../../utils/NotificationContext';
import Spinner from '../spinner/Spinner';

// Si tienes muchos NavItem, puedes generar una key única combinando el id y el índice
function NavItem({ id, openSubmenus, setOpenSubmenus, selectedItem, setSelectedItem, iconSrc, label, linkTo, children, idx }) {
    const isOpen = openSubmenus[id];
    const isSelected = selectedItem === id;

    const handleClick = () => {
        if (children) {
            setOpenSubmenus((prev) => ({ ...prev, [id]: !prev[id] }));
        }
        setSelectedItem(id);
    };

    return (
        <li
            key={`${id}-${idx}`} // Corrección: key única combinando id e índice
            className={`${styles.navItem} ${isOpen ? styles.open : ''} ${isSelected ? styles.selected : ''}`}
            onClick={handleClick}
        >
            {linkTo ? (
                <Link to={linkTo} className={styles.navLink}>
                    <img src={iconSrc} alt={label} className={styles.icon} />
                    <span className={styles.navLabel}>{label}</span>
                </Link>
            ) : (
                <div className={styles.navLink}>
                    <img src={iconSrc} alt={label} className={styles.icon} />
                    <span className={styles.navLabel}>{label}</span>
                    {children && (
                        <img
                            src={icon.flecha}
                            alt="Flecha"
                            className={`${styles.iconFlecha} ${isOpen ? styles.iconRotated : ''}`}
                        />
                    )}
                </div>
            )}
            {children && (
                <div className={`${styles.submenuContainer} ${isOpen ? styles.submenuOpen : ''}`}>
                    {children}
                </div>
            )}
        </li>
    );
}

function Menu() {
    const [openSubmenus, setOpenSubmenus] = useState({});
    const [selectedItem, setSelectedItem] = useState(null);
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [loading, setLoading] = useState(false);
    const { addNotification } = useNotification();
    const navigate = useNavigate();
    const tienePermiso = usePermiso();
    const user = JSON.parse(localStorage.getItem('user'));
    const rol = user?.roles_nombre; 

    const navItems = [
        tienePermiso('home', 'ver') && {
            id: "panel",
            iconSrc: icon.homeIcon,
            label: "Panel Principal",
            linkTo: "/Home"
        },
        ['Administrador', 'Moderador'].includes(rol) && {
            id: "seccionOne",
            iconSrc: icon.farmer2,
            label: "Productores y Propiedades",
            linkTo: "/SeccionOne"
        },
        ['Administrador', 'Moderador', 'User'].includes(rol) && {
            id: "SeccionTwo",
            iconSrc: icon.altavoz,
            label: "Solicitudes y Planificaciones",
            linkTo: "/SeccionTwo"
        },
        ['Administrador', 'Moderador', 'User'].includes(rol) && {
            id: "SeccionThree",
            iconSrc: icon.escudobien,
            label: "Protección Fitosanitaria",
            linkTo: "/SeccionThree"
        },
        ['Administrador', 'Moderador'].includes(rol) && {
            id: "SeccionFour",
            iconSrc: icon.hormiga,
            label: "Datos Epidemiologicos",
            linkTo: "/SeccionFour"
        },
        ['Administrador', 'Moderador'].includes(rol) && {
            id: "SeccionFive",
            iconSrc: icon.grafica,
            label: "Permisos y Reportes",
            linkTo: "/SeccionFive"
        },
        rol === 'Administrador' && {
            id: "SeccionSix",
            iconSrc: icon.mundo,
            label: "Áreas de Ubicación",
            linkTo: "/SeccionSix"
        },
        rol === 'Administrador' && {
            id: "SeccionSeven",
            iconSrc: icon.admin,
            label: "Administrador",
            linkTo: "/SeccionSeven"
        },
        tienePermiso('bitacora', 'ver') && {
            id: "bitacora",
            iconSrc: icon.bitacora,
            label: "Bitacora del Sistema",
            linkTo: "/Bitacora"
        },
        tienePermiso('miusuario','ver') && {
            id: "Miusuario",
            iconSrc: icon.user,
            label: "Mi Usuario",
            linkTo: "/MiUsuario"
        }
    ].filter(Boolean);

    const handleLogout = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            let logoutSuccess = false;

            if (token) {
                const response = await fetch(`${BaseUrl}/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    logoutSuccess = true;
                } else {
                    addNotification('No se pudo cerrar la sesión correctamente en el servidor.', 'error');
                }
            }

            // Solo elimina el token si el logout fue exitoso
            if (logoutSuccess) {
                localStorage.removeItem('token');
            }
            localStorage.removeItem('user');
            localStorage.removeItem('permisos');
            localStorage.removeItem('seccionOneTab');
            localStorage.removeItem('seccionTwoTab');
            localStorage.removeItem('seccionThreeTab');
            localStorage.removeItem('seccionFourTab');
            localStorage.removeItem('seccionFiveTab');
            localStorage.removeItem('seccionSixTab');
            localStorage.removeItem('seccionSevenTab');
            window.history.replaceState(null, '', '/');
            navigate('/', { replace: true });
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            addNotification('Error al cerrar la sesión. El servidor tardo en responder.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main
            className={`${styles.container} ${isCollapsed ? styles.collapsed : ''}`}
            onMouseEnter={() => setIsCollapsed(false)}
            onMouseLeave={() => setIsCollapsed(true)}
        >
            {loading && <Spinner text="Procesando..." />}

            <nav className={styles.sidebar}>
                <ul className={styles.navList}>
                    {navItems.map((item, idx) => (
                        <NavItem
                            key={`${item.id}-${idx}`} // Corrección: key única combinando id e índice
                            id={item.id}
                            openSubmenus={openSubmenus}
                            setOpenSubmenus={setOpenSubmenus}
                            selectedItem={selectedItem}
                            setSelectedItem={setSelectedItem}
                            iconSrc={item.iconSrc}
                            label={item.label}
                            linkTo={item.linkTo}
                            idx={idx}
                        />
                    ))}
                </ul>

                <footer className={styles.footer}>
                    <button
                        className={styles.logoutButton}
                        onClick={handleLogout}
                        title="Salir del sistema"
                    >
                        <img src={icon.salida} alt="Terminar Sesión" className={styles.iconsalida} />
                        Salir
                    </button>
                </footer>
            </nav>
            <div className={styles.content}>
                <Outlet />
            </div>
        </main>
    );
}

export default Menu;