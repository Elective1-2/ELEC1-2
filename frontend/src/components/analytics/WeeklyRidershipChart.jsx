import React, { useEffect, useRef } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function WeeklyRidershipChart({ data, loading }) {
  const chartRef = useRef(null);

  useEffect(() => {
    // Force chart update when data changes
    if (chartRef.current) {
      chartRef.current.update();
    }
  }, [data]);

  const chartData = {
    labels: data.data?.map(d => d.day) || [],
    datasets: [{
      label: 'Total Passengers',
      data: data.data?.map(d => d.passengers) || [],
      backgroundColor: 'rgba(59, 130, 246, 0.7)',
      borderColor: '#3b82f6',
      borderWidth: 1,
      borderRadius: 6,
      hoverBackgroundColor: 'rgba(59, 130, 246, 0.9)'
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
        borderWidth: 1
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
          callback: (value) => value.toLocaleString()
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
      <Bar ref={chartRef} data={chartData} options={options} />
    </div>
  );
}

export default WeeklyRidershipChart;