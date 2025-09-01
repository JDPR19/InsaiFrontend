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

function Productor() {
    const [datosOriginales, setDatosOriginales] = useState([]);
    const [datosFiltrados, setDatosFiltrados] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [currentModal, setCurrentModal] = useState(null);
    const [detalleModal, setDetalleModal] = useState({ abierto: false, productor: null });
    const [formData, setFormData] = useState({
        id: '',
        codigo: '',
        cedula: '',
        nombre: '',
        apellido: '',
        contacto: '',
        email: ''
    });
    const [errors, setErrors] = useState({});
    const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);
    const [selectedProductorId, setSelectedProductorId] = useState(null);
    const { addNotification } = useNotification();
    const itemsPerPage = 8;


    const fetchProductores = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${BaseUrl}/productor`, {
                headers: { Authorization : `Bearer ${localStorage.getItem('token')}` }
            });
            setDatosOriginales(response.data);
            setDatosFiltrados(response.data);
        } catch (error) {
            console.error('Error obteniendo todos los productores', error);
            addNotification('Error al obtener productores', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProductores();
    }, []);

    const resetFormData = () => {
        setFormData({
            id: '',
            codigo: '',
            cedula: '',
            nombre: '',
            apellido: '',
            contacto: '',
            email: ''
        });
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

    const handleSearch = (searchTerm) => {
        const filtered = filterData(
            datosOriginales,
            searchTerm,
            ['codigo', 'cedula', 'nombre', 'apellido', 'contacto', 'email']
        );
        setDatosFiltrados(filtered);
    };

    const handleSave = async () => {
        setLoading(true);
        for (const field in formData) {
            if (!validationRules[field]) continue;
            const { regex, errorMessage } = validationRules[field];
            const { valid, message } = validateField(formData[field], regex, errorMessage);
            if (!valid) {
                addNotification(message, 'warning');
                setErrors(prev => ({ ...prev, [field]: message }));
                setLoading(false);
                return;
            }
        }
        try {
            await axios.post(`${BaseUrl}/productor`, formData, {
                headers: { Authorization : `Bearer ${localStorage.getItem('token')}` }
            });
            addNotification('Productor registrado con éxito', 'success');
            fetchProductores();
            closeModal();
        } catch (error) {
            console.error('Error registrando el productor', error);
            addNotification('Error al registrar productor', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async () => {
        for (const field of ['codigo', 'cedula', 'nombre', 'apellido']) {
            if (!validationRules[field]) continue;
            const { regex, errorMessage } = validationRules[field];
            const { valid, message } = validateField(formData[field], regex, errorMessage);
            if (!valid) {
                addNotification(message, 'warning');
                setErrors(prev => ({ ...prev, [field]: message }));
                setLoading(false);
                return;
            }
            setLoading(true);
        }
        try {
            await axios.put(`${BaseUrl}/productor/${formData.id}`, formData, {
                headers: { Authorization : `Bearer ${localStorage.getItem('token')}` }
            });
            addNotification('Productor actualizado con éxito', 'success');
            fetchProductores();
            closeModal();
        } catch (error) {
            console.error('Error actualizando el productor', error);
            addNotification('Error al actualizar productor', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        setLoading(true);
        try {
            await axios.delete(`${BaseUrl}/productor/${id}`, {
                headers: { Authorization : `Bearer ${localStorage.getItem('token')}` }
            });
            fetchProductores();
            addNotification('Productor eliminado con éxito', 'success');
        } catch (error) {
            console.error('Error eliminando productor', error);
            addNotification('Error al eliminar productor', 'error');
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
        setCurrentModal('productor');
    };
    const closeModal = () => setCurrentModal(null);

    const openEditModal = (productor) => {
        setFormData({
            id: productor.id,
            codigo: productor.codigo || '',
            cedula: productor.cedula || '',
            nombre: productor.nombre || '',
            apellido: productor.apellido || '',
            contacto: productor.contacto || '',
            email: productor.email || ''
        });
        setErrors({});
        setCurrentModal('productor');
    };

    const openConfirmDeleteModal = (id) => {
        setSelectedProductorId(id);
        setConfirmDeleteModal(true);
    };
    const closeConfirmDeleteModal = () => {
        setSelectedProductorId(null);
        setConfirmDeleteModal(false);
    };

    const openDetalleModal = (productor) => setDetalleModal({ abierto: true, productor: productor });
    const closeDetalleModal = () => setDetalleModal({ abierto: false, productor: null });

    return (
        <div className='mainContainer'>
            {loading && <Spinner text="Procesando..." />}
            {detalleModal.abierto && detalleModal.productor && (
                <div className='modalOverlay'>
                    <div className='modal'>
                        <button className='closeButton' onClick={closeDetalleModal}>&times;</button>
                        <h2>Detalles del Productor</h2>
                        <form className='modalForm'>
                            <div className='formColumns'>
                                <div className='formGroup'>
                                    <label htmlFor="codigo">Código Runsai:</label>
                                    <input
                                        type="text"
                                        id="codigo"
                                        value={detalleModal.productor.codigo || ''}
                                        className='input'
                                        disabled
                                    />
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="cedula">Cédula:</label>
                                    <input
                                        type="text"
                                        id="cedula"
                                        value={detalleModal.productor.cedula || ''}
                                        className='input'
                                        disabled
                                    />
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="nombre">Nombre:</label>
                                    <input
                                        type="text"
                                        id="nombre"
                                        value={detalleModal.productor.nombre || ''}
                                        className='input'
                                        disabled
                                    />
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="apellido">Apellido:</label>
                                    <input
                                        type="text"
                                        id="apellido"
                                        value={detalleModal.productor.apellido || ''}
                                        className='input'
                                        disabled
                                    />
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="contacto">Contacto:</label>
                                    <input
                                        type="text"
                                        id="contacto"
                                        value={detalleModal.productor.contacto || ''}
                                        className='input'
                                        disabled
                                    />
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="email">Correo:</label>
                                    <input
                                        type="email"
                                        id="email"
                                        value={detalleModal.productor.email || ''}
                                        className='input'
                                        disabled
                                    />
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal registro y editar */}
            {currentModal === 'productor' && (
                <div className='modalOverlay'>
                    <div className='modal'>
                        <button className='closeButton' onClick={closeModal}>&times;</button>
                        <h2>{formData.id ? 'Editar Productor' : 'Registrar Productor'}</h2>
                        <form className='modalForm'>
                            <div className='formColumns'>
                                <div className='formGroup'>
                                    <label htmlFor="codigo">Código Runsai:</label>
                                    <input type="text" id="codigo" value={formData.codigo} onChange={handleChange} className='input' placeholder='Código único'/>
                                    {errors.codigo && <span className='errorText'>{errors.codigo}</span>}
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="cedula">Cédula:</label>
                                    <input type="text" id="cedula" value={formData.cedula} onChange={handleChange} className='input' placeholder='Cédula'/>
                                    {errors.cedula && <span className='errorText'>{errors.cedula}</span>}
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="nombre">Nombre:</label>
                                    <input type="text" id="nombre" value={formData.nombre} onChange={handleChange} className='input' placeholder='Nombre'/>
                                    {errors.nombre && <span className='errorText'>{errors.nombre}</span>}
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="apellido">Apellido:</label>
                                    <input type="text" id="apellido" value={formData.apellido} onChange={handleChange} className='input' placeholder='Apellido'/>
                                    {errors.apellido && <span className='errorText'>{errors.apellido}</span>}
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="contacto">Contacto:</label>
                                    <input type="text" id="contacto" value={formData.contacto} onChange={handleChange} className='input' placeholder='Teléfono'/>
                                    {errors.contacto && <span className='errorText'>{errors.contacto}</span>}
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="email">Correo:</label>
                                    <input type="email" id="email" value={formData.email} onChange={handleChange} className='input' placeholder='Correo electrónico'/>
                                    {errors.email && <span className='errorText'>{errors.email}</span>}
                                </div>
                            </div>
                            <button 
                                type="button" 
                                className='saveButton' 
                                onClick={formData.id ? handleEdit : handleSave}
                                title={formData.id ? 'Actualizar Productor' : 'Registrar Productor'}
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
                        <p>¿Estás seguro de que deseas eliminar este productor?</p>
                        <div className='modalActions'>
                            <button className='cancelButton' onClick={closeConfirmDeleteModal}>Cancelar</button>
                            <button className='confirmButton' onClick={() => { handleDelete(selectedProductorId); closeConfirmDeleteModal(); }}>Confirmar</button>
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
                        title='Registrar Productor'>
                        <img src={icon.plus} alt="Crear" className='icon' />
                        Agregar
                    </button>
                    <h2>Productores</h2>
                    <div className='searchContainer'>
                        <SearchBar onSearch={handleSearch} />
                        <img src={icon.lupa} alt="Buscar" className='iconlupa' />
                    </div>
                </div>
                <table className='table'>
                    <thead>
                        <tr>
                            <th>Código Runsai</th>
                            <th>Cédula</th>
                            <th>Nombre</th>
                            <th>Apellido</th>
                            <th>Contacto</th>
                            <th>Correo</th>
                            <th>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentData.map((prod) => (
                            <tr key={prod.id} >
                                <td>{prod.codigo}</td>
                                <td>{prod.cedula}</td>
                                <td>{prod.nombre}</td>
                                <td>{prod.apellido}</td>
                                <td>{prod.contacto}</td>
                                <td>{prod.email}</td>
                                <td>
                                    <div className='iconContainer'>
                                        <img
                                            onClick={() => openDetalleModal(prod)}
                                            src={icon.ver}
                                            className='iconver'
                                            title='Ver más'
                                        />
                                        <img
                                            onClick={() => openEditModal(prod)}
                                            src={icon.editar}
                                            className='iconeditar'
                                            title='Editar'
                                        />
                                        <img 
                                            onClick={() => openConfirmDeleteModal(prod.id)} 
                                            src={icon.eliminar} 
                                            className='iconeliminar' 
                                            title='Eliminar'
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
        </div>
    );
}

export default Productor;