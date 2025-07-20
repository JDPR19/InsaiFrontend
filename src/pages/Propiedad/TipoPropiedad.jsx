import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../main.css';
import icon from '../../components/iconos/iconos';
import { filterData } from '../../utils/filterData';
import SearchBar from "../../components/searchbart/SearchBar";
import Notification from '../../components/notification/Notification';
import { useNotification } from '../../utils/useNotification';
import { validateField, validationRules } from '../../utils/validation';
import Spinner from '../../components/spinner/Spinner';
import { BaseUrl } from '../../utils/constans';

function TipoPropiedad() {
    const [datosOriginales, setDatosOriginales] = useState([]);
    const [datosFiltrados, setDatosFiltrados] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [currentModal, setCurrentModal] = useState(null);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        id: '',
        nombre: '',
    });
    const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);
    const [selectedTipoPropiedadId, setSelectedTipoPropiedadId] = useState(null);

    const { notifications, addNotification, removeNotification } = useNotification();
    const itemsPerPage = 8;

    // Reiniciar el modal luego de cerrar
    const resetFormData = () => {
        setFormData({
            id: '',
            nombre: '',
        });
    };

    const [errors, setErrors] = useState({});

    // Manejar cambios en el formulario
    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData({ ...formData, [id]: value });

        if (validationRules[id]) {
            const { regex, errorMessage } = validationRules[id];
            const { valid, message } = validateField(value, regex, errorMessage);
            setErrors({ ...errors, [id]: valid ? '' : message });
        }
    };

    // Filtrar datos en la barra de búsqueda
    const handleSearch = (searchTerm) => {
        const filtered = filterData(datosOriginales, searchTerm, ['id','nombre']);
        setDatosFiltrados(filtered);
    };

    // obterner o listar los cargos
    const fetchTipoPropiedad = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${BaseUrl}/tipopropiedad`, {
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
            });
            setDatosOriginales(response.data);
            setDatosFiltrados(response.data);
        } catch (error) {
            console.error('Error obteniendo el tipo de propiedad:', error);
            addNotification('Error al obtener el tipo de propiedad', 'error');
        }finally{
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTipoPropiedad();
    },[]);


    // Crear cargo
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
            const response = await axios.post(`${BaseUrl}/tipopropiedad`, {
                ...formData,
            }, {
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
            });
            setDatosOriginales([response.data, ...datosOriginales]);
            setDatosFiltrados([response.data, ...datosFiltrados]);
            addNotification('Tipo de Propiedad registrada con éxito', 'success');
            fetchTipoPropiedad();
            closeModal();
        } catch (error) {
            console.error('Error creando tipo de propiedad:', error);
            addNotification('Error al registrar tipo de propiedad', 'error');
        }finally{
            setLoading(false);
        }
    };

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
            const response = await axios.put(`${BaseUrl}/tipopropiedad/${formData.id}`, {
                ...formData,
            }, {
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
            });
            const updatedData = datosOriginales.map((tipo_propiedad) =>
                tipo_propiedad.id === response.data.id ? response.data : tipo_propiedad
            );
            setDatosOriginales(updatedData);
            setDatosFiltrados(updatedData);
            closeModal();
            addNotification('Tipo de Propiedad actualizada con éxito', 'success');
        } catch (error) {
            console.error('Error editando tipo de propiedad:', error);
            addNotification('Error al actualizar tipo de propiedad', 'error');
        }finally{
            setLoading(false);
        }
    };

    
    const handleDelete = async (id) => {
        setLoading(true);
        try {
            await axios.delete(`${BaseUrl}/tipopropiedad/${id}`, {
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
            });

            setDatosOriginales(datosOriginales.filter((tipo_propiedad) => tipo_propiedad.id !== id));
            setDatosFiltrados(datosFiltrados.filter((tipo_propiedad) => tipo_propiedad.id !== id));
            addNotification('Tipo de Propiedad eliminada con éxito', 'error');
        } catch (error) {
            console.error('Error eliminando tipo de propiedad:', error);
            addNotification('Error al eliminar tipo de propiedad', 'error');
        }finally{
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

    // Abrir y cerrar modal
    const openModal = () => {
        resetFormData();
        setCurrentModal('tipo_propiedad');
    };

    const closeModal = () => setCurrentModal(null);

    // Abrir para editar con el modal
    const openEditModal = async (tipo_propiedad) => {
        setFormData({
            id: tipo_propiedad.id,
            nombre: tipo_propiedad.nombre || '',
            
        });
        setCurrentModal('tipo_propiedad');
    };

    // Abrir modal de confirmación para eliminar
    const openConfirmDeleteModal = (id) => {
        setSelectedTipoPropiedadId(id);
        setConfirmDeleteModal(true);
    };
    const closeConfirmDeleteModal = () => {
        setSelectedTipoPropiedadId(null);
        setConfirmDeleteModal(false);
    };


    return (
        <div className='mainContainer'>

            {loading && <Spinner text="Procesando..." />}
            {notifications.map((notification) => (
                <Notification
                    key={notification.id}
                    message={notification.message}
                    type={notification.type}
                    onClose={() => removeNotification(notification.id)}
                />
            ))}

            {/* modal registro y editar */}
            {currentModal === 'tipo_propiedad' && (
                <div className='modalOverlay'>
                    <div className='modal_mono'>
                        <button className='closeButton' onClick={closeModal}>&times;</button>
                        <h2>{formData.id ? 'Editar Tipo de Propiedad' : 'Registrar Tipo de Propiedad'}</h2>
                        <form className='modalForm'>
                            <div>

                                <div className='formGroup'>
                                    <label htmlFor="tipo_propiedad">Tipo de Propiedad:</label>
                                    <input type="text" id="nombre" value={formData.nombre} onChange={handleChange} className='input' placeholder='Rellene el Campo'/>
                                    {errors.nombre && <span className='errorText'>{errors.nombre}</span>}
                                </div>

                            </div>

                            <button 
                                type="button" 
                                className='saveButton' 
                                onClick={formData.id ? handleEdit : handleSave}
                                title={formData.id ? 'Actualizar Tipo de Propiedad' : 'Registrar Tipo de Propiedad'}>
                                    Guardar
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* modal de confirmacion para eliminar */}
            {confirmDeleteModal && (
                <div className='modalOverlay'>
                    <div className='modal'>
                        <h2>Confirmar Eliminación</h2>
                        <p>¿Estás seguro de que deseas eliminar este Tipo de Propiedad?</p>
                        <div className='modalActions'>
                            <button className='cancelButton' onClick={closeConfirmDeleteModal}>Cancelar</button>
                            <button className='confirmButton' onClick={() => { handleDelete(selectedTipoPropiedadId); closeConfirmDeleteModal(); }}>Confirmar</button>
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
                        title='Registrar Tipo de Propiedad'>
                        <img src={icon.plus} alt="Crear" className='icon' />
                        Agregar
                    </button>

                    <h2>Tipos de Propiedad</h2>

                    <div className='searchContainer'>
                        <SearchBar onSearch={handleSearch} />
                        <img src={icon.lupa} alt="Buscar" className='iconlupa' />
                    </div>
                </div>
                <table className='table'>
                    <thead>
                        <tr>
                            <th>N°</th>
                            <th>Nombre</th>
                            <th>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentData.map((tipo_propiedad, idx) => (
                            <tr key={tipo_propiedad.id} >
                                <td>{indexOfFirstItem + idx + 1}</td>
                                <td>{tipo_propiedad.nombre}</td>
                                <td>
                                    <div className='iconContainer'>
                                        <img
                                            onClick={() => openEditModal(tipo_propiedad)}
                                            src={icon.editar}
                                            className='iconeditar'
                                            title='Editar'
                                        />
                                        <img 
                                            onClick={() => openConfirmDeleteModal(tipo_propiedad.id)} 
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

export default TipoPropiedad;