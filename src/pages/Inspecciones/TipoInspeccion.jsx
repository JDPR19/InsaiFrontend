import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../main.css';
import icon from '../../components/iconos/iconos';
import { filterData } from '../../utils/filterData';
import SearchBar from "../../components/searchbart/SearchBar";
import { useNotification } from '../../utils/NotificationContext';
import { validateField, validationRules } from '../../utils/validation';
import Spinner from '../../components/spinner/Spinner';
import { BaseUrl } from '../../utils/constans';
import AyudaTooltip from '../../components/ayudanteinfo/AyudaTooltip';

function TipoInspeccion() {
    const [datosOriginales, setDatosOriginales] = useState([]);
    const [datosFiltrados, setDatosFiltrados] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [currentModal, setCurrentModal] = useState(null);
    const [formData, setFormData] = useState({
        id: '',
        nombre: '',
    });
    const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);
    const [selectedTipoInspeccionId, setSelectedTipoInspeccionId] = useState(null);
    const { addNotification } = useNotification();
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
    const fetchTipoInspeccion = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${BaseUrl}/tipo_inspeccion`, {
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
            });
            setDatosOriginales(response.data);
            setDatosFiltrados(response.data);
        } catch (error) {
            console.error('Error obteniendo el tipo de inspeccion:', error);
            addNotification('Error al obtener el tipo de inspeccion', 'error');
        }finally{
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTipoInspeccion();
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
        setLoading(true);

        try {
            const response = await axios.post(`${BaseUrl}/tipo_inspeccion`, {
                ...formData,
            }, {
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
            });
            setDatosOriginales([response.data, ...datosOriginales]);
            setDatosFiltrados([response.data, ...datosFiltrados]);
            addNotification('Tipo de Inspección registrada con éxito', 'success');
            fetchTipoInspeccion();
            closeModal();
        } catch (error) {
            console.error('Error creando tipo de inspeccion:', error);
            addNotification('Error al registrar tipo de inspección', 'error');
        }finally{
            setLoading(false);
        }
    };

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
        
        setLoading(true);
        try {
            const response = await axios.put(`${BaseUrl}/tipo_inspeccion/${formData.id}`, {
                ...formData,
            }, {
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
            });
            const updatedData = datosOriginales.map((tipo_inspeccion) =>
                tipo_inspeccion.id === response.data.id ? response.data : tipo_inspeccion
            );
            setDatosOriginales(updatedData);
            setDatosFiltrados(updatedData);
            closeModal();
            addNotification('Tipo de Inspección actualizado con éxito', 'success');
        } catch (error) {
            console.error('Error editando tipo de inspeccion:', error);
            addNotification('Error al actualizar tipo de inspección', 'error');
        }finally{
            setLoading(false);
        }
    };

    
    const handleDelete = async (id) => {
        setLoading(true);
        try {
            await axios.delete(`${BaseUrl}/tipo_inspeccion/${id}`, {
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
            });

            setDatosOriginales(datosOriginales.filter((tipo_inspeccion) => tipo_inspeccion.id !== id));
            setDatosFiltrados(datosFiltrados.filter((tipo_inspeccion) => tipo_inspeccion.id !== id));
            addNotification('Tipo de Inspección eliminado con éxito', 'success');
        } catch (error) {
            console.error('Error eliminando tipo de inspeccion:', error);
            addNotification('Error al eliminar tipo de inspección', 'error');
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
        setCurrentModal('tipo_inspeccion');
    };

    const closeModal = () => setCurrentModal(null);

    // Abrir para editar con el modal
    const openEditModal = async (tipo_inspeccion) => {
        setFormData({
            id: tipo_inspeccion.id,
            nombre: tipo_inspeccion.nombre || '',
            
        });
        setCurrentModal('tipo_inspeccion');
    };

    // Abrir modal de confirmación para eliminar
    const openConfirmDeleteModal = (id) => {
        setSelectedTipoInspeccionId(id);
        setConfirmDeleteModal(true);
    };
    const closeConfirmDeleteModal = () => {
        setSelectedTipoInspeccionId(null);
        setConfirmDeleteModal(false);
    };


    return (
        <div className='mainContainer'>

            {/*/////////////////// Tabla ///////////*/}
                <div className='tituloH' 
                style={{marginTop: 20, marginBottom: 20, gap: 20}}
                >
                    <img src={icon.farmer2} alt="" className='iconTwo'/>
                    <h1 className='title' title='tipos de inspeccion'>Resumen de Tipos de inspeccion</h1>
                
                {/* Ayudante informativo de Pantalla */}
                    <div >
                        <AyudaTooltip descripcion="En esta sección puedes visualizar, registrar y gestionar todos los tipos de inspeccion. Usa los filtros, la búsqueda y las opciones de exportación para organizar y consultar la información de manera eficiente." />
                    </div>
                </div>

            {loading && <Spinner text="Procesando..." />}
            {/* modal registro y editar */}
            {currentModal === 'tipo_inspeccion' && (
                <div className='modalOverlay'>
                    <div className='modal_mono'>
                        <button className='closeButton' onClick={closeModal}>&times;</button>
                        <h2>{formData.id ? 'Editar Tipo de Inspección' : 'Registrar Tipo de Inspección'}</h2>
                        <form className='modalForm'>
                            <div className='formColumns_mono'>

                                <div className='formGroup'>
                                    <label htmlFor="tipo_inspeccion"><span className='Unique' title='Campo Obligatorio'>*</span>Tipo de Inspección:</label>
                                    <input type="text" id="nombre" value={formData.nombre} onChange={handleChange} className='input' placeholder='Rellene el Campo'/>
                                    {errors.nombre && <span className='errorText'>{errors.nombre}</span>}
                                </div>

                            </div>

                            <button 
                                type="button" 
                                className='saveButton' 
                                onClick={formData.id ? handleEdit : handleSave}
                                title={formData.id ? 'Actualizar Tipo de Inspección' : 'Registrar Tipo de Inspección'}
                                disabled={loading}    
                            >
                                {loading ? 'Procesando...' : 'Guardar'}
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
                        <p>¿Estás seguro de que deseas eliminar este Tipo de Inspección?</p>
                        <div className='modalActions'>
                            <button className='cancelButton' onClick={closeConfirmDeleteModal}>Cancelar</button>
                            <button className='confirmButton' onClick={() => { handleDelete(selectedTipoInspeccionId); closeConfirmDeleteModal(); }}>Confirmar</button>
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
                        title='Registrar Tipo de Inspección'>
                        <img src={icon.plus} alt="Crear" className='icon' />
                        Agregar
                    </button>

                    <h2>Tipos de Inspección</h2>

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
                        {currentData.map((tipo_inspeccion, idx) => (
                            <tr key={tipo_inspeccion.id} >
                                <td>{indexOfFirstItem + idx + 1}</td>
                                <td>{tipo_inspeccion.nombre}</td>
                                <td>
                                    <div className='iconContainer'>
                                        <img
                                            onClick={() => openEditModal(tipo_inspeccion)}
                                            src={icon.editar}
                                            className='iconeditar'
                                            title='Editar'
                                        />
                                        <img 
                                            onClick={() => openConfirmDeleteModal(tipo_inspeccion.id)} 
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

export default TipoInspeccion;