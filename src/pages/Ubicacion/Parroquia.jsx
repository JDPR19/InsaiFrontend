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
        estado_id: '',
        municipio_id: '',
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
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
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
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
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
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
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
            estado_id: '',
            municipio_id: '',
        });
        setMunicipios([]);
    };

    // Handler para inputs de texto
    const handleInputChange = (e) => {
        const { id, value } = e.target;
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
            municipio_id: ''
        }));
        if (val) {
            fetchMunicipios(val);
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
        const filtered = filterData(datosOriginales, searchTerm, ['id','nombre','municipio_nombre','estado_nombre']);
        setDatosFiltrados(filtered);
    };

    const handleSave = async () => {
        setLoading(true);
        for (const field in formData) {
            if (!validationRules[field]) continue;
            const { regex, errorMessage } = validationRules[field];
            if (regex) {
                const { valid, message } = validateField(formData[field], regex, errorMessage);
                if (!valid) {
                    addNotification(message, 'warning');
                    setLoading(false);
                    return;
                }
            }
        }

        try {
            await axios.post(`${BaseUrl}/parroquia`, {
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
            console.error('error registrando la parroquia',error);
            addNotification('Error al registrar parroquia', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async () => {
        setLoading(true);
        const camposObligatorios = ['nombre', 'municipio_id'];
        for (const field of camposObligatorios) {
            if (!validationRules[field]) continue;
            const { regex, errorMessage } = validationRules[field];
            const { valid, message } = validateField(formData[field], regex, errorMessage);
            if (!valid) {
                addNotification(message, 'warning');
                setLoading(false);
                return;
            }
        }

        try {
            await axios.put(`${BaseUrl}/parroquia/${formData.id}`, {
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
            console.error('error actualizando la parroquia',error);
            addNotification('Error al actualizar parroquia', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        setLoading(true);
        try {
            await axios.delete(`${BaseUrl}/parroquia/${id}`, {
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
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
        setFormData({
            id: parroquia.id,
            nombre: parroquia.nombre || '',
            estado_id: parroquia.estado_id || '',
            municipio_id: parroquia.municipio_id || '',
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
                                    <label htmlFor="estado_id">Estado:</label>
                                    <SingleSelect
                                        options={estados.map(estado => ({ value: String(estado.id), label: estado.nombre }))}
                                        value={formData.estado_id}
                                        onChange={handleEstadoChange}
                                        placeholder="Seleccione un estado"
                                    />
                                    {errors.estado_id && <span className='errorText'>{errors.estado_id}</span>}
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="municipio_id">Municipio:</label>
                                    <SingleSelect
                                        options={municipios.map(m => ({ value: String(m.id), label: m.nombre }))}
                                        value={formData.municipio_id}
                                        onChange={handleMunicipioChange}
                                        placeholder="Seleccione un municipio"
                                        isDisabled={!formData.estado_id || municipios.length === 0}
                                    />
                                    {errors.municipio_id && <span className='errorText'>{errors.municipio_id}</span>}
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="nombre">Parroquia:</label>
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
                <table className='table'>
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
                        {currentData.map((parroquia, idx) => (
                            <tr key={parroquia.id} >
                                <td>{indexOfFirstItem + idx + 1}</td>
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