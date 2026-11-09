import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SearchBar.css';

function SearchBar({ id = 'site-search', onSearchSubmitted, autoFocus = false }) {
  const [term, setTerm] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = term.trim();
    if (!trimmed) {
      return;
    }

    navigate(`/bikes?search=${encodeURIComponent(trimmed)}`);
    setTerm('');
    if (onSearchSubmitted) {
      onSearchSubmitted();
    }
  };

  return (
    <form role="search" className="search-form" onSubmit={handleSubmit}>
      <label htmlFor={id} className="visually-hidden">
        Search motorcycles or parts
      </label>
      <input
        id={id}
        type="search"
        className="search-input"
        placeholder="Search bikes, models..."
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        autoFocus={autoFocus}
        autoComplete="off"
      />
      <button type="submit" className="search-button" aria-label="Submit search">
        <svg
          className="search-icon-svg"
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
        </svg>
      </button>
    </form>
  );
}

export default SearchBar;
