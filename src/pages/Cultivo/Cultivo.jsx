import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './cultivo.module.css';
import '../../main.css';
import icon from '../../components/iconos/iconos';
import { filterData } from '../../utils/filterData';
import SearchBar from "../../components/searchbart/SearchBar";
import Notification from '../../components/notification/Notification';
import { useNotification } from '../../utils/useNotification';
import { validateField, validationRules } from '../../utils/validation';
import Spinner from '../../components/spinner/Spinner';
import SingleSelect from '../../components/selectmulti/SingleSelect';
import { BaseUrl } from '../../utils/constans';

function Cultivo() {
    const [datosOriginales, setDatosOriginales] = useState([]);
    const [datosFiltrados, setDatosFiltrados] = useState([]);
    const [tipos, setTipos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [currentModal, setCurrentModal] = useState(null);
    const [detalleModal, setDetalleModal] = useState({ abierto: false, cultivo: null });
    const [formData, setFormData] = useState({
        id: '',
        nombre: '',
        nombre_cientifico: '',
        descripcion: '',
        tipo_cultivo_id: ''
    });
    const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);
    const [selectedCultivoId, setSelectedCultivoId] = useState(null);

    const { notifications, addNotification, removeNotification } = useNotification();
    const itemsPerPage = 8;
    const [errors, setErrors] = useState({});

    // Opciones para select
    const tiposOptions = tipos.map(tipo => ({
        value: String(tipo.id),
        label: tipo.nombre
    }));

    // Fetchers
    const fetchCultivos = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${BaseUrl}/cultivo`, {
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
            });
            setDatosOriginales(response.data);
            setDatosFiltrados(response.data);
        } catch (error) {
            console.error('error obteniendo todos los cultivos', error);
            addNotification('Error al obtener cultivos', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchTipos = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${BaseUrl}/cultivo/tipos/all`, {
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
            });
            setTipos(response.data);
        } catch (error) {
            console.error('error obteniendo todos los tipos de cultivos', error);
            addNotification('Error al obtener tipos de cultivo', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCultivos();
        fetchTipos();
    }, []);

    // Handlers
    const resetFormData = () => {
        setFormData({
            id: '',
            nombre: '',
            nombre_cientifico: '',
            descripcion: '',
            tipo_cultivo_id: ''
        });
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

    const handleTipoChange = (val) => {
        setFormData(prev => ({ ...prev, tipo_cultivo_id: val }));
    };

    const handleSearch = (searchTerm) => {
        const filtered = filterData(datosOriginales, searchTerm, [
            'id','nombre','nombre_cientifico','descripcion','tipo_cultivo_nombre'
        ]);
        setDatosFiltrados(filtered);
    };

    const handleSave = async () => {
        setLoading(true);
        for (const field of ['nombre', 'tipo_cultivo_id']) {
            if (!validationRules[field]) continue;
            const { regex, errorMessage } = validationRules[field];
            if (regex) {
                const { valid, message } = validateField(formData[field], regex, errorMessage);
                if (!valid) {
                    addNotification(message, 'warning');
                    setLoading(false);
                    return;
                }
            }
        }

        try {
            await axios.post(`${BaseUrl}/cultivo`, {
                nombre: formData.nombre,
                nombre_cientifico: formData.nombre_cientifico,
                descripcion: formData.descripcion,
                tipo_cultivo_id: formData.tipo_cultivo_id
            }, {
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
            });
            addNotification('Cultivo registrado con éxito', 'success');
            fetchCultivos();
            closeModal();
        } catch (error) {
            console.error('error registrando cultivo', error);
            addNotification('Error al registrar cultivo', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async () => {
        setLoading(true);
        for (const field of ['nombre', 'tipo_cultivo_id']) {
            if (!validationRules[field]) continue;
            const { regex, errorMessage } = validationRules[field];
            const { valid, message } = validateField(formData[field], regex, errorMessage);
            if (!valid) {
                addNotification(message, 'warning');
                setLoading(false);
                return;
            }
        }

        try {
            await axios.put(`${BaseUrl}/cultivo/${formData.id}`, {
                nombre: formData.nombre,
                nombre_cientifico: formData.nombre_cientifico,
                descripcion: formData.descripcion,
                tipo_cultivo_id: formData.tipo_cultivo_id
            }, {
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
            });
            addNotification('Cultivo actualizado con éxito', 'success');
            fetchCultivos();
            closeModal();
        } catch (error) {
            console.error('error actualizando cultivos', error);
            addNotification('Error al actualizar cultivo', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        setLoading(true);
        try {
            await axios.delete(`${BaseUrl}/cultivo/${id}`, {
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
            });

            fetchCultivos();
            addNotification('Cultivo eliminado con éxito', 'error');
        } catch (error) {
            console.error('error eliminando cultivo', error);
            addNotification('Error al eliminar cultivo', 'error');
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
        setCurrentModal('cultivo');
    };

    const closeModal = () => setCurrentModal(null);

    const openEditModal = (cultivo) => {
        setFormData({
            id: cultivo.id,
            nombre: cultivo.nombre || '',
            nombre_cientifico: cultivo.nombre_cientifico || '',
            descripcion: cultivo.descripcion || '',
            tipo_cultivo_id: cultivo.tipo_cultivo_id || ''
        });
        setCurrentModal('cultivo');
    };

    const openConfirmDeleteModal = (id) => {
        setSelectedCultivoId(id);
        setConfirmDeleteModal(true);
    };
    const closeConfirmDeleteModal = () => {
        setSelectedCultivoId(null);
        setConfirmDeleteModal(false);
    };

    const openDetalleModal = (cultivo) => setDetalleModal({ abierto: true, cultivo });
    const closeDetalleModal = () => setDetalleModal({ abierto: false, cultivo: null });

    return (
        <div className={styles.cultivoContainer}>
            {loading && <Spinner text="Procesando..." />}
            {notifications.map((notification) => (
                <Notification
                    key={notification.id}
                    message={notification.message}
                    type={notification.type}
                    onClose={() => removeNotification(notification.id)}
                />
            ))}

            {/* Modal Detalle */}
            {detalleModal.abierto && (
                <div className='modalOverlay'>
                    <div className='modalDetalle'>
                        <button className='closeButton' onClick={closeDetalleModal}>&times;</button>
                        <h2>Detalles del Cultivo</h2>
                        <table className='detalleTable'>
                            <tbody>
                                <tr>
                                    <th>Nombre</th>
                                    <td>{detalleModal.cultivo.nombre}</td>
                                </tr>
                                <tr>
                                    <th>Nombre Científico</th>
                                    <td>{detalleModal.cultivo.nombre_cientifico}</td>
                                </tr>
                                <tr>
                                    <th>Tipo</th>
                                    <td>{detalleModal.cultivo.tipo_cultivo_nombre}</td>
                                </tr>
                                <tr>
                                    <th>Descripción</th>
                                    <td>{detalleModal.cultivo.descripcion}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal registro y editar */}
            {currentModal === 'cultivo' && (
                <div className='modalOverlay'>
                    <div className='modal_mono'>
                        <button className='closeButton' onClick={closeModal}>&times;</button>
                        <h2>{formData.id ? 'Editar Cultivo' : 'Registrar Cultivo'}</h2>
                        <form className='modalForm'>
                            <div className={styles.formColumns}>
                                <div className='formGroup'>
                                    <label htmlFor="nombre">Nombre:</label>
                                    <input type="text" id="nombre" value={formData.nombre} onChange={handleChange} className='input' placeholder='Nombre del cultivo'/>
                                    {errors.nombre && <span className='errorText'>{errors.nombre}</span>}
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="nombre_cientifico">Nombre Científico:</label>
                                    <input type="text" id="nombre_cientifico" value={formData.nombre_cientifico} onChange={handleChange} className='input' placeholder='Nombre científico'/>
                                    {errors.nombre_cientifico && <span className='errorText'>{errors.nombre_cientifico}</span>}
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="tipo_cultivo_id">Tipo:</label>
                                    <SingleSelect
                                        options={tiposOptions}
                                        value={formData.tipo_cultivo_id}
                                        onChange={handleTipoChange}
                                        placeholder="Seleccione un tipo"
                                    />
                                    {errors.tipo_cultivo_id && <span className='errorText'>{errors.tipo_cultivo_id}</span>}
                                </div>
                                <div className='formGroup' style={{ gridColumn: '1 / -1' }}>
                                    <label htmlFor="descripcion">Descripción:</label>
                                    <textarea id="descripcion" value={formData.descripcion} onChange={handleChange} className='input' placeholder='Descripción'/>
                                    {errors.descripcion && <span className='errorText'>{errors.descripcion}</span>}
                                </div>
                            </div>
                            <button 
                                type="button" 
                                className='saveButton' 
                                onClick={formData.id ? handleEdit : handleSave}
                                title={formData.id ? 'Actualizar Cultivo' : 'Registrar Cultivo'}>
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
                        <p>¿Estás seguro de que deseas eliminar este cultivo?</p>
                        <div className='modalActions'>
                            <button className='cancelButton' onClick={closeConfirmDeleteModal}>Cancelar</button>
                            <button className='confirmButton' onClick={() => { handleDelete(selectedCultivoId); closeConfirmDeleteModal(); }}>Confirmar</button>
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
                        title='Registrar Cultivo'>
                        <img src={icon.plus} alt="Crear" className='icon' />
                        Agregar
                    </button>

                    <h2>Cultivos</h2>

                    <div className='searchContainer'>
                        <SearchBar onSearch={handleSearch} />
                        <img src={icon.lupa} alt="Buscar" className='iconlupa' />
                    </div>
                </div>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>N°</th>
                            <th>Nombre</th>
                            <th>Nombre Científico</th>
                            <th>Tipo</th>
                            <th>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentData.map((cultivo, idx) => (
                            <tr key={cultivo.id} >
                                <td>{indexOfFirstItem + idx + 1}</td>
                                <td>{cultivo.nombre}</td>
                                <td>{cultivo.nombre_cientifico}</td>
                                <td>{cultivo.tipo_cultivo_nombre}</td>
                                <td>
                                    <div className={styles.iconContainer}>
                                        <img
                                            onClick={() => openDetalleModal(cultivo)}
                                            src={icon.ver}
                                            className='iconver'
                                            title='Ver más'
                                            style={{ cursor: 'pointer' }}
                                        />
                                        <img
                                            onClick={() => openEditModal(cultivo)}
                                            src={icon.editar}
                                            className='iconeditar'
                                            title='Editar'
                                        />
                                        <img 
                                            onClick={() => openConfirmDeleteModal(cultivo.id)} 
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
                    <img onClick={handlePreviousPage} src={icon.flecha3} className='iconBack' title='Anterior'/>
                    <img onClick={handlePreviousThreePages} src={icon.flecha5} className='iconBack' title='Anterior' />
                    <span>{currentPage}</span>
                    <img onClick={handleNextThreePages} src={icon.flecha4} className='iconNext' title='Siguiente' />
                    <img onClick={handleNextPage} src={icon.flecha2} className='iconNext' title='Siguiente'/>
                </div>
            </div>
        </div>
    );
}

export default Cultivo;