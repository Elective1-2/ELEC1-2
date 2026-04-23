import React from 'react';

function SummaryCards({ summary, loading }) {
  if (loading) {
    return (
      <div className="analytics-summary-grid">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="summary-card skeleton">
            <div className="summary-icon"></div>
            <div className="summary-content">
              <div className="skeleton-value"></div>
              <div className="skeleton-label"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="analytics-summary-grid">
      <div className="summary-card">
        <div className="summary-content">
          <div className="summary-value">{summary?.completedTrips || 0}</div>
          <div className="summary-label">Completed Trips Today</div>
        </div>
      </div>
      <div className="summary-card">
        <div className="summary-content">
          <div className="summary-value">{summary?.avgPassengersPerTrip || 0}</div>
          <div className="summary-label">Avg Passengers/Trip</div>
        </div>
      </div>
      <div className="summary-card">
        <div className="summary-content">
          <div className="summary-value">{summary?.delayedTrips || 0}</div>
          <div className="summary-label">Delayed Trips Today</div>
        </div>
      </div>
      <div className="summary-card">
        <div className="summary-content">
          <div className="summary-value">{summary?.activeRoutes || 0}</div>
          <div className="summary-label">Active Routes Today</div>
        </div>
      </div>
    </div>
  );
}

export default SummaryCards;