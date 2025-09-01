import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MultiSelect from '../../components/selectmulti/MultiSelect';
import SingleSelect from '../../components/selectmulti/SingleSelect';
import '../../main.css';
import icon from '../../components/iconos/iconos';
import { filterData } from '../../utils/filterData';
import SearchBar from "../../components/searchbart/SearchBar";
import { useNotification } from '../../utils/NotificationContext';
import { validateField, validationRules } from '../../utils/validation';
import Spinner from '../../components/spinner/Spinner';
import { BaseUrl } from '../../utils/constans';

function Programas() {
    const [datosOriginales, setDatosOriginales] = useState([]);
    const [datosFiltrados, setDatosFiltrados] = useState([]);
    const [plagas, setPlagas] = useState([]);
    const [tipos, setTipos] = useState([]);
    const [empleados, setEmpleados] = useState([]);
    const [cultivos, setCultivos] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [currentModal, setCurrentModal] = useState(null);
    const [loading, setLoading] = useState(false);
    const [detalleModal, setDetalleModal] = useState({ abierto: false, programa: null });
    const [formData, setFormData] = useState({
        id: '',
        nombre: '',
        descripcion: '',
        tipo_programa_fito_id: '',
        empleados_ids: [],
        plaga_fito_ids: [],
        cultivo_ids: []
    });
    const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);
    const [selectedProgramaId, setSelectedProgramaId] = useState(null);
    const { addNotification } = useNotification();
    const itemsPerPage = 8;
    const [errors, setErrors] = useState({});

    const fetchProgramas = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${BaseUrl}/programa`, {
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
            });
            setDatosOriginales(response.data);
            setDatosFiltrados(response.data);
        } catch (error) {
            console.error('error obteniendo todos los programas',error);
            addNotification('Error al obtener programas', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchPlagas = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${BaseUrl}/programa/plagas/all`, {
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
            });
            setPlagas(response.data);
        } catch (error) {
            console.error('error obteniendo todas las plagas',error);
            addNotification('Error al obtener plagas', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchTipos = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${BaseUrl}/programa/tipos/all`, {
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
            });
            setTipos(response.data);
        } catch (error) {
            console.error('error obteniendo  tipos de programas',error);
            addNotification('Error al obtener tipos de programa', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchEmpleados = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${BaseUrl}/programa/empleados/all`, {
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
            });
            setEmpleados(response.data);
        } catch (error) {
            console.error('error obteniendo empleados',error);
            addNotification('Error al obtener empleados', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchCultivos = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${BaseUrl}/programa/cultivos/all`, {
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
            });
            setCultivos(response.data);
        } catch (error) {
            console.error('error obteniendo cultivos', error);
            addNotification('Error al obtener cultivos', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProgramas();
        fetchPlagas();
        fetchTipos();
        fetchEmpleados();
        fetchCultivos();
    }, []);

    const resetFormData = () => {
        setFormData({
            id: '',
            nombre: '',
            descripcion: '',
            tipo_programa_fito_id: '',
            empleados_ids: [],
            plaga_fito_ids: [],
            cultivo_ids: []
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

    
    const empleadosOptions = empleados.map(e => ({ value: String(e.id), label: e.nombre }));
    const plagasOptions = plagas.map(p => ({ value: String(p.id), label: p.nombre }));
    const cultivosOptions = cultivos.map(c => ({ value: String(c.id), label: c.nombre }));


    const handleEmpleadosChange = (selected) => {
        setFormData(prev => ({
            ...prev,
            empleados_ids: selected ? selected.map(opt => opt.value) : []
        }));
    };

    const handlePlagasChange = (selected) => {
        setFormData(prev => ({
            ...prev,
            plaga_fito_ids: selected ? selected.map(opt => opt.value) : []
        }));
    };

    const handleCultivosChange = (selected) => {
        setFormData(prev => ({
            ...prev,
            cultivo_ids: selected ? selected.map(opt => opt.value) : []
        }));
    };

    const clearMultiSelect = (campo) => {
        setFormData(prev => ({
            ...prev,
            [campo]: []
        }));
    };

    const handleSearch = (searchTerm) => {
        const filtered = filterData(datosOriginales, searchTerm, [
            'id','nombre','descripcion','tipo_programa_nombre'
        ]);
        setDatosFiltrados(filtered);
    };

    const handleSave = async () => {
        setLoading(true);
        for (const field of ['nombre', 'tipo_programa_fito_id']) {
            if (!validationRules[field]) continue;
            const { regex, errorMessage } = validationRules[field];
            if (regex) {
                const { valid, message } = validateField(formData[field], regex, errorMessage);
                if (!valid) {
                    setLoading(false);
                    addNotification(message, 'warning');
                    return;
                }
            }
        }

        try {
            await axios.post(`${BaseUrl}/programa`, {
                nombre: formData.nombre,
                descripcion: formData.descripcion,
                tipo_programa_fito_id: formData.tipo_programa_fito_id,
                empleados_ids: formData.empleados_ids,
                plaga_fito_ids: formData.plaga_fito_ids,
                cultivo_ids: formData.cultivo_ids
            }, {
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
            });
            addNotification('Programa registrado con éxito', 'success');
            fetchProgramas();
            closeModal();
        } catch (error) {
            console.error('error registrando programa',error);
            addNotification('Error al registrar programa', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async () => {
        setLoading(true);
        for (const field of ['nombre']) {
            if (!validationRules[field]) continue;
            const { regex, errorMessage } = validationRules[field];
            const { valid, message } = validateField(formData[field], regex, errorMessage);
            if (!valid) {
                setLoading(false);
                addNotification(message, 'warning');
                return;
            }
        }

        try {
            await axios.put(`${BaseUrl}/programa/${formData.id}`, {
                nombre: formData.nombre,
                descripcion: formData.descripcion,
                tipo_programa_fito_id: formData.tipo_programa_fito_id,
                empleados_ids: formData.empleados_ids,
                plaga_fito_ids: formData.plaga_fito_ids,
                cultivo_ids: formData.cultivo_ids
            }, {
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
            });
            addNotification('Programa actualizado con éxito', 'success');
            fetchProgramas();
            closeModal();
        } catch (error) {
            console.error('error actualizando programas',error);
            addNotification('Error al actualizar programa', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        setLoading(true);
        try {
            await axios.delete(`${BaseUrl}/programa/${id}`, {
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
            });

            fetchProgramas();
            addNotification('Programa eliminado con éxito', 'success');
        } catch (error) {
            console.error('error eliminando programa',error);
            addNotification('Error al eliminar programa', 'error');
        } finally {
            setLoading(false);
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
            descripcion: programa.descripcion || '',
            tipo_programa_fito_id: programa.tipo_programa_fito_id || '',
            empleados_ids: (programa.empleados || []).map(e => String(e.id)),
            plaga_fito_ids: (programa.plagas || []).map(p => String(p.id)),
            cultivo_ids: (programa.cultivos || []).map(c => String(c.id))
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
        <div className='mainContainer'>

            {loading && <Spinner text="Procesando..." />}
            {/* Modal Detalle */}
            {detalleModal.abierto && detalleModal.programa && (
                <div className='modalOverlay'>
                    <div className='modal'>
                        <button className='closeButton' onClick={closeDetalleModal}>&times;</button>
                        <h2>Detalles del Programa</h2>
                        <form className='modalForm'>
                            <div className='formColumns'>
                                <div className='formGroup'>
                                    <label htmlFor="nombre">Nombre:</label>
                                    <input
                                        type="text"
                                        id="nombre"
                                        value={detalleModal.programa.nombre || ''}
                                        className='input'
                                        disabled
                                    />
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="tipo_programa_fito_id">Tipo de Programa:</label>
                                    <SingleSelect
                                        options={tipos.map(tipo => ({ value: String(tipo.id), label: tipo.nombre }))}
                                        value={detalleModal.programa.tipo_programa_fito_id}
                                        isDisabled={true}
                                    />
                                </div>
                                <div className='formGroup'>
                                    <label>Plagas a Tratar:</label>
                                    <MultiSelect
                                        options={plagasOptions}
                                        value={plagasOptions.filter(opt =>
                                            (detalleModal.programa.plagas || []).map(p => String(p.id)).includes(String(opt.value))
                                        )}
                                        isDisabled={true}
                                    />
                                </div>
                                <div className='formGroup'>
                                    <label>Cultivos Asociados:</label>
                                    <MultiSelect
                                        options={cultivosOptions}
                                        value={cultivosOptions.filter(opt =>
                                            (detalleModal.programa.cultivos || []).map(c => String(c.id)).includes(String(opt.value))
                                        )}
                                        isDisabled={true}
                                    />
                                </div>
                                <div className='formGroup'>
                                    <label>Empleados Responsables:</label>
                                    <MultiSelect
                                        options={empleadosOptions}
                                        value={empleadosOptions.filter(opt =>
                                            (detalleModal.programa.empleados || []).map(e => String(e.id)).includes(String(opt.value))
                                        )}
                                        isDisabled={true}
                                    />
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="descripcion">Descripción:</label>
                                    <textarea
                                        id="descripcion"
                                        value={detalleModal.programa.descripcion || ''}
                                        className='input'
                                        disabled
                                    />
                                </div>
                            </div>
                        </form>
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
                            <div className='formColumns'>
                                <div className='formGroup'>
                                    <label htmlFor="nombre">Nombre:</label>
                                    <input type="text" id="nombre" value={formData.nombre} onChange={handleChange} className='input' placeholder='Nombre del programa'/>
                                    {errors.nombre && <span className='errorText'>{errors.nombre}</span>}
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="tipo_programa_fito_id">Tipo de Programa:</label>
                                    <SingleSelect
                                        options={tipos.map(tipo => ({ value: String(tipo.id), label: tipo.nombre }))}
                                        value={formData.tipo_programa_fito_id}
                                        onChange={val => setFormData(prev => ({ ...prev, tipo_programa_fito_id: val }))}
                                        placeholder="Seleccione un tipo"
                                        />
                                    {errors.tipo_programa_fito_id && <span className='errorText'>{errors.tipo_programa_fito_id}</span>}
                                </div>
                                
                                <div className='formGroup'>
                                    <label>Plagas a Tratar:</label>
                                    <MultiSelect
                                        options={plagasOptions}
                                        value={plagasOptions.filter(opt => formData.plaga_fito_ids.includes(opt.value))}
                                        onChange={handlePlagasChange}
                                        placeholder="Selecciona plagas..."
                                    />
                                    {formData.plaga_fito_ids.length > 0 && (
                                        <button type="button" onClick={() => clearMultiSelect('plaga_fito_ids')} className='btn-limpiar'>Limpiar</button>
                                    )}
                                    {errors.plaga_fito_ids && <span className='errorText'>{errors.plaga_fito_ids}</span>}
                                </div>

                                <div className='formGroup'>
                                    <label>Cultivos Asociados:</label>
                                    <MultiSelect
                                        options={cultivosOptions}
                                        value={cultivosOptions.filter(opt => formData.cultivo_ids.includes(opt.value))}
                                        onChange={handleCultivosChange}
                                        placeholder="Selecciona cultivos..."
                                    />
                                    {formData.cultivo_ids.length > 0 && (
                                        <button type="button" onClick={() => clearMultiSelect('cultivo_ids')} className='btn-limpiar'>Limpiar</button>
                                    )}
                                    {errors.cultivo_ids && <span className='errorText'>{errors.cultivo_ids}</span>}
                                </div>

                                <div className='formGroup'>
                                    <label>Empleados Responsables:</label>
                                    <MultiSelect
                                        options={empleadosOptions}
                                        value={empleadosOptions.filter(opt => formData.empleados_ids.includes(opt.value))}
                                        onChange={handleEmpleadosChange}
                                        placeholder="Selecciona empleados..."
                                    />
                                    {formData.empleados_ids.length > 0 && (
                                        <button type="button" onClick={() => clearMultiSelect('empleados_ids')} className='btn-limpiar'>Limpiar</button>
                                    )}
                                    {errors.empleados_ids && <span className='errorText'>{errors.empleados_ids}</span>}
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
                                title={formData.id ? 'Actualizar Programa' : 'Registrar Programa'}
                                disabled={loading}
                            >
                                {loading ? 'Procesando...' : 'Guardar'}
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
                <table className='table'>
                    <thead>
                        <tr>
                            <th>N°</th>
                            <th>Nombre</th>
                            <th>Tipo de Programa</th>
                            <th>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentData.map((programa, idx) => (
                            <tr key={programa.id} >
                                <td>{indexOfFirstItem + idx + 1}</td>
                                <td>{programa.nombre}</td>
                                <td>{programa.tipo_programa_nombre}</td>
                                {/* <td>{(programa.plagas || []).map(p => p.nombre).join(', ')}</td> */}
                                {/* <td>{(programa.empleados || []).map(e => e.nombre).join(', ')}</td> */}
                                <td>
                                    <div className='iconContainer'>
                                        <img
                                            onClick={() => openDetalleModal(programa)}
                                            src={icon.ver}
                                            className='iconver'
                                            title='Ver más'
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