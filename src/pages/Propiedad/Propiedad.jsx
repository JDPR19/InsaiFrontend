import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MultiSelect from '../../components/selectmulti/MultiSelect';
import SingleSelect from '../../components/selectmulti/SingleSelect';
import '../../main.css';
import icon from '../../components/iconos/iconos';
import { filterData } from '../../utils/filterData';
import SearchBar from "../../components/searchbart/SearchBar";
import { useNotification } from '../../utils/NotificationContext';
import Spinner from '../../components/spinner/Spinner';
import { validateField, getValidationRule } from '../../utils/validation';
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
        ubicacion: '',
        posee_certificado: 'NO',
        cultivos_ids: [],
        productores_ids: [],     
        tipo_propiedad_id: null,
        estado_id: null,
        municipio_id: null,
        parroquia_id: null,
        sector_id: null,
    });
    const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);
    const [selectedPropiedadId, setSelectedPropiedadId] = useState(null);
    const { addNotification } = useNotification();
    const itemsPerPage = 8;
    const [errors, setErrors] = useState({});

    // Opciones para selects
    const cultivosOptions = cultivos.map(c => ({ value: String(c.id), label: c.nombre }));
    const tiposOptions = tipos.map(t => ({ value: String(t.id), label: t.nombre }));
    const estadosOptions = estados.map(e => ({ value: String(e.id), label: e.nombre }));
    const municipiosOptions = municipios.map(m => ({ value: String(m.id), label: m.nombre }));
    const parroquiasOptions = parroquias.map(p => ({ value: String(p.id), label: p.nombre }));
    const productoresOptions = productores.map(p => ({ value: String(p.id), label: `${p.cedula || ''} - ${p.nombre} ${p.apellido || ''}`.trim() }));
    const sectoresOptions = sectores.map(s => ({ value: String(s.id), label: s.nombre }));

    // Fetchers
    const fetchPropiedades = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${BaseUrl}/propiedad`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            const data = Array.isArray(response.data) ? response.data : [];
            setDatosOriginales(data);
            setDatosFiltrados(data);
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

    const resetFormData = () => {
        setFormData({
            id: '',
            rif: '',
            nombre: '',
            c_cultivo: '',
            hectareas: '',
            sitios_asociados: '',
            ubicacion: '',
            cultivos_ids: [],
            productores_ids: [],
            tipo_propiedad_id: null,
            estado_id: null,
            municipio_id: null,
            parroquia_id: null,
            sector_id: null,
            productor_id: null
        });
        setErrors({});
    };

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));

        const rule = getValidationRule(id);
        if (rule && rule.regex) {
            const { regex, errorMessage } = rule;
            const { valid, message } = validateField(value, regex, errorMessage);
            setErrors(prev => ({ ...prev, [id]: valid ? '' : message }));
        }
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

    const handleProductoresMultiChange = (selected) => {
        setFormData(prev => ({
            ...prev,
            productores_ids: selected ? selected.map(opt => opt.value) : []
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
            'codigo', 'rif', 'nombre', 'ubicacion', 'tipo_propiedad_nombre', 'sector_nombre', 'productor_nombre', 'estado'
        ]);
        setDatosFiltrados(filtered);
    };

    const handleSave = async () => {
        if (!formData.rif || !formData.nombre) {
            addNotification('RIF y Nombre son obligatorios', 'warning');
            return;
        }
        if (!formData.tipo_propiedad_id || !formData.tipo_propiedad_id.value) {
            addNotification('Debe seleccionar un tipo de propiedad', 'warning');
            return;
        }
        // if (!formData.productor_id || !formData.productor_id.value) {
        //     addNotification('Debe seleccionar un productor responsable', 'warning');
        //     return;
        // }
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
            const payload = {
                rif: formData.rif,
                nombre: formData.nombre,
                c_cultivo: formData.c_cultivo || null,
                hectareas: formData.hectareas || null,
                sitios_asociados: formData.sitios_asociados || null,
                ubicacion: formData.ubicacion || null,
                tipo_propiedad_id: formData.tipo_propiedad_id?.value || null,
                sector_id: formData.sector_id?.value || null,
                // productor_id: formData.productor_id?.value || null,
                posee_certificado: formData.posee_certificado || 'NO',
                cultivos_ids: formData.cultivos_ids,
                productores_ids: formData.productores_ids
            };

            await axios.post(`${BaseUrl}/propiedad`, payload, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            addNotification('Propiedad registrada con éxito', 'success');
            fetchPropiedades();
            closeModal();
        } catch (error) {
            console.error('error registrando la propiedad', error);
            if (error?.response?.status === 409) {
                addNotification('RIF o Código ya existen', 'error');
            } else {
                addNotification('Error al registrar propiedad', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async () => {
        if (!formData.rif || !formData.nombre) {
            addNotification('RIF y Nombre son obligatorios', 'warning');
            return;
        }
        if (!formData.tipo_propiedad_id || !formData.tipo_propiedad_id.value) {
            addNotification('Debe seleccionar un tipo de propiedad', 'warning');
            return;
        }
        // if (!formData.productor_id || !formData.productor_id.value) {
        //     addNotification('Debe seleccionar un productor responsable', 'warning');
        //     return;
        // }
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
            const payload = {
                rif: formData.rif,
                nombre: formData.nombre,
                c_cultivo: formData.c_cultivo || null,
                hectareas: formData.hectareas || null,
                sitios_asociados: formData.sitios_asociados || null,
                ubicacion: formData.ubicacion || null,
                tipo_propiedad_id: formData.tipo_propiedad_id?.value || null,
                sector_id: formData.sector_id?.value || null,
                // productor_id: formData.productor_id?.value || null,
                posee_certificado: formData.posee_certificado || 'NO',
                cultivos_ids: formData.cultivos_ids,
                productores_ids: formData.productores_ids
            };

            await axios.put(`${BaseUrl}/propiedad/${formData.id}`, payload, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            addNotification('Propiedad actualizada con éxito', 'success');
            fetchPropiedades();
            closeModal();
        } catch (error) {
            console.error('error actualizando la propiedad', error);
            if (error?.response?.status === 409) {
                addNotification('RIF o Código ya existen', 'error');
            } else {
                addNotification('Error al actualizar propiedad', 'error');
            }
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
            addNotification('Propiedad eliminada con éxito', 'success');
        } catch (error) {
            console.error('error eliminando la propiedad', error);
            addNotification('Error al eliminar propiedad', 'error');
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
            ubicacion: propiedad.ubicacion || '',
            posee_certificado: propiedad.posee_certificado || 'NO',
            cultivos_ids: (propiedad.cultivos || []).map(c => String(c.id)),
            productores_ids: (propiedad.productores || []).map(p => String(p.id)), // NUEVO
            tipo_propiedad_id: tiposOptions.find(opt => String(opt.value) === String(propiedad.tipo_propiedad_id)) || null,
            // productor_id: productoresOptions.find(opt => String(opt.value) === String(propiedad.productor_id)) || null,
            estado_id: estadosOptions.find(opt => String(opt.value) === String(propiedad.estado_id)) || null,
            municipio_id: municipiosOptions.find(opt => String(opt.value) === String(propiedad.municipio_id)) || null,
            parroquia_id: parroquiasOptions.find(opt => String(opt.value) === String(propiedad.parroquia_id)) || null,
            sector_id: sectoresOptions.find(opt => String(opt.value) === String(propiedad.sector_id)) || null,
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

    const openDetalleModal = async (propiedad) => {
    setDetalleModal({ abierto: true, propiedad });
    if (propiedad.estado_id) await fetchMunicipios(propiedad.estado_id);
    if (propiedad.municipio_id) await fetchParroquias(propiedad.municipio_id);
    if (propiedad.parroquia_id) await fetchSectores(propiedad.parroquia_id);
    };
    const closeDetalleModal = () => setDetalleModal({ abierto: false, propiedad: null });

    return (
        <div className='mainContainer'>
            {loading && <Spinner text="Procesando..." />}
            {/* Modal Detalle */}
            {detalleModal.abierto && detalleModal.propiedad && (
                <div className='modalOverlay'>
                    <div className='modal_tree'>
                        <button className='closeButton' onClick={closeDetalleModal}>&times;</button>
                        <h2>Detalles de la Propiedad</h2>
                        <form className='modalForm'>
                            <div className='formColumns_tree'>
                                <div className='formGroup'>
                                    <label>Código:</label>
                                    <input type="text" value={detalleModal.propiedad.codigo || ''} className='input' disabled />
                                </div>
                                <div className='formGroup'>
                                    <label><span className='Unique'>*</span>Productores Asociados:</label>
                                    <MultiSelect
                                        options={productoresOptions}
                                        value={productoresOptions.filter(opt =>
                                            (detalleModal.propiedad.productores || [])
                                                .map(p => String(p.id))
                                                .includes(String(opt.value))
                                        )}
                                        isDisabled={true}
                                        placeholder="Sin productores asociados"
                                    />
                                </div>
                                <div className='formGroup'>
                                    <label>RIF:</label>
                                    <input type="text" value={detalleModal.propiedad.rif || ''} className='input' disabled />
                                </div>
                                <div className='formGroup'>
                                    <label>Nombre:</label>
                                    <input type="text" value={detalleModal.propiedad.nombre || ''} className='input' disabled />
                                </div>
                                <div className='formGroup'>
                                    <label>Tipo de Propiedad:</label>
                                    <SingleSelect
                                        options={tiposOptions}
                                        value={tiposOptions.find(opt => String(opt.value) === String(detalleModal.propiedad.tipo_propiedad_id)) || null}
                                        isDisabled={true}
                                    />
                                </div>
                                <div className='formGroup'>
                                    <label>Hectáreas:</label>
                                    <input type="number" value={detalleModal.propiedad.hectareas || ''} className='input' disabled />
                                </div>
                                <div className='formGroup'>
                                    <label>Cantidad de Cultivos:</label>
                                    <input type="number" value={detalleModal.propiedad.c_cultivo || ''} className='input' disabled />
                                </div>
                                <div className='formGroup'>
                                    <label>Cultivos:</label>
                                    <MultiSelect
                                        options={cultivosOptions}
                                        value={cultivosOptions.filter(opt =>
                                            (detalleModal.propiedad.cultivos || []).map(c => String(c.id)).includes(String(opt.value))
                                        )}
                                        isDisabled={true}
                                    />
                                </div>
                                <div className='formGroup'>
                                    <label>Sitios Asociados:</label>
                                    <input type="text" value={detalleModal.propiedad.sitios_asociados || ''} className='input' disabled />
                                </div>
                                <div className='formGroup'>
                                    <label>Ubicación:</label>
                                    <input type="text" value={detalleModal.propiedad.ubicacion || ''} className='input' disabled />
                                </div>

                                <div className='formGroup'>
                                    <label>Estatus de la Propiedad:</label>
                                    <span className={`badge-estado badge-${detalleModal.propiedad.estado}`}>
                                        {detalleModal.propiedad.estado}
                                    </span>
                                </div>

                                <div className='formGroup'>
                                    <label>Estado:</label>
                                    <SingleSelect
                                        options={estadosOptions}
                                        value={estadosOptions.find(opt => String(opt.value) === String(detalleModal.propiedad.estado_id)) || null}
                                        isDisabled={true}
                                    />
                                </div>
                                <div className='formGroup'>
                                    <label>Municipio:</label>
                                    <SingleSelect
                                        options={municipiosOptions}
                                        value={municipiosOptions.find(opt => String(opt.value) === String(detalleModal.propiedad.municipio_id)) || null}
                                        isDisabled={true}
                                    />
                                </div>
                                <div className='formGroup'>
                                    <label>Parroquia:</label>
                                    <SingleSelect
                                        options={parroquiasOptions}
                                        value={parroquiasOptions.find(opt => String(opt.value) === String(detalleModal.propiedad.parroquia_id)) || null}
                                        isDisabled={true}
                                    />
                                </div>
                                <div className='formGroup'>
                                    <label>Sector:</label>
                                    <SingleSelect
                                        options={sectoresOptions}
                                        value={sectoresOptions.find(opt => String(opt.value) === String(detalleModal.propiedad.sector_id)) || null}
                                        isDisabled={true}
                                    />
                                </div>
                                <div className='formGroup'>
                                    <label>¿Posee Certificado?</label>
                                    <div className="radio-group">
                                        <label style={{ marginLeft: '1em' }}>
                                            <input
                                                type="radio"
                                                className="radio-input"
                                                name="posee_certificado_detalle"
                                                value="SI"
                                                checked={detalleModal.propiedad.posee_certificado === 'SI'}
                                                disabled
                                            /> SI
                                        </label>
                                        <label>
                                            <input
                                                type="radio"
                                                className="radio-input"
                                                name="posee_certificado_detalle"
                                                value="NO"
                                                checked={detalleModal.propiedad.posee_certificado === 'NO'}
                                                disabled
                                            /> NO
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </form>
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
                            <div className='formColumns_tree'>
                                <div className='formGroup'>
                                    <label><span className='Unique'>*</span>Productores Asociado:</label>
                                    <MultiSelect
                                        options={productoresOptions}
                                        value={productoresOptions.filter(opt => formData.productores_ids.includes(opt.value))}
                                        onChange={handleProductoresMultiChange}
                                        placeholder="Seleccione productores"
                                    />
                                    {formData.productores_ids.length > 0 && (
                                        <button type="button" onClick={() => clearMultiSelect('productores_ids')} className='btn-limpiar'>Limpiar</button>
                                    )}
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="rif"><span className='Unique'  title='Campos Obligatorios'>*</span>RIF:</label>
                                    <input type="text" id="rif" value={formData.rif} onChange={handleChange} className='input' placeholder='RIF'/>
                                    {errors.rif && <span className='errorText'>{errors.rif}</span>}
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="nombre"><span className='Unique'  title='Campos Obligatorios'>*</span>Nombre:</label>
                                    <input type="text" id="nombre" value={formData.nombre} onChange={handleChange} className='input' placeholder='Nombre'/>
                                    {errors.nombre && <span className='errorText'>{errors.nombre}</span>}
                                </div>
                                
                                <div className='formGroup'>
                                    <label htmlFor="tipo_propiedad_id"><span className='Unique'  title='Campos Obligatorios'>*</span>Tipo de Propiedad:</label>
                                    <SingleSelect
                                        options={tiposOptions}
                                        value={formData.tipo_propiedad_id}
                                        onChange={val => handleSelectChange('tipo_propiedad_id', val)}
                                        placeholder="Seleccione un tipo"
                                    />
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="hectareas"><span className='Unique'  title='Campos Obligatorios'>*</span>Hectáreas:</label>
                                    <input type="number" id="hectareas" value={formData.hectareas} onChange={handleChange} className='input' placeholder='Hectáreas'/>
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="c_cultivo"><span className='Unique'  title='Campos Obligatorios'>*</span>Cantidad de Cultivos:</label>
                                    <input type="number" id="c_cultivo" value={formData.c_cultivo} onChange={handleChange} className='input' placeholder='Cantidad de cultivos'/>
                                </div>
                                <div className='formGroup'>
                                    <label><span className='Unique'  title='Campos Obligatorios'>*</span>Cultivos:</label>
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
                                    <label htmlFor="sitios_asociados"><span className='Unique'  title='Campos Obligatorios'>*</span>Sitios Asociados:</label>
                                    <input type="text" id="sitios_asociados" value={formData.sitios_asociados} onChange={handleChange} className='input' placeholder='Sitios asociados'/>
                                    {errors.sitios_asociados && <span className='errorText'>{errors.sitios_asociados}</span>}
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="ubicacion"><span className='Unique'  title='Campos Obligatorios'>*</span>Ubicación:</label>
                                    <input type="text" id="ubicacion" value={formData.ubicacion} onChange={handleChange} className='input' placeholder='Ubicación'/>
                                    {errors.ubicacion && <span className='errorText'>{errors.ubicacion}</span>}
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="estado_id"><span className='Unique'  title='Campos Obligatorios'>*</span>Estado:</label>
                                    <SingleSelect
                                        options={estadosOptions}
                                        value={formData.estado_id}
                                        onChange={handleEstadoChange}
                                        placeholder="Seleccione un estado"
                                    />
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="municipio_id"><span className='Unique'  title='Campos Obligatorios'>*</span>Municipio:</label>
                                    <SingleSelect
                                        options={municipiosOptions}
                                        value={formData.municipio_id}
                                        onChange={handleMunicipioChange}
                                        placeholder="Seleccione un municipio"
                                        isDisabled={!formData.estado_id || municipiosOptions.length === 0}
                                    />
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="parroquia_id"><span className='Unique'  title='Campos Obligatorios'>*</span>Parroquia:</label>
                                    <SingleSelect
                                        options={parroquiasOptions}
                                        value={formData.parroquia_id}
                                        onChange={handleParroquiaChange}
                                        placeholder="Seleccione una parroquia"
                                        isDisabled={!formData.municipio_id || parroquiasOptions.length === 0}
                                    />
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="sector_id"><span className='Unique'  title='Campos Obligatorios'>*</span>Sector:</label>
                                    <SingleSelect
                                        options={sectoresOptions}
                                        value={formData.sector_id}
                                        onChange={handleSectorChange}
                                        placeholder="Seleccione un sector"
                                        isDisabled={!formData.parroquia_id || sectoresOptions.length === 0}
                                    />
                                </div>
                                <div className='formGroup'>
                                    <label><span className='Unique'  title='Campos Obligatorios'>*</span>¿Posee Certificado?</label>
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
                                        <label>
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
                                title={formData.id ? 'Actualizar Propiedad' : 'Registrar Propiedad'}
                                disabled={loading}
                            >
                                {loading ? 'Procesando...' : 'Guardar'}
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
                <table className='table'>
                    <thead>
                        <tr>
                            <th>N°</th>
                            <th>Código</th>
                            <th>RIF</th>
                            <th>Nombre</th>
                            <th>Ubicación</th>
                            <th>Sector</th>
                            <th>Estatus</th>
                            <th>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(Array.isArray(currentData) ? currentData : []).map((item, idx) => (
                            <tr key={item.id}>
                                <td>{indexOfFirstItem + idx + 1}</td>
                                <td>{item.codigo}</td>
                                <td>{item.rif}</td>
                                <td>{item.nombre}</td>
                                <td>{item.ubicacion}</td>
                                <td>{item.sector_nombre}</td>
                                <td>
                                    <span className={`badge-estado badge-${item.estado}`}>
                                        {item.estado}
                                    </span>
                                </td>
                                <td>
                                    <div className='iconContainer'>
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