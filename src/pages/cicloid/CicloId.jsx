import React, { useState } from 'react';
import styles from './ciclo.module.css';
import icon from '../../components/iconos/iconos';
// import Chart from '../../components/chart/Chart';
import escudoLogo from '../../../public/escudobien.svg'; // Ajusta la ruta si tu logo está en otra carpeta

const procesos = [
    { key: 'productor', label: 'Productor', icon: icon.farmer },
    { key: 'propiedad', label: 'Propiedad', icon: icon.home },
    { key: 'solicitud', label: 'Solicitud', icon: icon.solicitud },
    { key: 'planificacion', label: 'Planificación', icon: icon.calendario },
    { key: 'inspeccion', label: 'Inspección', icon: icon.insai },
];

const acciones = [
    { key: 'registrar', icon: icon.crear, label: 'Registrar' },
    { key: 'editar', icon: icon.editar, label: 'Editar' },
    { key: 'ver', icon: icon.ver, label: 'Ver info' },
    { key: 'exportar', icon: icon.pdf5, label: 'Exportar' },
    { key: 'eliminar', icon: icon.eliminar1, label: 'Eliminar' },
];

export default function CicloId() {
    // const { id: productorId } = useParams();
    const [selectedProceso, setSelectedProceso] = useState(null);
    const [filtro, setFiltro] = useState({ propiedad: '', fecha: '' });

    // Simulación de datos para la gráfica
    const chartLabels = ['14 sep', '15 sep', '16 sep', '17 sep', '18 sep'];
    const chartData = [
        [10, 12, 11, 13, 12], // Inspección
        [9, 11, 10, 12, 11],  // Solicitud
        [8, 10, 9, 11, 10],   // Planificación
    ];
    const chartColors = ['#539E43', '#3B82F6', '#F59E42'];

    // Agrupa cartas en filas de 3
    const filas = [];
    for (let i = 0; i < procesos.length; i += 3) {
        filas.push(procesos.slice(i, i + 3));
    }

    return (
        <div className={styles.cicloBg}>
            {/* Marca de agua escudo */}
            <img src={escudoLogo} alt="Marca de agua" className={styles.bgEscudo} />

            {/* Botón volver fijo lateral */}
            <div className={styles.volverLateral}>
                <button className={styles.btnVolver} onClick={() => window.history.back()}>
                    <img src={icon.flecha} alt="Volver" /> Volver
                </button>
            </div>

            <div className={styles.cicloMain}>
                <h1 className={styles.cicloTitulo}>Ciclo de Gestión por Productor</h1>
                <div className={styles.cicloCardsGrid}>
                    {filas.map((fila, idxFila) => (
                        <div key={idxFila} className={styles.cicloCardsRow}>
                            {fila.map(proceso => (
                                <div
                                    key={proceso.key}
                                    className={`${styles.cicloCard} ${selectedProceso === proceso.key ? styles.cicloCardSelected : ''}`}
                                    onClick={() => setSelectedProceso(proceso.key)}
                                    tabIndex={0}
                                >
                                    <img src={proceso.icon} alt={proceso.label} className={styles.cicloCardIcon} />
                                    <h2 className={styles.cicloCardTitle}>{proceso.label}</h2>
                                    <div className={styles.cicloCardActions}>
                                        {acciones.map(acc => (
                                            <button
                                                key={acc.key}
                                                className={styles.cicloCardActionBtn}
                                                title={acc.label}
                                                tabIndex={-1}
                                            >
                                                <img src={acc.icon} alt={acc.label} className={styles.cicloCardActionIcon} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
                <div className={styles.cicloSeguimientoWide}>
                    <div className={styles.cicloSeguimientoHeader}>
                        <img src={icon.ojito} alt="Seguimiento" className={styles.cicloSeguimientoIcon} />
                        <h2>Seguimiento y Trazabilidad</h2>
                        <div className={styles.cicloSeguimientoFiltros}>
                            <select
                                value={filtro.propiedad}
                                onChange={e => setFiltro(f => ({ ...f, propiedad: e.target.value }))}
                                className={styles.cicloFiltroSelect}
                            >
                                <option value="">Propiedad</option>
                                <option value="prop1">Propiedad 1</option>
                                <option value="prop2">Propiedad 2</option>
                            </select>
                            <input
                                type="date"
                                value={filtro.fecha}
                                onChange={e => setFiltro(f => ({ ...f, fecha: e.target.value }))}
                                className={styles.cicloFiltroDate}
                            />
                            <button className={styles.cicloFiltroBtn}>
                                <img src={icon.lupa} alt="Buscar" />
                            </button>
                        </div>
                    </div>
                    <Chart
                        labels={chartLabels}
                        data={chartData}
                        colors={chartColors}
                        title="Trazabilidad de Inspecciones y Movimientos"
                    />
                </div>
            </div>
        </div>
    );
}