import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BaseUrl } from '../../utils/constans';
import Spinner from '../../components/spinner/Spinner';
import { useNotification } from '../../utils/NotificationContext';
import styles from './inspecciones.module.css';
import '../../main.css';
import Icon from '../../components/iconos/iconos';
import SingleSelect from '../../components/selectmulti/SingleSelect';
import { usePermiso } from '../../hooks/usePermiso';
import { buildActaSilosBlob } from '../../components/pdf/ActaSilos';
import { buildCertificadoTecnicoBlob } from '../../components/pdf/CertificadoTecnico';
import { buildCertificadoFitosanitarioBlob } from '../../components/pdf/CertificadoFitosanitario';

function timeSince(dateStr) {
  if (!dateStr) return '—';
  const onlyDate = /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
  if (onlyDate) {
    // Tratar como fecha local sin hora y comparar por días
    const [y, m, d] = dateStr.split('-').map(Number);
    const start = new Date(y, m - 1, d);
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const diffDays = Math.floor((todayStart - start) / (24 * 3600 * 1000));
    if (diffDays <= 0) return 'hoy';
    if (diffDays === 1) return '1 día';
    return `${diffDays} días`;
  }
  // Si viene con hora, usar diferencia exacta
  const d = new Date(dateStr);
  const now = new Date();
  let delta = Math.floor((now.getTime() - d.getTime()) / 1000);
  const y = Math.floor(delta / (3600 * 24 * 365)); if (y >= 1) return `${y} año${y > 1 ? 's' : ''}`;
  const m = Math.floor(delta / (3600 * 24 * 30));  if (m >= 1) return `${m} mes${m > 1 ? 'es' : ''}`;
  const w = Math.floor(delta / (3600 * 24 * 7));   if (w >= 1) return `${w} semana${w > 1 ? 's' : ''}`;
  const dd = Math.floor(delta / (3600 * 24));      if (dd >= 1) return `${dd} día${dd > 1 ? 's' : ''}`;
  const hh = Math.floor(delta / 3600);             if (hh >= 1) return `${hh} hora${hh > 1 ? 's' : ''}`;
  const mm = Math.floor(delta / 60);               if (mm >= 1) return `${mm} minuto${mm > 1 ? 's' : ''}`;
  return `${delta} segundo${delta !== 1 ? 's' : ''}`;
}

const semanaEpidFrom = (dateStr) => {
  const d = dateStr ? new Date(dateStr) : new Date();
  const w = Math.floor((d.getDate() - 1) / 7) + 1; // 1..5
  const mes = d.toLocaleDateString('es-VE', { month: 'long' });
  const cap = mes.charAt(0).toUpperCase() + mes.slice(1);
  return `Semana ${w} de ${cap} ${d.getFullYear()}`;
};

function SeguimientoInspeccion() {
  const tienePermiso = usePermiso();
  const { id } = useParams(); 
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [traza, setTraza] = useState({ propiedad: null, productores: [], galeria: [], inspecciones: [] });
  const [hovered, setHovered] = useState(null);
  const [inspeccionSeleccionada, setInspeccionSeleccionada] = useState(null);
  const [progLoading, setProgLoading] = useState(false);
  const [programas, setProgramas] = useState([]);
  const [confirmProg, setConfirmProg] = useState({ abierto: false, id: null, nombre: '' });
  const [hoveredProg, setHoveredProg] = useState(null);
  const [pinnedProg, setPinnedProg] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentInspecciones = traza.inspecciones.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(traza.inspecciones.length / itemsPerPage);
  const [actaOpen, setActaOpen] = useState(false);
  const [actaForm, setActaForm] = useState({
    fecha_notificacion: '',
    semana_epid: '',
    lugar_ubicacion: '',
    unidad_medida: '',
    cant_nacional: '',
    cant_importado: '',
    cant_afectado: '',
    cant_afectado_porcentaje: '',
    numero_silos: '',
    numero_galpones: '',
    capacidad_instalada: '',
    capacidad_operativa: '',
    capacidad_almacenamiento: '',
    destino_objetivo: '',
    observaciones: '',
    medidas_recomendadas: '',
    tipo_evento_epidemia_id: '',
    inspeccion_est_id: '',
    medidas_recomendadas_sel: [],
    medidas_otro: ''
  });
  const [tipoEventoOptions, setTipoEventoOptions] = useState([]);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfFileName, setPdfFileName] = useState('Acta_Silos.pdf');

  const unidadOptions = useMemo(() => ([
    { value: 't', label: 't' },
    { value: 'kg', label: 'kg' },
    { value: 'sacos', label: 'sacos' },
    { value: 'm³', label: 'm³' },
    { value: 'L', label: 'L' }
  ]), []);

  const RECOMENDACIONES = useMemo(() => ([
    'Limpieza y desinfección de silos/almacén',
    'Aireación controlada',
    'Fumigación según protocolo',
    'Control de humedad',
    'Control de temperatura',
    'Monitoreo y muestreo semanal',
    'Segregación/Descarte de lotes afectados',
    'Mantenimiento preventivo de equipos',
    'Capacitación de personal',
    'Notificar a la autoridad competente',
    'Otro'
  ]), []);

  const buildMedidasTexto = (seleccion = [], otro = '') => {
    const base = (seleccion || []).filter(m => m && m !== 'Otro');
    const addOtro = (seleccion || []).includes('Otro') && (otro || '').trim()
      ? `Otro: ${otro.trim()}`
      : null;
    return [...base, addOtro].filter(Boolean).join(' | ');
  };

  const toggleRecomendacion = (m) => {
    setActaForm(prev => {
      const sel = new Set(prev.medidas_recomendadas_sel || []);
      if (sel.has(m)) sel.delete(m); else sel.add(m);
      return { ...prev, medidas_recomendadas_sel: Array.from(sel) };
    });
  };

  const pctAfectado = useMemo(() => {
    const n = parseFloat(String(actaForm.cant_nacional || '0').replace(',', '.')) || 0;
    const i = parseFloat(String(actaForm.cant_importado || '0').replace(',', '.')) || 0;
    const a = parseFloat(String(actaForm.cant_afectado || ''));
    const total = n + i;
    if (!total || isNaN(a)) return null;
    return Math.max(0, Math.min(100, (a * 100) / total));
  }, [actaForm]);


  const fetchTrazabilidad = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BaseUrl}/seguimiento/${id}/trazabilidad`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = res.data || {};
      setTraza({
        propiedad: data.propiedad || null,
        productores: Array.isArray(data.productores) ? data.productores : [],
        cultivos: Array.isArray(data.cultivos) ? data.cultivos : [],
        galeria: Array.isArray(data.galeria) ? data.galeria : [],
        inspecciones: Array.isArray(data.inspecciones) ? data.inspecciones : [],
      });
    } catch (error) {
      console.error('Error obteniendo trazabilidad', error);
      addNotification('No se pudo cargar la trazabilidad', 'error');
      setTraza({ propiedad: null, productores: [], galeria: [], inspecciones: [] });
    } finally {
      setLoading(false);
    }
  };

  const fetchTipoEvento = async () => {
    try {
      const { data } = await axios.get(`${BaseUrl}/tipo_evento`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const opts = (data || []).map(t => ({ value: String(t.id), label: t.nombre }));
      setTipoEventoOptions(opts);
    } catch {
      setTipoEventoOptions([]);
    }
  };

  const fetchProgramasAsignados = async (inspeccionId) => {
    if (!inspeccionId) {
      setProgramas([]);
      return;
    }
    setProgLoading(true);
    try {
      const res = await axios.get(`${BaseUrl}/seguimiento/inspeccion/${inspeccionId}/programas`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = Array.isArray(res.data) ? res.data : [];
      setProgramas(data);
    } catch (e) {
      console.error('Error obteniendo programas asignados', e);
      setProgramas([]);
    } finally {
      setProgLoading(false);
    }
  };

  useEffect(() => {
    fetchTrazabilidad();
    setInspeccionSeleccionada(Number(id) || null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (inspeccionSeleccionada) fetchProgramasAsignados(inspeccionSeleccionada);
  }, [inspeccionSeleccionada]);


  const handleActaChange = (id, value) => {
    setActaForm(prev => ({ ...prev, [id]: value }));
  };

  const handleFechaNotifChange = (value) => {
  setActaForm(prev => ({
    ...prev,
    fecha_notificacion: value,
    semana_epid: prev.semana_epid && prev.semana_epid.trim() !== '' ? prev.semana_epid : semanaEpidFrom(value)
  }));
};

  const openConfirmEliminarPrograma = (p) => {
    setConfirmProg({
      abierto: true,
      id: p?.id || null,
      nombre: p?.programa_nombre || `Programa #${p?.programa_fito_id || ''}`
    });
  };
  const closeConfirmEliminarPrograma = () => setConfirmProg({ abierto: false, id: null, nombre: '' });

  const openActaCreateModal = async () => {
    setActaOpen(true);
    setLoading(true);
    try {
      await fetchTipoEvento();
      const today = new Date();
      const tz = today.getTimezoneOffset();
      const todayStr = new Date(today.getTime() - tz * 60000).toISOString().slice(0, 10);

      setActaForm({
        fecha_notificacion: todayStr,
        semana_epid: semanaEpidFrom(todayStr),
        lugar_ubicacion: '',
        unidad_medida: '',
        cant_nacional: '',
        cant_importado: '',
        cant_afectado: '',
        observaciones: '',
        medidas_recomendadas: '',
        tipo_evento_epidemia_id: '',
        medidas_recomendadas_sel: [],
        medidas_otro: ''
      });
    } catch (error) {
      console.error('Error no se Pudo cargar el formulario del acta', error);
      addNotification('No se pudo cargar el formulario del acta', 'error');
      setActaOpen(false);
    } finally {
      setLoading(false);
    }
};

const generarActaPDF = async (inspeccionId) => {
  try {
    setLoading(true);

    // 1) Acta guardada
    const g = await axios.get(`${BaseUrl}/seguimiento/acta-silos/${inspeccionId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    const acta = g.data?.acta;
    if (!acta) {
      addNotification('No existe acta para esta inspección', 'warning');
      return;
    }

    // 2) Detalle EXCLUSIVO (contacto del técnico y del productor incluidos)
    const { data: det } = await axios.get(`${BaseUrl}/seguimiento/acta-silos/inspeccion/${inspeccionId}/detalle`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });

    const propiedad = {
      propiedad_nombre: det?.propiedad_nombre,
      propiedad_rif: det?.propiedad_rif,
      estado_nombre: det?.estado_nombre,
      municipio_nombre: det?.municipio_nombre,
      parroquia_nombre: det?.parroquia_nombre,
      sector_nombre: det?.sector_nombre
    };

    const propietario = {
      id: det?.productor_id,
      nombre: det?.productor_nombre,
      apellido: det?.productor_apellido,
      cedula: det?.productor_cedula,
      telefono: det?.productor_telefono || ''
    };

    const tecnicos = Array.isArray(det?.inspectores) ? det.inspectores : [];
    const rubroProducto = Array.isArray(det?.cultivos) ? det.cultivos.join(' | ') : '';
    const plagasEnfermedades = Array.isArray(det?.plagas_enfermedades) ? det.plagas_enfermedades.join(', ') : '';
    const certificadoFitosanitario =
      det?.certificado_fitosanitario === true ? 'Sí'
      : det?.certificado_fitosanitario === false ? 'No'
      : (det?.certificado_fitosanitario || '');

    const programas = Array.isArray(det?.programas) ? det.programas.join(' | ') : '';

    const blob = await buildActaSilosBlob({
      acta,
      inspeccion: {
        id: det?.inspeccion_id,
        codigo_inspeccion: det?.codigo_inspeccion,
        n_control: det?.n_control,
        fecha_inspeccion: det?.fecha_inspeccion
      },
      propiedad,
      propietario,
      tipoEventoNombre: det?.tipo_evento_nombre || '',
      registroNotificacion: acta?.registro_notificacion || '',
      rubroProducto,
      programas,  
      plagasEnfermedades,
      certificadoFitosanitario,
      tecnicos,
      unidad: 'DIRECCIÓN GENERAL'
    });

    const url = URL.createObjectURL(blob);
    setPdfUrl(url);
    setPdfFileName(`Acta_Silos_${inspeccionId}.pdf`);
  } catch (error) {
    console.error(error);
    addNotification('No se pudo generar el PDF del acta', 'error');
  } finally {
    setLoading(false);
  }
};
  const onActaButtonClick = async () => {
    if (!inspeccionSeleccionada) {
      addNotification('Selecciona una inspección', 'warning');
      return;
    }
    try {
      // Si existe acta: mostrar PDF directamente
      const g = await axios.get(`${BaseUrl}/seguimiento/acta-silos/${inspeccionSeleccionada}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (g.data?.acta) {
        await generarActaPDF(inspeccionSeleccionada);
        return;
      }
      // Si no existe: abrir modal para crear
      await openActaCreateModal();
    } catch (error) {
      console.error('error no se pudo validar el acta', error);
      addNotification('No se pudo validar el acta', 'error');
    }
  };

  const guardarActa = async () => {
  try {
    setLoading(true);
    const medidasTexto = buildMedidasTexto(actaForm.medidas_recomendadas_sel, actaForm.medidas_otro);
    const payload = {
      inspeccion_est_id: Number(inspeccionSeleccionada),
      fecha_notificacion: actaForm.fecha_notificacion || null,
      semana_epid: actaForm.semana_epid || null,
      lugar_ubicacion: actaForm.lugar_ubicacion || null,
      cant_nacional: actaForm.cant_nacional || null,
      cant_importado: actaForm.cant_importado || null,
      cant_afectado: actaForm.cant_afectado || null,
      cant_afectado_porcentaje: actaForm.cant_afectado_porcentaje || null,
      unidad_medida: actaForm.unidad_medida || null,
      numero_silos: actaForm.numero_silos || null,
      numero_galpones: actaForm.numero_galpones || null,
      capacidad_instalada: actaForm.capacidad_instalada || null,
      capacidad_operativa: actaForm.capacidad_operativa || null,
      capacidad_almacenamiento: actaForm.capacidad_almacenamiento || null,
      destino_objetivo: actaForm.destino_objetivo || null,
      observaciones: actaForm.observaciones || null,
      medidas_recomendadas: medidasTexto || null,
      tipo_evento_epidemia_id: actaForm.tipo_evento_epidemia_id ? Number(actaForm.tipo_evento_epidemia_id) : null
    };
    await axios.post(`${BaseUrl}/seguimiento/acta-silos`, payload, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    addNotification('Acta de Silos y Almacenes Creada', 'success');
    setActaOpen(false);
    await generarActaPDF(inspeccionSeleccionada);
  } catch (e) {
    const msg = e?.response?.data?.message || 'No se pudo crear el acta';
    addNotification(msg, 'error');
  } finally {
    setLoading(false);
  }
};

  const conclusionFromEstado = (estado) => {
  const e = String(estado || '').trim().toLowerCase();
  switch (e) {
    case 'aprobada':
    case 'finalizada':
      return 'la inspección se declara Aprobada, apta para la ejecución de las actividades conforme a la normativa vigente.';
    case 'rechazada':
      return 'la inspección se declara No Conforme (Rechazada); deberá abstenerse de ejecutar actividades que comprometan la salud integral y corregir las no conformidades señaladas.';
    case 'seguimiento':
      return 'la inspección queda en Seguimiento técnico hasta verificar el cumplimiento de las medidas correctivas establecidas.';
    case 'cuarentena':
      return 'se ordena Cuarentena preventiva de la unidad/propiedad hasta el cumplimiento de las medidas sanitarias establecidas por la autoridad competente.';
    case 'inspeccionando':
      return 'la inspección se encuentra En Curso de evaluación técnica.';
    case 'diagnosticada':
      return 'la inspección ha sido Diagnosticada y queda a la espera de la verificación de medidas y resultados.';
    case 'planificada':
    case 'pendiente':
    case 'creada':
      return 'la solicitud/planificación se encuentra en proceso de programación y evaluación previa.';
    default:
      return 'Conforme.';
  }
};

const generarCertificadoTecnico = async (inspeccionId) => {
  if (!inspeccionId) { addNotification('Selecciona una inspección', 'warning'); return; }
  try {
    setLoading(true);

    const { data: det } = await axios.get(`${BaseUrl}/seguimiento/acta-silos/inspeccion/${inspeccionId}/detalle`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });

    // Procesa los datos para evitar undefined

    const programas = Array.isArray(det?.programas) ? det.programas : [];
    const plagasEnfermedades = Array.isArray(det?.plagas_enfermedades) ? det.plagas_enfermedades : [];
    // console.log('Estado recibido:', det?.estado);
    const estado = det?.estado || '';
    const memoConclusion = conclusionFromEstado(estado);

    // Prepara los props para el PDF
    const blob = await buildCertificadoTecnicoBlob({
      inspeccion: {
        codigo_inspeccion: det?.codigo_inspeccion || '—',
        n_control: det?.n_control || '—',
        fecha_inspeccion: det?.fecha_inspeccion || '—'
      },
      propiedad: {
        propiedad_nombre: det?.propiedad_nombre || '—',
        propiedad_ubicacion: det?.propiedad_ubicacion || '—'
      },
      productores: Array.isArray(det?.productores) ? det.productores : [],
      observaciones: det?.observaciones || '—',
      fechaEmision: new Date().toISOString().slice(0,10),
      memoClienteNombre: det?.propiedad_nombre || '—',
      memoDireccion: det?.propiedad_ubicacion || '—',
      memoCiudad: det?.municipio_nombre || '—',
      memoConclusion,
      programas,
      plagasEnfermedades,
    });

    const url = URL.createObjectURL(blob);
    setPdfUrl(url);
    setPdfFileName(`Certificado_Tecnico_${inspeccionId}.pdf`);
  } catch (e) {
    console.error(e);
    addNotification('No se pudo generar el Certificado Técnico', 'error');
  } finally {
    setLoading(false);
  }
};

const generarCertificadoFitosanitario = async (inspeccionId) => {
  if (!inspeccionId) { addNotification('Selecciona una inspección', 'warning'); return; }
  try {
    setLoading(true);

    // 1) Obtener el acta con todos los campos nuevos
    const g = await axios.get(`${BaseUrl}/seguimiento/acta-silos/${inspeccionId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    const acta = g.data?.acta;

    // 2) Obtener el detalle de la inspección
    const { data: det } = await axios.get(`${BaseUrl}/seguimiento/acta-silos/inspeccion/${inspeccionId}/detalle`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });

    // 3) Preparar los datos para el PDF
    const productores = Array.isArray(det?.inspectores) ? det.inspectores : [];
    const cultivos = Array.isArray(det?.cultivos) ? det.cultivos : [];
    const silos = acta?.numero_silos || '—';
    const galpones = acta?.numero_galpones || '—';
    const capacidadInstalada = acta?.capacidad_instalada || '—';
    const capacidadOperativa = acta?.capacidad_operativa || '—';
    const capacidadAlmacenamiento = acta?.capacidad_almacenamiento || '—';
    const destino = acta?.destino_objetivo || '—';

    // 4) Generar el PDF usando los nuevos campos
    const blob = await buildCertificadoFitosanitarioBlob({
      empresaNombre: det?.propiedad_nombre || '—',
      empresaReg: det?.codigo_inspeccion || '—',
      empresaRif: det?.propiedad_rif || '—',
      parroquia: det?.parroquia_nombre || '—',
      municipio: det?.municipio_nombre || '—',
      estado: det?.estado_nombre || '—',
      representante: det?.productor_nombre || '—',
      representanteCedula: det?.productor_cedula || '—',
      silos,
      galpones,
      capacidadInstalada,
      capacidadProcesamiento: capacidadOperativa,
      capacidadAlmacenamiento,
      rubros: cultivos.join(', ') || '—',
      destino,
      inspector: productores[0]?.nombre || '—',
      inspectorCedula: productores[0]?.cedula || '—',
      fechaInspeccion: det?.fecha_inspeccion || '',
      numCertificado: `${det?.n_control || '—'} `,
      numInspeccion: `${det?.n_control || '—'} `,
      fechaEmision: new Date().toISOString().slice(0,10),
      coordinador: 'ING. GUSTAVO MUJICA',
      coordinadorCedula: 'V-9.601.781',
    });

    const url = URL.createObjectURL(blob);
    setPdfUrl(url);
    setPdfFileName(`Certificado_Fitosanitario_${inspeccionId}.pdf`);
  } catch (e) {
    console.error(e);
    addNotification('No se pudo generar el Certificado Fitosanitario', 'error');
  } finally {
    setLoading(false);
  }
};

//   try {
//     setLoading(true);

//     const it = (traza.inspecciones || []).find(i => Number(i.id) === Number(inspeccionSeleccionada));
//     if (!it) { addNotification('No se encontró la inspección seleccionada', 'error'); return; }

//     // Técnicos (opcional)
//     let tecnicos = [];
//     try {
//       const { data: det } = await axios.get(`${BaseUrl}/seguimiento/acta-silos/inspeccion/${inspeccionId}/detalle`, {
//         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//       });
//       tecnicos = Array.isArray(det?.inspectores) ? det.inspectores.map(t => ({
//         nombre: t.nombre, apellido: t.apellido, cedula: t.cedula, cargo: t.cargo
//       })) : [];
//     } catch { tecnicos = []; }

//     const productores = Array.isArray(traza.productores) ? traza.productores : [];
//     const cultivos = Array.isArray(traza.cultivos) ? traza.cultivos : [];
//     const programasDet = (Array.isArray(programas) ? programas : []).map((p) => ({
//       nombre: p.programa_nombre || `Programa #${p.programa_fito_id}`,
//       tipo: p.tipo_programa || ''
//     }));

//     // Puedes adaptar los props según lo que espera CertificadoFitosanitarioDoc
//     const blob = await buildCertificadoFitosanitarioBlob({
//       empresaNombre: traza.propiedad?.propiedad_nombre || '—',
//       empresaReg: traza.propiedad?.propiedad_registro || '—',
//       empresaRif: traza.propiedad?.propiedad_rif || '—',
//       parroquia: traza.propiedad?.parroquia_nombre || '—',
//       municipio: traza.propiedad?.municipio_nombre || '—',
//       estado: traza.propiedad?.estado_nombre || '—',
//       representante: productores[0]?.nombre || '—',
//       representanteCedula: productores[0]?.cedula || '—',
//       silos: '1',
//       capacidadInstalada: it?.capacidad_instalada || '—',
//       capacidadProcesamiento: it?.capacidad_procesamiento || '—',
//       capacidadAlmacenamiento: it?.capacidad_almacenamiento || '—',
//       rubros: cultivos.map(c => c.nombre).join(', ') || '—',
//       destino: 'ANIMAL',
//       inspector: tecnicos[0]?.nombre || '—',
//       inspectorCedula: tecnicos[0]?.cedula || '—',
//       fechaInspeccion: it?.fecha_inspeccion || '',
//       numCertificado: it?.codigo_inspeccion || '—',
//       numInspeccion: it?.codigo_inspeccion || '—',
//       fechaEmision: new Date().toISOString().slice(0,10),
//       coordinador: 'ING. GUSTAVO MUJICA',
//       coordinadorCedula: 'V-9.601.781',
//     });

//     const url = URL.createObjectURL(blob);
//     setPdfUrl(url);
//     setPdfFileName(`Certificado_Fitosanitario_${inspeccionId}.pdf`);
//   } catch (e) {
//     console.error(e);
//     addNotification('No se pudo generar el Certificado Fitosanitario', 'error');
//   } finally {
//     setLoading(false);
//   }
// };

  const openReporte = (tipo, idForce) => {
    const targetId = idForce || inspeccionSeleccionada;
    if (!targetId) {
      addNotification('Selecciona una inspección para generar el reporte', 'warning');
      return;
    }
    if (tipo === 'acta') {
      onActaButtonClick(); 
      return;
    }
    const url = `${BaseUrl}/reportes/inspeccion/${targetId}?tipo=${tipo}`;
    window.open(url, '_blank');
  };

  const handleEliminarPrograma = async (progId) => {
  if (!progId) return;
  if (!inspeccionSeleccionada) {
    addNotification('Selecciona una inspección', 'warning');
    return;
  }
  try {
    setProgLoading(true);
    await axios.delete(`${BaseUrl}/seguimiento/inspeccion/programa/${progId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    addNotification('Programa eliminado', 'success');
    await fetchProgramasAsignados(inspeccionSeleccionada);
  } catch (e) {
    const msg = e?.response?.data?.message || 'No se pudo eliminar el programa';
    addNotification(msg, 'error');
  } finally {
    setProgLoading(false);
  }
};

const confirmarEliminarPrograma = async () => {
  const id = confirmProg.id;
  closeConfirmEliminarPrograma();
  await handleEliminarPrograma(id);
};

  const primeraFecha = useMemo(() => {
    if (!traza.inspecciones.length) return null;
    const first = [...traza.inspecciones].sort(
      (a, b) => new Date(a.fecha_inspeccion) - new Date(b.fecha_inspeccion)
    )[0];
    return first?.fecha_inspeccion || null;
  }, [traza.inspecciones]);

  const propCover = useMemo(() => {
    const img = traza.galeria?.[0]?.imagen;
    return img ? `${BaseUrl}/uploads/inspeccion_est/${img}` : null;
  }, [traza.galeria]);

  const avatarFromName = (nombre = '', apellido = '') => {
    const n = (nombre || '').trim();
    const a = (apellido || '').trim();
    const txt = [n, a].filter(Boolean).join(' ');
    if (!txt) return `https://ui-avatars.com/api/?name=NA&background=98c79a&color=fff&rounded=true`;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(txt)}&background=98c79a&color=fff&rounded=true`;
  };

  const selectedNumero = useMemo(() => {
    const arr = Array.isArray(traza.inspecciones) ? traza.inspecciones : [];
    const idx = arr.findIndex(it => Number(it.id) === Number(inspeccionSeleccionada));
    return idx >= 0 ? idx + 1 : null;
  }, [traza.inspecciones, inspeccionSeleccionada]);

  useEffect(() => {
    setCurrentPage(1);
  }, [traza.inspecciones]);

  return (
    <div className="mainContainer">
      {loading && <Spinner text="Procesando..." />}

        {confirmProg.abierto && (
          <div className="modalOverlay">
            <div className="modal">
              <button className="closeButton" onClick={closeConfirmEliminarPrograma}>&times;</button>
              <h2>Eliminar programa</h2>
              <p>¿Estás seguro de que deseas eliminar el programa <strong>{confirmProg.nombre}</strong> de esta inspección?</p>
              <div className="modalActions">
                <button className="cancelButton" onClick={closeConfirmEliminarPrograma}>Cancelar</button>
                <button
                  className="confirmButton"
                  onClick={confirmarEliminarPrograma}
                  disabled={progLoading}
                >
                  {progLoading ? 'Eliminando...' : 'Confirmar'}
                </button>
              </div>
            </div>
          </div>
        )}

      {/* Modal Acta de Silos  */}
      {actaOpen && (
        <div className="modalOverlay">
          <div className="modal">
            <button className="closeButton" onClick={() => setActaOpen(false)}>&times;</button>
            <h2>Acta de Inspección · Silos y Almacenes</h2>
            {loading ? (
              <Spinner text="Cargando..." />
            ) : (
              <form className="modalForm">
                <div className="formColumns">
                  <div className="formGroup">
                    <label><span className='Unique'>*</span>Fecha notificación:</label>
                    <input
                      type="date"
                      className="date"
                      value={actaForm.fecha_notificacion || ''}
                      onChange={(e) => handleFechaNotifChange(e.target.value)}
                    />
                  </div>
                  <div className="formGroup">
                    <label><span className='Unique'>*</span>Semana epidemiológica:</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="Semana N de Mes YYYY"
                      value={actaForm.semana_epid || ''}
                      onChange={(e) => handleActaChange('semana_epid', e.target.value)}
                    />
                  </div>
                  <div className="formGroup">
                    <label><span className='Unique'>*</span>Lugar donde se realizo la Inspección:</label>
                    <input
                      type="text"
                      className="input"
                      placeholder='Donde Ocurrio la Inspección'
                      value={actaForm.lugar_ubicacion}
                      onChange={(e) => handleActaChange('lugar_ubicacion', e.target.value)}
                    />
                  </div>
                  <div className="formGroup">
                    <label><span className='Unique'>*</span>Cant. nacional:</label>
                    <input
                      type="number"
                      className="number"
                      min="0"
                      step="any"
                      value={actaForm.cant_nacional}
                      onChange={(e) => handleActaChange('cant_nacional', e.target.value)}
                    />
                  </div>
                  <div className="formGroup">
                    <label><span className='Unique'>*</span>Cant. importado:</label>
                    <input
                      type="number"
                      className="number"
                      min="0"
                      step="any"
                      value={actaForm.cant_importado}
                      onChange={(e) => handleActaChange('cant_importado', e.target.value)}
                    />
                  </div>
                  <div className="formGroup">
                    <label><span className='Unique'>*</span>Cant. afectado:</label>
                    <input
                      type="number"
                      className="number"
                      min="0"
                      step="any"
                      value={actaForm.cant_afectado}
                      onChange={(e) => handleActaChange('cant_afectado', e.target.value)}
                    />
                    <small style={{ marginTop: 4, color: 'var(--grey4)' }}>
                      {pctAfectado != null ? `Afectado: ${pctAfectado.toFixed(2)} %` : '—'}
                    </small>
                  </div>
                  <div className="formGroup">
                    <label><span className='Unique'>*</span>Unidad de medida:</label>
                    <SingleSelect
                      options={unidadOptions}
                      value={
                        unidadOptions.find(o => o.value === String(actaForm.unidad_medida || '')) || null
                      }
                      onChange={(opt) => handleActaChange('unidad_medida', opt ? opt.value : '')}
                      placeholder="— Selecciona —"
                    />
                  </div>
                  <div className="formGroup">
                    <label><span className='Unique'>*</span>Número de silos:</label>
                    <input
                      type="text"
                      className="input"
                      placeholder='Cantidad de silos'
                      value={actaForm.numero_silos}
                      onChange={e => handleActaChange('numero_silos', e.target.value)}
                    />
                  </div>
                  <div className="formGroup">
                    <label><span className='Unique'>*</span>Número de galpones:</label>
                    <input
                      type="text"
                      className="input"
                      placeholder='Cantidad de Galpones'
                      value={actaForm.numero_galpones}
                      onChange={e => handleActaChange('numero_galpones', e.target.value)}
                    />
                  </div>
                  <div className="formGroup">
                    <label><span className='Unique'>*</span>Capacidad instalada:</label>
                    <input
                      type="text"
                      placeholder='Capacidad Instalada'
                      className="input"
                      value={actaForm.capacidad_instalada}
                      onChange={e => handleActaChange('capacidad_instalada', e.target.value)}
                    />
                  </div>
                  <div className="formGroup">
                    <label><span className='Unique'>*</span>Capacidad operativa:</label>
                    <input
                      type="text"
                      placeholder='Capacidad Operativa'
                      className="input"
                      value={actaForm.capacidad_operativa}
                      onChange={e => handleActaChange('capacidad_operativa', e.target.value)}
                    />
                  </div>
                  <div className="formGroup">
                    <label><span className='Unique'>*</span>Capacidad de almacenamiento:</label>
                    <input
                      type="text"
                      className="input"
                      placeholder='Capacidad de Almacenamiento'
                      value={actaForm.capacidad_almacenamiento}
                      onChange={e => handleActaChange('capacidad_almacenamiento', e.target.value)}
                    />
                  </div>
                  <div className="formGroup">
                    <label><span className='Unique'>*</span>Destino objetivo:</label>
                    <input
                      type="text"
                      className="input"
                      placeholder='Rubros Destinados a:'
                      value={actaForm.destino_objetivo}
                      onChange={e => handleActaChange('destino_objetivo', e.target.value)}
                    />
                  </div>
                  <div className="formGroup">
                    <label><span className='Unique'>*</span>Tipo de evento:</label>
                    <SingleSelect
                      options={tipoEventoOptions}
                      value={
                        tipoEventoOptions.find(o => o.value === String(actaForm.tipo_evento_epidemia_id || '')) || null
                      }
                      onChange={(opt) => handleActaChange('tipo_evento_epidemia_id', opt ? opt.value : '')}
                      placeholder="— Selecciona —"
                    />
                  </div>
                  <div className="formGroup" style={{ gridColumn: '1 / -1' }}>
                    <label><span className='Unique'>*</span>Medidas recomendadas:</label>
                    <div className="finalidades-group" style={{ maxHeight: 220 }}>
                      {RECOMENDACIONES.map((m) => (
                        <label key={m} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <input
                            type="checkbox"
                            className="finalidad-checkbox"
                            checked={(actaForm.medidas_recomendadas_sel || []).includes(m)}
                            onChange={() => toggleRecomendacion(m)}
                          />
                          {m}
                        </label>
                      ))}
                      {(actaForm.medidas_recomendadas_sel || []).includes('Otro') && (
                        <input
                          type="text"
                          className="input"
                          placeholder="Especifique la medida"
                          value={actaForm.medidas_otro}
                          onChange={(e) => handleActaChange('medidas_otro', e.target.value)}
                        />
                      )}
                    </div>

                    {/* Vista previa del texto que se guardará */}
                    <label style={{ marginTop: 10 }}>Vista previa:</label>
                    <textarea
                      className="textarea"
                      disabled
                      value={buildMedidasTexto(actaForm.medidas_recomendadas_sel, actaForm.medidas_otro)}
                      placeholder="Se generará automáticamente a partir de las medidas seleccionadas"
                    />
                  </div>
                  <div className="formGroup" style={{ gridColumn: '1 / -1' }}>
                    <label><span className='Unique'>*</span>Observaciones:</label>
                    <textarea
                      className="textarea"
                      value={actaForm.observaciones}
                      placeholder='Resume Observaciones Relevantes'
                      onChange={(e) => handleActaChange('observaciones', e.target.value)}
                    />
                  </div>
                </div>
                <div className="modalActions">
                  <button
                    type="button"
                    className="saveButton"
                    onClick={guardarActa}
                    disabled={loading}
                  >
                    {loading ? 'Guardando...' : 'Guardar y Previsualizar'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Previsualización PDF */}
      {pdfUrl && (
        <div className="modalOverlay">
          <div className="modalDetalle">
            <button className="closeButton" onClick={() => setPdfUrl(null)}>&times;</button>
            <iframe src={pdfUrl} width="100%" height="600px" title="Acta Silos PDF" />
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

      <div className={`SectionSeguimiento ${styles.sectionHeader}`}>
        <div className={`ss-left ${styles.headerLeft}`}>
          <button className={`create btn-estandar btn-estandar--lg`} onClick={() => navigate('/SeccionOne')}>
            <img src={Icon.flecha} alt="Regresar" className='icon' />
            Regresar
          </button>
        </div>

        <div className={`ss-right ${styles.headerCard}`}>
          <h2 className="titleOne">Trazabilidad de Propiedad</h2>
          <h3 className="titleTwo">
            Propiedad: {traza.propiedad?.propiedad_nombre || '—'} 
          </h3>
            <h3 className='titleTwo'>
                RIF: {traza.propiedad?.propiedad_rif || '—'}
            </h3>
                
          <div style={{ color: 'var(--grey4)' }}>
            Total inspecciones: {traza.inspecciones.length}{' '}
            {primeraFecha ? `· En seguimiento desde hace ${timeSince(primeraFecha)}` : ''}
          </div>
          <div style={{ color: 'var(--grey4)' }}>
            Ubicación: {traza.propiedad?.propiedad_ubicacion || '—'}
          </div>
        </div>

        <div className={`ss-right ${styles.headerCard}`}>
          <h2 className="titleOne">RUNSAI y Cultivos</h2>
          <h3 className="titleTwo">
            CÓDIGO RUNSAI {traza.productores?.length > 1 ? 'productores' : 'productor'}:
          </h3>
          <div className="chipsRow" style={{ marginTop: 6 }}>
            {(traza.productores || []).length > 0
              ? (traza.productores || []).map((p, i) => (
                  <span key={`r-${p.id || i}`} className="chip">
                    {p.codigo_runsai || p.runsai || '—'}
                  </span>
                ))
              : <span style={{ color: 'var(--grey4)' }}>—</span>
            }
          </div>

          <div style={{ marginTop: 10, color: 'var(--grey4)' }}>Cultivos de la Propiedad:</div>
          <div className="chipsRow" style={{ marginTop: 6 }}>
            {(traza.cultivos || []).length > 0
              ? (traza.cultivos || []).map((c, i) => (
                  <span key={`c-${c.id || i}`} className="chip">{c.nombre}</span>
                ))
              : <span style={{ color: 'var(--grey4)' }}>—</span>
            }
          </div>
        </div>
      </div>

      <div className={styles.landingHeader}>
        <div className={styles.propCard}>
          <div className={styles.propCover}>
            {propCover ? (
              <img src={propCover} alt="propiedad" onError={(e) => (e.currentTarget.style.display = 'none')} />
            ) : (
              <div className={styles.propPlaceholder}>Sin imagen</div>
            )}
          </div>
          <div className={styles.propInfo}>
            <div className={styles.propTitle}>{traza.propiedad?.propiedad_nombre || 'Propiedad'}</div>
            <div className={styles.propMeta}>
              <span>RIF: {traza.propiedad?.propiedad_rif || '—'}</span>
              <span>·</span>
              <span>{traza.propiedad?.propiedad_ubicacion || '—'}</span>
            </div>
            <div className={styles.propStats}>
              <div>
                <strong>{traza.inspecciones.length}</strong>
                <span>Inspecciones</span>
              </div>
              <div>
                <strong>{primeraFecha ? timeSince(primeraFecha) : '—'}</strong>
                <span>Tiempo en seguimiento</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.reportCard}>
          <div className={styles.reportHeader}>
            <div className={styles.reportTitle}>Reportes</div>
            <div className={styles.reportHint}>
              {inspeccionSeleccionada
                ? `Inspección seleccionada: #${selectedNumero ?? '—'}`
            : 'Selecciona una inspección en la línea de tiempo'}
            </div>
          </div>
          <div className={styles.reportActions}>
          {tienePermiso('propiedad', 'exportar') && (
            <button
            className={styles.reportBtn}
            onClick={() => openReporte('acta')}
            disabled={!inspeccionSeleccionada}
            title="Generar Acta de Silos y Almacenes"
            >
              Acta Silos y Almacenes
            </button>
          )}
            {/* <button
              className={styles.reportBtn}
              onClick={() => openReporte('general')}
              disabled={!inspeccionSeleccionada}
              title="Generar Data Epidemiologica"
            >
              Data Epidemiologica
            </button> */}
          {tienePermiso('propiedad', 'exportar') && (
            <button
            className={styles.reportBtn}
            onClick={() => generarCertificadoTecnico(inspeccionSeleccionada)}
            disabled={!inspeccionSeleccionada}
            title="Generar Certificado Técnico"
            >
              Certificado Técnico
            </button>
          )}
          {tienePermiso('propiedad', 'exportar') && (
            <button
            className={styles.reportBtn}
            onClick={() => generarCertificadoFitosanitario(inspeccionSeleccionada)}
            disabled={!inspeccionSeleccionada}
            title="Generar Certificado Fitosanitario"
            >
              Certificado Fitosanitario
            </button>
          )}
            {/* <button
              className={styles.reportBtn}
              onClick={() => openReporte('informe')}
              disabled={!inspeccionSeleccionada}
              title="Generar Acta de Trazabilidad de Inspección"
            >
              Acta de Trazabilidad de Inspección
            </button> */}
          </div>
        </div>

        <div className={styles.prodCard}>
          <div className={styles.prodHeader}>
            <div className={styles.prodTitle}>Productores</div>
            <div className={styles.prodCount}>{traza.productores?.length || 0}</div>
          </div>
          <div className={styles.prodList}>
            {(traza.productores || []).map((p) => (
              <div key={p.id} className={styles.prodItem}>
                <img
                  className={styles.prodAvatar}
                  src={avatarFromName(p.nombre, p.apellido)}
                  alt="avatar"
                  loading="lazy"
                />
                <div className={styles.prodBody}>
                  <div className={styles.prodName}>{[p.nombre, p.apellido].filter(Boolean).join(' ') || '—'}</div>
                  <div className={styles.prodMeta}>Cédula: {p.cedula || '—'}</div>
                </div>
              </div>
            ))}
            {(!traza.productores || traza.productores.length === 0) && (
              <div className={styles.prodEmpty}>Esta propiedad no tiene productores asociados.</div>
            )}
          </div>
        </div>
      </div>

    <div className="tableSection programasSection" style={{ marginTop: 20, marginBottom: 40, overflow: 'visible', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <h3 className="titleTwo" style={{ marginBottom: 10 }}>
            Programas asignados 
          </h3>
          {progLoading && <span style={{ color: 'var(--grey4)' }}>Cargando...</span>}
        </div>

        {(!programas || programas.length === 0) ? (
          <div style={{ color: 'var(--grey4)' }}>
            {inspeccionSeleccionada
              ? 'Esta inspección no tiene programas asignados.'
              : 'Selecciona una inspección para ver sus programas asignados.'}
          </div>
        ) : (
          // Fichas (sin estado)
          <div className="progCards">
            {programas.map((p) => {
              const isHovered = hoveredProg === p.id;
              const isPinned = pinnedProg === p.id;
              const showHover = isHovered || isPinned;
              return (
                <div
                  key={p.id}
                  className="progCard"
                  onMouseEnter={() => setHoveredProg(p.id)}
                  onMouseLeave={() => setHoveredProg(null)}
                  onClick={(e) => {
                    // Evita que clic en el botón eliminar o cerrar del overlay fije/quite el hover
                    if (e.target.closest('.closeButton2') || e.target.closest('.progHoverClose')) return;
                    setPinnedProg(prev => (prev === p.id ? null : p.id));
                  }}
                >
                  <div className="progCardTitle" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <div>
                      <strong>{p.programa_nombre || `Programa #${p.programa_fito_id}`}</strong>
                      {p.tipo_programa && <small className="progType" style={{ marginLeft: 0, marginTop:8,  display: 'block'}}>Tipo: {p.tipo_programa}</small>}
                    </div>
                    <button
                      type="button"
                      className='closeButton2'
                      style={{ top: 6, right: 6}}
                      onClick={(e) => { e.stopPropagation(); openConfirmEliminarPrograma(p); }}
                      title="Eliminar programa"
                    >
                      ×
                    </button>
                  </div>

                  {Array.isArray(p.plagas) && p.plagas.length > 0 && (
                    <div className="chipsRow">
                      {p.plagas.map((pl, idx) => (
                        <span key={`${p.id}-pl-${idx}`} className="chip">{pl}</span>
                      ))}
                    </div>
                  )}

                  <div className="progCardMeta">
                    <div><span className="metaLabel">Fecha:</span> {p.fecha_asociacion || '—'}</div>
                    <div className="observacion">
                      <span className="metaLabel">Observación:</span> {p.observacion || '—'}
                    </div>
                  </div>

                  {/* NUEVO: Hover card */}
                  {showHover && (
                    <div className={`progHoverCard ${isPinned ? 'pinned' : ''}`}>
                      <div className="progHoverHeader">
                        <div>
                          <div className="progHoverTitle">{p.programa_nombre || `Programa #${p.programa_fito_id}`}</div>
                          {p.tipo_programa && <div className="progHoverSub">Tipo: {p.tipo_programa}</div>}
                        </div>
                        {isPinned && (
                          <button
                            type="button"
                            className="progHoverClose"
                            onClick={(e) => { e.stopPropagation(); setPinnedProg(null); }}
                            title="Cerrar"
                          >
                            ×
                          </button>
                        )}
                      </div>
                      <div className="progHoverBody">
                        <div className="progHoverRow"><span>Fecha:</span> {p.fecha_asociacion || '—'}</div>
                        <div className="progHoverRow">
                          <span>Plagas:</span>
                            {(() => {
                              const det = Array.isArray(p.plagas_detalle) ? p.plagas_detalle : [];
                              const base = det.length > 0
                                ? det.map(x => ({ nombre: x.nombre, cientifico: x.nombre_cientifico || '' }))
                                : (Array.isArray(p.plagas) ? p.plagas.map(n => ({ nombre: n, cientifico: '' })) : []);

                              // Elimina duplicados y ordena por nombre (ES)
                              const seen = new Set();
                              const lista = base
                                .filter(o => {
                                  const key = `${(o.nombre || '').trim()}|${(o.cientifico || '').trim()}`.toLowerCase();
                                  if (seen.has(key)) return false; seen.add(key); return true;
                                })
                                .sort((a, b) => (a.nombre || '').localeCompare(b.nombre || '', 'es', { sensitivity: 'base' }));

                              return lista.length > 0 ? (
                                <ul className="plagasList">
                                  {lista.map((pl, idx) => (
                                    <li key={`${p.id}-pldet-${idx}`} className="plagaItem">
                                      <div className="plagaCommon">{pl.nombre || '—'}</div>
                                      {pl.cientifico && <div className="plagaScientific">{pl.cientifico}</div>}
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <span> —</span>
                              );
                            })()}
                        </div>
                        <div className="progHoverRow" style={{ marginTop: 6 }}>
                          <span>Observación:</span>
                          <div className="progHoverObs">{p.observacion || '—'}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Timeline de inspecciones */}
      <div className="tableSection" style={{ marginTop: 20,marginBottom: 30, overflow: 'visible' }}>
        {traza.inspecciones.length === 0 ? (
          <div style={{ color: 'var(--grey4)' }}>No hay inspecciones registradas para esta propiedad.</div>
        ) : (
          <div className={styles.timelineHost}>
            <div className={styles.timelineWrap} style={{ overflow: 'visible', position: 'relative', zIndex: 1 }}>
              <div className={styles.timeline}>
                {currentInspecciones.map((it) => {
                  const estadoClass = `badge-${(it.estado || '').toLowerCase()}`;
                  const isHovered = hovered === it.id;
                  const isSelected = inspeccionSeleccionada === it.id;
                  return (
                    <div
                      key={it.id}
                      className={`${styles.timelineItem} ${isSelected ? styles.timelineItemSelected : ''}`}
                      onMouseEnter={() => setHovered(it.id)}
                      onMouseLeave={() => setHovered(null)}
                      onFocus={() => setHovered(it.id)}
                      onBlur={() => setHovered(null)}
                      onClick={() => setInspeccionSeleccionada(it.id)}
                      role="button"
                      tabIndex={0}
                    >
                      <div className={styles.markerCol}>
                        <div className={styles.line} />
                        <div className={`${styles.marker} ${styles[estadoClass]}`} title={it.estado} />
                        <div className={styles.date}>{it.fecha_inspeccion || '—'}</div>
                        <div className={styles.state}>
                          <span className={`badge-estado badge-${String(it.estado).toLowerCase().replace(/\s/g, '_')}`}>
                            {it.estado}
                          </span>
                        </div>
                      </div>

                      <div className={styles.itemBody}>
                        <div className={styles.codes}>
                          <strong>{it.codigo_inspeccion || 'SIN-COD'}</strong>
                          <span className={styles.muted}> · N° Control: {it.n_control || '—'}</span>
                        </div>
                        <div className={styles.meta}>
                          <span className={styles.muted}>
                            Solicitud: {it.solicitud_codigo || it.solicitud_id} · Planif: {it.planificacion_codigo || it.planificacion_id}
                          </span>
                        </div>

                        {isHovered && (
                          <div className={styles.hoverCard}>
                            <div className={styles.hoverHeader}>
                              <div>
                                <div className={styles.hoverTitle}>{it.codigo_inspeccion || 'Inspección'}</div>
                                <div className={styles.hoverSub}>
                                  Estado: <span className={`badge-estado ${estadoClass}`}>{it.estado}</span>
                                </div>
                              </div>
                              <div className={styles.hoverDate}>{it.fecha_inspeccion || '—'}</div>
                            </div>

                            <div className={styles.hoverText}>
                              <div><strong>Hora:</strong> {it.hora_inspeccion || '—'}</div>
                              <div><strong>N° Control:</strong> {it.n_control || '—'}</div>
                              <div className={styles.muted}>
                                Solicitud: {it.solicitud_codigo || it.solicitud_id} · Planif: {it.planificacion_codigo || it.planificacion_id}
                              </div>
                              <div className="chipsRow" style={{ marginTop: 6 }}>
                                {Array.isArray(it.finalidades) && <span className="chip">Finalidades: {it.finalidades.length}</span>}
                                {Array.isArray(it.imagenes) && <span className="chip">Imágenes: {it.imagenes.length}</span>}
                              </div>
                            </div>

                            {(it.aspectos || it.ordenamientos) && (
                              <div className={styles.hoverText}>
                                {it.aspectos && (<div><strong>Aspectos:</strong> {it.aspectos}</div>)}
                                {it.ordenamientos && (<div><strong>Ordenamientos:</strong> {it.ordenamientos}</div>)}
                              </div>
                            )}

                            {Array.isArray(it.finalidades) && it.finalidades.length > 0 && (
                              <div className={styles.hoverText}>
                                <strong>Finalidades:</strong>
                                <ul className={styles.finalidadesList}>
                                  {it.finalidades.map((fin) => (
                                    <li key={fin.id}>{fin.finalidad}: {fin.objetivo || '—'}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {Array.isArray(it.imagenes) && it.imagenes.length > 0 && (
                              <div className={styles.thumbs}>
                                {it.imagenes.slice(0, 6).map((img) => (
                                  <a
                                    key={img.id}
                                    href={`${BaseUrl}/uploads/inspeccion_est/${img.imagen}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.thumbLink}
                                    title="Abrir imagen"
                                  >
                                    <img
                                      src={`${BaseUrl}/uploads/inspeccion_est/${img.imagen}`}
                                      alt="img"
                                      className={styles.thumb}
                                      loading="lazy"
                                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                    />
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            {/* Aquí va la paginación */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 10 }}>
                <button
                  className="pagination-btn"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Anterior
                </button>
                <span>Página {currentPage} de {totalPages}</span>
                <button
                  className="pagination-btn"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Siguiente
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default SeguimientoInspeccion;