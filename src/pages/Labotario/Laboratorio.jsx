import React, { useState } from 'react';
import styles from './insumos.module.css';
import '../../main.css';
import icon from '../../components/iconos/iconos';
import SearchBar from "../../components/searchbart/SearchBar";


function Insumos() {


      // Datos iniciales
        const datosIniciales = [
        {
            id: "1",
            nombre: "Alcohol Etilico",
            descripcion: "Desinfectante para herramientas",
            cantidad: "50",
            unidadmedida: "Litros",
            adquisicion: "10/03/2025",
            vencimiento: "10/03/2027",
            ubicacion: "Almacenamiento Central",
        },
        {
            id: "2",
            nombre: "Trampas para insecto",
            descripcion: "Monitoreo de plagas agricolas",
            cantidad: "100",
            unidadmedida: "Unidades",
            adquisicion: "20/04/2025",
            vencimiento: "20/04/2026",
            ubicacion: "Area de inspecciòn",
        },
        {
            id: "3",
            nombre: "Guantes de Nitrilo",
            descripcion: "Protecciòn para Manipuladores",
            cantidad: "60",
            unidadmedida: "Pares",
            adquisicion: "15/02/2025",
            vencimiento: "N/A",
            ubicacion: "Almacenamiento Central",
        }
        
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
                    <th>Nombre</th>
                    <th>Descripciòn</th>
                    <th>Cantidad</th>
                    <th>Unidad</th>
                    <th>Fecha de Adquisiciòn</th>
                    <th>Fecha de Vencimiento</th>
                    <th>Ubicaciòn</th>
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
                    <td>{item.descripcion}</td>
                    <td>{item.cantidad}</td>
                    <td>{item.unidadmedida}</td>
                    <td>{item.adquisicion}</td>
                    <td>{item.vencimiento}</td>
                    <td>{item.ubicacion}</td>
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
        <div className={styles.insumoContainer}>
        

            {/* Modal /////////////////////////////////////// */}
            {currentModal === 'insumos' && (
                <div className='modalOverlay'>
                    <div className={styles.modal}>
                        
                        <button className='closeButton'  onClick={closeModal}>
                            &times; {/* Ícono de cerrar */}
                        </button>
                        
                        <h2>Registrar Insumo</h2>
                        
                        <form className='modalForm'>
                            <div className={styles.formColumns}>
                            
                            <div className='formGroup'>
                                <label htmlFor="nombre">Nombre:</label>
                                <input
                                    type="text"
                                    id="nombre"
                                    placeholder="Rellene el Campo"
                                    className='input'
                                />
                            </div>

                            
                            <div className='formGroup'>
                                <label htmlFor="cantidad">Cantidad:</label>
                                <input
                                    type="text"
                                    id="cantidad"
                                    placeholder="Rellene el Campo"
                                    className='input'
                                />
                            </div>

                            <div className='formGroup'>
                                <label htmlFor="unidad">Unidad de Medida:</label>
                                    <input
                                        type="text"
                                        id="unidad"
                                        placeholder="Rellene el Campo"
                                        className='input'
                                    />
                            </div>

                            <div className='formGroup'>
                                <label htmlFor="fecha">Fecha de Adquisiciòn:</label>
                                <input
                                    type="text"
                                    id="fecha"
                                    placeholder="Rellene el Campo"
                                    className='input'
                                />
                            </div>

                            <div className='formGroup'>
                                <label htmlFor="vencimiento">Vencimiento:</label>
                                <input
                                    type="text"
                                    id="vencimiento"
                                    placeholder="Rellene el Campo"
                                    className='input'
                                />
                            </div>
                           
                            <div className='formGroup'>
                                <label htmlFor="lugar">Ubicaciòn del Insumo:</label>
                                <input
                                    type="text"
                                    id="lugar"
                                    placeholder="Rellene el Campo"
                                    className='input'
                                />
                            </div>

                            <div className='formGroup'>
                                <label htmlFor="descripcion">Descripciòn:</label>
                                <textarea className="textarea" id="descripcion"></textarea>
                            </div>

                            <button type="button" className={styles.saveButton} onClick={handleSave}>
                                Guardar
                            </button>
                            
                            </div>
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
                        onClick={() => openModal('insumos')}
                        className='create'
                        title='Registrar Empleado'
                    >
                        <img src={icon.crear} alt="Crear" className='icon' />
                        Insumo
                    </button>
                
                    <h2>Insumos</h2>
                    
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

export default Insumos;