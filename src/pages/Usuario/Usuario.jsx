import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './usuario.module.css';
import '../../main.css';
import icon from '../../components/iconos/iconos';
import { filterData } from '../../utils/filterData';
import SearchBar from "../../components/searchbart/SearchBar";
import Notification from '../../components/notification/Notification';
import { useNotification } from '../../utils/useNotification';
import { validateField, validationRules } from '../../utils/validation';
import { getCurrentUser } from '../../utils/usernameauth';
import { usePermiso } from '../../hooks/usePermiso';


function Usuario() {
    const [datosOriginales, setDatosOriginales] = useState([]);
    const [datosFiltrados, setDatosFiltrados] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [currentModal, setCurrentModal] = useState(null);
    const [cedulas, setCedulas] = useState([]);
    const [tiposUsuario, setTiposUsuario] = useState([]);
    const user = getCurrentUser();
    const tienePermiso = usePermiso(); 
    const [formData, setFormData] = useState({
        id: '',
        empleado_id: '',
        cedula: '',
        username: '',
        email: '',
        roles_id: '',
        password: '',
        confirmarpassword: ''
    });
    const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);
    const [selectedEmpleadoId, setSelectedEmpleadoId] = useState(null);

    const { notifications, addNotification, removeNotification } = useNotification();
    const itemsPerPage = 8;

    // Reiniciar el modal luego de cerrar
    const resetFormData = () => {
        setFormData({
            id: '',
            empleado_id: '',
            cedula: '',
            username: '',
            email: '',
            roles_id: '',
            password: '',
            confirmarpassword: ''
        });
    };

    const [errors, setErrors] = useState({});

    // Manejar cambios en el formulario
    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData({ ...formData, [id]: value });

        // Validar el campo en tiempo real
        if (id === 'confirmarpassword') {
            const confirmPasswordValidation = validationRules.confirmarpassword.validate(value, formData.password);
            setErrors({ ...errors, confirmarpassword: confirmPasswordValidation.valid ? '' : confirmPasswordValidation.message });
        } else if (validationRules[id]) {
            const { regex, errorMessage } = validationRules[id];
            const { valid, message } = validateField(value, regex, errorMessage);
            setErrors({ ...errors, [id]: valid ? '' : message });
        }
    };

    // Filtrar datos en la barra de búsqueda
    const handleSearch = (searchTerm) => {
        const filtered = filterData(datosOriginales, searchTerm, ['username', 'email', 'tipo_usuario_nombre']);
        setDatosFiltrados(filtered);
    };

    const fetchUsuarios = async () => {
        try {
            const response = await axios.get('http://localhost:4000/usuarios', {
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
            });
            setDatosOriginales(response.data);
            setDatosFiltrados(response.data);
        } catch (error) {
            console.error('Error obteniendo usuarios:', error);
            addNotification('Error al obtener usuarios', 'error');
        }
    };

    useEffect(() => {
        fetchUsuarios();
    }, []);

    const fetchTiposUsuario = async () => {
        try {
            const response = await axios.get('http://localhost:4000/usuarios/tipos', {
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
            });
            setTiposUsuario(response.data);
        } catch (error) {
            console.error('Error obteniendo tipos de usuario:', error);
            addNotification('Error al obtener tipos de usuario', 'error');
        }
    };

    const fetchCedulas = async () => {
        try {
            const response = await axios.get('http://localhost:4000/usuarios/empleados/cedulas', {
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
            });
            setCedulas(response.data);
        } catch (error) {
            console.error('Error obteniendo cédulas:', error);
            addNotification('Error al obtener cédulas', 'error');
        }
    };

    // Manejar el cambio en el select de cédula
    const handleCedulaChange = (e) => {
        const empleado_id = e.target.value;
        const empleado = cedulas.find((c) => c.id === parseInt(empleado_id));
        setFormData((prev) => ({
            ...prev,
            empleado_id,
            cedula: empleado ? empleado.cedula : ''
        }));
    };

    // Crear usuario
    const handleSave = async () => {
        // Validar los campos del formulario
        for (const field in formData) {
            if (!validationRules[field]) continue;
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

        try {
            const response = await axios.post('http://localhost:4000/usuarios', {
                ...formData,
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
            console.error('Error creando usuario:', error);
            addNotification('Error al registrar usuario', 'error');
        }
    };

    // Editar usuario
    const handleEdit = async () => {
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
            const response = await axios.put(`http://localhost:4000/usuarios/${formData.id}`, {
                ...formData,
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
            console.error('Error editando usuario:', error);
            addNotification('Error al actualizar usuario', 'error');
        }
    };

    // deshabilitar 
    const disableUser = async (id, estado) => {
    try {
        await axios.patch(`http://localhost:4000/usuarios/${id}/estado`, { estado }, {
            headers: {
                Authorization : `Bearer ${localStorage.getItem('token')}`
            }
        });

        // Usa el valor real de estado
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
            console.error('Error al cambiar el estado del usuario',error);
            addNotification('Error al cambiar estado del usuario', 'error');
        }
    };

    // Eliminar usuario
    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:4000/usuarios/${id}`, {
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
            });
            setDatosOriginales(datosOriginales.filter((usuario) => usuario.id !== id));
            setDatosFiltrados(datosFiltrados.filter((usuario) => usuario.id !== id));
            addNotification('Usuario eliminado con éxito', 'error');
        } catch (error) {
            console.error('Error eliminando Usuario:', error);
            addNotification('Error al eliminar usuario', 'error');
        }
    };

    // Paginación
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

    // Abrir y cerrar modal
    const openModal = () => {
        resetFormData();
        fetchCedulas();
        fetchTiposUsuario();
        setCurrentModal('usuario');
    };

    const closeModal = () => setCurrentModal(null);

    // Abrir para editar con el modal
    const openEditModal = async (usuario) => {
        await fetchCedulas();
        await fetchTiposUsuario();
        setFormData({
            id: usuario.id,
            empleado_id: usuario.empleado_id || '',
            cedula: usuario.cedula || '',
            username: usuario.username || '',
            email: usuario.email || '',
            roles_id: usuario.roles_id || '',
            password: '',
            confirmarpassword: ''
        });
        setCurrentModal('usuario');
    };

    // Abrir modal de confirmación para eliminar
    const openConfirmDeleteModal = (id) => {
        setSelectedEmpleadoId(id);
        setConfirmDeleteModal(true);
    };
    const closeConfirmDeleteModal = () => {
        setSelectedEmpleadoId(null);
        setConfirmDeleteModal(false);
    };


    // Mostrar nombre y apellido del empleado seleccionado
    const empleadoSeleccionado = cedulas.find((c) => c.id === parseInt(formData.empleado_id));

    return (
        <div className={styles.usuarioContainer}>
            {notifications.map((notification) => (
                <Notification
                    key={notification.id}
                    message={notification.message}
                    type={notification.type}
                    onClose={() => removeNotification(notification.id)}
                />
            ))}

            {/* modal registro y editar */}
            {currentModal === 'usuario' && (
                <div className='modalOverlay'>
                    <div className='modal'>
                        <button className='closeButton' onClick={closeModal}>&times;</button>
                        <h2>{formData.id ? 'Editar Usuario' : 'Registrar Usuario'}</h2>
                        <form className='modalForm'>
                            <div className='formColumns'>
                                <div className='formGroup'>
                                    <label htmlFor="empleado_id">Cédula:</label>
                                    <select
                                        id="empleado_id"
                                        className='select'
                                        value={formData.empleado_id || ''}
                                        onChange={handleCedulaChange}
                                        disabled={!!formData.id}
                                    >
                                        <option value="">Seleccione una cédula</option>
                                        {cedulas.map((empleado) => (
                                            <option key={empleado.id} value={empleado.id}>
                                                {empleado.cedula}
                                            </option>
                                        ))}
                                    </select>
                                        <div className='text_empleado'>
                                            {empleadoSeleccionado ? `${empleadoSeleccionado.nombre} ${empleadoSeleccionado.apellido}` : '\u00A0' /* espacio en blanco */}
                                        </div>

                                    {errors.cedula && <span className='errorText'>{errors.cedula}</span>}
                                </div>

                                <div className='formGroup'>
                                    <label htmlFor="username">Usuario:</label>
                                    <input type="text" id="username" value={formData.username} onChange={handleChange} className='input' placeholder='Rellene el Campo'/>
                                    {errors.username && <span className='errorText'>{errors.username}</span>}
                                </div>

                                <div className='formGroup'>
                                    <label htmlFor="email">Email:</label>
                                    <input type="text" id="email" value={formData.email} onChange={handleChange} className='input' placeholder='Rellene el campo'/>
                                    {errors.email && <span className='errorText'>{errors.email}</span>}
                                </div>

                                <div className='formGroup'>
                                    <label htmlFor="tipo_usuario_id">Tipo de Usuario:</label>
                                    <select
                                        id="roles_id"
                                        className='select'
                                        value={formData.roles_id || ''}
                                        onChange={handleChange}
                                        disabled={!!formData.id}
                                    >
                                        <option value="">Seleccione un tipo de usuario</option>
                                        {tiposUsuario.map((tipo) => (
                                            <option key={tipo.id} value={tipo.id}>
                                                {tipo.nombre}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.roles_id && <span className='errorText'>{errors.roles_id}</span>}
                                </div>

                                <div className='formGroup'>
                                    <label htmlFor="password">Contraseña</label>
                                    <input type="password" id="password" value={formData.password} onChange={handleChange} className='password' placeholder='Rellene el campo'/>
                                    {errors.password && <span className='errorText'>{errors.password}</span>}
                                </div>

                                <div className='formGroup'>
                                    <label htmlFor="confirmarpassword">Confirme:</label>
                                    <input type="password" id="confirmarpassword" value={formData.confirmarpassword} onChange={handleChange} className='password' placeholder='Rellene el campo'/>
                                    {errors.confirmarpassword && <span className='errorText'>{errors.confirmarpassword}</span>}
                                </div>
                            </div>

                            <button 
                                type="button" 
                                className='saveButton' 
                                onClick={formData.id ? handleEdit : handleSave}
                                title={formData.id ? 'Actualizar Usuario' : 'Registrar Usuario'}>
                                    Guardar
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* modal de confirmacion para eliminar */}
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
                            <th>email</th>  
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
                                        {/* Editar y eliminar: solo el propio usuario */}
                                        {tienePermiso('usuarios','editar') && user.id === usuario.id && (
                                            <img
                                                onClick={() => openEditModal(usuario)}
                                                src={icon.editar}
                                                className='iconeditar'
                                                title='Editar'
                                            />
                                        )}

                                        {tienePermiso('usuarios','eliminar') && user.id === usuario.id &&( 
                                            <img 
                                            onClick={() => openConfirmDeleteModal(usuario.id)} 
                                            src={icon.eliminar} 
                                            className='iconeliminar' 
                                            title='eliminar'
                                            />
                                        )}

                                    
                                        {/* Deshabilitar: solo administradores, a cualquier usuario */}
                                        {tienePermiso('usuarios', 'deshabilitar') && user.id !== usuario.id && usuario.estado && (
                                            <img 
                                                onClick={() => disableUser(usuario.id, false)} 
                                                src={icon.deshabilitar} 
                                                className='icondeshabilitar' 
                                                title='deshabilitar'
                                            />
                                        )}
                                        
                                        {/* Habilitar: solo administradores, a cualquier usuario deshabilitado */}
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