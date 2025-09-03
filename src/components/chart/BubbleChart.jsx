import React from "react";
import { Bubble } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, Tooltip, Legend);

const BubbleChart = ({ data = [], title = "Gráfica de Burbujas", label = "Datos" }) => {
    const chartData = {
        datasets: [
            {
                label,
                data: Array.isArray(data) ? data : [],
                backgroundColor: "rgba(255,99,132,0.6)",
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
        scales: {
            x: { title: { display: true, text: "X" } },
            y: { title: { display: true, text: "Y" } },
        },
    };

    return (
        <div style={{ width: "100%", maxWidth: 800, margin: "0 auto" }}>
            <Bubble data={chartData} options={options} />
        </div>
    );
};

export default BubbleChart;