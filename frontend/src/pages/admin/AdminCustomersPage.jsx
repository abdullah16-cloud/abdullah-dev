import React, { useState, useEffect, useCallback } from 'react';
import { adminService } from '../../services/adminService';
import ConfirmationModal from '../../components/admin/ConfirmationModal';
import './AdminCustomersPage.css';

/**
 * AdminCustomersPage: User accounts & customer relationship management.
 * Shows customer details, contact info, total orders placed, and active/inactive status toggle.
 */
function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Status Confirmation Dialog
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    customer: null,
    targetState: false,
    isProcessing: false,
  });

  const fetchCustomers = useCallback(async (page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await adminService.listCustomers({
        search: search.trim() || undefined,
        status: statusFilter || undefined,
        page,
        limit: 20,
      });

      const list = Array.isArray(res) ? res : res?.data || [];
      setCustomers(list);

      const pag = res?.pagination || res?.meta || res?.data?.pagination;
      if (pag) setPagination(pag);
    } catch (err) {
      console.error('Failed to load customers:', err);
      setError(err?.message || 'Failed to load customer accounts.');
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchCustomers]);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleOpenStatusModal = (customer, targetState) => {
    setConfirmDialog({
      isOpen: true,
      customer,
      targetState,
      isProcessing: false,
    });
  };

  const handleConfirmStatusChange = async () => {
    const { customer, targetState } = confirmDialog;
    if (!customer) return;

    setConfirmDialog((prev) => ({ ...prev, isProcessing: true }));
    setActionSuccess(null);

    try {
      await adminService.toggleCustomerStatus(customer.id, targetState);
      setActionSuccess(
        `Customer account "${customer.fullName || customer.email}" has been ${
          targetState ? 'reactivated' : 'deactivated'
        }.`
      );
      setConfirmDialog({
        isOpen: false,
        customer: null,
        targetState: false,
        isProcessing: false,
      });
      await fetchCustomers(pagination.page);
    } catch (err) {
      console.error('Failed to update customer status:', err);
      setError(err?.message || 'Failed to update customer status.');
      setConfirmDialog((prev) => ({ ...prev, isProcessing: false }));
    }
  };

  const activeCount = customers.filter((c) => c.isActive).length;
  const inactiveCount = customers.filter((c) => !c.isActive).length;

  return (
    <div className="admin-customers-page">
      <header className="customers-header">
        <div>
          <h1 className="customers-title">Customer Accounts & Users</h1>
          <p className="customers-desc">
            View registered users, track booking history, and manage account access status.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-dark"
          onClick={() => fetchCustomers(pagination.page)}
          disabled={isLoading}
        >
          {isLoading ? 'Refreshing...' : '↻ Refresh Users'}
        </button>
      </header>

      {/* Metrics Strip */}
      <div className="customers-stats-strip">
        <div className="customer-stat-card">
          <span className="customer-stat-label">Total Users</span>
          <span className="customer-stat-val">{pagination.total || customers.length}</span>
        </div>
        <div className="customer-stat-card">
          <span className="customer-stat-label">Active Accounts</span>
          <span className="customer-stat-val val-green">{activeCount}</span>
        </div>
        <div className="customer-stat-card">
          <span className="customer-stat-label">Deactivated / Suspended</span>
          <span className="customer-stat-val val-red">{inactiveCount}</span>
        </div>
      </div>

      {actionSuccess && (
        <div className="admin-success-banner" role="status">
          <span>{actionSuccess}</span>
          <button
            type="button"
            className="admin-banner-dismiss"
            onClick={() => setActionSuccess(null)}
          >
            ×
          </button>
        </div>
      )}

      {error && (
        <div className="admin-error-card" role="alert">
          <p>{error}</p>
        </div>
      )}

      {/* Controls Bar */}
      <div className="customers-controls-bar">
        <input
          type="search"
          className="customers-search-input"
          placeholder="Search by name, email, phone, or city..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="customers-filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="active">Active Only</option>
          <option value="inactive">Inactive Only</option>
        </select>
      </div>

      {/* Customers Table */}
      <div className="customers-table-card">
        {isLoading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#8f8f9d' }}>
            Loading customer accounts...
          </div>
        ) : customers.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#8f8f9d' }}>
            No customer accounts found matching criteria.
          </div>
        ) : (
          <table className="customers-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Phone / City</th>
                <th>Role</th>
                <th>Orders Placed</th>
                <th>Total Spent</th>
                <th>Joined Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => {
                const dateStr = c.createdAt
                  ? new Date(c.createdAt).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })
                  : '—';

                return (
                  <tr key={c.id}>
                    <td>
                      <div className="customer-profile-cell">
                        <div className="customer-avatar">{getInitials(c.fullName)}</div>
                        <div>
                          <div className="customer-name">{c.fullName || 'Unnamed User'}</div>
                          <div className="customer-email">{c.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>{c.phone || 'No phone'}</div>
                      <span style={{ fontSize: '0.8rem', color: '#8f8f9d' }}>
                        {c.city || 'No city'}
                      </span>
                    </td>
                    <td>
                      <span className={`customer-role-badge role-${c.role || 'customer'}`}>
                        {c.role || 'customer'}
                      </span>
                    </td>
                    <td>
                      <strong>{c.orderCount || 0}</strong> {c.orderCount === 1 ? 'order' : 'orders'}
                    </td>
                    <td>
                      {c.totalSpent
                        ? `PKR ${Number(c.totalSpent).toLocaleString()}`
                        : 'PKR 0'}
                    </td>
                    <td style={{ fontSize: '0.85rem', color: '#8f8f9d' }}>{dateStr}</td>
                    <td>
                      <span
                        className={`status-indicator ${
                          c.isActive ? 'status-active' : 'status-inactive'
                        }`}
                      >
                        <span className="status-dot" />
                        <span>{c.isActive ? 'Active' : 'Inactive'}</span>
                      </span>
                    </td>
                    <td>
                      {c.role === 'admin' ? (
                        <span style={{ fontSize: '0.78rem', color: '#8f8f9d' }}>Admin</span>
                      ) : c.isActive ? (
                        <button
                          type="button"
                          className="customer-action-btn btn-deactivate"
                          onClick={() => handleOpenStatusModal(c, false)}
                        >
                          Deactivate
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="customer-action-btn btn-reactivate"
                          onClick={() => handleOpenStatusModal(c, true)}
                        >
                          Reactivate
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationModal
        isOpen={confirmDialog.isOpen}
        title={
          confirmDialog.targetState
            ? `Reactivate Customer Account?`
            : `Deactivate Customer Account?`
        }
        message={
          confirmDialog.targetState
            ? `Are you sure you want to reactivate the account for "${
                confirmDialog.customer?.fullName || confirmDialog.customer?.email
              }"? They will regain ability to log in and place orders.`
            : `Are you sure you want to deactivate the account for "${
                confirmDialog.customer?.fullName || confirmDialog.customer?.email
              }"? They will be prevented from logging in.`
        }
        confirmText={
          confirmDialog.targetState ? 'Reactivate Account' : 'Deactivate Account'
        }
        confirmVariant={confirmDialog.targetState ? 'primary' : 'danger'}
        isProcessing={confirmDialog.isProcessing}
        onConfirm={handleConfirmStatusChange}
        onCancel={() =>
          !confirmDialog.isProcessing &&
          setConfirmDialog({ isOpen: false, customer: null, targetState: false, isProcessing: false })
        }
      />
    </div>
  );
}

export default AdminCustomersPage;

