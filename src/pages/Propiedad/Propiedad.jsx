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
    const UNIDADES_MEDIDA = ['m²','km²', 'ha'];
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
        productores_ids: [],     
        tipo_propiedad_id: null,
        estado_id: null,
        municipio_id: null,
        parroquia_id: null,
        sector_id: null,
        cultivos_detalle: [],
        posee_certificado: 'NO'
    });
    const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);
    const [selectedPropiedadId, setSelectedPropiedadId] = useState(null);
    const { addNotification } = useNotification();
    const itemsPerPage = 8;
    const [cultivosModalAbierto, setCultivosModalAbierto] = useState(false);
    const UNIDADES_SUPERFICIE = [
        'm²', 'ha', 'km²', 'ac', 'ft²', 'yd²', 'cm²', 'mm²', 'in²', 'mi²', 'tarea', 'caballería'
        ];
    const UNIDADES_CANTIDAD = [
        'kg', 'ton', 'g', 'mg', 'lb', 'oz', 'qq', 'saco', 'bulto', 'unid', 'docena', 'ciento', 'litro', 'ml', 'galón', 'arroba'
        ];
    const [tempCultivos, setTempCultivos] = useState([]);
    const [errors, setErrors] = useState({});
    const [step, setStep] = useState(1);
    const [recentPropiedad, setRecentPropiedad] = useState(null);
    const prefijosOptions = RIF_PREFIJOS.map(p => ({ value: p, label: p }));

    const splitRif = (str) => {
        const s = String(str || '').trim();
        // Acepta "J-123...", "G123...", "J-12345678-9", etc.
        const m = s.match(/^([VEJGP])[-\s]?(\d{7,15}(?:-\d)?)$/i);
        return {
            tipo: m ? `${m[1].toUpperCase()}-` : 'J-',
            numero: m ? m[2] : ''
        };
    };

    const getCultivoNameById = (id) =>
        cultivosOptions.find(o => String(o.value) === String(id))?.label || 'Cultivo';

    const openCultivosModal = () => {
        setTempCultivos(formData.cultivos_detalle?.map(r => ({ ...r })) || []);
        setCultivosModalAbierto(true);
    };
    const closeCultivosModal = () => setCultivosModalAbierto(false);

    const addTempFila = () => setTempCultivos(prev => [...prev, { cultivo_id: '', superficie: '', cantidad: '' }]);
    const updateTempFila = (idx, field, value) => {
        setTempCultivos(prev => {
            const arr = [...prev];
            arr[idx] = { ...arr[idx], [field]: value };
            return arr;
        });
    };
    const removeTempFila = (idx) => setTempCultivos(prev => prev.filter((_, i) => i !== idx));

    // Carga masiva desde MultiSelect (evita duplicados por cultivo_id)
    const handleBulkSelectCultivos = (selected) => {
        const ids = new Set((selected || []).map(o => String(o.value)));
        const actuales = new Set((tempCultivos || []).map(r => String(r.cultivo_id)));
        const nuevos = [...ids].filter(id => !actuales.has(id)).map(id => ({ cultivo_id: id, superficie: '', cantidad: '' }));
        setTempCultivos(prev => [...prev, ...nuevos]);
    };
    
    const guardarCultivosModal = () => {
        // Normaliza y guarda
        const normalizado = (tempCultivos || [])
          .filter(r => r.cultivo_id) // solo filas con cultivo elegido
        .map(r => ({
            cultivo_id: String(r.cultivo_id),
            superficie: r.superficie === '' ? '' : r.superficie,
            superficie_unidad: r.superficie_unidad || '',
            cantidad: r.cantidad === '' ? '' : r.cantidad,
            cantidad_unidad: r.cantidad_unidad || ''
        }));
        setFormData(prev => ({ ...prev, cultivos_detalle: normalizado }));
        setErrors(prev => ({ ...prev, cultivos_detalle: normalizado.length ? '' : 'Agregue al menos un cultivo' }));
        closeCultivosModal();
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
    { header: 'Tipo Propiedad', key: 'tipo_propiedad_nombre' },
    { header: 'Estatus', key: 'estado' },

    { header: 'Hectáreas', key: 'hectareas' },
    { header: 'Sup. Cultivada (campo)', key: 'c_cultivo' },
    { header: 'Punto referencia', key: 'sitios_asociados' },
    { header: 'Ubicación exacta', key: 'ubicacion' },

    { header: 'Estado', key: 'estado_nombre' },
    { header: 'Municipio', key: 'municipio_nombre' },
    { header: 'Parroquia', key: 'parroquia_nombre' },
    { header: 'Sector', key: 'sector_nombre' },

    { header: 'Productores', key: 'productores_lista' },

    // Cultivos detallados (tabla puente)
    { header: 'Cultivos (detalle)', key: 'cultivos_lista' },
    { header: 'Total Sup. Cultivos', key: 'cultivos_total_superficie' },
    { header: 'Total Cant. Cultivos', key: 'cultivos_total_cantidad' }
];

    const normalizeCultivosForExport = (p) => {
    const base = Array.isArray(p.cultivos) && p.cultivos.length
        ? p.cultivos
        : (Array.isArray(p.cultivos_detalle) ? p.cultivos_detalle : []);
    return base.map(c => ({
        id: c.id ?? c.cultivo_id,
        nombre: c.nombre ?? getCultivoNameById(c.cultivo_id),
        superficie: c.superficie ?? null,
        cantidad: c.cantidad ?? null
    }));
    };

    const buildExportRow = (p) => {
    const cultivosArr = normalizeCultivosForExport(p);
    const productoresArr = Array.isArray(p.productores) ? p.productores : [];
    const productores_lista = productoresArr
        .map(pr => `${pr.cedula || pr.rif || ''} - ${pr.nombre || ''} ${pr.apellido || ''}`.trim())
        .filter(Boolean)
        .join(' | ');
    const cultivos_lista = cultivosArr
        .map(c => {
        const sup = c.superficie != null ? ` sup:${c.superficie}` : '';
        const cant = c.cantidad != null ? ` cant:${c.cantidad}` : '';
        return `${c.nombre}${sup}${cant}`;
        })
        .join(' | ');
    const cultivos_total_superficie = cultivosArr.reduce((a,x)=>a+(x.superficie?Number(x.superficie):0),0);
    const cultivos_total_cantidad = cultivosArr.reduce((a,x)=>a+(x.cantidad?Number(x.cantidad):0),0);
    return {
        ...p,
        productores_lista,
        cultivos_lista,
        cultivos_total_superficie,
        cultivos_total_cantidad
    };
    };

    const enrichedFiltrados = React.useMemo(
        () => (Array.isArray(datosFiltrados) ? datosFiltrados.map(buildExportRow) : []),
        [datosFiltrados]
    );

    function getPDFInfo() {
        if (datosFiltrados.length === datosOriginales.length) {
            return { fileName: 'Total_Propiedades.pdf', title: 'Listado de Todas las Propiedades Y Empresas' };
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
            data: enrichedFiltrados,
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
    
    const selectedFrom = (options, id) =>
        options.find(o => String(o.value) === String(id)) || null;

    const handleSelectChange = (field, opt) => {
        setFormData(prev => ({ ...prev, [field]: opt ? String(opt.value) : null }));
    };

    const resetFormData = () => {
        setFormData({
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
            cultivos_detalle: [],
            productores_ids: [],
            tipo_propiedad_id: null,
            estado_id: null,
            municipio_id: null,
            parroquia_id: null,
            sector_id: null,
            productor_id: null,
            posee_certificado: 'NO'
        });
        setErrors({});
    };

    // Helper: RIF completo
  const rifCompleto = () => `${String(formData.rif_tipo || '').trim()}${String(formData.rif_numero || '').trim()}`;

  // Validadores simples
  const isPositive = (v) => {
    const n = Number(String(v).replace(',', '.'));
    return Number.isFinite(n) && n > 0;
  };

const RIF_REGEX = /^(?:V|E|J|G|P)-\d{7,15}(?:-\d)?$/;

  // Valida todo el formulario y bloquea si hay errores
const validateForm = () => {
  const next = {};
  const rif = rifCompleto();
  if (!formData.rif_tipo || !String(formData.rif_numero || '').trim())
    next.rif = 'Debe seleccionar prefijo y número';
  else if (!RIF_REGEX.test(rif))
    next.rif = 'RIF inválido. Ej: J-12345678 o J-12345678-9';

  if (!String(formData.nombre || '').trim()) next.nombre = 'No puede dejar el campo vacío';
  if (!String(formData.sitios_asociados || '').trim()) next.sitios_asociados = 'No puede dejar el campo vacío';
  if (!String(formData.ubicacion || '').trim()) next.ubicacion = 'No puede dejar el campo vacío';

  if (!isPositive(formData.hectareas)) next.hectareas = 'Ingrese un número mayor a 0';
  if (!String(formData.c_cultivo || '').trim()) next.c_cultivo = 'Ingrese una cantidad';
  else if (!isPositive(formData.c_cultivo)) next.c_cultivo = 'La cantidad debe ser numérica y mayor a 0';
  if (!String(formData.c_cultivo_unidad || '').trim()) next.c_cultivo_unidad = 'Seleccione una unidad';

  ['tipo_propiedad_id','estado_id','municipio_id','parroquia_id','sector_id']
    .forEach(f => { if (!formData[f]) next[f] = 'Seleccione una opción'; });

  if (!Array.isArray(formData.productores_ids) || formData.productores_ids.length === 0)
    next.productores_ids = 'Seleccione al menos un productor';

  if (!formData.cultivos_detalle.length)
    next.cultivos_detalle = 'Agregue al menos un cultivo';
  else {
    formData.cultivos_detalle.forEach(f => {
      if (!f.cultivo_id) next.cultivos_detalle = 'Seleccione al menos un cultivo';
      if (f.superficie && (isNaN(Number(f.superficie)) || Number(f.superficie) <= 0))
        next.cultivos_detalle = 'Seleccione una superficie';
      if (f.cantidad && (isNaN(Number(f.cantidad)) || Number(f.cantidad) <= 0))
        next.cultivos_detalle = 'Seleccione una cantidad';
    });
  }

  setErrors(next);
  if (Object.keys(next).length) {
    addNotification('Corrige los campos obligatorios.', 'warning');
    return false;
  }
  return true;
};

const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));

    // Validación instantánea por regla existente
    const rule = getValidationRule(id);
    if (rule && rule.regex) {
        const { regex, errorMessage } = rule;
        const { valid, message } = validateField(value, regex, errorMessage);
        setErrors(prev => ({ ...prev, [id]: valid ? '' : message }));
        }

    // Campos obligatorios simples
    if (['nombre','sitios_asociados','ubicacion'].includes(id)) {
        setErrors(prev => ({ ...prev, [id]: String(value).trim() ? '' : 'No puede dejar el campo vacío' }));
        }
        if (id === 'hectareas') {
        setErrors(prev => ({ ...prev, hectareas: isPositive(value) ? '' : 'Ingrese un número mayor a 0' }));
        }
        if (id === 'c_cultivo') {
        setErrors(prev => ({ ...prev, c_cultivo: isPositive(value) ? '' : 'La cantidad debe ser numérica y mayor a 0' }));
        }
    };

    const handleProductoresMultiChange = (selected) => {
        setFormData(prev => ({ ...prev, productores_ids: selected ? selected.map(o => o.value) : [] }));
        setErrors(prev => ({ ...prev, productores_ids: selected && selected.length ? '' : 'Seleccione al menos un productor' }));
    };

    const handleEstadoChange = (opt) => {
        const id = opt ? opt.value : null;
        setFormData(prev => ({ ...prev, estado_id: id, municipio_id: null, parroquia_id: null, sector_id: null }));
        setErrors(prev => ({ ...prev, estado_id: id ? '' : 'Seleccione una opción', municipio_id: 'Seleccione un municipio', parroquia_id: 'Seleccione una parroquia', sector_id: 'Seleccione un sector' }));
        if (id) fetchMunicipios(id); else setMunicipios([]);
    };
    const handleMunicipioChange = (opt) => {
        const id = opt ? opt.value : null;
        setFormData(prev => ({ ...prev, municipio_id: id, parroquia_id: null, sector_id: null }));
        setErrors(prev => ({ ...prev, municipio_id: id ? '' : 'Seleccione una opción', parroquia_id: 'Seleccione una parroquia', sector_id: 'Seleccione un sector' }));
        if (id) fetchParroquias(id); else setParroquias([]);
    };
    const handleParroquiaChange = (opt) => {
        const id = opt ? opt.value : null;
        setFormData(prev => ({ ...prev, parroquia_id: id, sector_id: null }));
        setErrors(prev => ({ ...prev, parroquia_id: id ? '' : 'Seleccione una opción', sector_id: 'Seleccione un sector' }));
        if (id) fetchSectores(id); else setSectores([]);
    };
    const handleSectorChange = (opt) => {
        const id = opt ? opt.value : null;
        setFormData(prev => ({ ...prev, sector_id: id }));
        setErrors(prev => ({ ...prev, sector_id: id ? '' : 'Seleccione una opción' }));
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

        if (!validateForm()) return;

        
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
                posee_certificado: formData.posee_certificado,
                tipo_propiedad_id: formData.tipo_propiedad_id ? Number(formData.tipo_propiedad_id) : null,
                estado_id: formData.estado_id ? Number(formData.estado_id) : null,
                municipio_id: formData.municipio_id ? Number(formData.municipio_id) : null,
                parroquia_id: formData.parroquia_id ? Number(formData.parroquia_id) : null,
                sector_id: formData.sector_id ? Number(formData.sector_id) : null,
                cultivos_detalle: formData.cultivos_detalle
                    .filter(r => r.cultivo_id)
                    .map(r => ({
                        cultivo_id: Number(r.cultivo_id),
                        superficie: r.superficie !== '' ? Number(r.superficie) : null,
                        superficie_unidad: r.superficie_unidad || null,
                        cantidad: r.cantidad !== '' ? Number(r.cantidad) : null,
                        cantidad_unidad: r.cantidad_unidad || null
                    })),
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
  if (!validateForm()) return;

  setLoading(true);
  try {
    const cCultivoConcat = [formData.c_cultivo, formData.c_cultivo_unidad].filter(Boolean).join(' ').trim();
    const payload = {
      rif: `${formData.rif_tipo}${formData.rif_numero}`.trim(),
      nombre: formData.nombre,
      c_cultivo: cCultivoConcat || null,
      hectareas: formData.hectareas ? Number(formData.hectareas) : null,
      sitios_asociados: formData.sitios_asociados || null,
      ubicacion: formData.ubicacion || null,
      tipo_propiedad_id: formData.tipo_propiedad_id ? Number(formData.tipo_propiedad_id) : null,
      estado_id: formData.estado_id ? Number(formData.estado_id) : null,          // <- NUEVO
      municipio_id: formData.municipio_id ? Number(formData.municipio_id) : null,  // <- NUEVO
      parroquia_id: formData.parroquia_id ? Number(formData.parroquia_id) : null,  // <- NUEVO
      sector_id: formData.sector_id ? Number(formData.sector_id) : null,
      productor_id: formData.productores_ids[0] ? Number(formData.productores_ids[0]) : null, // <- NUEVO
      posee_certificado: formData.posee_certificado,
     cultivos_detalle: formData.cultivos_detalle
        .filter(r => r.cultivo_id)
        .map(r => ({
            cultivo_id: Number(r.cultivo_id),
            superficie: r.superficie !== '' ? Number(r.superficie) : null,
            superficie_unidad: r.superficie_unidad || null,
            cantidad: r.cantidad !== '' ? Number(r.cantidad) : null,
            cantidad_unidad: r.cantidad_unidad || null
        })),
      productores_ids: formData.productores_ids.map(Number) // normalizar
    };

    await axios.put(`${BaseUrl}/propiedad/${formData.id}`, payload, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    addNotification('Propiedad actualizada con éxito', 'success');
    fetchPropiedades();
    closeModal();
  } catch (error) {
    console.error('error actualizando la propiedad', error);
    if (error?.response?.status === 409) addNotification('RIF o Código ya existen', 'error');
    else addNotification('Error al actualizar propiedad', 'error');
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

const openModal = async () => {
    resetFormData();
    setErrors({});
    setRecentPropiedad(null);
    setStep(1);

    // Si los estados aún no están cargados, espera a que se carguen
    if (!estados.length) {
        await fetchEstados();
    }

    // Busca el id de Yaracuy (o el que quieras por defecto)
    const estadoPorDefecto = estados.find(e => e.nombre === 'Yaracuy')?.id || '23';

    setFormData(prev => ({
        ...prev,
        estado_id: String(estadoPorDefecto)
    }));

    fetchMunicipios(estadoPorDefecto);

    setCurrentModal('propiedad');
};
const closeModal = (limpiarUrl = true) => {
    setCurrentModal(null);
    if (limpiarUrl && window.location.search) {
        navigate(window.location.pathname, { replace: true });
    }
};

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
            posee_certificado:'NO',
            cultivos_detalle: (propiedad.cultivos || []).map(c => ({
                cultivo_id: String(c.id),
                superficie: c.superficie ?? '',
                superficie_unidad: c.superficie_unidad || '',
                cantidad: c.cantidad ?? '',
                cantidad_unidad: c.cantidad_unidad || ''
            })),
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
        closeModal(false);
    };

 const fmtNum = (v) => (v == null || v === '' ? '—' : Number(v).toLocaleString('es-VE', { maximumFractionDigits: 2 }));

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
                <h2>Detalles de la Propiedad/Empresa</h2>
                <form className='modalForm'>
                    <div className='formColumns_tree'>
                    <div className='formGroup'>
                        <label>Código Propiedad/Empresa:</label>
                        <input type="text" value={detalleModal.propiedad.codigo || ''} className='input' disabled />
                    </div>
                    <div className='formGroup'>
                        <label><span className='Unique'>*</span>Productor/Representante legal asociado:</label>
                        <MultiSelect
                        options={productoresOptions}
                        value={productoresOptions.filter(opt =>
                            (detalleModal.propiedad.productores || [])
                            .map(p => String(p.id))
                            .includes(String(opt.value))
                        )}
                        isDisabled
                        placeholder="Sin productores asociados"
                        />
                    </div>
                    <div className='formGroup'>
                        <label>RIF Personal/Empresarial:</label>
                        <input type="text" value={detalleModal.propiedad.rif || ''} className='input' disabled />
                    </div>
                    <div className='formGroup'>
                        <label>Nombre Propiedad/Empresa:</label>
                        <input type="text" value={detalleModal.propiedad.nombre || ''} className='input' disabled />
                    </div>
                    <div className='formGroup'>
                        <label>Tipo de Propiedad/Empresa:</label>
                        <SingleSelect
                        options={tiposOptions}
                        value={tiposOptions.find(opt => String(opt.value) === String(detalleModal.propiedad.tipo_propiedad_id)) || null}
                        isDisabled
                        />
                    </div>
                    <div className='formGroup'>
                        <label>Hectáreas totales:</label>
                        <input type="number" value={detalleModal.propiedad.hectareas || ''} className='input' disabled />
                    </div>
                    <div className='formGroup'>
                        <label>Superficie cultivada:</label>
                        <input type="text" value={detalleModal.propiedad.c_cultivo || ''} className='input' disabled />
                    </div>
                    <div className='formGroup span-full'>
                        <label>Cultivos (detalle):</label>
                        <div className='cultivosDetalleBox'>
                            <table className='miniTable'>
                                <thead>
                                    <tr>
                                        <th style={{width:'50%'}}>Cultivo</th>
                                        <th style={{width:'25%'}}>Superficie</th>
                                        <th style={{width:'25%'}}>Cantidad</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(detalleModal.propiedad.cultivos || []).length === 0 && (
                                        <tr><td colSpan={3} className='muted'>Sin cultivos</td></tr>
                                    )}
                                    {(detalleModal.propiedad.cultivos || []).map(c => (
                                        <tr key={c.id}>
                                            <td>{c.nombre}</td>
                                            <td>{fmtNum(c.superficie)} {c.superficie_unidad || ''}</td>
                                            <td>{fmtNum(c.cantidad)} {c.cantidad_unidad || ''}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                {(detalleModal.propiedad.cultivos || []).length > 0 && (
                                    <tfoot>
                                        <tr>
                                            <td style={{fontWeight:600}}>Totales</td>
                                            <td style={{fontWeight:600}}>
                                                {fmtNum((detalleModal.propiedad.cultivos || []).reduce((a,x)=>a+(x.superficie?Number(x.superficie):0),0))}
                                            </td>
                                            <td style={{fontWeight:600}}>
                                                {fmtNum((detalleModal.propiedad.cultivos || []).reduce((a,x)=>a+(x.cantidad?Number(x.cantidad):0),0))}
                                            </td>
                                        </tr>
                                    </tfoot>
                                )}
                            </table>
                        </div>
                    </div>
                    <div className='formGroup'>
                        <label>Sitio de Referencia:</label>
                        <input type="text" value={detalleModal.propiedad.sitios_asociados || ''} className='input' disabled />
                    </div>
                    <div className='formGroup'>
                        <label>Ubicación exacta:</label>
                        <input type="text" value={detalleModal.propiedad.ubicacion || ''} className='input' disabled />
                    </div>
                    <div className='formGroup'>
                        <label>Estatus de la Propiedad/Empresa:</label>
                        <span className={`badge-estado badge-${detalleModal.propiedad.estado}`}>
                        {detalleModal.propiedad.estado}
                        </span>
                    </div>
                    <div className='formGroup'>
                        <label>Estado:</label>
                        <SingleSelect
                        options={estadosOptions}
                        value={estadosOptions.find(opt => String(opt.value) === String(detalleModal.propiedad.estado_id)) || null}
                        isDisabled
                        />
                    </div>
                    <div className='formGroup'>
                        <label>Municipio:</label>
                        <SingleSelect
                        options={municipiosOptions}
                        value={municipiosOptions.find(opt => String(opt.value) === String(detalleModal.propiedad.municipio_id)) || null}
                        isDisabled
                        />
                    </div>
                    <div className='formGroup'>
                        <label>Parroquia:</label>
                        <SingleSelect
                        options={parroquiasOptions}
                        value={parroquiasOptions.find(opt => String(opt.value) === String(detalleModal.propiedad.parroquia_id)) || null}
                        isDisabled
                        />
                    </div>
                    <div className='formGroup'>
                        <label>Sector:</label>
                        <SingleSelect
                        options={sectoresOptions}
                        value={sectoresOptions.find(opt => String(opt.value) === String(detalleModal.propiedad.sector_id)) || null}
                        isDisabled
                        />
                    </div>
                    <div className='formGroup'>
                    <label>Posee certificado sanitario:</label>
                    <input type="text" value={(detalleModal.propiedad.posee_certificado || 'NO').toUpperCase()} className='input' disabled />
                    </div>
                    </div>
                </form>
                </div>
            </div>
            )}

            {/* Modal Registro / Edición */}
            {currentModal === 'propiedad' && (
            <div className='modalOverlay'>
                <div className={step === 2 ? 'modal' : 'modal_tree'}>
                <button className='closeButton' onClick={closeModal}>&times;</button>
                {step === 1 ? (
                    <>
                    <h2>{formData.id ? 'Editar Propiedad - Empresa' : 'Registrar Propiedad - Empresa'}</h2>
                    <form className='modalForm'>
                        <div className='formColumns_tree'>
                        <div className='formGroup'>
                            <label><span className='Unique'>*</span>Productor/Representante Legal:</label>
                            <MultiSelect
                            options={productoresOptions}
                            value={productoresOptions.filter(opt => formData.productores_ids.includes(opt.value))}
                            onChange={handleProductoresMultiChange}
                            placeholder="Seleccione Productores/Representantes"
                            />
                            {formData.productores_ids.length > 0 && (
                            <button type="button" onClick={() => clearMultiSelect('productores_ids')} className='btn-limpiar'>Limpiar</button>
                            )}
                        </div>
                        <div className='formGroup'>
                            <label htmlFor="rif_numero"><span className='Unique'>*</span>RIF Personal/Empresarial:</label>
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
                                placeholder="Ej: 12345678 o 12345678-9"
                                value={formData.rif_numero}
                                onChange={(e) => {
                                const digits = e.target.value.replace(/\D/g, '').slice(0, 16);
                                const formatted = digits.length > 8
                                    ? `${digits.slice(0, -1)}-${digits.slice(-1)}`
                                    : digits;
                                setFormData(prev => ({ ...prev, rif_numero: formatted }));
                                setErrors(prev => ({ ...prev, rif: '' }));
                                }}
                                style={{ flex: 1 }}
                            />
                            </div>
                            {errors.rif && <span className='errorText'>{errors.rif}</span>}
                        </div>
                        <div className='formGroup'>
                            <label htmlFor="nombre"><span className='Unique'>*</span>Nombre Propiedad/Empresa:</label>
                            <input type="text" id="nombre" value={formData.nombre} onChange={handleChange} placeholder="Nombre de la Propiedad" className='input' />
                            {errors.nombre && <span className='errorText'>{errors.nombre}</span>}
                        </div>
                        <div className='formGroup'>
                            <label><span className='Unique'>*</span>Tipo de Propiedad/Empresa:</label>
                            <SingleSelect
                            options={tiposOptions}
                            value={selectedFrom(tiposOptions, formData.tipo_propiedad_id)}
                            onChange={(opt) => handleSelectChange('tipo_propiedad_id', opt)}
                            placeholder="Tipo de Propiedad"
                            />
                        </div>
                        <div className='formGroup'>
                            <label><span className='Unique'>*</span>Cultivos/Rubros</label>
                            <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
                                <button
                                type="button"
                                className='btn-estandar'
                                onClick={openCultivosModal}
                                title='Gestionar cultivos'
                                style={{height:30}}
                                >
                                Seleccionar Rubros
                                </button>
                                {errors.cultivos_detalle && (
                                <span className='errorText' style={{marginLeft:6}}>{errors.cultivos_detalle}</span>
                                )}
                            </div>

                            <div className='chipsContainer'>
                            {(formData.cultivos_detalle || []).map((r, idx) => (
                                <span
                                    key={idx}
                                    className='chip'
                                    title={
                                    `${getCultivoNameById(r.cultivo_id)}`
                                    + (r.superficie !== '' ? ` · sup:${r.superficie} ${r.superficie_unidad || ''}` : '')
                                    + (r.cantidad !== '' ? ` · cant:${r.cantidad} ${r.cantidad_unidad || ''}` : '')
                                    }
                                >
                                    {getCultivoNameById(r.cultivo_id)}
                                    {r.superficie !== '' ? ` · sup: ${r.superficie} ${r.superficie_unidad || ''}` : ''}
                                    {r.cantidad !== '' ? ` · cant: ${r.cantidad} ${r.cantidad_unidad || ''}` : ''}
                                </span>
                                ))}
                            {(!formData.cultivos_detalle || formData.cultivos_detalle.length === 0) && (
                                <span style={{color:'#888', fontSize:12}}>Sin cultivos/Rubros seleccionados</span>
                            )}
                            </div>
                        </div>
                        <div className='formGroup'>
                            <label><span className='Unique'>*</span>Hectáreas totales:</label>
                            <input type="input" id="hectareas" value={formData.hectareas} onChange={handleChange} placeholder="Ej: 321" className='number' />
                        </div>
                        <div className='formGroup'>
                            <label><span className='Unique'>*</span>Superficie cultivada:</label>
                            <div style={{ display: 'flex', gap: 8 }}>
                            <input
                                type="input"
                                id="c_cultivo"
                                className='input'
                                value={formData.c_cultivo}
                                onChange={handleChange}
                                placeholder="Ej: 321"
                                style={{ flex: 1 }}
                            />
                            <SingleSelect
                                options={unidadesOptions}
                                value={selectedFrom(unidadesOptions, formData.c_cultivo_unidad)}
                                onChange={(opt) => setFormData(prev => ({ ...prev, c_cultivo_unidad: opt?.value || '' }))}
                                placeholder="Unidad"
                                isClearable
                            />
                            </div>
                            {errors.c_cultivo && <span className='errorText'>{errors.c_cultivo}</span>}
                        </div>
                    
                        <div className='formGroup'>
                        <label><span className='Unique'>*</span>Punto de referencia:</label>
                        <input type="text" id="sitios_asociados" value={formData.sitios_asociados} onChange={handleChange} placeholder="Lugar de referencia" className='input' />
                        {errors.sitios_asociados && <span className='errorText'>{errors.sitios_asociados}</span>}
                        </div>
                        <div className='formGroup'>
                        <label><span className='Unique'>*</span>Ubicación exacta:</label>
                        <input type="text" id="ubicacion" value={formData.ubicacion} onChange={handleChange} placeholder="Ubicación" className='input' />
                        {errors.ubicacion && <span className='errorText'>{errors.ubicacion}</span>}
                        </div>
                        <div className='formGroup'>
                        <label><span className='Unique'>*</span>Estado:</label>
                        <SingleSelect
                            options={estadosOptions}
                            value={estadosOptions.find(o => o.value === String(formData.estado_id)) || null}
                            onChange={handleEstadoChange}
                            placeholder="Seleccione un estado"
                        />
                        </div>
                        <div className='formGroup'>
                        <label><span className='Unique'>*</span>Municipio:</label>
                        <SingleSelect
                            options={municipiosOptions}
                            value={municipiosOptions.find(o => o.value === String(formData.municipio_id)) || null}
                            onChange={handleMunicipioChange}
                            isDisabled={!formData.estado_id || municipiosOptions.length === 0}
                            placeholder="Seleccione un municipio"
                            />
                        </div>
                        <div className='formGroup'>
                        <label><span className='Unique'>*</span>Parroquia:</label>
                        <SingleSelect
                            options={parroquiasOptions}
                            value={parroquiasOptions.find(o => o.value === String(formData.parroquia_id)) || null}
                            onChange={handleParroquiaChange}
                            isDisabled={!formData.municipio_id || parroquiasOptions.length === 0}
                            placeholder="Seleccione una parroquia"
                            />
                        </div>
                        <div className='formGroup'>
                        <label><span className='Unique'>*</span>Sector:</label>
                        <SingleSelect
                            options={sectoresOptions}
                            value={sectoresOptions.find(o => o.value === String(formData.sector_id)) || null}
                            onChange={handleSectorChange}
                            isDisabled={!formData.parroquia_id || sectoresOptions.length === 0}
                            placeholder="Seleccione un sector"
                        />
                        </div>
                        <div className='formGroup'>
                            <label><span className='Unique'>*</span>Posee certificado sanitario:</label>
                            <div className='radio-group'>{/* <- aplica estilos */}
                                <label className='radio-label'>
                                    <input
                                        type="radio"
                                        className="radio-input"
                                        name="posee_certificado"
                                        value="SI"
                                        checked={formData.posee_certificado === 'SI'}
                                        onChange={() => setFormData(prev => ({ ...prev, posee_certificado: 'SI' }))}
                                    />
                                    <span>Si</span>
                                </label>
                                <label className='radio-label'>
                                    <input
                                        type="radio"
                                        className="radio-input"
                                        name="posee_certificado"
                                        value="NO"
                                        checked={formData.posee_certificado === 'NO'}   // <- siempre queda marcado por defecto
                                        onChange={() => setFormData(prev => ({ ...prev, posee_certificado: 'NO' }))}
                                    />
                                    <span>No</span>
                                </label>
                            </div>
                        </div>
                    </div>
                        <button
                            type="button"
                            className='saveButton'
                            onClick={formData.id ? handleEdit : handleSave}
                            disabled={loading}
                            title={formData.id ? 'Actualizar Propiedad' : 'Registrar Propiedad'}
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
                    <div className='modalActions' style={{ marginTop: 16, display:'flex', gap:8 }}>
                        <button className='Button-btn' onClick={goToNextScreen}>Continuar</button>
                        <button className='cancelButton' onClick={closeModal}>Más tarde</button>
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

            {/* Sub‑modal Cultivos */}
            {cultivosModalAbierto && (
            <div className='modalOverlay'>
                <div className='modal'>
                <button className='closeButton' onClick={closeCultivosModal}>&times;</button>
                <h2>Gestionar cultivos</h2>
                <div className='formGroup'>
                    <label>Agregar varios cultivos rápidamente:</label>
                    <MultiSelect
                    options={cultivosOptions}
                    value={cultivosOptions.filter(o =>
                        (tempCultivos || []).some(r => String(r.cultivo_id) === String(o.value))
                    )}
                    onChange={handleBulkSelectCultivos}
                    placeholder="Seleccione uno o varios cultivos"
                    />
                </div>
                <div className='formGroup' style={{marginTop:10}}>
                    <label>Detalles de los cultivos:</label>
                    <div style={{display:'flex', flexDirection:'column', gap:8, marginTop:6, maxHeight:'42vh', overflow:'auto'}}>
                    {(tempCultivos || []).map((fila, idx) => (
                        <div key={idx} style={{display:'grid', gridTemplateColumns:'1fr 110px 110px 110px 110px 40px', gap:8}}>
                            <SingleSelect
                            options={cultivosOptions}
                            value={cultivosOptions.find(o => String(o.value) === String(fila.cultivo_id)) || null}
                            onChange={(opt)=>updateTempFila(idx,'cultivo_id',opt?opt.value:'')}
                            placeholder="Cultivo"
                            />
                            <input
                            type="number"
                            className='input'
                            placeholder="Sup."
                            value={fila.superficie}
                            onChange={(e)=>updateTempFila(idx,'superficie',e.target.value)}
                            />
                            <SingleSelect
                            options={UNIDADES_SUPERFICIE.map(u => ({ value: u, label: u }))}
                            value={fila.superficie_unidad ? { value: fila.superficie_unidad, label: fila.superficie_unidad } : null}
                            onChange={opt => updateTempFila(idx, 'superficie_unidad', opt ? opt.value : '')}
                            placeholder="Unidad"
                            isClearable
                            />
                            <input
                            type="number"
                            className='input'
                            placeholder="Cant."
                            value={fila.cantidad}
                            onChange={(e)=>updateTempFila(idx,'cantidad',e.target.value)}
                            />
                            <SingleSelect
                            options={UNIDADES_CANTIDAD.map(u => ({ value: u, label: u }))}
                            value={fila.cantidad_unidad ? { value: fila.cantidad_unidad, label: fila.cantidad_unidad } : null}
                            onChange={opt => updateTempFila(idx, 'cantidad_unidad', opt ? opt.value : '')}
                            placeholder="Unidad"
                            isClearable
                            />
                            <div style={{position:'relative', top:20, right:20}}>
                            <button type="button" className='closeButton2' onClick={()=>removeTempFila(idx)} title='Eliminar fila'>&times;</button>
                            </div>
                        </div>
                        ))}
                    </div>
                </div>
                <div className='modalActions' style={{marginTop:12}}>
                    <button type="button" className='btn-estandar' onClick={addTempFila}>Agregar fila</button>
                    <button className='cancelButton' onClick={guardarCultivosModal}>Guardar</button>
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

                        {tienePermiso('propiedad','exportar') && (
                            <button
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
                                data: enrichedFiltrados,
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
                                        <span className={`badge-estado badge-${String(item.estado).toLowerCase().replace(/\s/g, '_')}`}>
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