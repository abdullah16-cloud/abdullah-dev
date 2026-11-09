import React from 'react';
import { categories } from '../../data/categories';
import './CatalogControls.css';

function CategoryFilter({ value, onChange }) {
  const allCategories = [{ slug: 'all', title: 'All' }, ...categories];

  return (
    <div className="catalog-filter-group">
      <span className="catalog-filter-label" id="category-filter-label">
        Category
      </span>
      <div className="category-btn-group" role="group" aria-labelledby="category-filter-label">
        {allCategories.map((cat) => {
          const isSelected = value === cat.slug;
          return (
            <button
              key={cat.slug}
              type="button"
              className="category-btn"
              aria-pressed={isSelected}
              onClick={() => onChange(cat.slug)}
            >
              {cat.title}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default CategoryFilter;
