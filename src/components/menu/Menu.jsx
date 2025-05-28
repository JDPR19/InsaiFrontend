import React, { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import styles from './menu.module.css';
import icon from '../../components/iconos/iconos';
import { registrarCierreSesion } from '../../utils/bitacoraService';
import { usePermiso } from '../../hooks/usePermiso';

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
    const navigate = useNavigate();
    const tienePermiso = usePermiso();

    const handleLogout = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const userId = user?.id;
            const username = user?.username;

            if (userId && username) {
                registrarCierreSesion(userId, username);
            }

            const response = await fetch('http://localhost:4000/auth/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (response.ok) {
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                window.history.replaceState(null, '', '/');
                navigate('/', { replace: true });
            }
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        } finally {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            localStorage.removeItem('permiso');
            window.history.replaceState(null, '', '/');
            navigate('/', { replace: true });
        }
    };

    return (
        <main
            className={`${styles.container} ${isCollapsed ? styles.collapsed : ''}`}
            onMouseEnter={() => setIsCollapsed(false)}
            onMouseLeave={() => setIsCollapsed(true)}
        >
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

                    {/* Datos del Productor */}
                    {(tienePermiso('productor', 'ver') || tienePermiso('propiedad', 'ver')) && (
                        <NavItem
                            id="datosPropietario"
                            openSubmenus={openSubmenus}
                            setOpenSubmenus={setOpenSubmenus}
                            selectedItem={selectedItem}
                            setSelectedItem={setSelectedItem}
                            iconSrc={icon.farmer2}
                            label="Datos del Productor"
                        >
                            <ul className={styles.submenu}>

                                {tienePermiso('productor', 'ver') && (
                                    <li>
                                        <Link
                                            to="/Productor"
                                            className={`${styles.submenuItem} ${selectedItem === 'productores' ? styles.selected : ''}`}
                                            onClick={() => setSelectedItem('productores')}
                                        >
                                            Productores
                                        </Link>
                                    </li>
                                )}

                                {tienePermiso('propiedad', 'ver') && (
                                    <li>
                                        <Link
                                            to="/Propiedad"
                                            className={`${styles.submenuItem} ${selectedItem === 'propiedad' ? styles.selected : ''}`}
                                            onClick={() => setSelectedItem('propiedad')}
                                        >
                                            Propiedades
                                        </Link>
                                    </li>
                                )}

                            </ul>
                        </NavItem>
                    )}

                    {/* Solicitudes */}
                    {tienePermiso('solicitud', 'ver') && (
                        <NavItem
                            id="Solicitud"
                            openSubmenus={openSubmenus}
                            setOpenSubmenus={setOpenSubmenus}
                            selectedItem={selectedItem}
                            setSelectedItem={setSelectedItem}
                            iconSrc={icon.altavoz}
                            label="Solicitar"
                            linkTo="/Solicitud"
                        />
                    )}

                    {/* Inspecciones */}
                    {tienePermiso('inspeccion', 'ver') && (
                        <NavItem
                            id="Inspecciones"
                            openSubmenus={openSubmenus}
                            setOpenSubmenus={setOpenSubmenus}
                            selectedItem={selectedItem}
                            setSelectedItem={setSelectedItem}
                            iconSrc={icon.escudobien}
                            label="Inspecciones"
                            linkTo="/Inspecciones"
                        />
                    )}

                    {/* Planificación */}
                    {tienePermiso('planificacion', 'ver') && (
                        <NavItem
                            id="Planificacion"
                            openSubmenus={openSubmenus}
                            setOpenSubmenus={setOpenSubmenus}
                            selectedItem={selectedItem}
                            setSelectedItem={setSelectedItem}
                            iconSrc={icon.calendario}
                            label="Planificacion"
                            linkTo="/Planificacion"
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

                    {/* Parámetros de Campo */}
                    {(tienePermiso('programa', 'ver') || tienePermiso('laboratorio', 'ver') || tienePermiso('plaga', 'ver') || tienePermiso('cultivo', 'ver')) && (
                        <NavItem
                            id="parametrosCampo"
                            openSubmenus={openSubmenus}
                            setOpenSubmenus={setOpenSubmenus}
                            selectedItem={selectedItem}
                            setSelectedItem={setSelectedItem}
                            iconSrc={icon.hormiga}
                            label="Parametros de Campo"
                        >
                            <ul className={styles.submenu}>

                                {tienePermiso('programa', 'ver') && (
                                    <li>
                                        <Link
                                            to="/Programas"
                                            className={`${styles.submenuItem} ${selectedItem === 'programas' ? styles.selected : ''}`}
                                            onClick={() => setSelectedItem('programas')}
                                        >
                                            Programas
                                        </Link>
                                    </li>
                                )}

                                {tienePermiso('laboratorio', 'ver') && (
                                    <li>
                                        <Link
                                            to="/Laboratorio"
                                            className={`${styles.submenuItem} ${selectedItem === 'laboratorio' ? styles.selected : ''}`}
                                            onClick={() => setSelectedItem('laboratorio')}
                                        >
                                            Laboratorios
                                        </Link>
                                    </li>
                                )}

                                {tienePermiso('plaga', 'ver') && (
                                    <li>
                                        <Link
                                            to="/Plagas"
                                            className={`${styles.submenuItem} ${selectedItem === 'plagas' ? styles.selected : ''}`}
                                            onClick={() => setSelectedItem('plagas')}
                                        >
                                            Plagas
                                        </Link>
                                    </li>
                                )}

                                {tienePermiso('cultivo', 'ver') && (
                                    <li>
                                        <Link
                                            to="/Cultivo"
                                            className={`${styles.submenuItem} ${selectedItem === 'cultivo' ? styles.selected : ''}`}
                                            onClick={() => setSelectedItem('cultivo')}
                                        >
                                            Cultivos
                                        </Link>
                                    </li>
                                )}
                            </ul>
                        </NavItem>
                    )}

                    {/* Catálogo de Datos */}
                    {(tienePermiso('tipo_productor', 'ver') || tienePermiso('tipo_propiedad', 'ver') || tienePermiso('tipo_laboratorio', 'ver') ||
                    tienePermiso('tipo_programa', 'ver') || tienePermiso('tipo_solicitud', 'ver') || tienePermiso('tipo_inspeccion', 'ver') ||
                    tienePermiso('tipo_permiso', 'ver') || tienePermiso('tipo_evento', 'ver') || tienePermiso('tipo_cultivo', 'ver') ||
                    tienePermiso('tipo_plaga', 'ver') || tienePermiso('cargos', 'ver') || tienePermiso('estado', 'ver') ||
                    tienePermiso('municipio', 'ver') || tienePermiso('parroquia', 'ver')) && (
                        <NavItem
                            id="catalogo"
                            openSubmenus={openSubmenus}
                            setOpenSubmenus={setOpenSubmenus}
                            selectedItem={selectedItem}
                            setSelectedItem={setSelectedItem}
                            iconSrc={icon.folder}
                            label="Catalogo de Datos"
                        >
                            <ul className={styles.submenu}>

                                {tienePermiso('tipo_productor', 'ver') && (
                                    <li>
                                        <Link
                                            to="/TipoProductor"
                                            className={`${styles.submenuItem} ${selectedItem === 'tipoproductor' ? styles.selected : ''}`}
                                            onClick={() => setSelectedItem('tipoproductor')}
                                        >
                                            Tipo de Productor
                                        </Link>
                                    </li>
                                )}

                                {tienePermiso('tipo_propiedad', 'ver') && (
                                    <li>
                                        <Link
                                            to="/TipoPropiedad"
                                            className={`${styles.submenuItem} ${selectedItem === 'tipopropiedad' ? styles.selected : ''}`}
                                            onClick={() => setSelectedItem('tipopropiedad')}
                                        >
                                            Tipo de Propiedad
                                        </Link>
                                    </li>
                                )}

                                {tienePermiso('tipo_laboratorio', 'ver') && (
                                    <li>
                                        <Link
                                            to="/TipoLaboratorio"
                                            className={`${styles.submenuItem} ${selectedItem === 'tipolaboratorio' ? styles.selected : ''}`}
                                            onClick={() => setSelectedItem('tipolaboratorio')}
                                        >
                                            Tipos de Laboratorios
                                        </Link>
                                    </li>
                                )}

                                {tienePermiso('tipo_programa', 'ver') && (
                                    <li>
                                        <Link
                                            to="/TipoPrograma"
                                            className={`${styles.submenuItem} ${selectedItem === 'tipoprograma' ? styles.selected : ''}`}
                                            onClick={() => setSelectedItem('tipoprograma')}
                                        >
                                            Tipos de Programas
                                        </Link>
                                    </li>
                                )}

                                {tienePermiso('tipo_solicitud', 'ver') && (
                                    <li>
                                        <Link
                                            to="/TipoSolicitud"
                                            className={`${styles.submenuItem} ${selectedItem === 'tiposolicitud' ? styles.selected : ''}`}
                                            onClick={() => setSelectedItem('tiposolicitud')}
                                        >
                                            Tipos de Solicitud
                                        </Link>
                                    </li>
                                )}

                                {tienePermiso('tipo_inspeccion', 'ver') && (
                                    <li>
                                        <Link
                                            to="/TipoInspeccion"
                                            className={`${styles.submenuItem} ${selectedItem === 'tipoinspeccion' ? styles.selected : ''}`}
                                            onClick={() => setSelectedItem('tipoinspeccion')}
                                        >
                                            Tipos de Inspecciones
                                        </Link>
                                    </li>
                                )}

                                {tienePermiso('tipo_permiso', 'ver') && (
                                    <li>
                                        <Link
                                            to="/TipoPermiso"
                                            className={`${styles.submenuItem} ${selectedItem === 'tipopermiso' ? styles.selected : ''}`}
                                            onClick={() => setSelectedItem('tipopermiso')}
                                        >
                                            Tipos de Permisos
                                        </Link>
                                    </li>
                                )}

                                {tienePermiso('tipo_evento', 'ver') && (
                                    <li>
                                        <Link
                                            to="/TipoEvento"
                                            className={`${styles.submenuItem} ${selectedItem === 'tipoevento' ? styles.selected : ''}`}
                                            onClick={() => setSelectedItem('tipoevento')}
                                        >
                                            Tipos de Eventos
                                        </Link>
                                    </li>
                                )}

                                {tienePermiso('tipo_cultivo', 'ver') && (
                                    <li>
                                        <Link
                                            to="/TipoCultivo"
                                            className={`${styles.submenuItem} ${selectedItem === 'tipocultivos' ? styles.selected : ''}`}
                                            onClick={() => setSelectedItem('tipocultivos')}
                                        >
                                            Tipos de Cultivos
                                        </Link>
                                    </li>
                                )}

                                {tienePermiso('tipo_plaga', 'ver') && (
                                    <li>
                                        <Link
                                            to="/TipoPlaga"
                                            className={`${styles.submenuItem} ${selectedItem === 'tipoplaga' ? styles.selected : ''}`}
                                            onClick={() => setSelectedItem('tipoplaga')}
                                        >
                                            Tipos de Plagas
                                        </Link>
                                    </li>
                                )}

                                {tienePermiso('cargos', 'ver') && (
                                    <li>
                                        <Link
                                            to="/Cargo"
                                            className={`${styles.submenuItem} ${selectedItem === 'cargo' ? styles.selected : ''}`}
                                            onClick={() => setSelectedItem('cargo')}
                                        >
                                            Cargos
                                        </Link>
                                    </li>
                                )}

                                {tienePermiso('estado', 'ver') && (
                                    <li>
                                        <Link
                                            to="/Estados"
                                            className={`${styles.submenuItem} ${selectedItem === 'estados' ? styles.selected : ''}`}
                                            onClick={() => setSelectedItem('estados')}
                                        >
                                            Estados
                                        </Link>
                                    </li>
                                )}

                                {tienePermiso('municipio', 'ver') && (
                                    <li>
                                        <Link
                                            to="/Municipio"
                                            className={`${styles.submenuItem} ${selectedItem === 'municipio' ? styles.selected : ''}`}
                                            onClick={() => setSelectedItem('municipio')}
                                        >
                                            Municipios
                                        </Link>
                                    </li>
                                )}

                                {tienePermiso('parroquia', 'ver') && (
                                    <li>
                                        <Link
                                            to="/Parroquia"
                                            className={`${styles.submenuItem} ${selectedItem === 'parroquia' ? styles.selected : ''}`}
                                            onClick={() => setSelectedItem('parroquia')}
                                        >
                                            Parroquias
                                        </Link>
                                    </li>
                                )}

                            </ul>
                        </NavItem>
                    )}

                    {/* Reportes */}
                    {(tienePermiso('muestras', 'ver') || tienePermiso('permiso', 'ver')) && (
                        <NavItem
                            id="reportes"
                            openSubmenus={openSubmenus}
                            setOpenSubmenus={setOpenSubmenus}
                            selectedItem={selectedItem}
                            setSelectedItem={setSelectedItem}
                            iconSrc={icon.grafica}
                            label="Reportes"
                        >
                            <ul className={styles.submenu}>
                                {tienePermiso('permiso', 'ver') && (

                                    <li>
                                        <Link
                                            to="/Permiso"
                                            className={`${styles.submenuItem} ${selectedItem === 'permiso' ? styles.selected : ''}`}
                                            onClick={() => setSelectedItem('permiso')}
                                        >
                                            Reporte de Permisos
                                        </Link>
                                    </li>
                                )}

                                {tienePermiso('muestras', 'ver') && (
                                    <li>
                                        <Link
                                            to="/MuestraPlaga"
                                            className={`${styles.submenuItem} ${selectedItem === 'muestraplaga' ? styles.selected : ''}`}
                                            onClick={() => setSelectedItem('muestraplaga')}
                                        >
                                            Reporte de Muestras
                                        </Link>
                                    </li>
                                )}

                            </ul>
                        </NavItem>
                    )}

                    {/* Administrador */}
                    {(tienePermiso('empleados', 'ver') ||
                        tienePermiso('usuarios', 'ver') ||
                        tienePermiso('tipo_usuario', 'ver') ||
                        tienePermiso('bitacora', 'ver')) && (

                        <NavItem
                            id="admin"
                            openSubmenus={openSubmenus}
                            setOpenSubmenus={setOpenSubmenus}
                            selectedItem={selectedItem}
                            setSelectedItem={setSelectedItem}
                            iconSrc={icon.admin}
                            label="Administrador"
                        >
                            <ul className={styles.submenu}>
                                {tienePermiso('empleados', 'ver') && (

                                    <li>
                                        <Link
                                            to="/Empleados"
                                            className={`${styles.submenuItem} ${selectedItem === 'empleados' ? styles.selected : ''}`}
                                            onClick={() => setSelectedItem('empleados')}
                                        >
                                            Empleados
                                        </Link>
                                    </li>
                                )}

                                {tienePermiso('usuarios', 'ver') && (
                                    <li>
                                        <Link
                                            to="/Usuario"
                                            className={`${styles.submenuItem} ${selectedItem === 'usuario' ? styles.selected : ''}`}
                                            onClick={() => setSelectedItem('usuario')}
                                        >
                                            Usuarios
                                        </Link>
                                    </li>
                                )}

                                {tienePermiso('tipo_usuario', 'ver') && (
                                    <li>
                                        <Link
                                            to="/TipoUsuario"
                                            className={`${styles.submenuItem} ${selectedItem === 'tipousuario' ? styles.selected : ''}`}
                                            onClick={() => setSelectedItem('tipousuario')}
                                        >
                                            Roles & Permisos
                                        </Link>
                                    </li>
                                )}

                                {tienePermiso('bitacora', 'ver') && (
                                    <li>
                                        <Link
                                            to="/Bitacora"
                                            className={`${styles.submenuItem} ${selectedItem === 'bitacora' ? styles.selected : ''}`}
                                            onClick={() => setSelectedItem('bitacora')}
                                        >
                                            Bitacora
                                        </Link>
                                    </li>
                                )}

                            </ul>
                        </NavItem>
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