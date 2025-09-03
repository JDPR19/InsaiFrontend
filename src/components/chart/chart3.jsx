import React from "react";
import { Bar } from "react-chartjs-2";

const BarChart = ({ labels = [], data = [], title = "Nivel de Actividad", label = "Datos" }) => {
    const chartData = {
        labels,
        datasets: [
            {
                label,
                data,
                backgroundColor: [
                    "rgba(255, 99, 132, 0.2)",
                    "rgba(54, 162, 235, 0.2)",
                    "rgba(255, 206, 86, 0.2)",
                    "rgba(75, 192, 192, 0.2)",
                    "rgba(153, 102, 255, 0.2)",
                    "rgba(255, 159, 64, 0.2)",
                ],
                borderColor: [
                    "rgba(255, 99, 132, 1)",
                    "rgba(54, 162, 235, 1)",
                    "rgba(255, 206, 86, 1)",
                    "rgba(75, 192, 192, 1)",
                    "rgba(153, 102, 255, 1)",
                    "rgba(255, 159, 64, 1)",
                ],
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { position: "top" },
            tooltip: { enabled: true },
            title: {
                display: true,
                text: title,
                font: { size: 18, family: 'Poppins, sans-serif', weight: 'bold' },
                padding: { top: 10, bottom: 20 },
                align: 'center',
                color: '#333',
            },
        },
    };

    return (
        <div style={{ width: "100%", maxWidth: 800, margin: "0 auto" }}>
            <Bar data={chartData} options={options} />
        </div>
    );
};

export default BarChart;