import { useState, useEffect } from 'react';
import TabsNotificaciones from '../../components/tabsFiltro/TabsNotificaciones';
import styles from './header.module.css';
import icon from '../../components/iconos/iconos';
import '../../main.css';
import { BaseUrl } from '../../utils/constans';

const API_URL = import.meta.env.VITE_API_URL || BaseUrl;

// Normaliza el tipo (quita tildes y a minúscula)
const normTipo = (t) =>
  String(t || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');

// Obtiene el id de inspección desde posibles campos
const getInspeccionId = (n) =>
  n?.inspeccion_est_id ??
  n?.inspeccion_id ??
  n?.inspeccionId ??
  n?.entidad_id ??
  n?.referencia_id ??
  null;

function NotificationDropdown({ notificaciones = [], marcarLeida, tabActivo, setTabActivo, open }) {
  const [showAllModal, setShowAllModal] = useState(false);
  const [detalleEntidad, setDetalleEntidad] = useState(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [tipoDetalle, setTipoDetalle] = useState(null);

  useEffect(() => {
    if (open) setTabActivo('no-leidas');
  }, [open, setTabActivo]);

  const tabsNotificaciones = [
    { key: 'no-leidas', label: 'No leídas' },
    { key: 'todas', label: 'Todas' },
    { key: 'mas', label: 'Ver mas...' }
  ];

  const handleTabClick = (key) => {
    if (key === 'mas') {
      setShowAllModal(true);
      return;
    }
    setTabActivo(key);
  };

  const filtradas =
    tabActivo === 'no-leidas'
      ? (notificaciones || []).filter((n) => !n.leida)
      : (notificaciones || []);

  const getTipoIcono = (tipoRaw) => {
    const tipo = normTipo(tipoRaw);
    switch (tipo) {
      case 'solicitud':
        return { icon: icon.ver, color: '#1976d2', tooltip: 'Ver Solicitud' };
      case 'planificacion':
        return { icon: icon.calendario, color: '#43a047', tooltip: 'Ver Planificación' };
      case 'inspeccion':
        return { icon: icon.lupa2, color: '#cadc56', tooltip: 'Ver Inspección' };
      case 'alerta':
        return { icon: icon.error, color: '#e70d0d', tooltip: 'Ver Alerta' };
      case 'usuario':
        return { icon: icon.user, color: '#43a047', tooltip: 'Ver Usuario' };
      default:
        return { icon: icon.lupa2, color: '#fafafa', tooltip: 'Ver Detalle' };
    }
  };

  const handleVerDetalleEntidad = async (n) => {
    const tipo = normTipo(n.tipo);
    const inspeccionId = tipo === 'inspeccion' ? getInspeccionId(n) : null;

    // Abrir modal de inmediato con "Cargando..."
    setDetalleEntidad({});
    setLoadingDetalle(true);
    setTipoDetalle(tipo);

    let url = '';
    if (tipo === 'solicitud' && n.solicitud_id) {
      url = `${API_URL}/notificaciones/solicitud/${n.solicitud_id}`;
    } else if (tipo === 'planificacion' && n.planificacion_id) {
      url = `${API_URL}/notificaciones/planificacion/${n.planificacion_id}`;
    } else if (tipo === 'inspeccion' && inspeccionId) {
      url = `${API_URL}/notificaciones/inspeccion/${inspeccionId}`;
    } else {
      setLoadingDetalle(false);
      setDetalleEntidad({ error: 'No se puede mostrar el detalle.' });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      let res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });

      // Fallback al endpoint directo de inspecciones si el de notificaciones falla
      if (!res.ok && tipo === 'inspeccion' && inspeccionId) {
        res = await fetch(`${API_URL}/inspecciones/${inspeccionId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      const data = await res.json();
      setDetalleEntidad(data);
    } catch (error) {
      console.error(error);
      setDetalleEntidad({ error: 'No se pudo cargar el detalle.' });
    } finally {
      setLoadingDetalle(false);
    }
  };

  // Render de una notificación
  const renderNotificacion = (n, extraStyle = {}) => {
    const tipo = normTipo(n.tipo);
    const { icon: tipoIcon, color, tooltip } = getTipoIcono(tipo);
    const inspeccionId = tipo === 'inspeccion' ? getInspeccionId(n) : null;

    const canOpenDetalle =
      (tipo === 'solicitud' && n.solicitud_id) ||
      (tipo === 'planificacion' && n.planificacion_id) ||
      (tipo === 'inspeccion' && inspeccionId);

    const createdAt = n?.created_at ? new Date(n.created_at) : null;
    const createdAtStr = createdAt
      ? createdAt.toLocaleString('es-VE', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        })
      : '';

    return (
      <div
        key={n.id}
        className={`${styles.notificacionItem} ${n.leida ? styles.leida : ''}`}
        style={extraStyle}
        onClick={() => {
          marcarLeida(n.id);
          if (canOpenDetalle) handleVerDetalleEntidad(n);
        }}
      >
        {n.mensaje}
        <span className={styles.fecha}>
          {createdAtStr}
          {/* Icono de acción: siempre visible, clic abre el detalle si hay IDs */}
          <img
            src={tipoIcon}
            alt={tooltip}
            title={tooltip}
            style={{
              marginLeft: 8,
              cursor: canOpenDetalle ? 'pointer' : 'not-allowed',
              width: 18,
              verticalAlign: 'middle',
              filter: `drop-shadow(0 0 2px ${color})`,
              opacity: canOpenDetalle ? 1 : 0.5
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (canOpenDetalle) handleVerDetalleEntidad(n);
            }}
          />
        </span>
        {!n.leida && <span className={styles.nueva}>●</span>}
      </div>
    );
  };

  return (
    <>
      <div className={styles.dropdown}>
        <h4>Notificaciones</h4>
        <TabsNotificaciones tabs={tabsNotificaciones} activeTab={tabActivo} onTabClick={handleTabClick} />
        {filtradas.length === 0 && <div className={styles.empty}>Sin notificaciones</div>}
        {filtradas.map((n) => renderNotificacion(n))}
      </div>

      {showAllModal && (
        <div className={styles.modalDetalleNotificacion}>
          <div className={styles.detalleNotificacion}>
            <button onClick={() => setShowAllModal(false)} className="closeButton" title="Cerrar">
              &times;
            </button>
            <h2 style={{ marginBottom: 16 }}>Todas las notificaciones</h2>
            {notificaciones.length === 0 ? (
              <div className={styles.empty}>Sin notificaciones</div>
            ) : (
              notificaciones.map((n) => renderNotificacion(n, { fontSize: '1.1rem', padding: 16 }))
            )}
          </div>
        </div>
      )}

      {detalleEntidad && (
        <div className={styles.modalDetalleNotificacion}>
          <div className={styles.detalleNotificacion}>
            <button onClick={() => setDetalleEntidad(null)} className="closeButton" title="Cerrar">
              &times;
            </button>
            {loadingDetalle ? (
              <div>Cargando...</div>
            ) : (
              <DetalleEntidadTabla entidad={detalleEntidad} tipo={tipoDetalle} getTipoIcono={getTipoIcono} />
            )}
          </div>
        </div>
      )}
    </>
  );
}

function DetalleEntidadTabla({ entidad, tipo, getTipoIcono }) {
  if (entidad?.error) return <div style={{ color: 'red' }}>{entidad.error}</div>;
  const { icon: tipoIcon, color, tooltip } = getTipoIcono(tipo);
  const sectionTitleStyle = {
    color: '#98c79a',
    fontSize: '1.2rem',
    marginTop: '1.2em',
    marginBottom: '0.5em',
    borderBottom: '2px solid #539E43',
    paddingBottom: '0.2em'
  };

  return (
    <div className={styles.modalDetalle}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 18 }}>
        <img
          src={tipoIcon}
          alt={tooltip}
          title={tooltip}
          style={{ width: 32, marginRight: 12, filter: `drop-shadow(0 0 2px ${color})` }}
        />
        <h2 style={{ margin: 0 }}>
          Detalle{' '}
          {tipo === 'solicitud'
            ? 'de Solicitud'
            : tipo === 'planificacion'
            ? 'de Planificación'
            : tipo === 'inspeccion'
            ? 'de Inspección'
            : ''}
        </h2>
      </div>

      {tipo === 'solicitud' && (
        <>
          <h1 style={sectionTitleStyle}>Datos de la Solicitud</h1>
          <table className="detalleTable">
            <tbody>
              <tr>
                <th>Código</th>
                <td>{entidad.codigo || '—'}</td>
              </tr>
              <tr>
                <th>Tipo</th>
                <td>{entidad.tipo_solicitud_nombre || '—'}</td>
              </tr>
              <tr>
                <th>Fecha solicitada</th>
                <td>{entidad.fecha_solicitada || '—'}</td>
              </tr>
              <tr>
                <th>Fecha resolución</th>
                <td>{entidad.fecha_resolucion || '—'}</td>
              </tr>
              <tr>
                <th>Usuario</th>
                <td>{entidad.usuario_username || '—'}</td>
              </tr>
              <tr>
                <th>Descripción</th>
                <td>{entidad.descripcion || '—'}</td>
              </tr>
            </tbody>
          </table>

          <h1 style={sectionTitleStyle}>Propiedad asociada</h1>
          <table className="detalleTable">
            <tbody>
              <tr>
                <th>Nombre</th>
                <td>{entidad.propiedad_nombre || '—'}</td>
              </tr>
              <tr>
                <th>RIF</th>
                <td>{entidad.propiedad_rif || '—'}</td>
              </tr>
              <tr>
                <th>Hectáreas</th>
                <td>{entidad.propiedad_hectareas ?? '—'}</td>
              </tr>
              <tr>
                <th>Ubicación</th>
                <td>{entidad.propiedad_ubicacion || '—'}</td>
              </tr>
              <tr>
                <th>Certificado</th>
                <td>{entidad.posee_certificado ? 'Sí' : 'No'}</td>
              </tr>
            </tbody>
          </table>
        </>
      )}

      {tipo === 'planificacion' && (
        <>
          <h1 style={sectionTitleStyle}>Datos de la Planificación</h1>
          <table className="detalleTable">
            <tbody>
              <tr>
                <th>Código</th>
                <td>{entidad.codigo || '—'}</td>
              </tr>
              <tr>
                <th>Fecha programada</th>
                <td>{entidad.fecha_programada || '—'}</td>
              </tr>
              <tr>
                <th>Hora pautada</th>
                <td>{entidad.hora || '—'}</td>
              </tr>
              <tr>
                <th>Estado</th>
                <td>{entidad.solicitud_estado || '—'}</td>
              </tr>
              <tr>
                <th>Solicitud</th>
                <td>{entidad.solicitud_codigo || '—'}</td>
              </tr>
              <tr>
                <th>Descripción de Solicitud</th>
                <td>{entidad.solicitud_descripcion || '—'}</td>
              </tr>
            </tbody>
          </table>

          {Array.isArray(entidad.empleados) && entidad.empleados.length > 0 && (
            <>
              <h1 style={sectionTitleStyle}>Empleados asignados</h1>
              <table className="detalleTable">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Cédula</th>
                    <th>Cargo</th>
                  </tr>
                </thead>
                <tbody>
                  {entidad.empleados.map((emp) => (
                    <tr key={emp.id}>
                      <td>{`${emp.nombre || ''} ${emp.apellido || ''}`.trim() || '—'}</td>
                      <td>{emp.cedula || '—'}</td>
                      <td>{emp.cargo || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </>
      )}

      {tipo === 'inspeccion' && (
        <>
          <h1 style={sectionTitleStyle}>Datos de la Inspección</h1>
          <table className="detalleTable">
            <tbody>
              <tr>
                <th>Código UBIGEO</th>
                <td>{entidad.codigo_inspeccion || '—'}</td>
              </tr>
              <tr>
                <th>Fecha</th>
                <td>{entidad.fecha_inspeccion || '—'}</td>
              </tr>
              <tr>
                <th>Hora real</th>
                <td>{entidad.hora_inspeccion || '—'}</td>
              </tr>
              <tr>
                <th>N° Control</th>
                <td>{entidad.n_control || '—'}</td>
              </tr>
              <tr>
                <th>Aspectos</th>
                <td>{entidad.aspectos || '—'}</td>
              </tr>
              <tr>
                <th>Ordenamientos</th>
                <td>{entidad.ordenamientos || '—'}</td>
              </tr>
            </tbody>
          </table>

          <h1 style={sectionTitleStyle}>Asociaciones</h1>
          <table className="detalleTable">
            <tbody>
              <tr>
                <th>Planificación</th>
                <td>{entidad.planificacion_codigo || entidad.planificacion_id || '—'}</td>
              </tr>
              <tr>
                <th>Solicitud</th>
                <td>{entidad.solicitud_codigo || entidad.solicitud_id || '—'}</td>
              </tr>
              <tr>
                <th>Propiedad</th>
                <td>{entidad.propiedad_nombre || '—'}</td>
              </tr>
              <tr>
                <th>RIF</th>
                <td>{entidad.propiedad_rif || '—'}</td>
              </tr>
              <tr>
                <th>Ubicación</th>
                <td>{entidad.propiedad_ubicacion || '—'}</td>
              </tr>
            </tbody>
          </table>

          {Array.isArray(entidad.finalidades) && entidad.finalidades.length > 0 && (
            <>
              <h1 style={sectionTitleStyle}>Finalidades</h1>
              <table className="detalleTable">
                <tbody>
                  {entidad.finalidades.map((fin) => (
                    <tr key={fin.id}>
                      <th>{fin.finalidad}</th>
                      <td>{fin.objetivo || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {Array.isArray(entidad.imagenes) && entidad.imagenes.length > 0 && (
            <>
              <h1 style={sectionTitleStyle}>Imágenes</h1>
              <div className="carouselTrack" style={{ gap: 10, marginTop: 10 }}>
                {entidad.imagenes.slice(0, 8).map((img) => (
                  <a
                    key={img.id}
                    href={`${API_URL}/uploads/inspeccion_est/${img.imagen}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src={`${API_URL}/uploads/inspeccion_est/${img.imagen}`}
                      alt="img"
                      className="imgThumb"
                    />
                  </a>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default NotificationDropdown;