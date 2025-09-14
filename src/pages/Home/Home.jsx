import React, { useState, useEffect } from 'react';
import styles from './home.module.css';
import '../../main.css';
import icon from '../../components/iconos/iconos';
import Chart from '../../components/chart/chart4';
import SearchBar from "../../components/searchbart/SearchBar";
import axios from 'axios';
import { BaseUrl } from '../../utils/constans';
import Spinner from '../../components/spinner/Spinner';
import FileSaver from 'file-saver';
import { useNotification } from '../../utils/NotificationContext';
import searchStyles from '../../components/searchbart/searchmodal.module.css';
import SingleSelect from '../../components/selectmulti/SingleSelect';

const chartFilterOptions = [
    { value: 'empleados-activos', label: 'Empleados Activos' },
    { value: 'empleados-por-cargo', label: 'Empleados por Cargo' },
    { value: 'empleados-por-estado', label: 'Empleados por Estado' }, 
    { value: 'inspecciones-realizadas', label: 'Inspecciones Realizadas' },
    { value: 'inspecciones-por-tipo', label: 'Inspecciones por Tipo' }, 
    { value: 'inspecciones-por-estado', label: 'Inspecciones por Estado' }, 
    { value: 'planificaciones-por-estado', label: 'Planificaciones por Estado' },
    { value: 'planificaciones-por-inspector', label: 'Planificaciones por Inspector' }, 
    { value: 'solicitudes-por-estado', label: 'Solicitudes por Estado' },
    { value: 'solicitudes-por-tipo', label: 'Solicitudes por Tipo' },
    { value: 'propiedades-registradas', label: 'Propiedades Registradas' },
    { value: 'propiedades-por-tipo', label: 'Propiedades por Tipo' },
    { value: 'propiedades-por-sector', label: 'Propiedades por Sector' }, 
    { value: 'propiedades-por-municipio', label: 'Propiedades por Municipio' }, 
    { value: 'propiedades-por-parroquia', label: 'Propiedades por Parroquia' }, 
    { value: 'productores-registrados', label: 'Productores Registrados' },
    { value: 'programas-por-tipo', label: 'Programas por Tipo' },
    { value: 'total-programas-activos', label: 'Total Programas Activos' },
    { value: 'total-programas-por-tipo', label: 'Total Programas por Tipo' },
    { value: 'bitacora-por-usuario', label: 'Bitácora por Usuario' },
    { value: 'permisos-por-tipo', label: 'Permisos por Tipo' },
    { value: 'permisos-por-estado', label: 'Permisos por Estado' }
];

function Home() {
    // Cartas dinámicas
    const [totales, setTotales] = useState({
        empleadosActivos: 0,
        operacionesCompletadas: 0,
        programasPendientes: 0,
        inspeccionRechazada: 0
    });

    const toBool = (v) => v === true || v === 'true' || v === 1 || v === '1';
    const formatMes = (val) => {
    const d = new Date(val);
    if (!isNaN(d)) return d.toLocaleDateString('es-VE', { month: 'short', year: 'numeric' });
    const s = String(val || '');
    return s.slice(0, 7) || 'N/D';
};

    useEffect(() => {
        if (!dateRange.from || !dateRange.to) {
            const to = new Date();
            const from = new Date();
            from.setMonth(from.getMonth() - 12);
            setDateRange({
                from: from.toISOString().slice(0, 10),
                to: to.toISOString().slice(0, 10),
            });
        }
    }, []);

    // Tabla dinámica
    const [empleadosHoy, setEmpleadosHoy] = useState([]);
    const [datosFiltrados, setDatosFiltrados] = useState([]);
    const [searchTabla, setSearchTabla] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const [loadingTabla, setLoadingTabla] = useState(false);
    const [loadingTotales, setLoadingTotales] = useState(false);
    const [detalleModal, setDetalleModal] = useState({ abierto: false, propiedad: null, loading: false });
    const { addNotification } = useNotification();

    // Modal para cartas con SearchBar local
    const [modalCarta, setModalCarta] = useState({
        abierto: false,
        tipo: '',
        datos: [],
        filtrados: [],
        campos: [],
        titulo: '',
        loading: false
    });

    // Gráfica
    const [chartFilter, setChartFilter] = useState(chartFilterOptions[0]);
    const [dateRange, setDateRange] = useState({ from: '', to: '' });
    const [chartLabels, setChartLabels] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [chartTitle, setChartTitle] = useState('Gráfica');
    const handleChartFilterChange = (option) => setChartFilter(option);
    
    // Traer datos al montar
    useEffect(() => {
        async function fetchTotales() {
            setLoadingTotales(true);
            try {
                const res = await axios.get(`${BaseUrl}/home/totales`);
                setTotales({
                    empleadosActivos: res.data.empleadosActivos,
                    operacionesCompletadas: res.data.solicitudesCompletadas,
                    programasPendientes: res.data.planificacionesPendientes,
                    inspeccionRechazada: res.data.inspeccionRechazada
                });
            } catch (error) {
                console.error('Error al obtener el total de los datos', error);
                addNotification('Error al obtener los totales', 'error');
            }
            setLoadingTotales(false);
        }
        async function fetchEmpleadosHoy() {
            setLoadingTabla(true);
            try {
                const hoy = new Date().toISOString().slice(0, 10);
                const res = await axios.get(`${BaseUrl}/home/empleados-dia?fecha=${hoy}`);
                setEmpleadosHoy(res.data);
                setDatosFiltrados(res.data);
            } catch (error) {
                console.error('Error al obtener los datos para la tabla', error);
                addNotification('Error al obtener empleados del día', 'error');
                setEmpleadosHoy([]); setDatosFiltrados([]);
            }
            setLoadingTabla(false);
        }
        
        fetchTotales();
        fetchEmpleadosHoy();
    }, []);

    // --- Gráficas dinámicas ---
    useEffect(() => {
        async function fetchChartData() {
            if (!dateRange.from || !dateRange.to || !chartFilter || !chartFilter.value) {
                setChartLabels([]);
                setChartData([]);
                setChartTitle('Gráfica');
                return;
            }

            let endpoint = '';
            let title = '';
            switch (chartFilter.value) {
                case 'empleados-activos':
                    endpoint = '/graficas/empleados-activos';
                    title = 'Empleados Activos';
                    break;
                case 'empleados-por-cargo':
                    endpoint = '/graficas/empleados-por-cargo';
                    title = 'Empleados por Cargo';
                    break;
                case 'empleados-por-estado':
                    endpoint = '/graficas/empleados-por-estado';
                    title = 'Empleados por Estado';
                    break;
                case 'inspecciones-realizadas':
                    endpoint = '/graficas/inspecciones-realizadas';
                    title = 'Inspecciones Realizadas';
                    break;
                case 'inspecciones-por-tipo':
                    endpoint = '/graficas/inspecciones-por-tipo';
                    title = 'Inspecciones por Tipo';
                    break;
                case 'inspecciones-por-estado':
                    endpoint = '/graficas/inspecciones-por-estado';
                    title = 'Inspecciones por Estado';
                    break;
                case 'planificaciones-por-estado':
                    endpoint = '/graficas/planificaciones-por-estado';
                    title = 'Planificaciones por Estado';
                    break;
                case 'planificaciones-por-inspector':
                    endpoint = '/graficas/planificaciones-por-inspector';
                    title = 'Planificaciones por Inspector';
                    break;
                case 'solicitudes-por-estado':
                    endpoint = '/graficas/solicitudes-por-estado';
                    title = 'Solicitudes por Estado';
                    break;
                case 'solicitudes-por-tipo':
                    endpoint = '/graficas/solicitudes-por-tipo';
                    title = 'Solicitudes por Tipo';
                    break;
                case 'propiedades-registradas':
                    endpoint = '/graficas/propiedades-registradas';
                    title = 'Propiedades Registradas';
                    break;
                case 'propiedades-por-tipo':
                    endpoint = '/graficas/propiedades-por-tipo';
                    title = 'Propiedades por Tipo';
                    break;
                case 'propiedades-por-sector':
                    endpoint = '/graficas/propiedades-por-sector';
                    title = 'Propiedades por Sector';
                    break;
                case 'propiedades-por-municipio':
                    endpoint = '/graficas/propiedades-por-municipio';
                    title = 'Propiedades por Municipio';
                    break;
                case 'propiedades-por-parroquia':
                    endpoint = '/graficas/propiedades-por-parroquia';
                    title = 'Propiedades por Parroquia';
                    break;
                case 'productores-registrados':
                    endpoint = '/graficas/productores-registrados';
                    title = 'Productores Registrados';
                    break;
                case 'programas-por-tipo':
                    endpoint = '/graficas/programas-por-tipo';
                    title = 'Programas por Tipo';
                    break;
                case 'total-programas-activos':
                    endpoint = '/graficas/total-programas-activos';
                    title = 'Total Programas Activos';
                    break;
                case 'total-programas-por-tipo':
                    endpoint = '/graficas/total-programas-por-tipo';
                    title = 'Total Programas por Tipo';
                    break;
                case 'bitacora-por-usuario':
                    endpoint = '/graficas/bitacora-por-usuario';
                    title = 'Bitácora por Usuario';
                    break;
                case 'permisos-por-tipo':
                    endpoint = '/graficas/permisos-por-tipo';
                    title = 'Permisos por Tipo';
                    break;
                case 'permisos-por-estado':
                    endpoint = '/graficas/permisos-por-estado';
                    title = 'Permisos por Estado';
                    break;
                default:
                    endpoint = '/graficas/empleados-activos';
                    title = 'Empleados Activos';
            }

            try {
                const res = await axios.get(`${BaseUrl}${endpoint}?from=${dateRange.from}&to=${dateRange.to}`);
                const rows = Array.isArray(res.data) ? res.data : [];
                let labels = [];
                let data = [];

                switch (chartFilter.value) {
                    case 'empleados-activos':
                    case 'inspecciones-realizadas':
                    case 'propiedades-registradas':
                    case 'productores-registrados':
                        labels = rows.map(r => formatMes(r.mes));
                        data = rows.map(r => Number(r.cantidad) || 0);
                        break;
                    case 'inspecciones-por-tipo':
                    case 'solicitudes-por-tipo':
                    case 'propiedades-por-tipo':
                    case 'programas-por-tipo':
                        labels = rows.map(r => r.tipo || 'Sin tipo');
                        data = rows.map(r => Number(r.cantidad) || 0);
                        break;
                    case 'empleados-por-cargo':
                        labels = rows.map(r => r.cargo || 'Sin cargo');
                        data = rows.map(r => Number(r.cantidad) || 0);
                        break;
                    case 'empleados-por-estado':
                        labels = rows.map(r => (toBool(r.estado) ? 'Activos' : 'Inactivos'));
                        data = rows.map(r => Number(r.cantidad) || 0);
                        break;
                    case 'inspecciones-por-estado':
                    case 'planificaciones-por-estado':
                    case 'solicitudes-por-estado':
                        labels = rows.map(r => r.estado || 'Sin estado');
                        data = rows.map(r => Number(r.cantidad) || 0);
                        break;
                    case 'planificaciones-por-inspector':
                        labels = rows.map(r => r.inspector || 'Sin asignar');
                        data = rows.map(r => Number(r.cantidad) || 0);
                        break;
                    case 'propiedades-por-sector':
                        labels = rows.map(r => r.sector || 'Sin sector');
                        data = rows.map(r => Number(r.cantidad) || 0);
                        break;
                    case 'propiedades-por-municipio':
                        labels = rows.map(r => r.municipio || 'Sin municipio');
                        data = rows.map(r => Number(r.cantidad) || 0);
                        break;
                    case 'propiedades-por-parroquia':
                        labels = rows.map(r => r.parroquia || 'Sin parroquia');
                        data = rows.map(r => Number(r.cantidad) || 0);
                        break;
                    case 'bitacora-por-usuario':
                        labels = rows.map(r => r.username || 'Sin usuario');
                        data = rows.map(r => Number(r.cantidad) || 0);
                        break;
                    case 'total-programas-activos':
                        labels = ['Activos'];
                        data = [Number(rows.total) || 0];
                        break;
                    case 'total-programas-por-tipo':
                        labels = rows.map(r => r.tipo || 'Sin tipo');
                        data = rows.map(r => Number(r.cantidad) || 0);
                        break;
                    case 'permisos-por-tipo':
                    case 'permisos-por-estado':
                        labels = [];
                        data = [];
                        break;
                    default:
                        labels = [];
                        data = [];
                }

                setChartLabels(labels);
                setChartData(data);
                setChartTitle(title);
            } catch (error) {
                console.error('Error con las graficas', error);
                setChartLabels([]);
                setChartData([]);
                setChartTitle('Gráfica');
                addNotification('Error al obtener datos de la gráfica', 'error');
            }
        }
        fetchChartData();
    }, [chartFilter, dateRange, BaseUrl]);

    // Modal detalle de operación del día
    const openDetalleModal = async (item) => {
        setDetalleModal({ abierto: true, propiedad: null, loading: true });
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${BaseUrl}/home/detalle-operacion/${item.planificacion_id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDetalleModal({ abierto: true, propiedad: res.data, loading: false });
        } catch (error) {
            console.error('Error obteniendo los datos para el modal de detalle', error);
            addNotification('Error al obtener detalle de operación', 'error');
            setDetalleModal({ abierto: true, propiedad: null, loading: false });
        }
    };
    const closeDetalleModal = () => setDetalleModal({ abierto: false, propiedad: null, loading: false });

    // Modal para cartas usando SearchBar local
    const handleCardClick = async (tipo) => {
        let campos, titulo, url;
        if (tipo === 'empleadosActivos') {
            url = `${BaseUrl}/home/inspectores-activos`;
            campos = ['nombre', 'apellido', 'cedula', 'cargo', 'contacto'];
            titulo = 'Inspectores Activos';
        } else if (tipo === 'operacionesCompletadas') {
            url = `${BaseUrl}/home/solicitudes-completadas`;
            campos = ['codigo', 'fecha_solicitada', 'tipo_solicitud_nombre', 'propiedad_nombre', 'usuario_username'];
            titulo = 'Solicitudes Completadas';
        } else if (tipo === 'programasPendientes') {
            url = `${BaseUrl}/home/planificaciones-pendientes`;
            campos = ['fecha_programada', 'inspector', 'tipo_inspeccion', 'propiedad', 'estado'];
            titulo = 'Planificaciones Pendientes';
        } else if (tipo === 'inspeccionRechazada') {
            url = `${BaseUrl}/home/inspecciones-rechazadas`;
            campos = ['codigo_inspeccion', 'fecha_inspeccion', 'inspector', 'propiedad', 'motivo_rechazo'];
            titulo = 'Inspecciones Rechazadas';
        } else {
            return;
        }
        setModalCarta({ abierto: true, tipo, datos: [], filtrados: [], campos, titulo, loading: true });
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
            if (!Array.isArray(res.data) || res.data.length === 0) {
                addNotification('No se encontraron datos para la carta seleccionada', 'info');
            }
            setModalCarta({ abierto: true, tipo, datos: res.data, filtrados: res.data, campos, titulo, loading: false });
        } catch (error) {
            console.error('Error obteniendo datos para la carta', error);
            addNotification('Error al obtener datos de la carta', 'error');
            setModalCarta({ abierto: true, tipo, datos: [], filtrados: [], campos, titulo, loading: false });
        }
    };
    const closeModalCarta = () => setModalCarta({ abierto: false, tipo: '', datos: [], filtrados: [], campos: [], titulo: '', loading: false });

    const titulosCamposVisual = {
        nombre: 'Nombre',
        apellido: 'Apellido',
        cedula: 'Cédula',
        cargo: 'Cargo',
        contacto: 'Contacto',
        codigo: 'Código',
        fecha_solicitada: 'Fecha Solicitada',
        tipo_solicitud_nombre: 'Tipo de Solicitud',
        propiedad_nombre: 'Propiedad',
        usuario_username: 'Usuario',
        fecha_programada: 'Fecha Programada',
        inspector: 'Inspector',
        tipo_inspeccion: 'Tipo de Inspección',
        propiedad: 'Propiedad',
        estado: 'Estatus',
        codigo_inspeccion: 'Código de Inspección',
        fecha_inspeccion: 'Fecha de Inspección',
        motivo_rechazo: 'Motivo de Rechazo'
    };

    // Exportar a Excel desde modal de carta
    const exportToExcelCarta = async () => {
        const token = localStorage.getItem('token');
        let url = '';
        if (modalCarta.titulo === 'Inspectores Activos') url = `${BaseUrl}/home/inspectores-activos/excel`;
        if (modalCarta.titulo === 'Solicitudes Completadas') url = `${BaseUrl}/home/solicitudes-completadas/excel`;
        if (modalCarta.titulo === 'Planificaciones Pendientes') url = `${BaseUrl}/home/planificaciones-pendientes/excel`;
        if (modalCarta.titulo === 'Inspecciones Rechazadas') url = `${BaseUrl}/home/inspecciones-rechazadas/excel`;
        try {
            const res = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });
            FileSaver.saveAs(res.data, `${modalCarta.titulo.replace(/\s/g, '_')}.xlsx`);
        } catch (error) {
            console.error('Error exportando a Excel', error);
            addNotification('Error exportando a Excel', 'warning');
        }
    };

    // Exportar a PDF desde modal de carta
    const exportToPDFCarta = async () => {
        const token = localStorage.getItem('token');
        let url = '';
        if (modalCarta.titulo === 'Inspectores Activos') url = `${BaseUrl}/home/inspectores-activos/pdf`;
        if (modalCarta.titulo === 'Solicitudes Completadas') url = `${BaseUrl}/home/solicitudes-completadas/pdf`;
        if (modalCarta.titulo === 'Planificaciones Pendientes') url = `${BaseUrl}/home/planificaciones-pendientes/pdf`;
        if (modalCarta.titulo === 'Inspecciones Rechazadas') url = `${BaseUrl}/home/inspecciones-rechazadas/pdf`;
        try {
            const res = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });
            FileSaver.saveAs(res.data, `${modalCarta.titulo.replace(/\s/g, '_')}.pdf`);
        } catch (error) {
            console.error('Error exportando a PDF', error);
            addNotification('Error exportando a PDF', 'warning');
        }
    };

    // Paginado
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentData = datosFiltrados.slice(indexOfFirstItem, indexOfLastItem);

    // Buscador de la tabla principal
    const handleSearchTabla = (texto) => {
        setSearchTabla(texto);
        if (!texto) {
            setDatosFiltrados(empleadosHoy);
            setCurrentPage(1);
            return;
        }
        const value = texto.toLowerCase();
        const filtrados = empleadosHoy.filter(item =>
            ['inspector', 'tipo_inspeccion', 'propiedad', 'estado_planificacion'].some(campo =>
                String(item[campo] || '').toLowerCase().includes(value)
            )
        );
        setDatosFiltrados(filtrados);
        setCurrentPage(1);
    };

    // Gráfica
    const handleDateChange = (field, value) => setDateRange((prev) => ({ ...prev, [field]: value }));

    const EncabezadoTabla = () => (
        <thead>
            <tr>
                <th>#</th>
                <th>Inspector</th>
                <th>Tipo Inspección</th>
                <th>Propiedad</th>
                <th>Estado Planificación</th>
                <th>Acción</th>
            </tr>
        </thead>
    );

    const CuerpoTabla = ({ datos }) => (
        <tbody>
            {datos.length === 0 ? (
                <tr>
                    <td colSpan={6}>No hay empleados asignados hoy.</td>
                </tr>
            ) : (
                datos.map((item, index) => (
                    <tr key={index}>
                        <td>{indexOfFirstItem + index + 1}</td>
                        <td>{item.inspector}</td>
                        <td>{item.tipo_inspeccion}</td>
                        <td>{item.propiedad}</td>
                        <td>
                            <span className={`badge-estado badge-${(item.estado_planificacion || '').toLowerCase()}`}>
                                {item.estado_planificacion}
                            </span>
                        </td>
                        <td>
                            <div className='iconContainer'>
                                <img
                                    src={icon.ver}
                                    alt="Ver más"
                                    className='iconver'
                                    title="Ver más"
                                    onClick={() => openDetalleModal(item)}
                                />
                            </div>
                        </td>
                    </tr>
                ))
            )}
        </tbody>
    );

        const ModalDetallePropiedad = () => {
        const propiedad = detalleModal.propiedad;

        
        const sectionTitleStyle = {
            color: '#98c79a',
            fontSize: '1.2rem',
            marginTop: '1.2em',
            marginBottom: '0.5em',
            borderBottom: '2px solid #539E43',
            paddingBottom: '0.2em'
        };

        return (
            <div className='modalOverlay'>
                <div className='modalDetalle'>
                    <button className='closeButton' onClick={closeDetalleModal}>&times;</button>
                    <h2>Detalle de Operación</h2>
                    {detalleModal.loading ? (
                        <Spinner text="Cargando detalle..." />
                    ) : propiedad ? (
                        <div>
                            <h1 style={sectionTitleStyle}>En estado:</h1>
                            <table className='detalleTable'>
                                <tbody>
                                    <tr>
                                        <td>
                                            {propiedad.estado_planificacion ? (
                                            <span className={`badge-estado-modal badge-estado badge-${(propiedad.estado_planificacion || '').toLowerCase()}`}>
                                                {propiedad.estado_planificacion}
                                            </span>
                                            ) : '—'}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            <h1 style={sectionTitleStyle}>Datos de la Planificación</h1>
                            <table className='detalleTable'>
                                <tbody>
                                    <tr><th>Fecha Programada</th><td>{propiedad.fecha_programada || '—'}</td></tr>
                                    <tr><th>Objetivo</th><td>{propiedad.objetivo || '—'}</td></tr>
                                    <tr><th>Actividad</th><td>{propiedad.actividad || '—'}</td></tr>
                                    <tr><th>Hora</th><td>{propiedad.hora || '—'}</td></tr>
                                    <tr><th>Convocatoria</th><td>{propiedad.convocatoria || '—'}</td></tr>
                                    <tr><th>Aseguramiento</th><td>{propiedad.aseguramiento || '—'}</td></tr>
                                    <tr><th>Ubicación Planificación</th><td>{propiedad.ubicacion_planificacion || '—'}</td></tr>
                                    <tr><th>Tipo de Inspección</th><td>{propiedad.tipo_inspeccion || '—'}</td></tr>
                                </tbody>
                            </table>

                            <h1 style={sectionTitleStyle}>Datos de la Propiedad a Inspeccionar</h1>
                            <table className='detalleTable'>
                                <tbody>
                                    <tr><th>Propiedad</th><td>{propiedad.propiedad_nombre || '—'}</td></tr>
                                    <tr><th>RIF</th><td>{propiedad.rif || '—'}</td></tr>
                                    <tr><th>Ubicación</th><td>{propiedad.propiedad_ubicacion || '—'}</td></tr>
                                    <tr><th>Hectáreas</th><td>{propiedad.hectareas || '—'}</td></tr>
                                    <tr><th>Posee Certificado</th><td>{propiedad.posee_certificado || '—'}</td></tr>
                                    <tr><th>Tipo de Propiedad</th><td>{propiedad.tipo_propiedad_nombre || '—'}</td></tr>
                                    <tr><th>Sector</th><td>{propiedad.sector_nombre || '—'}</td></tr>
                                </tbody>
                            </table>

                            <h1 style={sectionTitleStyle}>Cultivos de la Propiedad</h1>
                            <table className='detalleTable'>
                                <tbody>
                                    <tr>
                                        <th>Cultivos</th>
                                        <td>
                                            {Array.isArray(propiedad.cultivos) && propiedad.cultivos.length > 0
                                                ? propiedad.cultivos.join(', ')
                                                : '—'}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            <h1 style={sectionTitleStyle}>Datos del Productor</h1>
                            <table className='detalleTable'>
                                <tbody>
                                    <tr><th>Nombre</th><td>{propiedad.productor_nombre || '—'}</td></tr>
                                    <tr><th>Apellido</th><td>{propiedad.productor_apellido || '—'}</td></tr>
                                    <tr><th>Cédula</th><td>{propiedad.productor_cedula || '—'}</td></tr>
                                </tbody>
                            </table>

                            <h1 style={sectionTitleStyle}>Datos del Inspector Encargado</h1>
                            <table className='detalleTable'>
                                <tbody>
                                    <tr><th>Nombre</th><td>{propiedad.inspector_nombre || '—'}</td></tr>
                                    <tr><th>Apellido</th><td>{propiedad.inspector_apellido || '—'}</td></tr>
                                    <tr><th>Cédula</th><td>{propiedad.inspector_cedula || '—'}</td></tr>
                                    <tr><th>Cargo</th><td>{propiedad.inspector_cargo || '—'}</td></tr>
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p>No se encontró información de la operación.</p>
                    )}
                </div>
            </div>
        );
    };

    // Modal de cartas con SearchBar local
    const ModalCartaDetalle = () => (
        <div className={searchStyles.searchModalOverlay}>
            <div className={searchStyles.modalDetalle}>
                <button className='closeButton' onClick={closeModalCarta}>&times;</button>
                <h2>{modalCarta.titulo}</h2>
                {modalCarta.loading ? (
                    <Spinner text="Cargando..." />
                ) : (
                    <>
                        <div style={{ width: '100%', overflowX: 'auto', marginTop: 18, marginBottom: 10 }}>
                            <table className={searchStyles.searchModalTable}>
                                <thead>
                                    <tr>
                                        {Array.isArray(modalCarta.campos) && modalCarta.campos.map((campo, idx) => (
                                            <th key={idx}>{titulosCamposVisual[campo] || campo.charAt(0).toUpperCase() + campo.slice(1)}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {Array.isArray(modalCarta.filtrados) && modalCarta.filtrados.length === 0 ? (
                                        <tr>
                                            <td colSpan={modalCarta.campos.length}>Sin resultados</td>
                                        </tr>
                                    ) : (
                                        Array.isArray(modalCarta.filtrados) && modalCarta.filtrados.map((item, idx) => (
                                            <tr key={item.id || idx}>
                                                {modalCarta.campos.map((campo, cidx) => (
                                                    <td key={cidx}>{item[campo]}</td>
                                                ))}
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className='modalActions'>
                            <button className='btn-estandar' onClick={exportToExcelCarta}>Exportar a Excel</button>
                            <button className='btn-estandar' onClick={exportToPDFCarta}>Exportar a PDF</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );

    // Pie de la tabla (paginación)
    const PieTabla = () => (
        <div className='tableFooter'>
            <img
                src={icon.flecha3}
                alt="Anterior"
                className='iconBack'
                title="Anterior"
                onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
            />
            <span>{currentPage}</span>
            <img
                src={icon.flecha2}
                alt="Siguiente"
                className='iconNext'
                title="Siguiente"
                onClick={() => indexOfLastItem < datosFiltrados.length && setCurrentPage(currentPage + 1)}
            />
        </div>
    );

    return (
        <div className={styles.homeContainer}>
            {(loadingTabla || loadingTotales) && <Spinner text="Cargando información..." />}
            {/* Cartas dinámicas */}
            <div className={styles.cardsContainer}>
                <div className={styles.card} onClick={() => handleCardClick('empleadosActivos')} title='Mostrar Detalles'>
                    <span className={styles.cardNumber}>{totales.empleadosActivos}</span>
                    <p>Inspectores Activos</p>
                </div>
                <div className={styles.card} onClick={() => handleCardClick('operacionesCompletadas')} title='Mostrar Detalles'>
                    <span className={styles.cardNumber}>{totales.operacionesCompletadas}</span>
                    <p>Solicitudes Completadas</p>
                </div>
                <div className={styles.card} onClick={() => handleCardClick('programasPendientes')} title='Mostrar Detalles'>
                    <span className={styles.cardNumber}>{totales.programasPendientes}</span>
                    <p>Planificaciones Pendientes</p>
                </div>
                <div className={styles.card} onClick={() => handleCardClick('inspeccionRechazada')} title='Mostrar Detalles'>
                    <span className={styles.cardNumber}>{totales.inspeccionRechazada}</span>
                    <p>Inspecciones Rechazadas</p>
                </div>
            </div>

            {/* Tabla */}
            <div className='tableSection'>
                <div className='filtersContainer'>
                    <h2>Operaciones Del Día</h2>
                    <div className='searchContainer'>
                        <SearchBar
                            value={searchTabla}
                            onSearch={handleSearchTabla}
                            placeholder="Buscar en operaciones del día..."
                        />
                        <img src={icon.lupa} alt="Buscar" className='iconlupa' />
                    </div>
                </div>
                <table className='table'>
                    <EncabezadoTabla />
                    {loadingTabla ? (
                        <tbody>
                            <tr>
                                <td colSpan={6}>Cargando...</td>
                            </tr>
                        </tbody>
                    ) : (
                        <CuerpoTabla datos={currentData} />
                    )}
                </table>
                <PieTabla />
            </div>

            {/* Gráficas  */}
            <div className={styles.chartSection}>
                <div className={styles.chartFilter}>
                    <div className='formGroup'>
                    <label htmlFor="chartFilterSelect">Tipo de consulta:</label>
                        <SingleSelect
                            id="chartFilterSingle"
                            options={chartFilterOptions}
                            value={chartFilter}
                            onChange={handleChartFilterChange}
                            placeholder="Filtrar por"
                        />
                    </div>
                    <div className='formGroup'>
                    <label>Desde:</label>
                        <input
                            id="dateFrom"
                            type="date"
                            className='date'
                            value={dateRange.from}
                            onChange={e => handleDateChange('from', e.target.value)}
                            />
                    </div>
                    <div className='formGroup'>
                    <label>Hasta:</label>
                        <input
                            id="dateTo"
                            type="date"
                            className='date'
                            value={dateRange.to}
                            onChange={e => handleDateChange('to', e.target.value)}
                            />
                    </div>
                </div>
                <div className={styles.chartContainer}>
                    {chartLabels.length === 0 || chartData.length === 0 ? (
                        <p style={{ textAlign: 'center', fontSize: '1.1rem', color: '#888' }}>
                            No hay datos para mostrar en la gráfica.
                        </p>
                    ) : (
                        <Chart
                            labels={chartLabels}
                            data={chartData}
                            title={chartTitle}
                            label={chartTitle}
                        />
                    )}
                </div>
            </div>

            {detalleModal.abierto && <ModalDetallePropiedad />}
            {modalCarta.abierto && <ModalCartaDetalle />}
        </div>
    );
}

export default Home;