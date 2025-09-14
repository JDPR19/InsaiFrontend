import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../main.css';
import icon from '../../components/iconos/iconos';
import { filterData } from '../../utils/filterData';
import SearchBar from "../../components/searchbart/SearchBar";
import { useNotification } from '../../utils/NotificationContext';
import { validateField, getValidationRule } from '../../utils/validation';
import Spinner from '../../components/spinner/Spinner';
import SingleSelect from '../../components/selectmulti/SingleSelect';
import { BaseUrl } from '../../utils/constans';

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
        tipo_laboratorio_id: null,
        estado_id: '',
        municipio_id: null,
        parroquia_id: null,
        sector_id: null
    });
    const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);
    const [selectedLabId, setSelectedLabId] = useState(null);
    const { addNotification } = useNotification();
    const itemsPerPage = 8;
    const [errors, setErrors] = useState({});

    // Opciones para selects
    const tiposOptions = tipos.map(t => ({ value: String(t.id), label: t.nombre }));
    const estadosOptions = estados.map(e => ({ value: String(e.id), label: e.nombre }));
    const municipiosOptions = municipios.map(m => ({ value: String(m.id), label: m.nombre }));
    const parroquiasOptions = parroquias.map(p => ({ value: String(p.id), label: p.nombre }));
    const sectoresOptions = sectores.map(s => ({ value: String(s.id), label: s.nombre }));

    const fetchLaboratorios = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${BaseUrl}/laboratorio`, {
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
            });
            setDatosOriginales(response.data);
            setDatosFiltrados(response.data);
        } catch (error) {
            console.error('Error obteniendo todos los datos de los laboratorios', error);
            addNotification('Error al obtener laboratorios', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchTipos = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${BaseUrl}/laboratorio/tipos/all`, {
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
            });
            setTipos(response.data);
        } catch (error) {
            console.error('Error obteniendo todos los tipos de laboratorios', error);
            addNotification('Error al obtener tipos de laboratorio', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchEstados = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${BaseUrl}/laboratorio/estados/all`, {
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
            });
            setEstados(response.data);
        } catch (error) {
            console.error('Error obteniendo todos los estados', error);
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
            const response = await axios.get(`${BaseUrl}/laboratorio/municipios/all`, {
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
            });
            setMunicipios(response.data.filter(m => Number(m.estado_id) === Number(estadoId)));
        } catch (error) {
            console.error('Error obteniendo todos los municipios', error);
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
            const response = await axios.get(`${BaseUrl}/laboratorio/parroquias/all`, {
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
            });
            setParroquias(response.data.filter(p => Number(p.municipio_id) === Number(municipioId)));
        } catch (error) {
            console.error('Error obteniendo todas las parroquias', error);
            addNotification('Error al obtener parroquias', 'error');
        } finally {
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
            const response = await axios.get(`${BaseUrl}/laboratorio/sectores/all`, {
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
            });
            setSectores(response.data.filter(s => Number(s.parroquia_id) === Number(parroquiaId)));
        } catch (error) {
            console.error('Error obteniendo todos los sectores', error);
            addNotification('Error al obtener sectores', 'error');
        } finally {
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
            tipo_laboratorio_id: null,
            estado_id: null,
            municipio_id: null,
            parroquia_id: null,
            sector_id: null
        });
        setMunicipios([]);
        setParroquias([]);
        setSectores([]);
    };

    // Handlers para selects dependientes
    const handleEstadoChange = (val) => {
        setFormData(prev => ({
            ...prev,
            estado_id: val,
            municipio_id: null,
            parroquia_id: null,
            sector_id: null
        }));
        if (val) {
            fetchMunicipios(val.value);
            setParroquias([]);
            setSectores([]);
        } else {
            setMunicipios([]);
            setParroquias([]);
            setSectores([]);
        }
    };

    const handleMunicipioChange = (val) => {
        setFormData(prev => ({
            ...prev,
            municipio_id: val,
            parroquia_id: null,
            sector_id: null
        }));
        if (val) {
            fetchParroquias(val.value);
            setSectores([]);
        } else {
            setParroquias([]);
            setSectores([]);
        }
    };

    const handleParroquiaChange = (val) => {
        setFormData(prev => ({
            ...prev,
            parroquia_id: val,
            sector_id: null
        }));
        if (val) {
            fetchSectores(val.value);
        } else {
            setSectores([]);
        }
    };

    const handleSectorChange = (val) => {
        setFormData(prev => ({
            ...prev,
            sector_id: val
        }));
    };

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));

        // Validación universal usando getValidationRule
        const rule = getValidationRule(id);
        if (rule && rule.regex) {
            const { regex, errorMessage } = rule;
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
        if (!formData.tipo_laboratorio_id || !formData.tipo_laboratorio_id.value) {
            addNotification('Debe seleccionar un tipo de laboratorio', 'warning');
            return;
        }
        if (!formData.estado_id || !formData.estado_id.value) {
            addNotification('Debe seleccionar un estado', 'warning');
            return;
        }
        if (!formData.municipio_id || !formData.municipio_id.value) {
            addNotification('Debe seleccionar un municipio', 'warning');
            return;
        }
        if (!formData.parroquia_id || !formData.parroquia_id.value) {
            addNotification('Debe seleccionar una parroquia', 'warning');
            return;
        }
        if (!formData.sector_id || !formData.sector_id.value) {
            addNotification('Debe seleccionar un sector', 'warning');
            return;
        }
        for (const field in formData) {
            const rule = getValidationRule(field);
            if (!rule || !rule.regex) continue;
            const { regex, errorMessage } = rule;
            const { valid, message } = validateField(formData[field], regex, errorMessage);
            if (!valid) {
                addNotification(message, 'warning');
                setErrors(prev => ({ ...prev, [field]: message }));
                setLoading(false);
                return;
            }
        }
        setLoading(true);

        try {
            await axios.post(`${BaseUrl}/laboratorio`, {
                nombre: formData.nombre,
                descripcion: formData.descripcion,
                ubicación: formData.ubicación,
                tipo_laboratorio_id: formData.tipo_laboratorio_id?.value || '',
                sector_id: formData.sector_id?.value || ''
            }, {
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
            });
            addNotification('Laboratorio registrado con éxito', 'success');
            fetchLaboratorios();
            closeModal();
        } catch (error) {
            console.error('Error al registrar el laboratorio', error);
            addNotification('Error al registrar laboratorio', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async () => {
        if (!formData.tipo_laboratorio_id || !formData.tipo_laboratorio_id.value) {
            addNotification('Debe seleccionar un tipo de laboratorio', 'warning');
            return;
        }
        if (!formData.estado_id || !formData.estado_id.value) {
            addNotification('Debe seleccionar un estado', 'warning');
            return;
        }
        if (!formData.municipio_id || !formData.municipio_id.value) {
            addNotification('Debe seleccionar un municipio', 'warning');
            return;
        }
        if (!formData.parroquia_id || !formData.parroquia_id.value) {
            addNotification('Debe seleccionar una parroquia', 'warning');
            return;
        }
        if (!formData.sector_id || !formData.sector_id.value) {
            addNotification('Debe seleccionar un sector', 'warning');
            return;
        }
        for (const field in formData) {
            const rule = getValidationRule(field);
            if (!rule || !rule.regex) continue;
            const { regex, errorMessage } = rule;
            const { valid, message } = validateField(formData[field], regex, errorMessage);
            if (!valid) {
                addNotification(message, 'warning');
                setErrors(prev => ({ ...prev, [field]: message }));
                setLoading(false);
                return;
            }
        }
        setLoading(true);
        try {
            await axios.put(`${BaseUrl}/laboratorio/${formData.id}`, {
                nombre: formData.nombre,
                descripcion: formData.descripcion,
                ubicación: formData.ubicación,
                tipo_laboratorio_id: formData.tipo_laboratorio_id?.value || '',
                sector_id: formData.sector_id?.value || ''
            }, {
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
            });
            addNotification('Laboratorio actualizado con éxito', 'success');
            fetchLaboratorios();
            closeModal();
        } catch (error) {
            console.error('Error al actualizar laboratorio', error);
            addNotification('Error al actualizar laboratorio', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        setLoading(true);
        try {
            await axios.delete(`${BaseUrl}/laboratorio/${id}`, {
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
            });

            fetchLaboratorios();
            addNotification('Laboratorio eliminado con éxito', 'success');
        } catch (error) {
            console.error('Error al eliminar el laboratorio', error);
            addNotification('Error al eliminar laboratorio', 'error');
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
        setCurrentModal('laboratorio');
    };

    const closeModal = () => setCurrentModal(null);

    const openEditModal = (lab) => {
        setFormData({
            id: lab.id,
            nombre: lab.nombre || '',
            descripcion: lab.descripcion || '',
            ubicación: lab.ubicación || '',
            tipo_laboratorio_id: tiposOptions.find(opt => String(opt.value) === String(lab.tipo_laboratorio_id)) || null,
            estado_id: estadosOptions.find(opt => String(opt.value) === String(lab.estado_id)) || null,
            municipio_id: municipiosOptions.find(opt => String(opt.value) === String(lab.municipio_id)) || null,
            parroquia_id: parroquiasOptions.find(opt => String(opt.value) === String(lab.parroquia_id)) || null,
            sector_id: sectoresOptions.find(opt => String(opt.value) === String(lab.sector_id)) || null
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
        <div className='mainContainer'>
            {loading && <Spinner text="Procesando..." />}
            {detalleModal.abierto && detalleModal.laboratorio && (
                <div className='modalOverlay'>
                    <div className='modal'>
                        <button className='closeButton' onClick={closeDetalleModal}>&times;</button>
                        <h2>Detalles del Laboratorio</h2>
                        <form className='modalForm'>
                            <div className='formColumns'>
                                <div className='formGroup'>
                                    <label htmlFor="nombre">Nombre:</label>
                                    <input
                                        type="text"
                                        id="nombre"
                                        value={detalleModal.laboratorio.nombre || ''}
                                        className='input'
                                        disabled
                                    />
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="ubicación">Ubicación:</label>
                                    <input
                                        type="text"
                                        id="ubicación"
                                        value={detalleModal.laboratorio.ubicación || ''}
                                        className='input'
                                        disabled
                                    />
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="tipo_laboratorio_id">Tipo de laboratorio:</label>
                                    <SingleSelect
                                        options={tiposOptions}
                                        value={tiposOptions.find(opt => String(opt.value) === String(detalleModal.laboratorio.tipo_laboratorio_id)) || null}
                                        isDisabled={true}
                                    />
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="estado_id">Estado:</label>
                                    <SingleSelect
                                        options={estadosOptions}
                                        value={estadosOptions.find(opt => String(opt.value) === String(detalleModal.laboratorio.estado_id)) || null}
                                        isDisabled={true}
                                    />
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="municipio_id">Municipio:</label>
                                    <SingleSelect
                                        options={municipiosOptions}
                                        value={municipiosOptions.find(opt => String(opt.value) === String(detalleModal.laboratorio.municipio_id)) || null}
                                        isDisabled={true}
                                    />
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="parroquia_id">Parroquia:</label>
                                    <SingleSelect
                                        options={parroquiasOptions}
                                        value={parroquiasOptions.find(opt => String(opt.value) === String(detalleModal.laboratorio.parroquia_id)) || null}
                                        isDisabled={true}
                                    />
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="sector_id">Sector:</label>
                                    <SingleSelect
                                        options={sectoresOptions}
                                        value={sectoresOptions.find(opt => String(opt.value) === String(detalleModal.laboratorio.sector_id)) || null}
                                        isDisabled={true}
                                    />
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="descripcion">Descripción:</label>
                                    <textarea
                                        id="descripcion"
                                        value={detalleModal.laboratorio.descripcion || ''}
                                        className='textarea'
                                        disabled
                                    />
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {currentModal === 'laboratorio' && (
                <div className='modalOverlay'>
                    <div className='modal'>
                        <button className='closeButton' onClick={closeModal}>&times;</button>
                        <h2>{formData.id ? 'Editar Laboratorio' : 'Registrar Laboratorio'}</h2>
                        <form className='modalForm'>
                            <div className='formColumns'>
                                <div className='formGroup'>
                                    <label htmlFor="nombre"><span className='Unique' title='Campo Obligatorio'>*</span>Nombre:</label>
                                    <input type="text" id="nombre" value={formData.nombre} onChange={handleChange} className='input' placeholder='Nombre del laboratorio'/>
                                    {errors.nombre && <span className='errorText'>{errors.nombre}</span>}
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="ubicación"><span className='Unique' title='Campo Obligatorio'>*</span>Ubicación:</label>
                                    <input type="text" id="ubicación" value={formData.ubicación} onChange={handleChange} className='input' placeholder='Ubicación'/>
                                    {errors.ubicación && <span className='errorText'>{errors.ubicación}</span>}
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="tipo_laboratorio_id"><span className='Unique' title='Campo Obligatorio'>*</span>Tipo de laboratorio:</label>
                                    <SingleSelect
                                        options={tiposOptions}
                                        value={formData.tipo_laboratorio_id}
                                        onChange={val => setFormData(prev => ({ ...prev, tipo_laboratorio_id: val }))}
                                        placeholder="Seleccione un tipo"
                                    />
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="estado_id"><span className='Unique' title='Campo Obligatorio'>*</span>Estado:</label>
                                    <SingleSelect
                                        options={estadosOptions}
                                        value={formData.estado_id}
                                        onChange={handleEstadoChange}
                                        placeholder="Seleccione un estado"
                                    />
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="municipio_id"><span className='Unique' title='Campo Obligatorio'>*</span>Municipio:</label>
                                    <SingleSelect
                                        options={municipiosOptions}
                                        value={formData.municipio_id}
                                        onChange={handleMunicipioChange}
                                        placeholder="Seleccione un municipio"
                                        isDisabled={!formData.estado_id || municipiosOptions.length === 0}
                                    />
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="parroquia_id"><span className='Unique' title='Campo Obligatorio'>*</span>Parroquia:</label>
                                    <SingleSelect
                                        options={parroquiasOptions}
                                        value={formData.parroquia_id}
                                        onChange={handleParroquiaChange}
                                        placeholder="Seleccione una parroquia"
                                        isDisabled={!formData.municipio_id || parroquiasOptions.length === 0}
                                    />
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="sector_id"><span className='Unique' title='Campo Obligatorio'>*</span>Sector:</label>
                                    <SingleSelect
                                        options={sectoresOptions}
                                        value={formData.sector_id}
                                        onChange={handleSectorChange}
                                        placeholder="Seleccione un sector"
                                        isDisabled={!formData.parroquia_id || sectoresOptions.length === 0}
                                    />
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="descripcion">Descripción:</label>
                                    <textarea id="descripcion" value={formData.descripcion} onChange={handleChange} className='textarea' placeholder='Descripción'/>
                                </div>
                            </div>
                            <button 
                                type="button" 
                                className='saveButton' 
                                onClick={formData.id ? handleEdit : handleSave}
                                title={formData.id ? 'Actualizar Laboratorio' : 'Registrar Laboratorio'}
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
                <table className='table'>
                    <thead>
                        <tr>
                            <th>N°</th>
                            <th>Nombre</th>
                            <th>Ubicación</th>
                            <th>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentData.map((lab, idx) => (
                            <tr key={lab.id} >
                                <td>{indexOfFirstItem + idx + 1}</td>
                                <td>{lab.nombre}</td>
                                <td>{lab.ubicación} </td>
                                <td>
                                    <div className='iconContainer'>
                                        <img
                                            onClick={() => openDetalleModal(lab)}
                                            src={icon.ver}
                                            className='iconver'
                                            title='Ver más'
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