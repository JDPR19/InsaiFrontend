import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BaseUrl } from '../../utils/constans';
import SingleSelect from '../../components/selectmulti/SingleSelect';
import MultiSelect from '../../components/selectmulti/MultiSelect';
import ChartComponent from '../../components/chart/chart4';
import icon from '../../components/iconos/iconos';
import '../../main.css';

function SeguimientoInspeccion() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [inspeccion, setInspeccion] = useState(null);
    const [programas, setProgramas] = useState([]);
    const [todosProgramas, setTodosProgramas] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [programaSeleccionado, setProgramaSeleccionado] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [estatus, setEstatus] = useState('');
    const [filtros, setFiltros] = useState({ programa: '', estatus: '' });

    // Para la gráfica (puedes adaptar según tu librería)
    // const [datosGrafica, setDatosGrafica] = useState([]);

    useEffect(() => {
        axios.get(`${BaseUrl}/inspecciones/${id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }).then(res => setInspeccion(res.data));
        axios.get(`${BaseUrl}/seguimiento/${id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }).then(res => setProgramas(res.data));
        axios.get(`${BaseUrl}/seguimiento`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }).then(res => setTodosProgramas(res.data));
        // Aquí podrías cargar los datos de la gráfica
    }, [id, modalOpen]);

    const handleAgregarPrograma = async () => {
        if (!programaSeleccionado || !estatus) return;
        await axios.post(`${BaseUrl}/seguimiento`, {
            inspeccion_est_id: id,
            programa_fito_id: programaSeleccionado,
            observacion: descripcion,
            estatus
        }, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setModalOpen(false);
        setProgramaSeleccionado('');
        setDescripcion('');
        setEstatus('');
    };

    // Opciones para selects
    const programaOptions = todosProgramas.map(p => ({ value: p.id, label: p.nombre }));
    const estatusOptions = [
        { value: 'pendiente', label: 'Pendiente' },
        { value: 'en_proceso', label: 'En Proceso' },
        { value: 'finalizado', label: 'Finalizado' }
    ];

    // Filtrado de programas asociados (puedes adaptar la lógica)
    const programasFiltrados = programas.filter(p => {
        let match = true;
        if (filtros.programa) match = match && String(p.programa_id) === String(filtros.programa);
        if (filtros.estatus) match = match && String(p.estatus) === String(filtros.estatus);
        return match;
    });

    return (
        <div className="mainContainer" >
            {/* Sección superior */}
            <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 18 ,}}>
                {/* Lateral izquierdo con botón y iconos */}
                <div style={{ minWidth: 120, marginRight: 24 }}>
                    <button
                        className="saveButton"
                        style={{ width: '100%', marginBottom: 18, background: 'var(--grey4)' }}
                        onClick={() => navigate('/SeccionFour')}
                    >
                        <img src={icon.flecha3} alt="Regresar" style={{ width: 18, marginRight: 6 }} />
                        Regresar
                    </button>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'center' }}>
                        <img src={icon.ver} alt="Ver" style={{ width: 28 }} />
                        <img src={icon.editar} alt="Editar" style={{ width: 28 }} />
                        {/* Agrega más iconos aquí */}
                    </div>
                </div>
                {/* Títulos */}
                <div style={{ flex: 1 }}>
                    <h2 style={{ color: 'var(--green5)', fontWeight: 700, fontSize: '2rem', margin: 0 }}>
                        Seguimiento de Inspección #{id}
                    </h2>
                    <h3 style={{ color: 'var(--green6)', fontWeight: 600, fontSize: '1.2rem', margin: '8px 0 0 0' }}>
                        {inspeccion?.propiedad_nombre || 'Propiedad'}
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
                                <th>Área</th>
                                <th>Tipo</th>
                                <th>Propiedad</th>
                                {/* Agrega más columnas si lo necesitas */}
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
                                <td>{inspeccion.responsable_e}</td>
                                <td>{inspeccion.area}</td>
                                <td>{inspeccion.tipo_inspeccion_nombre}</td>
                                <td>{inspeccion.propiedad_nombre}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}

            {/* Tabla de programas asociados */}
            <div className="tableSection" style={{ marginBottom: 30 }}>
                <div className="filtersContainer" style={{ justifyContent: 'space-between' }}>
                    <h3 style={{ color: 'var(--green6)', fontSize: '1.2rem', fontWeight: 600, margin: 0 }}>
                        Programas Asociados
                    </h3>
                    <button className="saveButton" onClick={() => setModalOpen(true)}>
                        <img src={icon.plus} alt="Agregar" style={{ width: 18, marginRight: 6 }} />
                        Agregar Programa
                    </button>
                </div>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Programa</th>
                            <th>Descripción</th>
                            <th>Estatus</th>
                            <th>Fecha Asociación</th>
                            {/* <th>Acción</th> */}
                        </tr>
                    </thead>
                    <tbody>
                        {programasFiltrados.length === 0 && (
                            <tr>
                                <td colSpan={4} style={{ color: 'var(--grey4)' }}>No hay programas asociados.</td>
                            </tr>
                        )}
                        {programasFiltrados.map(p => (
                            <tr key={p.id}>
                                <td>{p.nombre}</td>
                                <td>{p.observacion}</td>
                                <td>
                                    <span className={`badge-estado badge-${(p.estatus || 'pendiente').toLowerCase()}`}>
                                        {p.estatus || 'Pendiente'}
                                    </span>
                                </td>
                                <td>{p.created_at?.slice(0, 10)}</td>
                                {/* <td>
                                    <img src={icon.eliminar} className="iconeliminar" title="Eliminar" />
                                </td> */}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal para agregar programa */}
            {modalOpen && (
                <div className="modalOverlay">
                    <div className="modal">
                        <button className="closeButton" onClick={() => setModalOpen(false)}>&times;</button>
                        <h2>Agregar Programa</h2>
                        <form className="modalForm" onSubmit={e => { e.preventDefault(); handleAgregarPrograma(); }}>
                            <div className="formGroup">
                                <label>Programa:</label>
                                <SingleSelect
                                    options={programaOptions}
                                    value={programaSeleccionado}
                                    onChange={val => setProgramaSeleccionado(val)}
                                    placeholder="Seleccione un programa"
                                />
                            </div>
                            <div className="formGroup">
                                <label>Descripción:</label>
                                <textarea
                                    className="textarea"
                                    value={descripcion}
                                    onChange={e => setDescripcion(e.target.value)}
                                    placeholder="Descripción del programa"
                                />
                            </div>
                            <div className="formGroup">
                                <label>Estatus:</label>
                                <SingleSelect
                                    options={estatusOptions}
                                    value={estatus}
                                    onChange={val => setEstatus(val)}
                                    placeholder="Seleccione estatus"
                                />
                            </div>
                            <button className="saveButton" type="submit">Agregar</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Filtros y gráfica */}
            <div className="tableSection" style={{ marginBottom: 30 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 18 }}>
                    <SingleSelect
                        options={programaOptions}
                        value={filtros.programa}
                        onChange={val => setFiltros(f => ({ ...f, programa: val }))}
                        placeholder="Filtrar por programa"
                    />
                    <SingleSelect
                        options={estatusOptions}
                        value={filtros.estatus}
                        onChange={val => setFiltros(f => ({ ...f, estatus: val }))}
                        placeholder="Filtrar por estatus"
                    />
                    {/* Puedes agregar más filtros aquí */}
                </div>
                {/* Aquí va la gráfica */}
                <div style={{ background: '#f8f9fa', borderRadius: 8, padding: 24, minHeight: 220 }}>
                    <ChartComponent type="Bar" filter="avales" />
                </div> 
            </div>
        </div>
    );
}

export default SeguimientoInspeccion;