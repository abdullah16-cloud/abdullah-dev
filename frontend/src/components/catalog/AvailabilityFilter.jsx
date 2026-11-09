import React from 'react';
import './CatalogControls.css';

function AvailabilityFilter({ value, onChange }) {
  return (
    <div className="catalog-filter-group">
      <label htmlFor="availability-filter-select" className="catalog-filter-label">
        Availability
      </label>
      <select
        id="availability-filter-select"
        className="catalog-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="all">All Availability</option>
        <option value="available">Available</option>
        <option value="unavailable">Unavailable</option>
        <option value="unknown">Unknown</option>
      </select>
    </div>
  );
}

export default AvailabilityFilter;
