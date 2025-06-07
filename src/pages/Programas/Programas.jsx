import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './programas.module.css';
import '../../main.css';
import icon from '../../components/iconos/iconos';
import { filterData } from '../../utils/filterData';
import SearchBar from "../../components/searchbart/SearchBar";
import Notification from '../../components/notification/Notification';
import { useNotification } from '../../utils/useNotification';
import { validateField, validationRules } from '../../utils/validation';

function Programas() {
    const [datosOriginales, setDatosOriginales] = useState([]);
    const [datosFiltrados, setDatosFiltrados] = useState([]);
    const [plagas, setPlagas] = useState([]);
    const [tipos, setTipos] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [currentModal, setCurrentModal] = useState(null);
    const [detalleModal, setDetalleModal] = useState({ abierto: false, programa: null });
    const [formData, setFormData] = useState({
        id: '',
        nombre: '',
        tiempo_duracion: '',
        descripcion: '',
        plaga_fito_id: '',
        tipo_programa_fito_id: ''
    });
    const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);
    const [selectedProgramaId, setSelectedProgramaId] = useState(null);

    const { notifications, addNotification, removeNotification } = useNotification();
    const itemsPerPage = 8;
    const [errors, setErrors] = useState({});

    
    const fetchProgramas = async () => {
        try {
            const response = await axios.get('http://localhost:4000/programa', {
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
            });
            setDatosOriginales(response.data);
            setDatosFiltrados(response.data);
        } catch (error) {
            console.error('error obteniendo todos los programa',error);
            addNotification('Error al obtener programas', 'error');
        }
    };

    const fetchPlagas = async () => {
        try {
            const response = await axios.get('http://localhost:4000/programa/plagas/all', {
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
            });
            setPlagas(response.data);
        } catch (error) {
            console.error('error obteniendo todas las plagas',error);
            addNotification('Error al obtener plagas', 'error');
        }
    };

    const fetchTipos = async () => {
        try {
            const response = await axios.get('http://localhost:4000/programa/tipos/all', {
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
            });
            setTipos(response.data);
        } catch (error) {
            console.error('error obteniendo todos los tipos de programa',error);
            addNotification('Error al obtener tipos de programa', 'error');
        }
    };

    useEffect(() => {
        fetchProgramas();
        fetchPlagas();
        fetchTipos();
    }, []);

    
    const resetFormData = () => {
        setFormData({
            id: '',
            nombre: '',
            tiempo_duracion: '',
            descripcion: '',
            plaga_fito_id: '',
            tipo_programa_fito_id: ''
        });
    };

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));

        if (validationRules[id]) {
            const { regex, errorMessage } = validationRules[id];
            const { valid, message } = validateField(value, regex, errorMessage);
            setErrors(prev => ({ ...prev, [id]: valid ? '' : message }));
        }
    };

    const handleSearch = (searchTerm) => {
        const filtered = filterData(datosOriginales, searchTerm, [
            'id','nombre','tiempo_duracion','descripcion','plaga_fito_nombre','tipo_programa_fito_nombre'
        ]);
        setDatosFiltrados(filtered);
    };

    const handleSave = async () => {
        for (const field of ['nombre', 'plaga_fito_id', 'tipo_programa_fito_id']) {
            if (!validationRules[field]) continue;
            const { regex, errorMessage } = validationRules[field];
            if (regex) {
                const { valid, message } = validateField(formData[field], regex, errorMessage);
                if (!valid) {
                    addNotification(message, 'warning');
                    return;
                }
            }
        }

        try {
            await axios.post('http://localhost:4000/programa', {
                nombre: formData.nombre,
                tiempo_duracion: formData.tiempo_duracion,
                descripcion: formData.descripcion,
                plaga_fito_id: formData.plaga_fito_id,
                tipo_programa_fito_id: formData.tipo_programa_fito_id
            }, {
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
            });
            addNotification('Programa registrado con éxito', 'success');
            fetchProgramas();
            closeModal();
        } catch (error) {
            console.error('error registrando el programa',error);
            addNotification('Error al registrar programa', 'error');
        }
    };

    const handleEdit = async () => {
        for (const field of ['nombre']) {
            if (!validationRules[field]) continue;
            const { regex, errorMessage } = validationRules[field];
            const { valid, message } = validateField(formData[field], regex, errorMessage);
            if (!valid) {
                addNotification(message, 'warning');
                return;
            }
        }

        try {
            await axios.put(`http://localhost:4000/programa/${formData.id}`, {
                nombre: formData.nombre,
                tiempo_duracion: formData.tiempo_duracion,
                descripcion: formData.descripcion,
                plaga_fito_id: formData.plaga_fito_id,
                tipo_programa_fito_id: formData.tipo_programa_fito_id
            }, {
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
            });
            addNotification('Programa actualizado con éxito', 'success');
            fetchProgramas();
            closeModal();
        } catch (error) {
            console.error('error actualizando el programa',error);
            addNotification('Error al actualizar programa', 'error');
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:4000/programa/${id}`, {
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
            });

            fetchProgramas();
            addNotification('Programa eliminado con éxito', 'error');
        } catch (error) {
            console.error('error eliminado el programa',error);
            addNotification('Error al eliminar programa', 'error');
        }
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

    const openModal = () => {
        resetFormData();
        setCurrentModal('programa');
    };

    const closeModal = () => setCurrentModal(null);

    const openEditModal = (programa) => {
        setFormData({
            id: programa.id,
            nombre: programa.nombre || '',
            tiempo_duracion: programa.tiempo_duracion || '',
            descripcion: programa.descripcion || '',
            plaga_fito_id: programa.plaga_fito_id || '',
            tipo_programa_fito_id: programa.tipo_programa_fito_id || ''
        });
        setCurrentModal('programa');
    };

    const openConfirmDeleteModal = (id) => {
        setSelectedProgramaId(id);
        setConfirmDeleteModal(true);
    };
    const closeConfirmDeleteModal = () => {
        setSelectedProgramaId(null);
        setConfirmDeleteModal(false);
    };

    const openDetalleModal = (programa) => setDetalleModal({ abierto: true, programa });
    const closeDetalleModal = () => setDetalleModal({ abierto: false, programa: null });

    return (
        <div className={styles.programaContainer}>
            {notifications.map((notification) => (
                <Notification
                    key={notification.id}
                    message={notification.message}
                    type={notification.type}
                    onClose={() => removeNotification(notification.id)}
                />
            ))}

            {/* Modal Detalle */}
            {detalleModal.abierto && (
                <div className='modalOverlay'>
                    <div className='modalDetalle'>
                        <button className='closeButton' onClick={closeDetalleModal}>&times;</button>
                        <h2>Detalles del Programa</h2>
                        <table className='detalleTable'>
                            <tbody>
                                <tr>
                                    <th>Nombre</th>
                                    <td>{detalleModal.programa.nombre}</td>
                                </tr>
                                <tr>
                                    <th>Tiempo de Duración</th>
                                    <td>{detalleModal.programa.tiempo_duracion}</td>
                                </tr>
                                <tr>
                                    <th>Tipo de Programa</th>
                                    <td>{detalleModal.programa.tipo_programa_fito_nombre}</td>
                                </tr>
                                <tr>
                                    <th>Plaga</th>
                                    <td>{detalleModal.programa.plaga_fito_nombre}</td>
                                </tr>
                                <tr>
                                    <th>Nombre Científico Plaga</th>
                                    <td>{detalleModal.programa.plaga_fito_nombre_cientifico}</td>
                                </tr>
                                <tr>
                                    <th>Tipo de Plaga</th>
                                    <td>{detalleModal.programa.tipo_plaga_fito_nombre}</td>
                                </tr>
                                <tr>
                                    <th>Descripción</th>
                                    <td>{detalleModal.programa.descripcion}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal registro y editar */}
            {currentModal === 'programa' && (
                <div className='modalOverlay'>
                    <div className='modal'>
                        <button className='closeButton' onClick={closeModal}>&times;</button>
                        <h2>{formData.id ? 'Editar Programa' : 'Registrar Programa'}</h2>
                        <form className='modalForm'>
                            <div className={styles.formColumns}>
                                <div className='formGroup'>
                                    <label htmlFor="nombre">Nombre:</label>
                                    <input type="text" id="nombre" value={formData.nombre} onChange={handleChange} className='input' placeholder='Nombre del programa'/>
                                    {errors.nombre && <span className='errorText'>{errors.nombre}</span>}
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="tiempo_duracion">Tiempo de Duración:</label>
                                    <input type="text" id="tiempo_duracion" value={formData.tiempo_duracion} onChange={handleChange} className='input' placeholder='Ej: 6 meses'/>
                                    {errors.tiempo_duracion && <span className='errorText'>{errors.tiempo_duracion}</span>}
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="tipo_programa_fito_id">Tipo de Programa:</label>
                                    <select id="tipo_programa_fito_id" value={formData.tipo_programa_fito_id} onChange={handleChange} className='select'>
                                        <option value="">Seleccione un tipo</option>
                                        {tipos.map((tipo) => (
                                            <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>
                                        ))}
                                    </select>
                                    {errors.tipo_programa_fito_id && <span className='errorText'>{errors.tipo_programa_fito_id}</span>}
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="plaga_fito_id">Plaga a Tratar:</label>
                                    <select id="plaga_fito_id" value={formData.plaga_fito_id} onChange={handleChange} className='select'>
                                        <option value="">Seleccione una plaga</option>
                                        {plagas.map((plaga) => (
                                            <option key={plaga.id} value={plaga.id}>{plaga.nombre}</option>
                                        ))}
                                    </select>
                                    {errors.plaga_fito_id && <span className='errorText'>{errors.plaga_fito_id}</span>}
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="descripcion">Descripción:</label>
                                    <textarea id="descripcion" value={formData.descripcion} onChange={handleChange} className='input' placeholder='Descripción'/>
                                    {errors.descripcion && <span className='errorText'>{errors.descripcion}</span>}
                                </div>
                            </div>
                            <button 
                                type="button" 
                                className='saveButton' 
                                onClick={formData.id ? handleEdit : handleSave}
                                title={formData.id ? 'Actualizar Programa' : 'Registrar Programa'}>
                                    Guardar
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de confirmación para eliminar */}
            {confirmDeleteModal && (
                <div className='modalOverlay'>
                    <div className='modal'>
                        <h2>Confirmar Eliminación</h2>
                        <p>¿Estás seguro de que deseas eliminar este programa?</p>
                        <div className='modalActions'>
                            <button className='cancelButton' onClick={closeConfirmDeleteModal}>Cancelar</button>
                            <button className='confirmButton' onClick={() => { handleDelete(selectedProgramaId); closeConfirmDeleteModal(); }}>Confirmar</button>
                        </div>
                    </div>
                </div>
            )}

            <div className='tableSection'>
                <div className='filtersContainer'>
                    <button 
                        type='button'
                        onClick={openModal} 
                        className='create'
                        title='Registrar Programa'>
                        <img src={icon.plus} alt="Crear" className='icon' />
                        Agregar
                    </button>

                    <h2>Programas Fitosanitarios</h2>

                    <div className='searchContainer'>
                        <SearchBar onSearch={handleSearch} />
                        <img src={icon.lupa} alt="Buscar" className='iconlupa' />
                    </div>
                </div>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>N°</th>
                            <th>Nombre</th>
                            <th>Tiempo de Duración</th>
                            <th>Tipo de Programa</th>
                            <th>Plaga</th>
                            <th>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentData.map((programa, idx) => (
                            <tr key={programa.id} >
                                <td>{indexOfFirstItem + idx + 1}</td>
                                <td>{programa.nombre}</td>
                                <td>{programa.tiempo_duracion}</td>
                                <td>{programa.tipo_programa_fito_nombre}</td>
                                <td>{programa.plaga_fito_nombre}</td>
                                <td>
                                    <div className={styles.iconContainer}>
                                        <img
                                            onClick={() => openDetalleModal(programa)}
                                            src={icon.ver}
                                            className='iconver'
                                            title='Ver más'
                                            style={{ cursor: 'pointer' }}
                                        />
                                        <img
                                            onClick={() => openEditModal(programa)}
                                            src={icon.editar}
                                            className='iconeditar'
                                            title='Editar'
                                        />
                                        <img 
                                            onClick={() => openConfirmDeleteModal(programa.id)} 
                                            src={icon.eliminar} 
                                            className='iconeliminar' 
                                            title='eliminar'
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

export default Programas;