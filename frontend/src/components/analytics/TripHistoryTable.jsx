import React from 'react';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const formatTime = (datetime) => {
  if (!datetime) return '—';
  return new Date(datetime).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

function TripHistoryTable({ data, loading, pagination, onPageChange }) {
  if (loading) {
    return (
      <div className="trip-table-container">
        <table className="trip-table">
          <thead>
            <tr>
              <th>Bus #</th>
              <th>Route</th>
              <th>Driver</th>
              <th>Date</th>
              <th>Scheduled</th>
              <th>Actual</th>
              <th>Passengers</th>
              <th>Delay</th>
            </tr>
          </thead>
          <tbody>
            <tr><td colSpan="8" className="table-loading">Loading trips...</td></tr>
          </tbody>
        </table>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="trip-table-container">
        <table className="trip-table">
          <thead>
            <tr>
              <th>Bus #</th>
              <th>Route</th>
              <th>Driver</th>
              <th>Date</th>
              <th>Scheduled</th>
              <th>Actual</th>
              <th>Passengers</th>
              <th>Delay</th>
            </tr>
          </thead>
          <tbody>
            <tr><td colSpan="8" className="table-empty">No trips found</td></tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <>
      <div className="trip-table-container">
        <table className="trip-table">
          <thead>
            <tr>
              <th>Bus #</th>
              <th>Route</th>
              <th>Driver</th>
              <th>Date</th>
              <th>Scheduled</th>
              <th>Actual</th>
              <th>Passengers</th>
              <th>Delay</th>
            </tr>
          </thead>
          <tbody>
            {data.map(trip => (
              <tr key={trip.trip_id}>
                <td>
                  <span className="bus-number">{trip.bus_number}</span>
                  {trip.plate_number && <span className="bus-plate">{trip.plate_number}</span>}
                </td>
                <td>{trip.route_name}</td>
                <td>{trip.driver_name}</td>
                <td>{formatDate(trip.scheduled_departure)}</td>
                <td>{formatTime(trip.scheduled_departure)}</td>
                <td>{formatTime(trip.actual_departure)}</td>
                <td>{trip.passenger_count || '—'}</td>
                <td>
                  {trip.delay_minutes ? (
                    <span className="delay-badge">{trip.delay_minutes} min</span>
                  ) : (
                    <span className="ontime-badge">On Time</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination.pages > 1 && (
        <div className="pagination">
          <button
            className="page-btn"
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
          >
            ←
          </button>
          <span className="page-info">
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            className="page-btn"
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.pages}
          >
            →
          </button>
        </div>
      )}
    </>
  );
}

export default TripHistoryTable;