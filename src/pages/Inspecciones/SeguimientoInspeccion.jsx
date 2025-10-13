import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BaseUrl } from '../../utils/constans';
import Spinner from '../../components/spinner/Spinner';
import { useNotification } from '../../utils/NotificationContext';
import styles from './inspecciones.module.css';
import '../../main.css';
import Icon from '../../components/iconos/iconos';

function timeSince(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  const now = new Date();
  let delta = Math.floor((now - d) / 1000);
  const y = Math.floor(delta / (3600 * 24 * 365)); if (y >= 1) return `${y} año${y > 1 ? 's' : ''}`;
  const m = Math.floor(delta / (3600 * 24 * 30)); if (m >= 1) return `${m} mes${m > 1 ? 'es' : ''}`;
  const w = Math.floor(delta / (3600 * 24 * 7)); if (w >= 1) return `${w} semana${w > 1 ? 's' : ''}`;
  const dd = Math.floor(delta / (3600 * 24)); if (dd >= 1) return `${dd} día${dd > 1 ? 's' : ''}`;
  const hh = Math.floor(delta / 3600); if (hh >= 1) return `${hh} hora${hh > 1 ? 's' : ''}`;
  const mm = Math.floor(delta / 60); if (mm >= 1) return `${mm} minuto${mm > 1 ? 's' : ''}`;
  return `${delta} segundo${delta !== 1 ? 's' : ''}`;
}

function SeguimientoInspeccion() {
  const { id } = useParams(); // id de la inspección clicada
  const navigate = useNavigate();
  const { addNotification } = useNotification();

  const [loading, setLoading] = useState(false);
  const [traza, setTraza] = useState({ propiedad: null, productores: [], galeria: [], inspecciones: [] });
  const [hovered, setHovered] = useState(null);
  const [inspeccionSeleccionada, setInspeccionSeleccionada] = useState(null);
  const [progLoading, setProgLoading] = useState(false);
  const [programas, setProgramas] = useState([]); 
  const fetchTrazabilidad = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BaseUrl}/seguimiento/${id}/trazabilidad`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = res.data || {};
      setTraza({
        propiedad: data.propiedad || null,
        productores: Array.isArray(data.productores) ? data.productores : [],
        galeria: Array.isArray(data.galeria) ? data.galeria : [],
        inspecciones: Array.isArray(data.inspecciones) ? data.inspecciones : [],
      });
    } catch (error) {
      console.error('Error obteniendo trazabilidad', error);
      addNotification('No se pudo cargar la trazabilidad', 'error');
      setTraza({ propiedad: null, productores: [], galeria: [], inspecciones: [] });
    } finally {
      setLoading(false);
    }
  };

  const fetchProgramasAsignados = async (inspeccionId) => {
    if (!inspeccionId) {
      setProgramas([]);
      return;
    }
    setProgLoading(true);
    try {
      const res = await axios.get(`${BaseUrl}/seguimiento/inspeccion/${inspeccionId}/programas`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = Array.isArray(res.data) ? res.data : [];
      setProgramas(data);
    } catch (e) {
      console.error('Error obteniendo programas asignados', e);
      setProgramas([]);
    } finally {
      setProgLoading(false);
    }
  };

  useEffect(() => {
    fetchTrazabilidad();
    setInspeccionSeleccionada(Number(id) || null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (inspeccionSeleccionada) fetchProgramasAsignados(inspeccionSeleccionada);
  }, [inspeccionSeleccionada]);


  const primeraFecha = useMemo(() => {
    if (!traza.inspecciones.length) return null;
    const first = [...traza.inspecciones].sort(
      (a, b) => new Date(a.fecha_inspeccion) - new Date(b.fecha_inspeccion)
    )[0];
    return first?.fecha_inspeccion || null;
  }, [traza.inspecciones]);

  const propCover = useMemo(() => {
    const img = traza.galeria?.[0]?.imagen;
    return img ? `${BaseUrl}/uploads/inspeccion_est/${img}` : null;
  }, [traza.galeria]);

  const avatarFromName = (nombre = '', apellido = '') => {
    const n = (nombre || '').trim();
    const a = (apellido || '').trim();
    const txt = [n, a].filter(Boolean).join(' ');
    if (!txt) return `https://ui-avatars.com/api/?name=NA&background=98c79a&color=fff&rounded=true`;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(txt)}&background=98c79a&color=fff&rounded=true`;
  };

   const openReporte = (tipo, idForce) => {
    const targetId = idForce || inspeccionSeleccionada;
    if (!targetId) {
      addNotification('Selecciona una inspección para generar el reporte', 'warning');
      return;
    }
    if (tipo === 'acta') {
      navigate(`/inspecciones/${targetId}/acta-silos`);
      return;
    }
    const url = `${BaseUrl}/reportes/inspeccion/${targetId}?tipo=${tipo}`;
    window.open(url, '_blank');
  };

  return (
    <div className="mainContainer">
      {loading && <Spinner text="Procesando..." />}

     <div className={`SectionSeguimiento ${styles.sectionHeader}`}>
        <div className={`ss-left ${styles.headerLeft}`}>
          <button className={`create btn-estandar`} onClick={() => navigate('/SeccionTwo')}>
            <img src={Icon.flecha} alt="Regresar" className='icon' />
            Regresar
          </button>
        </div>

        <div className={`ss-right ${styles.headerCard}`}>
          <h2 className="titleOne">Trazabilidad de Propiedad</h2>
          <h3 className="titleTwo">
            Propiedad: {traza.propiedad?.propiedad_nombre || '—'} 
          </h3>
            <h3 className='titleTwo'>
                RIF: {traza.propiedad?.propiedad_rif || '—'}
            </h3>
                
          <div style={{ color: 'var(--grey4)' }}>
            Total inspecciones: {traza.inspecciones.length}{' '}
            {primeraFecha ? `· En seguimiento desde hace ${timeSince(primeraFecha)}` : ''}
          </div>
          <div style={{ color: 'var(--grey4)' }}>
            Ubicación: {traza.propiedad?.propiedad_ubicacion || '—'}
          </div>
        </div>
      </div>

      {/* Cabecera visual: Propiedad (full-width) + Reportes + Productores */}
      <div className={styles.landingHeader}>
        <div className={styles.propCard}>
          <div className={styles.propCover}>
            {propCover ? (
              <img src={propCover} alt="propiedad" onError={(e) => (e.currentTarget.style.display = 'none')} />
            ) : (
              <div className={styles.propPlaceholder}>Sin imagen</div>
            )}
          </div>
          <div className={styles.propInfo}>
            <div className={styles.propTitle}>{traza.propiedad?.propiedad_nombre || 'Propiedad'}</div>
            <div className={styles.propMeta}>
              <span>RIF: {traza.propiedad?.propiedad_rif || '—'}</span>
              <span>·</span>
              <span>{traza.propiedad?.propiedad_ubicacion || '—'}</span>
            </div>
            <div className={styles.propStats}>
              <div>
                <strong>{traza.inspecciones.length}</strong>
                <span>Inspecciones</span>
              </div>
              <div>
                <strong>{primeraFecha ? timeSince(primeraFecha) : '—'}</strong>
                <span>Tiempo en seguimiento</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.reportCard}>
          <div className={styles.reportHeader}>
            <div className={styles.reportTitle}>Reportes</div>
            <div className={styles.reportHint}>
              {inspeccionSeleccionada
                ? `Inspección seleccionada: #${inspeccionSeleccionada}`
                : 'Selecciona una inspección en la línea de tiempo'}
            </div>
          </div>
          <div className={styles.reportActions}>
            <button
              className={styles.reportBtn}
              onClick={() => openReporte('general')}
              disabled={!inspeccionSeleccionada}
              title="Reporte General"
            >
              Reporte General
            </button>
            <button
              className={styles.reportBtn}
              onClick={() => openReporte('acta')}
              disabled={!inspeccionSeleccionada}
              title="Acta de Inspección"
            >
              Acta de Inspección
            </button>
            <button
              className={styles.reportBtn}
              onClick={() => openReporte('informe')}
              disabled={!inspeccionSeleccionada}
              title="Informe Técnico"
            >
              Informe Técnico
            </button>
          </div>
        </div>

        <div className={styles.prodCard}>
          <div className={styles.prodHeader}>
            <div className={styles.prodTitle}>Productores</div>
            <div className={styles.prodCount}>{traza.productores?.length || 0}</div>
          </div>
          <div className={styles.prodList}>
            {(traza.productores || []).map((p) => (
              <div key={p.id} className={styles.prodItem}>
                <img
                  className={styles.prodAvatar}
                  src={avatarFromName(p.nombre, p.apellido)}
                  alt="avatar"
                  loading="lazy"
                />
                <div className={styles.prodBody}>
                  <div className={styles.prodName}>{[p.nombre, p.apellido].filter(Boolean).join(' ') || '—'}</div>
                  <div className={styles.prodMeta}>Cédula: {p.cedula || '—'}</div>
                </div>
              </div>
            ))}
            {(!traza.productores || traza.productores.length === 0) && (
              <div className={styles.prodEmpty}>Esta propiedad no tiene productores asociados.</div>
            )}
          </div>
        </div>
      </div>

     <div className="tableSection" style={{ marginTop: 20, marginBottom: 40 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <h3 className="titleTwo" style={{ marginBottom: 10 }}>
            Programas asignados 
            {/* {inspeccionSeleccionada ? `(Inspección #${inspeccionSeleccionada})` : ''} */}
          </h3>
          {progLoading && <span style={{ color: 'var(--grey4)' }}>Cargando...</span>}
        </div>

        {(!programas || programas.length === 0) ? (
          <div style={{ color: 'var(--grey4)' }}>
            {inspeccionSeleccionada
              ? 'Esta inspección no tiene programas asignados.'
              : 'Selecciona una inspección para ver sus programas asignados.'}
          </div>
        ) : (
          // Fichas (sin estado)
          <div className="progCards">
            {programas.map((p) => (
              <div key={p.id} className="progCard">
                <div className="progCardTitle">
                  <strong>{p.programa_nombre || `Programa #${p.programa_fito_id}`}</strong>
                  {p.tipo_programa && <small className="progType">{p.tipo_programa}</small>}
                </div>

                {Array.isArray(p.plagas) && p.plagas.length > 0 && (
                  <div className="chipsRow">
                    {p.plagas.map((pl, idx) => (
                      <span key={`${p.id}-pl-${idx}`} className="chip">{pl}</span>
                    ))}
                  </div>
                )}

                <div className="progCardMeta">
                  <div><span className="metaLabel">Fecha:</span> {p.fecha_asociacion || '—'}</div>
                  <div className="observacion">
                    <span className="metaLabel">Observación:</span> {p.observacion || '—'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Timeline de inspecciones */}
      <div className="tableSection" style={{ marginBottom: 30, overflow: 'visible' }}>
        {traza.inspecciones.length === 0 ? (
          <div style={{ color: 'var(--grey4)' }}>No hay inspecciones registradas para esta propiedad.</div>
        ) : (
          <div className={styles.timelineHost}>
            <div className={styles.timelineWrap} style={{ overflow: 'visible', position: 'relative', zIndex: 1 }}>
              <div className={styles.timeline}>
                {traza.inspecciones.map((it) => {
                  const estadoClass = `badge-${(it.estado || '').toLowerCase()}`;
                  const isHovered = hovered === it.id;
                  const isSelected = inspeccionSeleccionada === it.id;
                  return (
                    <div
                      key={it.id}
                      className={`${styles.timelineItem} ${isSelected ? styles.timelineItemSelected : ''}`}
                      onMouseEnter={() => setHovered(it.id)}
                      onMouseLeave={() => setHovered(null)}
                      onFocus={() => setHovered(it.id)}
                      onBlur={() => setHovered(null)}
                      onClick={() => setInspeccionSeleccionada(it.id)}
                      role="button"
                      tabIndex={0}
                    >
                      <div className={styles.markerCol}>
                        <div className={styles.line} />
                        <div className={`${styles.marker} ${styles[estadoClass]}`} title={it.estado} />
                        <div className={styles.date}>{it.fecha_inspeccion || '—'}</div>
                        <div className={styles.state}>
                          <span className={`badge-estado ${estadoClass}`}>{it.estado}</span>
                        </div>
                      </div>

                      <div className={styles.itemBody}>
                        <div className={styles.codes}>
                          <strong>{it.codigo_inspeccion || 'SIN-COD'}</strong>
                          <span className={styles.muted}> · N° Control: {it.n_control || '—'}</span>
                        </div>
                        <div className={styles.meta}>
                          <span className={styles.muted}>
                            Solicitud: {it.solicitud_codigo || it.solicitud_id} · Planif: {it.planificacion_codigo || it.planificacion_id}
                          </span>
                        </div>

                        {isHovered && (
                          <div className={styles.hoverCard}>
                            <div className={styles.hoverHeader}>
                              <div>
                                <div className={styles.hoverTitle}>{it.codigo_inspeccion || 'Inspección'}</div>
                                <div className={styles.hoverSub}>
                                  Estado: <span className={`badge-estado ${estadoClass}`}>{it.estado}</span>
                                </div>
                              </div>
                              <div className={styles.hoverDate}>{it.fecha_inspeccion || '—'}</div>
                            </div>

                            {(it.aspectos || it.ordenamientos) && (
                              <div className={styles.hoverText}>
                                {it.aspectos && (<div><strong>Aspectos:</strong> {it.aspectos}</div>)}
                                {it.ordenamientos && (<div><strong>Ordenamientos:</strong> {it.ordenamientos}</div>)}
                              </div>
                            )}

                            {Array.isArray(it.finalidades) && it.finalidades.length > 0 && (
                              <div className={styles.hoverText}>
                                <strong>Finalidades:</strong>
                                <ul className={styles.finalidadesList}>
                                  {it.finalidades.map((fin) => (
                                    <li key={fin.id}>{fin.finalidad}: {fin.objetivo || '—'}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {Array.isArray(it.imagenes) && it.imagenes.length > 0 && (
                              <div className={styles.thumbs}>
                                {it.imagenes.slice(0, 6).map((img) => (
                                  <a
                                    key={img.id}
                                    href={`${BaseUrl}/uploads/inspeccion_est/${img.imagen}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.thumbLink}
                                    title="Abrir imagen"
                                  >
                                    <img
                                      src={`${BaseUrl}/uploads/inspeccion_est/${img.imagen}`}
                                      alt="img"
                                      className={styles.thumb}
                                      loading="lazy"
                                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                    />
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SeguimientoInspeccion;