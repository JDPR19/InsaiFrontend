import { useState, useEffect } from 'react';
import TabsNotificaciones from '../../components/tabsFiltro/TabsNotificaciones';
import styles from './header.module.css';
import icon from '../../components/iconos/iconos'; 
import '../../main.css';

const BaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function NotificationDropdown({ notificaciones, marcarLeida, tabActivo, setTabActivo, open }) {
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

    const filtradas = tabActivo === 'no-leidas'
        ? notificaciones.filter(n => !n.leida)
        : notificaciones;

    const getTipoIcono = (tipo) => {
        switch (tipo) {
            case 'solicitud':
                return { icon: icon.ver, color: '#1976d2', tooltip: 'Ver Solicitud' };
            case 'planificacion':
                return { icon: icon.calendario, color: '#43a047', tooltip: 'Ver Planificación' };
            case 'alerta':
                return { icon: icon.error, color: '#e70d0d', tooltip: 'Ver Alerta' };
            case 'usuario':
                return { icon: icon.user, color: '#43a047', tooltip: 'Ver Usuario' };
            default:
                return { icon: icon.lupa2, color: '#fafafa', tooltip: 'Ver Detalle' };
        }
    };

    const handleVerDetalleEntidad = async (n) => {
        setLoadingDetalle(true);
        setDetalleEntidad(null);
        setTipoDetalle(n.tipo);
        let url = '';
        if (n.tipo === 'solicitud' && n.solicitud_id) {
            url = `${BaseUrl}/notificaciones/solicitud/${n.solicitud_id}`;
        } else if (n.tipo === 'planificacion' && n.planificacion_id) {
            url = `${BaseUrl}/notificaciones/planificacion/${n.planificacion_id}`;
        } else {
            setLoadingDetalle(false);
            setDetalleEntidad({ error: 'No se puede mostrar el detalle.' });
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setDetalleEntidad(data);
        } catch (error) {
            console.error(error);
            setDetalleEntidad({ error: 'No se pudo cargar el detalle.' });
        }
        setLoadingDetalle(false);
    };

    // Render de una notificación 
    const renderNotificacion = (n, extraStyle = {}, mostrarIcono = false) => {
        const { icon: tipoIcon, color, tooltip } = getTipoIcono(n.tipo);
        return (
            <div
                key={n.id}
                className={`${styles.notificacionItem} ${n.leida ? styles.leida : ''}`}
                style={extraStyle}
                onClick={() => marcarLeida(n.id)}
            >
                {n.mensaje}
                <span className={styles.fecha}>
                    {new Date(n.created_at).toLocaleString('es-VE', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                    })}
                    {/* Icono de acción solo en el modal de "Ver más" */}
                    {mostrarIcono && (
                        <img
                            src={tipoIcon}
                            alt={tooltip}
                            title={tooltip}
                            style={{
                                marginLeft: 8,
                                cursor: 'pointer',
                                width: 18,
                                verticalAlign: 'middle',
                                filter: `drop-shadow(0 0 2px ${color})`
                            }}
                            onClick={e => {
                                e.stopPropagation();
                                handleVerDetalleEntidad(n);
                            }}
                        />
                    )}
                </span>
                {!n.leida && <span className={styles.nueva}>●</span>}
            </div>
        );
    };

function DetalleEntidadTabla({ entidad, tipo }) {
    if (entidad?.error) {
        return <div style={{ color: 'red' }}>{entidad.error}</div>;
    }

    // Icono y color según tipo
    const { icon: tipoIcon, color, tooltip } = getTipoIcono(tipo);

    // Título de sección reutilizable
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
                    style={{
                        width: 32,
                        marginRight: 12,
                        filter: `drop-shadow(0 0 2px ${color})`
                    }}
                />
                <h2 style={{ margin: 0 }}>
                    Detalle {tipo === 'solicitud' ? 'de Solicitud' : tipo === 'planificacion' ? 'de Planificación' : ''}
                </h2>
            </div>

            {tipo === 'solicitud' && (
                <>
                    <h1 style={sectionTitleStyle}>Datos de la Solicitud</h1>
                    <table className='detalleTable'>
                        <tbody>
                            <tr><th>Código</th><td>{entidad.codigo || '—'}</td></tr>
                            <tr><th>Descripción</th><td>{entidad.descripcion || '—'}</td></tr>
                            <tr><th>Fecha Solicitada</th><td>{entidad.fecha_solicitada || '—'}</td></tr>
                            <tr>
                                <th>Estado</th>
                                <td>
                                    <span className={`badge-estado badge-${entidad.estado}`}>{entidad.estado}</span>
                                </td>
                            </tr>
                            <tr><th>Tipo de Solicitud</th><td>{entidad.tipo_solicitud_nombre || '—'}</td></tr>
                        </tbody>
                    </table>

                    <h1 style={sectionTitleStyle}>Datos de la Propiedad</h1>
                    <table className= 'detalleTable'>
                        <tbody>
                            <tr><th>Propiedad</th><td>{entidad.propiedad_nombre || '—'}</td></tr>
                            <tr><th>RIF Propiedad</th><td>{entidad.propiedad_rif || '—'}</td></tr>
                            <tr><th>Ubicación</th><td>{entidad.propiedad_ubicacion || '—'}</td></tr>
                            <tr><th>Hectáreas</th><td>{entidad.propiedad_hectareas || '—'}</td></tr>
                        </tbody>
                    </table>

                    <h1 style={sectionTitleStyle}>Datos del Usuario</h1>
                    <table className= 'detalleTable'>
                        <tbody>
                            <tr><th>Usuario</th><td>{entidad.usuario_username || '—'}</td></tr>
                        </tbody>
                    </table>
                </>
            )}

            {tipo === 'planificacion' && (
                <>
                    <h1 style={sectionTitleStyle}>Datos de la Planificación</h1>
                    <table className= 'detalleTable'>
                        <tbody>
                            <tr><th>Actividad</th><td>{entidad.actividad || '—'}</td></tr>
                            <tr><th>Fecha Programada</th><td>{entidad.fecha_programada || '—'}</td></tr>
                            <tr>
                                <th>Estado</th>
                                <td>
                                    <span className={`badge-estado badge-${entidad.estado}`}>{entidad.estado}</span>
                                </td>
                            </tr>
                            <tr><th>Objetivo</th><td>{entidad.objetivo || '—'}</td></tr>
                            <tr><th>Convocatoria</th><td>{entidad.convocatoria || '—'}</td></tr>
                            <tr><th>Ubicación</th><td>{entidad.ubicacion || '—'}</td></tr>
                            <tr><th>Aseguramiento</th><td>{entidad.aseguramiento || '—'}</td></tr>
                            <tr><th>Tipo de Inspección</th><td>{entidad.tipo_inspeccion_nombre || '—'}</td></tr>
                        </tbody>
                    </table>

                    <h1 style={sectionTitleStyle}>Solicitud Asociada</h1>
                    <table className='detalleTable'>
                        <tbody>
                            <tr><th>Código Solicitud</th><td>{entidad.solicitud_codigo || '—'}</td></tr>
                            <tr><th>Descripción</th><td>{entidad.solicitud_descripcion || '—'}</td></tr>
                            <tr><th>Estado</th><td>{entidad.solicitud_estado || '—'}</td></tr>
                        </tbody>
                    </table>

                    <h1 style={sectionTitleStyle}>Empleados Asignados</h1>
                    <table className= 'detalleTable'>
                        <tbody>
                            <tr>
                                <th>Empleados</th>
                                <td>
                                    {Array.isArray(entidad.empleados) && entidad.empleados.length > 0
                                        ? <ul style={{ margin: 0, paddingLeft: 18 }}>
                                            {entidad.empleados.map(e =>
                                                <li key={e.id}>
                                                    <span style={{ fontWeight: 500 }}>{e.nombre} {e.apellido}</span>
                                                    {e.cargo && <span style={{ color: '#888', marginLeft: 6 }}>({e.cargo})</span>}
                                                </li>
                                            )}
                                        </ul>
                                        : '—'}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </>
            )}
        </div>
    );
}

    return (
        <>
            <div className={styles.dropdown}>
                <h4>Notificaciones</h4>
                <TabsNotificaciones
                    tabs={tabsNotificaciones}
                    activeTab={tabActivo}
                    onTabClick={handleTabClick}
                />
                {filtradas.length === 0 && (
                    <div className={styles.empty}>Sin notificaciones</div>
                )}
                {filtradas.map(n => renderNotificacion(n))}
            </div>
            {showAllModal && (
                <div className={styles.modalDetalleNotificacion}>
                    <div className={styles.detalleNotificacion}>
                        <button
                            onClick={() => setShowAllModal(false)}
                            className='closeButton'
                            title="Cerrar"
                        >&times;</button>
                        <h2 style={{ marginBottom: 16 }}>Todas las notificaciones</h2>
                        {notificaciones.length === 0 ? (
                            <div className={styles.empty}>Sin notificaciones</div>
                        ) : (
                            notificaciones.map(n => renderNotificacion(n, { fontSize: '1.1rem', padding: 16 }, true))
                        )}
                    </div>
                </div>
            )}
            {detalleEntidad && (
                <div className={styles.modalDetalleNotificacion}>
                    <div className={styles.detalleNotificacion}>
                        <button
                            onClick={() => setDetalleEntidad(null)}
                            className='closeButton'
                            title="Cerrar"
                        >&times;</button>
                        {loadingDetalle ? (
                            <div>Cargando...</div>
                        ) : (
                            <DetalleEntidadTabla entidad={detalleEntidad} tipo={tipoDetalle} />
                        )}
                    </div>
                </div>
            )}
        </>
    );
}

export default NotificationDropdown;