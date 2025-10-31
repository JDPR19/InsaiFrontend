import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../main.css';
import MultiSelect from '../../components/selectmulti/MultiSelect';
import icon from '../../components/iconos/iconos';
import Spinner from '../../components/spinner/Spinner';
import SearchBar from '../../components/searchbart/SearchBar';
import SingleSelect from '../../components/selectmulti/SingleSelect';
import CardsCarousel from '../../components/CarruselCartas/CarruselCartas';
import { exportToPDF, exportToExcel } from '../../utils/exportUtils';
import { usePermiso } from '../../hooks/usePermiso';
import { BaseUrl } from '../../utils/constans';
import { useNotification } from '../../utils/NotificationContext';
import { filterData } from '../../utils/filterData';
import { buildInspeccionActaBlob } from '../../components/pdf/ActaVigilancia';
import AyudaTooltip from '../../components/ayudanteinfo/AyudaTooltip';


function InspeccionesEst() {
  const navigate = useNavigate();
  const tienePermiso = usePermiso();
  const { addNotification } = useNotification();
  const user = JSON.parse(localStorage.getItem('user'));
  const rol = user?.roles_nombre;
  const empleadoId = user?.empleado_id;
  // const puedeVerSeguimiento = ['Administrador', 'Moderador'].includes(rol);

  // Estado de datos
  const [datosOriginales, setDatosOriginales] = useState([]);
  const [datosFiltrados, setDatosFiltrados] = useState([]);
  const [formData, setFormData] = useState({
    id: '',
    codigo_inspeccion: '',
    n_control: '',
    area: 'VEGETAL',
    fecha_inspeccion: '',
    hora_inspeccion: '',
    responsable_e: 'No Especificado',
    cedula_res: 'No Especificado',
    tlf: 'No Especificado',
    correo: 'No Especificado',
    norte: '',
    este: '',
    zona: '',
    aspectos: '',
    ordenamientos: '',
    fecha_proxima_inspeccion: '',
    estado: '',
    planificacion_id: null,
    finalidades: [],
  });

const estadosFinales = [
  'finalizada',
  'no aprobada',
  'no atendida',
  'seguimiento',
  'cuarentena'
];
  // Estado UI
  const [loading, setLoading] = useState(false);
  const [currentModal, setCurrentModal] = useState(null);
  const [detalleModal, setDetalleModal] = useState({ abierto: false, inspeccion: null });
  const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);
  const [selectedInspeccionId, setSelectedInspeccionId] = useState(null);
  const [showOpcionales, setShowOpcionales] = useState(false);
  const [galeriaModal, setGaleriaModal] = useState({ abierto: false, imagenes: [] });
  const [estadoModal, setEstadoModal] = useState({ abierto: false, id: null, estado: 'finalizada' });
  const mostrarTodas = () => setDatosFiltrados(datosOriginales);
  const mostrarCuarentena = () => setDatosFiltrados((datosOriginales || []).filter(i => normEstado(i.estado) === 'cuarentena'));
  const mostrarAprobadas = () => setDatosFiltrados((datosOriginales || []).filter(i => normEstado(i.estado) === 'finalizada'));
  const mostrarRechazadas = () => setDatosFiltrados((datosOriginales || []).filter(i => normEstado(i.estado) === 'no aprobada'));
  
  const normEstado = (s) => String(s || '').toLowerCase().trim();
  const [totales, setTotales] = useState({
    inspeccionesTotales: 0,
    inspeccionesCreadas: 0,
    inspeccionesAprobadas: 0,
    inspeccionesRechazadas: 0,
  });
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfFileName, setPdfFileName] = useState('');
  const [programasFito, setProgramasFito] = useState([]);
  const [programasAsociadosIds, setProgramasAsociadosIds] = useState([]);
  const [selectedProgramas, setSelectedProgramas] = useState([]);
  const [decisionFrases,   setDecisionFrases] = useState([]);
  const [decisionOtro,     setDecisionOtro]   = useState('');
  const programaOptions = useMemo(
    () => (programasFito || []).map(p => ({
      value: String(p.id),
      label: p.nombre,
      // marca opción como deshabilitada si ya está asociada
      isDisabled: (programasAsociadosIds || []).includes(String(p.id))
    })),
    [programasFito, programasAsociadosIds]
  );

  const SUGERENCIAS = useMemo(() => ({
    default: [
      'Se realizará seguimiento semanal al programa.',
      'Monitoreo de humedad y temperatura.',
      'Muestreo y registro fotográfico.',
      'Acciones de control conforme a protocolo.'
    ],
    'Monitoreo fitosanitario': [
      'Monitoreo y muestreo semanal.',
      'Control de humedad y ventilación.',
      'Registro de focos y tendencia poblacional.'
    ],
    'Control de plagas': [
      'Fumigación según protocolo.',
      'Aireación controlada.',
      'Limpieza y desinfección del área.'
    ],
    'Buenas prácticas de manufactura': [
      'Mantenimiento preventivo de equipos.',
      'Capacitación del personal.',
      'Registro de lotes y segregación adecuada.'
    ]
  }), []);
 
  const columnsInspecciones = [
    { header: 'Código', key: 'codigo_inspeccion' },
    { header: 'N° Control', key: 'n_control' },
    { header: 'Fecha', key: 'fecha_inspeccion' },
    { header: 'Hora', key: 'hora_inspeccion' },
    { header: 'Estado', key: 'estado' },
    { header: 'Solicitud', key: 'solicitud_codigo' },
    { header: 'Planificación', key: 'planificacion_codigo' },
    { header: 'Aspectos', key: 'aspectos' },
    { header: 'Ordenamientos', key: 'ordenamientos' },
  ];

  const frasesPorSeleccion = useMemo(() => {
    const labels = (selectedProgramas || []).map(s => s.label);
    const set = new Set();
    labels.forEach(lbl => (SUGERENCIAS[lbl] || []).forEach(f => set.add(f)));
    (SUGERENCIAS.default || []).forEach(f => set.add(f));
    const arr = Array.from(set);
    if (!arr.includes('Otro')) arr.push('Otro'); // ← agrega “Otro” como en Solicitudes
    return arr;
  }, [selectedProgramas, SUGERENCIAS]);

  const toggleFrase = (f) => {
    setDecisionFrases(prev => {
      const s = new Set(prev);
      if (s.has(f)) s.delete(f); else s.add(f);
      return Array.from(s);
    });
    if (f === 'Otro') {
      // si desmarcan “Otro”, limpia el texto
      setDecisionOtro(prev => (decisionFrases.includes('Otro') ? '' : prev));
    }
  };

  const buildDescripcionAcciones = (frases = [], otro = '') => {
    const base = (frases || []).filter(m => m && m !== 'Otro');
    const addOtro = (frases || []).includes('Otro') && (otro || '').trim()
      ? `Otro: ${otro.trim()}`
      : null;
    return [...base, addOtro].filter(Boolean).join(' | ');
  };

function getPDFInfo() {
    const all = Array.isArray(datosOriginales) ? datosOriginales : [];
    const cur = Array.isArray(datosFiltrados) ? datosFiltrados : [];

    const sameSize = cur.length === all.length;
    const allEstadoIs = (estado) => cur.length > 0 && cur.every(i => String(i.estado || '').toLowerCase() === estado);


    if (sameSize) {
  return { fileName: 'Inspecciones_Todas.pdf', title: 'Listado de Inspecciones' };
}
if (allEstadoIs('creada'))           return { fileName: 'Inspecciones_Creadas.pdf',        title: 'Inspecciones Creadas' };
if (allEstadoIs('diagnosticada'))    return { fileName: 'Inspecciones_Diagnosticadas.pdf', title: 'Inspecciones Diagnosticadas' };
if (allEstadoIs('inspeccionando'))   return { fileName: 'Inspecciones_Inspeccionando.pdf', title: 'Inspecciones en Proceso' };
if (allEstadoIs('no aprobada'))      return { fileName: 'Inspecciones_NoAprobadas.pdf',    title: 'Inspecciones No Aprobadas' };
if (allEstadoIs('seguimiento'))      return { fileName: 'Inspecciones_Seguimiento.pdf',    title: 'Inspecciones en Seguimiento' };
if (allEstadoIs('cuarentena'))       return { fileName: 'Inspecciones_Cuarentena.pdf',     title: 'Inspecciones en Cuarentena' };
if (allEstadoIs('finalizada'))       return { fileName: 'Inspecciones_Finalizadas.pdf',    title: 'Inspecciones Finalizadas' };
if (allEstadoIs('no atendida'))      return { fileName: 'Inspecciones_NoAtendidas.pdf',    title: 'Inspecciones No Atendidas' };

    return { fileName: 'Inspecciones_Filtradas.pdf', title: 'Listado de Inspecciones Filtradas' };
}

  const handlePreviewPDF = () => {
    const { fileName, title } = getPDFInfo();
    const blob = exportToPDF({
      data: datosFiltrados,
      columns: columnsInspecciones,
      fileName,
      title,
      preview: true
    });
    const url = URL.createObjectURL(blob);
    setPdfUrl(url);
    setPdfFileName(fileName);
  };

  const handleExportExcel = () => {
    const { fileName } = getPDFInfo();
    const excelFileName = fileName.replace('.pdf', '.xlsx');
    exportToExcel({
      data: datosFiltrados,
      columns: columnsInspecciones,
      fileName: excelFileName,
      count: true,
      totalLabel: 'TOTAL REGISTROS'
    });
  };

  
const toPdfPayload = (det) => {
  const d = det || {};
  return {
    inspeccion: {
      id: d.id,
      codigo_inspeccion: d.codigo_inspeccion,
      n_control: d.n_control,
      fecha_inspeccion: d.fecha_inspeccion,     
      hora_inspeccion: d.hora_inspeccion,       
      norte: d.norte,                           
      este: d.este,                             
      zona: d.zona,                             
      aspectos: d.aspectos,                     
      ordenamientos: d.ordenamientos,           
      anexos: d.anexos,                         
      area: d.area,                             
      estado: d.estado,
      vigencia: d.vigencia,
      fecha_proxima_inspeccion: d.fecha_proxima_inspeccion,
      finalidades: Array.isArray(d.finalidades) ? d.finalidades : [], 
      inspectores: d.inspectores || d.empleados || [],
      imagenes: Array.isArray(d.imagenes) ? d.imagenes : []                  
    },
    
    propiedad: d.propiedad || {
      nombre: d.propiedad_nombre,
      rif: d.propiedad_rif,
      ubicacion: d.propiedad_ubicacion || d.ubicacion,
      direccion: d.direccion,
      sector_nombre: d.sector_nombre || d.sector,
      municipio_nombre: d.municipio_nombre || d.municipio,
      parroquia_nombre: d.parroquia_nombre || d.parroquia,
      estado_nombre: d.estado_nombre || d.estado_propiedad_nombre
    },
    
    representantes: d.propietario ? {
      propietarioNombre: [d.propietario.nombre, d.propietario.apellido].filter(Boolean).join(' '),
      propietarioCedula: d.propietario.cedula,
      runsai: d.propietario.codigo
    } : {
      propietarioNombre: [d.productor_nombre, d.productor_apellido].filter(Boolean).join(' '),
      propietarioCedula: d.productor_cedula,
      runsai: d.productor_codigo
    },
    
    personaAtiende: {
      nombre: d.responsable_e,
      cedula: d.cedula_res,
      correo: d.correo,
      telefono: d.tlf
    }
  };
};


const finalidadCatalogFromOptions = (options) =>
  (options || []).map(o => ({ id: String(o.value), nombre: o.label }));

const handleActaPDF = async (item) => {
  try {
    setLoading(true);

    const detalle = await axios.get(`${BaseUrl}/inspecciones/${item.id}/ActaVigilancia`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).then(r => r.data);

    const payload = toPdfPayload(detalle);
    payload.finalidadCatalogo = finalidadCatalogFromOptions(finalidadOptions);
    payload.uploadsBaseUrl = `${BaseUrl}/inspecciones/imagenes/jpg`;
    // console.log('IMAGENES PARA PDF:', payload.inspeccion.imagenes, payload.uploadsBaseUrl);
    const blob = await buildInspeccionActaBlob(payload);
    const url = URL.createObjectURL(blob);
    setPdfUrl(url);
    setPdfFileName(`Acta_Inspeccion_Fines_Vigilancia${payload.inspeccion.codigo_inspeccion || payload.inspeccion.n_control || payload.inspeccion.id}.pdf`);
  } catch (e) {
    console.error(e);
    addNotification('No se pudo generar el Acta con los datos del registro.', 'error');
  } finally {
    setLoading(false);
  }
};

  // const handleSeguimiento = (inspeccionId) => {
  //   if (!puedeVerSeguimiento) {
  //     addNotification('No tiene permiso para ver el seguimiento.', 'error');
  //     return;
  //   }
  //   navigate(`/inspecciones/${inspeccionId}/seguimiento`);
  // };

  useEffect(() => {
    const arr = Array.isArray(datosOriginales) ? datosOriginales : [];
    const cuarentena = arr.filter(i => normEstado(i.estado) === 'cuarentena').length;
    const finalizadas = arr.filter(i => normEstado(i.estado) === 'finalizada').length;
    const noAprobadas = arr.filter(i => normEstado(i.estado) === 'no aprobada').length;
    setTotales({
      inspeccionesTotales: arr.length,
      inspeccionesCuarentena: cuarentena,
      inspeccionesAprobadas: finalizadas,
      inspeccionesRechazadas: noAprobadas,
    });
  }, [datosOriginales]);



  const [planificaciones, setPlanificaciones] = useState([]);
  const [finalidadesCatalogo, setFinalidadesCatalogo] = useState([]);
  const [planificacionActualOpt, setPlanificacionActualOpt] = useState(null);
  // Imágenes
  const [imagenes, setImagenes] = useState([]); 
  const [previewUrls, setPreviewUrls] = useState([]);
  const [imagenesGuardadas, setImagenesGuardadas] = useState([]); 
  const [imagenesAEliminar, setImagenesAEliminar] = useState([]); 
  // Paginación
  const itemsPerPage = 8;
  const [currentPage, setCurrentPage] = useState(1);

  
  // Opciones de selects 
const planificacionOptions = useMemo(() => {
  return (planificaciones || []).map((p) => ({
    value: String(p.id),
    label: `${p.solicitud_codigo || 'SIN-SOL'} - ${p.codigo || 'SIN-PLAN'}`,
    empleados: p.empleados || [],
  }));
}, [planificaciones]);

const planificacionOptionsFiltradas = useMemo(() => {
  if (!planificacionOptions) return [];
  // Si es admin o moderador, muestra todas las planificaciones disponibles
  if (rol === 'Administrador' || rol === 'Moderador') {
    return planificacionOptions;
  }
  // Si es inspector, solo muestra las planificaciones donde él está asignado
  if (rol === 'inspector' && empleadoId) {
    return planificacionOptions.filter(opt =>
      Array.isArray(opt.empleados) &&
      opt.empleados.some(e => String(e.id) === String(empleadoId))
    );
  }
  // Por defecto, no muestra nada
  return [];
}, [planificacionOptions, rol, empleadoId]);
  
  const planificacionOptionsEdit = useMemo(() => {
    const baseOptions = formData.id ? planificacionOptionsFiltradas : planificacionOptions;
    if (!planificacionActualOpt) return baseOptions;
    const exists = baseOptions.some(o => o.value === planificacionActualOpt.value);
    return exists ? baseOptions : [planificacionActualOpt, ...baseOptions];
  }, [planificacionOptionsFiltradas, planificacionOptions, planificacionActualOpt, formData.id]);

  const finalidadOptions = useMemo(() => {
    return (finalidadesCatalogo || []).map((f) => ({
      value: String(f.id),
      label: f.nombre,
    }));
  }, [finalidadesCatalogo]);

  const MAX_FILES = 10;
  const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB
  const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/jpg']);

  // Fetchers
  const fetchInspecciones = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${BaseUrl}/inspecciones`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setDatosOriginales(Array.isArray(data) ? data : []);
      setDatosFiltrados(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al obtener inspecciones:', error);
      addNotification('Error al obtener inspecciones', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchProgramasFito = async () => {
    const { data } = await axios.get(`${BaseUrl}/seguimiento/programas_fito`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    setProgramasFito(Array.isArray(data) ? data : []);
  };
  const fetchProgramasAsociados = async (inspeccionId) => {
    const { data } = await axios.get(`${BaseUrl}/seguimiento/inspeccion/${inspeccionId}/programas`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    const lista = Array.isArray(data) ? data : [];
    setProgramasAsociadosIds(lista.map(p => String(p.programa_fito_id || p.id)));
    // Preselección en el multiselect
    setSelectedProgramas(
      lista
        .map(p => ({
          value: String(p.programa_fito_id || p.id),
          label: p.programa_nombre || p.nombre || `Programa ${p.programa_fito_id || p.id}`
        }))
    );
  };

  const fetchPlanificaciones = async () => {
    try {
      const { data } = await axios.get(`${BaseUrl}/inspecciones/planificaciones/all`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setPlanificaciones(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al obtener planificaciones:', error);
      addNotification('Error al obtener planificaciones', 'error');
    }
  };

  const fetchFinalidadesCatalogo = async () => {
    try {
      const { data } = await axios.get(`${BaseUrl}/finalidad_catalogo`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setFinalidadesCatalogo(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al obtener finalidades:', error);
      addNotification('Error al obtener finalidades', 'error');
    }
  };

  useEffect(() => {
    fetchInspecciones();
    fetchPlanificaciones();
    fetchFinalidadesCatalogo();
  }, []);


  // Helpers formulario
  const resetFormData = () => {
    setFormData({
      id: '',
      codigo_inspeccion: '',
      n_control: '',
      area: 'VEGETAL',
      fecha_inspeccion: '',
      hora_inspeccion: '',
      responsable_e: 'No Especificado',
      cedula_res: 'No Especificado',
      tlf: 'No Especificado',
      correo: 'No Especificado',
      norte: '',
      este: '',
      zona: '',
      aspectos: '',
      ordenamientos: '',
      estado: '',
      planificacion_id: null,
      finalidades: [],
    });
    setImagenes([]);
    setPreviewUrls([]);
    setImagenesGuardadas([]);
    setImagenesAEliminar([]);
    setShowOpcionales(false);
    setPlanificacionActualOpt(null);
  };

  const openModal = async () => {
  resetFormData();
    try { await fetchPlanificaciones();} catch (error) {console.error(error);}
  setCurrentModal('inspeccion');
};

  const closeModal = () => {
    resetFormData();
    setCurrentModal(null);
  };

  const openDetalleModal = async (inspeccion) => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${BaseUrl}/inspecciones/${inspeccion.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setDetalleModal({ abierto: true, inspeccion: data });
    } catch {
      setDetalleModal({ abierto: true, inspeccion });
    } finally {
      setLoading(false);
    }
  };
  const closeDetalleModal = () => setDetalleModal({ abierto: false, inspeccion: null });

  const openConfirmDeleteModal = (id) => {
    setSelectedInspeccionId(id);
    setConfirmDeleteModal(true);
  };
  const closeConfirmDeleteModal = () => {
    setSelectedInspeccionId(null);
    setConfirmDeleteModal(false);
  };

  // Galería
  const openGaleriaModal = async (inspeccionId) => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${BaseUrl}/inspecciones/imagenes/${inspeccionId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setGaleriaModal({ abierto: true, imagenes: Array.isArray(data) ? data : [] });
    } catch (e) {
      console.error('Error cargando imágenes:', e);
      addNotification('No se pudieron cargar las imágenes', 'error');
      setGaleriaModal({ abierto: true, imagenes: [] });
    } finally {
      setLoading(false);
    }
  };

  const closeGaleriaModal = () => setGaleriaModal({ abierto: false, imagenes: [] });



  // Abrir Edición
  const openEditModal = async (item) => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${BaseUrl}/inspecciones/${item.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      // Opción fallback actual para edición
      const optPlan = data.planificacion_id
        ? {
            value: String(data.planificacion_id),
            label: `${data.solicitud_codigo || 'SIN-SOL'} - ${data.planificacion_codigo || 'SIN-PLAN'}`
          }
        : null;
      setPlanificacionActualOpt(optPlan);

      // Finalidades a objeto { value, label }
      const finalidadesForm = (data.finalidades || []).map(f => ({
        finalidad_id: {
          value: String(f.finalidad_id),
          label: finalidadOptions.find(o => String(o.value) === String(f.finalidad_id))?.label || f.finalidad || 'Finalidad'
        },
        objetivo: f.objetivo || ''
      }));

      setFormData(prev => ({
        ...prev,
        id: data.id,
        codigo_inspeccion: data.codigo_inspeccion || '',
        n_control: data.n_control || '',
        area: data.area || 'VEGETAL',
        fecha_inspeccion: data.fecha_inspeccion || '',
        hora_inspeccion: data.hora_inspeccion || '',
        responsable_e: data.responsable_e || 'No Especificado',
        cedula_res: data.cedula_res || 'No Especificado',
        tlf: data.tlf || 'No Especificado',
        correo: data.correo || 'No Especificado',
        norte: data.norte ?? '',
        este: data.este ?? '',
        zona: data.zona ?? '',
        aspectos: data.aspectos || '',
        ordenamientos: data.ordenamientos || '',
        estado: data.estado || 'diagnosticada',
        planificacion_id: optPlan,           // SingleSelect
        finalidades: finalidadesForm
      }));

      setImagenesGuardadas(Array.isArray(data.imagenes) ? data.imagenes : []);
      setImagenesAEliminar([]);
      setPreviewUrls([]);
      setCurrentModal('inspeccion');
    } catch (error) {
      console.error(error);
      addNotification('No se pudo cargar el detalle para editar', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handlers inputs
  const handleSelectChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFinalidadChange = (index, field, value) => {
    setFormData((prev) => {
      const finalidades = [...prev.finalidades];
      finalidades[index][field] = value;
      return { ...prev, finalidades };
    });
  };

  const addFinalidad = () => {
    setFormData((prev) => ({
      ...prev,
      finalidades: [...prev.finalidades, { finalidad_id: null, objetivo: '' }],
    }));
  };

  const removeFinalidad = (index) => {
    setFormData((prev) => ({
      ...prev,
      finalidades: prev.finalidades.filter((_, i) => i !== index),
    }));
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  // Imágenes
  useEffect(() => {
    return () => {
      previewUrls.forEach((u) => URL.revokeObjectURL(u));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileChange = (e) => {
    const incoming = Array.from(e.target.files || []);
    if (!incoming.length) return;

    const already = (formData.id ? imagenesGuardadas.length : 0) + imagenes.length;
    if (already >= MAX_FILES) {
      addNotification(`Máximo ${MAX_FILES} imágenes por inspección`, 'warning');
      return;
    }

    const room = Math.max(0, MAX_FILES - already);
    const selected = incoming.slice(0, room);

    const accepted = [];
    const previews = [];
    let rejected = 0;

    for (const file of selected) {
      if (!ALLOWED_TYPES.has(file.type)) { rejected++; continue; }
      if (file.size > MAX_FILE_SIZE) { rejected++; continue; }
      accepted.push(file);
      previews.push(URL.createObjectURL(file));
    }

    if (rejected) addNotification(`Se descartaron ${rejected} imágenes por tipo/tamaño`, 'warning');

    if (accepted.length) {
      setImagenes((prev) => [...prev, ...accepted]);
      setPreviewUrls((prev) => [...prev, ...previews]);
    }
  };

  const removeImage = (index) => {
    setImagenes((prev) => prev.filter((_, i) => i !== index));
    const url = previewUrls[index];
    if (url) URL.revokeObjectURL(url);
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const clearImages = () => {
    previewUrls.forEach((u) => URL.revokeObjectURL(u));
    setImagenes([]);
    setPreviewUrls([]);
  };

  const removeSavedImage = (imgName) => {
    setImagenesAEliminar((prev) => [...prev, imgName]);
    setImagenesGuardadas((prev) => prev.filter((img) => img.imagen !== imgName));
  };

  const clearSavedImages = () => {
    setImagenesAEliminar(imagenesGuardadas.map((img) => img.imagen));
    setImagenesGuardadas([]);
  };

  // Guardar / Editar / Eliminar
  const validarFormulario = () => {
    if (!formData.planificacion_id?.value) {
      addNotification('Debe seleccionar una planificación', 'warning');
      return false;
    }
    // Requeridos mínimos
    if (!formData.hora_inspeccion?.trim()) {
      addNotification('Debe indicar la hora de inspección', 'warning');
      return false;
    }
    const isNumber = (v) => v !== '' && v !== null && v !== undefined && Number.isFinite(Number(v));
    if (!isNumber(formData.norte) || !isNumber(formData.este) || !isNumber(formData.zona)) {
      addNotification('Coordenadas (norte, este, zona) deben ser numéricas', 'warning');
      return false;
    }
    if (!formData.aspectos?.trim() || !formData.ordenamientos?.trim()) {
      addNotification('Complete aspectos y ordenamientos', 'warning');
      return false;
    }
    return true;
  };

  const buildFormDataPayload = (forEdit = false) => {
    const data = new FormData();

    // Omite campos calculados o manejados en backend
    const omit = new Set(['id', 'estado', 'finalidades', 'planificacion_id', 'codigo_inspeccion', 'n_control']);
    Object.entries(formData).forEach(([key, value]) => {
      if (omit.has(key)) return;
      data.append(key, value ?? '');
    });

    // planificacion_id como value
    data.append('planificacion_id', formData.planificacion_id?.value || '');

    // Enviar solo finalidades válidas 
  const finalidadesValidas = (formData.finalidades || [])
    .filter((f) => f?.finalidad_id?.value)
    .map((f) => ({
      finalidad_id: f.finalidad_id.value,
      objetivo: f.objetivo || '',
    }));
  data.append('finalidades', JSON.stringify(finalidadesValidas));

    // imágenes nuevas
    imagenes.forEach((img) => data.append('imagenes', img));

    // imágenes a eliminar (solo en edición)
    if (forEdit) data.append('imagenesAEliminar', JSON.stringify(imagenesAEliminar || []));

    return data;
  };

  const handleSave = async () => {
    if (!validarFormulario()) return;
    setLoading(true);
    try {
      const data = buildFormDataPayload(false);
      const resp = await axios.post(`${BaseUrl}/inspecciones`, data, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      const newId = resp?.data?.id || resp?.data?.inspeccion?.id || resp?.data?.createdId;
      if (newId) {
        setFormData(prev => ({ ...prev, id: newId }));
        addNotification('Inspección registrada con exito', 'success');
        await fetchInspecciones();
        await fetchPlanificaciones();
        closeModal()
      } else {
        addNotification('No se pudo obtener el ID de la inspección creada.', 'error');
      }
    } catch (error) {
      console.error('Error al registrar inspección:', error);
      addNotification('Error al registrar inspección', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!validarFormulario()) return;
    try {
      setLoading(true);
      const data = buildFormDataPayload(true);
      await axios.put(`${BaseUrl}/inspecciones/${formData.id}`, data, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      addNotification('Inspección actualizada con éxito', 'success');
      await fetchInspecciones();
      await fetchPlanificaciones();
      closeModal();
    } catch (error) {
      console.error('Error al actualizar inspección:', error);
      addNotification('Error al actualizar inspección', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await axios.delete(`${BaseUrl}/inspecciones/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      await fetchInspecciones();
      await fetchPlanificaciones();
      addNotification('Inspección eliminada con éxito', 'success');
    } catch (error) {
      console.error('Error al eliminar inspección:', error);
      addNotification('Error al eliminar inspección', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Búsqueda y paginación
  const handleSearch = (searchTerm) => {
    const filtered = filterData(datosOriginales, searchTerm, [
      'codigo_inspeccion',
      'n_control',
      'responsable_e',
      'estado',
      'fecha_inspeccion',
      'planificacion_id',
    ]);
    setDatosFiltrados(filtered);
    setCurrentPage(1);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = datosFiltrados.slice(indexOfFirstItem, indexOfLastItem);

  const handlePreviousPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };
  const handleNextPage = () => { if (indexOfLastItem < datosFiltrados.length) setCurrentPage(currentPage + 1); };
  const handlePreviousThreePages = () => { setCurrentPage((prev) => Math.max(prev - 3, 1)); };
  const handleNextThreePages = () => {
    const maxPage = Math.ceil(datosFiltrados.length / itemsPerPage);
    setCurrentPage((prev) => Math.min(prev + 3, maxPage));
  };

   const mapFromDbEstado = (v) => {
    if (!v) return v;
    const s = String(v).toLowerCase().trim();
    if (s === 'no aprobada') return 'rechazada';
    if (s === 'finalizada') return 'aprobada';
    return s;
  };
  const mapToDbEstado = (v) => {
    if (!v) return v;
    const s = String(v).toLowerCase().trim();
    if (s === 'aprobada') return 'finalizada';
    if (s === 'rechazada' || s === 'no apta') return 'no aprobada';
    return s;
  };

const handleGuardarEstado = async () => {
  const targetId = estadoModal.id;
  if (!targetId) { addNotification('Inspección no seleccionada', 'error'); return; }
  setLoading(true);
  try {
    const payloadEstado = mapToDbEstado(estadoModal.estado);

    // Mapea las finalidades seleccionadas
    const finalidadesValidas = (formData.finalidades || [])
      .filter(f => f?.finalidad_id?.value)
      .map(f => ({
        finalidad_id: f.finalidad_id.value,
        objetivo: f.objetivo || ''
      }));

    const body = {
      estado: payloadEstado,
      observacion: buildDescripcionAcciones(decisionFrases, decisionOtro) || null,
      programas: (selectedProgramas || []).map(p => Number(p.value)),
      finalidades: finalidadesValidas 
    };

    await axios.patch(`${BaseUrl}/inspecciones/${targetId}/estado`, body, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    addNotification('Estado actualizado', 'success');
    await fetchInspecciones();
    closeEstadoModal();
    navigate(`/inspecciones/${targetId}/seguimiento`);
  } catch (e) {
    console.error(e);
    addNotification(e?.response?.data?.message || 'No se pudo actualizar el estado', 'error');
  } finally {
    setLoading(false);
  }
};

  const openEstadoModal = (item) => {
    setEstadoModal({
      abierto: true,
      id: item.id,
      estado: mapFromDbEstado(item.estado) || 'finalizada'
    });    
    setDecisionFrases([]);           
    fetchProgramasFito().catch(() => {});
    fetchProgramasAsociados(item.id).catch(() => {});
  };

  const closeEstadoModal = () => {
    setEstadoModal({ abierto: false, id: null, estado: 'finalizada' });
    setSelectedProgramas([]);
    setProgramasAsociadosIds([]);
    setDecisionFrases([]);
  };

  return (
    <div className="mainContainer">

      {loading && <Spinner text="Procesando..." />}

      {/* Modal Detalle */}
      {detalleModal.abierto && detalleModal.inspeccion && (
        <div className="modalOverlay">
          <div className="modalDetalle">
            <button className="closeButton" onClick={closeDetalleModal}>&times;</button>
            <h2>Detalle de Inspección</h2>

            <form className="modalForm">
              <div className="formColumns">
                {/* Columna 1 */}
                <div className="formColumn">
                  <div className="formGroup">
                    <label>Planificación:</label>
                    {(() => {
                      const det = detalleModal.inspeccion || {};
                      const fallback = det.planificacion_id
                        ? {
                            value: String(det.planificacion_id),
                            label: `${det.solicitud_codigo || 'SIN-SOL'} - ${det.planificacion_codigo || 'SIN-PLAN'}`,
                          }
                        : null;
                      const selected =
                        planificacionOptions.find(o => String(o.value) === String(det.planificacion_id)) || fallback;

                      return (
                        <SingleSelect
                          options={planificacionOptions}
                          value={selected}
                          isDisabled={true}
                          placeholder="Planificación"
                        />
                      );
                    })()}
                  </div>

                  <div className="formGroup">
                    <label>Fecha Inspección:</label>
                    <input
                      type="date"
                      value={detalleModal.inspeccion.fecha_inspeccion || ''}
                      disabled
                      className="date"
                    />
                  </div>

                  <div className="formGroup">
                    <label>Hora Inspección (Real):</label>
                    <input
                      type="time"
                      value={detalleModal.inspeccion.hora_inspeccion || ''}
                      disabled
                      className="input"
                    />
                  </div>

                  <div className="formGroup">
                    <label>Coordenadas Norte:</label>
                    <input
                      type="number"
                      value={detalleModal.inspeccion.norte || ''}
                      disabled
                      className="input"
                    />
                  </div>

                  <div className="formGroup">
                    <label>Coordenadas Este:</label>
                    <input
                      type="number"
                      value={detalleModal.inspeccion.este || ''}
                      disabled
                      className="input"
                    />
                  </div>

                  <div className="formGroup">
                    <label>Zona:</label>
                    <input
                      type="number"
                      value={detalleModal.inspeccion.zona || ''}
                      disabled
                      className="input"
                    />
                  </div>

                  <div className="formGroup">
                    <label>Aspectos:</label>
                    <textarea
                      value={detalleModal.inspeccion.aspectos || ''}
                      disabled
                      className="textarea"
                    />
                  </div>

                  <div className="formGroup">
                    <label>Ordenamientos:</label>
                    <textarea
                      value={detalleModal.inspeccion.ordenamientos || ''}
                      disabled
                      className="textarea"
                    />
                  </div>

                  <div className="formGroup">
                    <label>Área:</label>
                    <input
                      type="text"
                      value={detalleModal.inspeccion.area || ''}
                      disabled
                      className="input"
                    />
                  </div>
                  <div className="formGroup">
                    <label>Estado:</label>
                    <span className={`badge-estado badge-${detalleModal.inspeccion.estado}`}>
                      {detalleModal.inspeccion.estado || '—'}
                    </span>
                  </div>
                </div>

                {/* Columna 2 */}
                <div className="formColumn">
                  <div className="formGroup">
                    <label>Código Inspección:</label>
                    <input
                      type="text"
                      value={detalleModal.inspeccion.codigo_inspeccion || ''}
                      disabled
                      className="input"
                    />
                  </div>

                  <div className="formGroup">
                    <label>N° Control:</label>
                    <input
                      type="text"
                      value={detalleModal.inspeccion.n_control || ''}
                      disabled
                      className="input"
                    />
                  </div>
                  <div className="formGroup">
                    <label>Finalidades:</label>
                    <ul>
                      {(detalleModal.inspeccion.finalidades || []).map((f, idx) => (
                        <li key={idx}>
                          {finalidadOptions.find((opt) => String(opt.value) === String(f.finalidad_id))?.label || f.finalidad}
                          : {f.objetivo}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="formGroup">
                    <div className="opcionales-group">
                      <div className="formGroup">
                        <label>Responsable:</label>
                        <input
                          type="text"
                          value={detalleModal.inspeccion.responsable_e || ''}
                          disabled
                          className="input"
                        />
                      </div>
                      <div className="formGroup">
                        <label>Cédula Responsable:</label>
                        <input
                          type="text"
                          value={detalleModal.inspeccion.cedula_res || ''}
                          disabled
                          className="input"
                        />
                      </div>
                      <div className="formGroup">
                        <label>Teléfono:</label>
                        <input
                          type="text"
                          value={detalleModal.inspeccion.tlf || ''}
                          disabled
                          className="input"
                        />
                      </div>
                      <div className="formGroup">
                        <label>Correo:</label>
                        <input
                          type="email"
                          value={detalleModal.inspeccion.correo || ''}
                          disabled
                          className="input"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {galeriaModal.abierto && (
          <div className="modalOverlay">
            <div className="modalDetalle">
              <button className="closeButton" onClick={closeGaleriaModal}>&times;</button>
              <h2>Imágenes de la inspección</h2>
              {galeriaModal.imagenes.length === 0 ? (
                <p style={{ marginTop: 10 }}>Sin imágenes para mostrar.</p>
              ) : (
                <CardsCarousel
                  items={galeriaModal.imagenes}
                  height={220}
                  renderCard={(img) => (
                    <div className="imgCard">
                      <img
                        src={`${BaseUrl}/uploads/inspeccion_est/${img.imagen}`}
                        alt="Imagen de inspección"
                        className="imgThumb"
                        loading="lazy"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                      <div className="imgMeta">
                        <span title={img.imagen}>{img.imagen}</span>
                        <a
                          href={`${BaseUrl}/uploads/inspeccion_est/${img.imagen}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-estandar"
                          style={{ padding: '4px 10px' }}
                        >
                          Abrir
                        </a>
                      </div>
                    </div>
                  )}
                />
              )}
            </div>
          </div>
        )}

      {/* Modal registro / edición */}
    {currentModal === 'inspeccion' && (
        <div className="modalOverlay">
          <div className='modal_tree' >
            <button className="closeButton" onClick={closeModal}>&times;</button>
          <h2> {formData.id ? 'Editar Inspección' : 'Registrar Inspección' }</h2>

                {/* Subida de imágenes */}
                <input
                  type="file"
                  id="imagenes"
                  className="input-imagen"
                  multiple
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleFileChange}
                />
                <label htmlFor="imagenes" className="label-imagen">
                  <img src={icon.pdf3} alt="Subir" className="iconSubir" style={{ width: 18, marginRight: 6 }} />
                  Subir Imágenes
                </label>
                <div style={{ fontSize: 12, color: '#6C757D', marginBottom: 8 }}>
                  Máx {MAX_FILES} imágenes por inspección, formatos: JPG/PNG/WebP, tamaño por archivo ≤ 3MB.
                </div>

                {/* Previews nuevas */}
                {previewUrls.length > 0 && (
                  <div style={{ display: 'flex', gap: 10, margin: '10px 0', alignItems: 'center', flexWrap: 'wrap' }}>
                    {previewUrls.map((url, idx) => (
                      <div key={idx} style={{ position: 'relative' }}>
                        <img src={url} alt={`preview-${idx}`} style={{ maxWidth: 80, maxHeight: 80, border: '1px solid #ccc' }} />
                        <button type="button" onClick={() => removeImage(idx)} title="Quitar imagen" className="closeButton2">×</button>
                      </div>
                    ))}
                    <button type="button" onClick={clearImages} className="btn-limpiar" title="Limpiar imágenes seleccionadas">
                      Limpiar seleccionadas
                    </button>
                  </div>
                )}

                {/* Imágenes guardadas (editar) */}
                {formData.id && imagenesGuardadas.length > 0 && previewUrls.length === 0 && (
                  <div style={{ display: 'flex', gap: 10, margin: '10px 0', alignItems: 'center', flexWrap: 'wrap' }}>
                    {imagenesGuardadas.map((img, idx) => (
                      <div key={img.id || img.imagen} style={{ position: 'relative' }}>
                        <img
                          src={`${BaseUrl}/uploads/inspeccion_est/${img.imagen}`}
                          alt={`guardada-${idx}`}
                          style={{ maxWidth: 80, maxHeight: 80, border: '1px solid #ccc' }}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                        <button type="button" onClick={() => removeSavedImage(img.imagen)} title="Quitar imagen" className="closeButton2">×</button>
                      </div>
                    ))}
                    <button type="button" onClick={clearSavedImages} className="btn-limpiar" title="Marcar todas las imágenes para eliminar">
                      Quitar todas
                    </button>
                  </div>
                )}

                {/* Formulario */}
                <form className="modalForm">
                  <div className="formColumns">
                    {/* Columna 1 */}
                    <div className="formColumn">
                      <div className="formGroup">
                        <label htmlFor="planificacion_id">
                          <span className="Unique" title="Campo Obligatorio">*</span>
                          Planificación:
                        </label>
                        <SingleSelect
                          options={formData.id ? planificacionOptionsEdit : planificacionOptionsFiltradas}
                          value={formData.planificacion_id}
                          onChange={val => handleSelectChange('planificacion_id', val)}
                          placeholder="Planificación"
                        />
                      </div>
                  
                      <div className="formGroup">
                        <label htmlFor="hora_inspeccion">
                          <span className="Unique" title="Campo Obligatorio">*</span>
                          Hora Inspección (Real):
                        </label>
                        <input
                          type="time"
                          id="hora_inspeccion"
                          value={formData.hora_inspeccion}
                          onChange={handleChange}
                          className="input"
                        />
                      </div>

                      <div className="formGroup">
                        <label htmlFor="norte">
                          <span className="Unique" title="Campo Obligatorio">*</span>
                          Coordenadas Norte:
                        </label>
                        <input
                          type="number"
                          id="norte"
                          value={formData.norte}
                          onChange={handleChange}
                          className="input"
                          placeholder="Coordenada"
                        />
                      </div>

                      <div className="formGroup">
                        <label htmlFor="este">
                          <span className="Unique" title="Campo Obligatorio">*</span>
                          Coordenadas Este:
                        </label>
                        <input
                          type="number"
                          id="este"
                          value={formData.este}
                          onChange={handleChange}
                          className="input"
                          placeholder="Coordenada"
                        />
                      </div>

                      <div className="formGroup">
                        <label htmlFor="zona">
                          <span className="Unique" title="Campo Obligatorio">*</span>
                          Zona:
                        </label>
                        <input
                          type="number"
                          id="zona"
                          value={formData.zona}
                          onChange={handleChange}
                          className="input"
                          placeholder="Coordenada"
                        />
                      </div>

                      <div className="formGroup">
                        <label htmlFor="aspectos">
                          <span className="Unique" title="Campo Obligatorio">*</span>
                          Aspectos:
                        </label>
                        <textarea
                          id="aspectos"
                          value={formData.aspectos}
                          onChange={handleChange}
                          className="textarea"
                          placeholder="Rellene el campo"
                        />
                      </div>

                      <div className="formGroup">
                        <label htmlFor="ordenamientos">
                          <span className="Unique" title="Campo Obligatorio">*</span>
                          Ordenamientos:
                        </label>
                        <textarea
                          id="ordenamientos"
                          value={formData.ordenamientos}
                          onChange={handleChange}
                          className="textarea"
                          placeholder="Rellene el campo"
                        />
                      </div>
                    </div>

                    {/* Columna 2 */}
                    <div className="formColumn">
                      <div className="formGroup">
                        <label><span className='Unique'>*</span>Representante del establecimiento:</label>
                        <button
                          type="button"
                          className="btn-limpiar"
                          onClick={() => setShowOpcionales((prev) => !prev)}
                          style={{ marginBottom: 8 }}
                        >
                          {showOpcionales ? 'Ocultar campos' : 'Mostrar campos'}
                        </button>

                        <div className={`opcionales-group${showOpcionales ? '' : ' hide'}`}>
                          <div className="formGroup">
                            <label htmlFor="responsable_e">Responsable:</label>
                            <input
                              type="text"
                              id="responsable_e"
                              value={formData.responsable_e}
                              onChange={handleChange}
                              className="input"
                              placeholder="Campo opcional"
                            />
                          </div>
                          <div className="formGroup">
                            <label htmlFor="cedula_res">Cédula Responsable:</label>
                            <input
                              type="text"
                              id="cedula_res"
                              value={formData.cedula_res}
                              onChange={handleChange}
                              className="input"
                              placeholder="Campo opcional"
                            />
                          </div>
                          <div className="formGroup">
                            <label htmlFor="tlf">Teléfono:</label>
                            <input
                              type="text"
                              id="tlf"
                              value={formData.tlf}
                              onChange={handleChange}
                              className="input"
                              placeholder="Campo opcional"
                            />
                          </div>
                          <div className="formGroup">
                            <label htmlFor="correo">Correo:</label>
                            <input
                              type="email"
                              id="correo"
                              value={formData.correo}
                              onChange={handleChange}
                              className="input"
                              placeholder="Campo opcional"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Finalidades */}
                      <div className="formGroup">
                        <label><span className='Unique'>*</span>Finalidades:</label>
                        <div className="finalidades-group">
                          {formData.finalidades.map((fin, idx) => (
                            <div key={idx} className="finalidadRow" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                              <SingleSelect
                                options={finalidadOptions}
                                value={fin.finalidad_id}
                                onChange={(val) => handleFinalidadChange(idx, 'finalidad_id', val)}
                                placeholder="Finalidad"
                              />
                              <input
                                type="text"
                                value={fin.objetivo}
                                onChange={(e) => handleFinalidadChange(idx, 'objetivo', e.target.value)}
                                placeholder="Objetivo"
                                className="input"
                              />
                              <div>
                                <button type="button" onClick={() => removeFinalidad(idx)} className="btn-limpiar">
                                  Eliminar
                                </button>
                              </div>
                            </div>
                          ))}
                          <button type="button" onClick={addFinalidad} className="btn-limpiar">
                            Agregar finalidad
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="saveButton"
                    onClick={formData.id ? handleEdit : handleSave}
                    title={formData.id ? 'Actualizar Inspección' : 'Registrar Inspección'}
                    disabled={loading}
                  >
                    {loading ? 'Procesando...' : 'Guardar'}
                  </button>
                </form>
          </div>
      </div>
)}

  {estadoModal.abierto && (
        <div className='modalOverlay'>
          <div className='modal'>
            <button className='closeButton' onClick={closeEstadoModal}>&times;</button>
            <h2>Toma de decisiones de la inspección</h2>
            <p style={{ marginTop: 4, marginBottom: 10 }}>Selecciona el estado para esta inspección.</p>

            <div className="radio-group" style={{ marginTop: 6, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(160px, 1fr))', gap: 6 }}>
              {[
                { val: 'finalizada', label: 'Finalizada' },
                { val: 'seguimiento', label: 'Seguimiento' },
                { val: 'cuarentena', label: 'Cuarentena' },
                { val: 'no atendida', label: 'No Atendido' },
                { val: 'no aprobada', label: 'No Aprobada' }
              ].map(op => (
                <label key={op.val} className="radio-label">
                  <input
                    type="radio"
                    className="radio-input"
                    checked={estadoModal.estado === op.val}
                    onChange={() => setEstadoModal(s => ({ ...s, estado: op.val }))}
                  />
                  {op.label}
                </label>
              ))}
            </div>

            <div className='formGroup' style={{ marginTop: 12 }}>
            <label>Programas a asociar (opcional):</label>
            <MultiSelect
              options={programaOptions}
              value={selectedProgramas}
              onChange={setSelectedProgramas}
              placeholder="Selecciona programas..."
              isOptionDisabled={(opt) => (programasAsociadosIds || []).includes(String(opt.value))}
            />
            {selectedProgramas.length > 0 && (
              <button
                type="button"
                className="btn-limpiar"
                onClick={() => setSelectedProgramas([])}
                style={{ marginTop: 8 }}
              >
                Limpiar selección
              </button>
            )}
          </div>

          {frasesPorSeleccion.length > 0 && (
            <div className="formGroup" style={{ marginTop: 10 }}>
              <label>Acciones sugeridas:</label>
              <div className="finalidades-group" style={{ maxHeight: 220 }}>
                {frasesPorSeleccion.map((f) => (
                  <label key={f} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="checkbox"
                      className="finalidad-checkbox"
                      checked={(decisionFrases || []).includes(f)}
                      onChange={() => toggleFrase(f)}
                    />
                    {f}
                  </label>
                ))}
                {(decisionFrases || []).includes('Otro') && (
                  <input
                    type="text"
                    className="input"
                    placeholder="Especifique la acción"
                    value={decisionOtro}
                    onChange={(e) => setDecisionOtro(e.target.value)}
                  />
                )}
              </div>
            </div>
          )}

          {/* Vista previa automática (concatena selecciones + “Otro”) */}
          <div className="formGroup" style={{ marginTop: 10 }}>
            <label>Vista previa descripción:</label>
            <textarea
              className="textarea"
              disabled
              value={buildDescripcionAcciones(decisionFrases, decisionOtro)}
              placeholder="Se generará automáticamente a partir de las acciones seleccionadas"
            />
          </div>

            <div className="modalActions">
              <button
                className="cancelButton"
                onClick={handleGuardarEstado}
                title='Guardar Registro'
                disabled={loading}
              >
                {loading ? 'Procesando...' : 'Guardar estado'}
              </button>
              <button className="confirmButton" title='cancelar Registro' onClick={closeEstadoModal}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmación eliminar */}
      {confirmDeleteModal && (
        <div className="modalOverlay">
          <div className="modal">
            <h2>Confirmar Eliminación</h2>
            <p>¿Estás seguro de que deseas eliminar esta inspección?</p>
            <div className="modalActions">
              <button className="cancelButton" onClick={closeConfirmDeleteModal}>Cancelar</button>
              <button
                className="confirmButton"
                onClick={() => { handleDelete(selectedInspeccionId); closeConfirmDeleteModal(); }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className='cardsContainer'>
        <div className='card' onClick={mostrarTodas} title='Todas las Inspecciones'>
          <span className='cardNumber'>{totales.inspeccionesTotales}</span>
          <p>Total</p>
        </div>
        <div className='card' onClick={mostrarCuarentena} title='Inspecciones Cuarentena'>
          <span className='cardNumber'>{totales.inspeccionesCuarentena}</span>
          <p>Inspecciones en Cuarentena</p>
        </div>
        <div className='card' onClick={mostrarAprobadas} title='Inspecciones Aprobadas'>
          <span className='cardNumber'>{totales.inspeccionesAprobadas}</span>
          <p>Inspecciones Finalizadas</p>
        </div>
        <div className='card' onClick={mostrarRechazadas} title='Inspecciones Rechazadas'>
          <span className='cardNumber'>{totales.inspeccionesRechazadas}</span>
          <p>Inspecciones No Aprobadas</p>
        </div>
      </div>

      {/*/////////////////// Tabla ///////////*/}
                <div className='tituloH' 
                style={{marginTop: 20, marginBottom: 20, gap: 20}}
                >
                    <img src={icon.farmer} alt="" className='iconTwo'/>
                    <h1 className='title' title='Inspecciones'>Resumen de Inspecciones</h1>
                
                {/* Ayudante informativo de Pantalla */}
                    <div >
                        <AyudaTooltip descripcion="En esta pantalla puedes visualizar, registrar y gestionar todas las inspecciones fitosanitarias realizadas en el sistema. Utiliza los filtros, la búsqueda y las opciones de exportación para organizar y consultar la información de manera eficiente. Desde aquí puedes acceder al detalle de cada inspección, revisar sus finalidades, responsables, coordenadas y resultados, así como asociar imágenes y generar reportes en PDF o Excel. Esta sección te permite mantener el control y la trazabilidad de las actividades de inspección, facilitando la toma de decisiones y el seguimiento de las acciones fitosanitarias." />
                    </div>
                </div>


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

      {/* Tabla */}
      <div className="tableSection">
        <div className="filtersContainer">
          <div className='filtersButtons'>
        {tienePermiso('inspecciones', 'crear') && (
          <button type="button" onClick={openModal} className="create" title="Registrar Inspección">
            <img src={icon.plus} alt="Crear" className="icon" />
            Inspección
          </button>
        )}
        {tienePermiso('inspecciones', 'exportar') && (
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
        {tienePermiso('inspecciones', 'exportar') && (
          <button
          type='button'
          onClick={handleExportExcel}
          className='btn-estandar'
          title='Descargar Excel'
          >
            <img src={icon.excel2} alt="Excel" className='icon' />
            Excel
          </button>
        )}
        </div>
          <h2>Inspecciones</h2>
          <div className="searchContainer">
            <SearchBar onSearch={handleSearch} />
            <img src={icon.lupa} alt="Buscar" className="iconlupa" />
          </div>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>N°</th>
              <th>Código</th>
              <th>N° Control</th>
              <th>Estado</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
          {currentData.map((item, idx) => {
                // console.log('INSPECCION:', item);

                return (
                  <tr key={item.id}>
                    <td>{indexOfFirstItem + idx + 1}</td>
                    <td>{item.codigo_inspeccion}</td>
                    <td>{item.n_control}</td>
                    <td>
                      <span className={`badge-estado badge-${String(item.estado).toLowerCase().replace(/\s/g, '_')}`}>
                        {item.estado}
                      </span>
                    </td>
                    <td>
                      <div className="iconContainer">
                        {tienePermiso('inspecciones', 'ver') && (
                          <img
                            onClick={() => openDetalleModal(item)}
                            src={icon.ver}
                            className="iconver"
                            alt="Detalle"
                            title="Ver más"
                          />
                        )}
                        {tienePermiso('inspecciones', 'ver') && (
                          <img
                            src={icon.picture}
                            onClick={() => openGaleriaModal(item.id)}
                            alt="Imágenes"
                            className="iconver"
                            title="Ver imágenes"
                          />
                        )}
                        {tienePermiso('inspecciones', 'exportar') && (
                          <img
                            onClick={() => handleActaPDF(item)}
                            src={icon.pdf2}
                            className="iconver"
                            alt="Acta con Fines de Vigilancia"
                            title="Exportar Acta Con Fines de Vigilacia"
                          />
                        )}
                        {tienePermiso('inspecciones', 'crear') &&
                          ['Administrador', 'Moderador'].includes(rol) &&
                          !estadosFinales.includes(String(item.estado).toLowerCase()) && (
                            <img
                              onClick={() => openEstadoModal(item)}
                              src={icon.martillito}
                              className="iconver"
                              alt="Tomar Desición"
                              title="Toma de desiciones"
                            />
                          )}
                        {tienePermiso('inspecciones', 'editar') && (
                          (rol !== 'inspector' ||
                            String(item.empleado_id) === String(empleadoId) ||
                            (Array.isArray(item.empleados) && item.empleados.some(e => String(e.id) === String(empleadoId)))
                          ) && (
                            <img
                              onClick={() => openEditModal(item)}
                              src={icon.editar}
                              className="iconeditar"
                              alt="Editar"
                              title="Editar"
                            />
                          )
                        )}
                        {tienePermiso('inspecciones', 'eliminar') && ['Administrador'].includes(rol) && (
                          <img
                            onClick={() => openConfirmDeleteModal(item.id)}
                            src={icon.eliminar}
                            className="iconeliminar"
                            alt="Eliminar"
                            title="Eliminar"
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
        </table>

        <div className="tableFooter">
          <img onClick={handlePreviousPage} src={icon.flecha3} className="iconBack" title="Anterior" />
          <img onClick={handlePreviousThreePages} src={icon.flecha5} className="iconBack" title="Anterior" />
          <span>{currentPage}</span>
          <img onClick={handleNextThreePages} src={icon.flecha4} className="iconNext" title="Siguiente" />
          <img onClick={handleNextPage} src={icon.flecha2} className="iconNext" title="Siguiente" />
        </div>
      </div>
    </div>
  );
}

export default InspeccionesEst;