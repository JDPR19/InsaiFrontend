import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './ubicacion.module.css';
import '../../main.css';
import icon from '../../components/iconos/iconos';
import { filterData } from '../../utils/filterData';
import SearchBar from "../../components/searchbart/SearchBar";
import Notification from '../../components/notification/Notification';
import { useNotification } from '../../utils/useNotification';
import SingleSelect from '../../components/selectmulti/SingleSelect';
import { validateField, validationRules } from '../../utils/validation';
import Spinner from '../../components/spinner/Spinner';
import { BaseUrl } from '../../utils/constans';

function Sector() {
    const [datosOriginales, setDatosOriginales] = useState([]);
    const [datosFiltrados, setDatosFiltrados] = useState([]);
    const [estados, setEstados] = useState([]);
    const [municipios, setMunicipios] = useState([]);
    const [parroquias, setParroquias] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [currentModal, setCurrentModal] = useState(null);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        id: '',
        nombre: '',
        estado_id: '',
        municipio_id: '',
        parroquia_id: '',
    });
    const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);
    const [selectedSectorId, setSelectedSectorId] = useState(null);

    const { notifications, addNotification, removeNotification } = useNotification();
    const itemsPerPage = 8;
    const [errors, setErrors] = useState({});

    const fetchSectores = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${BaseUrl}/sector`, {
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
            });
            setDatosOriginales(response.data);
            setDatosFiltrados(response.data);
        } catch (error) {
            console.error('error obteniendo sectores ',error);
            addNotification('Error al obtener sectores', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchEstados = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${BaseUrl}/sector/estados/all`, {
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
            });
            setEstados(response.data);
        } catch (error) {
            console.error('error obteniendo estados',error);
            addNotification('Error al obtener estados', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchMunicipios = async (estadoId) => {
        setLoading(true);
        try {
            if (!estadoId) {
                setMunicipios([]);
                return;
            }
            const response = await axios.get(`${BaseUrl}/sector/municipios/all`, {
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
            });
            setMunicipios(response.data.filter(m => String(m.estado_id) === String(estadoId)));
        } catch (error) {
            console.error('error obteniendo municipios ',error);
            setMunicipios([]);
            addNotification('Error al obtener municipios', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchParroquias = async (municipioId) => {
        setLoading(true);
        try {
            if (!municipioId) {
                setParroquias([]);
                return;
            }
            const response = await axios.get(`${BaseUrl}/sector/parroquias/all`, {
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
            });
            setParroquias(response.data.filter(p => String(p.municipio_id) === String(municipioId)));
        } catch (error) {
            console.error('error obteniendo parroquias ',error);
            setParroquias([]);
            addNotification('Error al obtener parroquias', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSectores();
        fetchEstados();
    }, []);

    const resetFormData = () => {
        setFormData({
            id: '',
            nombre: '',
            estado_id: '',
            municipio_id: '',
            parroquia_id: '',
        });
        setMunicipios([]);
        setParroquias([]);
    };

    // Handlers para selects dependientes
    const handleEstadoChange = (val) => {
        setFormData(prev => ({
            ...prev,
            estado_id: val,
            municipio_id: '',
            parroquia_id: ''
        }));
        if (val) {
            fetchMunicipios(val);
            setParroquias([]);
        } else {
            setMunicipios([]);
            setParroquias([]);
        }
    };

    const handleMunicipioChange = (val) => {
        setFormData(prev => ({
            ...prev,
            municipio_id: val,
            parroquia_id: ''
        }));
        if (val) {
            fetchParroquias(val);
        } else {
            setParroquias([]);
        }
    };

    const handleParroquiaChange = (val) => {
        setFormData(prev => ({
            ...prev,
            parroquia_id: val
        }));
    };

    // Handler para input de texto
    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));

        if (validationRules[id]) {
            const { regex, errorMessage } = validationRules[id];
            const { valid, message } = validateField(value, regex, errorMessage);
            setErrors(prev => ({ ...prev, [id]: valid ? '' : message }));
        }
    };

    const handleSearch = (searchTerm) => {
        const filtered = filterData(datosOriginales, searchTerm, [
            'id','nombre','parroquia_nombre','municipio_nombre','estado_nombre'
        ]);
        setDatosFiltrados(filtered);
    };

    const handleSave = async () => {
        setLoading(true);
        for (const field of ['nombre', 'parroquia_id']) {
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
            await axios.post(`${BaseUrl}/sector`, {
                nombre: formData.nombre,
                parroquia_id: formData.parroquia_id,
            }, {
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
            });
            addNotification('Sector registrado con éxito', 'success');
            fetchSectores();
            closeModal();
        } catch (error) {
            console.error('error registrando sector',error);
            addNotification('Error al registrar sector', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async () => {
        setLoading(true);
        for (const field of ['nombre', 'parroquia_id']) {
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
            await axios.put(`${BaseUrl}/sector/${formData.id}`, {
                nombre: formData.nombre,
                parroquia_id: formData.parroquia_id,
            }, {
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
            });
            addNotification('Sector actualizado con éxito', 'success');
            fetchSectores();
            closeModal();
        } catch (error) {
            console.error('error actualizando sector',error);
            addNotification('Error al actualizar sector', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        setLoading(true);
        try {
            await axios.delete(`${BaseUrl}/sector/${id}`, {
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
            });

            fetchSectores();
            addNotification('Sector eliminado con éxito', 'error');
        } catch (error) {
            console.error('error eliminando sector',error);
            addNotification('Error al eliminar sector', 'error');
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
        setCurrentModal('sector');
    };

    const closeModal = () => setCurrentModal(null);

    const openEditModal = (sector) => {
        setFormData({
            id: sector.id,
            nombre: sector.nombre || '',
            estado_id: sector.estado_id || '',
            municipio_id: sector.municipio_id || '',
            parroquia_id: sector.parroquia_id || '',
        });
        fetchMunicipios(sector.estado_id);
        fetchParroquias(sector.municipio_id);
        setCurrentModal('sector');
    };

    const openConfirmDeleteModal = (id) => {
        setSelectedSectorId(id);
        setConfirmDeleteModal(true);
    };
    const closeConfirmDeleteModal = () => {
        setSelectedSectorId(null);
        setConfirmDeleteModal(false);
    };

    // Opciones para selects
    const estadosOptions = estados.map(e => ({
        value: String(e.id),
        label: e.nombre
    }));
    const municipiosOptions = municipios.map(m => ({
        value: String(m.id),
        label: m.nombre
    }));
    const parroquiasOptions = parroquias.map(p => ({
        value: String(p.id),
        label: p.nombre
    }));

    return (
        <div className={styles.ubicacionContainer}>
            {loading && <Spinner text="Procesando..." />}
            {notifications.map((notification) => (
                <Notification
                    key={notification.id}
                    message={notification.message}
                    type={notification.type}
                    onClose={() => removeNotification(notification.id)}
                />
            ))}

            {currentModal === 'sector' && (
                <div className='modalOverlay'>
                    <div className='modal_mono'>
                        <button className='closeButton' onClick={closeModal}>&times;</button>
                        <h2>{formData.id ? 'Editar Sector' : 'Registrar Sector'}</h2>
                        <form className='modalForm'>
                            <div>
                                <div className='formGroup'>
                                    <label htmlFor="nombre">Sector:</label>
                                    <input type="text" id="nombre" value={formData.nombre} onChange={handleInputChange} className='input' placeholder='Rellene el Campo'/>
                                    {errors.nombre && <span className='errorText'>{errors.nombre}</span>}
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="estado_id">Estado:</label>
                                    <SingleSelect
                                        options={estadosOptions}
                                        value={formData.estado_id}
                                        onChange={handleEstadoChange}
                                        placeholder="Seleccione un estado"
                                    />
                                    {errors.estado_id && <span className='errorText'>{errors.estado_id}</span>}
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="municipio_id">Municipio:</label>
                                    <SingleSelect
                                        options={municipiosOptions}
                                        value={formData.municipio_id}
                                        onChange={handleMunicipioChange}
                                        placeholder="Seleccione un municipio"
                                        isDisabled={!formData.estado_id || municipiosOptions.length === 0}
                                    />
                                    {errors.municipio_id && <span className='errorText'>{errors.municipio_id}</span>}
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="parroquia_id">Parroquia:</label>
                                    <SingleSelect
                                        options={parroquiasOptions}
                                        value={formData.parroquia_id}
                                        onChange={handleParroquiaChange}
                                        placeholder="Seleccione una parroquia"
                                        isDisabled={!formData.municipio_id || parroquiasOptions.length === 0}
                                    />
                                    {errors.parroquia_id && <span className='errorText'>{errors.parroquia_id}</span>}
                                </div>
                            </div>
                            <button 
                                type="button" 
                                className='saveButton' 
                                onClick={formData.id ? handleEdit : handleSave}
                                title={formData.id ? 'Actualizar Sector' : 'Registrar Sector'}>
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
                        <p>¿Estás seguro de que deseas eliminar este sector?</p>
                        <div className='modalActions'>
                            <button className='cancelButton' onClick={closeConfirmDeleteModal}>Cancelar</button>
                            <button className='confirmButton' onClick={() => { handleDelete(selectedSectorId); closeConfirmDeleteModal(); }}>Confirmar</button>
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
                        title='Registrar Sector'>
                        <img src={icon.plus} alt="Crear" className='icon' />
                        Agregar
                    </button>

                    <h2>Sectores</h2>

                    <div className='searchContainer'>
                        <SearchBar onSearch={handleSearch} />
                        <img src={icon.lupa} alt="Buscar" className='iconlupa' />
                    </div>
                </div>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>N°</th>
                            <th>Sector</th>
                            <th>Parroquia</th>
                            <th>Municipio</th>
                            <th>Estado</th>
                            <th>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentData.map((sector, idx) => (
                            <tr key={sector.id} >
                                <td>{indexOfFirstItem + idx + 1}</td>
                                <td>{sector.nombre}</td>
                                <td>{sector.parroquia_nombre}</td>
                                <td>{sector.municipio_nombre}</td>
                                <td>{sector.estado_nombre}</td>
                                <td>
                                    <div className={styles.iconContainer}>
                                        <img
                                            onClick={() => openEditModal(sector)}
                                            src={icon.editar}
                                            className='iconeditar'
                                            title='Editar'
                                        />
                                        <img 
                                            onClick={() => openConfirmDeleteModal(sector.id)} 
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

export default Sector;