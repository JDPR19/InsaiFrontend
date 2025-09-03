import React from "react";
import { PolarArea } from "react-chartjs-2";
import { Chart as ChartJS, RadialLinearScale, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(RadialLinearScale, ArcElement, Tooltip, Legend);

const COLORS = [
    "rgba(255,99,132,0.6)",
    "rgba(54,162,235,0.6)",
    "rgba(255,206,86,0.6)",
    "rgba(75,192,192,0.6)",
    "rgba(153,102,255,0.6)",
];

const PolarAreaChart = ({ labels = [], data = [], title = "Gráfica Polar Area", label = "Datos" }) => {
    const chartData = {
        labels,
        datasets: [
            {
                label,
                data,
                backgroundColor: COLORS.slice(0, labels.length),
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
            <PolarArea data={chartData} options={options} />
        </div>
    );
};

export default PolarAreaChart;