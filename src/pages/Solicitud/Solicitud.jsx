import React, { useState } from 'react';
import styles from './solicitud.module.css';
import '../../main.css';
import icon from '../../components/iconos/iconos';
import SearchBar from "../../components/searchbart/SearchBar";


function Solicitud() {


      // Datos iniciales
        const datosIniciales = [
        {
            codigorunsai: "051",
            fechasolicitud: "15/04/2025",
            nombreproductor: "Josè Chirinos",
            propiedad: "Hacienda Napoles",
            estadovegetal: "Òptimo",
            tipopermiso: "Permiso de Translado",
            inspectorresponsable: "Josè Martines",       
            estadosolicitud: "Aprobada",
            fecharesolucion:"18/04/2025",
            observaciones:"Cumple con todas las regulaciones",
            motivorechazo:"N/A",
        }
       
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
                    <th>Codigo Runsai</th>
                    <th>Fecha de Solicitud</th>
                    <th>Productor</th>
                    <th>Propiedad</th>
                    <th>Tipo de Permiso</th>
                    <th>Estado de la Solicitud</th>
                    <th>Acción</th>
                </tr>
            </thead>
        );
         // Componente para el cuerpo de la tabla
        const CuerpoTabla = ({ datos }) => (
            <tbody>
                {datos.map((item, index) => (
                <tr key={index}>
                    <td>{item.codigorunsai}</td>
                    <td>{item.fechasolicitud}</td>
                    <td>{item.nombreproductor}</td>
                    <td>{item.propiedad}</td>
                    <td>{item.tipopermiso}</td>
                    <td>{item.estadosolicitud}</td>
                    <td>
                    <div className='iconContainer'>
                        <img 
                        src={icon.ver} 
                        alt="Eliminar" 
                        className='iconver' 
                        title="Ver mas" 
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
        <div className={styles.solicitudContainer}>
        

            {/* Modal /////////////////////////////////////// */}
            {currentModal === 'solicitud' && (
                <div className='modalOverlay'>
                    <div className={styles.modal}>
                        
                        <button className='closeButton'  onClick={closeModal}>
                            &times; {/* Ícono de cerrar */}
                        </button>
                        
                        <h2>Registrar Empleado</h2>
                        
                        <form className='modalForm'>
                            <div className={styles.formColumns}>

                            <div className='formGroup'>
                                <label htmlFor="runsai">Codigo Runsai:</label>
                                <select 
                                        id="runsai"
                                        className='select'
                                    >
                                        <option value="">001</option>
                                        <option value="">002</option>
                                        <option value="">050</option>
                                </select>
                            </div>

                            <div className='formGroup'>
                                <label htmlFor="ficha">Fecha de la Solicitud:</label>
                                <input
                                    type="date"
                                    id="ficha"
                                    placeholder="Rellene el Campo"
                                    className='date'
                                />
                            </div>
                            
                            <div className='formGroup'>
                                <label htmlFor="name">Nombre del productor:</label>
                                <input
                                    type="text"
                                    id="name"
                                    placeholder="Rellene el Campo"
                                    className='input'
                                />
                            </div>

                            <div className='formGroup'>
                                <label htmlFor="apellidoEmpleado">Propiedad:</label>
                                <input
                                    type="text"
                                    id="apellidoEmpleado"
                                    placeholder="Rellene el Campo"
                                    className='input'
                                />
                            </div>

                            <div className='formGroup'>
                                <label htmlFor="TLF">Estado del Cultivo:</label>
                                <input
                                    type="text"
                                    id="TLF"
                                    placeholder="Rellene el Campo"
                                    className='input'
                                />
                            </div>

                            <div className='formGroup'>
                                <label htmlFor="inspector">Inspector Responsable:</label>
                                <select 
                                        id="inspector"
                                        className='select'
                                    >
                                        <option value="">Josè Chirinos</option>
                                        <option value="">Yudisca Alvarez</option>
                                </select>
                            </div>

                            <div className='formGroup'>
                                <label htmlFor="inspector">Estado de la Solicitud:</label>
                                <select 
                                        id="inspector"
                                        className='select'
                                    >
                                        <option value="">Òptima</option>
                                        <option value="">Critica</option>
                                        <option value="">Cuarentena</option>
                                </select>
                            </div>

                            <div className='formGroup'>
                                <label htmlFor="date">Fecha de de Resoluciòn:</label>
                                <input
                                    type="date"
                                    id="date"
                                    placeholder="Rellene el Campo"
                                    className='date'
                                />
                            </div>

                            <div className='formGroup'>
                                <label htmlFor="text"> Observaciones</label>
                                <textarea className="textarea" id="text"></textarea>
                            </div>

                            <div className='formGroup'>
                                <label htmlFor="rechazo"> Motivo de Rechazo</label>
                                <textarea className="textarea" id="rechazo"></textarea>
                            </div>
                            
                            <div className='formGroup'>
                                <label htmlFor="permiso">Tipo de Permiso:</label>
                                <select 
                                        id="permiso"
                                        className='select'
                                    >
                                        <option value="">Permiso de Translado</option>
                                        <option value="">Aval Sanitario</option>
                                </select>
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
                        onClick={() => openModal('solicitud')}
                        className='create'
                        title='Registrar Empleado'
                    >
                        <img src={icon.crear} alt="Crear" className='icon' />
                       Solicitud
                    </button>
                    <button 
                        type='button'
                        className='export'
                        title='Exportar Solicitud'
                    >
                        <img src={icon.pdf} alt="Exportar Solicitud" className='icon' />
                        Exportar
                    </button>
                
                    <h2>Solicitudes</h2>
                    
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

export default Solicitud;