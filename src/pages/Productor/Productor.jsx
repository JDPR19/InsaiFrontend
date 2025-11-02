import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../main.css';
import icon from '../../components/iconos/iconos';
import { filterData } from '../../utils/filterData';
import SearchBar from "../../components/searchbart/SearchBar";
import { useNotification } from '../../utils/NotificationContext';
import { validateField, validationRules } from '../../utils/validation';
import Spinner from '../../components/spinner/Spinner';
import { BaseUrl } from '../../utils/constans';
import { exportToPDF, exportToExcel } from '../../utils/exportUtils';
import { buildProductorFichaBlob } from '../../components/pdf/Ficha';
import AyudaTooltip from '../../components/ayudanteinfo/AyudaTooltip';
import { usePermiso } from '../../hooks/usePermiso';
import SingleSelect from '../../components/selectmulti/SingleSelect';

function Productor() {
    const navigate = useNavigate();
    const tienePermiso = usePermiso();
    const [step, setStep] = useState(1);
    const [recentProductor, setRecentProductor] = useState(null);
    const [datosOriginales, setDatosOriginales] = useState([]);
    const [datosFiltrados, setDatosFiltrados] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [currentModal, setCurrentModal] = useState(null);
    const [detalleModal, setDetalleModal] = useState({ abierto: false, productor: null });
    const [pdfUrl, setPdfUrl] = useState(null);
    const CEDULA_PREFIJOS = ['V-', 'E-', 'G-', 'J-', 'P-'];
    const cedulaPrefijosOptions = CEDULA_PREFIJOS.map(p => ({ value: p, label: p }));
    const [cedulaPrefijo, setCedulaPrefijo] = useState({ value: 'V-', label: 'V-' });
    const [pdfFileName, setPdfFileName] = useState('');
    const { fileName } = getPDFInfo();
    const excelFileName = fileName.replace('.pdf', '.xlsx');
    const [formData, setFormData] = useState({
        id: '',
        codigo: '',
        cedula: '',
        nombre: '',
        apellido: '',
        contacto: '',
        email: ''
    });
    const [errors, setErrors] = useState({});
    const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);
    const [selectedProductorId, setSelectedProductorId] = useState(null);
    const { addNotification } = useNotification();
    const itemsPerPage = 8;
    const [totales, setTotales] = useState({
        total: 0,
        sinPropiedad: 0,
        maxPropiedades: 0,
        topProducers: [] 
    });

    const splitCedula = (str) => {
        const m = String(str || '').match(/^([VEGJP])[-]?(\d{1,15}(-\d{1,2})?)$/i);
        return {
            tipo: m ? `${m[1].toUpperCase()}-` : 'V-',
            numero: m ? m[2] : ''
        };
    };

    // Columnas para PDF/Excel
    const columnsProductor = [
        { header: 'Código', key: 'codigo' },
        { header: 'Cédula', key: 'cedula' },
        { header: 'Nombre', key: 'nombre' },
        { header: 'Apellido', key: 'apellido' },
        { header: 'Contacto', key: 'contacto' },
        { header: 'Correo', key: 'email' },
        { header: 'Propiedades', key: 'total_propiedades' }
    ];

    function getPDFInfo() {
        if (datosFiltrados.length === datosOriginales.length) {
            return { fileName: 'Productores_Total.pdf', title: 'Listado de Todos los Productores' };
        }
        if (datosFiltrados.length > 0 && datosFiltrados.every(p => (p.total_propiedades || 0) === 0)) {
            return { fileName: 'Productores_Sin_Propiedades.pdf', title: 'Productores sin Propiedades' };
        }
        const maxLocal = datosFiltrados.length
            ? Math.max(...datosFiltrados.map(p => p.total_propiedades || 0))
            : 0;
        if (maxLocal > 0 && datosFiltrados.every(p => (p.total_propiedades || 0) === maxLocal)) {
            return { fileName: 'Productores_con_mas_Propiedades.pdf', title: 'Productores con Más Propiedades' };
        }
        return { fileName: 'Productores_Filtrados.pdf', title: 'Listado de Productores Filtrados' };
    }

    const handlePreviewPDF = () => {
        const { fileName, title } = getPDFInfo();
        const blob = exportToPDF({
            data: datosFiltrados,
            columns: columnsProductor,
            fileName,
            title,
            preview: true
        });
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
        setPdfFileName(fileName);
    };

    const handleFichaPDF = async (prod) => {
        try {
            // 1) Traer productor completo + propiedades
            const { data } = await axios.get(`${BaseUrl}/productor/${prod.id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            const productorDet = data || prod;
            const props = Array.isArray(data?.propiedades) ? data.propiedades : [];

            // 2) Normalizar propiedades para el PDF
            const propiedades = props.map((p) => {
            const ubicacion = [
                p.estado_nombre,
                p.municipio_nombre,
                p.parroquia_nombre,
                p.sector_nombre,
                p.ubicacion || p.direccion
            ].filter(Boolean).join(' / ');

            const cultivosDetalle = [
                p.cultivos_nombres || '',
            ].filter(Boolean).join(' ');

            return {
                id: p.id,
                codigo: p.codigo || p.id,
                rif: p.rif || '',
                nombre: p.nombre || '',
                tipo: p.tipo_propiedad_nombre || '',
                cultivo: cultivosDetalle,                       
                cultivos_cientificos: p.cultivos_cientificos || '',
                tipos_cultivo: p.tipos_cultivo_nombres || '',
                hectareas: p.hectareas ?? '',
                ubicacion,
                sitios_asociados: p.sitios_asociados || '',
                posee_certificado: p.posee_certificado || '',
                estado_propiedad: p.estado_propiedad || ''
            };
            });

            // 3) Generar PDF
            const blob = await buildProductorFichaBlob({
            productor: productorDet,
            propiedades,
            // logoUrl: '/assets/logo-sisic.png'
            });

            // 4) Liberar blob previo y abrir visor
            const url = URL.createObjectURL(blob);
            try { if (pdfUrl) URL.revokeObjectURL(pdfUrl); } catch (error) {console.error(error);}
            setPdfUrl(url);
            setPdfFileName(`Ficha_Productor_${productorDet.codigo || productorDet.cedula || productorDet.id}.pdf`);
        } catch (e) {
            console.error('Error generando ficha PDF', e);
            addNotification('No se pudo generar la ficha PDF', 'error');
        }
    };

    const fetchProductores = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${BaseUrl}/productor`, {
                headers: { Authorization : `Bearer ${localStorage.getItem('token')}` }
            });
            const data = Array.isArray(response.data) ? response.data : [];

            setDatosOriginales(data);
            setDatosFiltrados(data);
            setCurrentPage(1);

            const sinPropiedad = data.filter(p => (p.total_propiedades || 0) === 0);
            const maxProp = data.length
                ? Math.max(...data.map(p => p.total_propiedades || 0))
                : 0;
            const topProducers = maxProp > 0
                ? data.filter(p => (p.total_propiedades || 0) === maxProp)
                : [];

            setTotales({
                total: data.length,
                sinPropiedad: sinPropiedad.length,
                maxPropiedades: maxProp,
                topProducers
            });
        } catch (error) {
            console.error('Error obteniendo todos los productores', error);
            addNotification('Error al obtener productores', 'error');
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchProductores();
    }, []);

    const resetFormData = () => {
        setFormData({
            id: '',
            codigo: '',
            cedula: '',
            nombre: '',
            apellido: '',
            contacto: '',
            email: ''
        });
        setErrors({});
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
        const filtered = filterData(
            datosOriginales,
            searchTerm,
            ['codigo', 'cedula', 'nombre', 'apellido', 'contacto', 'email']
        );
        setDatosFiltrados(filtered);
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const payload = {
                codigo: formData.codigo,
                cedula: `${cedulaPrefijo.value}${formData.cedula}`.replace(/--+/g, '-').trim(),
                nombre: formData.nombre,
                apellido: formData.apellido,
                contacto: formData.contacto || null,
                email: formData.email || null,
            };
            const resp = await axios.post(`${BaseUrl}/productor`, payload, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            addNotification('Productor registrado', 'success');
            setRecentProductor(resp.data); // guardar el creado
            await fetchProductores();       // refrescar listado
            setStep(2);                     // pasar a la segunda sección del modal
        } catch (err) {
            const backendMessage = err?.response?.data?.message;
            const status = err?.response?.status;
            console.error('Error registrando productor:', err?.response?.data || err?.message);

            addNotification(backendMessage || 'Error al registrar productor', 'error');

            if (status === 409 && backendMessage) {
                const lower = backendMessage.toLowerCase();
                setErrors(prev => ({
                    ...prev,
                    ...(lower.includes('cédula') || lower.includes('cedula') ? { cedula: backendMessage } : {}),
                    ...(lower.includes('código') || lower.includes('codigo') ? { codigo: backendMessage } : {}),
                    ...(lower.includes('correo') || lower.includes('email') ? { email: backendMessage } : {})
                }));
            }
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async () => {
    if (!formData.id) { addNotification('Falta ID de productor', 'warning'); return; }
    setLoading(true);
    try {
        const payload = {
        codigo: formData.codigo,
        cedula: `${cedulaPrefijo.value}${formData.cedula}`.replace(/--+/g, '-').trim(),
        nombre: formData.nombre,
        apellido: formData.apellido,
        contacto: formData.contacto || null,
        email: formData.email || null,
        };
        await axios.put(`${BaseUrl}/productor/${formData.id}`, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        addNotification('Productor actualizado', 'success');
        await fetchProductores();
        closeModal();
    } catch (err) {
        const backendMessage = err?.response?.data?.message;
            const status = err?.response?.status;
            const field = err?.response?.data?.field;
            console.error('Error actualizando productor:', err?.response?.data || err?.message);

            addNotification(backendMessage || 'Error al actualizar productor', 'error');

            if (status === 409) {
            if (field) {
                setErrors(prev => ({ ...prev, [field]: backendMessage || 'Valor duplicado' }));
            } else if (backendMessage) {
                const lower = backendMessage.toLowerCase();
                setErrors(prev => ({
                    ...prev,
                    ...(lower.includes('cédula') || lower.includes('cedula') ? { cedula: backendMessage } : {}),
                    ...(lower.includes('código') || lower.includes('codigo') ? { codigo: backendMessage } : {})
                }));
            }
        }
    } finally {
        setLoading(false);
    }
    };

    const handleDelete = async (id) => {
        setLoading(true);
        try {
            await axios.delete(`${BaseUrl}/productor/${id}`, {
                headers: { Authorization : `Bearer ${localStorage.getItem('token')}` }
            });
            fetchProductores();
            addNotification('Productor eliminado con éxito', 'success');
        } catch (error) {
            console.error('Error eliminando productor', error);
            addNotification('Error al eliminar productor', 'error');
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
        setErrors({});
        setRecentProductor(null);
        setStep(1);
        setCurrentModal('productor');
    };

    const closeModal = (limpiarUrl = true) => {
        setCurrentModal(null);
        setStep(1);
        setRecentProductor(null);
        if (limpiarUrl && window.location.search) {
        navigate(window.location.pathname, { replace: true });
    }
    };

    const openEditModal = (productor) => {
        const cedulaParts = splitCedula(productor.cedula || '');
        setCedulaPrefijo({ value: cedulaParts.tipo, label: cedulaParts.tipo });
        setFormData({
            id: productor.id,
            codigo: productor.codigo || '',
            cedula: cedulaParts.numero,
            nombre: productor.nombre || '',
            apellido: productor.apellido || '',
            contacto: productor.contacto || '',
            email: productor.email || ''
        });
        setErrors({});
        setStep(1);
        setCurrentModal('productor');
    };

    const goToNextScreen = () => {
        
        localStorage.setItem('seccionOneTab', 'propiedades');

        const params = new URLSearchParams();
        params.set('tab', 'propiedades');
        if (recentProductor?.id) params.set('productorId', String(recentProductor.id));

        navigate(`/SeccionOne?${params.toString()}`);
        closeModal(false);
    };

    const openConfirmDeleteModal = (id) => {
        setSelectedProductorId(id);
        setConfirmDeleteModal(true);
    };
    const closeConfirmDeleteModal = () => {
        setSelectedProductorId(null);
        setConfirmDeleteModal(false);
    };

    const openDetalleModal = (productor) => setDetalleModal({ abierto: true, productor: productor });
    const closeDetalleModal = () => setDetalleModal({ abierto: false, productor: null });

    return (
        <div className='mainContainer'>
            {loading && <Spinner text="Procesando..." />}
            {/* cartas */}
            <div className='cardsContainer'>
                <div
                    className='card'
                    title='Todos los Productores'
                    onClick={() => setDatosFiltrados(datosOriginales)}
                >
                    <span className='cardNumber'>{totales.total}</span>
                    <p>Total</p>
                </div>

                {/* <div
                    className='card'
                    title='Productores sin propiedades asociadas'
                    onClick={() => setDatosFiltrados(datosOriginales.filter(p => (p.total_propiedades || 0) === 0))}
                >
                    <span className='cardNumber'>{totales.sinPropiedad}</span>
                    <p>Sin Propiedad</p>
                </div> */}

                <div
                    className='card'
                    title={
                        totales.topProducers.length
                            ? `Máx: ${totales.maxPropiedades} propiedades\n` +
                            totales.topProducers
                                .map(tp => `${tp.codigo || tp.id} - ${tp.nombre} ${tp.apellido || ''}`.trim())
                                .join('\n')
                            : 'Sin productores con propiedades'
                    }
                    onClick={() => setDatosFiltrados(totales.topProducers)}
                    style={{ cursor: totales.topProducers.length ? 'pointer' : 'default' }}
                >
                    <span className='cardNumber'>
                        {totales.maxPropiedades}
                    </span>
                    <p>Propiedades Asociadas</p>
                </div>
            </div>

                {/* /////////////////// Tabla /////////// */}
                    <div className='tituloH' 
                    style={{marginTop: 20, marginBottom: 20, gap: 20}}
                    >
                        <img src={icon.productor} alt="" className='iconTwo'/>
                        <h1 className='title' title='Operaciones Planificadas'>Resumen de Productores</h1>
                    
                    {/* Ayudante informativo de Pantalla */}
                        <div >
                            <AyudaTooltip descripcion="En esta sección puedes visualizar, registrar y gestionar todos los productores registrados. Usa los filtros, la búsqueda y las opciones de exportación para organizar y consultar la información de manera eficiente." />
                        </div>
                    </div>

            {/* modal detalle */}
            {detalleModal.abierto && detalleModal.productor && (
                <div className='modalOverlay'>
                    <div className='modal'>
                        <button className='closeButton' onClick={closeDetalleModal}>&times;</button>
                        <h2>Detalles del Productor</h2>
                        <form className='modalForm'>
                            <div className='formColumns'>
                                <div className='formGroup'>
                                    <label htmlFor="codigo">Código Runsai:</label>
                                    <input
                                        type="text"
                                        id="codigo"
                                        value={detalleModal.productor.codigo || ''}
                                        className='input'
                                        disabled
                                    />
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="cedula">Cédula:</label>
                                    <input
                                        type="text"
                                        id="cedula"
                                        value={detalleModal.productor.cedula || ''}
                                        className='input'
                                        disabled
                                    />
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="nombre">Nombre:</label>
                                    <input
                                        type="text"
                                        id="nombre"
                                        value={detalleModal.productor.nombre || ''}
                                        className='input'
                                        disabled
                                    />
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="apellido">Apellido:</label>
                                    <input
                                        type="text"
                                        id="apellido"
                                        value={detalleModal.productor.apellido || ''}
                                        className='input'
                                        disabled
                                    />
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="contacto">Contacto:</label>
                                    <input
                                        type="text"
                                        id="contacto"
                                        value={detalleModal.productor.contacto || ''}
                                        className='input'
                                        disabled
                                    />
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="email">Correo:</label>
                                    <input
                                        type="email"
                                        id="email"
                                        value={detalleModal.productor.email || ''}
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
            {currentModal === 'productor' && (
                <div className='modalOverlay'>
                    <div className='modal'>
                        <button className='closeButton' onClick={closeModal}>&times;</button>
                        {step === 1 ? (
                            <>
                                <h2>{formData.id ? 'Editar Productor' : 'Registrar Productor'}</h2>
                                <form className='modalForm'>
                                    <div className='formColumns'>
                                        <div className='formGroup'>
                                            <label htmlFor="codigo"><span className='Unique' title='Campo Obligatorio'>*</span>Código Runsai:</label>
                                            <input type="text" id="codigo" value={formData.codigo} onChange={handleChange} className='input' placeholder='Código único'/>
                                            {errors.codigo && <span className='errorText'>{errors.codigo}</span>}
                                        </div>
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
                                                        // Solo números y guiones
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
                                            <input type="text" id="nombre" value={formData.nombre} onChange={handleChange} className='input' placeholder='Nombre'/>
                                            {errors.nombre && <span className='errorText'>{errors.nombre}</span>}
                                        </div>
                                        <div className='formGroup'>
                                            <label htmlFor="apellido"><span className='Unique' title='Campo Obligatorio'>*</span>Apellido:</label>
                                            <input type="text" id="apellido" value={formData.apellido} onChange={handleChange} className='input' placeholder='Apellido'/>
                                            {errors.apellido && <span className='errorText'>{errors.apellido}</span>}
                                        </div>
                                        <div className='formGroup'>
                                            <label htmlFor="contacto"><span className='Unique' title='Campo Obligatorio'>*</span>Contacto:</label>
                                            <input type="text" id="contacto" value={formData.contacto} onChange={handleChange} className='input' placeholder='Teléfono'/>
                                            {errors.contacto && <span className='errorText'>{errors.contacto}</span>}
                                        </div>
                                        <div className='formGroup'>
                                            <label htmlFor="email"><span className='Unique' title='Campo Obligatorio'>*</span>Correo:</label>
                                            <input type="email" id="email" value={formData.email} onChange={handleChange} className='input' placeholder='Correo electrónico'/>
                                            {errors.email && <span className='errorText'>{errors.email}</span>}
                                        </div>
                                    </div>
                                    <button 
                                        type="button" 
                                        className='saveButton' 
                                        onClick={formData.id ? handleEdit : handleSave}
                                        title={formData.id ? 'Actualizar Productor' : 'Registrar Productor'}
                                        disabled={loading}    
                                    >
                                        {loading ? 'Procesando...' : 'Guardar'}
                                    </button>
                                </form>
                            </>
                        ) : (
                            <>
                                <h2>Productor registrado</h2>
                                <p>
                                    Se creó correctamente el productor
                                    {` ${recentProductor?.codigo ? `(${recentProductor.codigo})` : ''} ${recentProductor?.nombre || ''} ${recentProductor?.apellido || ''}`}.
                                </p>
                                <p>¿Deseas continuar para seguir el proceso en la siguiente pantalla?</p>
                                <div className='modalActions' style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                                    <button className='btn-estandar' onClick={goToNextScreen}>
                                        Continuar
                                    </button>
                                    <button className='cancelButton' onClick={closeModal}>
                                        Más tarde
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Modal de confirmación para eliminar */}
            {confirmDeleteModal && (
                <div className='modalOverlay'>
                    <div className='modal'>
                        <h2>Confirmar Eliminación</h2>
                        <p>¿Estás seguro de que deseas eliminar este productor?</p>
                        <div className='modalActions'>
                            <button className='cancelButton' onClick={closeConfirmDeleteModal}>Cancelar</button>
                            <button className='confirmButton' onClick={() => { handleDelete(selectedProductorId); closeConfirmDeleteModal(); }}>Confirmar</button>
                        </div>
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

            <div className='tableSection'>
                <div className='filtersContainer'>
                <div className='filtersButtons'>
                    {tienePermiso('propiedad', 'crear') && (
                        <button 
                        type='button'
                        onClick={openModal} 
                        className='create'
                        title='Registrar Productor'>
                            <img src={icon.plus} alt="Crear" className='icon' />
                            Agregar
                        </button>
                    )}
                    {tienePermiso('propiedad', 'exportar') && (
                        <button
                        type='button'
                        onClick={handlePreviewPDF}
                        className='btn-estandar'
                        title='Previsualizar PDF'
                        >
                            <img src={icon.pdf5} alt="PDF" className='icon' />
                            PDF
                        </button>
                    )}
                    {tienePermiso('propiedad', 'exportar') && (
                        <button
                        type='button'
                        onClick={() => exportToExcel({
                            data: datosFiltrados,
                            columns: columnsProductor,
                            fileName: excelFileName,
                            count: true,
                            totalLabel: 'TOTAL REGISTROS'
                        })}
                        className='btn-estandar'
                        title='Descargar Formato Excel'
                        >
                            <img src={icon.excel2} alt="Excel" className='icon' />
                            Excel
                        </button>
                    )}
                    </div>
                    <div className='searchContainer'>
                        <SearchBar onSearch={handleSearch} />
                        <img src={icon.lupa} alt="Buscar" className='iconlupa' />
                    </div>
                </div>
                <table className='table'>
                    <thead>
                        <tr>
                            <th>Nº</th>
                            <th>Código Runsai</th>
                            <th>Cédula</th>
                            <th>Nombre</th>
                            <th>Propiedades</th>
                            <th>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentData.map((prod, idx) => (
                            <tr key={prod.id} >
                                <td>{indexOfFirstItem + idx + 1}</td>
                                <td>{prod.codigo}</td>
                                <td>{prod.cedula}</td>
                                <td>{prod.nombre}</td>
                                <td>{prod.total_propiedades || 0}</td>
                                <td>
                                    <div className='iconContainer'>
                                        {tienePermiso('propiedad', 'ver') && (
                                            <img
                                            onClick={() => openDetalleModal(prod)}
                                            src={icon.ver}
                                            className='iconver'
                                            title='Ver más'
                                            />
                                        )}
                                        {tienePermiso('propiedad', 'exportar') && (
                                            <img
                                            onClick={() => handleFichaPDF(prod)}
                                            src={icon.cliente}
                                            className='iconver'
                                            title='Ficha PDF'
                                            alt='Ficha PDF'
                                            />
                                        )}
                                        {tienePermiso('propiedad', 'editar') && (
                                            <img
                                            onClick={() => openEditModal(prod)}
                                            src={icon.editar}
                                            className='iconeditar'
                                            title='Editar'
                                            />
                                        )}
                                        {tienePermiso('propiedad', 'eliminar') && (
                                            <img 
                                            onClick={() => openConfirmDeleteModal(prod.id)} 
                                            src={icon.eliminar} 
                                            className='iconeliminar' 
                                            title='Eliminar'
                                            />
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className='tableFooter'>
                    <img onClick={handlePreviousPage} src={icon.flecha3} className='iconBack' title='Anterior' />
                    <img onClick={handlePreviousThreePages} src={icon.flecha5} className='iconBack' title='Anterior' />
                    <span>{currentPage}</span>
                    <img onClick={handleNextThreePages} src={icon.flecha4} className='iconNext' title='Siguiente' />
                    <img onClick={handleNextPage} src={icon.flecha2} className='iconNext' title='Siguiente' />
                </div>
            </div>
        </div>
    );
}

export default Productor;