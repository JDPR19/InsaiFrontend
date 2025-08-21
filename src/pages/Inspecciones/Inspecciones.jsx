import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './inspecciones.module.css';
import '../../main.css';
import icon from '../../components/iconos/iconos';
import { filterData } from '../../utils/filterData';
import SearchBar from "../../components/searchbart/SearchBar";
import { useNotification } from '../../utils/NotificationContext';
import Spinner from '../../components/spinner/Spinner';
import { validateField, validationRules } from '../../utils/validation';
import SingleSelect from '../../components/selectmulti/SingleSelect';
import MultiSelect from '../../components/selectmulti/MultiSelect';
import { BaseUrl } from '../../utils/constans';
import { useNavigate } from 'react-router-dom';
import { usePermiso } from '../../hooks/usePermiso';

function InspeccionesEst() {
    const navigate = useNavigate();
    const tienePermiso = usePermiso();
    const [datosOriginales, setDatosOriginales] = useState([]);
    const [datosFiltrados, setDatosFiltrados] = useState([]);
    const [tipoInspecciones, setTipoInspecciones] = useState([]);
    const [planificaciones, setPlanificaciones] = useState([]);
    const [imagenes, setImagenes] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);
    const [imagenesGuardadas, setImagenesGuardadas] = useState([]); 
    const [imagenesAEliminar, setImagenesAEliminar] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [currentModal, setCurrentModal] = useState(null);
    const [loading, setLoading] = useState(false);
    const [detalleModal, setDetalleModal] = useState({ abierto: false, inspeccion: null });
    const [formData, setFormData] = useState({
        id: '',
        n_control: '',
        codigo_inspeccion: '',
        area: 'vegetal',
        fecha_notificacion: '',
        fecha_inspeccion: '',
        hora_inspeccion: '',
        responsable_e: '',
        cedula_res: '',
        correo: '',
        tlf: '',
        norte: '',
        este: '',
        zona: '',
        finalidad1: '',
        finalidad2: '',
        finalidad3: '',
        finalidad4: '',
        finalidad5: '',
        finalidad6: '',
        aspectos: '',
        ordenamientos: '',
        fecha_proxima_inspeccion: '',
        estado: 'Pendiente',
        tipo_inspeccion_fito_id: '',
        planificacion_id: '',
    });
    const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);
    const [selectedInspeccionId, setSelectedInspeccionId] = useState(null);
    const { addNotification } = useNotification();
    const itemsPerPage = 8;
    const [errors, setErrors] = useState({});

    // Opciones para selects
    const tipoInspeccionOptions = tipoInspecciones.map(t => ({ value: String(t.id), label: t.nombre }));
    const planificacionOptions = planificaciones.map(p => ({ value: String(p.id), label: p.nombre || `Planificación ${p.id}` }));

    // Fetchers
    const fetchInspecciones = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${BaseUrl}/inspecciones`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setDatosOriginales(response.data);
            setDatosFiltrados(response.data);
        } catch (error) {
            console.error('error obteniendo inspecciones', error);
            addNotification('Error al obtener inspecciones', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchTipoInspecciones = async () => {
        try {
            const response = await axios.get(`${BaseUrl}/inspecciones/tipo-inspeccion/all`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setTipoInspecciones(response.data);
        } catch (error) {
            console.error('error obteniendo tipos de inspecciones', error);
            addNotification('Error al obtener tipos de inspección', 'error');
        }
    };

    const fetchPlanificaciones = async () => {
        try {
            const response = await axios.get(`${BaseUrl}/inspecciones/planificaciones/all`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setPlanificaciones(response.data);
        } catch (error) {
            console.error('error obteniendo planificaciones', error);
            addNotification('Error al obtener planificaciones', 'error');
        }
    };


    useEffect(() => {
        fetchInspecciones();
        fetchTipoInspecciones();
        fetchPlanificaciones();
    }, []);

    const resetFormData = () => {
        setFormData({
            id: '',
            n_control: '',
            codigo_inspeccion: '',
            area: 'vegetal',
            fecha_notificacion: '',
            fecha_inspeccion: '',
            hora_inspeccion: '',
            responsable_e: '',
            cedula_res: '',
            correo: '',
            tlf: '',
            norte: '',
            este: '',
            zona: '',
            finalidad1: '',
            finalidad2: '',
            finalidad3: '',
            finalidad4: '',
            finalidad5: '',
            finalidad6: '',
            aspectos: '',
            ordenamientos: '',
            fecha_proxima_inspeccion: '',
            estado: 'Pendiente',
            tipo_inspeccion_fito_id: '',
            planificacion_id: '',
        });
        setImagenes([]);
        setPreviewUrls([]);
        setImagenesGuardadas([]);
        setImagenesAEliminar([]);
        setErrors({});
    };

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));

        if (validationRules[id]) {
            const { regex, errorMessage } = validationRules[id];
            const { valid, message } = validateField(value, regex, errorMessage);
            setErrors(prev => ({ ...prev, [id]: valid ? '' : message }));
        }
    };

    const handleSelectChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setImagenes(files);

        const urls = files.map(file => URL.createObjectURL(file));
        setPreviewUrls(urls);
    };

    const removeImage = (index) => {
        const newImagenes = [...imagenes];
        const newPreviewUrls = [...previewUrls];
        newImagenes.splice(index, 1);
        newPreviewUrls.splice(index, 1);
        setImagenes(newImagenes);
        setPreviewUrls(newPreviewUrls);
    };

    const clearImages = () => {
        setImagenes([]);
        setPreviewUrls([]);
    };

    const validateForm = () => {
        let valid = true;
        let newErrors = {};
        for (const field of [
            'codigo_inspeccion', 'n_control', 'estado', 
        ]) {
            if (validationRules[field]) {
                const { regex, errorMessage } = validationRules[field];
                const { valid: isValid, message } = validateField(formData[field], regex, errorMessage);
                if (!isValid) {
                    newErrors[field] = message;
                    valid = false;
                }
            } else if (!formData[field]) {
                newErrors[field] = 'Campo obligatorio';
                valid = false;
            }
        }
        setErrors(newErrors);
        return valid;
    };

    const handleSeguimiento = (inspeccionId) => {
        navigate(`/inspecciones/${inspeccionId}/seguimiento`);
    };

    const handleSave = async () => {

        if (!tienePermiso('inspecciones', 'crear')) {
            addNotification('No tienes permiso para crear inspecciones', 'error');
            return;
        }

        if (!validateForm()) {
            addNotification('Verifica los campos obligatorios', 'warning');
            return;
        }
        setLoading(true);

        try {
            if (imagenes.length === 0) {
                await axios.post(`${BaseUrl}/inspecciones`, {
                    ...formData
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
            } else {
                const form = new FormData();
                Object.entries(formData).forEach(([key, value]) => {
                    form.append(key, value);
                });
                imagenes.forEach(img => form.append('imagenes', img));
                await axios.post(`${BaseUrl}/inspecciones`, form, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
            }
            addNotification('Inspección registrada con éxito', 'success');
            fetchInspecciones();
            closeModal();
        } catch (error) {
            console.error('error registrando inspecciones', error);
            addNotification('Error al registrar inspección', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async () => {

        if (!tienePermiso('inspecciones', 'editar')) {
            addNotification('No tienes permiso para editar inspecciones', 'error');
            return;
        }

        if (!validateForm()) {
            addNotification('Verifica los campos obligatorios', 'warning');
            return;
        }
        setLoading(true);

        try {
            if (imagenes.length === 0) {
                await axios.put(`${BaseUrl}/inspecciones/${formData.id}`, {
                    ...formData,
                    imagenesAEliminar
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
            } else {
                const form = new FormData();
                Object.entries(formData).forEach(([key, value]) => {
                    form.append(key, value);
                });
                imagenes.forEach(img => form.append('imagenes', img));
                imagenesAEliminar.forEach(imgName => form.append('imagenesAEliminar', imgName));
                await axios.put(`${BaseUrl}/inspecciones/${formData.id}`, form, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
            }
            addNotification('Inspección actualizada con éxito', 'success');
            fetchInspecciones();
            closeModal();
        } catch (error) {
            console.error('error actualizando inspecciones', error);
            addNotification('Error al actualizar inspección', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        setLoading(true);
        try {
            await axios.delete(`${BaseUrl}/inspecciones/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            fetchInspecciones();
            addNotification('Inspección eliminada con éxito', 'success');
        } catch (error) {
            console.error('error eliminando inspecciones', error);
            addNotification('Error al eliminar inspección', 'error');
        } finally {
            setLoading(false);
        }
    };

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

    const openModal = () => {
        resetFormData();
        setImagenes([]);
        setPreviewUrls([]);
        setImagenesGuardadas([]);
        setImagenesAEliminar([]);
        setCurrentModal('inspeccion');
    };
    
    const closeModal = () => {
        setCurrentModal(null);
        resetFormData();
    };

    const openEditModal = (inspeccion) => {
        setFormData({
            id: inspeccion.id,
            n_control: inspeccion.n_control || '',
            codigo_inspeccion: inspeccion.codigo_inspeccion || '',
            area: inspeccion.area || '',
            fecha_notificacion: inspeccion.fecha_notificacion || '',
            fecha_inspeccion: inspeccion.fecha_inspeccion || '',
            hora_inspeccion: inspeccion.hora_inspeccion || '',
            responsable_e: inspeccion.responsable_e || '',
            cedula_res: inspeccion.cedula_res || '',
            correo: inspeccion.correo || '',
            tlf: inspeccion.tlf || '',
            norte: inspeccion.norte || '',
            este: inspeccion.este || '',
            zona: inspeccion.zona || '',
            aspectos: inspeccion.aspectos || '',
            finalidad1: inspeccion.finalidad1 || '',
            finalidad2: inspeccion.finalidad2 || '',
            finalidad3: inspeccion.finalidad3 || '',
            finalidad4: inspeccion.finalidad4 || '',
            finalidad5: inspeccion.finalidad5 || '',
            finalidad6: inspeccion.finalidad6 || '',
            ordenamientos: inspeccion.ordenamientos || '',
            fecha_proxima_inspeccion: inspeccion.fecha_proxima_inspeccion || '',
            estado: inspeccion.estado || 'Pendiente',
            tipo_inspeccion_fito_id: inspeccion.tipo_inspeccion_fito_id ? String(inspeccion.tipo_inspeccion_fito_id) : '',
            planificacion_id: inspeccion.planificacion_id ? String(inspeccion.planificacion_id) : '',
        });
        setImagenes([]);
        setPreviewUrls([]);
        setImagenesGuardadas(inspeccion.imagenes || []);
        setImagenesAEliminar([]);
        setCurrentModal('inspeccion');
    };

    const removeSavedImage = (imgName) => {
        setImagenesGuardadas(prev => prev.filter(img => img.imagen !== imgName));
        setImagenesAEliminar(prev => [...prev, imgName]);
    };

    const clearSavedImages = () => {
        setImagenesAEliminar(imagenesGuardadas.map(img => img.imagen));
        setImagenesGuardadas([]);
    };

    const openConfirmDeleteModal = (id) => {
        setSelectedInspeccionId(id);
        setConfirmDeleteModal(true);
    };
    const closeConfirmDeleteModal = () => {
        setSelectedInspeccionId(null);
        setConfirmDeleteModal(false);
    };

    const openDetalleModal = (inspeccion) => setDetalleModal({ abierto: true, inspeccion });
    const closeDetalleModal = () => setDetalleModal({ abierto: false, inspeccion: null });

    return (
        <div className='mainContainer'>
            {loading && <Spinner text="Procesando..." />}
            {/* Modal Detalle */}
            {detalleModal.abierto && (
                <div className='modalOverlay'>
                    <div className='modalDetalle'>
                        <button className='closeButton' onClick={closeDetalleModal}>&times;</button>
                        <h2>Detalles de la Inspección</h2>
                        <form className='modalForm'>
                            <div className={styles.formColumns}>
                                {/* Todos los campos igual que en edición, pero deshabilitados */}
                                <div className='formGroup'>
                                    <label>Código de Inspección:</label>
                                    <input type="text" value={detalleModal.inspeccion.codigo_inspeccion} className='input' disabled />
                                </div>
                                <div className='formGroup'>
                                    <label>N° Control:</label>
                                    <input type="text" value={detalleModal.inspeccion.n_control} className='input' disabled />
                                </div>
                                <div className='formGroup'>
                                    <label>Fecha notificación:</label>
                                    <input type="date" value={detalleModal.inspeccion.fecha_notificacion} className='date' disabled />
                                </div>
                                <div className='formGroup'>
                                    <label>Fecha inspección:</label>
                                    <input type="date" value={detalleModal.inspeccion.fecha_inspeccion} className='date' disabled />
                                </div>
                                <div className='formGroup'>
                                    <label>Hora Inspección:</label>
                                    <input type="time" value={detalleModal.inspeccion.hora_inspeccion} className='time' disabled />
                                </div>
                                <div className='formGroup'>
                                    <label>Tipo de Inspección:</label>
                                    <input type="text" value={detalleModal.inspeccion.tipo_inspeccion_nombre} className='input' disabled />
                                </div>
                                <div className='formGroup'>
                                    <label>Propiedad a Inspeccionar:</label>
                                    <input type="text" value={detalleModal.inspeccion.propiedad_nombre} className='input' disabled />
                                </div>
                                <div className='formGroup'>
                                    <label>Área:</label>
                                    <input type="text" value={detalleModal.inspeccion.area} className='input' disabled />
                                </div>
                                <div className='formGroup'>
                                    <label>Nombre Responsable:</label>
                                    <input type="text" value={detalleModal.inspeccion.responsable_e} className='input' disabled />
                                </div>
                                <div className='formGroup'>
                                    <label>Cédula Responsable:</label>
                                    <input type="text" value={detalleModal.inspeccion.cedula_res} className='input' disabled />
                                </div>
                                <div className='formGroup'>
                                    <label>Teléfono Responsable:</label>
                                    <input type="text" value={detalleModal.inspeccion.tlf} className='input' disabled />
                                </div>
                                <div className='formGroup'>
                                    <label>Correo Responsable:</label>
                                    <input type="email" value={detalleModal.inspeccion.correo} className='input' disabled />
                                </div>
                                <div className='formGroup'>
                                    <label>Norte:</label>
                                    <input type="text" value={detalleModal.inspeccion.norte} className='input' disabled />
                                </div>
                                <div className='formGroup'>
                                    <label>Este:</label>
                                    <input type="text" value={detalleModal.inspeccion.este} className='input' disabled />
                                </div>
                                <div className='formGroup'>
                                    <label>Zona:</label>
                                    <input type="text" value={detalleModal.inspeccion.zona} className='input' disabled />
                                </div>
                                <div className='formGroup'>
                                    <label>Aspectos:</label>
                                    <textarea value={detalleModal.inspeccion.aspectos} className='textarea' disabled />
                                </div>
                                <div className='formGroup'>
                                    <label>Ordenamientos:</label>
                                    <textarea value={detalleModal.inspeccion.ordenamientos} className='textarea' disabled />
                                </div>
                                <div className='formGroup'>
                                    <label>Fecha Próxima Inspección:</label>
                                    <input type="date" value={detalleModal.inspeccion.fecha_proxima_inspeccion} className='date' disabled />
                                </div>
                                <div className='formGroup'>
                                    <label>Estado:</label>
                                    <input type="text" value={detalleModal.inspeccion.estado} className='input' disabled />
                                </div>
                                <div className='formGroup'>
                                    <label>Finalidad 1:</label>
                                    <textarea value={detalleModal.inspeccion.finalidad1} className='textarea' disabled />
                                </div>
                                <div className='formGroup'>
                                    <label>Finalidad 2:</label>
                                    <textarea value={detalleModal.inspeccion.finalidad2} className='textarea' disabled />
                                </div>
                                <div className='formGroup'>
                                    <label>Finalidad 3:</label>
                                    <textarea value={detalleModal.inspeccion.finalidad3} className='textarea' disabled />
                                </div>
                                <div className='formGroup'>
                                    <label>Finalidad 4:</label>
                                    <textarea value={detalleModal.inspeccion.finalidad4} className='textarea' disabled />
                                </div>
                                <div className='formGroup'>
                                    <label>Finalidad 5:</label>
                                    <textarea value={detalleModal.inspeccion.finalidad5} className='textarea' disabled />
                                </div>
                                <div className='formGroup'>
                                    <label>Finalidad 6:</label>
                                    <textarea value={detalleModal.inspeccion.finalidad6} className='textarea' disabled />
                                </div>
                                <div className='formGroup'>
                                    <label>Imágenes:</label>
                                    <div style={{ display: 'flex', gap: 10, margin: '10px 0', alignItems: 'center' }}>
                                        {(detalleModal.inspeccion.imagenes || []).map(img => (
                                            <a
                                                key={img.id}
                                                href={`${BaseUrl}/uploads/inspeccion_est/${img.imagen}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <img
                                                    src={`${BaseUrl}/uploads/inspeccion_est/${img.imagen}`}
                                                    alt="Inspección"
                                                    style={{ maxWidth: 100, marginRight: 8 }}
                                                    onError={e => { e.target.style.display = 'none'; }}
                                                />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal registro y editar */}
            {currentModal === 'inspeccion' && (
                <div className='modalOverlay'>
                    <div className='modal'>
                        <button className='closeButton' onClick={closeModal}>&times;</button>
                        <h2>{formData.id ? 'Editar Inspección' : 'Registrar Inspección'}</h2>
                        <input
                            type="file"
                            id="imagenes"
                            className="input-imagen"
                            multiple
                            onChange={handleFileChange}
                        />
                        <label htmlFor="imagenes" className="label-imagen">
                            <img src={icon.pdf3} alt="Subir" className="iconSubir" style={{ width: 18, marginRight: 6 }} />
                            Subir Imágenes
                        </label>                          
                        {!formData.id && previewUrls.length > 0 && (
                            <div style={{ display: 'flex', gap: 10, margin: '10px 0', alignItems: 'center' }}>
                                {previewUrls.map((url, idx) => (
                                    <div key={idx} style={{ position: 'relative' }}>
                                        <img src={url} alt={`preview-${idx}`} style={{ maxWidth: 80, maxHeight: 80, border: '1px solid #ccc' }} />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(idx)}
                                            title="Quitar imagen"
                                            className='closeButton2'
                                        >×</button>
                                    </div>
                                ))}
                                <button type="button" onClick={clearImages} className="btn-limpiar" title='Limpiar todas las imágenes seleccionadas'>Limpiar todas</button>
                            </div>
                        )}
                        {formData.id && (
                            <>
                                {imagenesGuardadas.length > 0 && previewUrls.length === 0 && (
                                    <div style={{ display: 'flex', gap: 10, margin: '10px 0', alignItems: 'center' }}>
                                        {imagenesGuardadas.map((img, idx) => (
                                            <div key={img.id || img.imagen} style={{ position: 'relative' }}>
                                                <img
                                                    src={`${BaseUrl}/uploads/inspeccion_est/${img.imagen}`}
                                                    alt={`guardada-${idx}`}
                                                    style={{ maxWidth: 80, maxHeight: 80, border: '1px solid #ccc' }}
                                                    onError={e => { e.target.style.display = 'none'; }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeSavedImage(img.imagen)}
                                                    title="Quitar imagen"
                                                    className='closeButton2'
                                                >×</button>
                                            </div>
                                        ))}
                                        <button type="button" onClick={clearSavedImages} className="btn-limpiar" title='Limpiar todas las imágenes guardadas'>Limpiar todas</button>
                                    </div>
                                )}
                                {previewUrls.length > 0 && (
                                    <div style={{ display: 'flex', gap: 10, margin: '10px 0', alignItems: 'center' }}>
                                        {previewUrls.map((url, idx) => (
                                            <div key={idx} style={{ position: 'relative' }}>
                                                <img src={url} alt={`preview-${idx}`} style={{ maxWidth: 80, maxHeight: 80, border: '1px solid #ccc' }} />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(idx)}
                                                    title="Quitar imagen"
                                                    className='closeButton2'
                                                >×</button>
                                            </div>
                                        ))}
                                        <button type="button" onClick={clearImages} className="btn-limpiar" title='Limpiar todas las imágenes seleccionadas'>Limpiar todas</button>
                                    </div>
                                )}
                            </>
                        )}

                        <form className='modalForm'>
                            <div className={styles.formColumns}>
                                <div className='formGroup'>
                                    <label htmlFor="codigo_inspeccion">Código de Inspección:</label>
                                    <input type="text" id="codigo_inspeccion" value={formData.codigo_inspeccion} onChange={handleChange} className='input' placeholder='10-00-M00-P00-F01' />
                                    {errors.codigo_inspeccion && <span className='errorText'>{errors.codigo_inspeccion}</span>}
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="n_control">N° Control:</label>
                                    <input type="text" id="n_control" value={formData.n_control} onChange={handleChange} className='input' placeholder='Yar-1659408630-01'/>
                                    {errors.n_control && <span className='errorText'>{errors.n_control}</span>}
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="fecha_notificacion">Fecha notificación:</label>
                                    <input type="date" id="fecha_notificacion" value={formData.fecha_notificacion} onChange={handleChange} className='date' />
                                    {errors.fecha_notificacion && <span className='errorText'>{errors.fecha_notificacion}</span>}
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="fecha_inspeccion">Fecha inspección:</label>
                                    <input type="date" id="fecha_inspeccion" value={formData.fecha_inspeccion} onChange={handleChange} className='date' />
                                    {errors.fecha_inspeccion && <span className='errorText'>{errors.fecha_inspeccion}</span>}
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="hora_inspeccion">Hora Inspección:</label>
                                    <input type="time" id="hora_inspeccion" value={formData.hora_inspeccion} onChange={handleChange} className='time' />
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="tipo_inspeccion_fito_id">Tipo de Inspección:</label>
                                    <SingleSelect
                                        options={tipoInspeccionOptions}
                                        value={formData.tipo_inspeccion_fito_id}
                                        onChange={val => handleSelectChange('tipo_inspeccion_fito_id', val)}
                                        placeholder="Seleccione tipo de inspección"
                                    />
                                    {errors.tipo_inspeccion_fito_id && <span className='errorText'>{errors.tipo_inspeccion_fito_id}</span>}
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="planificacion_id">Planificación:</label>
                                    <SingleSelect
                                        options={planificacionOptions}
                                        value={formData.planificacion_id}
                                        onChange={val => handleSelectChange('planificacion_id', val)}
                                        placeholder="Seleccione planificación"
                                    />
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="estado">Estatus Inspecciòn:</label>
                                    <SingleSelect
                                        options={[
                                            { value: 'creada', label: 'Creada' },
                                            { value: 'diagnosticada', label: 'Diagnosticada' },
                                            { value: 'inspeccionando', label: 'Inspeccionando' },
                                            { value: 'aprobada', label: 'Aprobada' },
                                            { value: 'rechazada', label: 'Rechazada' }
                                        ]}
                                        value={formData.estado}
                                        onChange={val => handleSelectChange('estado', val)}
                                        placeholder="Seleccione un estado"
                                    />
                                    {errors.estado && <span className='errorText'>{errors.estado}</span>}
                                </div> 
                                <div className='formGroup'>
                                    <label>Área a la Cual Pertenece:</label>
                                    <div className="radio-group">
                                        <label style={{ marginLeft: '10px' }}>
                                            <input
                                                type="radio"
                                                className="radio-input"
                                                name="area"
                                                value="vegetal"
                                                checked={formData.area === 'vegetal'}
                                                onChange={() => setFormData(prev => ({ ...prev, area: 'vegetal' }))}
                                            /> Vegetal
                                        </label>
                                        <label>
                                            <input
                                                type="radio"
                                                className="radio-input"
                                                name="area"
                                                value="animal"
                                                checked={formData.area === 'animal'}
                                                onChange={() => setFormData(prev => ({ ...prev, area: 'animal' }))}
                                            /> Animal
                                        </label>
                                    </div>
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="responsable_e">Responsable que atiende:</label>
                                    <input type="text" id="responsable_e" value={formData.responsable_e} onChange={handleChange} className='input' placeholder='Opcional'/>
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="cedula_res">Cédula del Responsable:</label>
                                    <input type="text" id="cedula_res" value={formData.cedula_res} onChange={handleChange} className='input' placeholder='Opcional'/>
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="tlf">Teléfono del Responsable:</label>
                                    <input type="text" id="tlf" value={formData.tlf} onChange={handleChange} className='input'  placeholder='Opcional'/>
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="correo">Correo del Responsable:</label>
                                    <input type="email" id="correo" value={formData.correo} onChange={handleChange} className='input'  placeholder='Opcional'/>
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="norte">Norte:</label>
                                    <input type="text" id="norte" value={formData.norte} onChange={handleChange} className='input' placeholder='Coordenadas UTM'/>
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="este">Este:</label>
                                    <input type="text" id="este" value={formData.este} onChange={handleChange} className='input' placeholder='Coordenadas UTM'/>
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="zona">Zona:</label>
                                    <input type="text" id="zona" value={formData.zona} onChange={handleChange} className='input' placeholder='Coordenadas UTM'/>
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="aspectos">Aspectos Constatados en la Vista:</label>
                                    <textarea id="aspectos" value={formData.aspectos} onChange={handleChange} className='textarea'  placeholder='Opcional'/>
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="ordenamientos">Ordenamientos de Medida:</label>
                                    <textarea id="ordenamientos" value={formData.ordenamientos} onChange={handleChange} className='textarea'  placeholder='Opcional'/>
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="fecha_proxima_inspeccion">Fecha Próxima Inspección:</label>
                                    <input type="date" id="fecha_proxima_inspeccion" value={formData.fecha_proxima_inspeccion} onChange={handleChange} className='date' />
                                </div>                               
                                <div className='formGroup'>
                                    <label htmlFor="finalidad1">Finalidad : Verificar el estado Fitosanitario de:</label>
                                    <textarea id="finalidad1" value={formData.finalidad1} onChange={handleChange} className='textarea'  placeholder='Opcional Fitosanitario'/>
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="finalidad2">Finalidad : Verificar el Estado Zoosanitario de:</label>
                                    <textarea id="finalidad2" value={formData.finalidad2} onChange={handleChange} className='textarea'  placeholder='Opcional Zoosanitario'/>
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="finalidad3">Finalidad : Verificar el estado de Procesos :</label>
                                    <textarea id="finalidad3" value={formData.finalidad3} onChange={handleChange} className='textarea'  placeholder='Opcional Agroecológia'/>
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="finalidad4">Finalidad : Vereificar el origen de movilización:</label>
                                    <textarea id="finalidad4" value={formData.finalidad4} onChange={handleChange} className='textarea'  placeholder='Opcional Movilización'/>
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="finalidad5">Finalidad : Verificar Buenas Prácticas :</label>
                                    <textarea id="finalidad5" value={formData.finalidad5} onChange={handleChange} className='textarea'  placeholder='Opcional Manofactura'/>
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="finalidad6">Otra Finalidad:</label>
                                    <textarea id="finalidad6" value={formData.finalidad6} onChange={handleChange} className='textarea'  placeholder='Opcional'/>
                                </div>
                            </div>
                            <button
                                type="button"
                                className='saveButton'
                                onClick={formData.id ? handleEdit : handleSave}
                                title={formData.id ? 'Actualizar Inspección' : 'Registrar Inspección'}>
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
                        <p>¿Estás seguro de que deseas eliminar esta inspección?</p>
                        <div className='modalActions'>
                            <button className='cancelButton' onClick={closeConfirmDeleteModal}>Cancelar</button>
                            <button className='confirmButton' onClick={() => { handleDelete(selectedInspeccionId); closeConfirmDeleteModal(); }}>Confirmar</button>
                        </div>
                    </div>
                </div>
            )}

            <div className='tableSection'>
                <div className='filtersContainer'>
                    <button
                        type='button'
                        onClick={openModal}
                        className='create'
                        title='Registrar Inspección'
                    >
                        <img src={icon.plus} alt="Crear" className='icon' />
                        Agregar
                    </button>
                    <h2>Inspecciones</h2>
                    <div className='searchContainer'>
                        <SearchBar onSearch={searchTerm => {
                            const filtered = filterData(datosOriginales, searchTerm, [
                                'codigo_inspeccion', 'n_control', 'area', 'estado'
                            ]);
                            setDatosFiltrados(filtered);
                        }} />
                        <img src={icon.lupa} alt="Buscar" className='iconlupa' />
                    </div>
                </div>
                <table className='table'>
                    <thead>
                        <tr>
                            <th>N°</th>
                            <th>Código</th>
                            <th>Fecha</th>
                            <th>Estado</th>
                            <th>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentData.map((item, idx) => (
                            <tr key={item.id}>
                                <td>{indexOfFirstItem + idx + 1}</td>
                                <td>{item.codigo_inspeccion}</td>
                                <td>{item.fecha_inspeccion}</td>
                                <td>
                                    <span className={`badge-estado badge-${item.estado?.toLowerCase().replace(/\s/g, '')}`}>
                                        {item.estado.charAt(0).toUpperCase() + item.estado.slice(1)}
                                    </span>
                                </td>
                                <td>
                                    <div className='iconContainer'>
                                        
                                    {!['aprobada', 'rechazada'].includes(item.estado) && (
                                            <img src={icon.ojito}
                                            onClick={() => handleSeguimiento(item.id)} 
                                            alt="Seguimiento" 
                                            className='iconver'
                                            title='Dar Seguimiento a esta Inspección'
                                            />
                                    )}
                                        <img
                                            onClick={() => openDetalleModal(item)}
                                            src={icon.ver}
                                            className='iconver'
                                            title='Ver más'
                                        />
                                    {tienePermiso('inspecciones', 'editar') && (
                                        <img
                                            onClick={() => openEditModal(item)}
                                            src={icon.editar}
                                            className='iconeditar'
                                            title='Editar'
                                        />
                                    )}
                                    {tienePermiso('inspecciones', 'eliminar') && (
                                        <img
                                            onClick={() => openConfirmDeleteModal(item.id)}
                                            src={icon.eliminar}
                                            className='iconeliminar'
                                            title='Eliminar'
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
        </div>
    );
}

export default InspeccionesEst;