import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../main.css';
import icon from '../../components/iconos/iconos';
import { filterData } from '../../utils/filterData';
import SearchBar from "../../components/searchbart/SearchBar";
import SingleSelect from '../../components/selectmulti/SingleSelect';
import { useNotification } from '../../utils/NotificationContext';
import { validateField, validationRules } from '../../utils/validation';
import Spinner from '../../components/spinner/Spinner';
import { BaseUrl } from '../../utils/constans';

function Parroquia() {
    const [datosOriginales, setDatosOriginales] = useState([]);
    const [datosFiltrados, setDatosFiltrados] = useState([]);
    const [estados, setEstados] = useState([]);
    const [municipios, setMunicipios] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [currentModal, setCurrentModal] = useState(null);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        id: '',
        nombre: '',
        estado_id: null,
        municipio_id: null,
        codigo: '' // NUEVO: 2 dígitos, opcional (autogenera en backend)
    });
    const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);
    const [selectedParroquiaId, setSelectedParroquiaId] = useState(null);
    const { addNotification } = useNotification();
    const itemsPerPage = 8;
    const [errors, setErrors] = useState({});

    // Fetch parroquias
    const fetchParroquias = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${BaseUrl}/parroquia`, {
                headers: { Authorization : `Bearer ${localStorage.getItem('token')}` }
            });
            setDatosOriginales(response.data);
            setDatosFiltrados(response.data);
        } catch (error) {
            console.error('error al obtener las parroquias',error);
            addNotification('Error al obtener parroquias', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Fetch estados
    const fetchEstados = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${BaseUrl}/parroquia/estados/all`, {
                headers: { Authorization : `Bearer ${localStorage.getItem('token')}` }
            });
            setEstados(response.data);
        } catch (error) {
            console.error('error al obtener los estados',error);
            addNotification('Error al obtener estados', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Fetch municipios filtrados por estado
    const fetchMunicipios = async (estadoId) => {
        setLoading(true);
        try {
            if (!estadoId) {
                setMunicipios([]);
                return;
            }
            const response = await axios.get(`${BaseUrl}/parroquia/municipios/all`, {
                headers: { Authorization : `Bearer ${localStorage.getItem('token')}` }
            });
            setMunicipios(response.data.filter(m => String(m.estado_id) === String(estadoId)));
        } catch (error) {
            console.error('error al obtener los municipios',error);
            setMunicipios([]);
            addNotification('Error al obtener municipios', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchParroquias();
        fetchEstados();
    }, []);

    const resetFormData = () => {
        setFormData({
            id: '',
            nombre: '',
            estado_id: null,
            municipio_id: null,
            codigo: ''
        });
        setMunicipios([]);
        setErrors({});
    };

    // Handler para inputs de texto
    const handleInputChange = (e) => {
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

    // Handler para cambio de estado
    const handleEstadoChange = (val) => {
        setFormData(prev => ({
            ...prev,
            estado_id: val,
            municipio_id: null
        }));
        if (val) {
            fetchMunicipios(val.value);
        } else {
            setMunicipios([]);
        }
    };

    // Handler para cambio de municipio
    const handleMunicipioChange = (val) => {
        setFormData(prev => ({
            ...prev,
            municipio_id: val
        }));
    };

    const handleSearch = (searchTerm) => {
        const filtered = filterData(
            datosOriginales,
            searchTerm,
            ['id','nombre','codigo','municipio_nombre','estado_nombre','municipio_codigo','estado_codigo']
        );
        setDatosFiltrados(filtered);
        setCurrentPage(1);
    };

    const handleSave = async () => {
        if (!formData.estado_id || !formData.estado_id.value) {
            addNotification('Debe seleccionar un estado', 'warning');
            return;
        }
        if (!formData.municipio_id || !formData.municipio_id.value) {
            addNotification('Debe seleccionar un municipio', 'warning');
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
                municipio_id: formData.municipio_id?.value
            };
            if (formData.codigo) {
                payload.codigo = String(formData.codigo).padStart(2, '0');
            }

            await axios.post(`${BaseUrl}/parroquia`, payload, {
                headers: { Authorization : `Bearer ${localStorage.getItem('token')}` }
            });
            addNotification('Parroquia registrada con éxito', 'success');
            fetchParroquias();
            closeModal();
        } catch (error) {
            console.error('error registrando la parroquia',error);
            if (error?.response?.status === 409) {
                addNotification('Nombre o código ya existen en el municipio', 'error');
            } else {
                addNotification('Error al registrar parroquia', 'error');
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
        if (!formData.municipio_id || !formData.municipio_id.value) {
            addNotification('Debe seleccionar un municipio', 'warning');
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
                municipio_id: formData.municipio_id?.value
            };
            if (formData.codigo !== '') {
                payload.codigo = String(formData.codigo).padStart(2, '0');
            }

            await axios.put(`${BaseUrl}/parroquia/${formData.id}`, payload, {
                headers: { Authorization : `Bearer ${localStorage.getItem('token')}` }
            });
            addNotification('Parroquia actualizada con éxito', 'success');
            fetchParroquias();
            closeModal();
        } catch (error) {
            console.error('error actualizando la parroquia',error);
            if (error?.response?.status === 409) {
                addNotification('Nombre o código ya existen en el municipio', 'error');
            } else {
                addNotification('Error al actualizar parroquia', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        setLoading(true);
        try {
            await axios.delete(`${BaseUrl}/parroquia/${id}`, {
                headers: { Authorization : `Bearer ${localStorage.getItem('token')}` }
            });

            fetchParroquias();
            addNotification('Parroquia eliminada con éxito', 'success');
        } catch (error) {
            console.error('error eliminando la parroquia',error);
            addNotification('Error al eliminar parroquia', 'error');
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
        setCurrentModal('parroquia');
    };

    const closeModal = () => setCurrentModal(null);

    const openEditModal = (parroquia) => {
        const estadoObj = parroquia.estado_id
            ? { value: String(parroquia.estado_id), label: estados.find(e => String(e.id) === String(parroquia.estado_id))?.nombre || '' }
            : null;
        const municipioObj = parroquia.municipio_id
            ? { value: String(parroquia.municipio_id), label: municipios.find(m => String(m.id) === String(parroquia.municipio_id))?.nombre || '' }
            : null;
        setFormData({
            id: parroquia.id,
            nombre: parroquia.nombre || '',
            estado_id: estadoObj,
            municipio_id: municipioObj,
            codigo: parroquia.codigo || ''
        });
        fetchMunicipios(parroquia.estado_id);
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
        <div className='mainContainer'>
            {loading && <Spinner text="Procesando..." />}
            {currentModal === 'parroquia' && (
                <div className='modalOverlay'>
                    <div className='modal'>
                        <button className='closeButton' onClick={closeModal}>&times;</button>
                        <h2>{formData.id ? 'Editar Parroquia' : 'Registrar Parroquia'}</h2>
                        <form className='modalForm'>
                            <div className='formColumns'>
                                <div className='formGroup'>
                                    <label htmlFor="estado_id"><span className='Unique' title='Campo Obligatorio'>*</span>Estado:</label>
                                    <SingleSelect
                                        options={estados.map(estado => ({ value: String(estado.id), label: estado.nombre }))}
                                        value={formData.estado_id}
                                        onChange={handleEstadoChange}
                                        placeholder="Seleccione un estado"
                                    />
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="municipio_id"><span className='Unique' title='Campo Obligatorio'>*</span>Municipio:</label>
                                    <SingleSelect
                                        options={municipios.map(m => ({ value: String(m.id), label: m.nombre }))}
                                        value={formData.municipio_id}
                                        onChange={handleMunicipioChange}
                                        placeholder="Seleccione un municipio"
                                        isDisabled={!formData.estado_id || municipios.length === 0}
                                    />
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="nombre"><span className='Unique' title='Campo Obligatorio'>*</span>Parroquia:</label>
                                    <input
                                        type="text"
                                        id="nombre"
                                        value={formData.nombre}
                                        onChange={handleInputChange}
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
                                        onChange={handleInputChange}
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
                                title={formData.id ? 'Actualizar Parroquia' : 'Registrar Parroquia'}
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
                <table className='table'>
                    <thead>
                        <tr>
                            <th>N°</th>
                            <th>Código</th>
                            <th>Parroquia</th>
                            <th>Municipio</th>
                            <th>Estado</th>
                            <th>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentData.map((parroquia, idx) => (
                            <tr key={parroquia.id} >
                                <td>{indexOfFirstItem + idx + 1}</td>
                                <td>{parroquia.codigo}</td>
                                <td>{parroquia.nombre}</td>
                                <td>{parroquia.municipio_nombre}</td>
                                <td>{parroquia.estado_nombre}</td>
                                <td>
                                    <div className='iconContainer'>
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

export default Parroquia;