import React from 'react';
import { useNavigate } from 'react-router-dom';
import AyudaTooltip from '../../components/ayudanteinfo/AyudaTooltip';
import Ciclo from '../../components/ayudanteCiclo/Ciclo';
import icon from '../../components/iconos/iconos';
import styles from './landing.module.css';
import img from '../../components/image/image.jsx';

const BENEFICIOS = [
  'Automatización y trazabilidad total de inspecciones de campo.',
  'Gestión centralizada de propiedades, productores y cultivos.',
  'Control de plagas y programas fitosanitarios.',
  'Exportación de reportes en PDF y Excel.',
  'Interfaz moderna y adaptable a cualquier dispositivo.',
  'Seguridad y control de acceso por roles.',
  'Integración con laboratorios y seguimiento documental.',
  'Panel de ayuda y notificaciones automáticas.',
];

const CONTACTOS = [
  { icon: icon.link, label: 'Correo', value: 'BadDevPrograming@gmail.com' },
  { icon: icon.telefono, label: 'Teléfono', value: '+58 416-1698315' },
  { icon: icon.mapa, label: 'Dirección', value: 'Av. Principal INSAI, Caracas, Venezuela' },
  { icon: icon.web, label: 'Web', value: 'www.insai.gob.ve' },
];

const GALERIA = [
  { src: img.conver, alt: 'Hero SICIC-INSAI', desc: 'Gestión fitosanitaria digital.' },
  { src: img.inspeccion2, alt: 'Inspección de campo', desc: 'Inspección fitosanitaria en cultivos.' },
  { src: img.inspeccion, alt: 'Laboratorio', desc: 'Análisis de muestras en laboratorio.' },
  { src: img.loquehacemos, alt: 'Campo agrícola', desc: 'Monitoreo de plagas en campo abierto.' },
];

function Landing() {
  const navigate = useNavigate();

  return (
    <div className={styles.landingWrap}>
      {/* Header público */}
      <header className={styles.publicHeader}>
        <div className={styles.headerLeft}>
            <img src={img.sicic5} alt="Logo SICIC-INSAI" className={styles.headerLogo} />
            <span className={styles.headerTitle}>SICIC-INSAI</span>
        </div>
        <nav className={styles.headerNav}>
            <div className={styles.headerLinks}>
            <a href="#hero" className={styles.headerBadge}>Inicio</a>
            <a href="#proceso" className={styles.headerBadge}>Proceso</a>
            <a href="#ciclo" className={styles.headerBadge}>Ciclo</a>
            <a href="#beneficios" className={styles.headerBadge}>Beneficios</a>
            <a href="#modulos" className={styles.headerBadge}>Módulos</a>
            <a href="#galeria" className={styles.headerBadge}>Galería</a>
            <a href="#contacto" className={styles.headerBadge}>Contacto</a>
            </div>
            <button className={styles.headerLoginBtn} onClick={() => navigate('/Login')}>
            Iniciar Sesión
            </button>
        </nav>
        </header>

      {/* Hero Section */}
      <section id="hero" className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h2 className={styles.heroTitle}>Bienvenido</h2>
          <p className={styles.heroSubtitle}>
            Sistema de Información para el Control de Inspecciones de Campo
          </p>
          <button className={styles.heroBtn} onClick={() => navigate('/Login')}>
            Acceder al sistema
          </button>
          <div style={{position: 'relative', display:'inline-block', top:10}}>
            <AyudaTooltip descripcion="SICIC-INSAI permite gestionar todas las operaciones fitosanitarias del INSai, desde el registro de propiedades y productores hasta la generación de reportes y seguimiento de inspecciones." />

          </div>
        </div>
        <div className={styles.heroImgWrap}>
          <img src={img.perro} alt="Gestión fitosanitaria" className={styles.heroImg} />
        </div>
      </section>

      {/* Misión y visión */}
      <section className={styles.misionSection}>
        <div className={styles.misionContent}>
          <h2>Misión</h2>
          <p>
            Proveer al INSai una plataforma tecnológica robusta para el control, registro y seguimiento de inspecciones de campo, garantizando la sanidad vegetal y la seguridad agroalimentaria nacional.
          </p>
          <h2>Visión</h2>
          <p>
            Ser el sistema líder en gestión fitosanitaria, promoviendo la innovación, la trazabilidad y la transparencia en todos los procesos agrícolas del país.
          </p>
        </div>
        <div className={styles.misionImgWrap}>
          <img src={img.cafe} alt="Misión SICIC-INSAI" className={styles.misionImg} />
        </div>
      </section>

      {/* Proceso principal */}
      <section id="proceso" className={styles.procesoSection}>
        <h2 className={styles.sectionTitle}>¿Cómo funciona SICIC-INSAI?</h2>
        <div className={styles.procesoSteps}>
          <div className={styles.procesoStep}>
            <img src={icon.admin} alt="Propiedad" />
            <span>Registro de propiedades y productores.</span>
          </div>
          <div className={styles.procesoStep}>
            <img src={icon.ver} alt="Solicitud" />
            <span>Creación de solicitudes de inspección.</span>
          </div>
          <div className={styles.procesoStep}>
            <img src={icon.calendario} alt="Planificación" />
            <span>Planificación de actividades y asignación de empleados.</span>
          </div>
          <div className={styles.procesoStep}>
            <img src={icon.farmer} alt="Inspección" />
            <span>Realización de inspecciones y registro de resultados.</span>
          </div>
          <div className={styles.procesoStep}>
            <img src={icon.grafica} alt="Laboratorio" />
            <span>Análisis de muestras y generación de reportes.</span>
          </div>
          <div className={styles.procesoStep}>
            <img src={icon.lupa2} alt="Programa" />
            <span>Gestión de programas fitosanitarios y seguimiento.</span>
          </div>
        </div>
        <div className={styles.procesoParrafo}>
          <p>
            SICIC-INSAI integra todos los pasos del flujo de trabajo, permitiendo la trazabilidad desde el registro inicial de la propiedad hasta el seguimiento de los programas y la generación de reportes técnicos y epidemiológicos.
          </p>
        </div>
      </section>

      {/* Ciclo de tareas */}
      <section id="ciclo" className={styles.cicloSection}>
        <h2 className={styles.sectionTitle}>Ciclo de tareas SICIC-INSAI</h2>
        <div className={styles.cicloHost}>
            <Ciclo />
        </div>
        <div className={styles.cicloExplicacionFull}>
            <h3>¿Qué representa el ciclo?</h3>
            <p>
            El ciclo de tareas muestra cómo SICIC-INSAI conecta el registro de propiedades, la planificación de inspecciones, la ejecución de actividades, el análisis en laboratorio y el seguimiento de programas, asegurando la protección vegetal y la calidad de los cultivos.
            </p>
            <ul>
            <li><strong>Inicio:</strong> Registro de propiedad y productor.</li>
            <li><strong>Solicitud:</strong> Solicitud de inspección fitosanitaria.</li>
            <li><strong>Planificación:</strong> Programación de actividades y asignación de personal.</li>
            <li><strong>Inspección:</strong> Ejecución y registro de resultados.</li>
            <li><strong>Seguimiento:</strong> Control de programas y trazabilidad de acciones.</li>
            </ul>
        </div>
        </section>

      {/* Sistemas vinculados */}
      <section id="sistemas-insai" className={styles.sistemasSection}>
        <h2 className={styles.sectionTitle}>Sistemas vinculados al INSAI</h2>
        <div className={styles.sistemasGrid}>
          <div className={styles.sistemaCard}>
            <img src={img.runsai} alt="RUNSAI" className={styles.sistemaImg} />
            <h3>RUNSAI</h3>
            <p>
              Sistema matriz del INSAI. Permite el registro de empresas, personas naturales y jurídicas en áreas de sanidad animal y vegetal. Gestiona solicitudes, certificaciones, inspecciones y autorizaciones sanitarias.
            </p>
          </div>
          <div className={styles.sistemaCard}>
            <img src={img.sigmav} alt="SIGMAV" className={styles.sistemaImg} />
            <h3>SIGMAV</h3>
            <p>
              Sistema para tramitar guías de movilización animal y vegetal. Es obligatorio para transportar productos agropecuarios en el país, incluyendo mascotas y mercancía agrícola.
            </p>
          </div>
          <div className={styles.sistemaCard}>
            <img src={img.sigensai} alt="SIGESAI" className={styles.sistemaImg} />
            <h3>SIGESAI</h3>
            <p>
              Sistema de información y gestión para el traslado y comercialización de productos vegetales. Requiere registro de empresas agrícolas y comercializadoras para obtener guías de movilización.
            </p>
          </div>
          <div className={styles.sistemaCard}>
            <img src={img.sicic5} alt="SICIC-INSAI" className={styles.sistemaImg} />
            <h3>SICIC-INSAI</h3>
            <p>
              Plataforma para la gestión, trazabilidad y control de inspecciones fitosanitarias en campo. Optimiza y digitaliza los procesos técnicos del INSAI.
            </p>
          </div>
        </div>
      </section>

      {/* Beneficios */}
      <section id="beneficios" className={styles.featuresSection}>
        <h2 className={styles.sectionTitle}>¿Qué ofrece SICIC-INSAI?</h2>
        <div className={styles.featuresGrid}>
          {BENEFICIOS.map((b, idx) => (
            <div key={idx} className={styles.featureCard}>
              <span>{b}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Módulos principales */}
      <section id="modulos" className={styles.modulesSection}>
        <h2 className={styles.sectionTitle}>Módulos Principales</h2>
        <div className={styles.modulesGrid}>
          <div className={styles.moduleCard}>
            <img src={icon.homeIcon} alt="Gestión de Propiedades" className={styles.moduleIcon} />
            <h3>Gestión de Propiedades</h3>
            <p>Registro, edición y seguimiento de propiedades agrícolas.</p>
          </div>
          <div className={styles.moduleCard}>
            <img src={icon.productor} alt="Productores" className={styles.moduleIcon} />
            <h3>Productores</h3>
            <p>Administración de productores y sus datos asociados.</p>
          </div>
          <div className={styles.moduleCard}>
            <img src={icon.calendario} alt="Planificaciones" className={styles.moduleIcon} />
            <h3>Planificaciones</h3>
            <p>Programación y control de actividades de inspección.</p>
          </div>
          <div className={styles.moduleCard}>
            <img src={icon.farmer} alt="Inspecciones" className={styles.moduleIcon} />
            <h3>Inspecciones</h3>
            <p>Registro, trazabilidad y generación de actas de inspección.</p>
          </div>
          <div className={styles.moduleCard}>
            <img src={icon.escudobien} alt="Programas Fitosanitarios" className={styles.moduleIcon} />
            <h3>Programas Fitosanitarios</h3>
            <p>Gestión de programas, plagas, cultivos y empleados responsables.</p>
          </div>
          <div className={styles.moduleCard}>
            <img src={icon.cubo} alt="Laboratorios" className={styles.moduleIcon} />
            <h3>Laboratorios</h3>
            <p>Control de muestras y resultados de laboratorio.</p>
          </div>
          <div className={styles.moduleCard}>
            <img src={icon.hormiga} alt="Plagas" className={styles.moduleIcon} />
            <h3>Plagas</h3>
            <p>Catálogo y seguimiento de plagas fitosanitarias.</p>
          </div>
          <div className={styles.moduleCard}>
            <img src={icon.plantaenmaceta} alt="Cultivos" className={styles.moduleIcon} />
            <h3>Cultivos</h3>
            <p>Catálogo y gestión de cultivos agrícolas.</p>
          </div>
          <div className={styles.moduleCard}>
            <img src={icon.user} alt="Usuarios y Roles" className={styles.moduleIcon} />
            <h3>Usuarios y Roles</h3>
            <p>Administración de usuarios, roles y permisos.</p>
          </div>
          <div className={styles.moduleCard}>
            <img src={icon.bitacora} alt="Bitácora" className={styles.moduleIcon} />
            <h3>Bitácora</h3>
            <p>Registro de actividades y auditoría del sistema.</p>
          </div>
        </div>
      </section>

      {/* Galería visual */}
      <section id="galeria" className={styles.galeriaSection}>
        <h2 className={styles.sectionTitle}>Galería SICIC-INSAI</h2>
        <div className={styles.galeriaGrid}>
          {GALERIA.map((imgItem, idx) => (
            <div key={idx} className={styles.galeriaCard}>
              <img src={imgItem.src} alt={imgItem.alt} className={styles.galeriaImg} />
              <div className={styles.galeriaDesc}>{imgItem.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Sección legal / institucional */}
      <section className={styles.legalSection}>
        <h2 className={styles.sectionTitle}>Normativas</h2>
        <div className={styles.legalContent}>
          <div className={styles.legalText}>
            <p>
              SICIC-INSAI cumple con la normativa vigente del Instituto Nacional de Salud Agrícola Integral y está respaldado por las disposiciones legales nacionales en materia fitosanitaria.
              Toda la información y los procesos están alineados con la Gaceta Oficial y los reglamentos técnicos del sector agrícola.
            </p>
          </div>
          <div className={styles.legalImgWrap}>
            <img src={img.gaceta} alt="Gaceta Oficial INSAI" className={styles.legalImg} />
          </div>
        </div>
      </section>

      {/* Footer público */}
    <footer id="contacto" className={styles.publicFooter}>
        <div className={styles.footerContent}>
            {/* Izquierda: Logo y copyright */}
            <div className={styles.footerLogoBlock}>
            <div className={styles.footerLogo}>
                <img src={img.sicic5} alt="Logo SICIC-INSAI" />
                <span>SICIC-INSAI</span>
            </div>
            <div className={styles.footerBottom}>
                <span>© {new Date().getFullYear()} SICIC-INSAI - Todos los derechos reservados.</span>
            </div>
            </div>
            {/* Centro: Contactos en dos columnas */}
            <div className={styles.footerContact}>
            <h3>Contacto</h3>
            <div className={styles.contactGrid}>
                <ul>
                {CONTACTOS.slice(0, 2).map((c, idx) => (
                    <li key={idx} className={styles.contactItem}>
                    <img src={c.icon} alt={c.label} className={styles.contactIcon} />
                    <span className={styles.contactLabel}>{c.label}:</span>
                    <span className={styles.contactValue}>{c.value}</span>
                    </li>
                ))}
                </ul>
                <ul>
                {CONTACTOS.slice(2, 4).map((c, idx) => (
                    <li key={idx} className={styles.contactItem}>
                    <img src={c.icon} alt={c.label} className={styles.contactIcon} />
                    <span className={styles.contactLabel}>{c.label}:</span>
                    <span className={styles.contactValue}>{c.value}</span>
                    </li>
                ))}
                </ul>
            </div>
            {/* Iconos sociales en línea debajo de los contactos */}
            <div className={styles.footerSocialIcons}>
              <a href="https://github.com/JDPR19" target="_blank" rel="noopener noreferrer">
                <img src={icon.github} alt="GitHub" className={styles.socialIcon} />
              </a>
              <a href="https://www.linkedin.com/in/jesus-daniel-perdomo-b15578261/" target="_blank" rel="noopener noreferrer">
                <img src={icon.linkeding} alt="LinkedIn" className={styles.socialIcon} />
              </a>
              <a href="https://t.me/BadOmensDEV" target="_blank" rel="noopener noreferrer">
                <img src={icon.telegram} alt="Telegram" className={styles.socialIcon} />
              </a>
            </div>
            </div>
            {/* Derecha: Enlaces útiles */}
            <div className={styles.footerLinks}>
            <h3>Enlaces útiles</h3>
            <ul>
                <li><a href="https://www.insai.gob.ve" target="_blank" rel="noopener noreferrer">Portal INSai</a></li>
                <li><a href="mailto:baddevprograming@gmail.com">Soporte Técnico</a></li>
                <li><a href="/Login">Acceso al sistema</a></li>
            </ul>
            </div>
        </div>
        </footer>
    </div>
  );
}

export default Landing;