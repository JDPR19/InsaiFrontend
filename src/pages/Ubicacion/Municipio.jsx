import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../main.css';
import SingleSelect from '../../components/selectmulti/SingleSelect';
import icon from '../../components/iconos/iconos';
import { filterData } from '../../utils/filterData';
import SearchBar from "../../components/searchbart/SearchBar";
import { useNotification } from '../../utils/NotificationContext';
import { validateField, validationRules } from '../../utils/validation';
import Spinner from '../../components/spinner/Spinner';
import { BaseUrl } from '../../utils/constans';
import AyudaTooltip from '../../components/ayudanteinfo/AyudaTooltip';

function Municipio() {
    const [datosOriginales, setDatosOriginales] = useState([]);
    const [datosFiltrados, setDatosFiltrados] = useState([]);
    const [estados, setEstados] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [currentModal, setCurrentModal] = useState(null);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        id: '',
        nombre: '',
        estado_id: null,
        codigo: '' // NUEVO: código territorial (2 dígitos, opcional para autogenerar)
    });
    const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);
    const [selectedMunicipioId, setSelectedMunicipioId] = useState(null);
    const { addNotification } = useNotification();
    const itemsPerPage = 8;
    const [errors, setErrors] = useState({});

    // --- Fetchers ---
    const fetchMunicipios = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${BaseUrl}/municipio`, {
                headers: { Authorization : `Bearer ${localStorage.getItem('token')}` }
            });
            setDatosOriginales(response.data);
            setDatosFiltrados(response.data);
        } catch (error) {
            console.error('Error obteniendo municipios:', error);
            addNotification('Error al obtener municipios', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchEstados = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${BaseUrl}/municipio/estados/all`, {
                headers: { Authorization : `Bearer ${localStorage.getItem('token')}` }
            });
            setEstados(response.data);
        } catch (error) {
            console.error('Error obteniendo estados:', error);
            addNotification('Error al obtener estados', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMunicipios();
        fetchEstados();
    }, []);

    const resetFormData = () => {
        setFormData({
            id: '',
            nombre: '',
            estado_id: null,
            codigo: ''
        });
        setErrors({});
    };

    const handleChange = (e) => {
        const { id, value } = e.target;

        if (id === 'codigo') {
            const onlyDigits = value.replace(/\D/g, '').slice(0, 2);
            setFormData(prev => ({ ...prev, codigo: onlyDigits }));
            const isValid = onlyDigits === '' || /^\d{2}$/.test(onlyDigits);
            setErrors(prev => ({ ...prev, codigo: isValid ? '' : 'El código debe tener 2 dígitos (ej: 01)' }));
            return;
        }

        setFormData(prev => ({ ...prev, [id]: value }));

        if (validationRules[id]) {
            const { regex, errorMessage } = validationRules[id];
            const { valid, message } = validateField(value, regex, errorMessage);
            setErrors(prev => ({ ...prev, [id]: valid ? '' : message }));
        }
    };

    const handleSearch = (searchTerm) => {
        const filtered = filterData(datosOriginales, searchTerm, ['id','nombre','estado_nombre','codigo','estado_codigo']);
        setDatosFiltrados(filtered);
        setCurrentPage(1);
    };

    const handleSave = async () => {
        if (!formData.estado_id || !formData.estado_id.value) {
            addNotification('Debe seleccionar un estado', 'warning');
            return;
        }
        if (!formData.nombre?.trim()) {
            addNotification('El nombre es obligatorio', 'warning');
            return;
        }
        if (formData.codigo && !/^\d{2}$/.test(formData.codigo)) {
            addNotification('El código debe tener 2 dígitos (ej: 01)', 'warning');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                nombre: formData.nombre.trim(),
                estado_id: formData.estado_id?.value
            };
            if (formData.codigo) {
                payload.codigo = String(formData.codigo).padStart(2, '0');
            }

            await axios.post(`${BaseUrl}/municipio`, payload, {
                headers: { Authorization : `Bearer ${localStorage.getItem('token')}` }
            });

            addNotification('Municipio registrado con éxito', 'success');
            fetchMunicipios();
            closeModal();
        } catch (error) {
            console.error('Error creando Municipio:', error);
            if (error?.response?.status === 409) {
                addNotification('Nombre o código ya existen en el estado', 'error');
            } else {
                addNotification('Error al registrar municipio', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async () => {
        if (!formData.estado_id || !formData.estado_id.value) {
            addNotification('Debe seleccionar un estado', 'warning');
            return;
        }
        if (!formData.nombre?.trim()) {
            addNotification('El nombre es obligatorio', 'warning');
            return;
        }
        if (formData.codigo && !/^\d{2}$/.test(formData.codigo)) {
            addNotification('El código debe tener 2 dígitos (ej: 01)', 'warning');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                nombre: formData.nombre.trim(),
                estado_id: formData.estado_id?.value
            };
            if (formData.codigo !== '') {
                payload.codigo = String(formData.codigo).padStart(2, '0');
            }

            await axios.put(`${BaseUrl}/municipio/${formData.id}`, payload, {
                headers: { Authorization : `Bearer ${localStorage.getItem('token')}` }
            });

            addNotification('Municipio actualizado con éxito', 'success');
            fetchMunicipios();
            closeModal();
        } catch (error) {
            console.error('Error editando Municipio:', error);
            if (error?.response?.status === 409) {
                addNotification('Nombre o código ya existen en el estado', 'error');
            } else {
                addNotification('Error al actualizar municipio', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        setLoading(true);
        try {
            await axios.delete(`${BaseUrl}/municipio/${id}`, {
                headers: { Authorization : `Bearer ${localStorage.getItem('token')}` }
            });

            fetchMunicipios();
            addNotification('Municipio eliminado con éxito', 'success');
        } catch (error) {
            console.error('Error eliminando Municipio:', error);
            addNotification('Error al eliminar municipio', 'error');
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

    // Modales
    const openModal = () => {
        resetFormData();
        setCurrentModal('municipio');
    };
    const closeModal = () => setCurrentModal(null);

    const openEditModal = (municipio) => {
        setFormData({
            id: municipio.id,
            nombre: municipio.nombre || '',
            estado_id: municipio.estado_id
                ? { value: String(municipio.estado_id), label: estados.find(e => String(e.id) === String(municipio.estado_id))?.nombre || '' }
                : null,
            codigo: municipio.codigo || ''
        });
        setErrors({});
        setCurrentModal('municipio');
    };

    const openConfirmDeleteModal = (id) => {
        setSelectedMunicipioId(id);
        setConfirmDeleteModal(true);
    };
    const closeConfirmDeleteModal = () => {
        setSelectedMunicipioId(null);
        setConfirmDeleteModal(false);
    };

    return (
        <div className='mainContainer'>

            {/*/////////////////// Tabla ///////////*/}
                <div className='tituloH' 
                style={{marginTop: 20, marginBottom: 20, gap: 20}}
                >
                    <img src={icon.mundo} alt="" className='iconTwo'/>
                    <h1 className='title' title='Municipios'>Resumen de Municipios</h1>
                
                {/* Ayudante informativo de Pantalla */}
                    <div >
                        <AyudaTooltip descripcion="En esta sección puedes visualizar, registrar y gestionar todos los municipios agregados. Usa los filtros, la búsqueda y las opciones de exportación para organizar y consultar la información de manera eficiente." />
                    </div>
                </div>

            {loading && <Spinner text="Procesando..." />}
            {currentModal === 'municipio' && (
                <div className='modalOverlay'>
                    <div className='modal'>
                        <button className='closeButton' onClick={closeModal}>&times;</button>
                        <h2>{formData.id ? 'Editar Municipio' : 'Registrar Municipio'}</h2>
                        <form className='modalForm'>
                            <div className='formColumns'>
                                <div className='formGroup'>
                                    <label htmlFor="estado_id"><span className='Unique' title='Campo Obligatorio'>*</span>Estado:</label>
                                    <SingleSelect
                                        options={estados.map(estado => ({ value: String(estado.id), label: estado.nombre }))}
                                        value={formData.estado_id}
                                        onChange={val => setFormData(prev => ({ ...prev, estado_id: val }))}
                                        placeholder="Seleccione un estado"
                                    />
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="nombre"><span className='Unique' title='Campo Obligatorio'>*</span>Municipio:</label>
                                    <input
                                        type="text"
                                        id="nombre"
                                        value={formData.nombre}
                                        onChange={handleChange}
                                        className='input'
                                        placeholder='Rellene el Campo'
                                    />
                                    {errors.nombre && <span className='errorText'>{errors.nombre}</span>}
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="codigo">Código (UBIGEO 2 dígitos):</label>
                                    <input
                                        type="text"
                                        id="codigo"
                                        value={formData.codigo}
                                        onChange={handleChange}
                                        className='input'
                                        placeholder='Ej: 01 (vacío para autogenerar)'
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
                                title={formData.id ? 'Actualizar Municipio' : 'Registrar Municipio'}
                                disabled={loading}
                            >
                                {loading ? 'Procesando...' : 'Guardar'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {confirmDeleteModal && (
                <div className='modalOverlay'>
                    <div className='modal'>
                        <h2>Confirmar Eliminación</h2>
                        <p>¿Estás seguro de que deseas eliminar este municipio?</p>
                        <div className='modalActions'>
                            <button className='cancelButton' onClick={closeConfirmDeleteModal}>Cancelar</button>
                            <button className='confirmButton' onClick={() => { handleDelete(selectedMunicipioId); closeConfirmDeleteModal(); }}>Confirmar</button>
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
                        title='Registrar Municipio'>
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
                            <th>Municipio</th>
                            <th>Estado</th>
                            <th>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentData.map((municipio, idx) => (
                            <tr key={municipio.id} >
                                <td>{indexOfFirstItem + idx + 1}</td>
                                <td>{municipio.codigo}</td>
                                <td>{municipio.nombre}</td>
                                <td>{municipio.estado_nombre}</td>
                                <td>
                                    <div className='iconContainer'>
                                        <img
                                            onClick={() => openEditModal(municipio)}
                                            src={icon.editar}
                                            className='iconeditar'
                                            title='Editar'
                                        />
                                        <img
                                            onClick={() => openConfirmDeleteModal(municipio.id)}
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

export default Municipio;