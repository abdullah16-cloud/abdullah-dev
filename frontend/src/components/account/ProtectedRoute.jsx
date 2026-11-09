import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './ProtectedRoute.css';

/**
 * ProtectedRoute: Friendly UI gate for account pages.
 *
 * NOTE: This is client-side navigation convenience only.
 * Real security and authorization happen strictly on the server-side via session cookies.
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated, status } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return (
      <div className="container protected-route-loading">
        <p>Checking account status...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container protected-route-gate" role="status">
        <div className="gate-card">
          <svg
            className="gate-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <h1 className="gate-title">Please Log In</h1>
          <p className="gate-desc">You must be logged in to view your profile and order history.</p>
          <div className="gate-actions">
            <Link to="/login" state={{ from: location.pathname }} className="btn btn-primary">
              Log in
            </Link>
            <Link to="/register" className="btn btn-dark">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
}

export default ProtectedRoute;
