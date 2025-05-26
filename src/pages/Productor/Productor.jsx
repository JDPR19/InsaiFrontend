import React, { useState } from 'react';
import styles from './productor.module.css';
import '../../main.css';
import icon from '../../components/iconos/iconos';
import SearchBar from "../../components/searchbart/SearchBar";


function Productor() {


      // Datos iniciales
        const datosIniciales = [
        {
            codigo: "051",
            cedula: "10246789",
            nombre: "José",
            apellido: "Martines",
            contacto: "04122131256",
        },
        {
            codigo: "082",
            cedula: "16547789",
            nombre: "Yulisca",
            apellido: "Alvares",
            contacto: "04122678256",
        },
        {
            codigo: "045",
            cedula: "16547789",
            nombre: "Campanita",
            apellido: "Pampanante",
            contacto: "04122678256",
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
                    <th>Codigo Runsai</th>
                    <th>Cedula</th>
                    <th>Nombre</th>
                    <th>Apellido</th>
                    <th>Contacto</th>
                    <th>Acción</th>
                </tr>
            </thead>
        );
         // Componente para el cuerpo de la tabla
        const CuerpoTabla = ({ datos }) => (
            <tbody>
                {datos.map((item, index) => (
                <tr key={index}>
                    <td>{item.codigo}</td>
                    <td>{item.cedula}</td>
                    <td>{item.nombre}</td>
                    <td>{item.apellido}</td>
                    <td>{item.contacto}</td>
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
        <div className={styles.productorContainer}>
        

            {/* Modal /////////////////////////////////////// */}
            {currentModal === 'productor' && (
                <div className='modalOverlay'>
                    <div className='modal'>
                        
                        <button className='closeButton'  onClick={closeModal}>
                            &times; {/* Ícono de cerrar */}
                        </button>
                        
                        <h2>Registrar Productor</h2>
                        
                        <form className='modalForm'>
                            
                            <div className='formGroup'>
                                <label htmlFor="Cedula">Codigo Runsai:</label>
                                <input
                                    type="text"
                                    id="codigo"
                                    placeholder="*****"
                                    className='input'
                                />
                            </div>
                            <div className='formGroup'>
                                <label htmlFor="Cedula">Cedula de Identidad:</label>
                                <input
                                    type="text"
                                    id="Cedula"
                                    placeholder="V-********"
                                    className='input'
                                />
                            </div>
                            <div className='formGroup'>
                                <label htmlFor="name">Nombre:</label>
                                <input
                                    type="text"
                                    id="name"
                                    placeholder="Rellene el Campo"
                                    className='input'
                                />
                                <label htmlFor="apellido">Apellido:</label>
                                <input
                                    type="text"
                                    id="apellido"
                                    placeholder="Rellene el Campo"
                                    className='input'
                                />
                            </div>
                            <div className='formGroup'>
                                <label htmlFor="TLF">Contacto:</label>
                                <input
                                    type="text"
                                    id="TLF"
                                    placeholder="04**-*******"
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

            {currentModal === 'propiedad' && (
                <div className='modalOverlay'>
                    <div className='modal'>
                        <button className='closeButton' onClick={closeModal}>
                            &times;
                        </button>
                        <h2>Registrar Propiedad</h2>
                        <form className='modalForm'>
                            {/* Aquí va el formulario de la propiedad */}
                            <div className='formGroup'>
                                <label htmlFor="rif">Rif de la Propiedad:</label>
                                <input
                                    type="text"
                                    id="rif"
                                    placeholder="Ingrese su correo @gmail.com"
                                    className='input'
                                />
                            </div>
                            <div className='formGroup'>
                                <label htmlFor="nombre">Nombre de la Propiedad:</label>
                                <input
                                    type="text"
                                    id="nombre"
                                    placeholder="Rellene el Campo"
                                    className='input'
                                />
                            </div>
                            <div>
                                <label htmlFor="hectareas">Hectarias:</label>
                                <input
                                    type="text"
                                    id="hectarias"
                                    placeholder="Rellene el Campo"
                                    className='input'
                                />
                            </div>
                            <div className='formGroup'>
                                <label htmlFor="ubicacion">Ubicación</label>
                                <select 
                                        id="ubicacion"
                                        className='select'
                                    >
                                        <option value="ubione">barquisimeto edo-Lara </option>
                                        <option value="ubitwo">San Felipe edo-Yaracuy </option>
                                </select>
                            </div>
                            <div className='formGroup'>
                                <label htmlFor="cultivo">Cultivos</label>
                                <select 
                                        id="cultivo"
                                        className='select'
                                    >
                                        <option value="cultione">Platano</option>
                                        <option value="cultiwo">Aguacate</option>
                                </select>
                            </div>
                            <div className='formGroup'>
                                <label htmlFor="cantidad">Cantidad (KG)</label>
                                <input
                                    type="text"
                                    id="cantidad"
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
                        onClick={() => openModal('productor')}
                        className='create'
                        title='Registrar Productor'
                    >
                        <img src={icon.crear} alt="Crear" className='icon' />
                        Productor
                    </button>
                    <button 
                        type='button'
                        onClick={() => openModal('propiedad')}
                        className='createuser'
                        title='Registrar Propiedad'
                    >
                        <img src={icon.user2} alt="Crear Usuario" className='icon' />
                        Propiedad
                    </button>
                
                    <h2>Productores</h2>
                    
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

export default Productor;