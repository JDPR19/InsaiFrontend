import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../main.css';
import icon from '../../components/iconos/iconos';
import { filterData } from '../../utils/filterData';
import SearchBar from "../../components/searchbart/SearchBar";
import Spinner from '../../components/spinner/Spinner';
import { BaseUrl } from '../../utils/constans';
import AyudaTooltip from '../../components/ayudanteinfo/AyudaTooltip';
import { buildActaSilosBlob } from '../../components/pdf/ActaSilos';
import { useNotification } from '../../utils/NotificationContext';
import { exportToPDF, exportToExcel } from '../../utils/exportUtils';



function ActaSilos() {
    const [datosOriginales, setDatosOriginales] = useState([]);
    const [datosFiltrados, setDatosFiltrados] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const itemsPerPage = 8;
    const [detalleModal, setDetalleModal] = useState({ abierto: false, acta: null });
    const [pdfUrl, setPdfUrl] = useState(null);
    const [pdfFileName, setPdfFileName] = useState('Acta_Silos.pdf');
    const { addNotification } = useNotification();
    const [weekStr, setWeekStr] = useState('');
    const [weekRange, setWeekRange] = useState(null);

    // Columnas para mostrar en la tabla
    const columns = [
        { header: 'Semana', key: 'semana_epid' },
        { header: 'Ubicación', key: 'lugar_ubicacion' },
        { header: 'Cultivos Nacional', key: 'cant_nacional' },
        { header: 'Cultivos Importado', key: 'cant_importado' },
        { header: 'Cultivos Afectado', key: 'cant_afectado' },
        { header: 'Cultivos % Afectado', key: 'cant_afectado_porcentaje' },
    ];

   const columnsActaSilos = [
    { header: 'Semana', key: 'semana_epid' },
    { header: 'Fecha Notificación', key: 'fecha_notificacion' },
    { header: 'Ubicación', key: 'lugar_ubicacion' },
    { header: 'Cant. Nacional', key: 'cant_nacional' },
    { header: 'Cant. Importado', key: 'cant_importado' },
    { header: 'Cant. Afectado', key: 'cant_afectado' },
    { header: '% Afectado', key: 'cant_afectado_porcentaje' },
    { header: 'Unidad', key: 'unidad_medida' },
    { header: 'Observaciones', key: 'observaciones' },
    { header: 'Medidas Recomendadas', key: 'medidas_recomendadas' }
];

   const fetchActasSilos = async () => {
    setLoading(true);
    try {
        const response = await axios.get(`${BaseUrl}/seguimiento/acta-silos/all`, {
            headers: { Authorization : `Bearer ${localStorage.getItem('token')}` }
        });
        setDatosOriginales(response.data);
        setDatosFiltrados(response.data);
        setCurrentPage(1);
    } catch (error) {
        console.error('Error al obtener actas de silos', error.response || error);
    } finally {
        setLoading(false);
    }
};

    useEffect(() => {
        fetchActasSilos();
    }, []);

    const handleSearch = (searchTerm) => {
        const filtered = filterData(
            datosOriginales,
            searchTerm,
            ['semana_epid', 'fecha_notificacion', 'lugar_ubicacion', 'unidad_medida']
        );
        setDatosFiltrados(filtered);
        setCurrentPage(1);
    };

    // Calcula rango [lunes..domingo] de una semana ISO (YYYY-Www)
    const toLocalDateStr = (d) => {
        const tz = d.getTimezoneOffset();
        return new Date(d.getTime() - tz * 60000).toISOString().slice(0, 10);
    };
    const getWeekRangeFromWeekInput = (ws) => {
        if (!ws) return null;
        const [yearStr, weekPart] = ws.split('-W');
        const year = parseInt(yearStr, 10);
        const week = parseInt(weekPart, 10);
        const jan4 = new Date(year, 0, 4);
        const day = jan4.getDay() || 7;
        const mondayWeek1 = new Date(jan4);
        mondayWeek1.setDate(jan4.getDate() - (day - 1));
        const monday = new Date(mondayWeek1);
        monday.setDate(mondayWeek1.getDate() + (week - 1) * 7);
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        return { from: toLocalDateStr(monday), to: toLocalDateStr(sunday) };
    };
    // Semana actual en formato input week (YYYY-Www)
    const getWeekInputValue = (d) => {
        const date = new Date(d);
        const year = date.getFullYear();
        const firstThu = new Date(year, 0, 1);
        while (firstThu.getDay() !== 4) firstThu.setDate(firstThu.getDate() + 1);
        const diffDays = Math.floor((date - firstThu) / (1000 * 60 * 60 * 24));
        const week = Math.floor(diffDays / 7) + 1;
        return `${year}-W${String(week).padStart(2, '0')}`;
    };

    // Filtra por semana cuando cambia el weekStr
    useEffect(() => {
        if (!weekStr) {
            setWeekRange(null);
            setDatosFiltrados(datosOriginales);
            setCurrentPage(1);
            return;
        }
        const range = getWeekRangeFromWeekInput(weekStr);
        setWeekRange(range);
        const filtered = datosOriginales.filter(a =>
            a.fecha_notificacion >= range.from && a.fecha_notificacion <= range.to
        );
        setDatosFiltrados(filtered);
        setCurrentPage(1);
    }, [weekStr, datosOriginales]);


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


    const generarActaPDF = async (inspeccionId) => {
        try {
            setLoading(true);

            // 1) Acta guardada
            const g = await axios.get(`${BaseUrl}/seguimiento/acta-silos/${inspeccionId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            const acta = g.data?.acta;
            if (!acta) {
            addNotification('No existe acta para esta inspección', 'warning');
            return;
            }

            // 2) Detalle EXCLUSIVO (contacto del técnico y del productor incluidos)
            const { data: det } = await axios.get(`${BaseUrl}/seguimiento/acta-silos/inspeccion/${inspeccionId}/detalle`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            const propiedad = {
            propiedad_nombre: det?.propiedad_nombre,
            propiedad_rif: det?.propiedad_rif,
            estado_nombre: det?.estado_nombre,
            municipio_nombre: det?.municipio_nombre,
            parroquia_nombre: det?.parroquia_nombre,
            sector_nombre: det?.sector_nombre
            };

            const propietario = {
            id: det?.productor_id,
            nombre: det?.productor_nombre,
            apellido: det?.productor_apellido,
            cedula: det?.productor_cedula,
            telefono: det?.productor_telefono || ''
            };

            const tecnicos = Array.isArray(det?.inspectores) ? det.inspectores : [];
            const rubroProducto = Array.isArray(det?.cultivos) ? det.cultivos.join(' | ') : '';
            const plagasEnfermedades = Array.isArray(det?.plagas_enfermedades) ? det.plagas_enfermedades.join(', ') : '';
            const certificadoFitosanitario =
            det?.certificado_fitosanitario === true ? 'Sí'
            : det?.certificado_fitosanitario === false ? 'No'
            : (det?.certificado_fitosanitario || '');

            const programas = Array.isArray(det?.programas) ? det.programas.join(' | ') : '';

            const blob = await buildActaSilosBlob({
            acta,
            inspeccion: {
                id: det?.inspeccion_id,
                codigo_inspeccion: det?.codigo_inspeccion,
                n_control: det?.n_control,
                fecha_inspeccion: det?.fecha_inspeccion
            },
            propiedad,
            propietario,
            tipoEventoNombre: det?.tipo_evento_nombre || '',
            registroNotificacion: acta?.registro_notificacion || '',
            rubroProducto,
            programas,  
            plagasEnfermedades,
            certificadoFitosanitario,
            tecnicos,
            unidad: 'DIRECCIÓN GENERAL'
            });

            const url = URL.createObjectURL(blob);
            setPdfUrl(url);
            setPdfFileName(`Acta_Silos_${inspeccionId}.pdf`);
        } catch (error) {
            console.error(error);
            addNotification('No se pudo generar el PDF del acta', 'error');
        } finally {
            setLoading(false);
        }
    };

 const handlePreviewPDF = async () => {
    await fetchActasSilos();
    const fileName = 'Actas_Silos.pdf';
    const title = 'Listado de Actas de Silos';
    const blob = exportToPDF({
        data: datosFiltrados,
        columns: columnsActaSilos,
        fileName,
        title,
        preview: true
    });
    const url = URL.createObjectURL(blob);
    setPdfUrl(url);
    setPdfFileName(fileName);
};

const handleExportExcel = async () => {
    await fetchActasSilos();
    exportToExcel({
        data: datosFiltrados,
        columns: columnsActaSilos,
        fileName: 'Actas_Silos.xlsx',
        count: true,
        totalLabel: 'TOTAL REGISTROS'
    });
};
    // Modal de detalle
    const openDetalleModal = (acta) => setDetalleModal({ abierto: true, acta });
    const closeDetalleModal = () => setDetalleModal({ abierto: false, acta: null });

    return (
        <div className='mainContainer'>
            {loading && <Spinner text="Procesando..." />}
            <div className='tituloH' style={{marginTop: 20, marginBottom: 20, gap: 20}}>
                <img src={icon.farmer2} alt="" className='iconTwo'/>
                <h1 className='title' title='Actas de Silos'>Resumen de Actas de Silos</h1>
                <div>
                    <AyudaTooltip descripcion="En esta sección puedes visualizar todas las actas de silos registradas. Usa la búsqueda y la paginación para consultar la información de manera eficiente." />
                </div>
            </div>

             {/* Previsualización PDF */}
            {pdfUrl && (
                <div className="modalOverlay">
                <div className="modalDetalle">
                    <button className="closeButton" onClick={() => setPdfUrl(null)}>&times;</button>
                    <iframe src={pdfUrl} width="100%" height="600px" title="Acta Silos PDF" />
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

            {/* Modal de detalle */}
            {detalleModal.abierto && detalleModal.acta && (
                <div className='modalOverlay'>
                    <div className='modal'>
                        <button className='closeButton' onClick={closeDetalleModal}>&times;</button>
                        <h2>Detalle del Acta de Silos</h2>
                        <table className='detalleTable'>
                            <tbody>
                                {columns.map(col => (
                                    <tr key={col.key}>
                                        <th>{col.header}</th>
                                        <td>{detalleModal.acta[col.key] ?? '—'}</td>
                                    </tr>
                                ))}
                                <tr>
                                    <th>Observaciones</th>
                                    <td>{detalleModal.acta.observaciones ?? '—'}</td>
                                </tr>
                                <tr>
                                    <th>Medidas Recomendadas</th>
                                    <td>{detalleModal.acta.medidas_recomendadas ?? '—'}</td>
                                </tr>
                                <tr>
                                    <th>Creado</th>
                                    <td>{detalleModal.acta.created_at ? new Date(detalleModal.acta.created_at).toLocaleString('es-ES') : '—'}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <div className='tableSection'>
                <div className='filtersContainer'>
                    <div className='filtersButtons'>
                        <button
                            type='button'
                            onClick={handlePreviewPDF}
                            className='btn-estandar'
                            title='Previsualizar PDF'
                        >
                            <img src={icon.pdf5} alt="PDF" className='icon' />
                            PDF
                        </button>
                        <button
                            type='button'
                            onClick={handleExportExcel}
                            className='btn-estandar'
                            title='Descargar Excel'
                        >
                            <img src={icon.excel2} alt="Excel" className='icon' />
                            Excel
                        </button>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 8 }}>
                            <input
                                type="week"
                                className="date"
                                value={weekStr}
                                onChange={(e) => setWeekStr(e.target.value)}
                                title="Filtrar por semana (ISO)"
                            />
                            <button
                                type="button"
                                className="btn-estandar"
                                onClick={() => setWeekStr(getWeekInputValue(new Date()))}
                                title="Semana actual"
                            >
                                Semana
                            </button>
                            {weekRange && (
                                <button
                                    type="button"
                                    className="btn-limpiar"
                                    onClick={() => setWeekStr('')}
                                    title="Quitar filtro semanal"
                                >
                                    Limpiar
                                </button>
                            )}
                    </div>
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
                            {columns.map(col => (
                                <th key={col.key}>{col.header}</th>
                            ))}
                            <th>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentData.map((acta, idx) => (
                            <tr key={acta.id}>
                                <td>{indexOfFirstItem + idx + 1}</td>
                                {columns.map(col => (
                                    <td key={col.key}>{acta[col.key] ?? '—'}</td>
                                ))}
                                <td>
                                    <div className='iconContainer'>
                                        <img
                                            onClick={() => openDetalleModal(acta)}
                                            src={icon.ver}
                                            className='iconver'
                                            title='Ver más'
                                            alt='Ver más'
                                        />
                                        <img
                                            onClick={() => generarActaPDF(acta.inspeccion_est_id)}
                                            src={icon.pdf2}
                                            className="iconver"
                                            title="Descargar ficha PDF"
                                            alt="Descargar ficha PDF"
                                            
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

export default ActaSilos;