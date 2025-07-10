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
import { PANTALLAS, ACCIONES } from '../../utils/permisouser';
import Spinner from '../../components/spinner/Spinner';
import { BaseUrl } from '../../utils/constans';

function TipoUsuario() {
    const [datosOriginales, setDatosOriginales] = useState([]);
    const [datosFiltrados, setDatosFiltrados] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [currentModal, setCurrentModal] = useState(null);
    const [formData, setFormData] = useState({
        id: '',
        nombre: '',
        descripcion: '',
        permisos: {}
    });
    const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);
    const [selectedTipoId, setSelectedTipoId] = useState(null);

    const [permisoModalOpen, setPermisoModalOpen] = useState(false);
    const [permisoSeleccionado, setPermisoSeleccionado] = useState(null);

    const { notifications, addNotification, removeNotification } = useNotification();
    const itemsPerPage = 8;
    const [errors, setErrors] = useState({});

    // Reiniciar el formulario
    const resetFormData = () => {
        setFormData({
            id: '',
            nombre: '',
            descripcion: '',
            permisos: {}
        });
        setErrors({});
    };

    // Buscar
    const handleSearch = (searchTerm) => {
        const filtered = filterData(datosOriginales, searchTerm, ['id','nombre','descripcion']);
        setDatosFiltrados(filtered);
    };

    // Obtener tipos de usuario
    const fetchTiposUsuario = async () => {

        setLoading(true);

        try {
            const response = await axios.get(`${BaseUrl}/roles`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setDatosOriginales(response.data);
            setDatosFiltrados(response.data);
        } catch (error) {
            console.error('Error al obtener tipos de usuario', error);
            addNotification('Error al obtener tipos de usuario', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTiposUsuario();
    }, []);

    // Crear tipo de usuario
    const handleSave = async () => {

        setLoading(true);

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
            await axios.post(`${BaseUrl}/roles`, formData, {
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
        } finally {
            setLoading(false);
        }
    };

    // Editar tipo de usuario
    const handleEdit = async () => {
        setLoading(true);
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
            await axios.put(`${BaseUrl}/roles/${formData.id}`, formData, {
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
        } finally {
            setLoading(false); 
        }
    };

    // Eliminar tipo de usuario
    const handleDelete = async (id) => {
        setLoading(true);
        try {
            await axios.delete(`${BaseUrl}/roles/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            addNotification('Tipo de usuario eliminado con éxito', 'error');
            fetchTiposUsuario();
        } catch (error) {
            console.error('Error al eliminar tipo de usuario', error);
            addNotification('Error al eliminar tipo de usuario', 'error');
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
            permisos: tipo.permisos || {}
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

    // Modal solo lectura de permisos
    const openPermisosModal = (tipo) => {
        setPermisoSeleccionado(tipo);
        setPermisoModalOpen(true);
    };
    const closePermisosModal = () => {
        setPermisoSeleccionado(null);
        setPermisoModalOpen(false);
    };

    // Manejar cambios en los inputs
    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData({ ...formData, [id]: value });
        if (validationRules[id]) {
            const { regex, errorMessage } = validationRules[id];
            const { valid, message } = validateField(value, regex, errorMessage);
            setErrors({ ...errors, [id]: valid ? '' : message });
        }
    };

    // Manejar cambios en los permisos
    const handlePermisoChange = (pantalla, accion) => {
        setFormData((prev) => ({
            ...prev,
            permisos: {
                ...prev.permisos,
                [pantalla]: {
                    ...prev.permisos[pantalla],
                    [accion]: !prev.permisos?.[pantalla]?.[accion]
                }
            }
        }));
    };

    return (
        <div className={styles.usuarioContainer}>

            {loading && <Spinner text="Procesando..." />}

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
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <button className='closeButton' onClick={closeModal}>&times;</button>
                        <h2>{formData.id ? 'Editar Tipo de Usuario' : 'Registrar Tipo de Usuario'}</h2>
                        <form className='modalForm'>
                            <div className={styles.formGroup}>
                                <div>
                                    <label htmlFor="nombre">Nombre:</label>
                                    <input type="text" id="nombre" value={formData.nombre} onChange={handleChange} className='input' placeholder='Rellene el Campo'/>
                                    {errors.nombre && <span className='errorText'>{errors.nombre}</span>}
                                </div>
                                <div>
                                    <label htmlFor="descripcion">Descripción:</label>
                                    <textarea id="descripcion" value={formData.descripcion} onChange={handleChange} className='textarea' placeholder='Rellene el Campo'/>
                                    {errors.descripcion && <span className='errorText'>{errors.descripcion}</span>}
                                </div>
                            </div>
                            <div>
                                <label>Permisos:</label>
                                <div className={styles.permisosGrid}>
                                    {PANTALLAS.map((pantalla) => (
                                        <div key={pantalla.key} className={styles.permisoPantalla}>
                                            <strong>{pantalla.label}</strong>
                                            {ACCIONES.map((accion) => (
                                                <label key={accion.key} className={styles.permisoCheckbox}>
                                                    <input
                                                        type="checkbox"
                                                        checked={!!formData.permisos?.[pantalla.key]?.[accion.key]}
                                                        onChange={() => handlePermisoChange(pantalla.key, accion.key)}
                                                    />
                                                    {accion.label}
                                                </label>
                                            ))}
                                        </div>
                                    ))}
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

            {/* Modal solo lectura de permisos */}
            {permisoModalOpen && permisoSeleccionado && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <button className='closeButton' onClick={closePermisosModal}>&times;</button>
                        <h2>Permisos de {permisoSeleccionado.nombre}</h2>
                        <div className={styles.permisosGrid}>
                            {PANTALLAS.map((pantalla) => (
                                <div key={pantalla.key} className={styles.permisoPantalla}>
                                    <strong>{pantalla.label}</strong>
                                    {ACCIONES.map((accion) => (
                                        <label key={accion.key} className={styles.permisoCheckbox}>
                                            <input
                                                type="checkbox"
                                                checked={!!permisoSeleccionado.permisos?.[pantalla.key]?.[accion.key]}
                                                readOnly
                                                disabled
                                            />
                                            {accion.label}
                                        </label>
                                    ))}
                                </div>
                            ))}
                        </div>
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
            
            {/* Tabla de tipos de usuario */}
            <div className='tableSection'>
                <div className='filtersContainer'>
                    <button 
                        type='button'
                        onClick={openModal} 
                        className='create'
                        title='Registrar Tipo de Usuario'>
                        <img src={icon.plus} alt="Crear" className='icon' />
                        Agregar
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
                                        title="Ver permisos"
                                        type="button"
                                    >
                                        Ver permisos
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