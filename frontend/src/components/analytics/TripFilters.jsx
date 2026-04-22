// src/components/analytics/TripFilters.jsx
import React from 'react';

function TripFilters({ filters, routes, onFilterChange, onClearFilters }) {
  return (
    <div className="trip-filters">
      <div className="filter-group">
        <input
          type="text"
          placeholder="Search by bus number..."
          value={filters.bus}
          onChange={(e) => onFilterChange('bus', e.target.value)}
          className="filter-input"
        />
      </div>
      <div className="filter-group">
        <select
          value={filters.route}
          onChange={(e) => onFilterChange('route', e.target.value)}
          className="filter-select"
        >
          <option value="">All Routes</option>
          {routes.map(route => (
            <option key={route.route_id} value={route.route_id}>
              {route.name}
            </option>
          ))}
        </select>
      </div>
      <div className="filter-group date-range">
        <input
          type="date"
          value={filters.dateStart}
          onChange={(e) => onFilterChange('dateStart', e.target.value)}
          className="filter-input"
        />
        <span>to</span>
        <input
          type="date"
          value={filters.dateEnd}
          onChange={(e) => onFilterChange('dateEnd', e.target.value)}
          className="filter-input"
        />
      </div>
      <button className="clear-filters-btn" onClick={onClearFilters}>
        Clear
      </button>
    </div>
  );
}

export default TripFilters;