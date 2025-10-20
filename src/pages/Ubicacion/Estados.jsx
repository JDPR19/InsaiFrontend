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

function Estados() {
    const [datosOriginales, setDatosOriginales] = useState([]);
    const [datosFiltrados, setDatosFiltrados] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [currentModal, setCurrentModal] = useState(null);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        id: '',
        nombre: '',
        codigo: '',    // NUEVO: código territorial (2 dígitos)
    });
    const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);
    const [selectedEstadoId, setSelectedEstadoId] = useState(null);
    const { addNotification } = useNotification();
    const itemsPerPage = 8;

    const [errors, setErrors] = useState({});

    // Reiniciar el modal luego de cerrar
    const resetFormData = () => {
        setFormData({
            id: '',
            nombre: '',
            codigo: '',
        });
        setErrors({});
    };

    // Manejar cambios en el formulario
    const handleChange = (e) => {
        const { id, value } = e.target;

        // Sanitizar y limitar el código a 2 dígitos
        if (id === 'codigo') {
            const onlyDigits = value.replace(/\D/g, '').slice(0, 2);
            setFormData(prev => ({ ...prev, codigo: onlyDigits }));

            // Validación local de 2 dígitos
            const isValid = /^\d{2}$/.test(onlyDigits);
            setErrors(prev => ({ ...prev, codigo: onlyDigits && !isValid ? 'El código debe tener 2 dígitos (ej: 01)' : '' }));
            return;
        }

        setFormData(prev => ({ ...prev, [id]: value }));

        if (validationRules[id]) {
            const { regex, errorMessage } = validationRules[id];
            const { valid, message } = validateField(value, regex, errorMessage);
            setErrors(prev => ({ ...prev, [id]: valid ? '' : message }));
        }
    };

    // Filtrar datos en la barra de búsqueda (incluye código)
    const handleSearch = (searchTerm) => {
        const filtered = filterData(datosOriginales, searchTerm, ['id', 'nombre', 'codigo']);
        setDatosFiltrados(filtered);
    };

    // Obtener estados
    const fetchEstados = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${BaseUrl}/estado`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setDatosOriginales(response.data);
            setDatosFiltrados(response.data);
        } catch (error) {
            console.error('Error obteniendo estados:', error);
            addNotification('Error al obtener estados', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEstados();
    }, []);

    // Crear estado
    const handleSave = async () => {
        // Validaciones antes de setLoading
        if (!formData.nombre?.trim()) {
            addNotification('El nombre es obligatorio', 'warning');
            return;
        }
        if (!/^\d{2}$/.test(String(formData.codigo || '').trim())) {
            addNotification('El código debe tener 2 dígitos (ej: 01)', 'warning');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                nombre: formData.nombre.trim(),
                codigo: String(formData.codigo).padStart(2, '0')
            };
            const response = await axios.post(`${BaseUrl}/estado`, payload, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setDatosOriginales([response.data, ...datosOriginales]);
            setDatosFiltrados([response.data, ...datosFiltrados]);
            addNotification('Estado registrado con éxito', 'success');
            fetchEstados();
            closeModal();
        } catch (error) {
            console.error('Error creando estado:', error);
            if (error?.response?.status === 409) {
                addNotification('Nombre o código ya existen', 'error');
            } else {
                addNotification('Error al registrar estado', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async () => {
        // Validaciones antes de setLoading
        if (!formData.nombre?.trim()) {
            addNotification('El nombre es obligatorio', 'warning');
            return;
        }
        if (!/^\d{2}$/.test(String(formData.codigo || '').trim())) {
            addNotification('El código debe tener 2 dígitos (ej: 01)', 'warning');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                nombre: formData.nombre.trim(),
                codigo: String(formData.codigo).padStart(2, '0')
            };
            const response = await axios.put(`${BaseUrl}/estado/${formData.id}`, payload, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            const updatedData = datosOriginales.map((estado) =>
                estado.id === response.data.id ? response.data : estado
            );
            setDatosOriginales(updatedData);
            setDatosFiltrados(updatedData);
            closeModal();
            addNotification('Estado actualizado con éxito', 'success');
        } catch (error) {
            console.error('Error editando estado:', error);
            if (error?.response?.status === 409) {
                addNotification('Nombre o código ya existen', 'error');
            } else {
                addNotification('Error al actualizar estado', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        setLoading(true);
        try {
            await axios.delete(`${BaseUrl}/estado/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            setDatosOriginales(datosOriginales.filter((estado) => estado.id !== id));
            setDatosFiltrados(datosFiltrados.filter((estado) => estado.id !== id));
            addNotification('Estado eliminado con éxito', 'success');
        } catch (error) {
            console.error('Error eliminando estado:', error);
            addNotification('Error al eliminar estado', 'error');
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

    // Abrir y cerrar modal
    const openModal = () => {
        resetFormData();
        setCurrentModal('estado');
    };

    const closeModal = () => setCurrentModal(null);

    // Abrir para editar con el modal
    const openEditModal = async (estado) => {
        setFormData({
            id: estado.id,
            nombre: estado.nombre || '',
            codigo: estado.codigo || ''
        });
        setErrors({});
        setCurrentModal('estado');
    };

    // Abrir modal de confirmación para eliminar
    const openConfirmDeleteModal = (id) => {
        setSelectedEstadoId(id);
        setConfirmDeleteModal(true);
    };
    const closeConfirmDeleteModal = () => {
        setSelectedEstadoId(null);
        setConfirmDeleteModal(false);
    };

    return (
        <div className='mainContainer'>

            {/*/////////////////// Tabla ///////////*/}
                <div className='tituloH' 
                style={{marginTop: 20, marginBottom: 20, gap: 20}}
                >
                    <img src={icon.mundo} alt="" className='iconTwo'/>
                    <h1 className='title' title='Estados'>Resumen de Estados</h1>
                
                {/* Ayudante informativo de Pantalla */}
                    <div >
                        <AyudaTooltip descripcion="En esta sección puedes visualizar, registrar y gestionar todos los estados agregados. Usa los filtros, la búsqueda y las opciones de exportación para organizar y consultar la información de manera eficiente." />
                    </div>
                </div>

            {loading && <Spinner text="Procesando..." />}
            {/* modal registro y editar */}
            {currentModal === 'estado' && (
                <div className='modalOverlay'>
                    <div className='modal_mono'>
                        <button className='closeButton' onClick={closeModal}>&times;</button>
                        <h2>{formData.id ? 'Editar Estado' : 'Registrar Estado'}</h2>
                        <form className='modalForm'>
                            <div className='formColumns_mono'>

                                <div className='formGroup'>
                                    <label htmlFor="nombre"><span className='Unique' title='Campo Obligatorio'>*</span>Estado:</label>
                                    <input
                                        type="text"
                                        id="nombre"
                                        value={formData.nombre}
                                        onChange={handleChange}
                                        className='input'
                                        placeholder='Nombre del estado'
                                    />
                                    {errors.nombre && <span className='errorText'>{errors.nombre}</span>}
                                </div>

                                <div className='formGroup'>
                                    <label htmlFor="codigo"><span className='Unique' title='Campo Obligatorio'>*</span>Código (UBIGEO 2 dígitos):</label>
                                    <input
                                        type="text"
                                        id="codigo"
                                        value={formData.codigo}
                                        onChange={handleChange}
                                        className='input'
                                        placeholder='Ej: 01'
                                        maxLength={2}
                                        inputMode="numeric"
                                    />
                                    {errors.codigo && <span className='errorText'>{errors.codigo}</span>}
                                </div>

                            </div>

                            <button
                                type="button"
                                className='saveButton'
                                onClick={formData.id ? handleEdit : handleSave}
                                title={formData.id ? 'Actualizar Estado' : 'Registrar Estado'}
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
                        <p>¿Estás seguro de que deseas eliminar este estado?</p>
                        <div className='modalActions'>
                            <button className='cancelButton' onClick={closeConfirmDeleteModal}>Cancelar</button>
                            <button className='confirmButton' onClick={() => { handleDelete(selectedEstadoId); closeConfirmDeleteModal(); }}>Confirmar</button>
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
                        title='Registrar Estado'>
                        <img src={icon.plus} alt="Crear" className='icon' />
                        Agregar
                    </button>


                    <div className='searchContainer'>
                        <SearchBar onSearch={handleSearch} />
                        <img src={icon.lupa} alt="Buscar" className='iconlupa' />
                    </div>
                </div>
                <table className='table'>
                    <thead>
                        <tr>
                            <th>N°</th>
                            <th>Código</th>
                            <th>Nombre</th>
                            <th>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentData.map((estado, idx) => (
                            <tr key={estado.id} >
                                <td>{indexOfFirstItem + idx + 1}</td>
                                <td>{estado.codigo}</td>
                                <td>{estado.nombre}</td>
                                <td>
                                    <div className='iconContainer'>
                                        <img
                                            onClick={() => openEditModal(estado)}
                                            src={icon.editar}
                                            className='iconeditar'
                                            title='Editar'
                                        />
                                        <img
                                            onClick={() => openConfirmDeleteModal(estado.id)}
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

export default Estados;