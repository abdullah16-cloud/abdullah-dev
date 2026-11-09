import React from 'react';
import { Link } from 'react-router-dom';
import './StatCard.css';

/**
 * StatCard: Displays a single dashboard KPI metric with icon and label.
 * Optionally links to target admin page when 'to' is provided.
 */
function StatCard({ label, value, icon, colorTheme = 'red', subtext, to }) {
  const cardElement = (
    <article
      className="stat-card"
      aria-label={`${label}: ${value}`}
      style={to ? { cursor: 'pointer', transition: 'transform 0.15s ease, border-color 0.15s ease' } : {}}
    >
      <div className={`stat-card-icon-wrap stat-icon-${colorTheme}`}>
        {icon}
      </div>
      <div className="stat-card-body">
        <div className="stat-card-label">{label}</div>
        <div className="stat-card-value">{value}</div>
        {subtext && <div className="stat-card-subtext">{subtext}</div>}
      </div>
    </article>
  );

  if (to) {
    return (
      <Link to={to} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
        {cardElement}
      </Link>
    );
  }

  return cardElement;
}

export default StatCard;
