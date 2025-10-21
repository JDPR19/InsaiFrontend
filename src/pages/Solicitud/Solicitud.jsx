import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SingleSelect from '../../components/selectmulti/SingleSelect';
import '../../main.css';
import icon from '../../components/iconos/iconos';
import { filterData } from '../../utils/filterData';
import SearchBar from "../../components/searchbart/SearchBar";
import { useNotification } from '../../utils/NotificationContext';
import { validateField, validationRules } from '../../utils/validation';
import Spinner from '../../components/spinner/Spinner';
import { BaseUrl } from '../../utils/constans';
import { exportToPDF, exportToExcel } from '../../utils/exportUtils';
import { useSearchParams, useNavigate } from 'react-router-dom';
import AyudaTooltip from '../../components/ayudanteinfo/AyudaTooltip';
import { usePermiso } from '../../hooks/usePermiso';

function Solicitud() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [recentSolicitud, setRecentSolicitud] = useState(null);
    const [datosOriginales, setDatosOriginales] = useState([]);
    const [datosFiltrados, setDatosFiltrados] = useState([]);
    const [tipoSolicitudes, setTipoSolicitudes] = useState([]);
    const [propiedades, setPropiedades] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [currentModal, setCurrentModal] = useState(null);
    const [detalleModal, setDetalleModal] = useState({ abierto: false, solicitud: null });
    const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);
    const [selectedSolicitudId, setSelectedSolicitudId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [pdfUrl, setPdfUrl] = useState(null)
    const [pdfFileName, setPdfFileName] = useState('');
    const { fileName } = getPDFInfo();
    const excelFileName = fileName.replace('.pdf', '.xlsx');
    const [searchParams, setSearchParams] = useSearchParams();
    const initializedFromQuery = React.useRef(false);
    const [formData, setFormData] = useState({
        id: '',
        descripcion: '',
        tipo_solicitud_id: null,
        propiedad_id: null,
        fecha_programada: '',
        estado: '',
        motivos: [],
        motivo_otro: ''
    });
    const [errors, setErrors] = useState({});
    const itemsPerPage = 8;
    const { addNotification } = useNotification();
    const user = JSON.parse(localStorage.getItem('user'));
    const usuario_id = user?.id;

    const tipoSolicitudOptions = tipoSolicitudes.map(t => ({ value: String(t.id), label: t.nombre }));
    const propiedadOptions = propiedades.map(p => ({ value: String(p.id), label: p.nombre }));
    const tienePermiso = usePermiso();

     // Cartas dinámicas
    const [totales, setTotales] = useState({
        solicitudesTotales: 0,
        SolicitudesCreadas: 0,
        SolicitudesAprobadas: 0,
        solicitudesRechazadas: 0
        });

        // PDF y EXCEL
    const columnsSolicitud = [
        { header: 'Código', key: 'codigo' },
        { header: 'Descripción', key: 'descripcion' },
        { header: 'Fecha Solicitada', key: 'fecha_solicitada' },
        { header: 'Estado', key: 'estado' },
        { header: 'Tipo de Solicitud', key: 'tipo_solicitud_nombre' },
        { header: 'Propiedad', key: 'propiedad_nombre' }
    ];

    const MOTIVOS = [
        'Vigilancia fitosanitaria',
        'Reinspección/Seguimiento',
        'Fiscalización post-registro',
        'Control de movilización',
        'Atención de denuncia',
        'Inspección por solicitud del productor',
        'Planificación sanitaria periódica',
        'Emitir constancia/permiso',
        'Otro'
    ];

    const buildDescripcionFromMotivos = (motivos = [], otro = '') => {
        const base = (motivos || []).filter(m => m && m !== 'Otro');
        const addOtro = motivos.includes('Otro') && otro ? `Otro: ${otro}` : null;
        return [...base, addOtro].filter(Boolean).join(' | ');
    };

    const parseDescripcionToMotivos = (desc = '') => {
    const raw = String(desc || '');
    if (!raw) return { motivos: [], otro: '' };
    const parts = raw.split('|').map(s => s.trim()).filter(Boolean);
    const motivos = [];
    let otro = '';
    for (const p of parts) {
      if (/^otro:/i.test(p)) {
        otro = p.replace(/^otro:\s*/i, '');
        motivos.push('Otro');
      } else {
        // Coincide con alguno del catálogo (tolerante a mayúsculas)
        const match = MOTIVOS.find(m => m.toLowerCase() === p.toLowerCase());
        if (match) motivos.push(match);
        else motivos.push(p); // deja el literal si no coincide
    }
    }
    return { motivos, otro };
};

    // Fetchers
    const fetchSolicitudes = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${BaseUrl}/solicitud`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setDatosOriginales(response.data);
            setDatosFiltrados(response.data);

            setTotales({
                solicitudesTotales: response.data.length,
                SolicitudesCreadas: response.data.filter(s => s.estado === 'creada').length,
                SolicitudesAprobadas: response.data.filter(s => s.estado === 'aprobada').length,
                solicitudesRechazadas: response.data.filter(s => s.estado === 'rechazada').length
            });
        } catch (error) {
            console.error('Error solicitando todas las solicitudes',error);
            addNotification('Error al obtener solicitudes', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchTipoSolicitudes = async () => {
        try {
            const response = await axios.get(`${BaseUrl}/solicitud/tipo_solicitud/all`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setTipoSolicitudes(response.data);
        } catch (error) {
            console.error('Error solicitando todos los tipos de solicitudes',error);
            addNotification('Error al obtener tipos de solicitud', 'error');
        }
    };

    const fetchPropiedades = async () => {
        try {
            const response = await axios.get(`${BaseUrl}/solicitud/propiedad/all`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setPropiedades(response.data);
        } catch (error) {
            console.error('Error solicitando todas las propiedades',error);
            addNotification('Error al obtener propiedades', 'error');
        }
    };

    useEffect(() => {
        fetchSolicitudes();
        fetchTipoSolicitudes();
        fetchPropiedades();
    }, []);

    useEffect(() => {
        const propId = searchParams.get('propiedadId');
        if (!propId || initializedFromQuery.current) return;

        // Espera a que carguen las opciones de propiedades
        if (propiedadOptions.length === 0) return;

        const opt = propiedadOptions.find(o => String(o.value) === String(propId));
        if (opt) {
            setFormData(prev => ({ ...prev, propiedad_id: opt }));
            setCurrentModal('solicitud'); // abre el modal de crear
            initializedFromQuery.current = true;

            // Opcional: limpia el query para no reabrir al volver
            setSearchParams(p => {
                p.delete('propiedadId');
                p.set('tab', 'solicitud');
                return p;
            });
        }
    }, [searchParams, propiedadOptions, setSearchParams]);

    const resetFormData = () => {
    setFormData({
        id: '',
        descripcion: '',
        tipo_solicitud_id: null,
        propiedad_id: null,
        estado: '',
        motivos: [],
        motivo_otro: ''
    });
    setErrors({});
};
    // Paginación
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentData = datosFiltrados.slice(indexOfFirstItem, indexOfLastItem);

    const handlePreviousPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };
    const handleNextPage = () => {
        if (indexOfLastItem < datosFiltrados.length) setCurrentPage(currentPage + 1);
    };
    const handlePreviousThreePages = () => {
        setCurrentPage((prev) => Math.max(prev - 3, 1));
    };
    const handleNextThreePages = () => {
        const maxPage = Math.ceil(datosFiltrados.length / itemsPerPage);
        setCurrentPage((prev) => Math.min(prev + 3, maxPage));
    };

    function getPDFInfo() {
        if (datosFiltrados.length === datosOriginales.length) {
            return {
                fileName: 'Solicitudes Todal.pdf',
                title: 'Listado de Todas las Solicitudes'
            };
        }
        if (datosFiltrados.every(s => s.estado === 'creada')) {
            return {
                fileName: 'Solicitudes_Creadas.pdf',
                title: 'Listado de Solicitudes Creadas'
            };
        }
        if (datosFiltrados.every(s => s.estado === 'aprobada')) {
            return {
                fileName: 'Solicitudes_Aprobadas.pdf',
                title: 'Listado de Solicitudes Aprobadas'
            };
        }
        if (datosFiltrados.every(s => s.estado === 'rechazada')) {
            return {
                fileName: 'Solicitudes_Rechazadas.pdf',
                title: 'Listado de Solicitudes Rechazadas'
            };
        }
        // Si hay mezcla, puedes poner "Filtradas"
        return {
            fileName: 'Solicitudes_Filtradas.pdf',
            title: 'Listado de Solicitudes Filtradas'
        };
    }

    const handlePreviewPDF = () => {
        const { fileName, title } = getPDFInfo();
        const blob = exportToPDF({
            data: datosFiltrados,
            columns: columnsSolicitud,
            fileName,
            title,
            preview: true
        });
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
        setPdfFileName(fileName);
    };

    // Modal
    const openModal = () => {
        resetFormData();
        setRecentSolicitud(null);
        setStep(1);
        setCurrentModal('solicitud');
    };

    const closeModal = () => {
        resetFormData();
        setRecentSolicitud(null);
        setStep(1);
        setCurrentModal(null);
    };

    const openEditModal = (item) => {
        const parsed = parseDescripcionToMotivos(item.descripcion || '');
        setFormData({
            id: item.id,
            descripcion: item.descripcion || '',
            fecha_solicitada: item.fecha_solicitada || '',
            fecha_resolucion: item.fecha_resolucion || '',
            fecha_programada: item.fecha_programada || item.fecha_planificacion || '',
            tipo_solicitud_id: item.tipo_solicitud_id
                ? tipoSolicitudOptions.find(opt => String(opt.value) === String(item.tipo_solicitud_id)) || null
                : null,
            propiedad_id: item.propiedad_id
                ? propiedadOptions.find(opt => String(opt.value) === String(item.propiedad_id)) || null
                : null,
            estado: item.estado || 'creada',
            motivos: parsed.motivos,
            motivo_otro: parsed.otro
        });
        setErrors({});
        setCurrentModal('solicitud');
    };

    const toggleMotivo = (motivo) => {
        setFormData(prev => {
        const sel = new Set(prev.motivos || []);
        if (sel.has(motivo)) sel.delete(motivo); else sel.add(motivo);
        return { ...prev, motivos: Array.from(sel) };
        });
    };

    // Modal eliminar
    const openConfirmDeleteModal = (id) => {
        setSelectedSolicitudId(id);
        setConfirmDeleteModal(true);
    };
    const closeConfirmDeleteModal = () => {
        setSelectedSolicitudId(null);
        setConfirmDeleteModal(false);
    };

    // Modal detalle
    const openDetalleModal = (solicitud) => setDetalleModal({ abierto: true, solicitud });
    const closeDetalleModal = () => setDetalleModal({ abierto: false, solicitud: null });

    
    const handleSave = async () => {
    let newErrors = {};
    if (!formData.tipo_solicitud_id || !formData.tipo_solicitud_id.value) {
        newErrors.tipo_solicitud_id = 'Debe seleccionar un tipo de solicitud';
    }
    if (!formData.propiedad_id || !formData.propiedad_id.value) {
        newErrors.propiedad_id = 'Debe seleccionar una propiedad';
    }
    const descFromMotivos = buildDescripcionFromMotivos(formData.motivos, formData.motivo_otro);
    if (!descFromMotivos) {
        newErrors.descripcion = 'Debe seleccionar al menos un motivo';
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
        addNotification('Completa todos los campos obligatorios', 'warning');
        return;
    }
    setLoading(true);
    try {
        const cleanFormData = {
            descripcion: descFromMotivos,
            tipo_solicitud_id: formData.tipo_solicitud_id.value,
            propiedad_id: formData.propiedad_id.value,
            fecha_resolucion: formData.fecha_resolucion || null,
            estado: formData.estado || 'creada',
            usuario_id
        };

        const { data } = await axios.post(`${BaseUrl}/solicitud`, cleanFormData, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        addNotification('Solicitud registrada con éxito', 'success');
        await fetchSolicitudes();
        setRecentSolicitud(data);
        setStep(2);
    } catch (error) {
        console.error('Error registrando la solicitud', error);
        addNotification('Error al registrar solicitud', 'error');
    } finally {
        setLoading(false);
    }
};

    
    const handleEdit = async () => {

        const descFromMotivos = buildDescripcionFromMotivos(formData.motivos, formData.motivo_otro);
        setFormData(prev => ({ ...prev, descripcion: descFromMotivos }));
        
        let newErrors = {};
        for (const field of ['descripcion', 'tipo_solicitud_id', 'propiedad_id']) {
            if (validationRules[field]) {
                const error = validateField(field, formData[field], validationRules);
                if (error) newErrors[field] = error;
            } else if (!formData[field]) {
                newErrors[field] = 'Campo obligatorio';
            }
        }
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) {
            addNotification('Completa todos los campos obligatorios', 'warning');
            return;
        }
        if (!descFromMotivos) newErrors.descripcion = 'Debe seleccionar al menos un motivo';

        setLoading(true);
        try {
            // Construye el objeto limpio
            const cleanFormData = {
                descripcion: descFromMotivos,
                tipo_solicitud_id: formData.tipo_solicitud_id?.value || '',
                propiedad_id: formData.propiedad_id?.value || '',
                fecha_resolucion: formData.fecha_resolucion || null,
                estado: formData.estado || 'creada',
                usuario_id
            };
            // Solo agrega fecha_solicitada si tiene valor
            if (formData.fecha_solicitada) {
                cleanFormData.fecha_solicitada = formData.fecha_solicitada;
            }

            await axios.put(`${BaseUrl}/solicitud/${formData.id}`, cleanFormData, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            addNotification('Solicitud actualizada con éxito', 'success');
            fetchSolicitudes();
            closeModal();
        } catch (error) {
            console.error('Error editando la solicitud', error);
            addNotification('Error al actualizar solicitud', 'error');
        } finally {
            setLoading(false);
        }
    };

    
    const handleDelete = async (id) => {
        setLoading(true);
        try {
            await axios.delete(`${BaseUrl}/solicitud/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            fetchSolicitudes();
            addNotification('Solicitud eliminada con éxito', 'success');
        } catch (error) {
            console.error('Error eliminado la solicitud',error);
            addNotification('Error al eliminar solicitud', 'error');
        } finally {
            setLoading(false);
        }
    };

    // const handleChange = (e) => {
    //         const { id, value } = e.target;
    //         setFormData(prev => ({ ...prev, [id]: value }));
    
    //         if (validationRules[id]) {
    //             const { regex, errorMessage } = validationRules[id];
    //             const { valid, message } = validateField(value, regex, errorMessage);
    //             setErrors(prev => ({ ...prev, [id]: valid ? '' : message }));
    //         }
    //     };

    // Buscar y filtrar
    const handleSearch = (searchTerm) => {
        const filtered = filterData(datosOriginales, searchTerm, [
            'id','descripcion', 'estado', 'propiedad_nombre','fecha_solicitada', 'fecha_resolucion',
        ]);
        setDatosFiltrados(filtered);
        setCurrentPage(1);
    };

    const goToNextScreen = () => {
        localStorage.setItem('seccionTwoTab', 'planificacion');
        const params = new URLSearchParams();
        params.set('tab', 'planificacion');
        if (recentSolicitud?.id) params.set('solicitudId', String(recentSolicitud.id));
        navigate(`/SeccionTwo?${params.toString()}`);
        closeModal();
    };

    return (
        <div className='mainContainer'>

            {loading && <Spinner text="Procesando..." />}
              {/* Modal Detalle */}
            {detalleModal.abierto && (
                <div className='modalOverlay'>
                    <div className='modal'>
                        <button className='closeButton' onClick={closeDetalleModal}>&times;</button>
                            <h2>Detalle de Solicitud</h2>
                            <form className='modalForm'>
                                <div className='formColumns'>
                                    <div className='formGroup'>
                                        <label>Código:</label>
                                        <input
                                            type="inpu"
                                            value={detalleModal.solicitud.codigo|| ''}
                                            className='input'
                                            disabled
                                        />
                                    </div>
                                    <div className='formGroup'>
                                        <label>Fecha Solicitada:</label>
                                        <input
                                            type="text"
                                            value={detalleModal.solicitud.fecha_solicitada || ''}
                                            className='input'
                                            disabled
                                        />
                                    </div>
                                    <div className='formGroup'>
                                        <label>Tipo de Solicitud:</label>
                                        <input
                                            type="text"
                                            value={tipoSolicitudes.find(t => String(t.id) === String(detalleModal.solicitud.tipo_solicitud_id))?.nombre || ''}
                                            className='select'
                                            disabled
                                        />
                                    </div>
                                    <div className='formGroup'>
                                        <label>Propiedad:</label>
                                        <input
                                            type="text"
                                            value={propiedades.find(p => String(p.id) === String(detalleModal.solicitud.propiedad_id))?.nombre || ''}
                                            className='select'
                                            disabled
                                        />
                                    </div>
                                    <div className='formGroup'>
                                        <label>Estado:</label>
                                        <span className={`badge-estado badge-${detalleModal.solicitud.estado}`}>
                                            {detalleModal.solicitud.estado}
                                        </span>
                                    </div>
                                    <div className='formGroup'>
                                        <label>Descripción:</label>
                                        <textarea
                                            value={detalleModal.solicitud.descripcion || ''}
                                            className='textarea'
                                            disabled
                                        />
                                    </div>
                                </div>
                            </form>
                    </div>
                </div>
            )}


            {/* Modal registro */}
            {currentModal === 'solicitud' && (
                <div className='modalOverlay'>
                    <div className='modal'>
                        <button className='closeButton' onClick={closeModal}>&times;</button>
                        {step === 1 ? (
                            <>
                                <h2>{formData.id ? 'Editar Solicitud' : 'Registrar Solicitud'}</h2>
                                <form className='modalForm'>
                                    <div className='formColumns'>
                                        <div className='formGroup'>
                                            <label><span className='Unique' title='Campo Obligatorio'>*</span>Tipo de Solicitud:</label>
                                            <SingleSelect
                                                options={tipoSolicitudOptions}
                                                value={formData.tipo_solicitud_id}
                                                onChange={val => setFormData({ ...formData, tipo_solicitud_id: val })}
                                                placeholder="Seleccione tipo de solicitud"
                                            />
                                        </div>
                                        <div className='formGroup'>
                                            <label><span className='Unique' title='Campo Obligatorio'>*</span>Propiedad:</label>
                                            <SingleSelect
                                                options={propiedadOptions}
                                                value={formData.propiedad_id}
                                                onChange={val => setFormData({ ...formData, propiedad_id: val })}
                                                placeholder="Seleccione propiedad"
                                            />
                                        </div>
                                        <div className='formGroup'>
                                            <label>
                                                <span className='Unique' title='Campo Obligatorio'>*</span>
                                                Motivo(s) de la solicitud:
                                            </label>
                                            <div className='finalidades-group' style={{ maxHeight: 220 }}>
                                                {MOTIVOS.map((m) => (
                                                <label key={m} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <input
                                                    type="checkbox"
                                                    className="finalidad-checkbox"
                                                    checked={formData.motivos.includes(m)}
                                                    onChange={() => toggleMotivo(m)}
                                                    />
                                                    {m}
                                                </label>
                                                ))}
                                                {formData.motivos.includes('Otro') && (
                                                <input
                                                    type="text"
                                                    className="input"
                                                    placeholder="Especifique el motivo"
                                                    value={formData.motivo_otro}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, motivo_otro: e.target.value }))}
                                                />
                                                )}
                                            </div>
                                            {errors.descripcion && <span className='errorText'>{errors.descripcion}</span>}

                                            {/* Vista previa de lo que se guardará en 'descripcion' */}
                                            <label style={{ marginTop: 10 }}>Vista previa descripción:</label>
                                            <textarea
                                                className='textarea'
                                                disabled
                                                value={buildDescripcionFromMotivos(formData.motivos, formData.motivo_otro)}
                                                placeholder='Se generará automáticamente a partir de los motivos seleccionados'
                                            />
                                        </div>
                                    </div>
                                    <button 
                                        type="button" 
                                        className='saveButton' 
                                        onClick={formData.id ? handleEdit : handleSave}
                                        title={formData.id ? 'Actualizar Solicitud' : 'Registrar Solicitud'}
                                        disabled={loading} 
                                    >
                                        {loading ? 'Procesando...' : 'Guardar'}
                                    </button>
                                </form>
                            </>
                        ) : (
                            <>
                            <h2>Solicitud registrada</h2>
                            <p>
                                Se creó correctamente la solicitud
                                {` ${recentSolicitud?.codigo ? `(${recentSolicitud.codigo})` : ''}`}.
                            </p>
                            <p>¿Deseas continuar para programar la planificación?</p>
                            <div className='modalActions' style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                                <button className='btn-estandar' onClick={goToNextScreen}>Continuar</button>
                                <button className='cancelButton' onClick={closeModal}>Más tarde</button>
                            </div>
                        </>
                    )}
                    </div>
                </div>
            )}

            {/* Modal eliminar */}
            {confirmDeleteModal && (
                <div className='modalOverlay'>
                    <div className='modal'>
                        <h2>Confirmar Eliminación</h2>
                        <p>¿Estás seguro de que deseas eliminar esta solicitud?</p>
                        <div className='modalActions'>
                            <button className='cancelButton' onClick={closeConfirmDeleteModal}>Cancelar</button>
                            <button className='confirmButton' onClick={() => { handleDelete(selectedSolicitudId); closeConfirmDeleteModal(); }}>Confirmar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* <Ciclo activo="solicitud" ayudaDescripcion="En esta sección puedes gestionar todas las solicitudes del sistema. Registra nuevas solicitudes, consulta su estado, edita información, elimina registros y exporta los datos según tus necesidades. Utiliza los filtros y la barra de búsqueda para encontrar rápidamente la información que necesitas. El ciclo visual te ayuda a identificar en qué etapa se encuentra cada solicitud."/> */}
            
            <div className='cardsContainer'>
                <div className='card' onClick={() => setDatosFiltrados(datosOriginales)} title='Todas las Solicitudes'>
                    <span className='cardNumber'>{totales.solicitudesTotales}</span>
                    <p>Total</p>
                </div>
                <div className='card' onClick={() => setDatosFiltrados(datosOriginales.filter(s => s.estado === 'creada'))} title='Solicitudes Creadas'>
                    <span className='cardNumber'>{totales.SolicitudesCreadas}</span>
                    <p>Solicitudes Creadas</p>
                </div>
                <div className='card' onClick={() => setDatosFiltrados(datosOriginales.filter(s => s.estado === 'aprobada'))} title='Solicitudes Aprobadas'>
                    <span className='cardNumber'>{totales.SolicitudesAprobadas}</span>
                    <p>Solicitudes Aprobadas</p>
                </div>
                <div className='card' onClick={() => setDatosFiltrados(datosOriginales.filter(s => s.estado === 'rechazada'))} title='Solicitudes Rechazadas'>
                    <span className='cardNumber'>{totales.solicitudesRechazadas}</span>
                    <p>Solicitudes Rechazadas</p>
                </div>
            </div>

            {/*/////////////////// Tabla ///////////*/}
                <div className='tituloH' 
                style={{marginTop: 20, marginBottom: 20, gap: 20}}
                >
                    <img src={icon.ver} alt="" className='iconTwo'/>
                    <h1 className='title' title='Solicitudes'>Resumen de Solicitudes</h1>
                
                {/* Ayudante informativo de Pantalla */}
                    <div >
                        <AyudaTooltip descripcion="En esta sección puedes visualizar, registrar y gestionar todas las solicitudes creadas. Usa los filtros, la búsqueda y las opciones de exportación para organizar y consultar la información de manera eficiente." />
                    </div>
                </div>
                
            {/* Tabla */}
            <div className='tableSection'>
                <div className='filtersContainer'>
                    <div className='filtersButtons'>

                        {tienePermiso('solicitud', 'crear') && (<button
                            type='button'
                            onClick={openModal}
                            className='btn-estandar'
                            title='Registrar Solicitud'
                            >
                            <img src={icon.plus} alt="Crear" className='icon' />
                            Agregar
                        </button>
                        )}
                        
                        {tienePermiso('solicitud', 'exportar') && (<button
                            type='button'
                            onClick={handlePreviewPDF}
                            className='btn-estandar'
                            title='Previsualizar PDF'
                        >
                            <img src={icon.pdf5} alt="PDF" className='icon' />
                            PDF
                        </button>
                        )}

                        {tienePermiso('solicitud', 'exportar') && (<button
                            type='button'
                            onClick={() => exportToExcel({
                                data: datosFiltrados,
                                columns: columnsSolicitud,
                                fileName: excelFileName,
                                count: true,
                                totalLabel: 'TOTAL REGISTROS'
                            })}
                            className='btn-estandar'
                            title='Descargar Formato Excel'
                            >
                            <img src={icon.excel2} alt="Excel" className='icon' />
                            Excel
                        </button>
                        )}
                    </div>
                    

                    <div className='searchContainer'>
                        <SearchBar onSearch={handleSearch} />
                        <img src={icon.lupa} alt="Buscar" className='iconlupa' />
                    </div>
                </div>
                <table className='table'>
                    <thead>
                        <tr>
                            <th>N°</th>
                            <th>Fecha Solicitada</th>
                            <th>Código</th>
                            <th>Descripción</th>
                            <th>Estado</th>
                            <th>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentData.map((item, idx) => (
                            <tr key={item.id}>
                                <td>{indexOfFirstItem + idx + 1}</td>
                                <td>{item.fecha_solicitada}</td>
                                <td>{item.codigo}</td>
                                <td>{item.descripcion}</td>
                                <td>
                                    <span className={`badge-estado badge-${item.estado}`}>
                                        {item.estado}
                                    </span>
                                </td>
                                <td>
                                    <div className='iconContainer'>
                                        <img
                                            onClick={() => openDetalleModal(item)}
                                            src={icon.ver}
                                            className='iconver'
                                            title='Ver más'
                                        />
                                        {tienePermiso('solicitud', 'editar') && (<img
                                            onClick={() => openEditModal(item)}
                                            src={icon.editar}
                                            className='iconeditar'
                                            title='Editar'
                                        />
                                        )}
                                        {tienePermiso('solicitud', 'eliminar') && (<img 
                                            onClick={() => openConfirmDeleteModal(item.id)} 
                                            src={icon.eliminar} 
                                            className='iconeliminar' 
                                            title='eliminar'
                                        />
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className='tableFooter'>
                    <img onClick={handlePreviousPage} src={icon.flecha3} className='iconBack' title='Anterior' />
                    <img onClick={handlePreviousThreePages} src={icon.flecha5} className='iconBack' title='Anterior' />
                    <span>{currentPage}</span>
                    <img onClick={handleNextThreePages} src={icon.flecha4} className='iconNext' title='Siguiente' />
                    <img onClick={handleNextPage} src={icon.flecha2} className='iconNext' title='Siguiente' />
                </div>
            </div>

            {pdfUrl && (
            <div className="modalOverlay">
                <div className="modalDetalle">
                    <button className="closeButton" onClick={() => setPdfUrl(null)}>&times;</button>
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
        </div>
    );
}

export default Solicitud;