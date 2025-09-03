import React from "react";
import { Radar } from "react-chartjs-2";
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from "chart.js";

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const data = {
    labels: ["A", "B", "C", "D", "E", "F"],
    datasets: [
        {
            label: "Desempeño",
            data: [65, 59, 90, 81, 56, 55],
            backgroundColor: "rgba(54, 162, 235, 0.2)",
            borderColor: "rgba(54, 162, 235, 1)",
            pointBackgroundColor: "rgba(54, 162, 235, 1)",
        },
    ],
};

const options = {
    responsive: true,
    plugins: {
        legend: { position: "top" },
        tooltip: { enabled: true },
    },
};

const RadarChart = () => (
    <div style={{ width: "90%", margin: "0 auto" }}>
        <h3 style={{ textAlign: "center" }}>Gráfica Radar</h3>
        <Radar data={data} options={options} />
    </div>
);

export default RadarChart;