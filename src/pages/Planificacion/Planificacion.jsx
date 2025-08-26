import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MultiSelect from '../../components/selectmulti/MultiSelect';
import SingleSelect from '../../components/selectmulti/SingleSelect';
import '../../main.css';
import icon from '../../components/iconos/iconos';
import { filterData } from '../../utils/filterData';
import SearchBar from "../../components/searchbart/SearchBar";
import { useNotification } from '../../utils/NotificationContext';
import { validateField, validationRules } from '../../utils/validation';
import Spinner from '../../components/spinner/Spinner';
import { BaseUrl } from '../../utils/constans';

function Planificacion() {
    const [datosOriginales, setDatosOriginales] = useState([]);
    const [datosFiltrados, setDatosFiltrados] = useState([]);
    const [solicitudes, setSolicitudes] = useState([]);
    const [empleados, setEmpleados] = useState([]);
    const [tipoInspecciones, setTipoInspecciones] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [currentModal, setCurrentModal] = useState(null);
    const [loading, setLoading] = useState(false);
    const [detalleModal, setDetalleModal] = useState({ abierto: false, planificacion: null });
    const [formData, setFormData] = useState({
        id: '',
        solicitud_id: '',
        fecha_programada: '',
        actividad: '',
        objetivo: '',
        hora: '',
        convocatoria: '',
        ubicacion: '',
        aseguramiento: '',
        tipo_inspeccion_fito_id: '',
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

    // Fetchers
    const fetchPlanificaciones = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${BaseUrl}/planificacion`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setDatosOriginales(response.data);
            setDatosFiltrados(response.data);
        } catch (error) {
            console.error('Error al obtener planificaciones', error);
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
        fetchPlanificaciones();
        fetchSolicitudes();
        fetchEmpleados();
        fetchTipoInspecciones();
    }, []);

    const resetFormData = () => {
        setFormData({
            id: '',
            solicitud_id: '',
            fecha_programada: '',
            actividad: '',
            objetivo: '',
            hora: '',
            convocatoria: '',
            ubicacion: '',
            aseguramiento: '',
            tipo_inspeccion_fito_id: '',
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
            solicitud_id: item.solicitud_id ? String(item.solicitud_id) : '',
            fecha_programada: item.fecha_programada || '',
            actividad: item.actividad || '',
            objetivo: item.objetivo || '',
            hora: item.hora || '',
            convocatoria: item.convocatoria || '',
            ubicacion: item.ubicacion || '',
            aseguramiento: item.aseguramiento || '',
            tipo_inspeccion_fito_id: item.tipo_inspeccion_fito_id ? String(item.tipo_inspeccion_fito_id) : '',
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
    const handleEmpleadosChange = (selected) => {
        setFormData(prev => ({
            ...prev,
            empleados_ids: selected ? selected.map(opt => opt.value) : []
        }));
    };
    const handleTipoInspeccionChange = (val) => {
        setFormData(prev => ({ ...prev, tipo_inspeccion_fito_id: val }));
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

        if (validationRules[id]) {
            const { regex, errorMessage } = validationRules[id];
            const { valid, message } = validateField(value, regex, errorMessage);
            setErrors(prev => ({ ...prev, [id]: valid ? '' : message }));
        }
    };

    const handleSave = async () => {
        let newErrors = {};
        for (const field of ['solicitud_id', 'fecha_programada', 'tipo_inspeccion_fito_id']) {
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
        setLoading(true);
        try {
            const cleanFormData = {
                ...formData,
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
            addNotification('Error al registrar planificación', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async () => {
        let newErrors = {};
        for (const field of ['solicitud_id', 'fecha_programada', 'tipo_inspeccion_fito_id']) {
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
        setLoading(true);
        try {
            const cleanFormData = {
                ...formData,
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
            'id', 'actividad', 'objetivo', 'convocatoria', 'ubicacion', 'aseguramiento', 'estado', 'fecha_programada'
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
                                        value={detalleModal.planificacion.solicitud_id}
                                        onChange={() => {}}
                                        placeholder="Seleccione solicitud"
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
                                        value={detalleModal.planificacion.tipo_inspeccion_fito_id}
                                        onChange={() => {}}
                                        placeholder="Tipo de inspección"
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
                                    <label>Solicitud:</label>
                                    <SingleSelect
                                        options={solicitudOptions}
                                        value={formData.solicitud_id}
                                        onChange={handleSolicitudChange}
                                        placeholder="Seleccione solicitud"
                                    />
                                    {errors.solicitud_id && <span className='errorText'>{errors.solicitud_id}</span>}
                                </div>
                                <div className='formGroup'>
                                    <label>Fecha Programada:</label>
                                    <input
                                        type="date"
                                        id="fecha_programada"
                                        value={formData.fecha_programada}
                                        onChange={handleChange}
                                        className='date'
                                    />
                                    {errors.fecha_programada && <span className='errorText'>{errors.fecha_programada}</span>}
                                </div>
                                <div className='formGroup'>
                                    <label>Tipo de Inspección:</label>
                                    <SingleSelect
                                        options={tipoInspeccionOptions}
                                        value={formData.tipo_inspeccion_fito_id}
                                        onChange={handleTipoInspeccionChange}
                                        placeholder="Tipo de inspección"
                                    />
                                    {errors.tipo_inspeccion_fito_id && <span className='errorText'>{errors.tipo_inspeccion_fito_id}</span>}
                                </div>
                                <div className='formGroup'>
                                    <label>Empleados Responsables:</label>
                                    <MultiSelect
                                        options={empleadosOptions}
                                        value={empleadosOptions.filter(opt => formData.empleados_ids.includes(opt.value))}
                                        onChange={handleEmpleadosChange}
                                        placeholder="Selecciona empleados..."
                                    />
                                    {formData.empleados_ids.length > 0 && (
                                        <button type="button" onClick={clearMultiSelect} className='btn-limpiar'>Limpiar</button>
                                    )}
                                    {errors.empleados_ids && <span className='errorText'>{errors.empleados_ids}</span>}
                                </div>
                                <div className='formGroup'>
                                    <label>Actividad:</label>
                                    <input
                                        type="text"
                                        id="actividad"
                                        value={formData.actividad}
                                        onChange={handleChange}
                                        className='input'
                                        placeholder="Actividad programada"
                                    />
                                </div>
                                <div className='formGroup'>
                                    <label>Objetivo:</label>
                                    <input
                                        type="text"
                                        id="objetivo"
                                        value={formData.objetivo}
                                        onChange={handleChange}
                                        className='input'
                                        placeholder="Objetivo de la planificación"
                                    />
                                </div>
                                <div className='formGroup'>
                                    <label>Hora:</label>
                                    <input
                                        type="time"
                                        id="hora"
                                        value={formData.hora}
                                        onChange={handleChange}
                                        className='input'
                                    />
                                </div>
                                <div className='formGroup'>
                                    <label>Convocatoria:</label>
                                    <input
                                        type="text"
                                        id="convocatoria"
                                        value={formData.convocatoria}
                                        onChange={handleChange}
                                        className='input'
                                        placeholder="Convocatoria"
                                    />
                                </div>
                                <div className='formGroup'>
                                    <label>Ubicación:</label>
                                    <input
                                        type="text"
                                        id="ubicacion"
                                        value={formData.ubicacion}
                                        onChange={handleChange}
                                        className='input'
                                        placeholder="Ubicación"
                                    />
                                </div>
                                <div className='formGroup'>
                                    <label>Aseguramiento:</label>
                                    <input
                                        type="text"
                                        id="aseguramiento"
                                        value={formData.aseguramiento}
                                        onChange={handleChange}
                                        className='input'
                                        placeholder="Aseguramiento"
                                    />
                                </div>
                            </div>
                            <button
                                type="button"
                                className='saveButton'
                                onClick={formData.id ? handleEdit : handleSave}
                                title={formData.id ? 'Actualizar Planificación' : 'Registrar Planificación'}>
                                Guardar
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

            {/* Tabla */}
            <div className='tableSection'>
                <div className='filtersContainer'>
                    <button
                        type='button'
                        onClick={openModal}
                        className='create'
                        title='Registrar Planificación'
                    >
                        <img src={icon.plus} alt="Crear" className='icon' />
                        Agregar
                    </button>
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