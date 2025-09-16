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
import CicloSolicitud from '../../components/ayudanteCiclo/Ciclo';
import AyudaTooltip from '../../components/ayudanteinfo/AyudaTooltip';

function Solicitud() {
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
    const [formData, setFormData] = useState({
        id: '',
        descripcion: '',
        fecha_solicitada: '',
        tipo_solicitud_id: null,
        propiedad_id: null,
        fecha_programada: '',
        estado: '',
    });
    const [errors, setErrors] = useState({});
    const itemsPerPage = 8;
    const { addNotification } = useNotification();
    const user = JSON.parse(localStorage.getItem('user'));
    const usuario_id = user?.id;

    const tipoSolicitudOptions = tipoSolicitudes.map(t => ({ value: String(t.id), label: t.nombre }));
    const propiedadOptions = propiedades.map(p => ({ value: String(p.id), label: p.nombre }));

    // Fetchers
    const fetchSolicitudes = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${BaseUrl}/solicitud`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setDatosOriginales(response.data);
            setDatosFiltrados(response.data);
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

    const resetFormData = () => {
    setFormData({
        id: '',
        descripcion: '',
        fecha_solicitada: '',
        tipo_solicitud_id: null,
        propiedad_id: null,
        fecha_programada: '',
        estado: '',
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

    // Modal
    const openModal = () => {
        resetFormData();
        setCurrentModal('solicitud');
    };

    const closeModal = () => {
        resetFormData();
        setCurrentModal(null);
    };

    const openEditModal = (item) => {
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
        });
        setErrors({});
        setCurrentModal('solicitud');
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
        if (!formData.tipo_solicitud_id || !formData.tipo_solicitud_id.value) {
            newErrors.tipo_solicitud_id = 'Debe seleccionar un tipo de solicitud';
        }
        if (!formData.propiedad_id || !formData.propiedad_id.value) {
            newErrors.propiedad_id = 'Debe seleccionar una propiedad';
        }

        let newErrors = {};
        for (const field of ['descripcion', 'fecha_solicitada', 'tipo_solicitud_id', 'propiedad_id']) {
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
                tipo_solicitud_id: formData.tipo_solicitud_id?.value || '',
                propiedad_id: formData.propiedad_id?.value || '',
                fecha_solicitada: formData.fecha_solicitada || null,
                fecha_resolucion: formData.fecha_resolucion || null,
                estado: formData.estado || 'creada',
            };
            await axios.post(`${BaseUrl}/solicitud`,{ ...cleanFormData, usuario_id }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            addNotification('Solicitud registrada con éxito', 'success');
            fetchSolicitudes();
            closeModal();
        } catch (error) {
            console.error('Error registrando la solicitud',error);
            addNotification('Error al registrar solicitud', 'error');
        } finally {
            setLoading(false);
        }
    };

    
    const handleEdit = async () => {

        if (!formData.tipo_solicitud_id || !formData.tipo_solicitud_id.value) {
            newErrors.tipo_solicitud_id = 'Debe seleccionar un tipo de solicitud';
        }
        if (!formData.propiedad_id || !formData.propiedad_id.value) {
            newErrors.propiedad_id = 'Debe seleccionar una propiedad';
        }

        let newErrors = {};
        for (const field of ['descripcion', 'fecha_solicitada', 'tipo_solicitud_id', 'propiedad_id']) {
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
                tipo_solicutd_id: formData.tipo_solicitud_id?.value || '',
                propiedad_id: formData.propiedad_id?.value || '',
                fecha_solicitada: formData.fecha_solicitada || null,
                fecha_resolucion: formData.fecha_resolucion || null,
                estado: formData.estado || 'creada',
            };
            await axios.put(`${BaseUrl}/solicitud/${formData.id}`,{ ...cleanFormData, usuario_id }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            addNotification('Solicitud actualizada con éxito', 'success');
            fetchSolicitudes();
            closeModal();
        } catch (error) {
            console.error('Error editando la solicitud',error);
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

    const handleChange = (e) => {
            const { id, value } = e.target;
            setFormData(prev => ({ ...prev, [id]: value }));
    
            if (validationRules[id]) {
                const { regex, errorMessage } = validationRules[id];
                const { valid, message } = validateField(value, regex, errorMessage);
                setErrors(prev => ({ ...prev, [id]: valid ? '' : message }));
            }
        };

    // Buscar y filtrar
    const handleSearch = (searchTerm) => {
        const filtered = filterData(datosOriginales, searchTerm, [
            'id','descripcion', 'estado', 'propiedad_nombre','fecha_solicitada', 'fecha_resolucion',
        ]);
        setDatosFiltrados(filtered);
        setCurrentPage(1);
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
                                        type="date"
                                        value={detalleModal.solicitud.fecha_solicitada || ''}
                                        className='date'
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
                        <h2>{formData.id ? 'Editar Solicitud' : 'Registrar Solicitud'}</h2>
                        <form className='modalForm'>
                            <div className='formColumns'>
                                <div className='formGroup'>
                                    <label><span className='Unique' title='Campo Obligatorio'>*</span>Fecha Solicitada:</label>
                                    <input type="date" id='fecha_solicitada' value={formData.fecha_solicitada} onChange={handleChange} className='date' />
                                    {errors.fecha_solicitada && <span className='errorText'>{errors.fecha_solicitada}</span>}
                                </div>
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
                                    <label htmlFor="descripcion"><span className='Unique' title='Campo Obligatorio'>*</span>Descripción:</label>
                                    <textarea id="descripcion" value={formData.descripcion} onChange={handleChange} className='textarea' placeholder='Descripción'/>
                                    {errors.descripcion && <span className='errorText'>{errors.descripcion}</span>}
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

            {/* Tabla */}
            <div className='tableSection'>
                <div className='filtersContainer'>
                    <button
                        type='button'
                        onClick={openModal}
                        className='create'
                        title='Registrar Solicitud'
                    >
                        <img src={icon.plus} alt="Crear" className='icon' />
                        Agregar
                    </button>
                    <h2>Solicitudes</h2>
                    <div className='searchContainer'>
                        <SearchBar onSearch={handleSearch} />
                        <img src={icon.lupa} alt="Buscar" className='iconlupa' />
                    </div>
                    <AyudaTooltip descripcion="Aquí puedes registrar una nueva solicitud. Completa todos los campos obligatorios y guarda para continuar el proceso." />
                </div>
                <table className='table'>
                    <thead>
                        <tr>
                            <th>N°</th>
                            <th>Código</th>
                            <th>Descripción</th>
                            <th>Fecha Solicitada</th>
                            <th>Estado</th>
                            <th>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentData.map((item, idx) => (
                            <tr key={item.id}>
                                <td>{indexOfFirstItem + idx + 1}</td>
                                <td>{item.codigo}</td>
                                <td>{item.descripcion}</td>
                                <td>{item.fecha_solicitada}</td>
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
                                            title='eliminar'
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
            <CicloSolicitud activo="solicitud" />
        </div>
    );
}

export default Solicitud;