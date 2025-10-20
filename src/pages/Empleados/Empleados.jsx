import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SingleSelect from '../../components/selectmulti/SingleSelect';
import '../../main.css';
import icon from '../../components/iconos/iconos';
import { filterData } from '../../utils/filterData';
import SearchBar from "../../components/searchbart/SearchBar";
import { useNotification } from '../../utils/NotificationContext';
import { validateField, validationRules } from '../../utils/validation';
import Spinner from '../../components/spinner/Spinner'; 
import { BaseUrl } from '../../utils/constans';


function Empleado() {
    const [loading, setLoading] = useState(false);
    const [datosOriginales, setDatosOriginales] = useState([]); 
    const [datosFiltrados, setDatosFiltrados] = useState([]); 
    const [cargos, setCargos] = useState([]);
    const [imagenesEmpleado, setImagenesEmpleado] = useState([]);
    const [modalImagenes, setModalImagenes] = useState({ abierto: false, empleado: null });
    const [imagenesCargando, setImagenesCargando] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [currentModal, setCurrentModal] = useState(null);
    const CEDULA_PREFIJOS = ['V-', 'E-', 'G-', 'J-', 'P-'];
    const [confirmDeleteImagenModal, setConfirmDeleteImagenModal] = useState({ abierto: false, imagen: null });
    const cedulaPrefijosOptions = CEDULA_PREFIJOS.map(p => ({ value: p, label: p }));
    const [cedulaPrefijo, setCedulaPrefijo] = useState({ value: 'V-', label: 'V-' });
    const [pdfUrl, setPdfUrl] = useState(null);
    const [pdfFileName, setPdfFileName] = useState('');
    const [formData, setFormData] = useState({
        cedula: '',
        nombre: '',
        apellido: '',
        contacto: '',
        cargo_id: null
    });
    const [confirmDeleteModal, setConfirmDeleteModal] = useState(false); 
    const [selectedEmpleadoId, setSelectedEmpleadoId] = useState(null); 
    const [detalleModal, setDetalleModal] = useState({ abierto: false, empleado: null });
    const { addNotification } = useNotification();
    const itemsPerPage = 8;
    const [errors, setErrors] = useState({});

    
    const resetFormData = () => {
        setFormData({
            cedula: '',
            nombre: '',
            apellido: '',
            contacto: '',
            cargo_id: null
        });
        setErrors({});
    };

    const openConfirmDeleteImagenModal = (imgName) => {
        setConfirmDeleteImagenModal({ abierto: true, imagen: imgName });
    };

    const closeConfirmDeleteImagenModal = () => {
        setConfirmDeleteImagenModal({ abierto: false, imagen: null });
    };
    
    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData({ ...formData, [id]: value });

        if (validationRules[id]) {
            const { regex, errorMessage } = validationRules[id];
            const { valid, message } = validateField(value, regex, errorMessage);
            setErrors({ ...errors, [id]: valid ? '' : message });
        }
    };

    // Filtrar datos en la barra de búsqueda
    const handleSearch = (searchTerm) => {
        const filtered = filterData(datosOriginales, searchTerm, ['cedula', 'nombre', 'apellido', 'contacto', 'cargo_nombre']);
        setDatosFiltrados(filtered);
    };

    
    useEffect(() => {
        const fetchEmpleados = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${BaseUrl}/empleados`, {
                    headers: {
                        Authorization : `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setDatosOriginales(response.data);
                setDatosFiltrados(response.data);
            } catch (error) {
                const errorResponse = error.response ? error.response.data : error.message;
                console.error('Error obteniendo empleados:', errorResponse);
                addNotification('Error al obtener empleados', 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchEmpleados();
    }, []);

    
    useEffect(() => {
        const fetchCargos = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${BaseUrl}/empleados/cargos`, {
                    headers: {
                        Authorization : `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setCargos(response.data);
            } catch (error) {
                const errorResponse = error.response ? error.response.data : error.message;
                console.error('Error obteniendo cargos:', errorResponse);
                addNotification('Error al obtener cargos', 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchCargos();
    }, []);

    const fetchImagenesEmpleado = async (empleadoId) => {
        setImagenesCargando(true);
        try {
            const res = await axios.get(`${BaseUrl}/empleados/imagenes/${empleadoId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setImagenesEmpleado(res.data);
        } catch (error) {
            console.error('Error al obtener imagenes', error);
            addNotification('No Han subido imagenes Para Mostrar', 'warning');
        } finally {
            setImagenesCargando(false);
        }
    };
    
    const handleSave = async () => {
        if (!formData.cargo_id || !formData.cargo_id.value) {
            addNotification('Debe seleccionar un cargo', 'warning');
            return;
        }
        for (const field in formData) {
            if (!validationRules[field]) continue;
            const { regex, errorMessage } = validationRules[field];
            const { valid, message } = validateField(formData[field], regex, errorMessage);
            if (!valid) {
                addNotification(message, 'warning');
                setErrors(prev => ({ ...prev, [field]: message }));
                return;
            }
        }
        setLoading(true);
        try {
            const payload = {
                ...formData,
                cedula: `${cedulaPrefijo.value}${formData.cedula}`.replace(/--+/g, '-').trim(),
                cargo_id: formData.cargo_id?.value || ''
            };
            const response = await axios.post(`${BaseUrl}/empleados`, payload, {
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
            });
            setDatosOriginales([response.data, ...datosOriginales]);
            setDatosFiltrados([response.data, ...datosFiltrados]);
            closeModal();
            addNotification('Empleado registrado con éxito', 'success');
        } catch (error) {
            const backendMessage = error.response?.data?.message;
            const status = error.response?.status;
            console.error('Error creando empleado:', error.response?.data || error.message);

            addNotification(backendMessage || 'Error al registrar empleado', 'error');

            if (status === 409 && backendMessage) {
                setErrors(prev => ({ ...prev, cedula: backendMessage }));
            }
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async () => {
        if (!formData.cargo_id || !formData.cargo_id.value) {
            addNotification('Debe seleccionar un cargo', 'warning');
            return;
        }
        const camposObligatorios = ['cedula', 'nombre', 'apellido'];
        for (const field of camposObligatorios) {
            const { regex, errorMessage } = validationRules[field];
            const { valid, message } = validateField(formData[field], regex, errorMessage);
            if (!valid) {
                addNotification(message, 'info');
                setErrors(prev => ({ ...prev, [field]: message }));
                return;
            }
        }
        setLoading(true);
        try {
            const payload = {
                ...formData,
                cedula: `${cedulaPrefijo.value}${formData.cedula}`.replace(/--+/g, '-').trim(),
                cargo_id: formData.cargo_id?.value || ''
            };
            const response = await axios.put(`${BaseUrl}/empleados/${formData.id}`, payload, {
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
            });
            const updatedData = datosOriginales.map((empleado) =>
                empleado.id === response.data.id ? response.data : empleado
            );
            setDatosOriginales(updatedData);
            setDatosFiltrados(updatedData);
            closeModal();
            addNotification('Empleado actualizado con éxito', 'success');
        } catch (error) {
            const backendMessage = error.response?.data?.message;
            const status = error.response?.status;
            console.error('Error editando empleado:', error.response?.data || error.message);

            addNotification(backendMessage || 'Error al actualizar empleado', 'error');

            if (status === 409 && backendMessage) {
                setErrors(prev => ({ ...prev, cedula: backendMessage }));
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        setLoading(true);
        try {
            await axios.delete(`${BaseUrl}/empleados/${id}`, {
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
            });
            setDatosOriginales(datosOriginales.filter((empleado) => empleado.id !== id));
            setDatosFiltrados(datosFiltrados.filter((empleado) => empleado.id !== id));
            addNotification('Empleado eliminado con éxito', 'success');
        } catch (error) {
            console.error('Error eliminando empleado:', error);
            addNotification('Error al eliminar empleado', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSubirImagenes = async (e) => {
        const files = e.target.files;
        if (!files || !files.length) return;

        if (imagenesEmpleado.length + files.length > 5) {
            addNotification('Solo se permiten máximo 5 imágenes por empleado.', 'warning');
            return;
        }
        const formData = new FormData();
        for (let file of files) formData.append('imagenes', file);
        setImagenesCargando(true);
        try {
            await axios.post(
                `${BaseUrl}/empleados/${modalImagenes.empleado.id}/imagenes`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            fetchImagenesEmpleado(modalImagenes.empleado.id);
            addNotification('Imágenes subidas correctamente', 'success');
        } catch (error) {
            console.error('Error al subir imagen', error);
            addNotification('Error al subir imágenes', 'error');
        } finally {
            setImagenesCargando(false);
        }
    };

    const handleDeleteImagenConfirm = async () => {
        if (!confirmDeleteImagenModal.imagen) return;
        setImagenesCargando(true);
        try {
            await axios.delete(
                `${BaseUrl}/empleados/${modalImagenes.empleado.id}/imagenes/${confirmDeleteImagenModal.imagen}`,
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            fetchImagenesEmpleado(modalImagenes.empleado.id);
            addNotification('Imagen eliminada', 'success');
        } catch (error) {
            console.error('Error al eliminar imagen del empleado', error);
            addNotification('Error al eliminar imagen del empleado', 'error');
        } finally {
            setImagenesCargando(false);
            closeConfirmDeleteImagenModal();
        }
    };



const handleFichaEmpleadoPDF = async (empleado) => {
    setLoading(true);
    try {
        const url = `${BaseUrl}/empleados/ficha/${empleado.id}/pdf`;
        setPdfUrl(url); // Para previsualizar en <iframe>
        setPdfFileName(`Ficha_Empleado_${empleado.cedula}.pdf`);
    } catch (error) {
        console.error(error);
        addNotification('No se pudo generar la ficha', 'error');
    } finally {
        setLoading(false);
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

    const splitCedula = (str) => {
        const m = String(str || '').match(/^([VEGJP])[-]?(\d{1,15}(-\d{1,2})?)$/i);
        return {
            tipo: m ? `${m[1].toUpperCase()}-` : 'V-',
            numero: m ? m[2] : ''
        };
    };

    const openImagenesModal = (empleado) => {
        setModalImagenes({ abierto: true, empleado });
        fetchImagenesEmpleado(empleado.id);
    };
    const closeImagenesModal = () => {
        setModalImagenes({ abierto: false, empleado: null });
        setImagenesEmpleado([]);
    };

    // Abrir y cerrar modales
    const openModal = () => {
        resetFormData();
        setCurrentModal('empleado');
    };
    const closeModal = () => setCurrentModal(null);

    const openEditModal = (empleado) => {
        const cedulaParts = splitCedula(empleado.cedula || '');
        setCedulaPrefijo({ value: cedulaParts.tipo, label: cedulaParts.tipo });
        setFormData({
            ...empleado,
            cedula: cedulaParts.numero,
            cargo_id: empleado.cargo_id
            ? { value: String(empleado.cargo_id), label: cargos.find(c => String(c.id) === String(empleado.cargo_id))?.nombre || '' }
            : null
        });
        setErrors({});
        setCurrentModal('empleado');
    };

    const openConfirmDeleteModal = (id) => {
        setSelectedEmpleadoId(id);
        setConfirmDeleteModal(true);
    };

    const closeConfirmDeleteModal = () => {
        setSelectedEmpleadoId(null);
        setConfirmDeleteModal(false);
    };

    const openDetalleModal = (empleado) => setDetalleModal({ abierto: true, empleado: empleado });
    const closeDetalleModal = () => setDetalleModal({ abierto: false, empleado: null });

    return (
        <div className='mainContainer'>
            {loading && <Spinner text="Procesando..." />}
            
            {modalImagenes.abierto && (
                <div className="modalOverlay">
                    <div className="modal">
                    <button className="closeButton" onClick={closeImagenesModal}>&times;</button>
                    <h2>Imágenes de {modalImagenes.empleado?.nombre} {modalImagenes.empleado?.apellido}</h2>

                    {/* Input oculto y label con ícono */}
                    <input
                        type="file"
                        id="imagenes-empleado"
                        className="input-imagen"
                        multiple
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleSubirImagenes}
                        disabled={imagenesCargando}
                        style={{ display: 'none' }}
                    />
                    <label htmlFor="imagenes-empleado" className="label-imagen" style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer', marginBottom: 8 }}>
                        <img src={icon.pdf3} alt="Subir" className="iconSubir" style={{ width: 18, marginRight: 6 }} />
                        Subir Imágenes
                    </label>
                    <div style={{ fontSize: 12, color: '#6C757D', marginBottom: 8 }}>
                        Máx 5 imágenes por empleado, formatos: JPG/PNG/WebP, tamaño por archivo ≤ 2MB.
                    </div>

                    {/* Miniaturas de imágenes */}
                    <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                        {imagenesCargando && <Spinner text="Cargando imágenes..." />}
                        {imagenesEmpleado.length === 0 && !imagenesCargando && (
                        <span style={{ color: '#888' }}>Sin imágenes</span>
                        )}
                        {imagenesEmpleado.map((img, idx) => (
                            <div key={img.id} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <img
                                src={`${BaseUrl}/uploads/empleados/${img.imagen}`}
                                alt={`Empleado-${idx}`}
                                style={{ maxWidth: 120, maxHeight: 120, border: '1px solid #90ce6f', borderRadius: 8, objectFit: 'cover' }}
                                />
                                <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                                <button
                                    type="button"
                                    onClick={() => openConfirmDeleteImagenModal(img.imagen)}
                                    title="Quitar imagen"
                                    className="closeButton2"
                                >×</button>
                                <a
                                    href={`${BaseUrl}/uploads/empleados/${img.imagen}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-estandar"
                                    style={{ padding: '2px 8px', fontSize: 12, textDecoration: 'none' }}
                                    title="Abrir imagen en nueva ventana"
                                >
                                    Abrir
                                </a>
                                </div>
                            </div>
                            ))}
                    </div>
                    </div>
                </div>
                )}

                {confirmDeleteImagenModal.abierto && (
                    <div className="modalOverlay">
                        <div className="modal">
                            <h2>Confirmar Eliminación</h2>
                            <p>¿Estás seguro de que deseas eliminar esta imagen?</p>
                            <div style={{ textAlign: 'center', margin: '12px 0' }}>
                                <img
                                    src={`${BaseUrl}/uploads/empleados/${confirmDeleteImagenModal.imagen}`}
                                    alt="Imagen a eliminar"
                                    style={{ maxWidth: 120, maxHeight: 120, border: '1px solid #ccc', borderRadius: 8, objectFit: 'cover' }}
                                />
                            </div>
                            <div className="modalActions">
                                <button className="cancelButton" onClick={closeConfirmDeleteImagenModal}>Cancelar</button>
                                <button className="confirmButton" onClick={handleDeleteImagenConfirm}>Confirmar</button>
                            </div>
                        </div>
                    </div>
                )}

            {/* Modal de detalle */}
            {detalleModal.abierto && detalleModal.empleado && (
                <div className='modalOverlay'>
                    <div className='modal'>
                        <button className='closeButton' onClick={closeDetalleModal}>&times;</button>
                        <h2>Detalles del Empleado</h2>
                        <form className='modalForm'>
                            <div className='formColumns'>
                                <div className='formGroup'>
                                    <label htmlFor="cedula">Cédula:</label>
                                    <input
                                        type="text"
                                        id="cedula"
                                        value={detalleModal.empleado.cedula || ''}
                                        className='input'
                                        disabled
                                    />
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="nombre">Nombre:</label>
                                    <input
                                        type="text"
                                        id="nombre"
                                        value={detalleModal.empleado.nombre || ''}
                                        className='input'
                                        disabled
                                    />
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="apellido">Apellido:</label>
                                    <input
                                        type="text"
                                        id="apellido"
                                        value={detalleModal.empleado.apellido || ''}
                                        className='input'
                                        disabled
                                    />
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="contacto">Contacto:</label>
                                    <input
                                        type="text"
                                        id="contacto"
                                        value={detalleModal.empleado.contacto || ''}
                                        className='input'
                                        disabled
                                    />
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="cargo_id">Cargo:</label>
                                    <SingleSelect
                                        options={cargos.map(cargo => ({ value: String(cargo.id), label: cargo.nombre }))}
                                        value={ detalleModal.empleado.cargo_id ? { value: String(detalleModal.empleado.cargo_id), label: cargos.find(c => String(c.id) === String(detalleModal.empleado.cargo_id))?.nombre || '' }
                                            : null
                                    }
                                        isDisabled={true}
                                    />
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Modal registro y editar */}
            {currentModal === 'empleado' && (
                <div className='modalOverlay'>
                    <div className='modal'>
                        <button className='closeButton' onClick={closeModal}>&times;</button>
                        <h2>{formData.id ? 'Editar Empleado' : 'Registrar Empleado'}</h2>
                        <form className='modalForm'>
                            <div className='formColumns'> 
                                <div className='formGroup'>
                                    <label htmlFor="cedula"><span className='Unique' title='Campo Obligatorio'>*</span>Cédula:</label>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <SingleSelect
                                        options={cedulaPrefijosOptions}
                                        value={cedulaPrefijo}
                                        onChange={opt => setCedulaPrefijo(opt || { value: 'V-', label: 'V-' })}
                                        placeholder="Prefijo"
                                        />
                                        <input
                                        type="text"
                                        id="cedula"
                                        value={formData.cedula}
                                        onChange={e => {
                                            // Permite números y guiones
                                            const v = e.target.value.replace(/[^0-9-]/g, '');
                                            setFormData(prev => ({ ...prev, cedula: v }));
                                        }}
                                        className='input'
                                        placeholder='Ej: 14897582'
                                        style={{ flex: 1 }}
                                        />
                                    </div>
                                    {errors.cedula && <span className='errorText'>{errors.cedula}</span>}
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="nombre"><span className='Unique' title='Campo Obligatorio'>*</span>Nombre:</label>
                                    <input type="text" id="nombre" value={formData.nombre} onChange={handleChange} className='input' placeholder='Rellene el Campo'/>
                                    {errors.nombre && <span className='errorText'>{errors.nombre}</span>}
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="apellido"><span className='Unique' title='Campo Obligatorio'>*</span>Apellido:</label>
                                    <input type="text" id="apellido" value={formData.apellido} onChange={handleChange} className='input' placeholder='Rellene el Campo'/>
                                    {errors.apellido && <span className='errorText'>{errors.apellido}</span>}
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="contacto"><span className='Unique' title='Campo Obligatorio'>*</span>Contacto:</label>
                                    <input type="text" id="contacto" value={formData.contacto} onChange={handleChange} className='input' placeholder='04**-*******'/>
                                    {errors.contacto && <span className='errorText'>{errors.contacto}</span>}
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="cargo_id"><span className='Unique' title='Campo Obligatorio'>*</span>Cargo:</label>
                                    <SingleSelect
                                        options={cargos.map(cargo => ({ value: String(cargo.id), label: cargo.nombre }))}
                                        value={formData.cargo_id}
                                        onChange={val => setFormData(prev => ({ ...prev, cargo_id: val }))}
                                        placeholder="Seleccione un tipo"
                                    />
                                    {errors.cargo_id && <span className='errorText'>{errors.cargo_id}</span>}
                                </div>
                            </div>
                            <button 
                                type="button" 
                                className='saveButton' 
                                onClick={formData.id ? handleEdit : handleSave}
                                title={formData.id ? 'Actualizar Empleados' : 'Registrar Empleados'}
                                disabled={loading} 
                            >
                                {loading ? 'Procesando...' : 'Guardar'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {pdfUrl && (
                <div className="modalOverlay">
                    <div className="modalDetalle">
                        <button className="closeButton" onClick={() => setPdfUrl(null)}>&times;</button>
                        <iframe src={pdfUrl} width="100%" height="600px" title="Vista previa PDF" />
                        <a
                            href={pdfUrl}
                            download={pdfFileName}
                            className="btn-estandar"
                            style={{ marginTop: 16, display: 'inline-block', textDecoration: 'none' }}
                        >
                            Descargar PDF
                        </a>
                    </div>
                </div>
            )}

            {/* Modal de confirmación para eliminar */}
            {confirmDeleteModal && (
                <div className='modalOverlay'>
                    <div className='modal'>
                        <h2>Confirmar Eliminación</h2>
                        <p>¿Estás seguro de que deseas eliminar este empleado?</p>
                        <div className='modalActions'>
                            <button
                                className='cancelButton'
                                onClick={closeConfirmDeleteModal}
                            >
                                Cancelar
                            </button>
                            <button
                                className='confirmButton'
                                onClick={() => {
                                    handleDelete(selectedEmpleadoId);
                                    closeConfirmDeleteModal();
                                }}
                            >
                                Confirmar
                            </button>
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
                    <h2>Empleados</h2>
                    <div className='searchContainer'>
                        <SearchBar onSearch={handleSearch} />
                        <img src={icon.lupa} alt="Buscar" className='iconlupa' />
                    </div>
                </div>
                <table className='table'>
                    <thead>
                        <tr>
                            <th>Nº</th>
                            <th>Cédula</th>
                            <th>Nombre</th>
                            <th>Apellido</th>
                            <th>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentData.map((empleado, idx) => (
                            <tr key={empleado.id}>
                                <td>{indexOfFirstItem + idx + 1}</td>
                                <td>{empleado.cedula}</td>
                                <td>{empleado.nombre}</td>
                                <td>{empleado.apellido}</td>
                                <td>
                                    <div className='iconContainer'>
                                        <img
                                            onClick={() => openDetalleModal(empleado)}
                                            src={icon.ver}
                                            className='iconver'
                                            title='Ver más'
                                        />
                                        <img
                                            onClick={() => openImagenesModal(empleado)}
                                            src={icon.picture}
                                            className='iconver'
                                            title='Ver Imagenes'
                                        />
                                        <img
                                            onClick={() => handleFichaEmpleadoPDF(empleado)}
                                            src={icon.pdf2}
                                            className='iconeditar'
                                            title='Descargar Ficha de Empleado'
                                        />
                                        <img
                                            onClick={() => openEditModal(empleado)}
                                            src={icon.editar}
                                            className='iconeditar'
                                            title='Editar'
                                        />
                                        <img 
                                            onClick={() => openConfirmDeleteModal(empleado.id)} 
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

export default Empleado;