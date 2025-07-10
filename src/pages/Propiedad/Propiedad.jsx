import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MultiSelect from '../../components/selectmulti/MultiSelect';
import SingleSelect from '../../components/selectmulti/SingleSelect';
import styles from './propiedad.module.css';
import '../../main.css';
import icon from '../../components/iconos/iconos';
import { filterData } from '../../utils/filterData';
import SearchBar from "../../components/searchbart/SearchBar";
import Notification from '../../components/notification/Notification';
import { useNotification } from '../../utils/useNotification';
import Spinner from '../../components/spinner/Spinner';
import { BaseUrl } from '../../utils/constans';

function Propiedad() {
    const [datosOriginales, setDatosOriginales] = useState([]);
    const [datosFiltrados, setDatosFiltrados] = useState([]);
    const [cultivos, setCultivos] = useState([]);
    const [tipos, setTipos] = useState([]);
    const [estados, setEstados] = useState([]);
    const [municipios, setMunicipios] = useState([]);
    const [parroquias, setParroquias] = useState([]);
    const [sectores, setSectores] = useState([]);
    const [productores, setProductores] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [currentModal, setCurrentModal] = useState(null);
    const [loading, setLoading] = useState(false);
    const [detalleModal, setDetalleModal] = useState({ abierto: false, propiedad: null });
    const [formData, setFormData] = useState({
        id: '',
        rif: '',
        nombre: '',
        c_cultivo: '',
        hectareas: '',
        sitios_asociados: '',
        ubicación: '',
        posee_certificado: 'NO',
        cultivos_ids: [],
        tipo_propiedad_id: '',
        estado_id: '',
        municipio_id: '',
        parroquia_id: '',
        sector_id: '',
        productor_id: ''
    });
    const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);
    const [selectedPropiedadId, setSelectedPropiedadId] = useState(null);

    const { notifications, addNotification, removeNotification } = useNotification();
    const itemsPerPage = 8;
    const [errors, setErrors] = useState({});

    // Opciones para selects
    const cultivosOptions = cultivos.map(c => ({ value: String(c.id), label: c.nombre }));
    const tiposOptions = tipos.map(t => ({ value: String(t.id), label: t.nombre }));
    const estadosOptions = estados.map(e => ({ value: String(e.id), label: e.nombre }));
    const municipiosOptions = municipios.map(m => ({ value: String(m.id), label: m.nombre }));
    const parroquiasOptions = parroquias.map(p => ({ value: String(p.id), label: p.nombre }));
    const productoresOptions = productores.map(p => ({ value: String(p.id), label: p.nombre }));
    const sectoresOptions = sectores.map(s => ({ value: String(s.id), label: s.nombre }));

    // Fetchers
    const fetchPropiedades = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${BaseUrl}/propiedad`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setDatosOriginales(response.data);
            setDatosFiltrados(response.data);
        } catch (error) {
            console.error('error obteniendo todas las propiedades', error);
            addNotification('Error al obtener propiedades', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchCultivos = async () => {
        try {
            const response = await axios.get(`${BaseUrl}/propiedad/cultivos/all`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setCultivos(response.data);
        } catch (error) {
            console.error('error obteniendo todos los cultivos', error);
            addNotification('Error al obtener cultivos', 'error');
        }
    };

    const fetchTipos = async () => {
        try {
            const response = await axios.get(`${BaseUrl}/propiedad/tipos/all`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setTipos(response.data);
        } catch (error) {
            console.error('error obteniendo todos los tipos', error);
            addNotification('Error al obtener tipos de propiedad', 'error');
        }
    };

    const fetchEstados = async () => {
        try {
            const response = await axios.get(`${BaseUrl}/propiedad/estados/all`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setEstados(response.data);
        } catch (error) {
            console.error('error obteniendo todos los estados', error);
            addNotification('Error al obtener estados', 'error');
        }
    };

    const fetchMunicipios = async (estadoId) => {
        try {
            if (!estadoId) {
                setMunicipios([]);
                return;
            }
            const response = await axios.get(`${BaseUrl}/propiedad/municipios/all`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setMunicipios(response.data.filter(m => Number(m.estado_id) === Number(estadoId)));
        } catch (error) {
            console.error('error obteniendo todos los municipios', error);
            addNotification('Error al obtener municipios', 'error');
        }
    };

    const fetchParroquias = async (municipioId) => {
        try {
            if (!municipioId) {
                setParroquias([]);
                return;
            }
            const response = await axios.get(`${BaseUrl}/propiedad/parroquias/all`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setParroquias(response.data.filter(p => Number(p.municipio_id) === Number(municipioId)));
        } catch (error) {
            console.error('error obteniendo todas las parroquias', error);
            addNotification('Error al obtener parroquias', 'error');
        }
    };

    const fetchSectores = async (parroquiaId) => {
        try {
            if (!parroquiaId) {
                setSectores([]);
                return;
            }
            const response = await axios.get(`${BaseUrl}/propiedad/sectores/all`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setSectores(response.data.filter(s => Number(s.parroquia_id) === Number(parroquiaId)));
        } catch (error) {
            console.error('error obteniendo todos los sectores', error);
            addNotification('Error al obtener sectores', 'error');
        }
    };

    const fetchProductores = async () => {
        try {
            const response = await axios.get(`${BaseUrl}/propiedad/productores/all`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setProductores(response.data);
        } catch (error) {
            console.error('error obteniendo todos los productores', error);
            addNotification('Error al obtener productores', 'error');
        }
    };

    useEffect(() => {
        fetchPropiedades();
        fetchCultivos();
        fetchTipos();
        fetchEstados();
        fetchProductores();
    }, []);

    // Selects dependientes
    const handleEstadoChange = (val) => {
        setFormData(prev => ({
            ...prev,
            estado_id: val,
            municipio_id: '',
            parroquia_id: '',
            sector_id: ''
        }));
        if (val) {
            fetchMunicipios(val);
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
            parroquia_id: '',
            sector_id: ''
        }));
        if (val) {
            fetchParroquias(val);
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
            sector_id: ''
        }));
        if (val) {
            fetchSectores(val);
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

    const resetFormData = () => {
        setFormData({
            id: '',
            rif: '',
            nombre: '',
            c_cultivo: '',
            hectareas: '',
            sitios_asociados: '',
            ubicación: '',
            cultivos_ids: [],
            tipo_propiedad_id: '',
            estado_id: '',
            municipio_id: '',
            parroquia_id: '',
            sector_id: '',
            productor_id: ''
        });
        setErrors({});
    };

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSelectChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleCultivosChange = (selected) => {
        setFormData(prev => ({
            ...prev,
            cultivos_ids: selected ? selected.map(opt => opt.value) : []
        }));
    };

    const clearMultiSelect = (campo) => {
        setFormData(prev => ({
            ...prev,
            [campo]: []
        }));
    };

    const handleSearch = (searchTerm) => {
        const filtered = filterData(datosOriginales, searchTerm, [
            'rif', 'nombre', 'ubicación', 'tipo_propiedad_nombre', 'sector_nombre', 'productor_nombre'
        ]);
        setDatosFiltrados(filtered);
    };

    const handleSave = async () => {
        setLoading(true);
        if (!formData.rif || !formData.nombre) {
            addNotification('RIF y Nombre son obligatorios', 'warning');
            setLoading(false);
            return;
        }
        try {
            await axios.post(`${BaseUrl}/propiedad`, formData, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            addNotification('Propiedad registrada con éxito', 'success');
            fetchPropiedades();
            closeModal();
        } catch (error) {
            console.error('error registrando la propiedad', error);
            addNotification('Error al registrar propiedad', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async () => {
        setLoading(true);
        if (!formData.rif || !formData.nombre) {
            addNotification('RIF y Nombre son obligatorios', 'warning');
            setLoading(false);
            return;
        }
        try {
            await axios.put(`${BaseUrl}/propiedad/${formData.id}`, formData, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            addNotification('Propiedad actualizada con éxito', 'success');
            fetchPropiedades();
            closeModal();
        } catch (error) {
            console.error('error actualizando la propiedad', error);
            addNotification('Error al actualizar propiedad', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        setLoading(true);
        try {
            await axios.delete(`${BaseUrl}/propiedad/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            fetchPropiedades();
            addNotification('Propiedad eliminada con éxito', 'error');
        } catch (error) {
            console.error('error eliminando la propiedad', error);
            addNotification('Error al eliminar propiedad', 'error');
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
        setCurrentModal('propiedad');
    };

    const closeModal = () => setCurrentModal(null);

    const openEditModal = (propiedad) => {
    setFormData({
        id: propiedad.id,
        rif: propiedad.rif || '',
        nombre: propiedad.nombre || '',
        c_cultivo: propiedad.c_cultivo || '',
        hectareas: propiedad.hectareas || '',
        sitios_asociados: propiedad.sitios_asociados || '',
        ubicación: propiedad.ubicación || '',
        posee_certificado: propiedad.posee_certificado || 'NO',
        cultivos_ids: (propiedad.cultivos || []).map(c => String(c.id)),
        tipo_propiedad_id: propiedad.tipo_propiedad_id ? String(propiedad.tipo_propiedad_id) : '',
        productor_id: propiedad.productor_id ? String(propiedad.productor_id) : '',
        estado_id: propiedad.estado_id ? String(propiedad.estado_id) : '',
        municipio_id: propiedad.municipio_id ? String(propiedad.municipio_id) : '',
        parroquia_id: propiedad.parroquia_id ? String(propiedad.parroquia_id) : '',
        sector_id: propiedad.sector_id ? String(propiedad.sector_id) : ''
    });

    if (propiedad.estado_id) fetchMunicipios(propiedad.estado_id);
    if (propiedad.municipio_id) fetchParroquias(propiedad.municipio_id);
    if (propiedad.parroquia_id) fetchSectores(propiedad.parroquia_id);

    setCurrentModal('propiedad');
};

    const openConfirmDeleteModal = (id) => {
        setSelectedPropiedadId(id);
        setConfirmDeleteModal(true);
    };
    const closeConfirmDeleteModal = () => {
        setSelectedPropiedadId(null);
        setConfirmDeleteModal(false);
    };

    const openDetalleModal = (propiedad) => setDetalleModal({ abierto: true, propiedad });
    const closeDetalleModal = () => setDetalleModal({ abierto: false, propiedad: null });

    return (
        <div className={styles.tipopropiedadContainer}>
            {loading && <Spinner text="Procesando..." />}
            {notifications.map((notification) => (
                <Notification
                    key={notification.id}
                    message={notification.message}
                    type={notification.type}
                    onClose={() => removeNotification(notification.id)}
                />
            ))}

            {/* Modal Detalle */}
            {detalleModal.abierto && (
                <div className='modalOverlay'>
                    <div className='modalDetalle'>
                        <button className='closeButton' onClick={closeDetalleModal}>&times;</button>
                        <h2>Detalles de la Propiedad</h2>
                        <table className='detalleTable'>
                            <tbody>
                                <tr>
                                    <th>RIF</th>
                                    <td>{detalleModal.propiedad.rif}</td>
                                </tr>
                                <tr>
                                    <th>Nombre</th>
                                    <td>{detalleModal.propiedad.nombre}</td>
                                </tr>
                                <tr>
                                    <th>¿Posee Certificado?</th>
                                    <td>{detalleModal.propiedad.posee_certificado}</td>
                                </tr>
                                <tr>
                                    <th>Código RUNSAI del Productor</th>
                                    <td>{detalleModal.propiedad.productor_codigo}</td>
                                </tr>
                                <tr>
                                    <th>Cédula Productor</th>
                                    <td>{detalleModal.propiedad.productor_cedula}</td>
                                </tr>
                                <tr>
                                    <th>Productor Responsable</th>
                                    <td>{detalleModal.propiedad.productor_nombre} {detalleModal.propiedad.productor_apellido}</td>
                                </tr>
                                <tr>
                                    <th>Hectáreas</th>
                                    <td>{detalleModal.propiedad.hectareas}</td>
                                </tr>
                                <tr>
                                    <th>Cantidad de Cultivos</th>
                                    <td>{detalleModal.propiedad.c_cultivo}</td>
                                </tr>
                                <tr>
                                    <th>Cultivos</th>
                                    <td dangerouslySetInnerHTML={{ __html: detalleModal.propiedad.cultivos_detalle || '' }} />
                                </tr>
                                <tr>
                                    <th>Tipo de Propiedad</th>
                                    <td>{detalleModal.propiedad.tipo_propiedad_nombre}</td>
                                </tr>
                                <tr>
                                    <th>Ubicación</th>
                                    <td>{detalleModal.propiedad.ubicación}</td>
                                </tr>
                                <tr>
                                    <th>Sector</th>
                                    <td>{detalleModal.propiedad.sector_nombre}</td>
                                </tr>
                                <tr>
                                    <th>Parroquia</th>
                                    <td>{detalleModal.propiedad.parroquia_nombre}</td>
                                </tr>
                                <tr>
                                    <th>Municipio</th>
                                    <td>{detalleModal.propiedad.municipio_nombre}</td>
                                </tr>
                                <tr>
                                    <th>Estado</th>
                                    <td>{detalleModal.propiedad.estado_nombre}</td>
                                </tr>
                                <tr>
                                    <th>Sitios Asociados</th>
                                    <td>{detalleModal.propiedad.sitios_asociados}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal registro y editar */}
            {currentModal === 'propiedad' && (
                <div className='modalOverlay'>
                    <div className='modal_tree'>
                        <button className='closeButton' onClick={closeModal}>&times;</button>
                        <h2>{formData.id ? 'Editar Propiedad' : 'Registrar Propiedad'}</h2>
                        <form className='modalForm'>
                            <div className={styles.formColumns}>
                                <div className='formGroup'>
                                    <label htmlFor="rif">RIF:</label>
                                    <input type="text" id="rif" value={formData.rif} onChange={handleChange} className='input' placeholder='RIF'/>
                                    {errors.rif && <span className='errorText'>{errors.rif}</span>}
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="nombre">Nombre:</label>
                                    <input type="text" id="nombre" value={formData.nombre} onChange={handleChange} className='input' placeholder='Nombre'/>
                                    {errors.nombre && <span className='errorText'>{errors.nombre}</span>}
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="productor_id">Productor Responsable:</label>
                                    <SingleSelect
                                        options={productoresOptions}
                                        value={formData.productor_id}
                                        onChange={val => handleSelectChange('productor_id', val)}
                                        placeholder="Seleccione un productor"
                                    />
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="tipo_propiedad_id">Tipo de Propiedad:</label>
                                    <SingleSelect
                                        options={tiposOptions}
                                        value={formData.tipo_propiedad_id}
                                        onChange={val => handleSelectChange('tipo_propiedad_id', val)}
                                        placeholder="Seleccione un tipo"
                                    />
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="hectareas">Hectáreas:</label>
                                    <input type="number" id="hectareas" value={formData.hectareas} onChange={handleChange} className='input' placeholder='Hectáreas'/>
                                </div>
                                
                                <div className='formGroup'>
                                    <label htmlFor="c_cultivo">Cantidad de Cultivos:</label>
                                    <input type="number" id="c_cultivo" value={formData.c_cultivo} onChange={handleChange} className='input' placeholder='Cantidad de cultivos'/>
                                </div>
                                <div className='formGroup'>
                                    <label>Cultivos:</label>
                                    <MultiSelect
                                        options={cultivosOptions}
                                        value={cultivosOptions.filter(opt => formData.cultivos_ids.includes(opt.value))}
                                        onChange={handleCultivosChange}
                                        placeholder="Seleccione cultivos"
                                    />
                                    {formData.cultivos_ids.length > 0 && (
                                        <button type="button" onClick={() => clearMultiSelect('cultivos_ids')} className='btn-limpiar'>Limpiar</button>
                                    )}
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="sitios_asociados">Sitios Asociados:</label>
                                    <input type="text" id="sitios_asociados" value={formData.sitios_asociados} onChange={handleChange} className='input' placeholder='Sitios asociados'/>
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="ubicación">Ubicación:</label>
                                    <input type="text" id="ubicación" value={formData.ubicación} onChange={handleChange} className='input' placeholder='Ubicación'/>
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="estado_id">Estado:</label>
                                    <SingleSelect
                                        options={estadosOptions}
                                        value={formData.estado_id}
                                        onChange={handleEstadoChange}
                                        placeholder="Seleccione un estado"
                                    />
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
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="sector_id">Sector:</label>
                                    <SingleSelect
                                        options={sectoresOptions}
                                        value={formData.sector_id}
                                        onChange={handleSectorChange}
                                        placeholder="Seleccione un sector"
                                        isDisabled={!formData.parroquia_id || sectoresOptions.length === 0}
                                    />
                                </div>
                                <div className='formGroup'>
                                    <label>¿Posee Certificado?</label>
                                    <div className="radio-group">
                                        <label style={{ marginLeft: '1em' }}>
                                            <input
                                                type="radio"
                                                className="radio-input"
                                                name="posee_certificado"
                                                value="SI"
                                                checked={formData.posee_certificado === 'SI'}
                                                onChange={() => setFormData(prev => ({ ...prev, posee_certificado: 'SI' }))}
                                            /> SI
                                        </label>
                                        <label >
                                            <input
                                                type="radio"
                                                className="radio-input"
                                                name="posee_certificado"
                                                value="NO"
                                                checked={formData.posee_certificado === 'NO'}
                                                onChange={() => setFormData(prev => ({ ...prev, posee_certificado: 'NO' }))}
                                            /> NO
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <button 
                                type="button" 
                                className='saveButton' 
                                onClick={formData.id ? handleEdit : handleSave}
                                title={formData.id ? 'Actualizar Propiedad' : 'Registrar Propiedad'}>
                                    Guardar
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de confirmación para eliminar */}
            {confirmDeleteModal && (
                <div className='modalOverlay'>
                    <div className='modal'>
                        <h2>Confirmar Eliminación</h2>
                        <p>¿Estás seguro de que deseas eliminar esta propiedad?</p>
                        <div className='modalActions'>
                            <button className='cancelButton' onClick={closeConfirmDeleteModal}>Cancelar</button>
                            <button className='confirmButton' onClick={() => { handleDelete(selectedPropiedadId); closeConfirmDeleteModal(); }}>Confirmar</button>
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
                        title='Registrar Propiedad'
                    >
                        <img src={icon.plus} alt="Crear" className='icon' />
                        Agregar
                    </button>
                    <h2>Propiedades</h2>
                    <div className='searchContainer'>
                        <SearchBar onSearch={handleSearch} />
                        <img src={icon.lupa} alt="Buscar" className='iconlupa' />
                    </div>
                </div>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>N°</th>
                            <th>RIF</th>
                            <th>Nombre</th>
                            <th>Ubicación</th>
                            <th>Sector</th>
                            <th>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentData.map((item, idx) => (
                            <tr key={item.id}>
                                <td>{indexOfFirstItem + idx + 1}</td>
                                <td>{item.rif}</td>
                                <td>{item.nombre}</td>
                                <td>{item.ubicación}</td>
                                <td>{item.sector_nombre}</td>
                                <td>
                                    <div className={styles.iconContainer}>
                                        <img
                                            onClick={() => openDetalleModal(item)}
                                            src={icon.ver}
                                            className='iconver'
                                            title='Ver más'
                                        />
                                        <img
                                            onClick={() => openEditModal(item)}
                                            src={icon.editar}
                                            className='iconeditar'
                                            title='Editar'
                                        />
                                        <img 
                                            onClick={() => openConfirmDeleteModal(item.id)} 
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

export default Propiedad;