import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../../pages/Miusuario/miusuario.module.css';
import '../../main.css';
import icon from '../../components/iconos/iconos';
import Notification from '../../components/notification/Notification';
import { useNotification } from '../../utils/useNotification';
import { validateField, validationRules } from '../../utils/validation';
import { usePermiso } from '../../hooks/usePermiso';
import Spinner from '../../components/spinner/Spinner';
import { BaseUrl } from '../../utils/constans';

function MiUsuario() {
    const [usuario, setUsuario] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmarpassword: ''
    });
    const [errors, setErrors] = useState({});
    const [currentModal, setCurrentModal] = useState(null);
    const [loading, setLoading] = useState(false);
    const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);
    const { notifications, addNotification, removeNotification } = useNotification();
    const tienePermiso = usePermiso();


    useEffect(() => {
        axios.get(`${BaseUrl}/miusuario`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        .then(res => {
            setUsuario(res.data);
            setFormData({
                username: res.data.username || '',
                email: res.data.email || '',
                password: '',
                confirmarpassword: ''
            });
        })
        .catch(() => {
            addNotification('Error al cargar datos de usuario', 'error');
        });
    }, []);

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

    // Editar usuario
    const handleEdit = async () => {
        setLoading(true);
        const camposObligatorios = ['username', 'email'];
        for (const field of camposObligatorios) {
            const { regex, errorMessage } = validationRules[field];
            const { valid, message } = validateField(formData[field], regex, errorMessage);
            if (!valid) {
                addNotification(message, 'warning');
                return;
            }
        }
        if (formData.password) {
            const { regex, errorMessage } = validationRules['password'];
            const { valid, message } = validateField(formData.password, regex, errorMessage);
            if (!valid) {
                addNotification(message, 'warning');
                return;
            }
            const confirmPasswordValidation = validationRules.confirmarpassword.validate(
                formData.confirmarpassword,
                formData.password
            );
            if (!confirmPasswordValidation.valid) {
                addNotification(confirmPasswordValidation.message, 'info');
                return;
            }
        }

        const dataToSend = {
            username: formData.username,
            email: formData.email
        };
        if (formData.password) dataToSend.password = formData.password;

        try {
            await axios.put(`${BaseUrl}/miusuario`, dataToSend, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            addNotification('Usuario actualizado con éxito', 'success');
            setCurrentModal(null);
            // Actualizar localStorage
            const user = JSON.parse(localStorage.getItem('user'));
            localStorage.setItem('user', JSON.stringify({
                ...user,
                username: formData.username,
                email: formData.email
            }));
            // Refrescar usuario
            setUsuario({ ...usuario, ...dataToSend });
        } catch (error) {
            console.error('error editando usuario', error)
            addNotification('Error al actualizar usuario', 'error');
        }finally{
            setLoading(false);
        }
    };

    // Eliminar usuario
    const handleDelete = async () => {
        setLoading(true);
        try {
            await axios.delete(`${BaseUrl}/miusuario`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            addNotification('Usuario eliminado con éxito', 'success');
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            window.location.href = '/';
        } catch (error) {
            console.error('error eliminando usuario', error)
            addNotification('Error al eliminar usuario', 'error');
        }finally{
            setLoading(false);
        }
    };

    // Abrir y cerrar modal
    const openModal = () => setCurrentModal('usuario');
    const closeModal = () => setCurrentModal(null);

    if (!usuario) return <div>Cargando...</div>;

    return (
        <div className={styles.miuserContainer}>
            {loading && <Spinner text="Procesando..." />}
            {notifications.map((notification) => (
                <Notification
                    key={notification.id}
                    message={notification.message}
                    type={notification.type}
                    onClose={() => removeNotification(notification.id)}
                />
            ))}

            {/* Modal editar usuario */}
            {currentModal === 'usuario' && (
                <div className='modalOverlay'>
                    <div className={styles.modal}>
                        <button className='closeButton' onClick={closeModal}>&times;</button>
                        <h2 className={styles.title}>Editar Mi Usuario</h2>
                        {/* Mostrar datos como texto */}
                        <div className={styles.infoGrid}>
                                <div className={styles.infoRow}>
                                <span className={styles.infoLabel}>Cédula:</span>
                                <span className={styles.infoValue}>{usuario.cedula || ''}</span>
                                </div>
                                <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>Nombre:</span>
                                    <span className={styles.infoValue}>{usuario.empleado_nombre || ''}</span>
                                </div>
                                <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>Apellido:</span>
                                    <span className={styles.infoValue}>{usuario.apellido || ''}</span>
                                </div>
                                <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>Cargo:</span>
                                    <span className={styles.infoValue}>{usuario.cargo_nombre || ''}</span>
                                </div>
                        </div>
                        <form className='modalForm'>
                            <div className='formColumns'>
                                <div className={styles.formGroup}>
                                    <label htmlFor="username">Usuario:</label>
                                    <input type="text" id="username" value={formData.username} onChange={handleChange} className='input' />
                                    {errors.username && <span className='errorText'>{errors.username}</span>}
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="email">Email:</label>
                                    <input type="text" id="email" value={formData.email} onChange={handleChange} className='input' />
                                    {errors.email && <span className='errorText'>{errors.email}</span>}
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="password">Nueva Contraseña:</label>
                                    <input type="password" id="password" value={formData.password} onChange={handleChange} className='password' placeholder='Opcional' />
                                    {errors.password && <span className='errorText'>{errors.password}</span>}
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="confirmarpassword">Confirme:</label>
                                    <input type="password" id="confirmarpassword" value={formData.confirmarpassword} onChange={handleChange} className='password' placeholder='Opcional' />
                                    {errors.confirmarpassword && <span className='errorText'>{errors.confirmarpassword}</span>}
                                </div>
                            </div>
                            {tienePermiso('miusuario', 'editar') && (
                                <button type="button" className='saveButton' onClick={handleEdit}>Guardar</button>
                            )}
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de confirmación para eliminar */}
            {confirmDeleteModal && (
                <div className='modalOverlay'>
                    <div className='modal'>
                        <h2>Confirmar Eliminación</h2>
                        <p>¿Estás seguro de que deseas eliminar tu usuario?</p>
                        <div className='modalActions'>
                            {tienePermiso('miusuario', 'eliminar') && (
                                <button className='confirmButton' onClick={handleDelete}>Confirmar</button>
                            )}
                            <button className='cancelButton' onClick={() => setConfirmDeleteModal(false)}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}

            <div className='tableSection'>
                <h2>Mi Usuario</h2>
                <table className='table'>
                    <thead>
                        <tr>
                            <th>Cédula</th>
                            <th>Nombre</th>
                            <th>Apellido</th>
                            <th>Usuario</th>
                            <th>Email</th>
                            <th>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>{usuario.cedula}</td>
                            <td>{usuario.empleado_nombre}</td>
                            <td>{usuario.apellido}</td>
                            <td>{usuario.username}</td>
                            <td>{usuario.email}</td>
                            <td>
                                <div className='iconContainer'>
                                    {tienePermiso('miusuario', 'editar') && (
                                        <img
                                            onClick={openModal}
                                            src={icon.editar}
                                            className='iconeditar'
                                            title='Editar'
                                            style={{ cursor: 'pointer' }}
                                        />
                                    )}
                                    {/* {tienePermiso('miusuario', 'eliminar') && (
                                        <img
                                            onClick={() => setConfirmDeleteModal(true)}
                                            src={icon.eliminar}
                                            className='iconeliminar'
                                            title='Eliminar'
                                            style={{ cursor: 'pointer', marginLeft: 10 }}
                                        />
                                    )} */}
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default MiUsuario;