/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BitacoraModal from '../../components/modalbitacora/BitacoraModal';
import '../../main.css';
import icon from '../../components/iconos/iconos';
import { filterData } from '../../utils/filterData';
import SearchBar from "../../components/searchbart/SearchBar";
import { useNotification } from '../../utils/NotificationContext';
import { BaseUrl } from '../../utils/constans'; 
import Spinner from '../../components/spinner/Spinner';

function Bitacora() {
    const [datosOriginales, setDatosOriginales] = useState([]); 
    const [datosFiltrados, setDatosFiltrados] = useState([]); 
    const [currentPage, setCurrentPage] = useState(1); 
    const [registroSeleccionado, setRegistroSeleccionado] = useState(null); 
    const { addNotification } = useNotification();
    const [loading, setLoading] = useState(false);
    const itemsPerPage = 8; 

    // Obtener datos de la bitácora al cargar el componente
    useEffect(() => {
        setLoading(true);
        axios.get(`${BaseUrl}/bitacora`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        })
        .then((response) => {
            console.log('Datos de la bitácora:', response.data);
            setDatosOriginales(response.data);
            setDatosFiltrados(response.data);
        })
        .catch((error) => {
            console.error('Error al obtener los datos de la bitácora:', error);
            addNotification('Error al cargar los datos de la bitácora', 'error');
        })
        .finally(() => {
            setLoading(false);
        });
    }, []);


    // Manejar la búsqueda y filtrar datos
    const handleSearch = (searchTerm) => {
        const filtered = filterData(datosOriginales, searchTerm, ['fecha', 'accion', 'tabla', 'usuario', 'descripcion']);
        setDatosFiltrados(filtered);
    };

    // Lógica de paginación
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

    // Manejar la apertura del modal
    const handleOpenModal = (registro) => {
        console.log('Registro seleccionado:', registro);
        setRegistroSeleccionado(registro);
    };

    // Manejar el cierre del modal
    const handleCloseModal = () => {
        setRegistroSeleccionado(null);
    };

    return (
        <div className='mainContainer'>
            {loading && <Spinner text="Procesando..." />}
            <div className='tableSection'>
                <div className='filtersContainer'>
                    <h2>Bitácora</h2>
                    <div className='searchContainer'>
                        <SearchBar onSearch={handleSearch} />
                        <img src={icon.lupa} alt="Buscar" className='iconlupa' />
                    </div>
                </div>
                <table className='table'>
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Acción</th>
                            <th>Tabla</th>
                            <th>Usuario</th>
                            <th>Descripción</th>
                            <th>Detalle</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentData.map((bitacora, idx) => (
                            <tr key={`${bitacora.id}-${idx}`}> 
                                <td>{bitacora.fecha}</td>
                                <td>{bitacora.accion}</td>
                                <td>{bitacora.tabla}</td>
                                <td>{bitacora.usuario}</td>
                                <td>{bitacora.descripcion}</td>
                                <td>
                                    <div className='iconContainer'>
                                        <img
                                            src={icon.ver}
                                            className='iconver'
                                            title='Ver Detalles'
                                            onClick={() => handleOpenModal(bitacora)}
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

             {/* Modal para mostrar detalles */}
            <BitacoraModal registro={registroSeleccionado} onClose={handleCloseModal} />
        </div>
    );
}

export default Bitacora;