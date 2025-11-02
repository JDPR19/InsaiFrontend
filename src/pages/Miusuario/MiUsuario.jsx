import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './miusuario.module.css';
import '../../main.css';
import icon from '../../components/iconos/iconos';
import Spinner from '../../components/spinner/Spinner';
import { BaseUrl } from '../../utils/constans';
import { useNotification } from '../../utils/NotificationContext';
import { buildUsuarioFichaBlob } from '../../components/pdf/FichaUsuario';
import AyudanteInfoTooltip from '../../components/ayudanteinfo/AyudaTooltip'
import { usePermiso } from '../../hooks/usePermiso';

function MiUsuario() {
    const tienePermiso = usePermiso();
    const [pdfUrl, setPdfUrl] = useState(null);
    const [pdfFileName, setPdfFileName] = useState('');
    const token = localStorage.getItem('token');
    const [usuario, setUsuario] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notificaciones, setNotificaciones] = useState([]);
    const [historial, setHistorial] = useState([]);
    const [sesiones, setSesiones] = useState([]);
    const [showEdit, setShowEdit] = useState(false);
    const [formData, setFormData] = useState({});
// }   const [errors, setErrors] = useState({});
    const [modalImagenes, setModalImagenes] = useState(false);
    const [imagenesUsuario, setImagenesUsuario] = useState([]);
    const [imagenesCargando, setImagenesCargando] = useState(false);
    const [confirmDeleteImagenModal, setConfirmDeleteImagenModal] = useState({ abierto: false, imagen: null });
    const { addNotification } = useNotification();

    const formatFechaHora = (v) => v ? new Date(v).toLocaleString('es-ES') : '—';
    const accionClass = (accion = '') => {
        const a = String(accion).toLowerCase();
        if (a.includes('elimin')) return `${styles.badge} ${styles.badgeDanger}`;
        if (a.includes('actualiz')) return `${styles.badge} ${styles.badgeWarning}`;
        if (a.includes('inicio') || a.includes('cierre')) return `${styles.badge} ${styles.badgeInfo}`;
        return `${styles.badge} ${styles.badgeSuccess}`; // Registro u otros
    };

    const diffHuman = (ini, fin) => {
        try {
        const a = new Date(ini).getTime();
        const b = new Date(fin).getTime();
        if (!isFinite(a) || !isFinite(b)) return '—';
        let s = Math.max(0, Math.floor((b - a) / 1000));
        const h = Math.floor(s / 3600); s -= h * 3600;
        const m = Math.floor(s / 60);   s -= m * 60;
        const parts = [];
        if (h) parts.push(`${h}h`);
        if (m || (!h && s)) parts.push(`${m}m`);
        if (!h && s) parts.push(`${s}s`);
        return parts.join(' ');
        } catch { return '—'; }
    };

    const notifTipoClass = (tipo = '') => {
        const t = String(tipo || '').toLowerCase();
        if (t.includes('inspec')) return styles.dotInspeccion;
        if (t.includes('planific')) return styles.dotPlanificacion;
        if (t.includes('solic')) return styles.dotSolicitud;
        return styles.dotSistema;
    };

    // Cargar datos completos del usuario
    useEffect(() => {
        setLoading(true);
        axios.get(`${BaseUrl}/miusuario/ficha/completa`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        .then(res => {
            setUsuario(res.data);
            setFormData({
                username: res.data.username || '',
                email: res.data.email || '',
                password: '',
                confirmarpassword: ''
            });
            setHistorial(res.data.historial || []);
            setSesiones(res.data.sesiones || []);
            setLoading(false);
        })
        .catch(() => {
            addNotification('Error al cargar datos de usuario', 'error');
            setLoading(false);
        });

        // Notificaciones
        axios.get(`${BaseUrl}/miusuario/notificaciones`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        .then(res => setNotificaciones(res.data))
        .catch(() => {});
    }, []);

    const fetchImagenesUsuario = async () => {
    setImagenesCargando(true);
    try {
        const res = await axios.get(`${BaseUrl}/miusuario/imagenes`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setImagenesUsuario(res.data);
    } catch (error) {
        console.error(error);
        addNotification('No hay imágenes para mostrar', 'warning');
    } finally {
        setImagenesCargando(false);
    }
};

    
const handleSubirImagenesUsuario = async (e) => {
    const files = e.target.files;
    if (!files || !files.length) return;
    if (imagenesUsuario.length + files.length > 5) {
        addNotification('Solo se permiten máximo 5 imágenes.', 'warning');
        return;
    }
    const formData = new FormData();
    for (let file of files) formData.append('imagenes', file);
    setImagenesCargando(true);
    try {
        await axios.post(
            `${BaseUrl}/miusuario/imagenes`,
            formData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            }
        );
        // Aquí refrescas la lista
        fetchImagenesUsuario();
        addNotification('Imágenes subidas correctamente', 'success');
    } catch (error) {
        console.error(error);
        addNotification('Error al subir imágenes', 'error');
    } finally {
        setImagenesCargando(false);
    }
};

const handleDeleteImagenUsuario = async (imagen) => {
    setImagenesCargando(true);
    try {
        await axios.delete(
            `${BaseUrl}/miusuario/imagenes/${imagen}`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        fetchImagenesUsuario();
        addNotification('Imagen eliminada', 'success');
    } catch (error) {
        console.error(error);
        addNotification('Error al eliminar imagen', 'error');
    } finally {
        setImagenesCargando(false);
        setConfirmDeleteImagenModal({ abierto: false, imagen: null });
    }
};

const handleSeleccionarAvatar = async (imagen) => {
    try {
        await axios.put(`${BaseUrl}/miusuario/avatar`, { imagen }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setUsuario(prev => ({
            ...prev,
            avatar_imagen: imagen
        }));
        addNotification('Avatar actualizado', 'success');
        setModalImagenes(false);
    } catch (error) {
        console.error('Error al actualizar avatar', error);
        addNotification('Error al actualizar avatar', 'error');
    }
};


    // Editar datos básicos
    const handleEdit = async () => {
        setLoading(true);
        try {
            await axios.put(`${BaseUrl}/miusuario`, {
                username: formData.username,
                email: formData.email,
                password: formData.password || undefined
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            addNotification('Datos actualizados', 'success');
            setShowEdit(false);
            setUsuario(prev => ({
                ...prev,
                username: formData.username,
                email: formData.email
            }));
        } catch {
            addNotification('Error al actualizar datos', 'error');
        } finally {
            setLoading(false);
        }
    };
    
    const handleFichaUsuarioPDF = async () => {
        if (!usuario) return;
        try {
            const blob = await buildUsuarioFichaBlob({ usuario });
            const url = window.URL.createObjectURL(blob);
            setPdfUrl(url);
            setPdfFileName(`Ficha_Usuario_${usuario.cedula || usuario.username}.pdf`);
        } catch (error) {
            console.error('error al generar la ficha',error);
            addNotification('No se pudo generar la ficha', 'error');
        }
    };


    if (loading || !usuario) return <Spinner text="Cargando perfil..." />;

    return (
        <div className={styles.miUsuarioContainer}>
            {/* Encabezado con foto y datos principales */}
            <div className={styles.headerSection}>
                <div className={styles.fotoPerfilBox}>
                    <img
                        src={
                            usuario.avatar_imagen
                                ? `${BaseUrl}/uploads/usuarios/${usuario.avatar_imagen}`
                                : icon.userDefault
                        }
                        alt="Foto de perfil"
                        className={styles.fotoPerfil}
                    />
                    <div className={styles.fotoActions}>
                        <button className={styles.btnFoto} onClick={() => { setModalImagenes(true); fetchImagenesUsuario(); }}>
                            Cambiar foto de perfil
                        </button>
                    </div>

                    <div style={{ marginTop: 18 }}>
                        <AyudanteInfoTooltip
                            descripcion="Aquí puedes ver y editar tu información personal, gestionar tus imágenes de perfil y descargar tu ficha como PDF. Usa los botones para cambiar tu foto o acceder a otras opciones."
                        />
                    </div>
                </div>
                <div className={styles.datosPrincipales}>
                    <h2>{usuario.nombre} {usuario.apellido}</h2>
                    <p><b>Cédula:</b> {usuario.cedula}</p>
                    <p><b>Cargo:</b> {usuario.cargo}</p>
                    <p><b>Usuario:</b> {usuario.username}</p>
                    <p><b>Correo:</b> {usuario.email}</p>
                    <p><b>Rol:</b> {usuario.rol}</p>
                    <p><b>Estado:</b> {usuario.usuario_estado ? 'Activo' : 'Inactivo'}</p>
                    <p><b>Último acceso:</b> {usuario.ultimo_acceso ? new Date(usuario.ultimo_acceso).toLocaleString('es-ES') : '—'}</p>
                    <button className={styles.btnEditar} onClick={() => setShowEdit(true)}>
                        Editar datos
                    </button>
                    <button
                            className={styles.btnEditar}
                            onClick={() => { setModalImagenes(true); fetchImagenesUsuario(); }}
                        >
                            Gestionar Imágenes
                    </button>
                </div>
            </div>

            {modalImagenes && (
                <div className="modalOverlay">
                    <div className="modal">
                        <button className="closeButton" onClick={() => setModalImagenes(false)}>&times;</button>
                        <h2>Mis Imágenes</h2>
                        <input
                            type="file"
                            id="imagenes-usuario"
                            className="input-imagen"
                            multiple
                            accept="image/png,image/jpeg,image/webp"
                            onChange={handleSubirImagenesUsuario}
                            disabled={imagenesCargando}
                            style={{ display: 'none' }}
                        />
                        <label htmlFor="imagenes-usuario" className="label-imagen" style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer', marginBottom: 8 }}>
                            <img src={icon.pdf3} alt="Subir" className="iconSubir" style={{ width: 18, marginRight: 6 }} />
                            Subir Imágenes
                        </label>
                        <div style={{ fontSize: 12, color: '#6C757D', marginBottom: 8 }}>
                            Máx 5 imágenes, formatos: JPG/PNG/WebP, tamaño ≤ 10MB.
                        </div>
                        <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                            {imagenesCargando && <Spinner text="Cargando imágenes..." />}
                            {imagenesUsuario.length === 0 && !imagenesCargando && (
                                <span style={{ color: '#888' }}>Sin imágenes</span>
                            )}
                            {imagenesUsuario.map((img, idx) => (
                                <div key={img.id} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <img
                                        src={`${BaseUrl}/uploads/usuarios/${img.imagen}`}
                                        alt={`Usuario-${idx}`}
                                        style={{ maxWidth: 120, maxHeight: 120, border: '1px solid #90ce6f', borderRadius: 8, objectFit: 'cover' }}
                                    />
                                    <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                                        <button
                                            type="button"
                                            onClick={() => handleSeleccionarAvatar(img.imagen)}
                                            className="btn-estandar"
                                            style={{ padding: '2px 8px', fontSize: 12 }}
                                        >
                                            Usar como avatar
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setConfirmDeleteImagenModal({ abierto: true, imagen: img.imagen })}
                                            title="Quitar imagen"
                                            className="closeButton2"
                                        >×</button>
                                        <a
                                            href={`${BaseUrl}/uploads/usuarios/${img.imagen}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn-estandar"
                                            style={{ padding: '2px 8px', fontSize: 12, textDecoration: 'none' }}
                                            title="Abrir imagen en nueva ventana"
                                        >
                                            Abrir
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}


            
            {confirmDeleteImagenModal.abierto && (
                <div className="modalOverlay">
                    <div className="modal">
                        <h2>Confirmar Eliminación</h2>
                        <p>¿Estás seguro de que deseas eliminar esta imagen?</p>
                        <div style={{ textAlign: 'center', margin: '12px 0' }}>
                            <img
                                src={`${BaseUrl}/uploads/usuarios/${confirmDeleteImagenModal.imagen}`}
                                alt="Imagen a eliminar"
                                style={{ maxWidth: 120, maxHeight: 120, border: '1px solid #ccc', borderRadius: 8, objectFit: 'cover' }}
                            />
                        </div>
                        <div className="modalActions">
                            <button className="cancelButton" onClick={() => setConfirmDeleteImagenModal({ abierto: false, imagen: null })}>Cancelar</button>
                            <button className="confirmButton" onClick={() => handleDeleteImagenUsuario(confirmDeleteImagenModal.imagen)}>Confirmar</button>
                        </div>
                    </div>
                </div>
            )}

            {pdfUrl && (
                <div className="modalOverlay">
                    <div className="modalDetalle">
                        <button className="closeButton" onClick={() => { setPdfUrl(null); setPdfFileName(''); }}>&times;</button>
                        <iframe src={pdfUrl} width="100%" height="600px" title="Vista previa PDF" />
                        <a
                            href={pdfUrl}
                            download={pdfFileName}
                            className="btn-estandar"
                            style={{ marginTop: 16, display: 'inline-block', textDecoration: 'none' }}
                        >
                            Descargar PDF
                        </a>
                    </div>
                </div>
            )}

            {/* Modal para editar datos */}
            {showEdit && (
                <div className="modalOverlay">
                    <div className="modal">
                        <button className="closeButton" onClick={() => setShowEdit(false)}>&times;</button>
                        <h2>Editar mis datos</h2>
                        <form className={styles.formEdit}>
                            <label>Usuario:
                                <input
                                    type="text"
                                    className='input'
                                    value={formData.username}
                                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                                />
                            </label>
                            <label>Email:
                                <input
                                    type="email"
                                    className='input'
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </label>
                            <label>Nueva contraseña:
                                <input
                                    type="password"
                                    className='password'
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="Opcional"
                                />
                            </label>
                            <label>Confirmar contraseña:
                                <input
                                    type="password"
                                    className='password'
                                    value={formData.confirmarpassword}
                                    onChange={e => setFormData({ ...formData, confirmarpassword: e.target.value })}
                                    placeholder="Opcional"
                                />
                            </label>
                            <button type="button" className={styles.btnGuardar} onClick={handleEdit}>
                                Guardar cambios
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Notificaciones */}
            <div className={styles.section}>
                <h3>Notificaciones recientes</h3>
                {notificaciones.length === 0 ? (
                    <p className={styles.textoSecundario}>No tienes notificaciones nuevas.</p>
                ) : (
                    <ul className={styles.listaNotificaciones}>
                        {notificaciones.map(n => (
                            <li key={n.id} className={`${styles.notifItem} ${n.leida ? styles.leida : ''}`}>
                                <span className={`${styles.dot} ${notifTipoClass(n.tipo)}`} />
                                <span className={styles.msg}>{n.mensaje}</span>
                                <span className={styles.notifFecha}>
                                    {new Date(n.created_at).toLocaleString('es-ES')}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Historial de actividad */}
            <div className={styles.section}>
            <h3>Historial de actividad</h3>

            {historial.length === 0 ? (
            <p className={styles.textoSecundario}>Sin actividad reciente.</p>
            ) : (
            <div className={styles.historialBox}>
                <div className={styles.historialHeader}>
                <span>Acción</span>
                <span>Módulo</span>
                <span>Descripción</span>
                <span className={styles.colFechaH}>Fecha</span>
                </div>

                {historial.map((h, idx) => (
                <div key={idx} className={styles.historialRow}>
                    <span className={accionClass(h.accion)}>{h.accion}</span>
                    <span className={styles.colModulo}>{h.tabla}</span>
                    <span className={styles.colDescripcion}>{h.descripcion}</span>
                    <span className={styles.colFecha}>{formatFechaHora(h.fecha)}</span>
                </div>
                ))}
            </div>
            )}
        </div>

            {/* Últimas sesiones */}
            <div className={styles.section}>
            <h3>Últimos accesos</h3>

            {Array.isArray(sesiones) && sesiones.length ? (
            <div className={styles.accesosBox}>
                <div className={styles.accesosHeader}>
                <span>Inicio</span>
                <span>Fin</span>
                <span className={styles.colDurH}>Duración</span>
                <span className={styles.colEstadoH}>Estado</span>
                </div>

                {sesiones.map((s, i) => {
                const ini = s.inicio || s.fecha_inicio || s.login_at || s.inicio_sesion;
                const fin = s.fin || s.fecha_fin || s.logout_at || s.cierre_sesion;
                const abierta = !fin;
                return (
                    <div key={i} className={styles.accesoRow}>
                    <span className={styles.colInicio}>{formatFechaHora(ini)}</span>
                    <span className={styles.colFin}>{fin ? formatFechaHora(fin) : '—'}</span>
                    <span className={styles.colDur}>{fin ? diffHuman(ini, fin) : 'En curso'}</span>
                    <span className={styles.colEstado}>
                        <span className={`${styles.estadoDot} ${abierta ? styles.estadoOpen : styles.estadoClosed}`} />
                        {abierta ? 'Abierta' : 'Cerrada'}
                    </span>
                    </div>
                );
                })}
            </div>
            ) : (
            <p className={styles.textoSecundario}>Sin registros de acceso.</p>
            )}
        </div>

            {/* Botón para descargar ficha PDF */}
        {tienePermiso('miusuario', 'exportar') && (
            <div className={styles.section} style={{ textAlign: 'center', marginTop: 32 }}>
                <button
                    className={styles.btnFichaPDF}
                    onClick={handleFichaUsuarioPDF}
                    style={{ marginRight: 12 }}
                    >
                    Ficha PDF
                </button>
            </div>
        )}
        </div>
    );
}

export default MiUsuario;