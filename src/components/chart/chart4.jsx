import React, { useRef, useState } from 'react';
import { Pie, Bar, Line, Radar, PolarArea, Doughnut} from 'react-chartjs-2';
import SingleSelect from '../selectmulti/SingleSelect';
import annotationPlugin from 'chartjs-plugin-annotation';
import ChartDataLabels from 'chartjs-plugin-datalabels';

import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    Title,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    RadialLinearScale,
    Filler,
    SubTitle,
} from 'chart.js';

ChartJS.register(annotationPlugin);
ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    Title,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    RadialLinearScale,
    Filler,
    SubTitle,
    annotationPlugin,
    ChartDataLabels,
);

const COLORS = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4CAF50', '#9C27B0',
    '#FF9800', '#00BCD4', '#8BC34A', '#E91E63', '#607D8B'
];

const chartTypes = [
    { value: 'bar', label: 'Barras' },
    { value: 'pie', label: 'Pie' },
    { value: 'doughnut', label: 'Dona' },
    { value: 'line', label: 'Líneas' },
    { value: 'radar', label: 'Radar' },
    { value: 'polar', label: 'Polar Area' },
];

const ChartSwitcher = ({
    type = 'bar',
    labels = [],
    data = [],
    title = 'Gráfica',
    label = 'Datos'
}) => {
    const chartRef = useRef(null);
    const [selectedType, setSelectedType] = useState(type);

    // Estructura de datos para cada tipo de gráfica
    const getChartData = () => {
            if (
            (selectedType === 'bar' || selectedType === 'line') &&
            Array.isArray(data) &&
            data.length > 0 &&
            typeof data[0] === 'object' &&
            data[0].data
        ) {
            return {
                labels,
                datasets: data.map((serie, idx) => ({
                    label: serie.label || `Serie ${idx + 1}`,
                    data: serie.data,
                    backgroundColor: COLORS[idx % COLORS.length],
                    borderColor: COLORS[idx % COLORS.length],
                    fill: selectedType === 'line' ? true : false,
                    borderWidth: 1,
                }))
            };
        }
        return {
            labels,
            datasets: [
                {
                    label,
                    data,
                    backgroundColor: COLORS.slice(0, labels.length),
                    borderColor: COLORS.slice(0, labels.length),
                    fill: selectedType === 'line' ? true : false,
                    borderWidth: 1,
                }
            ]
        };
    };

        // Valores para mostrar
    const flatData = Array.isArray(data)
        ? (typeof data[0] === 'number'
            ? data
            : (Array.isArray(data[0]?.data)
                ? data.flatMap(d => d.data).filter(v => typeof v === 'number')
                : []))
        : [];
    const total = flatData.reduce((a, b) => a + b, 0);
    const promedio = flatData.length ? (total / flatData.length).toFixed(2) : 0;
    const maximo = flatData.length ? Math.max(...flatData) : 0;
    const minimo = flatData.length ? Math.min(...flatData) : 0;
    const cantidad = flatData.length;

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
            padding: {
                top: 0, 
                bottom: 0,
            }
        }, 
        plugins: {      
            tooltip: {
                callbacks: {
                    label: function (tooltipItem) {
                        // Muestra valor y porcentaje si es pie/polar
                        if (selectedType === 'pie' || selectedType === 'polar') {
                            const total = tooltipItem.dataset.data.reduce((a, b) => a + b, 0);
                            const value = tooltipItem.raw;
                            const percent = ((value / total) * 100).toFixed(1);
                            return `${tooltipItem.label}: ${value} (${percent}%)`;
                        }
                        return `${tooltipItem.dataset.label || ''}${tooltipItem.label ? ' - ' + tooltipItem.label : ''}: ${tooltipItem.raw} unidades`;
                    },
                },
            },
            title: {
                display: true,
                text: title,
                font: { size: 18, family: 'Poppins, sans-serif', weight: 'bold' },
                padding: { top: 0, bottom: 10 },
                align: 'center',
                color: '#98c79a',
            },
            subtitle: {
                display: true,
                text: `Total: ${total} | Promedio: ${promedio} | Máx: ${maximo} | Mín: ${minimo} | Datos: ${cantidad} `,
                color: '#539E43',
                font: { size: 14, family: 'Poppins, sans-serif' },
                padding: { bottom: 30 }
            },    
            datalabels: {
                color: '#539E43',
                anchor: 'end',
                align: 'top',
                font: { weight: 'bold' },
                formatter: (value, context) => {
                    // Muestra valor y porcentaje si es pie/polar
                    if (selectedType === 'pie' || selectedType === 'polar' || selectedType === 'bar' || selectedType === 'line' ) {
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percent = ((value / total) * 100).toFixed(1);
                        return `${value} (${percent}%)`;
                    }
                    return value;
                }
            },
            legend: {
                position: 'bottom',       
                labels: {
                    padding: 25,
                    color: '#539E43',
                    font: { size: 13 },
                    usePointStyle: true,
                    generateLabels: (chart) => {
                        const type = chart.config.type; // 'bar' | 'line' | 'pie' | 'radar' | 'polarArea'
                        const perLabelTypes = new Set(['pie', 'doughnut', 'polarArea']);

                        // 1) Leyenda por label: pie/doughnut/polarArea
                        if (perLabelTypes.has(type)) {
                            const ds = chart.data.datasets[0] || { data: [], backgroundColor: [], borderColor: [] };
                            const total = ds.data.reduce((a, b) => a + (Number(b) || 0), 0) || 1;

                            return chart.data.labels.map((lbl, i) => {
                                const bg = Array.isArray(ds.backgroundColor) ? ds.backgroundColor[i] : ds.backgroundColor;
                                const br = Array.isArray(ds.borderColor) ? ds.borderColor[i] : ds.borderColor;
                                const val = Number(ds.data[i] ?? 0);
                                const pointHidden = chart.getDatasetMeta(0)?.data?.[i]?.hidden ?? false;

                                return {
                                    text: `${lbl} (${val} - ${((val / total) * 100).toFixed(1)}%)`,
                                    fillStyle: bg ?? '#539E43',
                                    strokeStyle: br ?? bg ?? '#539E43',
                                    lineWidth: 1,
                                    hidden: !!pointHidden,
                                    index: i,          
                                    datasetIndex: 0,
                                };
                            });
                        }

                        const dsets = chart.data.datasets || [];
                        if (dsets.length > 1) {
                            return dsets.map((ds, i) => {
                                const fill = Array.isArray(ds.backgroundColor) ? (ds.backgroundColor[0] ?? '#539E43') : (ds.backgroundColor ?? '#539E43');
                                const stroke = Array.isArray(ds.borderColor) ? (ds.borderColor[0] ?? fill) : (ds.borderColor ?? fill);
                                return {
                                    text: ds.label ?? `Serie ${i + 1}`,
                                    fillStyle: fill,
                                    strokeStyle: stroke,
                                    lineWidth: 1,
                                    hidden: chart.getDatasetMeta(i)?.hidden ?? false,
                                    datasetIndex: i, // toggle por dataset
                                };
                            });
                        }
                        // Un solo dataset => mostramos por label
                        const ds0 = dsets[0] || { data: [], backgroundColor: [], borderColor: [] };
                        return chart.data.labels.map((lbl, i) => {
                            const bg = Array.isArray(ds0.backgroundColor) ? ds0.backgroundColor[i] : ds0.backgroundColor;
                            const br = Array.isArray(ds0.borderColor) ? ds0.borderColor[i] : ds0.borderColor;
                            const pointHidden = chart.getDatasetMeta(0)?.data?.[i]?.hidden ?? false;
                            const val = Number(ds0.data?.[i] ?? 0);
                            return {
                                text: `${lbl} (${val})`,
                                fillStyle: bg ?? '#539E43',
                                strokeStyle: br ?? bg ?? '#539E43',
                                lineWidth: 1,
                                hidden: !!pointHidden,
                                index: i,          // toggle por punto (índice de label)
                                datasetIndex: 0,
                            };
                        });
                    }
                },
                onClick: (e, legendItem, legend) => {
                    const chart = legend.chart;
                    const type = chart.config.type;
                    const perLabelTypes = new Set(['pie', 'doughnut', 'polarArea']);

                    // Toggle por punto (label index)
                    if (perLabelTypes.has(type) || typeof legendItem.index === 'number') {
                        chart.toggleDataVisibility(legendItem.index);
                        chart.update();
                        return;
                    }
                    // Toggle por dataset
                    if (typeof legendItem.datasetIndex === 'number') {
                        const i = legendItem.datasetIndex;
                        chart.setDatasetVisibility(i, !chart.isDatasetVisible(i));
                        chart.update();
                    }
                },
            },
        },
        scales: (selectedType === 'bar' || selectedType === 'line' || selectedType === 'scatter' || selectedType === 'bubble')
            ? {
                x: {
                    title: { display: true, text: 'X', color: '#539E43' },
                    ticks: { color: '#539E43' },
                    grid: { color: '#98c79a' }
                },
                y: {
                    title: { display: true, text: 'Y', color: '#539E43' },
                    ticks: { color: '#539E43' },
                    grid: { color: '#98c79a' }
                }
            }
            : undefined
    };
    

    let ChartTag;
    switch (selectedType) {
        case 'bar': ChartTag = Bar; break;
        case 'pie': ChartTag = Pie; break;
        case 'doughnut': ChartTag = Doughnut; break;
        case 'line': ChartTag = Line; break;
        case 'radar': ChartTag = Radar; break;
        case 'polar': ChartTag = PolarArea; break;
        default: return <p>Tipo de gráfica no soportado</p>;
    }

    // Descargar la gráfica como imagen
    const handleDownload = () => {
        if (chartRef.current) {
            const chartInstance = chartRef.current;
            const canvas = chartInstance.canvas;
            const ctx = canvas.getContext('2d');
            ctx.save();
            ctx.globalCompositeOperation = 'destination-over';
            ctx.fillStyle = '#fff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.restore();
            const url = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = url;
            link.download = `grafica Tipo: ${selectedType}.png`;
            link.click();
        }
    };

    // Tamaño específico para graficas
    const chartSize = (selectedType === 'pie' || selectedType === 'polar' || selectedType === 'radar') 
        ? { width: 320, height: 320 ,}
        : { width: 800, height: 360 };

    return (
        <div style={{
            width: '100%',
            maxWidth: 800,
            height: chartSize.height + 100,
            minHeight: 400,
            margin: '0 auto',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
        }}>
            <div style={{
                marginBottom: 40,
                maxWidth: 220,
                minWidth: 140,
                width: '100%',
                display: 'block',
                marginLeft:20
            }}>
                <label htmlFor="chartType" style={{ marginBottom: 10, display: 'block' }}>Tipo de gráfica:</label>
                <SingleSelect
                    id="chartTypeSingle"
                    options={chartTypes}
                    value={chartTypes.find(opt => opt.value === selectedType)}
                    onChange={option => setSelectedType(option.value)}
                    placeholder="Tipo de gráfica"
                />
            </div>
            <button
                className="saveButton"
                style={{
                    position: 'absolute',
                    right: 20,
                    top: 5,
                    zIndex: 2,
                    padding: '6px 14px',
                    fontSize: '0.95rem',
                }}
                onClick={handleDownload}
                title="Descargar gráfica como imagen"
            >
                Descargar
            </button>
            <div style={{
                width: '100%',
                height: chartSize.height,
                minHeight: 200,
                maxHeight: 500,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <ChartTag
                    ref={chartRef}
                    data={getChartData()}
                    options={options}
                    width={chartSize.width}
                    height={chartSize.height}
                    style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        width: '100%',
                        height: '100%',
                        display: 'block',
                    }}
                />
            </div>
        </div>
    );
};

export default ChartSwitcher;