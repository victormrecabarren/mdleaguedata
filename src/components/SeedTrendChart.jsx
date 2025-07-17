import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    LineElement,
    PointElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
} from "chart.js";

ChartJS.register(
    LineElement,
    PointElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend
);

const SeedTrendChart = ({owners}) => {
    const weekLabels = Array.from({ length: 14 }, (_, i) => `Week ${i + 1}`);

    const colors = ["red", "blue", "green", "orange", "purple", "cyan", "magenta", "yellow", "brown", "pink", "gray", "lime"]

    const datasets = owners.map((owner, index) => {
        return {
            label: owner.realName,
            data: weekLabels.map((w) => owner.seeds[`${w} Seed`] || null),
            borderColor: colors[index % colors.length],
            backgroundColor: colors[index % colors.length],
            tension: 0.3,
            fill: false,
        };
    });

    const data = {
        labels: weekLabels.map((_, i) => `${i + 1}`), 
        datasets: datasets,
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                min: 1,
                max: owners.length,
                reverse: true, 
                ticks: {
                    stepSize: 1,
                },
                title: {
                    display: true,
                    text: "Seed (1 = Best)",
                },
            },
            x: {
                title: {
                    display: true,
                    text: "Week",
                },
            },
        },
        plugins: {
            legend: {
                position: "bottom",
            },
        },
    };

    return (
        <div style={{ width: "100%", height: "400px"}}>
            <Line data={data} options={options} />
        </div>
    );
};


export default SeedTrendChart;