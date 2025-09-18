import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MultiSelect from '../../components/selectmulti/MultiSelect';
import SingleSelect from '../../components/selectmulti/SingleSelect';
import '../../main.css';
import icon from '../../components/iconos/iconos';
import { filterData } from '../../utils/filterData';
import SearchBar from "../../components/searchbart/SearchBar";
import { useNotification } from '../../utils/NotificationContext';
import { validateField, getValidationRule } from '../../utils/validation';
import Spinner from '../../components/spinner/Spinner';
import { BaseUrl } from '../../utils/constans';
import Ciclo from '../../components/ayudanteCiclo/Ciclo';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { exportToPDF, exportToExcel } from '../../utils/exportUtils';

function Planificacion() {
    const [datosOriginales, setDatosOriginales] = useState([]);
    const [datosFiltrados, setDatosFiltrados] = useState([]);
    const [solicitudes, setSolicitudes] = useState([]);
    const [empleados, setEmpleados] = useState([]);
    const [tipoInspecciones, setTipoInspecciones] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [currentModal, setCurrentModal] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [panelFecha, setPanelFecha] = useState({ abierto: false, plan: null });
    const fechasProgramadas = datosOriginales.map(p => p.fecha_programada);
    const [pdfUrl, setPdfUrl] = useState(null);
    const [pdfFileName, setPdfFileName] = useState('');
    const [detalleModal, setDetalleModal] = useState({ abierto: false, planificacion: null });
    const [formData, setFormData] = useState({
        id: '',
        solicitud_id: null,
        fecha_programada: '',
        actividad: '',
        objetivo: '',
        hora: '',
        convocatoria: '',
        ubicacion: '',
        aseguramiento: '',
        tipo_inspeccion_fito_id: null,
        estado: '',
        empleados_ids: []
    });
    const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);
    const [selectedPlanificacionId, setSelectedPlanificacionId] = useState(null);
    const itemsPerPage = 8;
    const { addNotification } = useNotification();
    const [errors, setErrors] = useState({});

    // Opciones para selects
    const solicitudOptions = solicitudes.map(s => ({
        value: String(s.id),
        label: `${s.codigo || s.id} - (${s.propiedad_nombre || ''})`
    }));
    const empleadosOptions = empleados.map(e => ({
        value: String(e.id),
        label: `${e.cedula} - ${e.nombre} ${e.apellido}`
    }));
    const tipoInspeccionOptions = tipoInspecciones.map(t => ({
        value: String(t.id),
        label: t.nombre
    }));

    // Función para marcar fechas
    const tileClassName = ({ date, view }) => {
        if (view === 'month') {
            const fechaStr = date.toISOString().slice(0, 10);
            if (fechasProgramadas.includes(fechaStr)) {
                return 'fecha-programada';
            }
        }
        return null;
    };

    // detalles del calendario
    const tileContent = ({ date, view }) => {
        if (view === 'month') {
            const fechaStr = date.toISOString().slice(0, 10);
            const plan = datosOriginales.find(p => p.fecha_programada === fechaStr);
            if (plan) {
                return (
                    <span title={`Actividad: ${plan.actividad}\nEstado: ${plan.estado}`}>
                        {plan.estado === 'pendiente' && <span style={{ fontSize: '1.1em' }}>⏳</span>}
                        {plan.estado === 'inspeccion' && <span style={{ fontSize: '1.1em' }}>🔍</span>}
                        {plan.estado === 'rechazada' && <span style={{ fontSize: '1.1em' }}>❌</span>}
                        {plan.estado === 'aprobada' && <span style={{ fontSize: '1.1em' }}>✔️</span>}
                        {/* Puedes agregar más estados si lo necesitas */}
                        {/* <span style={{ fontSize: '1.1em', marginLeft: 2 }}>📅</span> */}
                    </span>
                );
            }
        }
        return null;
    };

    const columnsPlanificacion = [
        { header: 'Actividad', key: 'actividad' },
        { header: 'Fecha Programada', key: 'fecha_programada' },
        { header: 'Estado', key: 'estado' },
        { header: 'Objetivo', key: 'objetivo' },
        { header: 'Convocatoria', key: 'convocatoria' },
        { header: 'Ubicación', key: 'ubicacion' },
        { header: 'Aseguramiento', key: 'aseguramiento' }
    ];

    const [totales, setTotales] = useState({
        planificacionesTotales: 0,
        planificacionesPendientes: 0,
        planificacionesAprobadas: 0,
        planificacionesRechazadas: 0
    });

    // Fetchers
    const fetchPlanificaciones = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${BaseUrl}/planificacion`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setDatosOriginales(response.data);
            setDatosFiltrados(response.data);

            setTotales({
                planificacionesTotales: response.data.length,
                planificacionesPendientes: response.data.filter(p => p.estado === 'pendiente').length,
                planificacionesAprobadas: response.data.filter(p => p.estado === 'aprobada').length,
                planificacionesRechazadas: response.data.filter(p => p.estado === 'rechazada').length
            });
        } catch (error) {
            console.error('Error al obtener todas las planificaciones',error);
            addNotification('Error al obtener planificaciones', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchSolicitudes = async () => {
        try {
            const response = await axios.get(`${BaseUrl}/solicitud`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setSolicitudes(response.data);
        } catch (error) {
            console.error('Error al obtener solicitudes', error);
            addNotification('Error al obtener solicitudes', 'error');
        }
    };

    const fetchEmpleados = async () => {
        try {
            const response = await axios.get(`${BaseUrl}/planificacion/empleados`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setEmpleados(response.data);
        } catch (error) {
            console.error('Error al obtener empleados', error);
            addNotification('Error al obtener empleados', 'error');
        }
    };

    const fetchTipoInspecciones = async () => {
        try {
            const response = await axios.get(`${BaseUrl}/inspecciones/tipo-inspeccion/all`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setTipoInspecciones(response.data);
        } catch (error) {
            console.error('Error al obtener tipos de inspección', error);
            addNotification('Error al obtener tipos de inspección', 'error');
        }
    };


    useEffect(() => {
        setDatosFiltrados(datosOriginales);
        fetchPlanificaciones();
        fetchSolicitudes();
        fetchEmpleados();
        fetchTipoInspecciones();
    }, []);

    

    const resetFormData = () => {
        setFormData({
            id: '',
            solicitud_id: null,
            fecha_programada: '',
            actividad: '',
            objetivo: '',
            hora: '',
            convocatoria: '',
            ubicacion: '',
            aseguramiento: '',
            tipo_inspeccion_fito_id: null,
            estado: '',
            empleados_ids: []
        });
        setErrors({});
    };

    // Modal handlers
    const openModal = () => {
        resetFormData();
        setCurrentModal('planificacion');
    };

    const closeModal = () => {
        resetFormData();
        setCurrentModal(null);
    };

    const openEditModal = (item) => {
        setFormData({
            id: item.id,
            solicitud_id: solicitudOptions.find(opt => String(opt.value) === String(item.solicitud_id)) || null,
            fecha_programada: item.fecha_programada || '',
            actividad: item.actividad || '',
            objetivo: item.objetivo || '',
            hora: item.hora || '',
            convocatoria: item.convocatoria || '',
            ubicacion: item.ubicacion || '',
            aseguramiento: item.aseguramiento || '',
            tipo_inspeccion_fito_id: tipoInspeccionOptions.find(opt => String(opt.value) === String(item.tipo_inspeccion_fito_id)) || null,
            estado: item.estado || 'pendiente',
            empleados_ids: (item.empleados || []).map(e => String(e.id))
        });
        setErrors({});
        setCurrentModal('planificacion');
    };

    const openConfirmDeleteModal = (id) => {
        setSelectedPlanificacionId(id);
        setConfirmDeleteModal(true);
    };
    const closeConfirmDeleteModal = () => {
        setSelectedPlanificacionId(null);
        setConfirmDeleteModal(false);
    };

    const openDetalleModal = (planificacion) => setDetalleModal({ abierto: true, planificacion });
    const closeDetalleModal = () => setDetalleModal({ abierto: false, planificacion: null });

    // Select handlers
    const handleSolicitudChange = (val) => {
        setFormData(prev => ({ ...prev, solicitud_id: val }));
    };
    const handleTipoInspeccionChange = (val) => {
        setFormData(prev => ({ ...prev, tipo_inspeccion_fito_id: val }));
    };
    const handleEmpleadosChange = (selected) => {
        setFormData(prev => ({
            ...prev,
            empleados_ids: selected ? selected.map(opt => opt.value) : []
        }));
    };
    const clearMultiSelect = () => {
        setFormData(prev => ({
            ...prev,
            empleados_ids: []
        }));
    };

    // Form handlers
    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));

        // Validación universal usando getValidationRule
        const rule = getValidationRule(id);
        if (rule && rule.regex) {
            const { regex, errorMessage } = rule;
            const { valid, message } = validateField(value, regex, errorMessage);
            setErrors(prev => ({ ...prev, [id]: valid ? '' : message }));
        }
    };

    const handleSave = async () => {
        for (const field in formData) {
            const rule = getValidationRule(field);
            if (!rule || !rule.regex) continue;
            const { regex, errorMessage } = rule;
            const { valid, message } = validateField(formData[field], regex, errorMessage);
            if (!valid) {
                addNotification(message, 'warning');
                setErrors(prev => ({ ...prev, [field]: message }));
                setLoading(false);
                return;
            }
        }
        if (!formData.solicitud_id || !formData.solicitud_id.value) {
            addNotification('Debe seleccionar una solicitud', 'warning');
            return;
        }
        if (!formData.tipo_inspeccion_fito_id || !formData.tipo_inspeccion_fito_id.value) {
            addNotification('Debe seleccionar un tipo de inspección', 'warning');
            return;
        }
        setLoading(true);
        try {
            const cleanFormData = {
                ...formData,
                solicitud_id: formData.solicitud_id?.value || '',
                tipo_inspeccion_fito_id: formData.tipo_inspeccion_fito_id?.value || '',
                empleados_ids: formData.empleados_ids,
                fecha_programada: formData.fecha_programada || null,
                estado: formData.estado || 'pendiente'
            };
            await axios.post(`${BaseUrl}/planificacion`, cleanFormData, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            addNotification('Planificación registrada con éxito', 'success');
            fetchPlanificaciones();
            closeModal();
        } catch (error) {
            console.error('Error registrando la Planificación', error);
            if (error.response && error.response.data && error.response.data.error) {
            addNotification(error.response.data.error, 'warning'); // O muestra el error como prefieras
        } else {
            addNotification('Error inesperado al registrar la planificación', 'error');
        }
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async () => {
        if (Object.keys(errors).length >= 0) {
            addNotification('Completa todos los campos obligatorios', 'warning');
            return;
        }
        if (!formData.solicitud_id || !formData.solicitud_id.value) {
            addNotification('Debe seleccionar una solicitud', 'warning');
            return;
        }
        if (!formData.tipo_inspeccion_fito_id || !formData.tipo_inspeccion_fito_id.value) {
            addNotification('Debe seleccionar un tipo de inspección', 'warning');
            return;
        }
        for (const field in formData) {
            const rule = getValidationRule(field);
            if (!rule || !rule.regex) continue;
            const { regex, errorMessage } = rule;
            const { valid, message } = validateField(formData[field], regex, errorMessage);
            if (!valid) {
                addNotification(message, 'warning');
                setErrors(prev => ({ ...prev, [field]: message }));
                setLoading(false);
                return;
            }
        }
        setLoading(true);
        try {
            const cleanFormData = {
                ...formData,
                solicitud_id: formData.solicitud_id?.value || '',
                tipo_inspeccion_fito_id: formData.tipo_inspeccion_fito_id?.value || '',
                empleados_ids: formData.empleados_ids,
                fecha_programada: formData.fecha_programada || null,
                estado: formData.estado || 'pendiente'
            };
            await axios.put(`${BaseUrl}/planificacion/${formData.id}`, cleanFormData, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            addNotification('Planificación actualizada con éxito', 'success');
            fetchPlanificaciones();
            closeModal();
        } catch (error) {
            console.error('Error actualizando la Planificación', error);
            addNotification('Error al actualizar planificación', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        setLoading(true);
        try {
            await axios.delete(`${BaseUrl}/planificacion/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            fetchPlanificaciones();
            addNotification('Planificación eliminada con éxito', 'success');
        } catch (error) {
            console.error('Error eliminando la Planificación', error);
            addNotification('Error al eliminar planificación', 'error');
        } finally {
            setLoading(false);
        }
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

    // Buscar y filtrar
    const handleSearch = (searchTerm) => {
        const filtered = filterData(datosOriginales, searchTerm, [
            'actividad', 'fecha_programada', 'estado', 'objetivo', 'convocatoria', 'ubicacion', 'aseguramiento'
        ]);
        setDatosFiltrados(filtered);
        setCurrentPage(1);
    };

    return (
        <div className='mainContainer'>
            {loading && <Spinner text="Procesando..." />}
            {/* Modal Detalle */}
            {detalleModal.abierto && detalleModal.planificacion && (
                <div className='modalOverlay'>
                    <div className='modal'>
                        <button className='closeButton' onClick={closeDetalleModal}>&times;</button>
                        <h2>Detalle de Planificación</h2>
                        <form className='modalForm'>
                            <div className='formColumns'>
                                <div className='formGroup'>
                                    <label>Solicitud:</label>
                                    <SingleSelect
                                        options={solicitudOptions}
                                        value={solicitudOptions.find(opt => String(opt.value) === String(detalleModal.planificacion.solicitud_id)) || null}
                                        isDisabled={true}
                                    />
                                </div>
                                <div className='formGroup'>
                                    <label>Fecha Programada:</label>
                                    <input
                                        type="date"
                                        id="fecha_programada"
                                        value={detalleModal.planificacion.fecha_programada}
                                        disabled
                                        className='date'
                                    />
                                </div>
                                <div className='formGroup'>
                                    <label>Actividad:</label>
                                    <input
                                        type="text"
                                        value={detalleModal.planificacion.actividad || ''}
                                        disabled
                                        className='input'
                                    />
                                </div>
                                <div className='formGroup'>
                                    <label>Objetivo:</label>
                                    <input
                                        type="text"
                                        value={detalleModal.planificacion.objetivo || ''}
                                        disabled
                                        className='input'
                                    />
                                </div>
                                <div className='formGroup'>
                                    <label>Hora:</label>
                                    <input
                                        type="time"
                                        value={detalleModal.planificacion.hora || ''}
                                        disabled
                                        className='input'
                                    />
                                </div>
                                <div className='formGroup'>
                                    <label>Convocatoria:</label>
                                    <input
                                        type="text"
                                        value={detalleModal.planificacion.convocatoria || ''}
                                        disabled
                                        className='input'
                                    />
                                </div>
                                <div className='formGroup'>
                                    <label>Ubicación:</label>
                                    <input
                                        type="text"
                                        value={detalleModal.planificacion.ubicacion || ''}
                                        disabled
                                        className='input'
                                    />
                                </div>
                                <div className='formGroup'>
                                    <label>Aseguramiento:</label>
                                    <input
                                        type="text"
                                        value={detalleModal.planificacion.aseguramiento || ''}
                                        disabled
                                        className='input'
                                    />
                                </div>
                                <div className='formGroup'>
                                    <label>Tipo de Inspección:</label>
                                    <SingleSelect
                                        options={tipoInspeccionOptions}
                                        value={tipoInspeccionOptions.find(opt => String(opt.value) === String(detalleModal.planificacion.tipo_inspeccion_fito_id)) || null}
                                        isDisabled={true}
                                    />
                                </div>
                                <div className='formGroup'>
                                    <label>Empleados Responsables:</label>
                                    <MultiSelect
                                        options={empleadosOptions}
                                        value={empleadosOptions.filter(opt =>
                                            (detalleModal.planificacion.empleados || []).map(e => String(e.id)).includes(opt.value)
                                        )}
                                        onChange={() => {}}
                                        isDisabled={true}
                                        placeholder="Selecciona empleados..."
                                    />
                                </div>
                                <div className='formGroup'>
                                    <label>Estado:</label>
                                    <span className={`badge-estado badge-${detalleModal.planificacion.estado}`}>
                                        {detalleModal.planificacion.estado}
                                    </span>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal registro y editar */}
            {currentModal === 'planificacion' && (
                <div className='modalOverlay'>
                    <div className='modal'>
                        <button className='closeButton' onClick={closeModal}>&times;</button>
                        <h2>{formData.id ? 'Editar Planificación' : 'Registrar Planificación'}</h2>
                        <form className='modalForm'>
                            <div className='formColumns'>
                                <div className='formGroup'>
                                    <label><span className='Unique' title='Campo Obligatorio'>*</span>Solicitud:</label>
                                    <SingleSelect
                                        options={solicitudOptions}
                                        value={formData.solicitud_id}
                                        onChange={handleSolicitudChange}
                                        placeholder="Seleccione solicitud"
                                    />
                                </div>
                                <div className='formGroup'>
                                    <label><span className='Unique' title='Campo Obligatorio'>*</span>Fecha Programada:</label>
                                    <input
                                        type="date"
                                        id="fecha_programada"
                                        value={formData.fecha_programada}
                                        onChange={handleChange}
                                        className='date'
                                    />
                                </div>
                                <div className='formGroup'>
                                    <label><span className='Unique' title='Campo Obligatorio'>*</span>Tipo de Inspección:</label>
                                    <SingleSelect
                                        options={tipoInspeccionOptions}
                                        value={formData.tipo_inspeccion_fito_id}
                                        onChange={handleTipoInspeccionChange}
                                        placeholder="Tipo de inspección"
                                    />
                                </div>
                                <div className='formGroup'>
                                    <label><span className='Unique' title='Campo Obligatorio'>*</span>Empleados Responsables:</label>
                                    <MultiSelect
                                        options={empleadosOptions}
                                        value={empleadosOptions.filter(opt => formData.empleados_ids.includes(opt.value))}
                                        onChange={handleEmpleadosChange}
                                        placeholder="Selecciona empleados..."
                                    />
                                    {formData.empleados_ids.length > 0 && (
                                        <button type="button" onClick={clearMultiSelect} className='btn-limpiar'>Limpiar</button>
                                    )}
                                </div>
                                <div className='formGroup'>
                                    <label><span className='Unique' title='Campo Obligatorio'>*</span>Actividad:</label>
                                    <input
                                        type="text"
                                        id="actividad"
                                        value={formData.actividad}
                                        onChange={handleChange}
                                        className='input'
                                        placeholder="Actividad programada"
                                    />
                                    {errors.actividad && <span className='errorText'>{errors.actividad}</span>}
                                </div>
                                <div className='formGroup'>
                                    <label><span className='Unique' title='Campo Obligatorio'>*</span>Objetivo:</label>
                                    <input
                                        type="text"
                                        id="objetivo"
                                        value={formData.objetivo}
                                        onChange={handleChange}
                                        className='input'
                                        placeholder="Objetivo de la planificación"
                                    />
                                    {errors.objetivo && <span className='errorText'>{errors.objetivo}</span>}
                                </div>
                                <div className='formGroup'>
                                    <label><span className='Unique' title='Campo Obligatorio'>*</span>Hora:</label>
                                    <input
                                        type="time"
                                        id="hora"
                                        value={formData.hora}
                                        onChange={handleChange}
                                        className='input'
                                    />
                                </div>
                                <div className='formGroup'>
                                    <label><span className='Unique' title='Campo Obligatorio'>*</span>Convocatoria:</label>
                                    <input
                                        type="text"
                                        id="convocatoria"
                                        value={formData.convocatoria}
                                        onChange={handleChange}
                                        className='input'
                                        placeholder="Convocatoria"
                                    />
                                    {errors.convocatoria && <span className='errorText'>{errors.convocatoria}</span>}
                                </div>
                                <div className='formGroup'>
                                    <label><span className='Unique' title='Campo Obligatorio'>*</span>Ubicación:</label>
                                    <input
                                        type="text"
                                        id="ubicacion"
                                        value={formData.ubicacion}
                                        onChange={handleChange}
                                        className='input'
                                        placeholder="Ubicación"
                                    />
                                    {errors.ubicacion && <span className='errorText'>{errors.ubicacion}</span>}
                                </div>
                                <div className='formGroup'>
                                    <label><span className='Unique' title='Campo Obligatorio'>*</span>Aseguramiento:</label>
                                    <input
                                        type="text"
                                        id="aseguramiento"
                                        value={formData.aseguramiento}
                                        onChange={handleChange}
                                        className='input'
                                        placeholder="Aseguramiento"
                                    />
                                    {errors.aseguramiento && <span className='errorText'>{errors.aseguramiento}</span>}
                                </div>
                            </div>
                            <button
                                type="button"
                                className='saveButton'
                                onClick={formData.id ? handleEdit : handleSave}
                                title={formData.id ? 'Actualizar Planificación' : 'Registrar Planificación'}
                                disabled={loading}
                            >
                                {loading ? 'Procesando...' : 'Guardar'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de confirmación para eliminar */}
            {confirmDeleteModal && (
                <div className='modalOverlay'>
                    <div className='modal'>
                        <h2>Confirmar Eliminación</h2>
                        <p>¿Estás seguro de que deseas eliminar esta planificación?</p>
                        <div className='modalActions'>
                            <button className='cancelButton' onClick={closeConfirmDeleteModal}>Cancelar</button>
                            <button className='confirmButton' onClick={() => { handleDelete(selectedPlanificacionId); closeConfirmDeleteModal(); }}>Confirmar</button>
                        </div>
                    </div>
                </div>
            )}
            
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

            <Ciclo
                activo="planificacion"
                ayudaDescripcion="En esta sección puedes gestionar todas las planificaciones del sistema. Visualiza y programa actividades, inspecciones y tareas clave, consulta su estado, edita información, elimina registros y exporta los datos en formatos PDF o Excel según tus necesidades. Utiliza el calendario para identificar rápidamente las fechas programadas y acceder a los detalles de cada planificación. Las herramientas de filtrado y búsqueda te permiten encontrar fácilmente la información que necesitas, optimizando la organización y el seguimiento de tus procesos operativos."
                />

            <div style={{ margin: '30px auto', maxWidth: 700 }}>
                <div className="titulocalendario">
                    <h2 className="titleCalendario">
                        <span className="Unique">*</span>Calendario de Planificaciones
                    </h2>
                    <button
                        className="btn-deslizar"
                        title='Ir a Programar una Planificación'
                        onClick={() => {
                        document.body.style.overflow = '';
                        const tabla = document.getElementById('tablaPlanificacion');
                        if (tabla) {
                            tabla.scrollIntoView({ behavior: 'smooth' });
                        }
                        }}
                    >
                        Ir a Programar
                        <img src={icon.flechaAbajo} alt="PDF" className='icon' />
                    </button>
                    </div>
                <Calendar
                    onChange={date => {
                        setSelectedDate(date);
                        const fechaStr = date.toISOString().slice(0, 10);
                        const plan = datosOriginales.find(p => p.fecha_programada === fechaStr);
                        if (plan) {
                            setPanelFecha({ abierto: true, plan });
                        } else {
                            setPanelFecha({ abierto: false, plan: null });
                        }
                    }}
                    value={selectedDate}
                    tileClassName={tileClassName}
                    tileContent={tileContent}
                />
            </div>

            {panelFecha.abierto && panelFecha.plan && (
                <div className="panelOverlay">
                    <div className="panelLateral">
                        <button className="closeButton" onClick={() => setPanelFecha({ abierto: false, plan: null })}>&times;</button>
                        <h2>Detalle de Planificación</h2>
                        <ul style={{ fontSize: '1.1em', margin: '18px 0' }}>
                            <li><strong>Actividad:</strong> {panelFecha.plan.actividad}</li>
                            <li><strong>Estado:</strong> {panelFecha.plan.estado}</li>
                            <li><strong>Fecha Programada:</strong> {panelFecha.plan.fecha_programada}</li>
                            <li><strong>Objetivo:</strong> {panelFecha.plan.objetivo}</li>
                            <li><strong>Convocatoria:</strong> {panelFecha.plan.convocatoria}</li>
                            <li><strong>Ubicación:</strong> {panelFecha.plan.ubicacion}</li>
                            <li><strong>Aseguramiento:</strong> {panelFecha.plan.aseguramiento}</li>
                        </ul>
                        <div className="panelActions">
                            <button
                                className="panelBtn editar"
                                title="Editar"
                                onClick={() => {
                                    setPanelFecha({ abierto: false, plan: null });
                                    openEditModal(panelFecha.plan);
                                }}
                            >
                                <img src={icon.crear} alt="Editar" style={{ width: 22, marginRight: 6 }} />
                                Reprogramar
                            </button>
                            <button
                                className="panelBtn eliminar"
                                title="Eliminar"
                                onClick={() => {
                                    setPanelFecha({ abierto: false, plan: null });
                                    openConfirmDeleteModal(panelFecha.plan.id);
                                }}
                            >
                                <img src={icon.eliminar1} alt="Eliminar" style={{ width: 22, marginRight: 6 }} />
                                Eliminar
                            </button>
                            <button
                                className="panelBtn eliminar"
                                title="Exportar PDF"
                                onClick={() => {
                                    const blob = exportToPDF({
                                        data: [panelFecha.plan],
                                        columns: columnsPlanificacion,
                                        fileName: `Planificacion_${panelFecha.plan.fecha_programada}.pdf`,
                                        title: 'Detalle de Planificación',
                                        preview: true
                                    });
                                    const url = URL.createObjectURL(blob);
                                    setPdfUrl(url);
                                    setPdfFileName(`Planificacion_${panelFecha.plan.fecha_programada}.pdf`);
                                }}
                            >
                                <img src={icon.pdf5} alt="PDF" style={{ width: 22, marginRight: 6 }} />
                                PDF
                            </button>
                            <button
                                className="panelBtn editar"
                                title="Exportar Excel"
                                onClick={() => exportToExcel({
                                    data: [panelFecha.plan],
                                    columns: columnsPlanificacion,
                                    fileName: `Planificacion_${panelFecha.plan.fecha_programada}.xlsx`,
                                    count: false
                                })}
                            >
                                <img src={icon.excel2} alt="Excel" style={{ width: 22, marginRight: 6 }} />
                                Excel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className='leyendaCalendario'>
                <span>
                    <span style={{
                        background: '#98c79a',
                        borderRadius: '50%',
                        padding: '2px 8px',
                        color: '#fff',
                        marginRight: 4,
                    }}>📅</span>
                    Fecha programada
                </span>
                <span>
                    <span style={{
                        background: '#539E43',
                        borderRadius: '50%',
                        padding: '2px 8px',
                        color: '#fff',
                        marginRight: 4,
                    }}>●</span>
                    Seleccionado
                </span>
                <span>
                    <span style={{
                        background: '#ffd466bb',
                        borderRadius: '50%',
                        padding: '2px 8px',
                        color: '#444',
                        marginRight: 4,
                    }}>⏳</span>
                    Pendiente
                </span>
                <span>
                    <span style={{
                        background: '#67b0fa81',
                        borderRadius: '50%',
                        padding: '2px 8px',
                        color: '#444',
                        marginRight: 4,
                    }}>🔍</span>
                    Inspección
                </span>
                <span>
                    <span style={{
                        background: '#f5afaee1',
                        borderRadius: '50%',
                        padding: '2px 8px',
                        color: '#444',
                        marginRight: 4,
                    }}>❌</span>
                    Rechazada
                </span>
                <span>
                    <span style={{
                        background: '#539E43',
                        borderRadius: '50%',
                        padding: '2px 8px',
                        color: '#fff',
                        marginRight: 4,
                    }}>✔️</span>
                    Aprobada
                </span>
            </div>

            <div className='cardsContainer'>
                <div className='card' onClick={() => setDatosFiltrados(datosOriginales)} title='Todas las Planificaciones'>
                    <span className='cardNumber'>{totales.planificacionesTotales}</span>
                    <p>Total</p>
                </div>
                <div className='card' onClick={() => setDatosFiltrados(datosOriginales.filter(p => p.estado === 'pendiente'))} title='Planificaciones Pendientes'>
                    <span className='cardNumber'>{totales.planificacionesPendientes}</span>
                    <p>Pendientes</p>
                </div>
                <div className='card' onClick={() => setDatosFiltrados(datosOriginales.filter(p => p.estado === 'aprobada'))} title='Planificaciones Aprobadas'>
                    <span className='cardNumber'>{totales.planificacionesAprobadas}</span>
                    <p>Aprobadas</p>
                </div>
                <div className='card' onClick={() => setDatosFiltrados(datosOriginales.filter(p => p.estado === 'rechazada'))} title='Planificaciones Rechazadas'>
                    <span className='cardNumber'>{totales.planificacionesRechazadas}</span>
                    <p>Rechazadas</p>
                </div>
            </div>
            {/* Tabla */}
            <div className='tableSection' id="tablaPlanificacion">
                <div className='filtersContainer'>
                    <div className='filtersButtons'>
                        <button
                            type='button'
                            onClick={openModal}
                            className='btn-estandar'
                            title='Registrar Planificación'
                            >
                            <img src={icon.calendario} alt="Crear" className='icon' />
                            Reprogramar
                        </button>
                        <button
                            type='button'
                            onClick={() => {
                                const blob = exportToPDF({
                                    data: datosFiltrados,
                                    columns: columnsPlanificacion,
                                    fileName: 'Planificaciones.pdf',
                                    title: 'Listado de Planificaciones',
                                    preview: true
                                });
                                const url = URL.createObjectURL(blob);
                                setPdfUrl(url);
                                setPdfFileName('Planificaciones.pdf');
                            }}
                            className='btn-estandar'
                            title='Previsualizar PDF'
                        >
                            <img src={icon.pdf5} alt="PDF" className='icon' />
                            PDF
                        </button>
                        <button
                            type='button'
                            onClick={() => exportToExcel({
                                data: datosFiltrados,
                                columns: columnsPlanificacion,
                                fileName: 'Planificaciones.xlsx',
                                count: true,
                                totalLabel: 'TOTAL REGISTROS'
                            })}
                            className='btn-estandar'
                            title='Descargar Formato Excel'
                        >
                            <img src={icon.excel2} alt="Excel" className='icon' />
                            Excel
                        </button>
                    </div>
                    <h2>Planificaciones</h2>
                    <div className='searchContainer'>
                        <SearchBar onSearch={handleSearch} />
                        <img src={icon.lupa} alt="Buscar" className='iconlupa' />
                    </div>
                </div>
                <table className='table'>
                    <thead>
                        <tr>
                            <th>N°</th>
                            <th>Solicitud</th>
                            <th>Fecha Programada</th>
                            <th>Actividad</th>
                            <th>Estado</th>
                            <th>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentData.map((item, idx) => (
                            <tr key={item.id}>
                                <td>{indexOfFirstItem + idx + 1}</td>
                                <td>{solicitudOptions.find(opt => opt.value === String(item.solicitud_id))?.label || item.solicitud_id}</td>
                                <td>{item.fecha_programada}</td>
                                <td>{item.actividad}</td>
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
                                        <img
                                            onClick={() => openEditModal(item)}
                                            src={icon.editar}
                                            className='iconeditar'
                                            title='Editar'
                                        />
                                        <img
                                            onClick={() => openConfirmDeleteModal(item.id)}
                                            src={icon.eliminar}
                                            className='iconeliminar'
                                            title='Eliminar'
                                        />
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
        </div>
    );
}

export default Planificacion;