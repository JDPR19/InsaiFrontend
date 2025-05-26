import React from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut, Bar, Line } from "react-chartjs-2";

// Registrar los elementos necesarios para Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

// Datos para la gráfica
const data = {
    labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"], // Etiquetas
    datasets: [
        {
            label: "Votes", // Etiqueta del dataset
            data: [12, 19, 3, 5, 2, 3], // Valores de la gráfica
            backgroundColor: [
                "rgba(255, 99, 132, 0.2)", // Colores de fondo
                "rgba(54, 162, 235, 0.2)",
                "rgba(255, 206, 86, 0.2)",
                "rgba(75, 192, 192, 0.2)",
                "rgba(153, 102, 255, 0.2)",
                "rgba(255, 159, 64, 0.2)",
            ],
            borderColor: [
                "rgba(255, 99, 132, 1)", // Colores del borde
                "rgba(54, 162, 235, 1)",
                "rgba(255, 206, 86, 1)",
                "rgba(75, 192, 192, 1)",
                "rgba(153, 102, 255, 1)",
                "rgba(255, 159, 64, 1)",
            ],
            borderWidth: 1, // Ancho del borde
        },
    ],
};

// Opciones para la gráfica
const options = {
    responsive: true, // Hace que la gráfica sea responsiva
    plugins: {
        legend: {
            position: "top", // Posición de la leyenda
        },
        tooltip: {
            enabled: true, // Habilita los tooltips
        },
    },
};

const Chart = () => {
    return (
        <div style={{ width: "30%", margin: "0 auto" }}>
            <Doughnut data={data} options={options} />
        </div>
    );
};

export default Chart;