import React, { useState, useEffect } from 'react';
import Spinner from '../spinner/Spinner';
import styles from './searchmodal.module.css';
import axios from 'axios';
import { BaseUrl } from '../../utils/constans';
import SingleSelect from '../selectmulti/SingleSelect';
import { usePermiso } from '../../hooks/usePermiso';
import icon from '../iconos/iconos';
import '../../main.css';
import { useNotification } from '../../utils/NotificationContext';
import { useNavigate } from 'react-router-dom';

const tipos = [
    { value: 'empleado', label: 'Empleados', pantalla: 'empleados', accion: 'ver', ayuda: 'Busca por nombre, apellido, cédula, cargo, contacto.' },
    { value: 'propiedad', label: 'Propiedades', pantalla: 'propiedad', accion: 'ver', ayuda: 'Busca por nombre, RIF, ubicación, tipo, sector, productor.' },
    { value: 'productor', label: 'Productores', pantalla: 'productor', accion: 'ver', ayuda: 'Busca por nombre, apellido, cédula, contacto, email.' },
    { value: 'solicitud', label: 'Solicitudes', pantalla: 'solicitud', accion: 'ver', ayuda: 'Busca por código, fecha, tipo, propiedad, usuario.' },
    { value: 'planificacion', label: 'Planificaciones', pantalla: 'planificacion', accion: 'ver', ayuda: 'Busca por fecha, objetivo, actividad, tipo, propiedad, estado.' },
    { value: 'inspeccion', label: 'Inspecciones', pantalla: 'inspecciones', accion: 'ver', ayuda: 'Busca por código, fecha, inspector, propiedad, estado.' },
    { value: 'cultivo', label: 'Cultivos', pantalla: 'cultivo', accion: 'ver', ayuda: 'Busca por nombre, nombre científico, descripción.' },
    { value: 'plaga', label: 'Plagas', pantalla: 'plaga', accion: 'ver', ayuda: 'Busca por nombre, nombre científico, observaciones.' },
    { value: 'laboratorio', label: 'Laboratorios', pantalla: 'laboratorio', accion: 'ver', ayuda: 'Busca por nombre, ubicación, tipo, sector.' },
    { value: 'programa', label: 'Programas', pantalla: 'programa', accion: 'ver', ayuda: 'Busca por nombre, descripción, tipo.' },
    { value: 'sector', label: 'Sectores', pantalla: 'sector', accion: 'ver', ayuda: 'Busca por nombre, parroquia.' },
    { value: 'municipio', label: 'Municipios', pantalla: 'municipio', accion: 'ver', ayuda: 'Busca por nombre, estado.' },
    { value: 'parroquia', label: 'Parroquias', pantalla: 'parroquia', accion: 'ver', ayuda: 'Busca por nombre, municipio.' },
    { value: 'cargo', label: 'Cargos', pantalla: 'cargos', accion: 'ver', ayuda: 'Busca por nombre.' }
];

const camposPorTipo = {
    empleado: ['nombre', 'apellido', 'cedula', 'cargo', 'contacto'],
    propiedad: ['propiedad', 'rif', 'ubicacion', 'tipo_propiedad', 'sector', 'productor'],
    productor: ['nombre', 'apellido', 'cedula', 'contacto', 'email'],
    solicitud: ['codigo', 'fecha_solicitada', 'tipo_solicitud', 'propiedad', 'usuario'],
    planificacion: ['fecha_programada', 'objetivo', 'actividad', 'propiedad', 'estado'],
    inspeccion: ['codigo_inspeccion', 'fecha_inspeccion', 'inspector', 'propiedad', 'estado'],
    cultivo: ['nombre', 'nombre_cientifico', 'descripcion'],
    plaga: ['nombre', 'nombre_cientifico', 'observaciones'],
    laboratorio: ['nombre', 'ubicación', 'tipo_laboratorio', 'sector'],
    programa: ['nombre', 'descripcion', 'tipo_programa'],
    sector: ['nombre', 'parroquia'],
    municipio: ['nombre', 'estado'],
    parroquia: ['nombre', 'municipio'],
    cargo: ['nombre']
};

function SearchModal({ abierto, titulo = 'Buscador Universal', onClose }) {
    const navigate = useNavigate();
    const tienePermiso = usePermiso();
    const { addNotification } = useNotification();

    // Mueve la declaración antes del useState
    const tiposPermitidos = tipos.filter(t => tienePermiso && tienePermiso(t.pantalla, t.accion));
    const [tipo, setTipo] = useState(tiposPermitidos[0] || null);
    const [texto, setTexto] = useState('');
    const [resultados, setResultados] = useState([]);
    const [loading, setLoading] = useState(false);
    const [detalle, setDetalle] = useState(null);
    const [currentPage, setCurrentPage] = useState(1)
    
    const resultadosFiltrados = texto.trim()
        ? resultados.filter(item =>
            camposPorTipo[tipo?.value]?.some(campo =>
                String(item[campo] || '').toLowerCase().includes(texto.toLowerCase())
            )
        )
        : resultados;

    const itemsPerPage = 4;
    const indexOfLasItem = currentPage * itemsPerPage;
    const indexOfFirsItem = indexOfLasItem - itemsPerPage;
    const currentData = resultadosFiltrados.slice(indexOfFirsItem, indexOfLasItem); 

    const handlePreviousPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNextPage = () => {
        if (indexOfLasItem < resultadosFiltrados.length) setCurrentPage(currentPage + 1);
    };

    const handlePreviousThreePages = () => {
    setCurrentPage((prev) => Math.max(prev - 3, 1));
    };

    const handleNextThreePages = () => {
        const maxPage = Math.ceil(resultadosFiltrados.length / itemsPerPage);
        setCurrentPage((prev) => Math.min(prev + 3, maxPage));
    };

    const rutasPorTipo = {
        empleado: '/empleados',
        propiedad: '/propiedad',
        productor: '/productor',
        solicitud: '/solicitud',
        planificacion: '/planificacion',
        inspeccion: '/inspecciones',
        cultivo: '/cultivo',
        plaga: '/plagas',
        laboratorio: '/laboratorio',
        programa: '/programas',
        sector: '/sector',
        municipio: '/municipio',
        parroquia: '/parroquia',
        cargo: '/cargos'
    };

    // Cuando cambia el modal o los tipos permitidos, selecciona el primero si el actual no es válido
    useEffect(() => {
        if (abierto && tiposPermitidos.length > 0) {
            setTipo(prev => {
                if (prev && tiposPermitidos.some(t => t.value === prev.value)) {
                    return prev;
                }
                return tiposPermitidos[0];
            });
        }
    }, [abierto, tiposPermitidos]);

    useEffect(() => {
        if (!abierto || !tipo) return;
        setLoading(true);
        axios.get(`${BaseUrl}/header/buscar?tipo=${tipo.value}&texto=`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        .then(res => setResultados(res.data))
        .catch(() => setResultados([]))
        .finally(() => setLoading(false));
        setTexto('');
        setDetalle(null);
        setCurrentPage(1);
    }, [tipo, abierto]);

    if (!abierto) return null;

    const ayuda = tipo?.ayuda || '';
    const tipoObj = tipo;
    const tienePermisoTipo = tipoObj && tienePermiso && tienePermiso(tipoObj.pantalla, tipoObj.accion);
    const campos = camposPorTipo[tipo?.value] || [];

    // Modal de detalle con copiado en texto plano y notificación
    const DetalleModal = ({ item, onClose }) => {
        const copiarDatos = () => {
            // Excluye el campo 'id' y copia solo los valores en texto plano
            const textoPlano = campos
                .filter(campo => campo !== 'id')
                .map(campo => item[campo] !== undefined && item[campo] !== null && item[campo] !== ''
                    ? String(item[campo])
                    : '—'
                )
                .join('\n');
            navigator.clipboard.writeText(textoPlano);
            addNotification('¡Datos copiados!', 'success');
        };

        function formatearTitulo(campo) {
            return campo
                .replace(/_/g, ' ')
                .split(' ')
                .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase())
                .join(' ');
        }

        return (
            <div className={styles.searchModalOverlay}>
                <div className={styles.modalDetalle}>
                    <button className='closeButton' onClick={onClose}>&times;</button>
                    <h2>Detalle</h2>
                    <table className={styles.detalleTable}>
                        <tbody>
                            {campos.filter(campo => campo !== 'id').map((campo, idx) => (
                                <tr key={idx}>
                                    <th>{formatearTitulo(campo)}</th>
                                    <td>
                                        {item[campo] !== undefined && item[campo] !== null && item[campo] !== ''
                                            ? String(item[campo])
                                            : <span style={{ color: '#bbb' }}>—</span>
                                        }
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className={styles.searchModalActions}>
                        <button className='btn-estandar' onClick={copiarDatos}>
                            Copiar datos
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className={styles.searchModalOverlay}>
            <div className={styles.searchModal}>
                <button className={styles.searchModalClose} onClick={onClose}>&times;</button>
                <h2>{titulo}</h2>
                <div className='formColumns_tree'>
                    <div className='formGroup'>
                        <SingleSelect
                            options={tiposPermitidos}
                            value={tipo}
                            onChange={option => setTipo(option)}
                            placeholder="Filtrar por tipo..."
                            className={styles.searchModalInput}
                        />
                    </div>
                    <div className='formGroup'>
                        <input
                            type="search"
                            className='input'
                            placeholder={`Buscar en ${tipo?.label || ''}...`}
                            value={texto}
                            onChange={e => setTexto(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div className='formGroup'>
                        <button
                            className='btn-estandar'
                            disabled={!tipo}
                            onClick={() => {
                                if (tipo?.value) {
                                    navigate(rutasPorTipo[tipo.value]);
                                    onClose();
                                }
                            }}
                            title='Dirigirse a la Sección'
                        >
                            Ir a la sección
                        </button>
                    </div>
                </div>
                
                <div className={styles.searchModalAyuda}>
                    {ayuda}
                </div>
                
                {/* Si no tiene permiso para el tipo seleccionado */}
                {!tienePermisoTipo && (
                    <div style={{ color: '#b10b0b', fontWeight: 600, textAlign: 'center', margin: '30px 0' }}>
                        <img src={icon.error} alt="Sin permiso" style={{ width: 32, marginBottom: 8 }} />
                        <br />
                        UPPS no tienes los permisos suficientes para ver este apartado
                    </div>
                )}
                {/* Si tiene permiso, muestra la tabla */}
                {tienePermisoTipo && (
                    loading ? (
                        <Spinner text="Buscando..." />
                    ) : (
                    <div className={styles.searchModalTableWrapper}>
                        <table className={styles.searchModalTable}>
                            <thead>
                                <tr>
                                    {campos.map((campo, idx) => (
                                        <th key={idx}>{campo.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</th>
                                    ))}
                                    <th>Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentData.length === 0 ? (
                                    <tr>
                                        <td colSpan={campos.length + 1}>Sin resultados</td>
                                    </tr>
                                ) : (
                                    currentData.map((item, idx) => (
                                        <tr key={item.id || idx}>
                                            {campos.map((campo, cidx) => (
                                                <td key={cidx} title={item[campo]}>
                                                    {item[campo] !== undefined && item[campo] !== null && item[campo] !== ''
                                                        ? String(item[campo]).length > 30
                                                            ? String(item[campo]).slice(0, 27) + '...'
                                                            : item[campo]
                                                        : <span style={{ color: '#bbb' }}>—</span>
                                                    }
                                                </td>
                                            ))}
                                            <td>
                                                <button
                                                    className='btn-estandar'
                                                    style={{ padding: '4px 8px', fontSize: '0.9em' }}
                                                    onClick={() => setDetalle(item)}
                                                    title="Ver detalle"
                                                >
                                                    <img src={icon.ver} alt="Ver" style={{ width: 18, marginRight: 4 }} />
                                                    Ver detalle
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
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
                    )
                )}
                {detalle && <DetalleModal item={detalle} onClose={() => setDetalle(null)} />}
            </div>
        </div>
    );
}

export default SearchModal;