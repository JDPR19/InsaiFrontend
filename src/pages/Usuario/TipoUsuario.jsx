import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './usuario.module.css';
import '../../main.css';
import icon from '../../components/iconos/iconos';
import { filterData } from '../../utils/filterData';
import SearchBar from "../../components/searchbart/SearchBar";
import Notification from '../../components/notification/Notification';
import { useNotification } from '../../utils/useNotification';
import { validateField, validationRules } from '../../utils/validation';
import PermisosModal from '../../components/modalpermiso/PermisosModal';

function TipoUsuario() {
    const [datosOriginales, setDatosOriginales] = useState([]);
    const [datosFiltrados, setDatosFiltrados] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [currentModal, setCurrentModal] = useState(null);
    const [formData, setFormData] = useState({
        id: '',
        nombre: '',
        descripcion: '',
    });
    const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);
    const [selectedTipoId, setSelectedTipoId] = useState(null);
    const [modalPermisosOpen, setModalPermisosOpen] = useState(false);
    const [tipoSeleccionado, setTipoSeleccionado] = useState(null);

    const { notifications, addNotification, removeNotification } = useNotification();
    const itemsPerPage = 8;
    const [errors, setErrors] = useState({});

    // Reiniciar el formulario
    const resetFormData = () => {
        setFormData({
            id: '',
            nombre: '',
            descripcion: '',
        });
        setErrors({});
    };

    // Buscar
    const handleSearch = (searchTerm) => {
        const filtered = filterData(datosOriginales, searchTerm, ['id','nombre']);
        setDatosFiltrados(filtered);
    };

    // Obtener tipos de usuario
    const fetchTiposUsuario = async () => {
        try {
            const response = await axios.get('http://localhost:4000/tipo_usuario', {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
            setDatosOriginales(response.data);
            setDatosFiltrados(response.data);
        } catch (error) {
            console.error('Error al obtener tipos de usuario', error);
            addNotification('Error al obtener tipos de usuario', 'error');
        }
    };

    useEffect(() => {
        fetchTiposUsuario();
    }, []);

    // Crear tipo de usuario
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
            await axios.post('http://localhost:4000/tipo_usuario', {
            ...formData,
                    permisos: {},
                }, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });

            addNotification('Tipo de usuario registrado con éxito', 'success');
            fetchTiposUsuario();
            closeModal();
        } catch (error) {
            console.error('Error al registrar tipo de usuario', error);
            addNotification('Error al registrar tipo de usuario', 'error');
        }
    };

    // Editar tipo de usuario
    const handleEdit = async () => {
        const camposObligatorios = ['nombre'];
        for (const field of camposObligatorios) {
            const { regex, errorMessage } = validationRules[field];
            const { valid, message } = validateField(formData[field], regex, errorMessage);
            if (!valid) {
                addNotification(message, 'warning');
                return;
            }
        }
        try {
            await axios.put(`http://localhost:4000/tipo_usuario/${formData.id}`, {
                nombre: formData.nombre,
                descripcion: formData.descripcion
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });


            addNotification('Tipo de usuario actualizado con éxito', 'success');
            fetchTiposUsuario();
            closeModal();
        } catch (error) {
            console.error('Error al actualizar tipo de usuario', error);
            addNotification('Error al actualizar tipo de usuario', 'error');
        }
    };

    // Eliminar tipo de usuario
    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:4000/tipo_usuario/${id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });

            addNotification('Tipo de usuario eliminado con éxito', 'error');
            fetchTiposUsuario();
        } catch (error) {
            console.error('Error al eliminar tipo de usuario', error);
            addNotification('Error al eliminar tipo de usuario', 'error');
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

    // Modal registro/edición
    const openModal = () => {
        resetFormData();
        setCurrentModal('tipo_usuario');
    };
    const closeModal = () => setCurrentModal(null);

    // Modal edición
    const openEditModal = (tipo) => {
        setFormData({
            id: tipo.id,
            nombre: tipo.nombre || '',
            descripcion: tipo.descripcion || '',
        });
        setCurrentModal('tipo_usuario');
    };

    // Modal confirmación eliminar
    const openConfirmDeleteModal = (id) => {
        setSelectedTipoId(id);
        setConfirmDeleteModal(true);
    };
    const closeConfirmDeleteModal = () => {
        setSelectedTipoId(null);
        setConfirmDeleteModal(false);
    };

    // Modal permisos
    const openPermisosModal = (tipo) => {
        setTipoSeleccionado(tipo);
        setModalPermisosOpen(true);
    };
    const handleGuardarPermisos = async (permisos) => {
        try {
            await axios.put(
            `http://localhost:4000/tipo_usuario/${tipoSeleccionado.id}`,
            {
                ...tipoSeleccionado,
                permisos
            },
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            
            addNotification('Permisos actualizados', 'success');
            setModalPermisosOpen(false);
            fetchTiposUsuario();
        } catch (error) {
            console.error('Error al actualizar permisos', error);
            addNotification('Error al actualizar permisos', 'error');
        }
    };

    // Formulario
    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData({ ...formData, [id]: value });
        if (validationRules[id]) {
            const { regex, errorMessage } = validationRules[id];
            const { valid, message } = validateField(value, regex, errorMessage);
            setErrors({ ...errors, [id]: valid ? '' : message });
        }
    };

    return (
        <div className={styles.usuarioContainer}>
            {notifications.map((notification) => (
                <Notification
                    key={notification.id}
                    message={notification.message}
                    type={notification.type}
                    onClose={() => removeNotification(notification.id)}
                />
            ))}

            {/* Modal registro/edición */}
            {currentModal === 'tipo_usuario' && (
                <div className='modalOverlay'>
                    <div className={styles.modal}>
                        <button className='closeButton' onClick={closeModal}>&times;</button>
                        <h2>{formData.id ? 'Editar Tipo de Usuario' : 'Registrar Tipo de Usuario'}</h2>
                        <form className='modalForm'>
                            <div className={styles.formColumns}>
                                <div className='formGroup'>
                                    <label htmlFor="nombre">Nombre:</label>
                                    <input type="text" id="nombre" value={formData.nombre} onChange={handleChange} className='input' placeholder='Rellene el Campo'/>
                                    {errors.nombre && <span className='errorText'>{errors.nombre}</span>}
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="descripcion">Descripción:</label>
                                    <textarea id="descripcion" value={formData.descripcion} onChange={handleChange} className='textarea' placeholder='Rellene el Campo'/>
                                    {errors.descripcion && <span className='errorText'>{errors.descripcion}</span>}
                                </div>
                            </div>
                            <button 
                                type="button" 
                                className='saveButton' 
                                onClick={formData.id ? handleEdit : handleSave}
                                title={formData.id ? 'Actualizar Tipo de Usuario' : 'Registrar Tipo de Usuario'}>
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
                        <p>¿Estás seguro de que deseas eliminar este tipo de usuario?</p>
                        <div className='modalActions'>
                            <button className='cancelButton' onClick={closeConfirmDeleteModal}>Cancelar</button>
                            <button className='confirmButton' onClick={() => { handleDelete(selectedTipoId); closeConfirmDeleteModal(); }}>Confirmar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de permisos */}
            {modalPermisosOpen && tipoSeleccionado && (
                <PermisosModal
                    tipoUsuario={tipoSeleccionado}
                    onSave={handleGuardarPermisos}
                    onClose={() => setModalPermisosOpen(false)}
                />
            )}

            {/* Tabla de tipos de usuario */}
            <div className='tableSection'>
                <div className='filtersContainer'>
                    <button 
                        type='button'
                        onClick={openModal} 
                        className='create'
                        title='Registrar Tipo de Usuario'>
                        <img src={icon.crear} alt="Crear" className='icon' />
                        Registrar
                    </button>
                    <h2>Roles & Permisos</h2>
                    <div className='searchContainer'>
                        <SearchBar onSearch={handleSearch} />
                        <img src={icon.lupa} alt="Buscar" className='iconlupa' />
                    </div>
                </div>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Descripción</th>
                            <th>Permisos</th>
                            <th>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentData.map((tipo) => (
                            <tr key={tipo.id} >
                                <td>{tipo.nombre}</td>
                                <td>{tipo.descripcion}</td>
                                <td>
                                    <button
                                        className={styles.btnPermiso}
                                        onClick={() => openPermisosModal(tipo)}
                                    >
                                        Editar permisos
                                    </button>
                                </td>
                                <td>
                                    <div className={styles.iconContainer}>
                                        <img
                                            onClick={() => openEditModal(tipo)}
                                            src={icon.editar}
                                            className='iconeditar'
                                            title='Editar'
                                        />
                                        <img 
                                            onClick={() => openConfirmDeleteModal(tipo.id)} 
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

export default TipoUsuario;