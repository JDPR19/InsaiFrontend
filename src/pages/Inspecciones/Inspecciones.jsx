import React, { useState } from 'react';
import styles from './inspecciones.module.css';
import '../../main.css';
import icon from '../../components/iconos/iconos';
import SearchBar from "../../components/searchbart/SearchBar";


function Campo() {


      // Datos iniciales
        const datosIniciales = [
        {
            id: "1",
            tipo: "Seguimiento",
            fechainspeccion: "30/10/2025",
            propiedad: "Hacienda Napoles",
            ubicacion: "Urb. San josé-Independencia- Edo Yaracuy ",
            inspector: "José Chirinos",
            programa: "Mosca de la Fruta",
            situacion: "Controlado"
        },
        {
            id: "2",
            tipo: "Rutina",
            fechainspeccion: "31/10/2025",
            propiedad: "Finca La Esperanza",
            ubicacion: "Urb. La Paz - Edo Yaracuy",
            inspector: "María Pérez",
            programa: "Control de Plagas",
            situacion: "Cuarentena"
        }
        // Agrega más datos si es necesario
        ];


    const [currentModal, setCurrentModal] = useState(null); // Estado para controlar cuál modal está abierto
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
                    <th>Tipo</th>
                    <th>Fecha Inspección</th>
                    <th>Propiedad</th>
                    <th>Ubicación</th>
                    <th>Inspector</th>
                    <th>Programa</th>
                    <th>Situación Actual</th>
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
                    <td>{item.tipo}</td>
                    <td>{item.fechainspeccion}</td>
                    <td>{item.propiedad}</td>
                    <td>{item.ubicacion}</td>
                    <td>{item.inspector}</td>
                    <td>{item.programa}</td>
                    <td>{item.situacion}</td>
                    <td>
                    <div className='iconContainer'>
                        <img 
                        src={icon.ver} 
                        alt="Eliminar" 
                        className='iconver' 
                        title="Ver Ficha Sanitaria" 
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
        <div className={styles.inspeccionesContainer}>
        

            {/* Modal /////////////////////////////////////// */}
            {currentModal === 'Campo' && (
                <div className='modalOverlay'>
                    <div className={styles.modal}>
                        
                        <button className='closeButton'  onClick={closeModal}>
                            &times; {/* Ícono de cerrar */}
                        </button>
                        
                        <h2>Operaciones de Campo</h2>
                        
                        <form className='modalForm'>
                            <div className={styles.formColumns}>
                            
                            <div className='formGroup'>
                                <label htmlFor="tipo">Tipo:</label>
                                <input
                                    type="text"
                                    id="tipo"
                                    placeholder="Rellene el Campo"
                                    className='input'
                                />
                            </div>
                            <div className='formGroup'>
                                <label htmlFor="notif">Fecha de Notificación:</label>
                                <input
                                    type="date"
                                    id="notif"
                                    placeholder="Rellene el Campo"
                                    className='date'
                                />
                            </div>
                            <div className='formGroup'>
                            <label htmlFor="inspeccion">Fecha de Inspección:</label>
                                <input
                                    type="date"
                                    id="inspeccion"
                                    placeholder="Rellene el Campo"
                                    className='date'
                                />
                            </div>
                            <div className='formGroup'>
                                <label htmlFor="semana">Semana Epidemiologica:</label>
                                <input
                                    type="text"
                                    id="semana"
                                    placeholder="Rellene el Campo"
                                    className='input'
                                />
                            </div>
                            <div className='formGroup'>
                                <label htmlFor="situacion">Situación Actual:</label>
                                <input
                                    type="text"
                                    id="situacion"
                                    placeholder="Rellene el Campo"
                                    className='input'
                                />
                            </div>
                            <div className='formGroup'>
                                <label htmlFor="propiedad">Propiedad:</label>
                                <select 
                                        id="propiedad"
                                        className='select'
                                    >
                                        <option value="">Hacienda Napoles</option>
                                        <option value="">Finca La Paz</option>
                                        <option value="">Finca Mis Tres Amores</option>
                                </select>
                            </div>
                            <div className='formGroup'>
                                <label htmlFor="regi">Registro de notificación:</label>
                                <input
                                    type="text"
                                    id="regi"
                                    placeholder="Rellene el Campo"
                                    className='input'
                                />
                            </div>
                            <div className='formGroup'>
                                <label htmlFor="ubi">Ubcación:</label>
                                <select 
                                        id="ubi"
                                        className='select'
                                    >
                                        <option value="">Boraure</option>
                                        <option value="">Chivacoa</option>
                                        <option value="">Guama</option>
                                </select>
                            </div>
                            <div className='formGroup'>
                                <label htmlFor="pestes">Epidemiologia Fitosanitaria:</label>
                                <select 
                                        id="pestes"
                                        className='select'
                                    >
                                        <option value="">Mosca Blanca</option>
                                        <option value="">Roya del Café</option>
                                        <option value="">Gusano Cogollero</option>
                                </select>
                            </div>
                            <div className='formGroup'>
                                <label htmlFor="culti">Cultivo:</label>
                                <select 
                                        id="culti"
                                        className='select'
                                    >
                                        <option value="">Papa</option>
                                        <option value="">Tomate</option>
                                        <option value="">Café</option>
                                </select>
                            </div>
                            <div className='formGroup'>
                                <label htmlFor="canti">Cantidad Total:</label>
                                <input
                                    type="number"
                                    id="canti"
                                    placeholder="Rellene el Campo"
                                    className='input'
                                />
                            </div>
                            <div className='formGroup'>
                                <label htmlFor="inspector">Inspector:</label>
                                <select 
                                        id="inpector"
                                        className='select'
                                    >
                                        <option value="">José Chirinos</option>
                                        <option value="">Josefa Chavez</option>
                                        <option value="">José Martines</option>
                                </select>
                            </div>
                            <div className='formGroup'>
                                <label htmlFor="insumos">Insumos:</label>
                                <select 
                                        id="insumos"
                                        className='select'
                                    >
                                        <option value="">Alcohol</option>
                                        <option value="">Guantes</option>
                                        <option value="">Mascarillas</option>
                                        <option value="">insectisida</option>
                                        <option value="">Abono</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="text">Observaciones</label>
                                <textarea className="textarea" id="text"></textarea>
                            </div>
                            <div className='formGroup'>
                                <label htmlFor="prox">Proxima Inspección:</label>
                                <input
                                    type="date"
                                    id="prox"
                                    placeholder="Rellene el Campo"
                                    className='date'
                                />
                            </div>
                                <button type="button" className='saveButton' onClick={handleSave}>
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
                        onClick={() => openModal('Campo')}
                        className='create'
                        title='Registrar Empleado'
                    >
                        <img src={icon.crear} alt="Crear" className='icon' />
                        Operación
                    </button>

                    <button 
                        type='button'
                        className='export'
                        title='Exportar Operaciones'
                    >
                        <img src={icon.pdf} alt="Export" className='icon' />
                        Exportar
                    </button>
                
                    <h2>Operaciones de Campo</h2>
                    
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

export default Campo;