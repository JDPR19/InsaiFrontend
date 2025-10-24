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
    { nombre: 'Verde claro', color: '#98c79a', var: '--light-green' },
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

             {/* Guía rápida de uso */}
            <section className={styles.guiaRapida}>
                <h2>Guía rápida para nuevos usuarios</h2>
                <ol className={styles.guiaPasos}>
                    <li>Regístrate o inicia sesión con tus credenciales institucionales.</li>
                    <li>Accede al menú principal para gestionar solicitudes, inspecciones y permisos.</li>
                    <li>Utiliza la barra de búsqueda y los filtros para encontrar información rápidamente.</li>
                    <li>Exporta tus reportes y tablas en PDF o Excel desde cada módulo.</li>
                    <li>Consulta el manual de usuario o contacta soporte si tienes dudas.</li>
                </ol>
                {/* Si tienes video tutorial, puedes agregarlo aquí */}
                {/* <iframe src="URL_DEL_VIDEO" width="100%" height="320" title="Tutorial SICIC-INSAI" /> */}
            </section>

             {/* Características principales */}
            <section className={styles.caracteristicas}>
                <h2>¿Qué puedes hacer aquí?</h2>
                <div className={styles.cardsGrid}>
                    {/* ...tus cards actuales... */}
                    <div className={styles.card}>
                        <img src={Icon.notificacion} alt="Notificaciones" />
                        <h3>Recibe notificaciones</h3>
                        <p>El sistema te avisa sobre cambios, vencimientos y aprobaciones importantes.</p>
                    </div>
                    <div className={styles.card}>
                        <img src={Icon.soporte} alt="Soporte" />
                        <h3>Soporte y ayuda</h3>
                        <p>Accede a manuales, preguntas frecuentes y contacto directo con el equipo INSAI.</p>
                    </div>
                </div>
            </section>

             {/* Guía visual interactiva */}
            <section className={styles.guiaVisual}>
                <h2>Guía visual de módulos</h2>
                <div className={styles.pasosGrid}>
                    <div className={styles.paso}>
                        <img src={Icon.cliente} alt="Solicitudes" />
                        <span>Solicitudes y actividades</span>
                    </div>
                    <div className={styles.paso}>
                        <img src={Icon.calendario} alt="Planificación" />
                        <span>Planificación y calendario</span>
                    </div>
                    <div className={styles.paso}>
                        <img src={Icon.lupa} alt="Inspección" />
                        <span>Inspecciones y seguimiento</span>
                    </div>
                    <div className={styles.paso}>
                        <img src={Icon.user} alt="Usuarios" />
                        <span>Gestión de usuarios y permisos</span>
                    </div>
                    <div className={styles.paso}>
                        <img src={Icon.excel} alt="Exportar" />
                        <span>Exporta y comparte reportes</span>
                    </div>
                </div>
            </section>

              {/* Glosario de términos */}
            <section className={styles.glosarioSection}>
                <h2>Glosario de términos clave</h2>
                <ul className={styles.glosarioList}>
                    <li><b>Solicitud:</b> Petición formal para inspección o permiso fitosanitario.</li>
                    <li><b>Planificación:</b> Programación de actividades e inspecciones.</li>
                    <li><b>Inspección:</b> Evaluación técnica realizada por personal autorizado.</li>
                    <li><b>RUNSAI:</b> Registro Único Nacional de Salud Agrícola Integral.</li>
                    <li><b>Permiso:</b> Autorización oficial para actividades agrícolas.</li>
                </ul>
            </section>

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
            {/* <section className={styles.ayudaVisual}>
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
            </section> */}

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

             {/* Novedades y actualizaciones */}
            <section className={styles.novedadesSection}>
                <h2>Novedades y actualizaciones</h2>
                <ul>
                    <li>Nuevo módulo de trazabilidad de inspecciones.</li>
                    <li>Mejoras en exportación de reportes y tablas.</li>
                    <li>Actualización de la interfaz para mayor accesibilidad.</li>
                    <li>Soporte para notificaciones automáticas y recordatorios.</li>
                </ul>
            </section>

            {/* Sobre el equipo y contacto */}
            <section className={styles.sobreNosotros}>
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
            </section>

            {/* Accesibilidad y seguridad */}
            <section className={styles.accesibilidadSection}>
                <h2>Accesibilidad y seguridad</h2>
                <p>
                    SICIC-INSAI cumple con estándares de accesibilidad web y protege tus datos con protocolos de seguridad institucional. Puedes activar el modo oscuro y ajustar el tamaño de fuente desde la configuración de usuario.
                </p>
            </section>

            {/* Sección de contacto y soporte */}
            <section className={styles.contactoSection}>
                <h2>¿Necesitas ayuda o soporte?</h2>
                <form className={styles.contactForm} onSubmit={(e) => { e.preventDefault(); /* Aquí puedes manejar el envío */ }}>
                    <div className={styles.formGroup}>
                        <label>Nombre:</label>
                        <input type="text" className="input" required placeholder="Tu nombre" />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Correo electrónico:</label>
                        <input type="email" className="input" required placeholder="Tu correo" />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Mensaje:</label>
                        <textarea className="textarea" required placeholder="¿En qué podemos ayudarte?" />
                    </div>
                    <button type="submit" className={styles.btnHome}>Enviar mensaje</button>
                </form>
                <p style={{ marginTop: 12, color: '#888', textAlign: 'center' }}>
                    También puedes escribirnos a <b>BadDevprograming@gmail.com</b> o usar el chat de ayuda en la esquina inferior derecha.
                </p>
            </section>

            <a
                href="https://wa.me/584161698315?text=Hola,%20necesito%20soporte%20con%20SICIC-INSAI"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.chatBtn}
                title="Chat de soporte"
                >
                <img src={Icon.wassat} alt="Chat WhatsApp" style={{ width: 38, height: 38 }} />
            </a>

            <footer className={styles.footer}>
                <div className={styles.footerContent}>
                    <span>SICIC-INSAI © {new Date().getFullYear()} · Todos los derechos reservados</span>
                    <div className={styles.footerLinks}>
                        <a href="https://www.instagram.com/insai_ve" target="_blank" rel="noopener noreferrer">
                            <img src={Icon.linkeding} alt="Instagram" className={`${styles.footerIcon} instagram`} />
                        </a>
                        <a href="https://www.facebook.com/insai.ve" target="_blank" rel="noopener noreferrer">
                            <img src={Icon.github} alt="GitHub" className={`${styles.footerIcon} github`} />
                        </a>
                        <a href="https://twitter.com/insai_ve" target="_blank" rel="noopener noreferrer">
                            <img src={Icon.telegram} alt="Telegram" className={`${styles.footerIcon} telegram`} />
                        </a>
                        <a href="https://www.insai.gob.ve" target="_blank" rel="noopener noreferrer">
                            <img src={Icon.git} alt="Git" className={`${styles.footerIcon} git`} />
                        </a>
                        <a href="https://www.insai.gob.ve" target="_blank" rel="noopener noreferrer">
                            <img src={Icon.link} alt="Sitio Web" className={`${styles.footerIcon} link`} />
                        </a>
                    </div>
                </div>
            </footer>

        </div>
    );
}

export default Informativa;