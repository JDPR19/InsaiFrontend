import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './plaga.module.css';
import '../../main.css';
import icon from '../../components/iconos/iconos';
import { filterData } from '../../utils/filterData';
import SearchBar from "../../components/searchbart/SearchBar";
import Notification from '../../components/notification/Notification';
import { useNotification } from '../../utils/useNotification';
import { validateField, validationRules } from '../../utils/validation';
import Spinner from '../../components/spinner/Spinner';
import SingleSelect from '../../components/selectmulti/SingleSelect';

function Plagas() {
    const [datosOriginales, setDatosOriginales] = useState([]);
    const [datosFiltrados, setDatosFiltrados] = useState([]);
    const [tipos, setTipos] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [currentModal, setCurrentModal] = useState(null);
    const [detalleModal, setDetalleModal] = useState({ abierto: false, plaga: null });
    const [formData, setFormData] = useState({
        id: '',
        nombre: '',
        nombre_cientifico: '',
        observaciones: '',
        tipo_plaga_fito_id: ''
    });
    const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);
    const [selectedPlagaId, setSelectedPlagaId] = useState(null);

    const { notifications, addNotification, removeNotification } = useNotification();
    const itemsPerPage = 8;
    const [errors, setErrors] = useState({});

    // Opciones para select
    const tiposOptions = tipos.map(tipo => ({
        value: String(tipo.id),
        label: tipo.nombre
    }));

    // Fetchers
    const fetchPlagas = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:4000/plagas', {
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
            });
            setDatosOriginales(response.data);
            setDatosFiltrados(response.data);
        } catch (error) {
            console.error('error obteniendo todas las plagas', error);
            addNotification('Error al obtener plagas', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchTipos = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:4000/plagas/tipos/all', {
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
            });
            setTipos(response.data);
        } catch (error) {
            console.error('error obteniendo todos los tipos de plagas', error);
            addNotification('Error al obtener tipos de plaga', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlagas();
        fetchTipos();
    }, []);

    // Handlers
    const resetFormData = () => {
        setFormData({
            id: '',
            nombre: '',
            nombre_cientifico: '',
            observaciones: '',
            tipo_plaga_fito_id: ''
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
        setFormData(prev => ({ ...prev, tipo_plaga_fito_id: val }));
    };

    const handleSearch = (searchTerm) => {
        const filtered = filterData(datosOriginales, searchTerm, [
            'id','nombre','nombre_cientifico','observaciones','tipo_plaga_fito_nombre'
        ]);
        setDatosFiltrados(filtered);
    };

    const handleSave = async () => {
        setLoading(true);
        for (const field of ['nombre', 'tipo_plaga_fito_id']) {
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
            await axios.post('http://localhost:4000/plagas', {
                nombre: formData.nombre,
                nombre_cientifico: formData.nombre_cientifico,
                observaciones: formData.observaciones,
                tipo_plaga_fito_id: formData.tipo_plaga_fito_id
            }, {
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
            });
            addNotification('Plaga registrada con éxito', 'success');
            fetchPlagas();
            closeModal();
        } catch (error) {
            console.error('error registrando la plaga', error);
            addNotification('Error al registrar plaga', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async () => {
        setLoading(true);
        for (const field of ['nombre', 'tipo_plaga_fito_id']) {
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
            await axios.put(`http://localhost:4000/plagas/${formData.id}`, {
                nombre: formData.nombre,
                nombre_cientifico: formData.nombre_cientifico,
                observaciones: formData.observaciones,
                tipo_plaga_fito_id: formData.tipo_plaga_fito_id
            }, {
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
            });
            addNotification('Plaga actualizada con éxito', 'success');
            fetchPlagas();
            closeModal();
        } catch (error) {
            console.error('error actualizando la plaga', error);
            addNotification('Error al actualizar plaga', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        setLoading(true);
        try {
            await axios.delete(`http://localhost:4000/plagas/${id}`, {
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
            });

            fetchPlagas();
            addNotification('Plaga eliminada con éxito', 'error');
        } catch (error) {
            console.error('error eliminando la plaga', error);
            addNotification('Error al eliminar plaga', 'error');
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
        setCurrentModal('plaga');
    };

    const closeModal = () => setCurrentModal(null);

    const openEditModal = (plaga) => {
        setFormData({
            id: plaga.id,
            nombre: plaga.nombre || '',
            nombre_cientifico: plaga.nombre_cientifico || '',
            observaciones: plaga.observaciones || '',
            tipo_plaga_fito_id: plaga.tipo_plaga_fito_id || ''
        });
        setCurrentModal('plaga');
    };

    const openConfirmDeleteModal = (id) => {
        setSelectedPlagaId(id);
        setConfirmDeleteModal(true);
    };
    const closeConfirmDeleteModal = () => {
        setSelectedPlagaId(null);
        setConfirmDeleteModal(false);
    };

    // MODAL DETALLE
    const openDetalleModal = (plaga) => setDetalleModal({ abierto: true, plaga });
    const closeDetalleModal = () => setDetalleModal({ abierto: false, plaga: null });

    return (
        <div className={styles.plagaContainer}>

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
                        <h2>Detalles de la Plaga</h2>
                        <table className='detalleTable'>
                            <tbody>
                                <tr>
                                    <th>Nombre</th>
                                    <td>{detalleModal.plaga.nombre}</td>
                                </tr>
                                <tr>
                                    <th>Nombre Científico</th>
                                    <td>{detalleModal.plaga.nombre_cientifico}</td>
                                </tr>
                                <tr>
                                    <th>Tipo de Plaga</th>
                                    <td>{detalleModal.plaga.tipo_plaga_fito_nombre}</td>
                                </tr>
                                <tr>
                                    <th>Observaciones</th>
                                    <td>{detalleModal.plaga.observaciones}</td>      
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal registro y editar */}
            {currentModal === 'plaga' && (
                <div className='modalOverlay'>
                    <div className='modal_mono'>
                        <button className='closeButton' onClick={closeModal}>&times;</button>
                        <h2>{formData.id ? 'Editar Plaga' : 'Registrar Plaga'}</h2>
                        <form className='modalForm'>
                            <div className={styles.formColumns}>
                                <div className='formGroup'>
                                    <label htmlFor="nombre">Nombre:</label>
                                    <input type="text" id="nombre" value={formData.nombre} onChange={handleChange} className='input' placeholder='Nombre de la plaga'/>
                                    {errors.nombre && <span className='errorText'>{errors.nombre}</span>}
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="nombre_cientifico">Nombre Científico:</label>
                                    <input type="text" id="nombre_cientifico" value={formData.nombre_cientifico} onChange={handleChange} className='input' placeholder='Nombre científico'/>
                                    {errors.nombre_cientifico && <span className='errorText'>{errors.nombre_cientifico}</span>}
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="tipo_plaga_fito_id">Tipo:</label>
                                    <SingleSelect
                                        options={tiposOptions}
                                        value={formData.tipo_plaga_fito_id}
                                        onChange={handleTipoChange}
                                        placeholder="Seleccione un tipo"
                                    />
                                    {errors.tipo_plaga_fito_id && <span className='errorText'>{errors.tipo_plaga_fito_id}</span>}
                                </div>
                                <div className='formGroup' style={{ gridColumn: '1 / -1' }}>
                                    <label htmlFor="observaciones">Observaciones:</label>
                                    <textarea id="observaciones" value={formData.observaciones} onChange={handleChange} className='input' placeholder='Observaciones'/>
                                    {errors.observaciones && <span className='errorText'>{errors.observaciones}</span>}
                                </div>
                            </div>
                            <button 
                                type="button" 
                                className='saveButton' 
                                onClick={formData.id ? handleEdit : handleSave}
                                title={formData.id ? 'Actualizar Plaga' : 'Registrar Plaga'}>
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
                        <p>¿Estás seguro de que deseas eliminar esta plaga?</p>
                        <div className='modalActions'>
                            <button className='cancelButton' onClick={closeConfirmDeleteModal}>Cancelar</button>
                            <button className='confirmButton' onClick={() => { handleDelete(selectedPlagaId); closeConfirmDeleteModal(); }}>Confirmar</button>
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
                        title='Registrar Plaga'>
                        <img src={icon.plus} alt="Crear" className='icon' />
                        Agregar
                    </button>

                    <h2>Plagas Fitosanitarias</h2>

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
                            <th>Tipo de Plaga</th>
                            <th>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentData.map((plaga, idx) => (
                            <tr key={plaga.id} >
                                <td>{indexOfFirstItem + idx + 1}</td>
                                <td>{plaga.nombre}</td>
                                <td>{plaga.nombre_cientifico}</td>
                                <td>{plaga.tipo_plaga_fito_nombre}</td>
                                <td>
                                    <div className={styles.iconContainer}>
                                        <img
                                            onClick={() => openDetalleModal(plaga)}
                                            src={icon.ver}
                                            className='iconver'
                                            title='Ver más'
                                            style={{ cursor: 'pointer' }}
                                        />
                                        <img
                                            onClick={() => openEditModal(plaga)}
                                            src={icon.editar}
                                            className='iconeditar'
                                            title='Editar'
                                        />
                                        <img 
                                            onClick={() => openConfirmDeleteModal(plaga.id)} 
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

export default Plagas;