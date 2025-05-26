import React from "react";
import { Line } from "react-chartjs-2";

const data = {
    labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
    datasets: [
        {
            label: "Votes",
            data: [12, 19, 3, 5, 2, 3],
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
        },
    ],
};

const options = {
    responsive: true,
    plugins: {
        legend: {
            position: "top",
        },
        tooltip: {
            enabled: true,
        },
    },
};

const LineChart = () => {
    return (
        <div style={{ width: "90%", margin: "0 auto" }}>
            <h3 style={{ textAlign: "center" }}>Gráfica de Líneas</h3>
            <Line data={data} options={options} />
        </div>
    );
};

export default LineChart;