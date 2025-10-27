import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
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
import { exportToPDF, exportToExcel } from '../../utils/exportUtils';
import AyudaTooltip from '../../components/ayudanteinfo/AyudaTooltip';
import { usePermiso } from '../../hooks/usePermiso';


function Propiedad() {
    const UNIDADES_MEDIDA = ['kg', 't', 'sacos', 'm³', 'L', 'unid'];
    const RIF_PREFIJOS = ['V-', 'E-', 'J-', 'G-', 'P-'];
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const initializedFromQuery = useRef(false);
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
    const [pdfUrl, setPdfUrl] = useState(null)
    const [pdfFileName, setPdfFileName] = useState('');
    const { fileName } = getPDFInfo();
    const excelFileName = fileName.replace('.pdf', '.xlsx');
    const tienePermiso = usePermiso();
    const user = JSON.parse(localStorage.getItem('user'));
    const rol = user?.roles_nombre;
    const puedeVerSeguimiento = ['Administrador', 'Moderador'].includes(rol); 
    const [detalleModal, setDetalleModal] = useState({ abierto: false, propiedad: null });
    const [formData, setFormData] = useState({
        id: '',
        rif: '',
        rif_tipo: 'J-',
        rif_numero: '',
        nombre: '',
        c_cultivo: '',
        c_cultivo_unidad: '',
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
    const [step, setStep] = useState(1);
    const [recentPropiedad, setRecentPropiedad] = useState(null);
    const prefijosOptions = RIF_PREFIJOS.map(p => ({ value: p, label: p }));

    const splitRif = (str) => {
    const s = String(str || '').trim();
    // Acepta "J-123...", "G123...", etc.
        const m = s.match(/^([VEJGP])[-\s]?(\d{1,15})$/i);
        return {
        tipo: m ? `${m[1].toUpperCase()}-` : 'J-',
        numero: m ? m[2] : ''
        };
    };

    // Opciones para selects
    const cultivosOptions = cultivos.map(c => ({ value: String(c.id), label: c.nombre }));
    const tiposOptions = tipos.map(t => ({ value: String(t.id), label: t.nombre }));
    const estadosOptions = estados.map(e => ({ value: String(e.id), label: e.nombre }));
    const municipiosOptions = municipios.map(m => ({ value: String(m.id), label: m.nombre }));
    const parroquiasOptions = parroquias.map(p => ({ value: String(p.id), label: p.nombre }));
    const productoresOptions = productores.map(p => ({ value: String(p.id), label: `${p.cedula || ''} - ${p.nombre} ${p.apellido || ''}`.trim() }));
    const sectoresOptions = sectores.map(s => ({ value: String(s.id), label: s.nombre }));
    const unidadesOptions = UNIDADES_MEDIDA.map(u => ({ value: u, label: u }));

    const [totales, setTotales] = useState({
        total: 0,
        registradas: 0,
        planificadas: 0,
        inspeccionando: 0,
        diagnosticadas: 0,
        aprobadas: 0,
        rechazadas: 0,
        seguimiento: 0,
        cuarentena: 0
    });


    const splitCantidadUnidad = (str) => {
    const s = String(str || '').trim();
    // número (con punto/coma) + opcional unidad (letras y símbolos comunes)
    const m = s.match(/^([\d.,]+)\s*([a-zA-Z%°/µ³]+)?$/);
    if (!m) return { amount: s, unit: '' };
    return { amount: m[1] || '', unit: m[2] || '' };
};

    // Definición de columnas para PDF/Excel
    const columnsPropiedad = [
        { header: 'Código', key: 'codigo' },
        { header: 'RIF', key: 'rif' },
        { header: 'Nombre', key: 'nombre' },
        { header: 'Ubicación', key: 'ubicacion' },
        { header: 'Sector', key: 'sector_nombre' },
        { header: 'Parroquia', key: 'parroquia_nombre' },
        { header: 'Municipio', key: 'municipio_nombre' },
        { header: 'Estado (Geo)', key: 'estado_nombre' },
        { header: 'Hectáreas', key: 'hectareas' },
        { header: 'Tipo Propiedad', key: 'tipo_propiedad_nombre' },
        { header: 'Estatus', key: 'estado' }
    ];

    function getPDFInfo() {
        if (datosFiltrados.length === datosOriginales.length) {
            return { fileName: 'Total_Propiedades.pdf', title: 'Listado de Todas las Propiedades' };
        }
        const allSameEstado = (est) => datosFiltrados.length > 0 && datosFiltrados.every(p => p.estado === est);
        if (allSameEstado('registrada'))      return { fileName: 'Propiedades_Registradas.pdf',   title: 'Listado de Propiedades Registradas' };
        if (allSameEstado('planificada'))     return { fileName: 'Propiedades_Planificadas.pdf',  title: 'Listado de Propiedades Planificadas' };
        if (allSameEstado('inspeccionando'))  return { fileName: 'Propiedades_Inspeccionando.pdf',title: 'Listado de Propiedades en Inspección' };
        if (allSameEstado('diagnosticada'))   return { fileName: 'Propiedades_Diagnosticadas.pdf',title: 'Listado de Propiedades Diagnosticadas' };
        if (allSameEstado('aprobada'))        return { fileName: 'Propiedades_Aprobadas.pdf',     title: 'Listado de Propiedades Aprobadas' };
        if (allSameEstado('rechazada'))       return { fileName: 'Propiedades_Rechazadas.pdf',    title: 'Listado de Propiedades Rechazadas' };
        if (allSameEstado('seguimiento'))     return { fileName: 'Propiedades_Seguimiento.pdf',   title: 'Listado de Propiedades en Seguimiento' };
        if (allSameEstado('cuarentena'))      return { fileName: 'Propiedades_Cuarentena.pdf',    title: 'Listado de Propiedades en Cuarentena' };
        return { fileName: 'Propiedades_Filtradas.pdf', title: 'Listado de Propiedades Filtradas' };
    }

    const handlePreviewPDF = () => {
        const { fileName, title } = getPDFInfo();
        const blob = exportToPDF({
            data: datosFiltrados,
            columns: columnsPropiedad,
            fileName,
            title,
            preview: true
        });
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
        setPdfFileName(fileName);
    };

    const handleSeguimiento = (inspeccionId) => {
  if (!puedeVerSeguimiento) {
    addNotification('No tiene permiso para ver el seguimiento.', 'error');
    return;
  }
  navigate(`/inspecciones/${inspeccionId}/seguimiento`);
};

    

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
            setTotales({
                total: data.length,
                registradas: data.filter(p => p.estado === 'registrada').length,
                planificadas: data.filter(p => p.estado === 'planificada').length,
                inspeccionando: data.filter(p => p.estado === 'inspeccionando').length,
                diagnosticadas: data.filter(p => p.estado === 'diagnosticada').length,
                aprobadas: data.filter(p => p.estado === 'aprobada').length,
                rechazadas: data.filter(p => p.estado === 'rechazada').length,
                seguimiento: data.filter(p => p.estado === 'seguimiento').length,
                cuarentena: data.filter(p => p.estado === 'cuarentena').length
            });
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

    // Lee productorId del query y abre el modal con el productor preseleccionado
    useEffect(() => {
        const prodId = searchParams.get('productorId');
        if (prodId && !initializedFromQuery.current) {
            initializedFromQuery.current = true;

            setFormData(prev => ({
                ...prev,
                productores_ids: [String(prodId)]
            }));
            setCurrentModal('propiedad');

            // limpia el query para evitar reabrir al volver
            const params = new URLSearchParams(searchParams);
            params.delete('productorId');
            setSearchParams(params, { replace: true });
        }
    }, [searchParams, setSearchParams]);
    
    // Selects dependientes
    const handleEstadoChange = (opt) => {
        const id = opt ? opt.value : null;
        setFormData(prev => ({
            ...prev,
            estado_id: id,
            municipio_id: null,
            parroquia_id: null,
            sector_id: null
        }));
        if (id) fetchMunicipios(id); else setMunicipios([]);
    };

    const handleMunicipioChange = (opt) => {
        const id = opt ? opt.value : null;
        setFormData(prev => ({
            ...prev,
            municipio_id: id,
            parroquia_id: null,
            sector_id: null
        }));
        if (id) fetchParroquias(id); else setParroquias([]);
    };

    const handleParroquiaChange = (opt) => {
        const id = opt ? opt.value : null;
        setFormData(prev => ({
            ...prev,
            parroquia_id: id,
            sector_id: null
        }));
        if (id) fetchSectores(id); else setSectores([]);
    };

    const handleSectorChange = (opt) => {
        const id = opt ? opt.value : null;
        setFormData(prev => ({ ...prev, sector_id: id }));
    };

    const selectedFrom = (options, id) =>
        options.find(o => String(o.value) === String(id)) || null;

    const handleSelectChange = (field, opt) => {
        setFormData(prev => ({ ...prev, [field]: opt ? String(opt.value) : null }));
    };

    const resetFormData = () => {
        setFormData({
            id: '',
            rif: '',
            rif_tipo: '',
            rif_numero: '',
            nombre: '',
            c_cultivo: '',
            c_cultivo_unidad: '',
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
        if (!formData.rif_tipo || !formData.rif_numero) {
            setErrors(prev => ({ ...prev, rif_numero: 'Debe seleccionar el prefijo y colocar el número de RIF' }));
            addNotification('Debe seleccionar el prefijo y colocar el número de RIF', 'warning');
            return;
        }
        
        // Si pasa la validación, limpia el error:
        setErrors(prev => ({ ...prev, rif_numero: '' }));

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
            const cCultivoConcat = [formData.c_cultivo, formData.c_cultivo_unidad].filter(Boolean).join(' ').trim();
            
            const payload = {
                rif: `${formData.rif_tipo}${formData.rif_numero}`.trim(),
                nombre: formData.nombre,
                c_cultivo: cCultivoConcat || null,
                hectareas: formData.hectareas || null,
                sitios_asociados: formData.sitios_asociados || null,
                ubicacion: formData.ubicacion || null,
                posee_certificado: formData.posee_certificado || 'NO',
                tipo_propiedad_id: formData.tipo_propiedad_id ? Number(formData.tipo_propiedad_id) : null,
                estado_id: formData.estado_id ? Number(formData.estado_id) : null,
                municipio_id: formData.municipio_id ? Number(formData.municipio_id) : null,
                parroquia_id: formData.parroquia_id ? Number(formData.parroquia_id) : null,
                sector_id: formData.sector_id ? Number(formData.sector_id) : null,
                cultivos_ids: formData.cultivos_ids.map(Number),
                productores_ids: formData.productores_ids.map(Number)
                };
                // console.log(payload)

            const { data } = await axios.post(`${BaseUrl}/propiedad`, payload, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            addNotification('Propiedad registrada con éxito', 'success');
            await fetchPropiedades();
            setRecentPropiedad(data);
            setStep(2);
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
        if (!formData.rif_tipo || !formData.rif_numero) {
            addNotification('Debe seleccionar el prefijo y colocar el número de RIF', 'warning');
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
            const cCultivoConcat = [formData.c_cultivo, formData.c_cultivo_unidad].filter(Boolean).join(' ').trim();

            const payload = {
                rif: `${formData.rif_tipo}${formData.rif_numero}`.trim(),
                nombre: formData.nombre,
                c_cultivo: cCultivoConcat || null,
                hectareas: formData.hectareas || null,
                sitios_asociados: formData.sitios_asociados || null,
                ubicacion: formData.ubicacion || null,
                tipo_propiedad_id: formData.tipo_propiedad_id ? Number(formData.tipo_propiedad_id) : null,
                sector_id: formData.sector_id ? Number(formData.sector_id) : null,
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
        setErrors({});
        setRecentPropiedad(null);
        setStep(1); 
        setCurrentModal('propiedad');
    };

    const closeModal = () => setCurrentModal(null);

    const openEditModal = async (propiedad) => {
        // Cargar dependientes en cadena
        if (!estados.length) await fetchEstados();
        if (propiedad.estado_id) await fetchMunicipios(propiedad.estado_id);
        if (propiedad.municipio_id) await fetchParroquias(propiedad.municipio_id);
        if (propiedad.parroquia_id) await fetchSectores(propiedad.parroquia_id);
        const parsedCC = splitCantidadUnidad(propiedad.c_cultivo || '');
        const rifParts = splitRif(propiedad.rif || '');
        setFormData({
            id: propiedad.id,
            rif: propiedad.rif || '',
            rif_tipo: rifParts.tipo || '',
            rif_numero: rifParts.numero || '',
            nombre: propiedad.nombre || '',
            c_cultivo: parsedCC.amount || '',
            c_cultivo_unidad: parsedCC.unit || '', 
            hectareas: propiedad.hectareas || '',
            sitios_asociados: propiedad.sitios_asociados || '',
            ubicacion: propiedad.ubicacion || '',
            posee_certificado: propiedad.posee_certificado || 'NO',
            cultivos_ids: (propiedad.cultivos || []).map(c => String(c.id)),
            productores_ids: (propiedad.productores || []).map(p => String(p.id)),
            tipo_propiedad_id: propiedad.tipo_propiedad_id ? String(propiedad.tipo_propiedad_id) : null,
            estado_id: propiedad.estado_id ? String(propiedad.estado_id) : null,
            municipio_id: propiedad.municipio_id ? String(propiedad.municipio_id) : null,
            parroquia_id: propiedad.parroquia_id ? String(propiedad.parroquia_id) : null,
            sector_id: propiedad.sector_id ? String(propiedad.sector_id) : null
        });
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

    const goToNextScreen = () => {
        localStorage.setItem('seccionTwoTab', 'solicitud');
        const params = new URLSearchParams();
        params.set('tab', 'solicitud');
        if (recentPropiedad?.id) params.set('propiedadId', String(recentPropiedad.id)); 
        navigate(`/SeccionTwo?${params.toString()}`);
        closeModal();
    };

    return (
        <div className='mainContainer'>
            {loading && <Spinner text="Procesando..." />}
            {/*Cartas  */}
            <div className='cardsContainer'>
                <div className='card' onClick={() => setDatosFiltrados(datosOriginales)} title='Todas las Propiedades'>
                    <span className='cardNumber'>{totales.total}</span>
                    <p>Total</p>
                </div>
                <div className='card' onClick={() => setDatosFiltrados(datosOriginales.filter(p => p.estado === 'planificada'))} title='Planificadas'>
                    <span className='cardNumber'>{totales.planificadas}</span>
                    <p>Planificadas</p>
                </div>
                <div className='card' onClick={() => setDatosFiltrados(datosOriginales.filter(p => p.estado === 'inspeccionando'))} title='Inspeccionando'>
                    <span className='cardNumber'>{totales.inspeccionando}</span>
                    <p>Inspeccionando</p>
                </div>
                {/* <div className='card' onClick={() => setDatosFiltrados(datosOriginales.filter(p => p.estado === 'rechazada'))} title='Rechazadas'>
                    <span className='cardNumber'>{totales.rechazadas}</span>
                    <p>Rechazadas</p>
                </div> */}
            </div>

            {/*/////////////////// Tabla ///////////*/}
                <div className='tituloH' 
                style={{marginTop: 20, marginBottom: 20, gap: 20}}
                >
                    <img src={icon.homeIcon} alt="" className='iconTwo'/>
                    <h1 className='title' title='Propiedades'> Resumen de Propiedades</h1>
                
                {/* Ayudante informativo de Pantalla */}
                    <div >
                        <AyudaTooltip descripcion="En esta sección puedes visualizar, registrar y gestionar todas las propiedades. Usa los filtros, la búsqueda y las opciones de exportación para organizar y consultar la información de manera eficiente." />
                    </div>
                </div>

            {/* Modal Detalle */}
            {detalleModal.abierto && detalleModal.propiedad && (
                <div className='modalOverlay'>
                    <div className='modal_tree'>
                        <button className='closeButton' onClick={closeDetalleModal}>&times;</button>
                        <h2>Detalles de la propiedad</h2>
                        <form className='modalForm'>
                            <div className='formColumns_tree'>
                                <div className='formGroup'>
                                    <label>Código:</label>
                                    <input type="text" value={detalleModal.propiedad.codigo || ''} className='input' disabled />
                                </div>
                                <div className='formGroup'>
                                    <label><span className='Unique'>*</span>Productor asociado:</label>
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
                                    <input type="text" value={detalleModal.propiedad.c_cultivo || ''} className='input' disabled />  
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
                    <div className={step === 2 ? 'modal' : 'modal_tree'}>
                        <button className='closeButton' onClick={closeModal}>&times;</button>
                        {step === 1 ? (
                            <>
                                <h2>{formData.id ? 'Editar Propiedad' : 'Registrar Propiedad'}</h2>
                                <form className='modalForm'>
                                    <div className='formColumns_tree'>
                                        <div className='formGroup'>
                                            <label><span className='Unique'>*</span>Productor Asociado:</label>
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
                                            <label htmlFor="rif_numero"><span className='Unique' title='Campos Obligatorios'>*</span>RIF:</label>
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                <SingleSelect
                                                options={prefijosOptions}
                                                value={formData.rif_tipo ? { value: formData.rif_tipo, label: formData.rif_tipo } : null}
                                                onChange={(opt) => setFormData(prev => ({ ...prev, rif_tipo: opt?.value || 'J-' }))}
                                                placeholder="Prefijo"

                                                />
                                                <input
                                                    type="text"
                                                    id="rif_numero"
                                                    className='input'
                                                    placeholder="Ej: 12345678"
                                                    value={formData.rif_numero}
                                                    onChange={(e) => {
                                                        const v = e.target.value.replace(/[^0-9-]/g, '');
                                                        setFormData(prev => ({ ...prev, rif_numero: v }));
                                                    }}
                                                    style={{ flex: 1 }}
                                                />
                                            </div>
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
                                                value={selectedFrom(tiposOptions, formData.tipo_propiedad_id)}
                                                onChange={(opt) => handleSelectChange('tipo_propiedad_id', opt)}
                                                placeholder="Tipo de Propiedad"
                                            />
                                        </div>
                                        <div className='formGroup'>
                                            <label htmlFor="hectareas"><span className='Unique'  title='Campos Obligatorios'>*</span>Hectáreas:</label>
                                            <input type="number" id="hectareas" value={formData.hectareas} onChange={handleChange} className='input' placeholder='Hectáreas'/>
                                        </div>
                                        <div className='formGroup'>
                                            <label htmlFor="c_cultivo">
                                                <span className='Unique' title='Campos Obligatorios'>*</span>
                                                Cantidad de Cultivos:
                                            </label>
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                <input
                                                    type="text"
                                                    id="c_cultivo"
                                                    className="input"
                                                    placeholder="Ej: 1000"
                                                    value={formData.c_cultivo}
                                                    onChange={handleChange}
                                                    style={{ flex: 1 }}
                                                />
                                                <SingleSelect
                                                    options={unidadesOptions}
                                                    value={selectedFrom(unidadesOptions, formData.c_cultivo_unidad)}
                                                    onChange={(opt) =>
                                                        setFormData(prev => ({ ...prev, c_cultivo_unidad: opt?.value || '' }))
                                                    }
                                                    placeholder="Unidad"
                                                    isClearable
                                                />
                                            </div>
                                            {errors.c_cultivo && <span className='errorText'>{errors.c_cultivo}</span>}
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
                                                value={estadosOptions.find(o => o.value === String(formData.estado_id)) || null}
                                                onChange={handleEstadoChange}
                                                placeholder="Seleccione un estado"
                                            />
                                        </div>
                                        <div className='formGroup'>
                                            <label htmlFor="municipio_id"><span className='Unique'  title='Campos Obligatorios'>*</span>Municipio:</label>
                                            <SingleSelect
                                                options={municipiosOptions}
                                                value={municipiosOptions.find(o => o.value === String(formData.municipio_id)) || null}
                                                onChange={handleMunicipioChange}
                                                isDisabled={!formData.estado_id || municipiosOptions.length === 0}
                                                placeholder="Seleccione un municipio"
                                            />
                                        </div>
                                        <div className='formGroup'>
                                            <label htmlFor="parroquia_id"><span className='Unique'  title='Campos Obligatorios'>*</span>Parroquia:</label>
                                            <SingleSelect
                                                options={parroquiasOptions}
                                                value={parroquiasOptions.find(o => o.value === String(formData.parroquia_id)) || null}
                                                onChange={handleParroquiaChange}
                                                isDisabled={!formData.municipio_id || parroquiasOptions.length === 0}
                                                placeholder="Seleccione una parroquia"
                                            />
                                        </div>
                                        <div className='formGroup'>
                                            <label htmlFor="sector_id"><span className='Unique'  title='Campos Obligatorios'>*</span>Sector:</label>
                                            <SingleSelect
                                                options={sectoresOptions}
                                                value={sectoresOptions.find(o => o.value === String(formData.sector_id)) || null}
                                                onChange={handleSectorChange}
                                                isDisabled={!formData.parroquia_id || sectoresOptions.length === 0}
                                                placeholder="Seleccione un sector"
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
                            </>
                        ) : (
                            <>
                                <h2>Propiedad registrada</h2>
                                <p>
                                    Se creó correctamente la propiedad
                                    {` ${recentPropiedad?.codigo ? `(${recentPropiedad.codigo})` : ''} ${recentPropiedad?.nombre || ''}`}.
                                </p>
                                <p>¿Deseas continuar para empezar la solicitud asociada?</p>
                                <div className='modalActions' style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                                    <button className='btn-estandar' onClick={goToNextScreen}>
                                        Continuar
                                    </button>
                                    <button className='cancelButton' onClick={closeModal}>
                                        Más tarde
                                    </button>
                                </div>
                            
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Modal de confirmación para eliminar */}
            {confirmDeleteModal && (
                <div className='modalOverlay'>
                    <div className='modal_mono'>
                        <h2>Confirmar Eliminación</h2>
                        <p>¿Estás seguro de que deseas eliminar esta propiedad?</p>
                        <div className='modalActions'>
                            <button className='cancelButton' onClick={closeConfirmDeleteModal}>Cancelar</button>
                            <button className='confirmButton' onClick={() => { handleDelete(selectedPropiedadId); closeConfirmDeleteModal(); }}>Confirmar</button>
                        </div>
                    </div>
                </div>
            )}

            {pdfUrl && (
                <div className="modalOverlay">
                    <div className="modalDetalle">
                        <button className="closeButton" onClick={() => setPdfUrl(null)}>&times;</button>
                        <iframe src={pdfUrl} width="100%" height="600px" title="Vista previa PDF" />
                        <a
                            href={pdfUrl}
                            download={pdfFileName}
                            className="btn-estandar"
                            style={{ marginTop: 16, display: 'inline-block', textDecoration: 'none' }}
                        >
                            Descargar PDF
                        </a>
                    </div>
                </div>
            )}

            <div className='tableSection'>
                <div className='filtersContainer'>
                    <div className='filtersButtons'>
                        {tienePermiso('propiedad','crear') && (<button 
                            type='button'
                            onClick={openModal} 
                            className='create'
                            title='Registrar Propiedad'
                            >
                            <img src={icon.plus} alt="Crear" className='icon' />
                            Agregar
                        </button>
                        )}

                        {tienePermiso('propiedad','exportar') && (<button
                            type='button'
                            onClick={handlePreviewPDF}
                            className='btn-estandar'
                            title='Previsualizar PDF'
                        >
                            <img src={icon.pdf5} alt="PDF" className='icon' />
                            PDF
                        </button>
                        )}

                        {tienePermiso('propiedad','exportar') && (<button
                            type='button'
                            onClick={() => exportToExcel({
                                data: datosFiltrados,
                                columns: columnsPropiedad,
                                fileName: excelFileName,
                                count: true,
                                totalLabel: 'TOTAL REGISTROS'
                            })}
                            className='btn-estandar'
                            title='Descargar Formato Excel'
                        >
                            <img src={icon.excel2} alt="Excel" className='icon' />
                            Excel
                        </button>
                        )}
                    </div>
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
                            <th>Nombre</th>
                            <th>Estatus</th>
                            <th>Acción</th>
                            
                        </tr>
                    </thead>
                    <tbody>
                        {(Array.isArray(currentData) ? currentData : []).map((item, idx) => {
                            // Log para depuración
                            // console.log('Inspecciones de propiedad', item.id, item.inspecciones);

                            return (
                                <tr key={item.id}>
                                    <td>{indexOfFirstItem + idx + 1}</td>
                                    <td>{item.codigo}</td>
                                    <td>{item.nombre}</td>
                                    <td>
                                        <span className={`badge-estado badge-${item.estado}`}>
                                            {item.estado}
                                        </span>
                                    </td>
                                    <td>
                                        <div className='iconContainer'>
                                            {puedeVerSeguimiento && Array.isArray(item.inspecciones) && item.inspecciones.length > 0 && (
                                                <img
                                                    src={icon.ojito}
                                                    onClick={() => handleSeguimiento(item.inspecciones[0].id)}
                                                    alt="Seguimiento"
                                                    className="iconver"
                                                    title="Monitorear Seguimiento de esta Propiedad"
                                                />
                                            )}
                                            {tienePermiso('propiedad','editar') && (
                                                <img
                                                    onClick={() => openDetalleModal(item)}
                                                    src={icon.ver}
                                                    className='iconver'
                                                    title='Ver más'
                                                />
                                            )}
                                            {tienePermiso('propiedad','editar') && (
                                                <img
                                                    onClick={() => openEditModal(item)}
                                                    src={icon.editar}
                                                    className='iconeditar'
                                                    title='Editar'
                                                />
                                            )}
                                            {tienePermiso('propiedad','eliminar') && (
                                                <img
                                                    onClick={() => openConfirmDeleteModal(item.id)}
                                                    src={icon.eliminar}
                                                    className='iconeliminar'
                                                    title='eliminar'
                                                />
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
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