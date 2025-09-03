import React from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend } from "chart.js";
import { Chart } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend);

const MixedChart = ({
    labels = [],
    barData = [],
    lineData = [],
    title = "Gráfica Mixta (Barras y Líneas)",
    barLabel = "Barras",
    lineLabel = "Líneas"
}) => {
    const data = {
        labels,
        datasets: [
            {
                type: "bar",
                label: barLabel,
                data: barData,
                backgroundColor: "rgba(255,99,132,0.6)",
            },
            {
                type: "line",
                label: lineLabel,
                data: lineData,
                borderColor: "rgba(54,162,235,1)",
                backgroundColor: "rgba(54,162,235,0.2)",
                fill: false,
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
            <Chart type="bar" data={data} options={options} />
        </div>
    );
};

export default MixedChart;