import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminNavbar from './AdminNavbar';
import './AdminLayout.css';

/**
 * Admin Layout Component
 * Structure: Dark Left Sidebar + Top Navbar + Dynamic Main Content Area
 */
function AdminLayout({ pageTitle = 'Dashboard' }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="admin-layout">
      {/* Mobile Backdrop */}
      <div
        className={`admin-backdrop ${sidebarOpen ? 'active' : ''}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Column */}
      <div className="admin-main-wrapper">
        <AdminNavbar
          title={pageTitle}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        />
        <main className="admin-content-area" id="admin-main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
