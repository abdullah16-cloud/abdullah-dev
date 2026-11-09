import React from 'react';
import { Link } from 'react-router-dom';
import { formatPkr } from '../../utils/formatPrice';
import './RecentOrdersTable.css';

/**
 * RecentOrdersTable: Displays the latest customer orders in the admin dashboard.
 */
function RecentOrdersTable({ orders = [], isLoading = false }) {
  const getStatusBadge = (status) => {
    const s = (status || 'pending').toLowerCase();
    return <span className={`order-badge badge-${s}`}>{s}</span>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('en-PK', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return String(dateString);
    }
  };

  return (
    <div className="recent-orders-card">
      <div className="recent-orders-header">
        <h2 className="recent-orders-title">Recent Customer Orders</h2>
        <Link to="/admin/orders" className="recent-orders-view-all">
          <span>View All Orders</span>
          <span aria-hidden="true">&rarr;</span>
        </Link>
      </div>

      <div className="orders-table-wrapper">
        <table className="orders-table" aria-label="Recent customer orders list">
          <thead>
            <tr>
              <th scope="col">Order Number</th>
              <th scope="col">Customer</th>
              <th scope="col">Order Date</th>
              <th scope="col">Total Amount</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
                  Loading recent orders...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan="5" className="recent-orders-empty">
                  No orders have been placed yet. Customer orders will appear here automatically.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.orderNumber || order.id}>
                  <td className="order-num-cell">{order.orderNumber}</td>
                  <td>
                    <div className="customer-name">{order.customerName}</div>
                    {order.shippingCity && (
                      <div className="customer-city">{order.shippingCity}</div>
                    )}
                  </td>
                  <td>{formatDate(order.createdAt)}</td>
                  <td>{formatPkr(order.totalPkr)}</td>
                  <td>{getStatusBadge(order.status)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RecentOrdersTable;
