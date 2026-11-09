import React, { useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { siteConfig } from '../../data/siteConfig';
import { useAuth } from '../../context/AuthContext';
import SearchBar from './SearchBar';
import './MobileMenu.css';

function MobileMenu({ isOpen, onClose }) {
  const location = useLocation();
  const panelRef = useRef(null);
  const { isAuthenticated, user } = useAuth();

  // Close when route changes
  useEffect(() => {
    if (isOpen) {
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Handle Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <>
      <div
        className={`mobile-menu-backdrop ${isOpen ? 'open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        id="mobile-nav-panel"
        ref={panelRef}
        className={`mobile-menu-panel ${isOpen ? 'open' : ''}`}
        aria-label="Mobile Navigation"
        aria-hidden={!isOpen}
      >
        <div className="mobile-menu-header">
          <span className="mobile-menu-title">Menu</span>
          <button
            type="button"
            className="mobile-menu-close-btn"
            onClick={onClose}
            aria-label="Close menu"
          >
            <svg
              className="close-icon-svg"
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
        </div>

        <div className="mobile-search-wrapper">
          <SearchBar id="mobile-search" onSearchSubmitted={onClose} />
        </div>

        <nav aria-label="Mobile navigation links">
          <ul className="mobile-nav-list">
            {siteConfig.navLinks.map((link) => (
              <li key={link.path} className="mobile-nav-item">
                <NavLink
                  to={link.path}
                  className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                  onClick={onClose}
                  end={link.path === '/'}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
            <li className="mobile-nav-item">
              <NavLink
                to="/cart"
                className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                onClick={onClose}
              >
                Shopping Cart
              </NavLink>
            </li>
            {isAuthenticated ? (
              <>
                <li className="mobile-nav-item">
                  <NavLink
                    to="/account"
                    className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                    onClick={onClose}
                  >
                    My Account ({user?.fullName || 'Profile'})
                  </NavLink>
                </li>
                {user?.role === 'admin' && (
                  <li className="mobile-nav-item">
                    <NavLink
                      to="/admin"
                      className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                      onClick={onClose}
                      style={{ color: 'var(--color-honda-red, #cc0000)', fontWeight: 600 }}
                    >
                      Admin Dashboard &rarr;
                    </NavLink>
                  </li>
                )}
              </>
            ) : (
              <>
                <li className="mobile-nav-item">
                  <NavLink
                    to="/login"
                    className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                    onClick={onClose}
                  >
                    Account Login
                  </NavLink>
                </li>
                <li className="mobile-nav-item">
                  <NavLink
                    to="/register"
                    className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                    onClick={onClose}
                  >
                    Create Account
                  </NavLink>
                </li>
              </>
            )}
          </ul>
        </nav>

        <div className="mobile-menu-footer">
          <p>{siteConfig.disclaimer}</p>
        </div>
      </div>
    </>
  );
}

export default MobileMenu;
