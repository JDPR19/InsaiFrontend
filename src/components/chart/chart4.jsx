import React, { useRef, useState } from 'react';
import { Pie, Bar, Line, Radar, PolarArea } from 'react-chartjs-2';
import SingleSelect from '../selectmulti/SingleSelect';
import annotationPlugin from 'chartjs-plugin-annotation';
ChartJS.register(annotationPlugin);
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
    SubTitle
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

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
    ChartDataLabels
);

const COLORS = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4CAF50', '#9C27B0',
    '#FF9800', '#00BCD4', '#8BC34A', '#E91E63', '#607D8B'
];

const chartTypes = [
    { value: 'bar', label: 'Barras' },
    { value: 'line', label: 'Líneas' },
    { value: 'pie', label: 'Pie' },
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
        switch (selectedType) {
            case 'radar':
            case 'polar':
                return {
                    labels,
                    datasets: [
                        {
                            label,
                            data,
                            backgroundColor: COLORS.slice(0, labels.length),
                            borderColor: COLORS.slice(0, labels.length),
                        }
                    ]
                };
            case 'bubble':
                // Espera data = [{x, y, r}, ...]
                return {
                    datasets: [
                        {
                            label,
                            data: Array.isArray(data) && data.length && typeof data[0] === 'object' ? data : [],
                            backgroundColor: COLORS[0],
                        }
                    ]
                };
            case 'scatter':
                // Espera data = [{x, y}, ...]
                return {
                    datasets: [
                        {
                            label,
                            data: Array.isArray(data) && data.length && typeof data[0] === 'object' ? data : [],
                            backgroundColor: COLORS[1],
                        }
                    ]
                };
            default:
                // bar, line, pie
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
        }
    };

        // Valores para mostrar
    const total = Array.isArray(data) ? data.reduce((a, b) => a + b, 0) : 0;
    const promedio = Array.isArray(data) && data.length ? (total / data.length).toFixed(2) : 0;
    const maximo = Array.isArray(data) && data.length ? Math.max(...data) : 0;
    const minimo = Array.isArray(data) && data.length ? Math.min(...data) : 0;
    const cantidad = Array.isArray(data) ? data.length : 0;

    const options = {
        responsive: true,
        maintainAspectRatio: false, // <-- CLAVE para que respete el alto del contenedor
        plugins: {
            legend: { 
                position: 'top',
                labels: {
                    color: '#98c79a',
                    font: { size: 13 },
                    generateLabels: (chart) => {
                        const defaultLabels = ChartJS.defaults.plugins.legend.labels.generateLabels(chart);
                        const dataset = chart.data.datasets[0];
                        const data = dataset.data;
                        const total = data.reduce((a, b) => a + b, 0);

                        return defaultLabels.map((label, i) => ({
                        ...label,
                        text: `${label.text} (${data[i]} - ${((data[i] / total) * 100).toFixed(1)}%)`
                        }));
                    }
                }
            },
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
                        return `${tooltipItem.label || ''}: ${tooltipItem.raw} unidades`;
                    },
                },
            },
            title: {
                display: true,
                text: title,
                font: { size: 18, family: 'Poppins, sans-serif', weight: 'bold' },
                padding: { top: 10, bottom: 20 },
                align: 'center',
                color: '#98c79a',
            },
            subtitle: {
                display: true,
                text: `Total: ${total} | Promedio: ${promedio} | Máx: ${maximo} | Mín: ${minimo} | Datos: ${cantidad} `,
                color: '#aaa',
                font: { size: 14, family: 'Poppins, sans-serif' },
                padding: { bottom: 10 }
            },
            datalabels: {
                color: '#98c79a',
                anchor: 'end',
                align: 'top',
                font: { weight: 'bold' },
                formatter: (value, context) => {
                    // Muestra valor y porcentaje si es pie/polar
                    if (selectedType === 'pie' || selectedType === 'polar') {
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percent = ((value / total) * 100).toFixed(1);
                        return `${value} (${percent}%)`;
                    }
                    return value;
                }
            },
            // annotation: {
            //     annotations: {
            //         lineaReferencia: {
            //         type: 'line',
            //         yMin: 50,
            //         yMax: 50,
            //         borderColor: 'red',
            //         borderWidth: 2,
            //         label: {
            //             content: 'Meta',
            //             enabled: true,
            //             position: 'end'
            //         }
            //         }
            //     }
            // }
        },
        scales: (selectedType === 'bar' || selectedType === 'line' || selectedType === 'scatter' || selectedType === 'bubble')
            ? {
                x: {
                    title: { display: true, text: 'X', color: '#98c79a' },
                    ticks: { color: '#98c79a' } 
                },
                y: {
                    title: { display: true, text: 'Y', color: '#98c79a' },
                    ticks: { color: '#98c79a' }
                }
            }
            : undefined
    };

    let ChartTag;
    switch (selectedType) {
        case 'bar': ChartTag = Bar; break;
        case 'line': ChartTag = Line; break;
        case 'pie': ChartTag = Pie; break;
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
        ? { width: 320, height: 320 }
        : { width: 800, height: 360 };

    return (
        <div style={{
            width: '100%',
            maxWidth: 800,
            height: chartSize.height + 120,
            minHeight: 400,
            margin: '0 auto',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
            marginBottom: 10,
            marginTop: 10
        }}>
            <div style={{
                marginBottom: 25,
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
            <div
                style={{
                    margin: '10px 0 18px 0',
                    fontWeight: 600,
                    color: '#98c79a',
                    fontSize: '1.08em',
                    letterSpacing: '0.5px',
                    display: 'flex',
                    gap: 24,
                    flexWrap: 'wrap'
                }}
            >
                <span>Total: {total}</span>
                <span>Promedio: {promedio}</span>
                <span>Máximo: {maximo}</span>
                <span>Mínimo: {minimo}</span>
                <span>Datos: {cantidad}</span>
            </div>
            <div style={{
                width: '100%',
                height: chartSize.height,
                minHeight: 200,
                maxHeight: 300,
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
                        display: 'block'
                    }}
                />
            </div>
        </div>
    );
};

export default ChartSwitcher;