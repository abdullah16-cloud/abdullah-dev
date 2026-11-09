import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import StatCard from '../../components/admin/StatCard';
import RecentOrdersTable from '../../components/admin/RecentOrdersTable';
import './AdminDashboardPage.css';

/**
 * AdminDashboardPage: Central telemetry & overview hub for Honda Bikes Store managers.
 * Shows real-time counts for products, active status, categories, orders, and customers.
 */
function AdminDashboardPage({ testStats, testOrders }) {
  const [stats, setStats] = useState(
    testStats || {
      totalProducts: '—',
      activeProducts: '—',
      totalCategories: '—',
      totalOrders: '—',
      totalCustomers: '—',
    }
  );
  const [recentOrders, setRecentOrders] = useState(testOrders || []);
  const [isLoading, setIsLoading] = useState(!testStats && !testOrders);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (testStats && testOrders) return;

    let isMounted = true;

    Promise.allSettled([adminService.getDashboardStats(), adminService.getRecentOrders(5)])
      .then(([statsResult, ordersResult]) => {
        if (!isMounted) return;

        if (statsResult.status === 'fulfilled') {
          const s = statsResult.value;
          setStats({
            totalProducts: s?.totalProducts ?? 0,
            activeProducts: s?.activeProducts ?? 0,
            totalCategories: s?.totalCategories ?? 0,
            totalOrders: s?.totalOrders ?? 0,
            totalCustomers: s?.totalCustomers ?? 0,
          });
        } else {
          setError('Unable to load live statistics from the server.');
        }

        if (ordersResult.status === 'fulfilled') {
          const o = ordersResult.value;
          setRecentOrders(Array.isArray(o) ? o : o?.orders || []);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err?.message || 'Error communicating with backend API.');
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [testStats, testOrders]);

  return (
    <div className="admin-dashboard">
      <div className="dashboard-hero">
        <div>
          <h1 className="dashboard-hero-title">Store Overview & Telemetry</h1>
          <p className="dashboard-hero-desc">
            Live operational status, catalog health metrics, and recent customer bookings across
            Pakistan.
          </p>
        </div>
        <div className="dashboard-quick-actions">
          <Link to="/admin/products" className="btn btn-primary">
            Manage Products
          </Link>
          <Link to="/admin/inventory" className="btn btn-dark">
            Check Stock
          </Link>
        </div>
      </div>

      {error && (
        <div className="admin-alert-banner" role="alert">
          {error}
        </div>
      )}

      {/* KPI Stat Cards Grid */}
      <section className="admin-stats-grid" aria-label="Dashboard Statistics Overview">
        <StatCard
          label="Total Products"
          value={stats.totalProducts}
          colorTheme="red"
          subtext="Catalog models in database"
          to="/admin/products"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '24px', height: '24px' }}>
              <circle cx="18.5" cy="17.5" r="3.5" />
              <circle cx="5.5" cy="17.5" r="3.5" />
              <circle cx="15" cy="5" r="1" />
              <path d="M12 17.5V14l-3-3 4-3 2 3h3" />
            </svg>
          }
        />
        <StatCard
          label="Active Products"
          value={stats.activeProducts}
          colorTheme="green"
          subtext="Publicly visible on storefront"
          to="/admin/products"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '24px', height: '24px' }}>
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          }
        />
        <StatCard
          label="Categories"
          value={stats.totalCategories}
          colorTheme="blue"
          subtext="Riding segments configured"
          to="/admin/categories"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '24px', height: '24px' }}>
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
          }
        />
        <StatCard
          label="Total Orders"
          value={stats.totalOrders}
          colorTheme="amber"
          subtext="Customer bookings placed"
          to="/admin/orders"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '24px', height: '24px' }}>
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          }
        />
        <StatCard
          label="Total Customers"
          value={stats.totalCustomers}
          colorTheme="purple"
          subtext="Registered customer accounts"
          to="/admin/customers"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '24px', height: '24px' }}>
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          }
        />
      </section>

      {/* Recent Orders Overview */}
      <RecentOrdersTable orders={recentOrders} isLoading={isLoading} />
    </div>
  );
}

export default AdminDashboardPage;
