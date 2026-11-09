import React from 'react';
import { Link } from 'react-router-dom';
import './AdminNavbar.css';

/**
 * Admin Top Navbar
 * Responsive header with mobile drawer toggle and link to live customer store.
 */
function AdminNavbar({ title = 'Admin Dashboard', onToggleSidebar }) {
  return (
    <header className="admin-navbar">
      <div className="admin-nav-left">
        <button
          type="button"
          className="admin-menu-toggle"
          onClick={onToggleSidebar}
          aria-label="Toggle admin navigation menu"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ width: '22px', height: '22px' }}
          >
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <h1 className="admin-nav-title">{title}</h1>
      </div>

      <div className="admin-nav-right">
        <Link to="/" className="admin-view-store-link" target="_blank" rel="noopener noreferrer">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ width: '15px', height: '15px' }}
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
          <span>View Live Store</span>
        </Link>
      </div>
    </header>
  );
}

export default AdminNavbar;
