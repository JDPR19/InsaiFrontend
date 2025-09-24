import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../main.css';
import icon from '../../components/iconos/iconos';
import { filterData } from '../../utils/filterData';
import SearchBar from "../../components/searchbart/SearchBar";
import { useNotification } from '../../utils/NotificationContext';
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
        estado_id: null,
        municipio_id: null,
        parroquia_id: null,
        codigo: '' 
    });
    const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);
    const [selectedSectorId, setSelectedSectorId] = useState(null);
    const { addNotification } = useNotification();
    const itemsPerPage = 8;
    const [errors, setErrors] = useState({});

    const fetchSectores = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${BaseUrl}/sector`, {
                headers: { Authorization : `Bearer ${localStorage.getItem('token')}` }
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
                headers: { Authorization : `Bearer ${localStorage.getItem('token')}` }
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
                headers: { Authorization : `Bearer ${localStorage.getItem('token')}` }
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
                headers: { Authorization : `Bearer ${localStorage.getItem('token')}` }
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
            estado_id: null,
            municipio_id: null,
            parroquia_id: null,
            codigo: ''
        });
        setMunicipios([]);
        setParroquias([]);
        setErrors({});
    };

    // Handlers para selects dependientes
    const handleEstadoChange = (val) => {
        setFormData(prev => ({
            ...prev,
            estado_id: val,
            municipio_id: null,
            parroquia_id: null
        }));
        if (val) {
            fetchMunicipios(val.value);
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
            parroquia_id: null
        }));
        if (val) {
            fetchParroquias(val.value);
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

        if (id === 'codigo') {
            const onlyDigits = value.replace(/\D/g, '').slice(0, 3);
            setFormData(prev => ({ ...prev, codigo: onlyDigits }));
            const isValid = onlyDigits === '' || /^\d{3}$/.test(onlyDigits);
            setErrors(prev => ({ ...prev, codigo: isValid ? '' : 'El código debe tener 3 dígitos (ej: 001)' }));
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
        const filtered = filterData(datosOriginales, searchTerm, [
            'id','nombre','codigo','parroquia_nombre','parroquia_codigo','municipio_nombre','municipio_codigo','estado_nombre','estado_codigo'
        ]);
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
        if (!formData.parroquia_id || !formData.parroquia_id.value) {
            addNotification('Debe seleccionar una parroquia', 'warning');
            return;
        }
        if (!formData.nombre?.trim()) {
            addNotification('El nombre es obligatorio', 'warning');
            return;
        }
        if (formData.codigo && !/^\d{3}$/.test(formData.codigo)) {
            addNotification('El código debe tener 3 dígitos (ej: 001)', 'warning');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                nombre: formData.nombre.trim(),
                parroquia_id: formData.parroquia_id?.value || ''
            };
            if (formData.codigo) {
                payload.codigo = String(formData.codigo).padStart(3, '0');
            }

            await axios.post(`${BaseUrl}/sector`, payload, {
                headers: { Authorization : `Bearer ${localStorage.getItem('token')}` }
            });
            addNotification('Sector registrado con éxito', 'success');
            fetchSectores();
            closeModal();
        } catch (error) {
            console.error('error registrando sector',error);
            if (error?.response?.status === 409) {
                addNotification('Nombre o código ya existen en la parroquia', 'error');
            } else {
                addNotification('Error al registrar sector', 'error');
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
        if (!formData.parroquia_id || !formData.parroquia_id.value) {
            addNotification('Debe seleccionar una parroquia', 'warning');
            return;
        }
        if (!formData.nombre?.trim()) {
            addNotification('El nombre es obligatorio', 'warning');
            return;
        }
        if (formData.codigo && !/^\d{3}$/.test(formData.codigo)) {
            addNotification('El código debe tener 3 dígitos (ej: 001)', 'warning');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                nombre: formData.nombre.trim(),
                parroquia_id: formData.parroquia_id?.value || ''
            };
            if (formData.codigo !== '') {
                payload.codigo = String(formData.codigo).padStart(3, '0');
            }

            await axios.put(`${BaseUrl}/sector/${formData.id}`, payload, {
                headers: { Authorization : `Bearer ${localStorage.getItem('token')}` }
            });
            addNotification('Sector actualizado con éxito', 'success');
            fetchSectores();
            closeModal();
        } catch (error) {
            console.error('error actualizando sector',error);
            if (error?.response?.status === 409) {
                addNotification('Nombre o código ya existen en la parroquia', 'error');
            } else {
                addNotification('Error al actualizar sector', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        setLoading(true);
        try {
            await axios.delete(`${BaseUrl}/sector/${id}`, {
                headers: { Authorization : `Bearer ${localStorage.getItem('token')}` }
            });

            fetchSectores();
            addNotification('Sector eliminado con éxito', 'success');
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
        const estadoObj = sector.estado_id
            ? { value: String(sector.estado_id), label: estados.find(e => String(e.id) === String(sector.estado_id))?.nombre || '' }
            : null;
        const municipioObj = sector.municipio_id
            ? { value: String(sector.municipio_id), label: municipios.find(m => String(m.id) === String(sector.municipio_id))?.nombre || '' }
            : null;
        const parroquiaObj = sector.parroquia_id
            ? { value: String(sector.parroquia_id), label: parroquias.find(p => String(p.id) === String(sector.parroquia_id))?.nombre || '' }
            : null;

        setFormData({
            id: sector.id,
            nombre: sector.nombre || '',
            estado_id: estadoObj,
            municipio_id: municipioObj,
            parroquia_id: parroquiaObj,
            codigo: sector.codigo || ''
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
        <div className='mainContainer'>
            {loading && <Spinner text="Procesando..." />}
            {currentModal === 'sector' && (
                <div className='modalOverlay'>
                    <div className='modal'>
                        <button className='closeButton' onClick={closeModal}>&times;</button>
                        <h2>{formData.id ? 'Editar Sector' : 'Registrar Sector'}</h2>
                        <form className='modalForm'>
                            <div className='formColumns'>
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
                                    <label htmlFor="nombre"><span className='Unique' title='Campo Obligatorio'>*</span>Sector:</label>
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
                                    <label htmlFor="codigo">Código (UBIGEO 3 dígitos):</label>
                                    <input
                                        type="text"
                                        id="codigo"
                                        value={formData.codigo}
                                        onChange={handleInputChange}
                                        className='input'
                                        placeholder='Ej: 001 (vacío para autogenerar)'
                                        maxLength={3}
                                        inputMode="numeric"
                                    />
                                    {errors.codigo && <span className='errorText'>{errors.codigo}</span>}
                                </div>
                            </div>
                            <button 
                                type="button" 
                                className='saveButton' 
                                onClick={formData.id ? handleEdit : handleSave}
                                title={formData.id ? 'Actualizar Sector' : 'Registrar Sector'}
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
                <table className='table'>
                    <thead>
                        <tr>
                            <th>N°</th>
                            <th>Código</th>
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
                                <td>{sector.codigo}</td>
                                <td>{sector.nombre}</td>
                                <td>{sector.parroquia_nombre}</td>
                                <td>{sector.municipio_nombre}</td>
                                <td>{sector.estado_nombre}</td>
                                <td>
                                    <div className='iconContainer'>
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