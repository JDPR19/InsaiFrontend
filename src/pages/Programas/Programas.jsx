import React, { useState } from 'react';
import styles from './programas.module.css';
import '../../main.css';
import icon from '../../components/iconos/iconos';
import SearchBar from "../../components/searchbart/SearchBar";


function Programa() {


      // Datos iniciales
        const datosIniciales = [
        {
            id: "1",
            programa: "Mosca de la Fruta",
            peste: "Mosca Blanca",
            descripcion: "Estrategia combinada para reducir las poblaciones de Mosca Blanca y proteger cultivos de tomate.",
            duracion: "3 meses",
        },
        {
            id: "2",
            programa: "Erradicación de la Roya del Café",
            peste: "Roya del Café",
            descripcion: "Programa enfocado en la prevención y control del hongo que afecta cultivos de café.",
            duracion: "6 meses",
        },
        {
            id: "3",
            programa: "Manejo Integrado del Gusano Cogollero",
            peste: "Gusano Cogollero",
            descripcion: "Plan de acción para minimizar los daños causados por el gusano en cultivos de maíz.",
            duracion: "2 meses",
        }
        // Agrega más datos si es necesario
        ];


    const [currentModal, setCurrentModal] = useState(null); // Estado para controlar cuál modal está abierto
    const [datosFiltrados, setDatosFiltrados] = useState(datosIniciales);
    const [currentPage, setCurrentPage] = useState(1); // Página actual
    const itemsPerPage = 3; // Número de elementos por página

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

    // modal //////////////////////////
    const openModal = (modalName) => {
        setCurrentModal(modalName); // Abre el modal especificado
    };

    const closeModal = () => {
        setCurrentModal(null); // Cierra cualquier modal
    };

    const handleSave = () => {
        console.log('Registro guardado');
        closeModal(); // Cierra el modal después de guardar
    };

        // Componente para el encabezado de la tabla
        const EncabezadoTabla = () => (
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Programa</th>
                    <th>Peste</th>
                    <th>Descripción</th>
                    <th>Duración</th>
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
                    <td>{item.programa}</td>
                    <td>{item.peste}</td>
                    <td>{item.descripcion}</td>
                    <td>{item.duracion}</td>
                    <td>
                    <div className='iconContainer'>
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
        <div className={styles.programaContainer}>
        

            {/* Modal /////////////////////////////////////// */}
            {currentModal === 'programa' && (
                <div className='modalOverlay'>
                    <div className='modal'>
                        
                        <button className='closeButton'  onClick={closeModal}>
                            &times; {/* Ícono de cerrar */}
                        </button>
                        
                        <h2>Registrar Programa</h2>
                        
                        <form className='modalForm'>
                            
                            <div className='formGroup'>
                                <label htmlFor="programa">Nombre del Programa:</label>
                                <input
                                    type="text"
                                    id="programa"
                                    placeholder="Rellene el Campo"
                                    className='input'
                                />
                            </div>

                            <div className='formGroup'>
                                <label htmlFor="peste">Peste Asociada:</label>
                                <select 
                                        id="peste"
                                        className='select'
                                    >
                                        <option value="">Mosca Blanca</option>
                                        <option value="">Roya del Café</option>
                                        <option value="">Gusano Cogollero</option>
                                </select>
                            </div>

                            <div className='formGroup'>
                                <label htmlFor="descrip">Descripción</label>
                                <textarea className='textarea' id="descrip"></textarea>
                            </div>

                            <div className='formGroup'>
                                <label htmlFor="duracion"> Tiempo de Duración:</label>
                                <input
                                    type="text"
                                    id="duracion"
                                    placeholder="Rellene el Campo"
                                    className='input'
                                />
                            </div>

                            <button type="button" className='saveButton' onClick={handleSave}>
                                Guardar
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Tabla */}
            <div className='tableSection'>
                 {/* Contenedor para filtros y acciones */}
                <div className='filtersContainer'>
                    <button 
                        type='button'
                        onClick={() => openModal('programa')}
                        className='create'
                        title='Registrar Programa'
                    >
                        <img src={icon.crear} alt="Crear" className='icon' />
                        Programa
                    </button>
                
                    <h2>Programas</h2>
                    
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

export default Programa;