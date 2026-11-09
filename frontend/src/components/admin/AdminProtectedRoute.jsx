import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AdminProtectedRoute.css';

/**
 * AdminProtectedRoute: Client-side gate ensuring only users with role === 'admin'
 * can view the admin interface.
 * Real security is strictly enforced on all /api/admin/* endpoints by the backend.
 */
function AdminProtectedRoute({ children }) {
  const { user, isAuthenticated, status } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return (
      <div className="admin-gate-wrap">
        <div className="admin-gate-loading">
          <p>Verifying administrative credentials...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="admin-gate-wrap">
        <div className="admin-gate-card" role="status">
          <svg
            className="admin-gate-icon"
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
          <h1 className="admin-gate-title">Admin Login Required</h1>
          <p className="admin-gate-desc">
            You must be logged in with an administrator account to access the Admin Dashboard.
          </p>
          <div className="admin-gate-actions">
            <Link to="/login" state={{ from: location.pathname }} className="btn btn-primary">
              Log in to Admin
            </Link>
            <Link to="/" className="btn btn-dark">
              Return to Store
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return (
      <div className="admin-gate-wrap">
        <div className="admin-gate-card" role="alert">
          <svg
            className="admin-gate-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <h1 className="admin-gate-title">Access Denied</h1>
          <p className="admin-gate-desc">
            Your account ({user.email}) has role <strong>{user.role}</strong>. Administrative
            privileges are required to view this area.
          </p>
          <div className="admin-gate-actions">
            <Link to="/" className="btn btn-primary">
              Back to Store
            </Link>
            <Link to="/account" className="btn btn-dark">
              My Customer Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
}

export default AdminProtectedRoute;
