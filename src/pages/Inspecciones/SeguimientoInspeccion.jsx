import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BaseUrl } from '../../utils/constans';
import SingleSelect from '../../components/selectmulti/SingleSelect';
import Spinner from '../../components/spinner/Spinner';
import icon from '../../components/iconos/iconos';
import { useNotification } from '../../utils/NotificationContext';
import '../../main.css';

function SeguimientoInspeccion() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [inspeccion, setInspeccion] = useState(null);
    const [programas, setProgramas] = useState([]);
    const [asociados, setAsociados] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);
    const [selectedAsociadoId, setSelectedAsociadoId] = useState(null);
    const { addNotification } = useNotification();
    const [todasInspecciones, setTodasInspecciones] = useState([]);
    const numeroOrden = todasInspecciones.findIndex(i => String(i.id) === String(id)) + 1;
    // Estado del formulario
    const [formData, setFormData] = useState({
        id: '',
        programa_fito_id: null,
        observacion: ''
    });
    // Opciones para el select de programas 
    const programaOptions = programas.map(p => ({value: String(p.id),label: p.nombre}));

    useEffect(() => {
        axios.get(`${BaseUrl}/inspecciones`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        .then(res => setTodasInspecciones(res.data))
        .catch(() => setTodasInspecciones([]));
    }, []);

    // Obtener datos de inspección
    const fetchInspeccion = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${BaseUrl}/inspecciones/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setInspeccion(res.data);
        } catch (error) {
            console.error('Error solicitando todos los datos de la inspección', error);
            setInspeccion(null);
        } finally {
            setLoading(false);
        }
    };

    // Obtener todos los programas fito
    const fetchProgramas = async () => {
        try {
            const res = await axios.get(`${BaseUrl}/seguimiento/programas`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setProgramas(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            console.error('Error solicitando todos los programas', error);
            setProgramas([]);
        }
    };

    // Obtener programas asociados a la inspección
    const fetchAsociados = async () => {
        try {
            const res = await axios.get(`${BaseUrl}/seguimiento/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setAsociados(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            console.error('Error solicitando los programas asociados', error);
            setAsociados([]);
        }
    };

    useEffect(() => {
        fetchInspeccion();
        fetchProgramas();
        fetchAsociados();
        // eslint-disable-next-line
    }, [id]);

    // Abrir modal de registro
    const openModal = () => {
        setFormData({
            id: '',
            programa_fito_id: null,
            observacion: ''
        });
        setModalOpen(true);
    };

    // Abrir modal de edición
    const openEditModal = (asociado) => {
        setFormData({
            id: asociado.id,
            programa_fito_id: programaOptions.find(opt => String(opt.value) === String(asociado.programa_id)) || null,
            observacion: asociado.observacion || ''
        });
        setModalOpen(true);
    };
    // Cerrar modal
    const closeModal = () => {
        setModalOpen(false);
        setFormData({
            id: '',
            programa_fito_id: null,
            observacion: ''
        });
    };

    // Abrir modal de confirmación para eliminar
    const openConfirmDeleteModal = (id) => {
        setSelectedAsociadoId(id);
        setConfirmDeleteModal(true);
    };
    const closeConfirmDeleteModal = () => {
        setSelectedAsociadoId(null);
        setConfirmDeleteModal(false);
    };

    const handleSave = async () => {
    if (!formData.programa_fito_id) {
        addNotification('Debe seleccionar un programa', 'error');
        return;
    }
    setLoading(true);
    try {
        await axios.post(`${BaseUrl}/seguimiento`, {
            inspeccion_est_id: id,
            programa_fito_id: formData.programa_fito_id.value,
            observacion: formData.observacion
        }, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        addNotification('Programa asociado con éxito', 'success');
        fetchAsociados();
        closeModal();
    } catch (error) {
        console.error('Error registrando programa asociado', error);
        addNotification('Error al guardar', 'error');
    } finally {
        setLoading(false);
    }
};


    const handleEdit = async () => {
        setLoading(true);
        try {
            await axios.put(`${BaseUrl}/seguimiento/${formData.id}`, {
                observacion: formData.observacion
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            addNotification('Programa actualizado con éxito', 'success');
            fetchAsociados();
            closeModal();
        } catch (error) {
            console.error('Error actualizando programa asociado', error);
            addNotification('Error al actualizar', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        setLoading(true);
        try {
            await axios.delete(`${BaseUrl}/seguimiento/${selectedAsociadoId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            addNotification('Programa eliminado con éxito', 'success');
            fetchAsociados();
        } catch (error) {
            console.error('Error Eliminando el programa', error);
            addNotification('Error al eliminar el programa', 'error');
        } finally {
            setLoading(false);
            closeConfirmDeleteModal();
        }
    };

    return (
        <div className="mainContainer">
            {loading && <Spinner text="Procesando..." />}

            {/* Modal de confirmación para eliminar */}
            {confirmDeleteModal && (
                <div className='modalOverlay'>
                    <div className='modal'>
                        <h2>Confirmar Eliminación</h2>
                        <p>¿Estás seguro de que deseas eliminar este Programa para esta Inspección?</p>
                        <div className='modalActions'>
                            <button className='cancelButton' onClick={closeConfirmDeleteModal}>Cancelar</button>
                            <button className='confirmButton' onClick={handleDelete}>Confirmar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Sección superior */}
            <div className='SectionSeguimiento'>
                <div className='ss-left'>
                    <button
                        className="create"
                        onClick={() => navigate('/SeccionThree')}
                    >
                        <img src={icon.flecha} alt="Regresar" title='Regresar a la pagina anterior' className='iconTwo' />
                        Regresar
                    </button>
                </div>

                {/* <div className="ss-center">
                    <img src={icon.homeIcon} alt="Exportar" title='Exportar' className='btn-icon-Estandar' />
                    <img src={icon.excel} alt="Imprimir" title='Imprimir' className='btn-icon-Estandar'/>
                    <img src={icon.pdf4} alt="Ayuda" title='Ayuda' className='btn-icon-Estandar'/>
                    <img src={icon.cubo} alt="Ayuda" title='Ayuda' className='btn-icon-Estandar'/>
                </div> */}

                <div className='ss-right'>
                    <h2  className='titleOne'>
                        Seguimiento de Inspección #{numeroOrden > 0 ? numeroOrden : id}
                    </h2>
                    <h3 className='titleTwo'>
                        Propiedad: {inspeccion?.propiedad_nombre || 'Sin Nombre'}
                    </h3>
                </div>
            </div>

            {/* Tabla de detalles de la inspección */}
            {inspeccion && (
                <div className="tableSection" style={{ marginBottom: 30 }}>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Código</th>
                                <th>Estado</th>
                                <th>Fecha Inspección</th>
                                <th>Responsable</th>
                                <th>Tipo</th>
                                <th>Propiedad</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>{inspeccion.codigo_inspeccion}</td>
                                <td>
                                    <span className={`badge-estado badge-${inspeccion.estado?.toLowerCase().replace(/\s/g, '')}`}>
                                        {inspeccion.estado}
                                    </span>
                                </td>
                                <td>{inspeccion.fecha_inspeccion}</td>
                                <td>
                                    {inspeccion.empleados_responsables && inspeccion.empleados_responsables.length > 0
                                        ? inspeccion.empleados_responsables.map(e => `${e.nombre} ${e.apellido}`).join(', ')
                                        : 'Sin responsable'}
                                </td>
                                <td>{inspeccion.tipo_inspeccion_nombre}</td>
                                <td>{inspeccion.propiedad_nombre}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}

            {/* Tabla de programas asociados */}
            <div className="tableSection" style={{ marginBottom: 30 }}>
                <div className="filtersContainer">
                    <button className="create" onClick={openModal} title='Asociar Programa'>
                        <img src={icon.plus} alt="Agregar" className='icon' />
                        Agregar
                    </button>
                    <h2>Programas Asociados</h2>
                    <div className='searchContainer'></div>
                </div>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Programa</th>
                            <th>Descripción</th>
                            <th>Fecha Asociación</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {asociados.length === 0 && (
                            <tr>
                                <td colSpan={4} style={{ color: 'var(--grey4)' }}>No hay programas asociados.</td>
                            </tr>
                        )}
                        {asociados.map(p => (
                            <tr key={p.id}>
                                <td>{p.nombre}</td>
                                <td>{p.observacion}</td>
                                <td>{p.created_at?.slice(0, 10)}</td>
                                <td>
                                    <div className='iconContainer'>
                                        <img
                                            onClick={() => openEditModal(p)}
                                            src={icon.editar}
                                            className='iconeditar'
                                            title='Editar'
                                        />
                                        <img
                                            onClick={() => openConfirmDeleteModal(p.id)}
                                            src={icon.eliminar}
                                            className='iconeliminar'
                                            title='Eliminar'
                                        />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal registro/edición */}
            {modalOpen && (
                <div className="modalOverlay">
                    <div className="modal_mono">
                        <button className="closeButton" onClick={closeModal}>&times;</button>
                        <h2>{formData.id ? 'Editar Asociación' : 'Asociar Programa'}</h2>
                        <form className="modalForm">
                            <div className='formColumns_mono'>
                                <div className="formGroup">
                                    <label>Programas:</label>
                                    <SingleSelect
                                        options={programaOptions}
                                        value={formData.programa_fito_id}
                                        onChange={val => setFormData(prev => ({
                                            ...prev,
                                            programa_fito_id: val
                                        }))}
                                        placeholder="Seleccione un programa"
                                        isDisabled={!!formData.id}
                                    />
                                </div>
                                <div className="formGroup">
                                    <label>Descripción:</label>
                                    <textarea
                                        className="textarea"
                                        value={formData.observacion}
                                        onChange={e => setFormData(prev => ({
                                            ...prev,
                                            observacion: e.target.value
                                        }))}
                                        placeholder="Descripción del programa"
                                    />
                                </div>
                            </div>
                            <button 
                                className="saveButton" 
                                type="button"
                                onClick={formData.id ? handleEdit : handleSave}
                                title={formData.id ? 'Actualizar Asociación' : 'Asociar Programa'} 
                            >
                                Guardar
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SeguimientoInspeccion;