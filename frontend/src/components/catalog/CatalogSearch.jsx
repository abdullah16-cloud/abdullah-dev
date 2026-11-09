import React, { useState, useEffect, useRef } from 'react';
import './CatalogSearch.css';

/**
 * CatalogSearch: Text input with debounced updates to avoid rapid URL changes.
 * Has a visually hidden label and a clear button.
 * Does not reset other filters when search changes.
 */
function CatalogSearch({ value, onChange, debounceMs = 300 }) {
  const [localValue, setLocalValue] = useState(value);
  const [prevValue, setPrevValue] = useState(value);
  const timerRef = useRef(null);

  // Sync local state if external value changes (e.g. "Clear all filters") without an effect
  if (value !== prevValue) {
    setPrevValue(value);
    setLocalValue(value);
  }

  const handleChange = (e) => {
    const newVal = e.target.value;
    setLocalValue(newVal);

    // Debounce: wait before propagating change
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onChange(newVal);
    }, debounceMs);
  };

  const handleClear = () => {
    setLocalValue('');
    onChange('');
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className="catalog-search-wrap">
      <label htmlFor="catalog-search" className="visually-hidden">
        Search motorcycles by name or category
      </label>
      <input
        id="catalog-search"
        type="search"
        className="catalog-search-input"
        placeholder="Search bikes..."
        value={localValue}
        onChange={handleChange}
        autoComplete="off"
      />
      {localValue && (
        <button
          type="button"
          className="catalog-search-clear"
          onClick={handleClear}
          aria-label="Clear search"
        >
          <svg
            className="catalog-search-clear-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  );
}

export default CatalogSearch;
