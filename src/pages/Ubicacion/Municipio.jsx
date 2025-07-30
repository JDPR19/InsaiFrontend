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
        estado_id: '',
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
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
            });
            setDatosOriginales(response.data);
            setDatosFiltrados(response.data);
        } catch (error) {
            console.error('Error obteniendo municipios:', error);
            addNotification('Error al obtener municipios', 'error');
        }finally{
            setLoading(false);
        }
    };

    const fetchEstados = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${BaseUrl}/municipio/estados/all`, {
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
            });
            setEstados(response.data);
        } catch (error) {
            console.error('Error obteniendo estados:', error);
            addNotification('Error al obtener estados', 'error');
        }finally{
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
            estado_id: '',
        });
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
        const filtered = filterData(datosOriginales, searchTerm, ['id','nombre','estado_nombre']);
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
                    return;
                }
            }
        }


        try {
            await axios.post(`${BaseUrl}/municipio`, {
                nombre: formData.nombre,
                estado_id: formData.estado_id,
            }, {
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
            });
            addNotification('Municipio registrado con éxito', 'success');
            fetchMunicipios();
            closeModal();
        } catch (error) {
            console.error('Error creando Municipio:', error);
            addNotification('Error al registrar municipio', 'error');
        }finally{
            setLoading(false);
        }
    };

    const handleEdit = async () => {
        setLoading(true);
        const camposObligatorios = ['nombre', 'estado_id'];
        for (const field of camposObligatorios) {
            if (!validationRules[field]) continue;
            const { regex, errorMessage } = validationRules[field];
            const { valid, message } = validateField(formData[field], regex, errorMessage);
            if (!valid) {
                addNotification(message, 'warning');
                return;
            }
        }

        try {
            await axios.put(`${BaseUrl}/municipio/${formData.id}`, {
                nombre: formData.nombre,
                estado_id: formData.estado_id,
            }, {
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
            });
            addNotification('Municipio actualizado con éxito', 'success');
            fetchMunicipios();
            closeModal();
        } catch (error) {
            console.error('Error editando Municipio:', error);
            addNotification('Error al actualizar municipio', 'error');
        }finally{
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        setLoading(true);
        try {
            await axios.delete(`${BaseUrl}/municipio/${id}`, {
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
            });

            fetchMunicipios();
            addNotification('Municipio eliminado con éxito', 'success');
        } catch (error) {
            console.error('Error eliminando Municipio:', error);
            addNotification('Error al eliminar municipio', 'error');
        }finally{
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
        setCurrentModal('municipio');
    };

    const closeModal = () => setCurrentModal(null);

    const openEditModal = (municipio) => {
        setFormData({
            id: municipio.id,
            nombre: municipio.nombre || '',
            estado_id: municipio.estado_id || '',
        });
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
            {loading && <Spinner text="Procesando..." />}
            {currentModal === 'municipio' && (
                <div className='modalOverlay'>
                    <div className='modal'>
                        <button className='closeButton' onClick={closeModal}>&times;</button>
                        <h2>{formData.id ? 'Editar Municipio' : 'Registrar Municipio'}</h2>
                        <form className='modalForm'>
                            <div className='formColumns'>
                                <div className='formGroup'>
                                    <label htmlFor="estado_id">Estado:</label>
                                    <SingleSelect
                                        options={estados.map(estado => ({ value: String(estado.id), label: estado.nombre }))}
                                        value={formData.estado_id}
                                        onChange={val => setFormData(prev => ({ ...prev, estado_id: val }))}
                                        placeholder="Seleccione un tipo"
                                        />
                                    {errors.estado_id && <span className='errorText'>{errors.estado_id}</span>}
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="nombre">Municipio:</label>
                                    <input type="text" id="nombre" value={formData.nombre} onChange={handleChange} className='input' placeholder='Rellene el Campo'/>
                                    {errors.nombre && <span className='errorText'>{errors.nombre}</span>}
                                </div>
                            </div>
                            <button 
                                type="button" 
                                className='saveButton' 
                                onClick={formData.id ? handleEdit : handleSave}
                                title={formData.id ? 'Actualizar Municipio' : 'Registrar Municipio'}>
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

                    <h2>Municipios</h2>

                    <div className='searchContainer'>
                        <SearchBar onSearch={handleSearch} />
                        <img src={icon.lupa} alt="Buscar" className='iconlupa' />
                    </div>
                </div>
                <table className='table'>
                    <thead>
                        <tr>
                            <th>N°</th>
                            <th>Municipio</th>
                            <th>Estado</th>
                            <th>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentData.map((municipio, idx) => (
                            <tr key={municipio.id} >
                                <td>{indexOfFirstItem + idx + 1}</td>
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