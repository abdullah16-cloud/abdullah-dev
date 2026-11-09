import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AccountLayout.css';

function AccountLayout({ title, children }) {
  const { logout, isUiPreview } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="account-layout-wrap">
      <div className="container">
        {isUiPreview && (
          <div className="account-preview-banner" role="status">
            UI PREVIEW &mdash; sample data, not a real account.
          </div>
        )}

        <div className="account-grid">
          {/* Side Navigation */}
          <nav className="account-nav" aria-label="Account navigation">
            <ul className="account-nav-list">
              <li>
                <NavLink
                  to="/account"
                  end
                  className="account-nav-link"
                  aria-current={({ isActive }) => (isActive ? 'page' : undefined)}
                >
                  Profile
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/account/orders"
                  className="account-nav-link"
                  aria-current={({ isActive }) => (isActive ? 'page' : undefined)}
                >
                  Orders
                </NavLink>
              </li>
              <li>
                <button
                  type="button"
                  className="account-nav-link account-logout-btn"
                  onClick={handleLogout}
                >
                  Log out
                </button>
              </li>
            </ul>
          </nav>

          {/* Main Account Area */}
          <div className="account-content-card">
            <h1 className="account-page-title">{title}</h1>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccountLayout;
