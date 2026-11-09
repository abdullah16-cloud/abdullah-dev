import React from 'react';
import './CatalogControls.css';

function SortSelect({ value, onChange }) {
  return (
    <div className="catalog-filter-group">
      <label htmlFor="catalog-sort-select" className="catalog-filter-label">
        Sort By
      </label>
      <select
        id="catalog-sort-select"
        className="catalog-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Default</option>
        <option value="name-asc">Name: A to Z</option>
        <option value="name-desc">Name: Z to A</option>
        <option value="price-asc">Price: Low to High</option>
        <option value="price-desc">Price: High to Low</option>
      </select>
    </div>
  );
}

export default SortSelect;
