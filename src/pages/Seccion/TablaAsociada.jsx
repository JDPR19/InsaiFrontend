import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../main.css';
import icon from '../../components/iconos/iconos';
import { filterData } from '../../utils/filterData';
import SearchBar from "../../components/searchbart/SearchBar";
import { useNotification } from '../../utils/NotificationContext';
import Spinner from '../../components/spinner/Spinner';
import { BaseUrl } from '../../utils/constans';

function TablaAsociada() {
    const [datosOriginales, setDatosOriginales] = useState([]);
    const [datosFiltrados, setDatosFiltrados] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [detalleModal, setDetalleModal] = useState({ abierto: false, propiedad: null });
    const { addNotification } = useNotification();
    const itemsPerPage = 8;

    // Fetchers
    const fetchPropiedadesAsociadas = async () => {
    setLoading(true);
    try {
        const response = await axios.get(`${BaseUrl}/propiedad/asociadas`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        // Asegura que siempre sea un array
        const data = Array.isArray(response.data) ? response.data : [];
        setDatosOriginales(data);
        setDatosFiltrados(data);
    } catch (error) {
        console.error('error obteniendo todas las propiedades asociadas', error);
        addNotification('Error al obtener propiedades asociadas', 'error');
        setDatosOriginales([]); // <-- importante
        setDatosFiltrados([]);  // <-- importante
    } finally {
        setLoading(false);
    }
};

    useEffect(() => {
        fetchPropiedadesAsociadas();
    }, []);

    const handleSearch = (searchTerm) => {
        const filtered = filterData(datosOriginales, searchTerm, [
            'rif', 'nombre', 'ubicación', 'tipo_propiedad_nombre', 'sector_nombre', 'productor_nombre', 'productor_apellido', 'productor_cedula'
        ]);
        setDatosFiltrados(filtered);
    };

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

    const openDetalleModal = (propiedad) => setDetalleModal({ abierto: true, propiedad });
    const closeDetalleModal = () => setDetalleModal({ abierto: false, propiedad: null });

    return (
        <div className='mainContainer'>
            {loading && <Spinner text="Procesando..." />}
            {/* Modal Detalle */}
            {detalleModal.abierto && (
                <div className='modalOverlay'>
                    <div className='modalDetalle'>
                        <button className='closeButton' onClick={closeDetalleModal}>&times;</button>
                        <h2>Detalles de la Propiedad</h2>
                        <table className='detalleTable'>
                            <tbody>
                                <tr>
                                    <th>RIF</th>
                                    <td>{detalleModal.propiedad.rif}</td>
                                </tr>
                                <tr>
                                    <th>Nombre</th>
                                    <td>{detalleModal.propiedad.nombre}</td>
                                </tr>
                                <tr>
                                    <th>Productor Responsable</th>
                                    <td>
                                        {detalleModal.propiedad.productor_nombre} {detalleModal.propiedad.productor_apellido}
                                        {detalleModal.propiedad.productor_cedula ? ` (C.I: ${detalleModal.propiedad.productor_cedula})` : ''}
                                    </td>
                                </tr>
                                <tr>
                                    <th>Ubicación</th>
                                    <td>{detalleModal.propiedad.ubicación}</td>
                                </tr>
                                <tr>
                                    <th>Sector</th>
                                    <td>{detalleModal.propiedad.sector_nombre}</td>
                                </tr>
                                {/* ...otros campos... */}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <div className='tableSection'>
                <div className='filtersContainer'>
                    <button 
                        type='button'
                        className='export'
                        title='Exportar Datos en PDF'
                    >
                        <img src={icon.pdf} alt="Exportar" className='icon' />
                        PDF
                    </button>

                    <button 
                        type='button'
                        className='create'
                        title='Exportar Datos en Excel'
                    >
                        <img src={icon.pdf} alt="Exportar" className='icon' />
                        Exel
                    </button>

                    <h2>Gestión de Terreno</h2>
                    <div className='searchContainer'>
                        <SearchBar onSearch={handleSearch} />
                        <img src={icon.lupa} alt="Buscar" className='iconlupa' />
                    </div>
                </div>
                <table className='table'>
                    <thead>
                        <tr>
                            <th>N°</th>
                            <th>Codigo Runsai</th>
                            <th>Cédula</th>
                            <th>Productor</th>
                            <th>Rif</th>
                            <th>Propiedad</th>
                            <th>Ubicación</th>
                            <th>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentData.map((item, idx) => (
                            <tr key={item.id}>
                                <td>{indexOfFirstItem + idx + 1}</td>
                                <td>{item.productor_codigo}</td>
                                <td>{item.productor_cedula}</td>
                                <td>
                                    {item.productor_nombre} 
                                </td>

                                <td>{item.propiedad_rif}</td>
                                <td>{item.propiedad_nombre}</td>
                                <td>{item.propiedad_ubicacion}</td>
                                <td>
                                    <div className='iconContainer'>
                                        <img
                                            src={icon.pdf2}
                                            className='iconver'
                                            title='Ver más'
                                        />
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

export default TablaAsociada;