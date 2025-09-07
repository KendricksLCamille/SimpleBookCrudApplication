import { API_URL, type BookStats } from '../types';
import {
    Chart,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    DoughnutController,
    BarController,
    BarElement,
    CategoryScale, LinearScale
} from 'chart.js';
import { useEffect, useState, useRef } from 'react';

// Register necessary Chart.js components
Chart.register(ArcElement, Title, Tooltip, Legend, DoughnutController, BarController, BarElement, CategoryScale, LinearScale);

const bookTitle = 'Book Statistics';

function useFetchStats() {
    const [data, setData] = useState<BookStats | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        fetch(`${API_URL}/api/books/stats`)
            .then(async (r) => {
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                return r.json();
            })
            .then((json) => {
                if (mounted) {
                    setData(json as BookStats);
                    setError(null);
                }
            })
            .catch((e: unknown) => {
                if (mounted) setError(String(e));
            })
            .finally(() => {
                if (mounted) setLoading(false);
            });
        return () => {
            mounted = false;
        };
    }, []);

    return { data, error, loading } as const;
}

function BookStatsToPieChartData(stats: BookStats) {
    const ROYGBIV = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'];
    const labels = Object.keys(stats);

    const labelList: string[] = [];
    const dataList: number[] = [];
    const colorList: string[] = [];

    for (let i = 0; i < labels.length; i++) {
        const label = labels[i];
        labelList.push(label);
        const color = ROYGBIV[i % ROYGBIV.length];
        colorList.push(color);
        const data = stats[label];
        dataList.push(data);
    }

    return {
        labels: labelList,
        datasets: [{
            label: bookTitle,
            data: dataList,
            backgroundColor: colorList,
            borderWidth: 1,
        }],
    };
}

export default function Statistics() {
    const { data, error, loading } = useFetchStats();
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstanceRef = useRef<Chart | null>(null);

    // State for chart type: 'doughnut' or 'bar'
    const [chartType, setChartType] = useState<'doughnut' | 'bar'>('doughnut');

    // Handle switch toggle
    const handleChartTypeChange = () => {
        setChartType(prev => (prev === 'doughnut' ? 'bar' : 'doughnut'));
    };

    useEffect(() => {
        if (data && chartRef.current) {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }
            const chartData = BookStatsToPieChartData(data);
            chartInstanceRef.current = new Chart(chartRef.current, {
                type: chartType, // Use selected chart type
                data: chartData,
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'bottom',
                        },
                        title: {
                            display: true,
                            text: bookTitle,
                        },
                    },
                },
            });
        }
    }, [data, chartType]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;
    if (!data) return <p>No data available.</p>;

    return (
        <div>
            <h2>{bookTitle}</h2>

            {/* Toggle switch for chart type */}
            <label style={{ display: 'block', marginBottom: '10px' }}>
                <input
                    type="checkbox"
                    checked={chartType === 'bar'}
                    onChange={handleChartTypeChange}
                />{' '}
                Switch to {chartType === 'doughnut' ? 'Bar Chart' : 'Doughnut Chart'}
            </label>

            {/* Canvas for Chart.js */}
            <canvas ref={chartRef} width="400" height="400"></canvas>
        </div>
    );
}