import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './ubicacion.module.css';
import '../../main.css';
import icon from '../../components/iconos/iconos';
import { filterData } from '../../utils/filterData';
import SearchBar from "../../components/searchbart/SearchBar";
import Notification from '../../components/notification/Notification';
import { useNotification } from '../../utils/useNotification';
import { validateField, validationRules } from '../../utils/validation';

function Parroquia() {
    const [datosOriginales, setDatosOriginales] = useState([]);
    const [datosFiltrados, setDatosFiltrados] = useState([]);
    const [estados, setEstados] = useState([]);
    const [municipios, setMunicipios] = useState([]); // Municipios filtrados por estado
    const [todosLosMunicipios, setTodosLosMunicipios] = useState([]); // Todos los municipios
    const [currentPage, setCurrentPage] = useState(1);
    const [currentModal, setCurrentModal] = useState(null);
    const [formData, setFormData] = useState({
        id: '',
        nombre: '',
        estado_id: '',
        municipio_id: '',
    });
    const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);
    const [selectedParroquiaId, setSelectedParroquiaId] = useState(null);

    const { notifications, addNotification, removeNotification } = useNotification();
    const itemsPerPage = 8;

    const resetFormData = () => {
        setFormData({
            id: '',
            nombre: '',
            estado_id: '',
            municipio_id: '',
        });
    };

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData({ ...formData, [id]: value });

        if (id === 'estado_id') {
            setFormData({ ...formData, estado_id: value, municipio_id: '' });
            fetchMunicipios(value);
        }

        if (validationRules[id]) {
            const { regex, errorMessage } = validationRules[id];
            const { valid, message } = validateField(value, regex, errorMessage);
            setErrors({ ...errors, [id]: valid ? '' : message });
        }
    };

    const handleSearch = (searchTerm) => {
        const filtered = filterData(datosOriginales, searchTerm, ['id','nombre','municipio','estado']);
        setDatosFiltrados(filtered);
    };

    const fetchParroquias = async () => {
        try {
            const response = await axios.get('http://localhost:4000/parroquia', {
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
            });
            setDatosOriginales(response.data);
            setDatosFiltrados(response.data);
        } catch (error) {
            console.error('Error obteniendo parroquias:', error);
            addNotification('Error al obtener parroquias', 'error');
        }
    };

    const fetchEstados = async () => {
        try {
            const response = await axios.get('http://localhost:4000/parroquia/estados/all', {
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
            });
            setEstados(response.data);
        } catch (error) {
            console.error('Error obteniendo estados:', error);
            addNotification('Error al obtener estados', 'error');
        }
    };

    // Cargar todos los municipios para la tabla
    const fetchTodosLosMunicipios = async () => {
        try {
            const response = await axios.get('http://localhost:4000/parroquia/municipios/all', {
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
            });
            setTodosLosMunicipios(response.data);
        } catch (error) {
            console.error('Error obteniendo todos los municipios:', error);
        }
    };

    // Cargar municipios filtrados por estado para el select dependiente
    const fetchMunicipios = async (estadoId) => {
        try {
            if (!estadoId) {
                setMunicipios([]);
                return;
            }
            const response = await axios.get('http://localhost:4000/parroquia/municipios/all', {
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
            });
            setMunicipios(response.data.filter(m => Number(m.estado_id) === Number(estadoId)));
        } catch (error) {
            console.error('Error obteniendo municipios:', error);
            addNotification('Error al obtener municipios', 'error');
        }
    };

    useEffect(() => {
        fetchParroquias();
        fetchEstados();
        fetchTodosLosMunicipios();
    },[]);

    const handleSave = async () => {
        for (const field in formData) {
            if (!validationRules[field]) continue;
            const { regex, errorMessage } = validationRules[field];
            if (regex) {
                const { valid, message } = validateField(formData[field], regex, errorMessage);
                if (!valid) {
                    addNotification(message, 'warning');
                    return;
                }
            }
        }

        try {
            await axios.post('http://localhost:4000/parroquia', {
                nombre: formData.nombre,
                municipio_id: formData.municipio_id,
            }, {
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
            });
            addNotification('Parroquia registrada con éxito', 'success');
            fetchParroquias();
            closeModal();
        } catch (error) {
            console.error('Error creando Parroquia:', error);
            addNotification('Error al registrar parroquia', 'error');
        }
    };

    const handleEdit = async () => {
        const camposObligatorios = ['nombre', 'municipio_id'];
        for (const field of camposObligatorios) {
            if (!validationRules[field]) continue;
            const { regex, errorMessage } = validationRules[field];
            const { valid, message } = validateField(formData[field], regex, errorMessage);
            if (!valid) {
                addNotification(message, 'warning');
                return;
            }
        }

        try {
            await axios.put(`http://localhost:4000/parroquia/${formData.id}`, {
                nombre: formData.nombre,
                municipio_id: formData.municipio_id,
            }, {
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
            });
            addNotification('Parroquia actualizada con éxito', 'success');
            fetchParroquias();
            closeModal();
        } catch (error) {
            console.error('Error editando Parroquia:', error);
            addNotification('Error al actualizar parroquia', 'error');
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:4000/parroquia/${id}`, {
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
            });

            fetchParroquias();
            addNotification('Parroquia eliminada con éxito', 'error');
        } catch (error) {
            console.error('Error eliminando Parroquia:', error);
            addNotification('Error al eliminar parroquia', 'error');
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
        setCurrentModal('parroquia');
    };

    const closeModal = () => setCurrentModal(null);

    const openEditModal = async (parroquia) => {
        // Buscar municipio y estado relacionados
        const municipio = todosLosMunicipios.find(m => m.id === parroquia.municipio_id);
        const estado_id = municipio ? municipio.estado_id : '';
        setFormData({
            id: parroquia.id,
            nombre: parroquia.nombre || '',
            estado_id: estado_id,
            municipio_id: parroquia.municipio_id || '',
        });
        if (estado_id) fetchMunicipios(estado_id);
        setCurrentModal('parroquia');
    };

    const openConfirmDeleteModal = (id) => {
        setSelectedParroquiaId(id);
        setConfirmDeleteModal(true);
    };
    const closeConfirmDeleteModal = () => {
        setSelectedParroquiaId(null);
        setConfirmDeleteModal(false);
    };

    return (
        <div className={styles.ubicacionContainer}>
            {notifications.map((notification) => (
                <Notification
                    key={notification.id}
                    message={notification.message}
                    type={notification.type}
                    onClose={() => removeNotification(notification.id)}
                />
            ))}

            {currentModal === 'parroquia' && (
                <div className='modalOverlay'>
                    <div className={styles.modal}>
                        <button className='closeButton' onClick={closeModal}>&times;</button>
                        <h2>{formData.id ? 'Editar Parroquia' : 'Registrar Parroquia'}</h2>
                        <form className='modalForm'>
                            <div>
                                <div className='formGroup'>
                                    <label htmlFor="nombre">Parroquia:</label>
                                    <input type="text" id="nombre" value={formData.nombre} onChange={handleChange} className='input' placeholder='Rellene el Campo'/>
                                    {errors.nombre && <span className='errorText'>{errors.nombre}</span>}
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="estado_id">Estado:</label>
                                    <select id="estado_id" value={formData.estado_id} onChange={handleChange} className='select'>
                                        <option value="">Seleccione un estado</option>
                                        {estados.map((estado) => (
                                            <option key={estado.id} value={estado.id}>{estado.nombre}</option>
                                        ))}
                                    </select>
                                    {errors.estado_id && <span className='errorText'>{errors.estado_id}</span>}
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="municipio_id">Municipio:</label>
                                    <select id="municipio_id" value={formData.municipio_id} onChange={handleChange} className='select'>
                                        <option value="">Seleccione un municipio</option>
                                        {municipios.map((municipio) => (
                                            <option key={municipio.id} value={municipio.id}>{municipio.nombre}</option>
                                        ))}
                                    </select>
                                    {errors.municipio_id && <span className='errorText'>{errors.municipio_id}</span>}
                                </div>
                            </div>
                            <button 
                                type="button" 
                                className='saveButton' 
                                onClick={formData.id ? handleEdit : handleSave}
                                title={formData.id ? 'Actualizar Parroquia' : 'Registrar Parroquia'}>
                                    Guardar
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {confirmDeleteModal && (
                <div className='modalOverlay'>
                    <div className='modal'>
                        <h2>Confirmar Eliminación</h2>
                        <p>¿Estás seguro de que deseas eliminar esta parroquia?</p>
                        <div className='modalActions'>
                            <button className='cancelButton' onClick={closeConfirmDeleteModal}>Cancelar</button>
                            <button className='confirmButton' onClick={() => { handleDelete(selectedParroquiaId); closeConfirmDeleteModal(); }}>Confirmar</button>
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
                        title='Registrar Parroquia'>
                        <img src={icon.plus} alt="Crear" className='icon' />
                        Agregar
                    </button>

                    <h2>Parroquias</h2>

                    <div className='searchContainer'>
                        <SearchBar onSearch={handleSearch} />
                        <img src={icon.lupa} alt="Buscar" className='iconlupa' />
                    </div>
                </div>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>N°</th>
                            <th>Parroquia</th>
                            <th>Municipio</th>
                            <th>Estado</th>
                            <th>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentData.map((parroquia, idx) => {
                            const municipio = todosLosMunicipios.find(m => m.id === parroquia.municipio_id);
                            const estado = estados.find(e => e.id === municipio?.estado_id);
                            return (
                                <tr key={parroquia.id} >
                                    <td>{indexOfFirstItem + idx + 1}</td>
                                    <td>{parroquia.nombre}</td>
                                    <td>{municipio?.nombre || ''}</td>
                                    <td>{estado?.nombre || ''}</td>
                                    <td>
                                        <div className={styles.iconContainer}>
                                            <img
                                                onClick={() => openEditModal(parroquia)}
                                                src={icon.editar}
                                                className='iconeditar'
                                                title='Editar'
                                            />
                                            <img 
                                                onClick={() => openConfirmDeleteModal(parroquia.id)} 
                                                src={icon.eliminar} 
                                                className='iconeliminar' 
                                                title='eliminar'
                                            />
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
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

export default Parroquia;