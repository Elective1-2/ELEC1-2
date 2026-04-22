import React from 'react';

function RoutePerformanceList({ data, loading }) {
  if (loading) {
    return <div className="chart-loading">Loading route performance...</div>;
  }

  if (!data || data.length === 0) {
    return <div className="no-data">No route performance data available</div>;
  }

  const maxPassengers = data[0]?.total_passengers || 1;

  return (
    <div className="route-performance-list">
      {data.map((route, index) => (
        <div key={route.route_id} className="route-performance-item">
          <div className="route-rank">#{index + 1}</div>
          <div className="route-info">
            <div className="route-name">{route.route_name}</div>
            <div className="route-stats">
              <span>{route.trip_count} trips</span>
              <span>•</span>
              <span>Avg {route.avg_passengers} pax/trip</span>
            </div>
          </div>
          <div className="route-bar-container">
            <div 
              className="route-bar"
              style={{ 
                width: `${(route.total_passengers / maxPassengers) * 100}%`,
                backgroundColor: '#3b82f6'
              }}
            />
          </div>
          <div className="route-total">{route.total_passengers.toLocaleString()}</div>
        </div>
      ))}
    </div>
  );
}

export default RoutePerformanceList;