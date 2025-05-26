import React, { useState } from 'react';
import styles from './propiedad.module.css';
import '../../main.css';
import icon from '../../components/iconos/iconos';
import SearchBar from "../../components/searchbart/SearchBar";


function Propiedad() {


      // Datos iniciales
        const datosIniciales = [
        {
            rif: "R-458971561",
            nombre: "Hacienda Napoles",
            hectareas: "5 hectarias",
            ubicacion: "San Felipe-Yaracuy",
            cultivos: "Aguacate",
            cantidad: "200 Kg",
        },
        {
            rif: "R-227971561",
            nombre: "Hacienda La Paz",
            hectareas: "10 hectarias",
            ubicacion: "Barquisimeto-Lara",
            cultivos: "Cacao",
            cantidad: "500 Kg",
        }
        // Agrega más datos si es necesario
        ];



    const [datosFiltrados, setDatosFiltrados] = useState(datosIniciales);
    const [currentPage, setCurrentPage] = useState(1); // Página actual
    const itemsPerPage = 2; // Número de elementos por página

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


        // Componente para el encabezado de la tabla
        const EncabezadoTabla = () => (
            <thead>
                <tr>
                    <th>Rif</th>
                    <th>Nombre</th>
                    <th>Hectareas</th>
                    <th>Ubicación</th>
                    <th>Cultivos</th>
                    <th>Cantidad</th>
                    <th>Acción</th>
                </tr>
            </thead>
        );
         // Componente para el cuerpo de la tabla
        const CuerpoTabla = ({ datos }) => (
            <tbody>
                {datos.map((item, index) => (
                <tr key={index}>
                    <td>{item.rif}</td>
                    <td>{item.nombre}</td>
                    <td>{item.hectareas}</td>
                    <td>{item.ubicacion}</td>
                    <td>{item.cultivos}</td>
                    <td>{item.cantidad}</td>
                    <td>
                    <div className='iconContainer'>
                        <img 
                        src={icon.ver} 
                        alt="Eliminar" 
                        className='iconver' 
                        title="Ver Ficha" 
                        />
                        <img
                        src={icon.editar}
                        alt="Editar"
                        className='iconeditar'
                        title="Editar"
                        />
                        <img 
                        src={icon.eliminar} 
                        alt="Eliminar" 
                        className='iconeliminar' 
                        title="Eliminar" 
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
        <div className={styles.propiedadContainer}>
        

            {/* Tabla */}
            <div className='tableSection'>
                 {/* Contenedor para filtros y acciones */}
                <div className='filtersContainer'>
                    <button 
                        type='button'
                        className='create'
                        title='Ver Seguimiento'
                    >
                        <img src={icon.user2} alt="Crear" className='icon' />
                        Seguir
                    </button>
                
                    <h2>Propiedades</h2>
                    
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
                <PieTabla />
            </div>
        </div>
    );
}

export default Propiedad;