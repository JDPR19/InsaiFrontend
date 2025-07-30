import React, { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import styles from './menu.module.css';
import icon from '../../components/iconos/iconos';
import { registrarCierreSesion } from '../../utils/bitacoraService';
import { usePermiso } from '../../hooks/usePermiso';
import { BaseUrl } from '../../utils/constans';
import { useNotification } from '../../utils/NotificationContext';
import Spinner from '../spinner/Spinner';

function NavItem({ id, openSubmenus, setOpenSubmenus, selectedItem, setSelectedItem, iconSrc, label, linkTo, children }) {
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

    const handleLogout = async () => {
        setLoading(true);
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const userId = user?.id;
            const username = user?.username;

            if (userId && username) {
                registrarCierreSesion(userId, username);
            }

            const response = await fetch(`${BaseUrl}/auth/logout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (response.ok) {
                localStorage.removeItem('user');
                localStorage.removeItem('token');
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
            }
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            addNotification('Error al cerrar la sesión el servidor tardo en responder', 'error');
        } finally {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
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

                    {/* Panel Principal */}
                    {tienePermiso('home', 'ver') && (
                        <NavItem
                            id="panel"
                            openSubmenus={openSubmenus}
                            setOpenSubmenus={setOpenSubmenus}
                            selectedItem={selectedItem}
                            setSelectedItem={setSelectedItem}
                            iconSrc={icon.homeIcon}
                            label="Panel Principal"
                            linkTo="/Home"
                        />
                    )}

                    {/* Seccion Uno Productores y Propiedades */}
                    {['Administrador', 'Moderador'].includes(rol) && ( 
                        <NavItem
                        id="seccionOne"
                        openSubmenus={openSubmenus}
                        setOpenSubmenus={setOpenSubmenus}
                        selectedItem={selectedItem}
                        setSelectedItem={setSelectedItem}
                        iconSrc={icon.farmer2}
                        label="Productores y Propiedades"
                        linkTo="/SeccionOne"
                        />
                    )}

                    {/* Seccion Dos Solicitudes y Planificaciones */}
                        {['Administrador', 'Moderador', 'User'].includes(rol) && (
                            <NavItem
                            id="SeccionTwo"
                            openSubmenus={openSubmenus}
                            setOpenSubmenus={setOpenSubmenus}
                            selectedItem={selectedItem}
                            setSelectedItem={setSelectedItem}
                            iconSrc={icon.altavoz}
                            label="Solicitudes y Planificaciones"
                            linkTo="/SeccionTwo"
                            />
                        )}

                    {/* Seccion Tres Inspecciones y Programas */}
                        {['Administrador', 'Moderador', 'User'].includes(rol) && (
                            <NavItem
                            id="SeccionThree"
                            openSubmenus={openSubmenus}
                            setOpenSubmenus={setOpenSubmenus}
                            selectedItem={selectedItem}
                            setSelectedItem={setSelectedItem}
                            iconSrc={icon.escudobien}
                            label="Protección Fitosanitaria"
                            linkTo="/SeccionThree"
                            />
                        )}

                    {/* Seccion Cuatro Cultivos y Plagas */}
                        {['Administrador', 'Moderador'].includes(rol) && (
                            <NavItem
                            id="SeccionFour"
                            openSubmenus={openSubmenus}
                            setOpenSubmenus={setOpenSubmenus}
                            selectedItem={selectedItem}
                            setSelectedItem={setSelectedItem}
                            iconSrc={icon.hormiga}
                            label="Datos Epidemiologicos"
                            linkTo="/SeccionFour"
                            />
                        )}

                    {/* Seccion Cinco Permisos y Resumen de Reportes */}
                        {['Administrador', 'Moderador'].includes(rol) && (
                            <NavItem
                            id="SeccionFive"
                            openSubmenus={openSubmenus}
                            setOpenSubmenus={setOpenSubmenus}
                            selectedItem={selectedItem}
                            setSelectedItem={setSelectedItem}
                            iconSrc={icon.grafica}
                            label="Permisos y Reportes"
                            linkTo="/SeccionFive"
                            />
                        )}
                    
                    {/* Seccion Seis Ubicaciones */}
                        {rol === 'Administrador' && (
                            <NavItem
                            id="SeccionSix"
                            openSubmenus={openSubmenus}
                            setOpenSubmenus={setOpenSubmenus}
                            selectedItem={selectedItem}
                            setSelectedItem={setSelectedItem}
                            iconSrc={icon.mundo}
                            label="Áreas de Ubicación"
                            linkTo="/SeccionSix"
                            />
                        )}

                    {/* Seccion Siete Usuarios y Empleados (Administrador) */}
                        {rol === 'Administrador' && (
                            <NavItem
                            id="SeccionSeven"
                            openSubmenus={openSubmenus}
                            setOpenSubmenus={setOpenSubmenus}
                            selectedItem={selectedItem}
                            setSelectedItem={setSelectedItem}
                            iconSrc={icon.admin}
                            label="Administrador"
                            linkTo="/SeccionSeven"
                            />
                        )}

                    {/* Bitacora del Sistema (Administrador) */}
                    {tienePermiso('bitacora', 'ver') && (
                        <NavItem
                            id="bitacora"
                            openSubmenus={openSubmenus}
                            setOpenSubmenus={setOpenSubmenus}
                            selectedItem={selectedItem}
                            setSelectedItem={setSelectedItem}
                            iconSrc={icon.bitacora}
                            label="Bitacora del Sistema"
                            linkTo="/Bitacora"
                        />
                    )}

                    {/* Mi Usuario */}
                    {tienePermiso('miusuario','ver') && (
                        <NavItem
                        id="Miusuario"
                        openSubmenus={openSubmenus}
                        setOpenSubmenus={setOpenSubmenus}
                        selectedItem={selectedItem}
                        setSelectedItem={setSelectedItem}
                        iconSrc={icon.user}
                        label="Mi Usuario"
                        linkTo="/MiUsuario"
                        />
                    )}

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