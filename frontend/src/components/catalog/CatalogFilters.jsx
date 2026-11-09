import React, { useState } from 'react';
import CatalogSearch from './CatalogSearch';
import CategoryFilter from './CategoryFilter';
import AvailabilityFilter from './AvailabilityFilter';
import SortSelect from './SortSelect';
import { hasActiveFilters } from '../../utils/catalog';
import './CatalogFilters.css';

function CatalogFilters({
  filterState,
  onSearchChange,
  onCategoryChange,
  onAvailabilityChange,
  onSortChange,
  onClearFilters,
  hasVerifiedPrices = false,
}) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const active = hasActiveFilters(filterState);

  return (
    <div className="catalog-filters-wrap">
      {/* Mobile Collapsible Toggle Button */}
      <button
        type="button"
        className="catalog-mobile-filter-toggle"
        aria-expanded={isMobileOpen}
        aria-controls="catalog-filters-content"
        onClick={() => setIsMobileOpen((prev) => !prev)}
      >
        <span>Filters &amp; Search {active && '(Active)'}</span>
        <svg
          className="catalog-filter-toggle-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Filter Controls Panel */}
      <div
        id="catalog-filters-content"
        className={`catalog-filters-panel ${isMobileOpen ? 'open' : ''}`}
      >
        <CatalogSearch value={filterState.search} onChange={onSearchChange} />

        <CategoryFilter value={filterState.category} onChange={onCategoryChange} />

        <AvailabilityFilter value={filterState.availability} onChange={onAvailabilityChange} />

        <SortSelect value={filterState.sort} onChange={onSortChange} />

        {/* 
          Optional maxPrice input:
          Only displayed if at least one bike has a verified price.
          Currently, all candidate models have pricePkr: null (unverified),
          so maxPrice is hidden to prevent confusion and maintain data integrity.
        */}
        {hasVerifiedPrices && (
          <div className="catalog-filter-group">
            {/* Price filter control will be activated once verified prices exist */}
          </div>
        )}

        {active && (
          <button type="button" className="catalog-clear-btn" onClick={onClearFilters}>
            Clear all filters
          </button>
        )}
      </div>
    </div>
  );
}

export default CatalogFilters;
