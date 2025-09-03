import React from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const AreaChart = ({ labels = [], data = [], title = "Gráfica de Área", label = "Datos" }) => {
    const chartData = {
        labels,
        datasets: [
            {
                label,
                data,
                fill: true,
                backgroundColor: "rgba(75,192,192,0.2)",
                borderColor: "rgba(75,192,192,1)",
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
            <Line data={chartData} options={options} />
        </div>
    );
};

export default AreaChart;