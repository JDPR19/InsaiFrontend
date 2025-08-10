import React, { useRef } from 'react';
import { Pie, Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title, CategoryScale, LinearScale, BarElement, PointElement, LineElement } from 'chart.js';

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    Title,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement
);

const COLORS = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4CAF50', '#9C27B0',
    '#FF9800', '#00BCD4', '#8BC34A', '#E91E63', '#607D8B'
];

function filtrarPorFecha(data, from, to, campo = 'created_at') {
    if (!from && !to) return data;
    return data.filter(item => {
        const fecha = item[campo]?.slice(0, 10);
        if (from && fecha < from) return false;
        if (to && fecha > to) return false;
        return true;
    });
}

// Agrupa dinámicamente por cualquier campo
function getLabelsYData(programas, groupBy) {
    if (!Array.isArray(programas) || programas.length === 0) {
        return { labels: ['Sin datos'], data: [0] };
    }
    const counts = {};
    programas.forEach(p => {
        const key = p[groupBy] || 'Sin dato';
        counts[key] = (counts[key] || 0) + 1;
    });
    return {
        labels: Object.keys(counts),
        data: Object.values(counts),
    };
}

const ChartComponent = ({ type = 'Bar', filter = 'estatus', from, to, programas = [] }) => {
    const chartRef = useRef(null);

    // Filtra los datos por fecha si corresponde
    const dataFiltrada = filtrarPorFecha(programas, from, to);

    // Obtiene labels y data según el filtro dinámico
    const { labels, data } = getLabelsYData(dataFiltrada, filter);

    const chartData = {
        labels,
        datasets: [
            {
                label: filter.charAt(0).toUpperCase() + filter.slice(1),
                data,
                backgroundColor: COLORS.slice(0, labels.length),
                hoverBackgroundColor: COLORS.slice(0, labels.length).map(
                    c => c + 'CC'
                ),
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            tooltip: {
                callbacks: {
                    label: function (tooltipItem) {
                        return `${tooltipItem.label}: ${tooltipItem.raw} unidades`;
                    },
                },
            },
            title: {
                display: true,
                text: 'Nivel de Actividades',
                font: { size: 18, family: 'Poppins, sans-serif', weight: 'bold' },
                padding: { top: 10, bottom: 20 },
                align: 'center',
                color: '#333',
            },
        },
    };

    let ChartTag;
    const chartTypeLower = (type || '').toLowerCase();
    if (chartTypeLower === 'bar') ChartTag = Bar;
    else if (chartTypeLower === 'line') ChartTag = Line;
    else if (chartTypeLower === 'pie') ChartTag = Pie;
    else return <p>Tipo de gráfica no soportado</p>;

    // Descargar la gráfica como imagen
    const handleDownload = () => {
    if (chartRef.current) {
        const chartInstance = chartRef.current;
        chartInstance.resize();
        const canvas = chartInstance.canvas;
        const ctx = canvas.getContext('2d');
        ctx.save();
        ctx.globalCompositeOperation = 'destination-over';
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const url = canvas.toDataURL('image/png');
        ctx.restore();
        const link = document.createElement('a');
        link.href = url;
        link.download = `grafica_${type}_${filter}.png`;
        link.click();
    }
};


    return (
        <div style={{ width: '100%', position: 'relative' }}>
            <button
                className="saveButton"
                style={{
                    position: 'absolute',
                    right: 0,
                    top: 0,
                    zIndex: 2,
                    padding: '6px 14px',
                    fontSize: '0.95rem',
                }}
                onClick={handleDownload}
                title="Descargar gráfica como imagen"
            >
                Descargar
            </button>
            <ChartTag
                ref={chartRef}
                data={chartData}
                options={options}
                width={800}
                height={400}
            />
        </div>
    );
};

export default ChartComponent;