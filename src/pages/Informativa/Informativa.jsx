import { useNavigate } from 'react-router-dom';
import AyudaTooltip from '../../components/ayudanteinfo/AyudaTooltip';
import styles from './informacion.module.css';
import Icon from '../../components/iconos/iconos';
import sicic from '../../../public/assets/logo-sisic3.png'

const preguntasInfo = [
    {
        pregunta: '¿Qué puedo hacer en este sistema?',
        descripcion: 'Puedes gestionar solicitudes, planificaciones, inspecciones, permisos y mucho más, todo desde un solo lugar y de forma sencilla.'
    },
    {
        pregunta: '¿Cómo registro una nueva solicitud?',
        descripcion: 'Haz clic en el menú "Solicitudes y Planificaciones", luego pulsa el botón "Agregar" y completa el formulario con los datos requeridos.'
    },
    {
        pregunta: '¿Cómo encuentro una planificación específica?',
        descripcion: 'Utiliza el calendario para ver las fechas programadas y la barra de búsqueda para filtrar por actividad, estado o fecha.'
    },
    {
        pregunta: '¿Puedo exportar mis datos?',
        descripcion: 'Sí, puedes exportar tablas y reportes en formato PDF o Excel usando los botones de exportación en cada sección.'
    },
    {
        pregunta: '¿Qué hago si tengo problemas para acceder?',
        descripcion: 'Verifica tu usuario y contraseña. Si olvidaste tu clave, usa la opción de recuperación en la pantalla de inicio de sesión.'
    }
];

const colores = [
    { nombre: 'Verde institucional', color: '#539E43', var: '--green9' },
    { nombre: 'Verde claro', color: '#98c79a', var: '--lithg-green' },
    { nombre: 'Rojo vino', color: '#9a031e', var: '--vino-red' },
    { nombre: 'Mostaza', color: '#cca011', var: '--mostaza' },
    { nombre: 'Gris claro', color: '#DEE2E6', var: '--grey' },
    { nombre: 'Negro', color: '#212529', var: '--black' },
    { nombre: 'Blanco', color: '#ffffff', var: '--white' }
];

function Informativa() {
    const navigate = useNavigate();

    return (
        <div className={styles.landingContainer}>
            {/* Encabezado principal */}
            <header className={styles.header}>
                <img src={sicic} alt="Logo INSAI" className={styles.logo} />
                <h1 className={styles.titulo}>Bienvenido a SICIC-INSAI</h1>
                <p className={styles.subtitulo}>
                    Plataforma institucional para la gestión fitosanitaria, solicitudes, inspecciones y permisos agrícolas. <br />
                    <span style={{ color: '#539E43', fontWeight: 600 }}>INSAI</span> - Innovación y seguridad para el sector agropecuario venezolano.
                </p>
                <button
                    className={styles.btnHome}
                    onClick={() => navigate('/Home')}
                    title="Ir al Panel Principal"
                >
                    Ir al Panel Principal
                </button>
            </header>

            <header className={styles.header}>
                <button
                    className={styles.btnHome}
                    // onClick={() => navigate('/Home')}
                    title="Descargar Manual"
                >
                    Manual
                </button>
            </header>

            {/* Paleta de colores institucional */}
            <section className={styles.paletaSection}>
                <h2>Paleta de Colores Institucional</h2>
                <div className={styles.paletaColores}>
                    {colores.map((c, idx) => (
                        <div key={idx} className={styles.colorCard}>
                            <div
                                className={styles.colorBox}
                                style={{ background: c.color }}
                                title={c.var}
                            />
                            <span className={styles.colorName}>{c.nombre}</span>
                            <span className={styles.colorVar}>{c.var}</span>
                            <span className={styles.colorHex}>{c.color}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Sección de características */}
            <section className={styles.caracteristicas}>
                <h2>¿Qué puedes hacer aquí?</h2>
                <div className={styles.cardsGrid}>
                    <div className={styles.card}>
                        <img src={Icon.calendario} alt="Calendario" />
                        <h3>Planifica y programa</h3>
                        <p>Organiza actividades, inspecciones y tareas clave usando el calendario interactivo.</p>
                    </div>
                    <div className={styles.card}>
                        <img src={Icon.lupa2} alt="Buscar" />
                        <h3>Busca y filtra</h3>
                        <p>Encuentra información fácilmente con filtros y búsquedas inteligentes en cada módulo.</p>
                    </div>
                    <div className={styles.card}>
                        <img src={Icon.grafica} alt="Exportar PDF" />
                        <h3>Exporta tus datos</h3>
                        <p>Descarga reportes y tablas en PDF o Excel para compartir o respaldar tu información.</p>
                    </div>
                    <div className={styles.card}>
                        <img src={Icon.user} alt="Usuarios" />
                        <h3>Gestión de usuarios</h3>
                        <p>Administra productores, empleados y permisos de acceso de forma segura y sencilla.</p>
                    </div>
                </div>
            </section>

            {/* Sección de ayuda visual */}
            <section className={styles.ayudaVisual}>
                <h2>¿Cómo funciona el sistema?</h2>
                <div className={styles.pasosGrid}>
                    <div className={styles.paso}>
                        <img src={Icon.cliente} alt="Agregar" />
                        <span>Registra solicitudes y actividades</span>
                    </div>
                    <div className={styles.paso}>
                        <img src={Icon.calendario} alt="Calendario" />
                        <span>Programa y visualiza en el calendario</span>
                    </div>
                    <div className={styles.paso}>
                        <img src={Icon.lupa} alt="Inspección" />
                        <span>Realiza inspecciones y seguimientos</span>
                    </div>
                    <div className={styles.paso}>
                        <img src={Icon.excel} alt="Exportar" />
                        <span>Exporta y comparte tus reportes</span>
                    </div>
                </div>
            </section>

            {/* Sección de preguntas frecuentes */}
            <section className={styles.preguntasSection}>
                <h2>Preguntas Frecuentes</h2>
                <ul className={styles.preguntasList}>
                    {preguntasInfo.map((item, idx) => (
                        <li key={idx} className={styles.preguntaItem}>
                            <span className={styles.pregunta}>{item.pregunta}</span>
                            <AyudaTooltip descripcion={item.descripcion} />
                        </li>
                    ))}
                </ul>
            </section>

            {/* Sección sobre nosotros */}
            {/* <section className={styles.sobreNosotros}>
                <h2>Sobre SICIC-INSAI</h2>
                <p>
                    SICIC-INSAI es una plataforma institucional desarrollada para facilitar la gestión fitosanitaria y administrativa en el sector agrícola venezolano.
                    Nuestro objetivo es brindar una herramienta moderna, segura y fácil de usar para productores, técnicos y autoridades, permitiendo el seguimiento eficiente de solicitudes, inspecciones, permisos y reportes.
                </p>
                <p>
                    El sistema está diseñado bajo los estándares de seguridad y accesibilidad, con una interfaz intuitiva y soporte para exportación de datos, notificaciones automáticas y gestión de usuarios.
                </p>
                <img src="/public/logo-sisic5.png" alt="Equipo INSAI" className={styles.equipoImg} />
                <p className={styles.creditos}>
                    Desarrollado por el equipo INSAI.<br />
                    Para soporte y consultas, contáctanos a través de la sección de ayuda o al correo <b>soporte@insai.gob.ve</b>
                </p>
            </section> */}
        </div>
    );
}

export default Informativa;