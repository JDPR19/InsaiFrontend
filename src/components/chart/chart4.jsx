import React from 'react';
import { Pie, Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title, CategoryScale, LinearScale, BarElement, PointElement, LineElement } from 'chart.js';

// Registro de los elementos necesarios de Chart.js
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

const ChartComponent = ({ type, filter }) => {
    const data = {
        labels: ['Cuarentena', 'Rutinas', 'Programas', 'Inspectores', 'Clientes'], // Etiquetas de las categorías
        datasets: [
            {
                label: filter === 'avales' ? 'Avales por vencer' : filter === 'clientes' ? 'Clientes Registrados' : 'Cuarentenas',
                data: [12, 19, 3, 5, 2], // Datos para la gráfica
                backgroundColor: [
                    '#FF6384', // Rojo
                    '#36A2EB', // Azul
                    '#FFCE56', // Amarillo
                    '#4CAF50', // Verde
                    '#9C27B0', // Morado
                ],
                hoverBackgroundColor: [
                    '#FF4374', // Rojo (hover)
                    '#1E90FF', // Azul (hover)
                    '#FFD700', // Amarillo (hover)
                    '#43A047', // Verde (hover)
                    '#AB47BC', // Morado (hover)
                ],
                borderWidth: 1, // Grosor del borde
            },
        ],
    };

    const options = {
        responsive: true, // Ajusta el tamaño automáticamente
        plugins: {
            legend: { 
                position: 'top', // Coloca la leyenda arriba
            },
            tooltip: {
                callbacks: {
                    label: function (tooltipItem) {
                        return `${tooltipItem.label}: ${tooltipItem.raw} unidades`;
                    },
                },
            },
            title: {
                display: true, // Muestra el título
                text: 'Nivel de Actividades', // Texto del título
                font: {
                    size: 18, // Tamaño de la fuente
                    family: 'Poppins, sans-serif', // Fuente personalizada
                    weight: 'bold', // Negrita
                },
                padding: {
                    top: 10, // Espaciado superior
                    bottom: 20, // Espaciado inferior
                },
                align: 'center', // Alineación del título
                color: '#333', // Color del texto
            },
        },
    };

    // Renderiza la gráfica según el tipo seleccionado
    if (type === 'Bar') {
        return <Bar data={data} options={options} />;
    } else if (type === 'line') {
        return <Line data={data} options={options} />;
    } else if (type === 'pie') {
        return <Pie data={data} options={options} />;
    } else {
        return <p>Tipo de gráfica no soportado</p>;
    }
};

export default ChartComponent;