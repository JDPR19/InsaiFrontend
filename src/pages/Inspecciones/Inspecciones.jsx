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
    const [showOpcionales, setShowOpcionales] = useState(false);
    const [planificaciones, setPlanificaciones] = useState([]);
    const [finalidadesCatalogo, setFinalidadesCatalogo] = useState([]);
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
        codigo_inspeccion: '',
        n_control: '',
        area: 'vegetal',
        fecha_notificacion: '',
        fecha_inspeccion: '',
        hora_inspeccion: '',
        responsable_e: '',
        cedula_res: '',
        tlf: '',
        correo: '',
        norte: '',
        este: '',
        zona: '',
        aspectos: '',
        ordenamientos: '',
        fecha_proxima_inspeccion: '',
        estado: '',
        planificacion_id: '',
        finalidades: [],
    });
    const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);
    const [selectedInspeccionId, setSelectedInspeccionId] = useState(null);
    const { addNotification } = useNotification();
    const itemsPerPage = 8;
    const [errors, setErrors] = useState({});

    const planificacionOptions = planificaciones.map(p => ({
        value: String(p.id),
        label: `${p.solicitud_codigo || ''} Actividad: ${p.actividad || ''}`
    }));
    const finalidadOptions = finalidadesCatalogo.map(f => ({
        value: String(f.id),
        label: f.nombre
    }));

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
            console.error('Error al obtener inspecciones:', error);
            addNotification('Error al obtener inspecciones', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchPlanificaciones = async () => {
        try {
            const response = await axios.get(`${BaseUrl}/inspecciones/planificaciones/all`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setPlanificaciones(response.data);
        } catch (error) {
            console.error('Error al obtener planificaciones:', error);
            addNotification('Error al obtener planificaciones', 'error');
        }
    };

    const fetchFinalidadesCatalogo = async () => {
        try {
            const response = await axios.get(`${BaseUrl}/finalidad_catalogo`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setFinalidadesCatalogo(response.data);
        } catch (error) {
            console.error('Error al obtener finalidades:', error);
            addNotification('Error al obtener finalidades', 'error');
        }
    };

    useEffect(() => {
        fetchInspecciones();
        fetchPlanificaciones();
        fetchFinalidadesCatalogo();
    }, []);

    const resetFormData = () => {
        setFormData({
            id: '',
            codigo_inspeccion: '',
            n_control: '',
            area: 'vegetal',
            fecha_notificacion: '',
            fecha_inspeccion: '',
            hora_inspeccion: '',
            responsable_e: 'No Especificado',
            cedula_res: 'No Especificado',
            tlf: 'No Especificado',
            correo: 'No Especificado',
            norte: '',
            este: '',
            zona: '',
            aspectos: '',
            ordenamientos: '',
            fecha_proxima_inspeccion: '',
            estado: '',
            planificacion_id: '',
            finalidades: [],
        });
        setImagenes([]);
        setPreviewUrls([]);
        setImagenesGuardadas([]);
        setImagenesAEliminar([]);
        setErrors({});
    };

    // Modal handlers
    const openModal = () => {
        resetFormData();
        setCurrentModal('inspeccion');
    };

    const closeModal = () => {
        resetFormData();
        setCurrentModal(null);
    };

    const openEditModal = (item) => {
        setFormData({
            id: item.id,
            codigo_inspeccion: item.codigo_inspeccion || '',
            n_control: item.n_control || '',
            area: item.area || 'vegetal',
            fecha_notificacion: item.fecha_notificacion || '',
            fecha_inspeccion: item.fecha_inspeccion || '',
            hora_inspeccion: item.hora_inspeccion || '',
            responsable_e: item.responsable_e || '',
            cedula_res: item.cedula_res || '',
            tlf: item.tlf || '',
            correo: item.correo || '',
            norte: item.norte || '',
            este: item.este || '',
            zona: item.zona || '',
            aspectos: item.aspectos || '',
            ordenamientos: item.ordenamientos || '',
            fecha_proxima_inspeccion: item.fecha_proxima_inspeccion || '',
            estado: item.estado || '',
            planificacion_id: item.planificacion_id ? String(item.planificacion_id) : '',
            finalidades: item.finalidades ? item.finalidades.map(f => ({
                finalidad_id: String(f.finalidad_id || f.id),
                objetivo: f.objetivo || ''
            })) : [],
        });
        setImagenesGuardadas(item.imagenes || []);
        setImagenes([]);
        setPreviewUrls([]);
        setImagenesAEliminar([]);
        setErrors({});
        setCurrentModal('inspeccion');
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

    // File handlers
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setImagenes(prev => [...prev, ...files]);
        setPreviewUrls(prev => [
            ...prev,
            ...files.map(file => URL.createObjectURL(file))
        ]);
    };

    const removeImage = (index) => {
        setImagenes(prev => prev.filter((_, i) => i !== index));
        setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    };

    const removeSavedImage = (imgName) => {
        setImagenesAEliminar(prev => [...prev, imgName]);
        setImagenesGuardadas(prev => prev.filter(img => img.imagen !== imgName));
    };

    const clearImages = () => {
        setImagenes([]);
        setPreviewUrls([]);
    };

    const clearSavedImages = () => {
        setImagenesAEliminar(imagenesGuardadas.map(img => img.imagen));
        setImagenesGuardadas([]);
    };

    // Finalidad handlers
    const handleFinalidadChange = (index, field, value) => {
        setFormData(prev => {
            const finalidades = [...prev.finalidades];
            finalidades[index][field] = value;
            return { ...prev, finalidades };
        });
    };

    const addFinalidad = () => {
        setFormData(prev => ({
            ...prev,
            finalidades: [...prev.finalidades, { finalidad_id: '', objetivo: '' }]
        }));
    };

    const removeFinalidad = (index) => {
        setFormData(prev => ({
            ...prev,
            finalidades: prev.finalidades.filter((_, i) => i !== index)
        }));
    };

    // Select handlers
    const handleSelectChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
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

    // Validación
    const validateForm = () => {
        let newErrors = {};
        for (const field of ['fecha_inspeccion', 'planificacion_id']) {
            if (validationRules[field]) {
                const { regex, errorMessage } = validationRules[field];
                const { valid, message } = validateField(formData[field], regex, errorMessage);
                if (!valid) newErrors[field] = message;
            } else if (!formData[field]) {
                newErrors[field] = 'Campo obligatorio';
            }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Guardar nueva inspección
    const handleSave = async () => {
        if (!validateForm()) {
            addNotification('Completa todos los campos obligatorios', 'warning');
            return;
        }
        setLoading(true);
        try {
            const data = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                if (key === 'finalidades') {
                    data.append('finalidades', JSON.stringify(value));
                } else if (key !== 'estado') { 
                data.append(key, value ?? '');
            }
            });
            imagenes.forEach(img => data.append('imagenes', img));
            await axios.post(`${BaseUrl}/inspecciones`, data, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            addNotification('Inspección registrada con éxito', 'success');
            fetchInspecciones();
            closeModal();
        } catch (error) {
            console.error('Error al registrar inspección:', error);
            addNotification('Error al registrar inspección', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Editar inspección
    const handleEdit = async () => {
        if (!validateForm()) {
            addNotification('Completa todos los campos obligatorios', 'warning');
            return;
        }
        setLoading(true);
        try {
            const data = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                if (key === 'finalidades') {
                    data.append('finalidades', JSON.stringify(value));
                } else {
                    data.append(key, value ?? '');
                }
            });
            imagenes.forEach(img => data.append('imagenes', img));
            data.append('imagenesAEliminar', JSON.stringify(imagenesAEliminar));
            await axios.put(`${BaseUrl}/inspecciones/${formData.id}`, data, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            addNotification('Inspección actualizada con éxito', 'success');
            fetchInspecciones();
            closeModal();
        } catch (error) {
            console.error('Error al actualizar inspección:', error);
            addNotification('Error al actualizar inspección', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Eliminar inspección
    const handleDelete = async (id) => {
        setLoading(true);
        try {
            await axios.delete(`${BaseUrl}/inspecciones/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            fetchInspecciones();
            addNotification('Inspección eliminada con éxito', 'success');
        } catch (error) {
            console.error('Error al eliminar inspección:', error);
            addNotification('Error al eliminar inspección', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Seguimiento
    const handleSeguimiento = (inspeccionId) => {
        navigate(`/inspecciones/${inspeccionId}/seguimiento`);
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
            'codigo_inspeccion', 'n_control', 'responsable_e', 'estado', 'fecha_inspeccion', 'planificacion_id'
        ]);
        setDatosFiltrados(filtered);
        setCurrentPage(1);
    };

    return (
        <div className='mainContainer'>
            {loading && <Spinner text="Procesando..." />}
            {/* Modal Detalle */}
            {detalleModal.abierto && detalleModal.inspeccion && (
                <div className='modalOverlay'>
                    <div className='modal'>
                        <button className='closeButton' onClick={closeDetalleModal}>&times;</button>
                        <h2>Detalle de Inspección</h2>
                        <form className='modalForm'>
                            <div className={styles.formColumns}>
                                <div className='formGroup'>
                                    <label>Código Inspección:</label>
                                    <input type="text" value={detalleModal.inspeccion.codigo_inspeccion || ''} disabled className='input' />
                                </div>
                                <div className='formGroup'>
                                    <label>N° Control:</label>
                                    <input type="text" value={detalleModal.inspeccion.n_control || ''} disabled className='input' />
                                </div>
                                <div className='formGroup'>
                                    <label>Área:</label>
                                    <input type="text" value={detalleModal.inspeccion.area || ''} disabled className='input' />
                                </div>
                                <div className='formGroup'>
                                    <label>Fecha Notificación:</label>
                                    <input type="date" value={detalleModal.inspeccion.fecha_notificacion || ''} disabled className='date' />
                                </div>
                                <div className='formGroup'>
                                    <label>Fecha Inspección:</label>
                                    <input type="date" value={detalleModal.inspeccion.fecha_inspeccion || ''} disabled className='date' />
                                </div>
                                <div className='formGroup'>
                                    <label>Hora Inspección:</label>
                                    <input type="time" value={detalleModal.inspeccion.hora_inspeccion || ''} disabled className='input' />
                                </div>
                                <div className='formGroup'>
                                    <label>Responsable:</label>
                                    <input type="text" value={detalleModal.inspeccion.responsable_e || ''} disabled className='input' />
                                </div>
                                <div className='formGroup'>
                                    <label>Cédula Responsable:</label>
                                    <input type="text" value={detalleModal.inspeccion.cedula_res || ''} disabled className='input' />
                                </div>
                                <div className='formGroup'>
                                    <label>Teléfono:</label>
                                    <input type="text" value={detalleModal.inspeccion.tlf || ''} disabled className='input' />
                                </div>
                                <div className='formGroup'>
                                    <label>Correo:</label>
                                    <input type="email" value={detalleModal.inspeccion.correo || ''} disabled className='input' />
                                </div>
                                <div className='formGroup'>
                                    <label>Norte:</label>
                                    <input type="number" value={detalleModal.inspeccion.norte || ''} disabled className='input' />
                                </div>
                                <div className='formGroup'>
                                    <label>Este:</label>
                                    <input type="number" value={detalleModal.inspeccion.este || ''} disabled className='input' />
                                </div>
                                <div className='formGroup'>
                                    <label>Zona:</label>
                                    <input type="number" value={detalleModal.inspeccion.zona || ''} disabled className='input' />
                                </div>
                                <div className='formGroup'>
                                    <label>Aspectos:</label>
                                    <textarea value={detalleModal.inspeccion.aspectos || ''} disabled className='textarea' />
                                </div>
                                <div className='formGroup'>
                                    <label>Ordenamientos:</label>
                                    <textarea value={detalleModal.inspeccion.ordenamientos || ''} disabled className='textarea' />
                                </div>
                                <div className='formGroup'>
                                    <label>Finalidades:</label>
                                    <ul>
                                        {(detalleModal.inspeccion.finalidades || []).map((f, idx) => (
                                            <li key={idx}>{f.finalidad}: {f.objetivo}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div className='formGroup'>
                                    <label>Fecha Próxima Inspección:</label>
                                    <input type="date" value={detalleModal.inspeccion.fecha_proxima_inspeccion || ''} disabled className='date' />
                                </div>
                                <div className='formGroup'>
                                    <label>Estado:</label>
                                    <span className={`badge-estado badge-${detalleModal.inspeccion.estado}`}>
                                        {detalleModal.inspeccion.estado}
                                    </span>
                                </div>
                                <div className='formGroup'>
                                    <label>Planificación:</label>
                                    <SingleSelect
                                        options={planificacionOptions}
                                        value={detalleModal.inspeccion.planificacion_id}
                                        onChange={() => {}}
                                        placeholder="Planificación"
                                        isDisabled={true}
                                    />
                                </div>
                                <div className='formGroup'>
                                    <label>Imágenes:</label>
                                    <div className='imagenesPreview'>
                                        {(detalleModal.inspeccion.imagenes || []).map(img => (
                                            <img key={img.id} src={`${BaseUrl}/uploads/inspeccion_est/${img.imagen}`} alt="img" className='imgPreview' />
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
                    <div className='modal_tree'>
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
                            {/* Estructura de columnas con grid */}
                            <div className='formColumns'>
                            {/* Columna 1: campos principales */}
                            <div className='formColumn'>
                                <div className='formGroup'>
                                <label htmlFor="fecha_notificacion">Fecha Notificación:</label>
                                <input type="date" id="fecha_notificacion" value={formData.fecha_notificacion} onChange={handleChange} className='date' />
                                </div>
                                <div className='formGroup'>
                                <label htmlFor="fecha_inspeccion">Fecha Inspección:</label>
                                <input type="date" id="fecha_inspeccion" value={formData.fecha_inspeccion} onChange={handleChange} className='date' />
                                {errors.fecha_inspeccion && <span className='errorText'>{errors.fecha_inspeccion}</span>}
                                </div>
                                <div className='formGroup'>
                                <label htmlFor="hora_inspeccion">Hora Inspección:</label>
                                <input type="time" id="hora_inspeccion" value={formData.hora_inspeccion} onChange={handleChange} className='input' />
                                </div>
                                <div className='formGroup'>
                                <label htmlFor="norte">Norte:</label>
                                <input type="number" id="norte" value={formData.norte} onChange={handleChange} className='input' placeholder='Coordenada'/>
                                </div>
                                <div className='formGroup'>
                                <label htmlFor="este">Este:</label>
                                <input type="number" id="este" value={formData.este} onChange={handleChange} className='input' placeholder='Coordenada'/>
                                </div>
                                <div className='formGroup'>
                                <label htmlFor="zona">Zona:</label>
                                <input type="number" id="zona" value={formData.zona} onChange={handleChange} className='input' placeholder='Coordenada'/>
                                </div>
                                <div className='formGroup'>
                                <label htmlFor="aspectos">Aspectos:</label>
                                <textarea id="aspectos" value={formData.aspectos} onChange={handleChange} className='textarea' placeholder='Rellene el campo'/>
                                </div>
                                <div className='formGroup'>
                                <label htmlFor="ordenamientos">Ordenamientos:</label>
                                <textarea id="ordenamientos" value={formData.ordenamientos} onChange={handleChange} className='textarea' placeholder='Rellene el campo'/>
                                </div>
                            </div>
                            {/* Columna 2: campos opcionales y finalidades */}
                            
                            <div className='formColumn'>
                                
                                
                                <div className='formGroup'>
                                <label htmlFor="planificacion_id">Planificación:</label>
                                <SingleSelect
                                    options={planificacionOptions}
                                    value={formData.planificacion_id}
                                    onChange={val => handleSelectChange('planificacion_id', val)}
                                    placeholder="Planificación"
                                />
                                {errors.planificacion_id && <span className='errorText'>{errors.planificacion_id}</span>}
                                </div>
                                <div className='formGroup'>
                                <label htmlFor="fecha_proxima_inspeccion">Fecha Próxima Inspección:</label>
                                <input type="date" id="fecha_proxima_inspeccion" value={formData.fecha_proxima_inspeccion} onChange={handleChange} className='date' />
                                </div>
                                <div className='formGroup'>
                                <label>Área:</label>
                                <div className="radio-group">
                                    <label className="radio-label">
                                    <input
                                        type="radio"
                                        className="radio-input"
                                        name="area"
                                        value="vegetal"
                                        checked={formData.area === 'vegetal'}
                                        onChange={() => setFormData(prev => ({ ...prev, area: 'vegetal' }))}
                                    />
                                    Vegetal
                                    </label>
                                    <label className="radio-label">
                                    <input
                                        type="radio"
                                        className="radio-input"
                                        name="area"
                                        value="animal"
                                        checked={formData.area === 'animal'}
                                        onChange={() => setFormData(prev => ({ ...prev, area: 'animal' }))}
                                    />
                                    Animal
                                    </label>
                                </div>
                                </div>
                                <div className='formGroup'>
                                    <label>Responsable que atiende:</label>
                                <button
                                    type="button"
                                    className="btn-limpiar"
                                    onClick={() => setShowOpcionales(prev => !prev)}
                                    style={{ marginBottom: 8 }}
                                >
                                    {showOpcionales ? 'Ocultar campos opcionales' : 'Mostrar campos opcionales'}
                                </button>
                                <div className={`opcionales-group${showOpcionales ? '' : ' hide'}`}>
                                    <div className='formGroup'>
                                    <label htmlFor="responsable_e">Responsable:</label>
                                    <input type="text" id="responsable_e" value={formData.responsable_e} onChange={handleChange} className='input' placeholder='Campo opcional'/>
                                    </div>
                                    <div className='formGroup'>
                                    <label htmlFor="cedula_res">Cédula Responsable:</label>
                                    <input type="text" id="cedula_res" value={formData.cedula_res} onChange={handleChange} className='input' placeholder='Campo opcional'/>
                                    </div>
                                    <div className='formGroup'>
                                    <label htmlFor="tlf">Teléfono:</label>
                                    <input type="text" id="tlf" value={formData.tlf} onChange={handleChange} className='input' placeholder='Campo opcional'/>
                                    </div>
                                    <div className='formGroup'>
                                    <label htmlFor="correo">Correo:</label>
                                    <input type="email" id="correo" value={formData.correo} onChange={handleChange} className='input' placeholder='Campo opcional'/>
                                    </div>
                                </div>
                                </div>
                                <div className='formGroup'>
                                <label>Finalidades:</label>
                                <div className='finalidades-group'>
                                    {formData.finalidades.map((fin, idx) => (
                                    <div key={idx} className='finalidadRow'>
                                        <SingleSelect
                                        options={finalidadOptions}
                                        value={fin.finalidad_id}
                                        onChange={val => handleFinalidadChange(idx, 'finalidad_id', val)}
                                        placeholder="Finalidad"
                                        />
                                        <input
                                        type="text"
                                        value={fin.objetivo}
                                        onChange={e => handleFinalidadChange(idx, 'objetivo', e.target.value)}
                                        placeholder="Objetivo"
                                        className='input'
                                        />
                                        <button type="button" onClick={() => removeFinalidad(idx)} className='btn-limpiar'>Eliminar</button>
                                    </div>
                                    ))}
                                    <button type="button" onClick={addFinalidad} className='btn-limpiar'>Agregar finalidad</button>
                                </div>
                                </div>
                            </div>
                            </div>
                            <button
                                type="button"
                                className='saveButton'
                                onClick={formData.id ? handleEdit : handleSave}
                                title={formData.id ? 'Actualizar Inspección' : 'Registrar Inspección'}
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
                        <p>¿Estás seguro de que deseas eliminar esta inspección?</p>
                        <div className='modalActions'>
                            <button className='cancelButton' onClick={closeConfirmDeleteModal}>Cancelar</button>
                            <button className='confirmButton' onClick={() => { handleDelete(selectedInspeccionId); closeConfirmDeleteModal(); }}>Confirmar</button>
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
                        title='Registrar Inspección'
                    >
                        <img src={icon.plus} alt="Crear" className='icon' />
                        Inspección
                    </button>
                    <h2>Inspecciones</h2>
                    <div className='searchContainer'>
                        <SearchBar onSearch={handleSearch} />
                        <img src={icon.lupa} alt="Buscar" className='iconlupa' />
                    </div>
                </div>
                <table className='table'>
                    <thead>
                        <tr>
                            <th>N°</th>
                            <th>Código</th>
                            <th>N° Control</th>
                            <th>Fecha Inspección</th>
                            <th>Responsable</th>
                            <th>Estado</th>
                            <th>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentData.map((item, idx) => (
                            <tr key={item.id}>
                                <td>{indexOfFirstItem + idx + 1}</td>
                                <td>{item.codigo_inspeccion}</td>
                                <td>{item.n_control}</td>
                                <td>{item.fecha_inspeccion}</td>
                                <td>{item.responsable_e}</td>
                                <td>
                                    <span className={`badge-estado badge-${item.estado}`}>
                                        {item.estado}
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