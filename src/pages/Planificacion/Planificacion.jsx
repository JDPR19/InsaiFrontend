import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './planificacion.module.css';
import '../../main.css';
import icon from '../../components/iconos/iconos';
import { filterData } from '../../utils/filterData';
import SearchBar from "../../components/searchbart/SearchBar";
import Notification from '../../components/notification/Notification';
import { useNotification } from '../../utils/useNotification';
import Spinner from '../../components/spinner/Spinner';
import { BaseUrl } from '../../utils/constans';

function Planificacion() {
    const [datosOriginales, setDatosOriginales] = useState([]);
    const [datosFiltrados, setDatosFiltrados] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [detalleModal, setDetalleModal] = useState({ abierto: false, planificacion: null });
    const [loading, setLoading] = useState(false);
    const itemsPerPage = 8;
    const { notifications, addNotification, removeNotification } = useNotification();


    // Fetchers
    const fetchPlanificacion = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${BaseUrl}/planificacion`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setDatosOriginales(response.data);
            setDatosFiltrados(response.data);
        } catch (error) {
            console.error('Error solicitando todas las planificaciones',error);
            addNotification('Error al obtener planificaciones', 'error');
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchPlanificacion();
    }, []);

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

    // Modal detalle
    const openDetalleModal = (planificacion) => setDetalleModal({ abierto: true, planificacion });
    const closeDetalleModal = () => setDetalleModal({ abierto: false, planificacion: null });


    // Buscar y filtrar
    const handleSearch = (searchTerm) => {
        const filtered = filterData(datosOriginales, searchTerm, [
            'id','solicitud_descripcion', 'estado', 'fecha_programada', 'usuario_username', 'cargo_nombre', 'empleado_nombre', 'solicitud_propiedad', 'ubicacion_propiedad', 'hectareas_propiedad', 'propiedad_rif'
        ]);
        setDatosFiltrados(filtered);
        setCurrentPage(1);
    };

    return (
        <div className={styles.planificacionContainer}>
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
                        <h2>Detalles de la Planificación</h2>
                        <table className='detalleTable'>
                            <tbody>
                                <tr>
                                    <th>Estado de la Planificación</th>
                                    <td>{detalleModal.planificacion.estado}</td>
                                </tr>
                                <tr>
                                    <th>Descripción de la Solicitud</th>
                                    <td>{detalleModal.planificacion.solicitud_descripcion}</td>
                                </tr>
                                <tr>
                                    <th>Fecha Programada</th>
                                    <td>{detalleModal.planificacion.fecha_programada}</td>
                                </tr>
                                <tr>
                                    <th>Rif de la Propiedad</th>
                                    <td>{detalleModal.planificacion.propiedad_rif}</td>
                                </tr>
                                <tr>
                                    <th>Nombre de la Propiedad a Inspeccionar</th>
                                    <td>{detalleModal.planificacion.solicitud_propiedad}</td>
                                </tr>
                                <tr>
                                    <th>Ubicación de la propiedad</th>
                                    <td>{detalleModal.planificacion.ubicacion_propiedad}</td>
                                </tr>
                                <tr>
                                    <th>Hectareas que posee esta Propiedad</th>
                                    <td>{detalleModal.planificacion.hectareas_propiedad}</td>
                                </tr>
                                <tr>
                                    <th>Usuario Quien Realizo la Solicitud</th>
                                    <td>{detalleModal.planificacion.usuario_username}</td>
                                </tr>
                                <tr>
                                    <th>Nombre</th>
                                    <td>{detalleModal.planificacion.empleado_nombre}</td>
                                </tr>
                                <tr>
                                    <th>Cargo que Ocupa</th>
                                    <td>{detalleModal.planificacion.cargo_nombre}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Tabla */}
            <div className='tableSection'>
                <div className='filtersContainer'>
                    <h2>Planificación de Proximas Inspecciones</h2>
                    <div className='searchContainer'>
                        <SearchBar onSearch={handleSearch} />
                        <img src={icon.lupa} alt="Buscar" className='iconlupa' />
                    </div>
                </div>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>N°</th>
                            <th>Propiedad a Inspeccionar</th>
                            <th>Fecha Programada</th>
                            <th>Emitida por el Usuario</th>
                            <th>Nombre</th>
                            <th>Cargo que Ocupa</th>
                            <th>Estado de la Planificación</th>
                            <th>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentData.map((item, idx) => (
                            <tr key={item.id}>
                                <td>{indexOfFirstItem + idx + 1}</td>
                                <td>{item.solicitud_propiedad}</td>
                                <td>{item.fecha_programada || item.fecha_planificacion || '-'}</td>
                                <td>{item.usuario_username}</td>
                                <td>{item.empleado_nombre}</td>
                                <td>{item.cargo_nombre}</td>
                                <td>
                                    <span className={`badge-estado badge-${item.estado}`}>
                                        {item.estado}
                                    </span>
                                </td>
                                <td>
                                    <div className={styles.iconContainer}>
                                        <img
                                            onClick={() => openDetalleModal(item)}
                                            src={icon.ver}
                                            className='iconver'
                                            title='Ver más'
                                        />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className='tableFooter'>
                    <img onClick={handlePreviousPage} src={icon.flecha3} className='iconBack' title='Anterior' />
                    <img onClick={handlePreviousThreePages} src={icon.flecha5} className='iconBack' title='Anterior' />
                    <span>{currentPage}</span>
                    <img onClick={handleNextThreePages} src={icon.flecha4} className='iconNext' title='Siguiente' />
                    <img onClick={handleNextPage} src={icon.flecha2} className='iconNext' title='Siguiente' />
                </div>
            </div>
        </div>
    );
}

export default Planificacion;