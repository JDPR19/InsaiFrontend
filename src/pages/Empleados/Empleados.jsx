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

function Empleado() {
    const [loading, setLoading] = useState(false);
    const [datosOriginales, setDatosOriginales] = useState([]); 
    const [datosFiltrados, setDatosFiltrados] = useState([]); 
    const [cargos, setCargos] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [currentModal, setCurrentModal] = useState(null);
    const [formData, setFormData] = useState({
        cedula: '',
        nombre: '',
        apellido: '',
        contacto: '',
        cargo_id: ''
    });
    const [confirmDeleteModal, setConfirmDeleteModal] = useState(false); 
    const [selectedEmpleadoId, setSelectedEmpleadoId] = useState(null); 
    const [detalleModal, setDetalleModal] = useState({ abierto: false, empleado: null });
    const { addNotification } = useNotification();
    const itemsPerPage = 8;
    const [errors, setErrors] = useState({});

    
    const resetFormData = () => {
        setFormData({
            cedula: '',
            nombre: '',
            apellido: '',
            contacto: '',
            cargo_id: ''
        });
        setErrors({});
    };

    
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
        const filtered = filterData(datosOriginales, searchTerm, ['cedula', 'nombre', 'apellido', 'contacto', 'cargo_nombre']);
        setDatosFiltrados(filtered);
    };

    
    useEffect(() => {
        const fetchEmpleados = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${BaseUrl}/empleados`, {
                    headers: {
                        Authorization : `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setDatosOriginales(response.data);
                setDatosFiltrados(response.data);
            } catch (error) {
                const errorResponse = error.response ? error.response.data : error.message;
                console.error('Error obteniendo empleados:', errorResponse);
                addNotification('Error al obtener empleados', 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchEmpleados();
    }, []);

    
    useEffect(() => {
        const fetchCargos = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${BaseUrl}/empleados/cargos`, {
                    headers: {
                        Authorization : `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setCargos(response.data);
            } catch (error) {
                const errorResponse = error.response ? error.response.data : error.message;
                console.error('Error obteniendo cargos:', errorResponse);
                addNotification('Error al obtener cargos', 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchCargos();
    }, []);

    
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
            const response = await axios.post(`${BaseUrl}/empleados`, formData, {
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
            });
            setDatosOriginales([response.data, ...datosOriginales]);
            setDatosFiltrados([response.data, ...datosFiltrados]);
            closeModal();
            addNotification('Empleado registrado con éxito', 'success');
        } catch (error) {
            const errorResponse = error.response ? error.response.data : error.message;
            console.error('Error creando empleado:', errorResponse);
            addNotification('Error al registrar empleado', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async () => {
        setLoading(true);
        const camposObligatorios = ['cedula', 'nombre', 'apellido'];
        for (const field of camposObligatorios) {
            const { regex, errorMessage } = validationRules[field];
            const { valid, message } = validateField(formData[field], regex, errorMessage);
            if (!valid) {
                addNotification(message, 'info');
                setErrors(prev => ({ ...prev, [field]: message }));
                setLoading(false);
                return;
            }
        }
        try {
            const response = await axios.put(`${BaseUrl}/empleados/${formData.id}`, formData, {
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
            });
            const updatedData = datosOriginales.map((empleado) =>
                empleado.id === response.data.id ? response.data : empleado
            );
            setDatosOriginales(updatedData);
            setDatosFiltrados(updatedData);
            closeModal();
            addNotification('Empleado actualizado con éxito', 'success');
        } catch (error) {
            console.error('Error editando empleado:', error);
            addNotification('Error al actualizar empleado', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        setLoading(true);
        try {
            await axios.delete(`${BaseUrl}/empleados/${id}`, {
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
            });
            setDatosOriginales(datosOriginales.filter((empleado) => empleado.id !== id));
            setDatosFiltrados(datosFiltrados.filter((empleado) => empleado.id !== id));
            addNotification('Empleado eliminado con éxito', 'success');
        } catch (error) {
            console.error('Error eliminando empleado:', error);
            addNotification('Error al eliminar empleado', 'error');
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

    // Abrir y cerrar modales
    const openModal = () => {
        resetFormData();
        setCurrentModal('empleado');
    };
    const closeModal = () => setCurrentModal(null);

    const openEditModal = (empleado) => {
        setFormData(empleado);
        setErrors({});
        setCurrentModal('empleado');
    };

    const openConfirmDeleteModal = (id) => {
        setSelectedEmpleadoId(id);
        setConfirmDeleteModal(true);
    };

    const closeConfirmDeleteModal = () => {
        setSelectedEmpleadoId(null);
        setConfirmDeleteModal(false);
    };
 
    const openDetalleModal = (empleado) => setDetalleModal({ abierto: true, empleado: empleado });
    const closeDetalleModal = () => setDetalleModal({ abierto: false, empleado: null });

    return (
        <div className='mainContainer'>
            {loading && <Spinner text="Procesando..." />}
            {/* Modal de detalle */}
            {detalleModal.abierto && detalleModal.empleado && (
                <div className='modalOverlay'>
                    <div className='modal'>
                        <button className='closeButton' onClick={closeDetalleModal}>&times;</button>
                        <h2>Detalles del Empleado</h2>
                        <form className='modalForm'>
                            <div className='formColumns'>
                                <div className='formGroup'>
                                    <label htmlFor="cedula">Cédula:</label>
                                    <input
                                        type="text"
                                        id="cedula"
                                        value={detalleModal.empleado.cedula || ''}
                                        className='input'
                                        disabled
                                    />
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="nombre">Nombre:</label>
                                    <input
                                        type="text"
                                        id="nombre"
                                        value={detalleModal.empleado.nombre || ''}
                                        className='input'
                                        disabled
                                    />
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="apellido">Apellido:</label>
                                    <input
                                        type="text"
                                        id="apellido"
                                        value={detalleModal.empleado.apellido || ''}
                                        className='input'
                                        disabled
                                    />
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="contacto">Contacto:</label>
                                    <input
                                        type="text"
                                        id="contacto"
                                        value={detalleModal.empleado.contacto || ''}
                                        className='input'
                                        disabled
                                    />
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="cargo_id">Cargo:</label>
                                    <SingleSelect
                                        options={cargos.map(cargo => ({ value: String(cargo.id), label: cargo.nombre }))}
                                        value={detalleModal.empleado.cargo_id}
                                        isDisabled={true}
                                    />
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Modal registro y editar */}
            {currentModal === 'empleado' && (
                <div className='modalOverlay'>
                    <div className='modal'>
                        <button className='closeButton' onClick={closeModal}>&times;</button>
                        <h2>{formData.id ? 'Editar Empleado' : 'Registrar Empleado'}</h2>
                        <form className='modalForm'>
                            <div className='formColumns'> 
                                <div className='formGroup'>
                                    <label htmlFor="cedula">Cédula:</label>
                                    <input type="text" id="cedula" value={formData.cedula} onChange={handleChange} className='input' placeholder='V-********'/>
                                    {errors.cedula && <span className='errorText'>{errors.cedula}</span>}
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="nombre">Nombre:</label>
                                    <input type="text" id="nombre" value={formData.nombre} onChange={handleChange} className='input' placeholder='Rellene el Campo'/>
                                    {errors.nombre && <span className='errorText'>{errors.nombre}</span>}
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="apellido">Apellido:</label>
                                    <input type="text" id="apellido" value={formData.apellido} onChange={handleChange} className='input' placeholder='Rellene el Campo'/>
                                    {errors.apellido && <span className='errorText'>{errors.apellido}</span>}
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="contacto">Contacto:</label>
                                    <input type="text" id="contacto" value={formData.contacto} onChange={handleChange} className='input' placeholder='04**-*******'/>
                                    {errors.contacto && <span className='errorText'>{errors.contacto}</span>}
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="cargo_id">Cargo:</label>
                                    <SingleSelect
                                        options={cargos.map(cargo => ({ value: String(cargo.id), label: cargo.nombre }))}
                                        value={formData.cargo_id}
                                        onChange={val => setFormData(prev => ({ ...prev, cargo_id: val }))}
                                        placeholder="Seleccione un tipo"
                                        />
                                    {errors.cargo_id && <span className='errorText'>{errors.cargo_id}</span>}
                                </div>
                            </div>
                            <button 
                                type="button" 
                                className='saveButton' 
                                onClick={formData.id ? handleEdit : handleSave}
                                title={formData.id ? 'Actualizar Empleado' : 'Registrar Empleado'}>
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
                        <p>¿Estás seguro de que deseas eliminar este empleado?</p>
                        <div className='modalActions'>
                            <button
                                className='cancelButton'
                                onClick={closeConfirmDeleteModal}
                            >
                                Cancelar
                            </button>
                            <button
                                className='confirmButton'
                                onClick={() => {
                                    handleDelete(selectedEmpleadoId);
                                    closeConfirmDeleteModal();
                                }}
                            >
                                Confirmar
                            </button>
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
                        title='Registrar Empleado'>
                        <img src={icon.plus} alt="Crear" className='icon' />
                        Agregar
                    </button>
                    <h2>Empleados</h2>
                    <div className='searchContainer'>
                        <SearchBar onSearch={handleSearch} />
                        <img src={icon.lupa} alt="Buscar" className='iconlupa' />
                    </div>
                </div>
                <table className='table'>
                    <thead>
                        <tr>
                            <th>Cédula</th>
                            <th>Nombre</th>
                            <th>Apellido</th>
                            <th>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentData.map((empleado) => (
                            <tr key={empleado.id}>
                                <td>{empleado.cedula}</td>
                                <td>{empleado.nombre}</td>
                                <td>{empleado.apellido}</td>
                                <td>
                                    <div className='iconContainer'>
                                        <img
                                            onClick={() => openDetalleModal(empleado)}
                                            src={icon.ver}
                                            className='iconver'
                                            title='Ver más'
                                        />
                                        <img
                                            onClick={() => openEditModal(empleado)}
                                            src={icon.editar}
                                            className='iconeditar'
                                            title='Editar'
                                        />
                                        <img 
                                            onClick={() => openConfirmDeleteModal(empleado.id)} 
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

export default Empleado;