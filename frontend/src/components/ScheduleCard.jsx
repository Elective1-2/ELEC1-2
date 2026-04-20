import React from 'react';
import '../css/schedule-card.css';

function ScheduleCard({ route, schedules, dayType }) {
  if (!route) return null;

  const formatTime = (timeString) => {
    if (!timeString) return '—';
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const formatTimeRange = (start, end) => {
    if (!start && !end) return '—';
    return `${formatTime(start)} — ${formatTime(end)}`;
  };

  const getDayTypeLabel = (type) => {
    switch (type) {
      case 'weekday': return 'Monday to Friday';
      case 'weekend': return 'Saturday to Sunday';
      case 'daily': return 'Daily';
      default: return type;
    }
  };

  return (
    <div className="schedule-card">
      <div className="schedule-card-header">
        <h2 className="schedule-title">{route.name}</h2>
        <span className="operating-days-badge">{getDayTypeLabel(route.operatingDays)}</span>
      </div>

      <div className="schedule-operating-hours">
        <div className="hours-row">
          <span className="hours-label">{route.startLocation} → {route.endLocation}</span>
          <span className="hours-value">{formatTimeRange(route.startTime, route.endTime)}</span>
        </div>
        <div className="hours-row">
          <span className="hours-label">{route.endLocation} → {route.startLocation}</span>
          <span className="hours-value">{formatTimeRange(route.returnStartTime, route.returnEndTime)}</span>
        </div>
      </div>

      <div className="schedule-tables">
        {/* Table 1: A → B */}
        <div className="schedule-table">
          <div className="table-header">
            <span className="direction">{route.startLocation} → {route.endLocation}</span>
            <span className="departure-label">Departure</span>
          </div>
          <div className="table-body">
            {schedules?.toEnd?.length > 0 ? (
              schedules.toEnd.map((time, idx) => (
                <div key={idx} className="table-row">
                  <span className="time">{formatTime(time)}</span>
                </div>
              ))
            ) : (
              <div className="empty-message">No schedules found</div>
            )}
          </div>
        </div>

        {/* Table 2: B → A */}
        <div className="schedule-table">
          <div className="table-header">
            <span className="direction">{route.endLocation} → {route.startLocation}</span>
            <span className="departure-label">Departure</span>
          </div>
          <div className="table-body">
            {schedules?.toStart?.length > 0 ? (
              schedules.toStart.map((time, idx) => (
                <div key={idx} className="table-row">
                  <span className="time">{formatTime(time)}</span>
                </div>
              ))
            ) : (
              <div className="empty-message">No schedules found</div>
            )}
          </div>
        </div>
      </div>

      <div className="schedule-footer">
        <span className="day-type-indicator">Showing: {getDayTypeLabel(dayType)}</span>
      </div>
    </div>
  );
}

export default ScheduleCard;