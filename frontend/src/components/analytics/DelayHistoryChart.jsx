// src/components/analytics/DelayHistoryChart.jsx
import React, { useEffect, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function DelayHistoryChart({ data, loading }) {
  const chartRef = useRef(null);

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.update();
    }
  }, [data]);

  const chartData = {
    labels: data.data?.map(d => d.day) || [],
    datasets: [{
      label: 'Delay Minutes',
      data: data.data?.map(d => d.delayMinutes) || [],
      borderColor: '#f59e0b',
      backgroundColor: 'rgba(245, 158, 11, 0.1)',
      borderWidth: 2.5,
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#f59e0b',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 5,
      pointHoverRadius: 7
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    resizeDelay: 0,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: '#1e293b',
        padding: 12,
        titleColor: '#f1f5f9',
        bodyColor: '#e2e8f0',
        borderColor: '#334155',
        borderWidth: 1,
        callbacks: {
          label: (context) => `${context.parsed.y} minutes delayed`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: '#e5e7eb',
          drawBorder: false
        },
        ticks: {
          callback: (value) => `${value} min`
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    },
    animation: {
      duration: 750,
      easing: 'easeInOutQuart'
    }
  };

  if (loading) {
    return <div className="chart-loading">Loading chart...</div>;
  }

  return (
    <div className="chart-container" style={{ height: '280px', width: '100%' }}>
      <Line ref={chartRef} data={chartData} options={options} />
    </div>
  );
}

export default DelayHistoryChart;