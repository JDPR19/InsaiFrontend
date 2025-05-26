import React, { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import styles from './menu.module.css';
import icon from '../../components/iconos/iconos';
import { registrarCierreSesion} from '../../utils/bitacoraService';

function NavItem({ id, openSubmenus, setOpenSubmenus, selectedItem, setSelectedItem, iconSrc, label, linkTo, children }) {
    const isOpen = openSubmenus[id]; // Verifica si este submenú está abierto
    const isSelected = selectedItem === id; // Verifica si este ítem está seleccionado

    const handleClick = () => {
        if (children) {
            // Solo alterna el submenú si hay hijos
            setOpenSubmenus((prev) => ({ ...prev, [id]: !prev[id] }));
        }
        setSelectedItem(id); // Marca este ítem como seleccionado
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
                    {/* Renderiza la flecha solo si hay hijos */}
                    {children && (
                        <img
                            src={icon.flecha}
                            alt="Flecha"
                            className={`${styles.iconFlecha} ${isOpen ? styles.iconRotated : ''}`}
                        />
                    )}
                </div>
            )}
            {/* Submenús, si existen */}
            {children && (
                <div className={`${styles.submenuContainer} ${isOpen ? styles.submenuOpen : ''}`}>
                    {children}
                </div>
            )}
        </li>
    );
}

function Menu() {

    const [openSubmenus, setOpenSubmenus] = useState({}); // Estado para manejar los submenús abiertos
    const [selectedItem, setSelectedItem] = useState(null); // Estado para manejar el ítem seleccionado
    const [isCollapsed, setIsCollapsed] = useState(true); // Estado para manejar el colapso del menú
    const navigate = useNavigate();

    // const handleRegistrarCierreSesion = (username) => {
    //     registrarCierreSesion(username); // Usa cualquier nombre de usuario que esté logueado
    // };


    const handleLogout = async () => {
        try {
            // Obtén los datos del usuario desde localStorage
            const user = JSON.parse(localStorage.getItem('user')); // Convierte el valor almacenado
            const userId = user?.id; // Extrae el ID del usuario
            const username = user?.username; // Extrae el nombre del usuario
    
            console.log(`Intentando registrar cierre de sesión para: ${username} con ID: ${userId}`);
    
            // Registrar el cierre de sesión en la bitácora
            if (userId && username) {
                registrarCierreSesion(userId, username);
            } else {
                console.warn('No se encontraron datos del usuario para registrar el cierre de sesión.');
            }
    
            // Realizar la solicitud de logout al backend
            const response = await fetch('http://localhost:4000/auth/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
    
            if (response.ok) {
                console.log('Logout exitoso');
                // Limpiar almacenamiento local y redirigir al login
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                window.history.replaceState(null, '', '/');
                navigate('/', { replace: true }); // Redirige al login
            } else {
                console.error('Error al cerrar sesión:', await response.text());
            }
        } catch (error) {
            console.error('Error al conectar con el servidor:', error);
        }
    };
    
    


    return (
        <main
            className={`${styles.container} ${isCollapsed ? styles.collapsed : ''}`}
            onMouseEnter={() => setIsCollapsed(false)} // Expande el menú al pasar el mouse
            onMouseLeave={() => setIsCollapsed(true)} // Colapsa el menú al quitar el mouse
        >
            <nav className={styles.sidebar}>
                <ul className={styles.navList}>
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
                    
                     {/* cliente y propiedad ///////////////////7 */}
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
                            <li>
                                <Link
                                    to="/Productor"
                                    className={`${styles.submenuItem} ${selectedItem === 'productores' ? styles.selected : ''}`}
                                    onClick={() => setSelectedItem('productores')}
                                >
                                    Productores
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/Propiedad"
                                    className={`${styles.submenuItem} ${selectedItem === 'propiedad' ? styles.selected : ''}`}
                                    onClick={() => setSelectedItem('propiedad')}
                                >
                                    Propiedades
                                </Link>
                            </li>
                            
                        </ul>
                    </NavItem>
                    
                    {/* Solicitudes ///////////////////7 */}
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

                    {/* inspecciones////////////////////////// */}
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

                    {/* Planificacion////////////////////////// */}
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
                    
                    {/*Parametros de Campo///////////7  */}
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
                            
                            <li>
                                <Link
                                    to="/Programas"
                                    className={`${styles.submenuItem} ${selectedItem === 'programas' ? styles.selected : ''}`}
                                    onClick={() => setSelectedItem('programas')}
                                >
                                    Programas
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/Laboratorio"
                                    className={`${styles.submenuItem} ${selectedItem === 'laboratorio' ? styles.selected : ''}`}
                                    onClick={() => setSelectedItem('laboratorio')}
                                >
                                    Laboratorios
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/Plagas"
                                    className={`${styles.submenuItem} ${selectedItem === 'plagas' ? styles.selected : ''}`}
                                    onClick={() => setSelectedItem('plagas')}
                                >
                                    Plagas
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/Cultivo"
                                    className={`${styles.submenuItem} ${selectedItem === 'cultivo' ? styles.selected : ''}`}
                                    onClick={() => setSelectedItem('cultivo')}
                                >
                                    Cultivos
                                </Link>
                            </li>
                        </ul>
                    </NavItem>


                    
                     {/*Catalogo de ubicacion//////////7  */}
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
                            <li>
                                <Link
                                    to="/TipoProductor"
                                    className={`${styles.submenuItem} ${selectedItem === 'tipoproductor' ? styles.selected : ''}`}
                                    onClick={() => setSelectedItem('tipoproductor')}
                                >
                                    Tipo de Productor
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/TipoPropiedad"
                                    className={`${styles.submenuItem} ${selectedItem === 'tipopropiedad' ? styles.selected : ''}`}
                                    onClick={() => setSelectedItem('tipopropiedad')}
                                >
                                    Tipo de Propiedad
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/TipoLaboratorio"
                                    className={`${styles.submenuItem} ${selectedItem === 'tipolaboratorio' ? styles.selected : ''}`}
                                    onClick={() => setSelectedItem('tipolaboratorio')}
                                >
                                    Tipos de Laboratorios
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/TipoPrograma"
                                    className={`${styles.submenuItem} ${selectedItem === 'tipoprograma' ? styles.selected : ''}`}
                                    onClick={() => setSelectedItem('tipoprograma')}
                                >
                                    Tipos de Programas
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/TipoSolicitud"
                                    className={`${styles.submenuItem} ${selectedItem === 'tiposolicitud' ? styles.selected : ''}`}
                                    onClick={() => setSelectedItem('tiposolicitud')}
                                >
                                    Tipos de Solicitud
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/TipoInspeccion"
                                    className={`${styles.submenuItem} ${selectedItem === 'tipoinspeccion' ? styles.selected : ''}`}
                                    onClick={() => setSelectedItem('tipoinspeccion')}
                                >
                                    Tipos de Inspecciones
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/TipoPermiso"
                                    className={`${styles.submenuItem} ${selectedItem === 'tipopermiso' ? styles.selected : ''}`}
                                    onClick={() => setSelectedItem('tipopermiso')}
                                >
                                    Tipos de Permisos
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/TipoEvento"
                                    className={`${styles.submenuItem} ${selectedItem === 'tipoevento' ? styles.selected : ''}`}
                                    onClick={() => setSelectedItem('tipoevento')}
                                >
                                    Tipos de Eventos
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/TipoCultivo"
                                    className={`${styles.submenuItem} ${selectedItem === 'tipocultivos' ? styles.selected : ''}`}
                                    onClick={() => setSelectedItem('tipocultivos')}
                                >
                                    Tipos de Cultivos
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/TipoPlaga"
                                    className={`${styles.submenuItem} ${selectedItem === 'tipoplaga' ? styles.selected : ''}`}
                                    onClick={() => setSelectedItem('tipoplaga')}
                                >
                                    Tipos de Plagas
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/Cargo"
                                    className={`${styles.submenuItem} ${selectedItem === 'cargo' ? styles.selected : ''}`}
                                    onClick={() => setSelectedItem('cargo')}
                                >
                                    Cargos
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/Estados"
                                    className={`${styles.submenuItem} ${selectedItem === 'estados' ? styles.selected : ''}`}
                                    onClick={() => setSelectedItem('estados')}
                                >
                                    Estados
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/Municipio"
                                    className={`${styles.submenuItem} ${selectedItem === 'municipio' ? styles.selected : ''}`}
                                    onClick={() => setSelectedItem('municipio')}
                                >
                                    Municipios
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/Parroquia"
                                    className={`${styles.submenuItem} ${selectedItem === 'parroquia' ? styles.selected : ''}`}
                                    onClick={() => setSelectedItem('parroquia')}
                                >
                                    Parroquias
                                </Link>
                            </li>
                        </ul>
                    </NavItem>

                    {/*Reportes  */}
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
                            
                            <li>
                                <Link
                                    to="/Permiso"
                                    className={`${styles.submenuItem} ${selectedItem === 'permiso' ? styles.selected : ''}`}
                                    onClick={() => setSelectedItem('permiso')}
                                >
                                    Reporte de Permisos
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/MuestraPlaga"
                                    className={`${styles.submenuItem} ${selectedItem === 'muestraplaga' ? styles.selected : ''}`}
                                    onClick={() => setSelectedItem('muestraplaga')}
                                >
                                    Reporte de Muestras
                                </Link>
                            </li>
                        </ul>
                    </NavItem>

                    {/*Administradorrrrrrrrrrrrrrrrrrrrr///////////7  */}
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
                            
                            <li>
                                <Link
                                    to="/Empleados"
                                    className={`${styles.submenuItem} ${selectedItem === 'empleados' ? styles.selected : ''}`}
                                    onClick={() => setSelectedItem('empleados')}
                                >
                                    Empleados
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/Usuario"
                                    className={`${styles.submenuItem} ${selectedItem === 'usuario' ? styles.selected : ''}`}
                                    onClick={() => setSelectedItem('usuario')}
                                >
                                    Usuarios
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/TipoUsuario"
                                    className={`${styles.submenuItem} ${selectedItem === 'tipousuario' ? styles.selected : ''}`}
                                    onClick={() => setSelectedItem('tipousuario')}
                                >
                                    Tipos de Usuarios
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/Bitacora"
                                    className={`${styles.submenuItem} ${selectedItem === 'bitacora' ? styles.selected : ''}`}
                                    onClick={() => setSelectedItem('bitacora')}
                                >
                                    Bitacora
                                </Link>
                            </li>
                        </ul>
                    </NavItem>
                </ul>
                {/* Footer con el botón de salida */}
                <footer className={styles.footer}>
                    <button
                        className={styles.logoutButton}
                        onClick={() => handleLogout()}
                        title="Salir del sistema"
                    >
                        <img src={icon.salida} alt="Terminar Sesión" className={styles.iconsalida}/>
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
