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

function Home() {
    // Cartas dinámicas
    const [totales, setTotales] = useState({
        empleadosActivos: 0,
        operacionesCompletadas: 0,
        programasPendientes: 0,
        inspeccionRechazada: 0
    });

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
    const [chartType, setChartType] = useState('Bar');
    const [chartFilter, setChartFilter] = useState('avales');
    const [dateRange, setDateRange] = useState({ from: '', to: '' });

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
            // Verifica los datos recibidos y los campos
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
    const handleChartTypeChange = (event) => setChartType(event.target.value);
    const handleChartFilterChange = (event) => setChartFilter(event.target.value);
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

    
    const ModalDetallePropiedad = () => (
        <div className='modalOverlay'>
            <div className='modalDetalle'>
                <button className='closeButton' onClick={closeDetalleModal}>&times;</button>
                <h2>Detalle de Operación</h2>
                {detalleModal.loading ? (
                    <Spinner text="Cargando detalle..." />
                ) : detalleModal.propiedad ? (
                    <table className='detalleTable'>
                        <tbody>
                            <tr>
                                <th colSpan={2} style={{background:'#eaf7ea'}}>Datos de la Propiedad</th>
                            </tr>
                            <tr>
                                <th>Nombre</th>
                                <td>{detalleModal.propiedad.propiedad_nombre}</td>
                            </tr>
                            <tr>
                                <th>RIF</th>
                                <td>{detalleModal.propiedad.rif}</td>
                            </tr>
                            <tr>
                                <th>Ubicación</th>
                                <td>{detalleModal.propiedad.propiedad_ubicacion}</td>
                            </tr>
                            <tr>
                                <th>Sector</th>
                                <td>{detalleModal.propiedad.sector_nombre}</td>
                            </tr>
                            <tr>
                                <th>Hectáreas</th>
                                <td>{detalleModal.propiedad.hectareas}</td>
                            </tr>
                            <tr>
                                <th>Tipo de Propiedad</th>
                                <td>{detalleModal.propiedad.tipo_propiedad_nombre}</td>
                            </tr>
                            <tr>
                                <th>Certificado</th>
                                <td>{detalleModal.propiedad.posee_certificado}</td>
                            </tr>
                            <tr>
                                <th>Productor</th>
                                <td>{detalleModal.propiedad.productor_nombre} {detalleModal.propiedad.productor_apellido} ({detalleModal.propiedad.productor_cedula})</td>
                            </tr>
                            <tr>
                                <th colSpan={2} style={{background:'#eaf7ea'}}>Datos de la Planificación</th>
                            </tr>
                            <tr>
                                <th>Fecha Programada</th>
                                <td>{detalleModal.propiedad.fecha_programada}</td>
                            </tr>
                            <tr>
                                <th>Estado</th>
                                <td>
                                    <span className={`badge-estado badge-${(detalleModal.propiedad.estado_planificacion || '').toLowerCase()}`}>
                                        {detalleModal.propiedad.estado_planificacion}
                                    </span>
                                </td>
                            </tr>
                            <tr>
                                <th>Tipo de Inspección</th>
                                <td>{detalleModal.propiedad.tipo_inspeccion}</td>
                            </tr>
                            <tr>
                                <th>Objetivo</th>
                                <td>{detalleModal.propiedad.objetivo}</td>
                            </tr>
                            <tr>
                                <th>Actividad</th>
                                <td>{detalleModal.propiedad.actividad}</td>
                            </tr>
                            <tr>
                                <th>Hora</th>
                                <td>{detalleModal.propiedad.hora}</td>
                            </tr>
                            <tr>
                                <th>Convocatoria</th>
                                <td>{detalleModal.propiedad.convocatoria}</td>
                            </tr>
                            <tr>
                                <th>Aseguramiento</th>
                                <td>{detalleModal.propiedad.aseguramiento}</td>
                            </tr>
                            <tr>
                                <th>Ubicación (Planificación)</th>
                                <td>{detalleModal.propiedad.ubicacion_planificacion}</td>
                            </tr>
                            <tr>
                                <th colSpan={2} style={{background:'#eaf7ea'}}>Inspector Asignado</th>
                            </tr>
                            <tr>
                                <th>Nombre</th>
                                <td>{detalleModal.propiedad.inspector_nombre} {detalleModal.propiedad.inspector_apellido}</td>
                            </tr>
                            <tr>
                                <th>Cédula</th>
                                <td>{detalleModal.propiedad.inspector_cedula}</td>
                            </tr>
                            <tr>
                                <th>Cargo</th>
                                <td>{detalleModal.propiedad.inspector_cargo}</td>
                            </tr>
                        </tbody>
                    </table>
                ) : (
                    <p>No se encontró información de la operación.</p>
                )}
            </div>
        </div>
    );

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
                        <table className={searchStyles.searchModalTable}>
                            <thead>
                                <tr>
                                    {Array.isArray(modalCarta.campos) && modalCarta.campos.map((campo, idx) => (
                                        <th key={idx}>{campo.charAt(0).toUpperCase() + campo.slice(1)}</th>
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
                    <label htmlFor="chartType">Tipo de Gráfica:</label>
                    <select
                        id="chartType"
                        value={chartType}
                        onChange={handleChartTypeChange}
                        className={styles.chartSelect}
                    >
                        <option value="bar">Barras</option>
                        <option value="line">Líneas</option>
                        <option value="pie">Pastel</option>
                    </select>
                    <label htmlFor="chartFilter">Filtrado por:</label>
                    <select
                        id="chartFilter"
                        value={chartFilter}
                        onChange={handleChartFilterChange}
                        className={styles.chartSelect}
                    >
                        <option value="avales">Avales por vencer</option>
                        <option value="clientes">Clientes Registrados</option>
                        <option value="cuarentenas">Cuarentenas</option>
                    </select>
                    <label htmlFor="dateFrom">Desde:</label>
                    <input
                        id="dateFrom"
                        type="date"
                        className='date'
                        value={dateRange.from}
                        onChange={(e) => handleDateChange('from', e.target.value)}
                    />
                    <label htmlFor="dateTo">Hasta:</label>
                    <input
                        id="dateTo"
                        type="date"
                        className='date'
                        value={dateRange.to}
                        onChange={(e) => handleDateChange('to', e.target.value)}
                    />
                </div>
                <div className={styles.chartContainer}>
                    <Chart type={chartType} filter={chartFilter} />
                </div>
            </div>

            {detalleModal.abierto && <ModalDetallePropiedad />}
            {modalCarta.abierto && <ModalCartaDetalle />}
        </div>
    );
}

export default Home;