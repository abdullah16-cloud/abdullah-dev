import React from 'react';
import './EmptyState.css';

function EmptyState({
  title = 'No motorcycles found',
  message,
  activeFilters = {},
  onClearFilters,
}) {
  const filterPills = [];
  if (activeFilters.search) filterPills.push(`Search: "${activeFilters.search}"`);
  if (activeFilters.category && activeFilters.category !== 'all')
    filterPills.push(`Category: ${activeFilters.category}`);
  if (activeFilters.availability && activeFilters.availability !== 'all')
    filterPills.push(`Availability: ${activeFilters.availability}`);

  return (
    <div className="empty-state" role="status" aria-live="polite">
      <svg
        className="empty-state-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
        <line x1="8" y1="11" x2="14" y2="11" />
      </svg>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-message">
        {message ||
          'Try adjusting your search terms or clearing your selected filters to view available models.'}
      </p>

      {filterPills.length > 0 && (
        <div className="empty-state-filters" aria-label="Active filters">
          {filterPills.map((pill, idx) => (
            <span key={idx} className="empty-filter-pill">
              {pill}
            </span>
          ))}
        </div>
      )}

      {onClearFilters && (
        <button type="button" className="btn btn-primary" onClick={onClearFilters}>
          Clear all filters
        </button>
      )}
    </div>
  );
}

export default EmptyState;
