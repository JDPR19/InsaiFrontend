import React, { useRef, useState } from 'react';
import { Pie, Bar, Line, Radar, PolarArea, Bubble, Scatter } from 'react-chartjs-2';
import SingleSelect from '../selectmulti/SingleSelect';
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
    Filler
} from 'chart.js';

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
    Filler
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

    const options = {
        responsive: true,
        maintainAspectRatio: false, // <-- CLAVE para que respete el alto del contenedor
        plugins: {
            legend: { 
                position: 'top',
                labels: {
                    color: '#98c79a', 
                    font: { size: 13 }
                }
            },
            tooltip: {
                callbacks: {
                    label: function (tooltipItem) {
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
            height: chartSize.height + 130,
            minHeight: 400,
            margin: '0 auto',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
            marginBottom: 60,
            
            
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
            <div style={{
                width: '100%',
                height: chartSize.height,
                minHeight: 400,
                maxHeight: 600,
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