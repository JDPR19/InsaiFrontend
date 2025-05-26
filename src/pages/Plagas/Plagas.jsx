import React, { useState } from 'react';
import styles from './plaga.module.css';
import '../../main.css';
import icon from '../../components/iconos/iconos';
import SearchBar from "../../components/searchbart/SearchBar";


function Pestes() {


      // Datos iniciales
        const datosIniciales = [
        {
            id: "1",
            nombre: "Mosca Blanca",
            nombrecientifico: "Bemisia tabaci",
            tipo: "Insecto",
            cultivoasociado: "Tomate",
            sintomas: "Amarilleo en hojas, debilitamiento general de la planta.",
            epocafrecuente: "Primavera y verano.",
        },
        {
            id: "2",
            nombre: "Roya del Café",
            nombrecientifico: "Hemileia vastatrix",
            tipo: "Hongo",
            cultivoasociado: "Café",
            sintomas: "Manchas amarillas en el envés de las hojas, caída prematura de las hojas.",
            epocafrecuente: "Estación lluviosa.",
        },
        {
            id: "3",
            nombre: "Gusano Cogollero",
            nombrecientifico: "Spodoptera frugiperda",
            tipo: "Insecto",
            cultivoasociado: "Maíz",
            sintomas: "Perforaciones en hojas y cogollo, presencia de excrementos en la planta.",
            epocafrecuente: "Finales de verano y principios de otoño.",
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
                    <th>Nombre Común</th>
                    <th>Nombre Cientifico</th>
                    <th>Tipo</th>
                    <th>Cultivo Asociado</th>
                    <th>Sintomas</th>
                    <th>Época Frecuente</th>
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
                    <td>{item.nombre}</td>
                    <td>{item.nombrecientifico}</td>
                    <td>{item.tipo}</td>
                    <td>{item.cultivoasociado}</td>
                    <td>{item.sintomas}</td>
                    <td>{item.epocafrecuente}</td>
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
        <div className={styles.plagaContainer}>
        

            {/* Modal /////////////////////////////////////// */}
            {currentModal === 'pestes' && (
                <div className='modalOverlay'>
                    <div className='modal'>
                        
                        <button className='closeButton'  onClick={closeModal}>
                            &times; {/* Ícono de cerrar */}
                        </button>
                        
                        <h2>Registrar Epidemiologia</h2>
                        
                        <form className='modalForm'>
                            
                            <div className='formGroup'>
                                <label htmlFor="comun">Nombre Común:</label>
                                <input
                                    type="text"
                                    id="comun"
                                    placeholder="Rellene el campo"
                                    className='input'
                                />
                            </div>
                            <div className='formGroup'>
                                <label htmlFor="cientifico">Nombre Cientifico:</label>
                                <input
                                    type="text"
                                    id="cientifico"
                                    placeholder="Rellene el Campo"
                                    className='input'
                                />
                                <label htmlFor="tipo">Tipo:</label>
                                <input
                                    type="text"
                                    id="tipo"
                                    placeholder="Rellene el Campo"
                                    className='input'
                                />
                            </div>
                            <div className='formGroup'>
                                <label htmlFor="culti">Cultivo Asociado:</label>
                                <select 
                                        id="culti"
                                        className='select'
                                    >
                                        <option value="">Tomate</option>
                                        <option value="">Cafe</option>
                                        <option value="">Trigo</option>
                                        <option value="">Naranja</option>
                                        <option value="">Papa</option>
                                </select>
                            </div>
                            <div className='formGroup'>
                                <label htmlFor="sintomas">Sintomas:</label>
                                <input
                                    type="text"
                                    id="sintomas"
                                    placeholder="Rellene el Campo"
                                    className='input'
                                />
                            </div>
                            <div className='formGroup'>
                                <label htmlFor="epoca">Época Frecuente:</label>
                                <input
                                    type="text"
                                    id="epoca"
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
                        onClick={() => openModal('pestes')}
                        className='create'
                        title='Registrar Peste'
                    >
                        <img src={icon.crear} alt="Crear" className='icon' />
                        Peste
                    </button>
                
                    <h2>Epidemiologia Fitosanitaria</h2>
                    
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

export default Pestes;