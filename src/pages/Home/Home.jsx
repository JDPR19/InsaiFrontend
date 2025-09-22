import React, { useState, useEffect } from 'react';
import styles from './home.module.css';
import '../../main.css';
import icon from '../../components/iconos/iconos';
import Chart from '../../components/chart/chart4';
import SearchBar from "../../components/searchbart/SearchBar";
import axios from 'axios';
import { BaseUrl } from '../../utils/constans';
import Spinner from '../../components/spinner/Spinner';
import { exportToPDF, exportToExcel } from '../../utils/exportUtils';
import { useNotification } from '../../utils/NotificationContext';
import searchStyles from '../../components/searchbart/searchmodal.module.css';
import SingleSelect from '../../components/selectmulti/SingleSelect';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const chartFilterOptions = [
    { value: 'planificaciones-por-inspector', label: 'Planificaciones por Inspector' },
    { value: 'planificaciones-por-estado', label: 'Planificaciones por Estado' },
    { value: 'total-programas-activos', label: 'Total Programas Activos' },
    { value: 'total-programas-por-tipo', label: 'Total Programas por Tipo' },
    { value: 'programas-por-tipo', label: 'Programas por Tipo' },
    { value: 'empleados-activos', label: 'Empleados Activos' },
    { value: 'empleados-por-cargo', label: 'Empleados por Cargo' },
    { value: 'empleados-por-estado', label: 'Empleados por Estado' }, 
    { value: 'inspecciones-realizadas', label: 'Inspecciones Realizadas' },
    { value: 'inspecciones-por-tipo', label: 'Inspecciones por Tipo' }, 
    { value: 'inspecciones-por-estado', label: 'Inspecciones por Estado' },  
    { value: 'solicitudes-por-estado', label: 'Solicitudes por Estado' },
    { value: 'solicitudes-por-tipo', label: 'Solicitudes por Tipo' },
    { value: 'propiedades-registradas', label: 'Propiedades Registradas' },
    { value: 'propiedades-por-tipo', label: 'Propiedades por Tipo' },
    { value: 'propiedades-por-sector', label: 'Propiedades por Sector' }, 
    { value: 'propiedades-por-municipio', label: 'Propiedades por Municipio' }, 
    { value: 'propiedades-por-parroquia', label: 'Propiedades por Parroquia' }, 
    { value: 'productores-registrados', label: 'Productores Registrados' },
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

    const totalesPorTipo = {
        empleadosActivos: { count: true, label: 'TOTAL REGISTROS' },
        operacionesCompletadas: { count: true, label: 'TOTAL REGISTROS' },
        programasPendientes: { count: true, label: 'TOTAL REGISTROS' },
        inspeccionRechazada: { count: true, label: 'TOTAL REGISTROS' }
    };

    const columnsPorTipo = {
        empleadosActivos: [
            { header: 'Nombre', key: 'nombre' },
            { header: 'Apellido', key: 'apellido' },
            { header: 'Cédula', key: 'cedula' },
            { header: 'Cargo', key: 'cargo' },
            { header: 'Contacto', key: 'contacto' }
        ],
        operacionesCompletadas: [
            { header: 'Código', key: 'codigo' },
            { header: 'Fecha Solicitada', key: 'fecha_solicitada' },
            { header: 'Tipo de Solicitud', key: 'tipo_solicitud_nombre' },
            { header: 'Propiedad', key: 'propiedad_nombre' },
            { header: 'Usuario', key: 'usuario_username' }
        ],
        programasPendientes: [
            { header: 'Fecha Programada', key: 'fecha_programada' },
            { header: 'Inspector', key: 'inspector' },
            { header: 'Tipo de Inspección', key: 'tipo_inspeccion' },
            { header: 'Propiedad', key: 'propiedad' },
            { header: 'Estatus', key: 'estado' }
        ],
        inspeccionRechazada: [
            { header: 'Código de Inspección', key: 'codigo_inspeccion' },
            { header: 'Fecha de Inspección', key: 'fecha_inspeccion' },
            { header: 'Inspector', key: 'inspector' },
            { header: 'Propiedad', key: 'propiedad' },
            { header: 'Motivo de Rechazo', key: 'motivo_rechazo' }
        ]
    };

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
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [panelFecha, setPanelFecha] = useState({ abierto: false, planes: [], seleccionada: null });
    const [datosOriginales, setDatosOriginales] = useState([]);
    const fechasProgramadas = datosOriginales.map(p => p.fecha_programada);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4;
    const [loadingTabla, setLoadingTabla] = useState(false);
    const [loadingTotales, setLoadingTotales] = useState(false);
    const [detalleModal, setDetalleModal] = useState({ abierto: false, propiedad: null, loading: false });
    const { addNotification } = useNotification();
    const [pdfUrl, setPdfUrl] = useState(null);
    const [pdfFileName, setPdfFileName] = useState('');

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

    // Calendario

    // Función para marcar fechas
    const tileClassName = ({ date, view }) => {
        if (view === 'month') {
            const fechaStr = date.toISOString().slice(0, 10);
            if (fechasProgramadas.includes(fechaStr)) {
                return 'fecha-programada';
            }
        }
        return null;
    };

    // detalles del calendario
    const tileContent = ({ date, view }) => {
        if (view === 'month') {
            const fechaStr = date.toISOString().slice(0, 10);
            const plan = datosOriginales.find(p => p.fecha_programada === fechaStr);
            if (plan) {
                // Ejemplo: icono según estado
                let icono = '📅';
                if (plan.estado === 'aprobada') icono = '✔️';
                if (plan.estado === 'rechazada') icono = '❌';
                if (plan.estado === 'pendiente') icono = '⏳';
                if (plan.estado === 'inspeccionando') icono = '🔍';
                return <span className="calendario-icono">{icono}</span>;
            }
        }
        return null;
    };

    // Panel lateral de detalle
    const columnsPlanificacion = [
        { header: 'Actividad', key: 'actividad' },
        { header: 'Fecha Programada', key: 'fecha_programada' },
        { header: 'Estado', key: 'estado' },
        { header: 'Objetivo', key: 'objetivo' },
        { header: 'Convocatoria', key: 'convocatoria' },
        { header: 'Ubicación', key: 'ubicacion' },
        { header: 'Aseguramiento', key: 'aseguramiento' }
    ];

    // Gráfica
    const [chartFilter, setChartFilter] = useState(chartFilterOptions[0]);
    const [dateRange, setDateRange] = useState({ from: '', to: '' });
    const [chartLabels, setChartLabels] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [chartTitle, setChartTitle] = useState('Gráfica');
    const handleChartFilterChange = (option) => setChartFilter(option);
    const [modalCurrentPage, setModalCurrentPage] = useState(1);
    const modalItemsPerPage = 8;
    const modalIndexOfLastItem = modalCurrentPage * modalItemsPerPage;
    const modalIndexOfFirstItem = modalIndexOfLastItem - modalItemsPerPage;
    const modalCurrentData = Array.isArray(modalCarta.filtrados)
        ? modalCarta.filtrados.slice(modalIndexOfFirstItem, modalIndexOfLastItem)
        : [];

    const handlePreviousThreePagesModal = () => {
        setModalCurrentPage(prev => Math.max(1, prev - 3));
    };
    const handleNextThreePagesModal = () => {
        const totalPages = Math.ceil((modalCarta.filtrados?.length || 0) / modalItemsPerPage);
        setModalCurrentPage(prev => Math.min(totalPages, prev + 3));
    };
        
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

       // Traer planificaciones para el calendario
    useEffect(() => {
        async function fetchPlanificaciones() {
            try {
                const res = await axios.get(`${BaseUrl}/planificacion`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setDatosOriginales(res.data);
            } catch (error) {
                console.error('Error al obtener planificaciones', error);
                addNotification('Error al obtener planificaciones', 'error');
                setDatosOriginales([]);
            }
        }
        fetchPlanificaciones();
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
                case 'planificaciones-por-estado':
                    endpoint = '/graficas/planificaciones-por-estado';
                    title = 'Planificaciones por Estado';
                    break;
                case 'planificaciones-por-inspector':
                    endpoint = '/graficas/planificaciones-por-inspector';
                    title = 'Planificaciones por Inspector';
                    break;
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
                    endpoint = '/graficas/planificaciones-por-estado';
                    title = 'Planificaciones por Estado';
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
                        labels = rows.map(r => r.nombre || 'Sin nombre');
                        data = rows.map(r => Number(r.cantidad) || 0);
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
        console.log('Carta pulsada:', tipo);
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

        const handlePreviewPDF = () => {
            const blob = exportToPDF({
                data: modalCarta.datos,
                columns: columnsPorTipo[modalCarta.tipo],
                fileName: `${modalCarta.titulo.replace(/\s+/g, ' ')}.pdf`,
                title: modalCarta.titulo,
                preview: true
            });
            const url = URL.createObjectURL(blob);
            setPdfUrl(url);
            setPdfFileName(`${modalCarta.titulo.replace(/\s+/g, ' ')}.pdf`);
            setModalCarta({ ...modalCarta, abierto: false });
        };

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
                                {Array.isArray(modalCurrentData) && modalCurrentData.length === 0 ? (
                                    <tr>
                                        <td colSpan={modalCarta.campos.length}>Sin resultados</td>
                                    </tr>
                                ) : (
                                    Array.isArray(modalCurrentData) && modalCurrentData.map((item, idx) => (
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
                    {/* Pie de paginación */}
                    <div className='tableFooter'>
                        <img
                            src={icon.flecha3}
                            alt="Anterior"
                            className='iconBack'
                            title="Anterior"
                            onClick={() => modalCurrentPage > 1 && setModalCurrentPage(modalCurrentPage - 1)}
                        />
                        <img
                            src={icon.flecha5}
                            alt="Retroceder 3"
                            className='iconBack'
                            title="Retroceder 3 páginas"
                            onClick={handlePreviousThreePagesModal}
                        />
                        <span>{modalCurrentPage}</span>
                        <img
                            src={icon.flecha4}
                            alt="Avanzar 3"
                            className='iconNext'
                            title="Avanzar 3 páginas"
                            onClick={handleNextThreePagesModal}
                        />
                        <img
                            src={icon.flecha2}
                            alt="Siguiente"
                            className='iconNext'
                            title="Siguiente"
                            onClick={() => modalIndexOfLastItem < (modalCarta.filtrados?.length || 0) && setModalCurrentPage(modalCurrentPage + 1)}
                        />
                    </div>
                    <div className='modalActions'>
                        <button
                            className='btn-estandar'
                            title='Previsualizar PDF'
                            onClick={handlePreviewPDF}
                        >
                            Exportar a PDF
                        </button>
                        
                        <button
                            className='btn-estandar'
                            title='Descargar Excel'
                            onClick={() => {
                                const totalConfig = totalesPorTipo[modalCarta.tipo] || {};
                                exportToExcel({
                                    data: modalCarta.datos,
                                    columns: columnsPorTipo[modalCarta.tipo],
                                    fileName: `${modalCarta.titulo.replace(/\s+/g, ' ')}.xlsx`,
                                    count: totalConfig.count,
                                    totalLabel: totalConfig.label
                                });
                            }}
                        >
                            Exportar a Excel
                        </button>

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

            {/* Modales de cartas */}
            {detalleModal.abierto && <ModalDetallePropiedad />}
            {modalCarta.abierto && <ModalCartaDetalle />}
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

        <div className={styles.tituloH}>
            <img src={icon.calendario} alt="" className='iconTwo'/>
            <h1 className='title' title='Operaciones Planificadas'>Operaciones Planificadas</h1>
        </div>

        <div className={styles.mainSection}>
            {/* Calendario pequeño a la izquierda */}
            <div className={styles.calendarSection}>
                <div className={styles.calendarContainer}>
                    <div className="titulocalendario">
                        <h2 className="titleCalendario">
                            Calendario de Planificaciones
                        </h2>
                    </div>
                    <Calendar
                        className="react-calendar calendarHome"
                        onChange={date => {
                            setSelectedDate(date);
                            const fechaStr = date.toISOString().slice(0, 10);
                            const planes = datosOriginales.filter(p => p.fecha_programada === fechaStr);
                            setPanelFecha({
                                abierto: planes.length > 0,
                                planes,
                                seleccionada: planes.length > 0 ? planes[0] : null
                            });
                        }}
                        value={selectedDate}
                        tileClassName={tileClassName}
                        tileContent={tileContent}
                    />
                </div>

        {/* Panel lateral de detalle */}
        {panelFecha.abierto && panelFecha.planes && panelFecha.planes.length > 0 && (
            <div className="panelOverlay">
                <div className="panelLateral">
                    <button className="closeButton" onClick={() => setPanelFecha({ abierto: false, planes: [], seleccionada: null })}>&times;</button>
                    <h2>Planificaciones del {selectedDate.toLocaleDateString()}</h2>
                    <div className="panelListaPlanificaciones">
                        {panelFecha.planes.map((plan, idx) => (
                            <div
                                key={plan.id || idx}
                                className={`panelPlanificacionResumen${panelFecha.seleccionada && panelFecha.seleccionada.id === plan.id ? ' seleccionada' : ''}`}
                                onClick={() => setPanelFecha(prev => ({ ...prev, seleccionada: plan }))}
                            >
                                <strong>{plan.actividad}</strong> — <span>{plan.estado}</span>
                                <br />
                                <small>{plan.objetivo}</small>
                            </div>
                        ))}
                    </div>
                    {/* Detalle de la planificación seleccionada */}
                    {panelFecha.seleccionada && (
                        <div className="panelPlanificacion">
                            <ul style={{ fontSize: '1rem', margin: '18px 0' }}>
                                <li><strong>Actividad:</strong> {panelFecha.seleccionada.actividad}</li>
                                <li><strong>Estado:</strong> {panelFecha.seleccionada.estado}</li>
                                <li><strong>Fecha Programada:</strong> {panelFecha.seleccionada.fecha_programada}</li>
                                <li><strong>Objetivo:</strong> {panelFecha.seleccionada.objetivo}</li>
                                <li><strong>Convocatoria:</strong> {panelFecha.seleccionada.convocatoria}</li>
                                <li><strong>Ubicación:</strong> {panelFecha.seleccionada.ubicacion}</li>
                                <li><strong>Aseguramiento:</strong> {panelFecha.seleccionada.aseguramiento}</li>
                            </ul>
                            <div className="panelActions">
                                <button
                                    className="panelBtn editar"
                                    title="Editar"
                                    onClick={() => setPanelFecha({ abierto: false, plan: null })}
                                >
                                    <img src={icon.crear} alt="Editar" style={{ width: 22, marginRight: 6 }} />
                                    Reprogramar
                                </button>
                                <button
                                    className="panelBtn eliminar"
                                    title="Eliminar"
                                    onClick={() => setPanelFecha({ abierto: false, plan: null })}
                                >
                                    <img src={icon.eliminar1} alt="Eliminar" style={{ width: 22, marginRight: 6 }} />
                                    Eliminar
                                </button>
                                <button
                                    className="panelBtn eliminar"
                                    title="Exportar PDF"
                                    onClick={() => {
                                        const blob = exportToPDF({
                                            data: [panelFecha.plan],
                                            columns: columnsPlanificacion,
                                            fileName: `Planificacion_${panelFecha.plan.fecha_programada}.pdf`,
                                            title: 'Detalle de Planificación',
                                            preview: true
                                        });
                                        const url = URL.createObjectURL(blob);
                                        setPdfUrl(url);
                                        setPdfFileName(`Planificacion_${panelFecha.plan.fecha_programada}.pdf`);
                                    }}
                                >
                                    <img src={icon.pdf5} alt="PDF" style={{ width: 22, marginRight: 6 }} />
                                    PDF
                                </button>
                                <button
                                    className="panelBtn editar"
                                    title="Exportar Excel"
                                    onClick={() => exportToExcel({
                                        data: [panelFecha.plan],
                                        columns: columnsPlanificacion,
                                        fileName: `Planificacion_${panelFecha.plan.fecha_programada}.xlsx`,
                                        count: false
                                    })}
                                >
                                    <img src={icon.excel2} alt="Excel" style={{ width: 22, marginRight: 6 }} />
                                    Excel
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* Leyenda del calendario */}
        <div className={styles.leyendaCalendario}>
            <span>
                <span className={`${styles.iconLeyenda} ${styles['iconLeyenda-fecha']}`}>📅</span>
                Fecha programada
            </span>
            <span>
                <span className={`${styles.iconLeyenda} ${styles['iconLeyenda-seleccionado']}`}>●</span>
                Seleccionado
            </span>
            <span>
                <span className={`${styles.iconLeyenda} ${styles['iconLeyenda-pendiente']}`}>⏳</span>
                Pendiente
            </span>
            <span>
                <span className={`${styles.iconLeyenda} ${styles['iconLeyenda-inspeccion']}`}>🔍</span>
                Inspección
            </span>
            <span>
                <span className={`${styles.iconLeyenda} ${styles['iconLeyenda-rechazada']}`}>❌</span>
                Rechazada
            </span>
            <span>
                <span className={`${styles.iconLeyenda} ${styles['iconLeyenda-aprobada']}`}>✔️</span>
                Aprobada
            </span>
        </div>
    </div>

    {/* Tabla pequeña a la derecha */}
    
    <div className={styles.tableSectionSmall}>
        
        <div className={styles.filtersContainer}>
            <div className={styles.filtersRow}>
            <h2>Operaciones Del Día</h2>
                <div className={styles.searchContainer}>
                    <SearchBar
                        value={searchTabla}
                        onSearch={handleSearchTabla}
                        placeholder="Buscar en operaciones del día..."
                    />
                    <img src={icon.lupa} alt="Buscar" className='iconlupa' />
                </div>
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
</div>
            <div className={styles.tituloH}>
                <img src={icon.pie} alt="" className='iconTwo'/>
                <h1 className='title' title='Sección De Estadisticas y Reportes'>Estadisticas Y Reportes</h1>
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
        </div>
    );
}

export default Home;