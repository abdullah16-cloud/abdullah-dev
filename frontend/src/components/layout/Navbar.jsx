import React, { useState, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { siteConfig } from '../../data/siteConfig';
import { useAuth } from '../../context/AuthContext';
import SearchBar from './SearchBar';
import CartIcon from './CartIcon';
import MobileMenu from './MobileMenu';
import './Navbar.css';

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const hamburgerRef = useRef(null);
  const { isAuthenticated, user } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    // Return focus to hamburger toggle button when menu closes
    if (hamburgerRef.current) {
      hamburgerRef.current.focus();
    }
  };

  return (
    <header className="site-header">
      <div className="container navbar-container">
        {/* Brand Text Logo (Left) */}
        <Link to="/" className="brand-link" aria-label="Honda Bikes Store Homepage">
          <span className="brand-accent-tag">PK</span>
          <span className="brand-title">{siteConfig.name}</span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="desktop-nav" aria-label="Main navigation">
          <ul className="desktop-nav-list">
            {siteConfig.navLinks.map((link) => (
              <li key={link.path}>
                <NavLink
                  to={link.path}
                  className={({ isActive }) => `desktop-nav-link ${isActive ? 'active' : ''}`}
                  end={link.path === '/'}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Header Actions (Search, Cart, Account, Mobile Toggle) */}
        <div className="header-actions">
          <div className="desktop-search">
            <SearchBar id="desktop-search" />
          </div>

          <CartIcon />

          <Link
            to="/admin"
            className="admin-header-btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.75rem',
              fontWeight: '700',
              color: '#ffffff',
              backgroundColor: '#cc0000',
              padding: '6px 12px',
              borderRadius: '4px',
              textDecoration: 'none',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
            }}
            title="Open Admin Panel"
          >
            Admin Panel
          </Link>

          <Link
            to={isAuthenticated ? (user?.role === 'admin' ? '/admin' : '/account') : '/login'}
            className="account-link"
            aria-label={isAuthenticated ? (user?.role === 'admin' ? 'Admin Portal' : 'My Account') : 'Account Login'}
          >
            <svg
              className="account-icon-svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span>{isAuthenticated ? (user?.role === 'admin' ? 'Admin' : 'My Account') : 'Account'}</span>
          </Link>

          {/* Hamburger Menu Toggle (Mobile) */}
          <button
            ref={hamburgerRef}
            type="button"
            className="hamburger-button"
            aria-label="Toggle navigation menu"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-nav-panel"
            onClick={toggleMenu}
          >
            <svg
              className="hamburger-icon-svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Accessible Mobile Navigation Panel */}
      <MobileMenu isOpen={isMenuOpen} onClose={closeMenu} />
    </header>
  );
}

export default Navbar;
