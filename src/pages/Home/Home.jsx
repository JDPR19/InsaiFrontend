import React, { useState, useEffect } from 'react';
import styles from './home.module.css';
import '../../main.css';
import icon from '../../components/iconos/iconos';
import Chart from '../../components/chart/chart4';
import SearchBar from "../../components/searchbart/SearchBar";
import Notification from '../../components/notification/Notification';
import { useNotification } from '../../utils/useNotification';

function Home() {
    
    
        // Datos iniciales
        const datosIniciales = [
            {
                id: "1",
                fecha: "3/3/2024",
                inspector: "José Chirinos ",
                inspección: "Rutina",
                hacienda: "Hacienda Napoles",
                estado: "En Progreso",
            },
            {
                id: "2",
                fecha: "2/20/2025",
                inspector: "Yulisca Alvares ",
                inspección: "Seguimiento",
                hacienda: "Hacienda Palmas",
                estado: "Completado",
            },
            {
                id: "3",
                fecha: "1/3/2025",
                inspector: "Ramiro Hernandez",
                inspección: "seguimiento",
                hacienda: "Hacienda Bourareña",
                estado: "En Progreso",
            },
            {
                id: "4",
                fecha: "3/3/2025",
                inspector: "Edgar Ramirez ",
                inspección: "Rutina",
                hacienda: "Refineria La Esmeralda",
                estado: "En Lista",
            },
            // Agrega más datos si es necesario
            ];  

    const { notifications, addNotification, removeNotification } = useNotification();
    const [notificationShown, setNotificationShown] = useState(false); // Estado para controlar la notificación
    const [chartType, setChartType] = useState('Bar'); // Estado para el tipo de gráfica
    const [chartFilter, setChartFilter] = useState('avales'); // Estado para el filtro
    const [dateRange, setDateRange] = useState({ from: '', to: '' }); // Estado para el rango de fechas
    const [datosFiltrados, setDatosFiltrados] = useState(datosIniciales);
    const [currentPage, setCurrentPage] = useState(1); // Página actual
    const itemsPerPage = 2; // Número de elementos por página
    
    useEffect(() => {
        if (!notificationShown) {
            addNotification('Bienvenido al sistema SIGENSAI', 'success');
            setNotificationShown(true); // Marcar la notificación como mostrada
        }
    }, [notificationShown, addNotification]);


        // Calcular los datos para la página actual
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        const currentData = datosFiltrados.slice(indexOfFirstItem, indexOfLastItem);
    
    
       // Cambiar a la página anterior
    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    // Cambiar a la página siguiente
    const handleNextPage = () => {
        if (indexOfLastItem < datosFiltrados.length) {
            setCurrentPage(currentPage + 1);
        }
    };
    
        const handleChartTypeChange = (event) => {
        setChartType(event.target.value); // Actualiza el tipo de gráfica seleccionada
    };

    const handleChartFilterChange = (event) => {
        setChartFilter(event.target.value); // Actualiza el filtro seleccionado
    };

    const handleDateChange = (field, value) => {
        setDateRange((prev) => ({ ...prev, [field]: value })); // Actualiza el rango de fechas
    };

     // Componente para el encabezado de la tabla
    const EncabezadoTabla = () => (
        <thead>
        <tr>
            <th>ID</th>
            <th>Fecha</th>
            <th>Inspector</th>
            <th>Inspección</th>
            <th>Hacienda</th>
            <th>Estado</th>
            <th>Acción</th>
        </tr>
    </thead>
    );
     // Componente para el cuerpo de la tabla
    const CuerpoTabla = ({ datos }) => (
        <tbody>
            {datos.map((item, index) => (
            <tr key={index}>
                <td>{item.id}</td>
                <td>{item.fecha}</td>
                <td>{item.inspector}</td>
                <td>{item.inspección}</td>
                <td>{item.hacienda}</td>
                <td>{item.estado}</td>
                <td>
                <div className='iconContainer'>
                    <img
                    src={icon.ver}
                    alt="Ver mas"
                    className='iconver'
                    title="Ver mas"
                    />
                </div>
                </td>
            </tr>
            ))}
        </tbody>
    );
    
        // Componente para el pie de la tabla (paginación)
        const PieTabla = () => (
        <div className='tableFooter'>
            <img
            src={icon.flecha3}
            alt="Anterior"
            className='iconBack'
            title="Anterior"
            onClick={handlePreviousPage}
            />
            <span>{currentPage}</span>
            <img
            src={icon.flecha2}
            alt="Siguiente"
            className='iconNext'
            title="Siguiente"
            onClick={handleNextPage}
            />
        </div>
        );


    return (
        <div className={styles.homeContainer}>

            {/* Renderizar las notificaciones */}
            {notifications.map((notification) => (
                <Notification
                    key={notification.id}
                    message={notification.message}
                    type={notification.type}
                    onClose={() => removeNotification(notification.id)}
                />
            ))}
            {/* Cartas */}
            <div className={styles.cardsContainer}>
                <div className={styles.card}>
                    <span className={styles.cardNumber}>50</span>
                    <p>Inspectores Activos</p>
                </div>
                <div className={styles.card}>
                    <span className={styles.cardNumber}>75</span>
                    <p>Operaciones Completados</p>
                </div>
                <div className={styles.card}>
                    <span className={styles.cardNumber}>20</span>
                    <p>Programas Pendientes</p>
                </div>
                <div className={styles.card}>
                    <span className={styles.cardNumber}>5</span>
                    <p>Permisos por Vencer</p>
                </div>
            </div>

            {/* Gráficas */}
            <div className={styles.chartSection}>
                <div className={styles.chartFilter}>
                    {/* Tipo de gráfica */}
                    <label htmlFor="chartType">Tipo de Gráfica:</label>
                    <select
                        id="chartType"
                        value={chartType}
                        onChange={handleChartTypeChange}
                        className={styles.chartSelect}
                    >
                        <option value="Bar">Barras</option>
                        <option value="line">Líneas</option>
                        <option value="pie">Pastel</option>
                    </select>
                    
                    {/* Filtrado por */}
                    <label htmlFor="chartFilter">Filtrado por:</label>
                    <select
                        id="chartFilter"
                        value={chartFilter}
                        onChange={handleChartFilterChange}
                        className={styles.chartSelect}
                    >
                        <option  value="avales">Avales por vencer</option>
                        <option  value="clientes">Clientes Registrados</option>
                        <option  value="cuarentenas">Cuarentenas</option>
                    </select>

                    {/* Fecha desde */}
                    <label htmlFor="dateFrom">Desde:</label>
                    <input 
                        id="dateFrom" 
                        type="date" 
                        className={styles.dateInput} 
                        value={dateRange.from}
                        onChange={(e) => handleDateChange('from', e.target.value)}
                    />

                    {/* Fecha hasta */}
                    <label htmlFor="dateTo">Hasta:</label>
                    <input 
                        id="dateTo" 
                        type="date" 
                        className={styles.dateInput} 
                        value={dateRange.to}
                        onChange={(e) => handleDateChange('to', e.target.value)}
                    />
                </div>
                <div className={styles.chartContainer}>
                    {/* Renderizar el componente Chart basado en el tipo y filtro */}
                    <Chart type={chartType} filter={chartFilter} />
                </div>
            </div>

            {/* Tabla */}
            <div className='tableSection'>
                {/* Contenedor para filtros y acciones */}
                <div className='filtersContainer'>
                    <h2>Operaciones Recientes</h2>
                    <div className='searchContainer'>
                        <SearchBar data={datosIniciales} onSearch={setDatosFiltrados} />
                        <img src={icon.lupa} alt="Buscar" className='iconlupa' />
                    </div>
                </div>

                <table className='table'>
                    <EncabezadoTabla />
                    <CuerpoTabla datos={currentData} />
                </table>
                {/* Contenedor para Footer en tabla */}
                <PieTabla/>
            </div>
        </div>
    );
}

export default Home;