import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './ubicacion.module.css';
import '../../main.css';
import icon from '../../components/iconos/iconos';
import { filterData } from '../../utils/filterData';
import SearchBar from "../../components/searchbart/SearchBar";
import Notification from '../../components/notification/Notification';
import { useNotification } from '../../utils/useNotification';
import { validateField, validationRules } from '../../utils/validation';
import Spinner from '../../components/spinner/Spinner';

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

    // --- Fetchers ---
    const fetchSectores = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:4000/sector', {
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
            });
            setDatosOriginales(response.data);
            setDatosFiltrados(response.data);
        } catch (error) {
            console.error('Error obteniendo sectores:', error);
            addNotification('Error al obtener sectores', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchEstados = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:4000/sector/estados/all', {
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
            });
            setEstados(response.data);
        } catch (error) {
            console.error('Error obteniendo estados:', error);
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
            const response = await axios.get('http://localhost:4000/sector/municipios/all', {
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
            });
            setMunicipios(response.data.filter(m => Number(m.estado_id) === Number(estadoId)));
        } catch (error) {
            console.error('Error obteniendo municipios:', error);
            addNotification('Error al obtener municipios', 'error');
        }finally{
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
            const response = await axios.get('http://localhost:4000/sector/parroquias/all', {
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
            });
            setParroquias(response.data.filter(p => Number(p.municipio_id) === Number(municipioId)));
        } catch (error) {
            console.error('Error obteniendo parroquias:', error);
            addNotification('Error al obtener parroquias', 'error');
        }setLoading(false);
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

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));

        if (id === 'estado_id') {
            setFormData(prev => ({ ...prev, estado_id: value, municipio_id: '', parroquia_id: '' }));
            fetchMunicipios(value);
            setParroquias([]);
        }
        if (id === 'municipio_id') {
            setFormData(prev => ({ ...prev, municipio_id: value, parroquia_id: '' }));
            fetchParroquias(value);
        }

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
                    return;
                }
            }
        }

        try {
            await axios.post('http://localhost:4000/sector', {
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
            console.error('Error creando Sector:', error);
            addNotification('Error al registrar sector', 'error');
        }finally{
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
                return;
            }
        }

        try {
            await axios.put(`http://localhost:4000/sector/${formData.id}`, {
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
            console.error('Error editando Sector:', error);
            addNotification('Error al actualizar sector', 'error');
        }finally{
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        setLoading(true);
        try {
            await axios.delete(`http://localhost:4000/sector/${id}`, {
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
            });

            fetchSectores();
            addNotification('Sector eliminado con éxito', 'error');
        } catch (error) {
            console.error('Error eliminando Sector:', error);
            addNotification('Error al eliminar sector', 'error');
        }setLoading(false);
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
                                    <input type="text" id="nombre" value={formData.nombre} onChange={handleChange} className='input' placeholder='Rellene el Campo'/>
                                    {errors.nombre && <span className='errorText'>{errors.nombre}</span>}
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="estado_id">Estado:</label>
                                    <select id="estado_id" value={formData.estado_id} onChange={handleChange} className='select'>
                                        <option value="">Seleccione un estado</option>
                                        {estados.map((estado) => (
                                            <option key={estado.id} value={estado.id}>{estado.nombre}</option>
                                        ))}
                                    </select>
                                    {errors.estado_id && <span className='errorText'>{errors.estado_id}</span>}
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="municipio_id">Municipio:</label>
                                    <select id="municipio_id" value={formData.municipio_id} onChange={handleChange} className='select'>
                                        <option value="">Seleccione un municipio</option>
                                        {municipios.map((municipio) => (
                                            <option key={municipio.id} value={municipio.id}>{municipio.nombre}</option>
                                        ))}
                                    </select>
                                    {errors.municipio_id && <span className='errorText'>{errors.municipio_id}</span>}
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="parroquia_id">Parroquia:</label>
                                    <select id="parroquia_id" value={formData.parroquia_id} onChange={handleChange} className='select'>
                                        <option value="">Seleccione una parroquia</option>
                                        {parroquias.map((parroquia) => (
                                            <option key={parroquia.id} value={parroquia.id}>{parroquia.nombre}</option>
                                        ))}
                                    </select>
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