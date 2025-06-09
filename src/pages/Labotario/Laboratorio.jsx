import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './laboratorios.module.css';
import '../../main.css';
import icon from '../../components/iconos/iconos';
import { filterData } from '../../utils/filterData';
import SearchBar from "../../components/searchbart/SearchBar";
import Notification from '../../components/notification/Notification';
import { useNotification } from '../../utils/useNotification';
import { validateField, validationRules } from '../../utils/validation';
import Spinner from '../../components/spinner/Spinner';


function Laboratorio() {
    const [datosOriginales, setDatosOriginales] = useState([]);
    const [datosFiltrados, setDatosFiltrados] = useState([]);
    const [tipos, setTipos] = useState([]);
    const [estados, setEstados] = useState([]);
    const [municipios, setMunicipios] = useState([]);
    const [parroquias, setParroquias] = useState([]);
    const [sectores, setSectores] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [currentModal, setCurrentModal] = useState(null);
    const [detalleModal, setDetalleModal] = useState({ abierto: false, laboratorio: null });
    const [formData, setFormData] = useState({
        id: '',
        nombre: '',
        descripcion: '',
        ubicación: '',
        tipo_laboratorio_id: '',
        estado_id: '',
        municipio_id: '',
        parroquia_id: '',
        sector_id: ''
    });
    const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);
    const [selectedLabId, setSelectedLabId] = useState(null);

    const { notifications, addNotification, removeNotification } = useNotification();
    const itemsPerPage = 8;
    const [errors, setErrors] = useState({});

    
    const fetchLaboratorios = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:4000/laboratorio', {
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
            });
            setDatosOriginales(response.data);
            setDatosFiltrados(response.data);
        } catch (error) {
            console.error('Error obteniendo todos los datos de los laboratorios',error);
            addNotification('Error al obtener laboratorios', 'error');
        }finally{
            setLoading(false);
        }
    };

    const fetchTipos = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:4000/laboratorio/tipos/all', {
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
            });
            setTipos(response.data);
        } catch (error) {
            console.error('Error obteniendo todo los tipos de laboratorios',error);
            addNotification('Error al obtener tipos de laboratorio', 'error');
        }finally{
            setLoading(false);
        }
    };

    const fetchEstados = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:4000/laboratorio/estados/all', {
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
            });
            setEstados(response.data);
        } catch (error) {
            console.error('Error obteniendo todos los estados',error);
            addNotification('Error al obtener estados', 'error');
        }finally{
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
            const response = await axios.get('http://localhost:4000/laboratorio/municipios/all', {
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
            });
            setMunicipios(response.data.filter(m => Number(m.estado_id) === Number(estadoId)));
        } catch (error) {
            console.error('Error obteniendo todos los municipios',error);
            addNotification('Error al obtener municipios', 'error');
        }setLoading(false);
    };

    const fetchParroquias = async (municipioId) => {
        setLoading(true);
        try {
            if (!municipioId) {
                setParroquias([]);
                return;
            }
            const response = await axios.get('http://localhost:4000/laboratorio/parroquias/all', {
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
            });
            setParroquias(response.data.filter(p => Number(p.municipio_id) === Number(municipioId)));
        } catch (error) {
            console.error('Error obteniendo todos las parroquias',error);
            addNotification('Error al obtener parroquias', 'error');
        }finally{
            setLoading(false);
        }
    };

    const fetchSectores = async (parroquiaId) => {
        setLoading(true);
        try {
            if (!parroquiaId) {
                setSectores([]);
                return;
            }
            const response = await axios.get('http://localhost:4000/laboratorio/sectores/all', {
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
            });
            setSectores(response.data.filter(s => Number(s.parroquia_id) === Number(parroquiaId)));
        } catch (error) {
            console.error('Error obteniendo todos los sectores',error);
            addNotification('Error al obtener sectores', 'error');
        }finally{
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLaboratorios();
        fetchTipos();
        fetchEstados();
    }, []);

    
    const resetFormData = () => {
        setFormData({
            id: '',
            nombre: '',
            descripcion: '',
            ubicación: '',
            tipo_laboratorio_id: '',
            estado_id: '',
            municipio_id: '',
            parroquia_id: '',
            sector_id: ''
        });
        setMunicipios([]);
        setParroquias([]);
        setSectores([]);
    };

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));

        if (id === 'estado_id') {
            setFormData(prev => ({
                ...prev,
                estado_id: value,
                municipio_id: '',
                parroquia_id: '',
                sector_id: ''
            }));
            fetchMunicipios(value);
            setParroquias([]);
            setSectores([]);
        }
        if (id === 'municipio_id') {
            setFormData(prev => ({
                ...prev,
                municipio_id: value,
                parroquia_id: '',
                sector_id: ''
            }));
            fetchParroquias(value);
            setSectores([]);
        }
        if (id === 'parroquia_id') {
            setFormData(prev => ({
                ...prev,
                parroquia_id: value,
                sector_id: ''
            }));
            fetchSectores(value);
        }

        if (validationRules[id]) {
            const { regex, errorMessage } = validationRules[id];
            const { valid, message } = validateField(value, regex, errorMessage);
            setErrors(prev => ({ ...prev, [id]: valid ? '' : message }));
        }
    };

    const handleSearch = (searchTerm) => {
        const filtered = filterData(datosOriginales, searchTerm, [
            'id','nombre','descripcion','ubicación','tipo_laboratorio_nombre','sector_nombre','parroquia_nombre','municipio_nombre','estado_nombre'
        ]);
        setDatosFiltrados(filtered);
    };

    const handleSave = async () => {
        setLoading(true);
        for (const field of ['nombre', 'tipo_laboratorio_id', 'sector_id']) {
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
            await axios.post('http://localhost:4000/laboratorio', {
                nombre: formData.nombre,
                descripcion: formData.descripcion,
                ubicación: formData.ubicación,
                tipo_laboratorio_id: formData.tipo_laboratorio_id,
                sector_id: formData.sector_id
            }, {
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
            });
            addNotification('Laboratorio registrado con éxito', 'success');
            fetchLaboratorios();
            closeModal();
        } catch (error) {
            console.error('Error al registrar el laboratorio',error);
            addNotification('Error al registrar laboratorio', 'error');
        }finally{
            setLoading(false);
        }
    };

    const handleEdit = async () => {
        setLoading(true);
        for (const field of ['nombre', 'tipo_laboratorio_id', 'sector_id']) {
            if (!validationRules[field]) continue;
            const { regex, errorMessage } = validationRules[field];
            const { valid, message } = validateField(formData[field], regex, errorMessage);
            if (!valid) {
                addNotification(message, 'warning');
                return;
            }
        }

        try {
            await axios.put(`http://localhost:4000/laboratorio/${formData.id}`, {
                nombre: formData.nombre,
                descripcion: formData.descripcion,
                ubicación: formData.ubicación,
                tipo_laboratorio_id: formData.tipo_laboratorio_id,
                sector_id: formData.sector_id
            }, {
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
            });
            addNotification('Laboratorio actualizado con éxito', 'success');
            fetchLaboratorios();
            closeModal();
        } catch (error) {
            console.error('Error al actualizar laboratorio',error);
            addNotification('Error al actualizar laboratorio', 'error');
        }finally{
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        setLoading(true);
        try {
            await axios.delete(`http://localhost:4000/laboratorio/${id}`, {
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
            });

            fetchLaboratorios();
            addNotification('Laboratorio eliminado con éxito', 'error');
        } catch (error) {
            console.error('Error al eliminar el laboratorio',error);
            addNotification('Error al eliminar laboratorio', 'error');
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
        setCurrentModal('laboratorio');
    };

    const closeModal = () => setCurrentModal(null);

    const openEditModal = (lab) => {
        setFormData({
            id: lab.id,
            nombre: lab.nombre || '',
            descripcion: lab.descripcion || '',
            ubicación: lab.ubicación || '',
            tipo_laboratorio_id: lab.tipo_laboratorio_id || '',
            estado_id: lab.estado_id || '',
            municipio_id: lab.municipio_id || '',
            parroquia_id: lab.parroquia_id || '',
            sector_id: lab.sector_id || ''
        });
        fetchMunicipios(lab.estado_id);
        fetchParroquias(lab.municipio_id);
        fetchSectores(lab.parroquia_id);
        setCurrentModal('laboratorio');
    };

    const openConfirmDeleteModal = (id) => {
        setSelectedLabId(id);
        setConfirmDeleteModal(true);
    };
    const closeConfirmDeleteModal = () => {
        setSelectedLabId(null);
        setConfirmDeleteModal(false);
    };

    const openDetalleModal = (lab) => setDetalleModal({ abierto: true, laboratorio: lab });
    const closeDetalleModal = () => setDetalleModal({ abierto: false, laboratorio: null });

    return (
        <div className={styles.laboratorioContainer}>
            {loading && <Spinner text="Procesando..." />}
            {notifications.map((notification) => (
                <Notification
                    key={notification.id}
                    message={notification.message}
                    type={notification.type}
                    onClose={() => removeNotification(notification.id)}
                />
            ))}

            {detalleModal.abierto && (
                <div className='modalOverlay'>
                    <div className='modalDetalle'>
                        <button className='closeButton' onClick={closeDetalleModal}>&times;</button>
                        <h2>Detalles del Laboratorio</h2>
                        <table className='detalleTable'>
                            <tbody>
                                <tr>
                                    <th>Nombre</th>
                                    <td>{detalleModal.laboratorio.nombre}</td>
                                </tr>
                                <tr>
                                    <th>Descripción</th>
                                    <td>{detalleModal.laboratorio.descripcion}</td>
                                </tr>
                                <tr>
                                    <th>Ubicación</th>
                                    <td>{detalleModal.laboratorio.ubicación}</td>
                                </tr>
                                <tr>
                                    <th>Tipo de Laboratorio</th>
                                    <td>{detalleModal.laboratorio.tipo_laboratorio_nombre}</td>
                                </tr>
                                <tr>
                                    <th>Sector</th>
                                    <td>{detalleModal.laboratorio.sector_nombre}</td>
                                </tr>
                                <tr>
                                    <th>Parroquia</th>
                                    <td>{detalleModal.laboratorio.parroquia_nombre}</td>
                                </tr>
                                <tr>
                                    <th>Municipio</th>
                                    <td>{detalleModal.laboratorio.municipio_nombre}</td>
                                </tr>
                                <tr>
                                    <th>Estado</th>
                                    <td>{detalleModal.laboratorio.estado_nombre}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {currentModal === 'laboratorio' && (
                <div className='modalOverlay'>
                    <div className='modal'>
                        <button className='closeButton' onClick={closeModal}>&times;</button>
                        <h2>{formData.id ? 'Editar Laboratorio' : 'Registrar Laboratorio'}</h2>
                        <form className='modalForm'>
                            <div className={styles.formColumns}>
                                <div className='formGroup'>
                                    <label htmlFor="nombre">Nombre:</label>
                                    <input type="text" id="nombre" value={formData.nombre} onChange={handleChange} className='input' placeholder='Nombre del laboratorio'/>
                                    {errors.nombre && <span className='errorText'>{errors.nombre}</span>}
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="ubicación">Ubicación:</label>
                                    <input type="text" id="ubicación" value={formData.ubicación} onChange={handleChange} className='input' placeholder='Ubicación'/>
                                    {errors.ubicación && <span className='errorText'>{errors.ubicación}</span>}
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="tipo_laboratorio_id">Tipo de laboratorio:</label>
                                    <select id="tipo_laboratorio_id" value={formData.tipo_laboratorio_id} onChange={handleChange} className='select'>
                                        <option value="">Seleccione un tipo</option>
                                        {tipos.map((tipo) => (
                                            <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>
                                        ))}
                                    </select>
                                    {errors.tipo_laboratorio_id && <span className='errorText'>{errors.tipo_laboratorio_id}</span>}
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
                                <div className='formGroup'>
                                    <label htmlFor="sector_id">Sector:</label>
                                    <select id="sector_id" value={formData.sector_id} onChange={handleChange} className='select'>
                                        <option value="">Seleccione un sector</option>
                                        {sectores.map((sector) => (
                                            <option key={sector.id} value={sector.id}>{sector.nombre}</option>
                                        ))}
                                    </select>
                                    {errors.sector_id && <span className='errorText'>{errors.sector_id}</span>}
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="descripcion">Descripción:</label>
                                    <textarea id="descripcion" value={formData.descripcion} onChange={handleChange} className='input' placeholder='Descripción'/>
                                    {errors.descripcion && <span className='errorText'>{errors.descripcion}</span>}
                                </div>
                            </div>
                            <button 
                                type="button" 
                                className='saveButton' 
                                onClick={formData.id ? handleEdit : handleSave}
                                title={formData.id ? 'Actualizar Laboratorio' : 'Registrar Laboratorio'}>
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
                        <p>¿Estás seguro de que deseas eliminar este laboratorio?</p>
                        <div className='modalActions'>
                            <button className='cancelButton' onClick={closeConfirmDeleteModal}>Cancelar</button>
                            <button className='confirmButton' onClick={() => { handleDelete(selectedLabId); closeConfirmDeleteModal(); }}>Confirmar</button>
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
                        title='Registrar Laboratorio'>
                        <img src={icon.plus} alt="Crear" className='icon' />
                        Agregar
                    </button>

                    <h2>Laboratorios</h2>

                    <div className='searchContainer'>
                        <SearchBar onSearch={handleSearch} />
                        <img src={icon.lupa} alt="Buscar" className='iconlupa' />
                    </div>
                </div>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>N°</th>
                            <th>Nombre</th>
                            <th>Ubicación</th>
                            {/* <th>Tipo de Laboratorio</th> */}
                            <th>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentData.map((lab, idx) => (
                            <tr key={lab.id} >
                                <td>{indexOfFirstItem + idx + 1}</td>
                                <td>{lab.nombre}</td>
                                <td>{lab.ubicación} </td>
                                {/* <td>{lab.tipo_laboratorio_nombre}</td> */}
                                <td>
                                    <div className={styles.iconContainer}>
                                        <img
                                            onClick={() => openDetalleModal(lab)}
                                            src={icon.ver}
                                            className='iconver'
                                            title='Ver más'
                                            style={{ cursor: 'pointer' }}
                                        />
                                        <img
                                            onClick={() => openEditModal(lab)}
                                            src={icon.editar}
                                            className='iconeditar'
                                            title='Editar'
                                        />
                                        <img 
                                            onClick={() => openConfirmDeleteModal(lab.id)} 
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

export default Laboratorio;