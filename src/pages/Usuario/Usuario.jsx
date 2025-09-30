import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './usuario.module.css';
import SingleSelect from '../../components/selectmulti/SingleSelect';
import '../../main.css';
import icon from '../../components/iconos/iconos';
import { filterData } from '../../utils/filterData';
import SearchBar from "../../components/searchbart/SearchBar";
import { useNotification } from '../../utils/NotificationContext';
import { validateField, validationRules } from '../../utils/validation';
import { getCurrentUser } from '../../utils/usernameauth';
import { usePermiso } from '../../hooks/usePermiso';
import Spinner from '../../components/spinner/Spinner';
import { BaseUrl } from '../../utils/constans';

function Usuario() {
    const [datosOriginales, setDatosOriginales] = useState([]);
    const [datosFiltrados, setDatosFiltrados] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [currentModal, setCurrentModal] = useState(null);
    const [loading, setLoading] = useState(false);
    const [cedulas, setCedulas] = useState([]);
    const [tiposUsuario, setTiposUsuario] = useState([]);
    const user = getCurrentUser();
    const tienePermiso = usePermiso(); 
    const [formData, setFormData] = useState({
        id: '',
        empleado_id: null,
        username: '',
        email: '',
        roles_id: null,
        password: '',
        confirmarpassword: ''
    });
    const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);
    const [selectedEmpleadoId, setSelectedEmpleadoId] = useState(null);
    const [detalleModal, setDetalleModal] = useState({ abierto: false, usuario: null });
    const { addNotification } = useNotification();
    const itemsPerPage = 8;
    const [errors, setErrors] = useState({});

    const resetFormData = () => {
        setFormData({
            id: '',
            empleado_id: null,
            username: '',
            email: '',
            roles_id: null,
            password: '',
            confirmarpassword: ''
        });
        setErrors({});
    };

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData({ ...formData, [id]: value });

        if (id === 'confirmarpassword') {
            const confirmPasswordValidation = validationRules.confirmarpassword.validate(value, formData.password);
            setErrors({ ...errors, confirmarpassword: confirmPasswordValidation.valid ? '' : confirmPasswordValidation.message });
        } else if (validationRules[id]) {
            const { regex, errorMessage } = validationRules[id];
            const { valid, message } = validateField(value, regex, errorMessage);
            setErrors({ ...errors, [id]: valid ? '' : message });
        }
    };

    const handleSearch = (searchTerm) => {
        const filtered = filterData(datosOriginales, searchTerm, ['username', 'email', 'roles_nombre']);
        setDatosFiltrados(filtered);
    };

    const fetchUsuarios = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${BaseUrl}/usuarios`, {
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
            });
            setDatosOriginales(response.data);
            setDatosFiltrados(response.data);
        } catch (error) {
            console.error('error al obtener los usuario',error);
            addNotification('Error al obtener usuarios', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsuarios();
    }, []);

    const fetchTiposUsuario = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${BaseUrl}/usuarios/tipos`, {
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
            });
            setTiposUsuario(response.data);
        } catch (error) {
            console.error('error al obtener los tipos de usuario',error);
            addNotification('Error al obtener tipos de usuario', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchCedulas = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${BaseUrl}/usuarios/empleados/cedulas`, {
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
            });
            setCedulas(response.data);
        } catch (error) {
            console.error('error al obtener todas las cedulas',error);
            addNotification('Error al obtener cédulas', 'error');
        } finally {
            setLoading(false);
        }
    };


    const handleSave = async () => {
        // Validación para selects
    if (!formData.empleado_id || !formData.empleado_id.value) {
        addNotification('Debe seleccionar un empleado', 'warning');
        return;
    }
    if (!formData.roles_id || !formData.roles_id.value) {
        addNotification('Debe seleccionar un tipo de usuario', 'warning');
        return;
    }

    // Validación para los demás campos (solo strings)
    for (const field in formData) {
            if (!validationRules[field]) continue;
            // Solo valida si es string
            if (typeof formData[field] !== 'string') continue;

            const { regex, errorMessage } = validationRules[field];
            if (regex) {
                const { valid, message } = validateField(formData[field], regex, errorMessage);
                if (!valid) {
                    addNotification(message, 'warning');
                    return;
                }
            }
            if (field === 'confirmarpassword') {
                const confirmPasswordValidation = validationRules.confirmarpassword.validate(
                    formData.confirmarpassword,
                    formData.password
                );
                if (!confirmPasswordValidation.valid) {
                    addNotification(confirmPasswordValidation.message, 'info');
                    return;
                }
            }
        }
        const existeUsuario = datosOriginales.some(
                usuario => usuario.username.trim().toLowerCase() === formData.username.trim().toLowerCase()
            );
            if (existeUsuario) {
                addNotification('Ya existe un usuario con ese nombre. Por favor elija otro.', 'warning');
                return;
            }
        setLoading(true);

        try {
            const response = await axios.post(`${BaseUrl}/usuarios`, {
                ...formData,
                empleado_id: formData.empleado_id?.value || '',
                roles_id: formData.roles_id?.value || '',
            }, {
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
            });
            setDatosOriginales([response.data, ...datosOriginales]);
            setDatosFiltrados([response.data, ...datosFiltrados]);
            addNotification('Usuario registrado con éxito', 'success');
            fetchUsuarios();
            closeModal();
        } catch (error) {
            if (error.response && error.response.status === 409) {
            addNotification(error.response.data.error || 'El correo ya está registrado.', 'warning');
        } else {
            addNotification('Error al registrar usuario', 'error');
        }
            console.error('error al registrar el usuario', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async () => {
        setLoading(true);
        const camposObligatorios = ['username', 'email', 'password'];
        for (const field of camposObligatorios) {
            const { regex, errorMessage } = validationRules[field];
            const { valid, message } = validateField(formData[field], regex, errorMessage);
            if (!valid) {
                addNotification(message, 'warning');
                return;
            }
        }

        try {
            const response = await axios.put(`${BaseUrl}/usuarios/${formData.id}`, {
                ...formData,
                empleado_id: formData.empleado_id?.value || '',
                roles_id: formData.roles_id?.value || '',
            }, {
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
            });
            const updatedData = datosOriginales.map((usuario) =>
                usuario.id === response.data.id ? response.data : usuario
            );
            setDatosOriginales(updatedData);
            setDatosFiltrados(updatedData);
            closeModal();
            addNotification('Usuario actualizado con éxito', 'success');
        } catch (error) {
            console.error('error al actualizar el usuario',error);
            addNotification('Error al actualizar usuario', 'error');
        } finally {
            setLoading(false);
        }
    };

    const disableUser = async (id, estado) => {
        setLoading(true);
        try {
            await axios.patch(`${BaseUrl}/usuarios/${id}/estado`, { estado }, {
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
            });

            const updatedData = datosOriginales.map((usuario) =>
                usuario.id === id ? { ...usuario, estado } : usuario
            );

            setDatosOriginales(updatedData);
            setDatosFiltrados(updatedData);
            
            addNotification(
                estado ? 'Usuario habilitado con éxito' : 'Usuario deshabilitado con éxito',
                estado ? 'success' : 'error'
            );
        } catch (error) {
            console.error('error al deshabilitar el usuario',error);
            addNotification('Error al cambiar estado del usuario', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${BaseUrl}/usuarios/${id}`, {
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
            });
            setDatosOriginales(datosOriginales.filter((usuario) => usuario.id !== id));
            setDatosFiltrados(datosFiltrados.filter((usuario) => usuario.id !== id));
            addNotification('Usuario eliminado con éxito', 'success');
        } catch (error) {
            console.error('error al eliminar el usuario',error);
            addNotification('Error al eliminar usuario', 'error');
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
        fetchCedulas();
        fetchTiposUsuario();
        setCurrentModal('usuario');
    };

    const closeModal = () => setCurrentModal(null);

    const openEditModal = async (usuario) => {
        await fetchCedulas();
        await fetchTiposUsuario();
        setFormData({
            id: usuario.id,
            empleado_id: usuario.empleado_id
            ? { value: String(usuario.empleado_id), label: cedulas.find(c => String(c.id) === String(usuario.empleado_id))?.cedula || '' }
            : null,
            cedula: usuario.cedula || '',
            username: usuario.username || '',
            email: usuario.email || '',
            roles_id: usuario.roles_id
            ? { value: String(usuario.roles_id), label: tiposUsuario.find(r => String(r.id) === String(usuario.roles_id))?.nombre || '' }
            : null,
            password: '',
            confirmarpassword: ''
        });
        setCurrentModal('usuario');
    };

    // modal de eliminar
    const openConfirmDeleteModal = (id) => {
    setSelectedEmpleadoId(id);
    setConfirmDeleteModal(true);
};

    const closeConfirmDeleteModal = () => {
        setSelectedEmpleadoId(null);
        setConfirmDeleteModal(false);
    };

    // MODAL DETALLE USUARIO
    const openDetalleModal = async (usuario) => {
        setDetalleModal({ abierto: true, usuario: null });
        setLoading(true);
        try {
            // Asegúrate de tener los datos necesarios
            await fetchCedulas();
            await fetchTiposUsuario();
            const response = await axios.get(`${BaseUrl}/usuarios/${usuario.id}`, {
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
            });
            setDetalleModal({ abierto: true, usuario: response.data });
        } catch (error) {
            console.error('error al mostrar el modal de detalle',error);
            setDetalleModal({ abierto: true, usuario: null });
            addNotification('No se pudo cargar el detalle del usuario o esta deshabilitado', 'error');
        } finally {
            setLoading(false);
        }
    };
    
    const closeDetalleModal = () => setDetalleModal({ abierto: false, usuario: null });

    const empleadoSeleccionado = cedulas.find(
        (c) => String(c.id) === String(formData.empleado_id?.value)
    );

    return (
        <div className='mainContainer'>

            {loading && <Spinner text="Procesando..." />}
            {/* Modal de detalle */}
            {detalleModal.abierto && detalleModal.usuario && (
                <div className='modalOverlay'>
                    <div className='modal'>
                        <button className='closeButton' onClick={closeDetalleModal}>&times;</button>
                        <h2>Detalle del Usuario</h2>
                        <form className='modalForm'>
                            <div className='formColumns'>
                                <div className='formGroup'>
                                    <label htmlFor="empleado_id">Cédula:</label>
                                    <SingleSelect
                                        options={cedulas.map(cedula => ({ value: String(cedula.id), label: cedula.cedula }))}
                                        value={
                                            detalleModal.usuario.empleado_id
                                                ? {
                                                    value: String(detalleModal.usuario.empleado_id),
                                                    label: cedulas.find(c => String(c.id) === String(detalleModal.usuario.empleado_id))?.cedula || ''
                                                }
                                                : null
                                        }
                                        isDisabled={true}
                                    />
                                    <div className='text_empleado'>
                                        {detalleModal.usuario.empleado_nombre && detalleModal.usuario.apellido
                                            ? `${detalleModal.usuario.empleado_nombre} ${detalleModal.usuario.apellido}`
                                            : '\u00A0'}
                                    </div>
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="username">Usuario:</label>
                                    <input
                                        type="text"
                                        id="username"
                                        value={detalleModal.usuario.username || ''}
                                        className='input'
                                        disabled
                                    />
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="email">Correo:</label>
                                    <input
                                        type="text"
                                        id="email"
                                        value={detalleModal.usuario.email || ''}
                                        className='input'
                                        disabled
                                    />
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="tipo_usuario_id">Tipo de Usuario:</label>
                                    <SingleSelect
                                        options={tiposUsuario.map(roles => ({ value: String(roles.id), label: roles.nombre }))}
                                        value={
                                            detalleModal.usuario.roles_id
                                                ? {
                                                    value: String(detalleModal.usuario.roles_id),
                                                    label: tiposUsuario.find(r => String(r.id) === String(detalleModal.usuario.roles_id))?.nombre || ''
                                                }
                                                : null
                                        }
                                        isDisabled={true}
                                    />
                                </div>

                                {user.id === detalleModal.usuario.id && detalleModal.usuario.estado && (
                                    <>
                                        <div className='formGroup'>
                                            <label htmlFor="password">Contraseña</label>
                                            <input
                                                type="password"
                                                id="password"
                                                value={detalleModal.usuario.password || ''}
                                                className='password'
                                                disabled
                                                placeholder="********"
                                            />
                                        </div>
                                        <div className='formGroup'>
                                            <label htmlFor="confirmarpassword">Confirme:</label>
                                            <input
                                                type="password"
                                                id="confirmarpassword"
                                                value={detalleModal.usuario.confirmarpassword || ''}
                                                className='password'
                                                disabled
                                                placeholder="********"
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal registro y editar */}
            {currentModal === 'usuario' && (
                <div className='modalOverlay'>
                    <div className='modal'>
                        <button className='closeButton' onClick={closeModal}>&times;</button>
                        <h2>{formData.id ? 'Editar Usuario' : 'Registrar Usuario'}</h2>
                        <form className='modalForm'>
                            <div className='formColumns'>
                                <div className='formGroup'>
                                    <label htmlFor="empleado_id"><span className='Unique' title='Campo Obligatorio'>*</span>Cédula:</label>
                                        <SingleSelect
                                            options={cedulas.map(cedula => ({ value: String(cedula.id), label: cedula.cedula }))}
                                            value={formData.empleado_id}
                                            onChange={val => setFormData(prev => ({ ...prev, empleado_id: val }))}
                                            placeholder="Seleccione un tipo"
                                        />
                                        <div className='text_empleado'>
                                            {empleadoSeleccionado ? `${empleadoSeleccionado.nombre} ${empleadoSeleccionado.apellido}` : '\u00A0'}
                                        </div>
                                </div>

                                <div className='formGroup'>
                                    <label htmlFor="username"><span className='Unique' title='Campo Obligatorio'>*</span>Usuario:</label>
                                    <input type="text" id="username" value={formData.username} onChange={handleChange} className='input' placeholder='Rellene el Campo'/>
                                    {errors.username && <span className='errorText'>{errors.username}</span>}
                                </div>

                                <div className='formGroup'>
                                    <label htmlFor="email"><span className='Unique' title='Campo Obligatorio'>*</span>Correo:</label>
                                    <input type="text" id="email" value={formData.email} onChange={handleChange} className='input' placeholder='Rellene el campo'/>
                                    {errors.email && <span className='errorText'>{errors.email}</span>}
                                </div>

                                <div className='formGroup'>
                                    <label htmlFor="tipo_usuario_id"><span className='Unique' title='Campo Obligatorio'>*</span>Tipo de Usuario:</label>
                                    <SingleSelect
                                        options={tiposUsuario.map(roles => ({ value: String(roles.id), label: roles.nombre }))}
                                        value={formData.roles_id}
                                        onChange={val => setFormData(prev => ({ ...prev, roles_id: val }))}
                                        placeholder="Seleccione un tipo"
                                        />
                                </div>

                                <div className='formGroup'>
                                    <label htmlFor="password"><span className='Unique' title='Campo Obligatorio'>*</span>Contraseña</label>
                                    <input type="password" id="password" value={formData.password} onChange={handleChange} className='password' placeholder='Rellene el campo'/>
                                    {errors.password && <span className='errorText'>{errors.password}</span>}
                                </div>

                                <div className='formGroup'>
                                    <label htmlFor="confirmarpassword"><span className='Unique' title='Campo Obligatorio'>*</span>Confirme:</label>
                                    <input type="password" id="confirmarpassword" value={formData.confirmarpassword} onChange={handleChange} className='password' placeholder='Rellene el campo'/>
                                    {errors.confirmarpassword && <span className='errorText'>{errors.confirmarpassword}</span>}
                                </div>
                            </div>

                            <button 
                                type="button" 
                                className='saveButton' 
                                onClick={formData.id ? handleEdit : handleSave}
                                title={formData.id ? 'Actualizar Usuario' : 'Registrar Usuario'}
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
                        <p>¿Estás seguro de que deseas eliminar este usuario?</p>
                        <div className='modalActions'>
                            <button className='cancelButton' onClick={closeConfirmDeleteModal}>Cancelar</button>
                            <button className='confirmButton' onClick={() => { handleDelete(selectedEmpleadoId); closeConfirmDeleteModal(); }}>Confirmar</button>
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
                        title='Registrar Empleado'>
                        <img src={icon.plus} alt="Crear" className='icon' />
                        Agregar
                    </button>
                    <h2>Usuarios</h2>
                    <div className='searchContainer'>
                        <SearchBar onSearch={handleSearch} />
                        <img src={icon.lupa} alt="Buscar" className='iconlupa' />
                    </div>
                </div>
                <table className='table'>
                    <thead>
                        <tr>
                            <th>Usuario</th>
                            <th>Correo</th>  
                            <th>Tipo de Usuario</th>
                            <th>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentData.map((usuario) => (
                            <tr
                                key={usuario.id || `${usuario.username}-${usuario.email}`}
                                className={!usuario.estado ? styles.usuarioDeshabilitado : ''}
                            >
                                <td>{usuario.username}</td>
                                <td>{usuario.email}</td>
                                <td>{usuario.roles_nombre}</td>
                                <td>
                                    <div className='iconContainer'>
                                        <img
                                            onClick={() => openDetalleModal(usuario)}
                                            src={icon.ver}
                                            className='iconver'
                                            title='Ver más'
                                        />
                                        {tienePermiso('usuarios','editar') && user.id === usuario.id && (
                                            <img
                                                onClick={() => openEditModal(usuario)}
                                                src={icon.editar}
                                                className='iconeditar'
                                                title='Editar'
                                            />
                                        )}
                                            <img 
                                            onClick={() => openConfirmDeleteModal(usuario.id)} 
                                            src={icon.eliminar} 
                                            className='iconeliminar' 
                                            title='eliminar'
                                            />
                                        {tienePermiso('usuarios', 'deshabilitar') && user.id !== usuario.id && usuario.estado && (
                                            <img 
                                                onClick={() => disableUser(usuario.id, false)} 
                                                src={icon.deshabilitar} 
                                                className='icondeshabilitar' 
                                                title='deshabilitar'
                                            />
                                        )}
                                        {tienePermiso('usuarios', 'deshabilitar') && user.id !== usuario.id && !usuario.estado && (
                                            <img 
                                                onClick={() => disableUser(usuario.id, true)} 
                                                src={icon.habilitar} 
                                                className='icondeshabilitar' 
                                                title='habilitar'
                                            />
                                        )}
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

export default Usuario;