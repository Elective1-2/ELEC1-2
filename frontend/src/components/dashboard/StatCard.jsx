import React from 'react';
import '../../css/dashboard.css';

function StatCard({ label, value, icon, color, loading }) {
  if (loading) {
    return (
      <div className="m2b-stat-card skeleton">
        <div>
          <div className="skeleton-label"></div>
          <div className="skeleton-value"></div>
        </div>
        <div className="m2b-stat-icon skeleton-icon"></div>
      </div>
    );
  }

  return (
    <div className="m2b-stat-card">
      <div>
        <div className="m2b-stat-lbl">{label}</div>
        <div className="m2b-stat-val">{value}</div>
      </div>
      <div className={`m2b-stat-icon ${color}`}>
        {icon}
      </div>
    </div>
  );
}

export default StatCard;