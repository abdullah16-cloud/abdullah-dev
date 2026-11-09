import React, { useState, useEffect, useCallback } from 'react';
import { adminService } from '../../services/adminService';
import './AdminOrdersPage.css';

const ORDER_TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['dispatched', 'cancelled'],
  dispatched: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
};

const STATUS_LABELS = {
  pending: 'Pending Confirmation',
  confirmed: 'Confirmed',
  dispatched: 'In Transit / Dispatched',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

/**
 * AdminOrdersPage: Order management, booking verification, and dispatch tracking.
 */
function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Selected Order for Details Modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [statusNote, setStatusNote] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const fetchOrders = useCallback(async (page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await adminService.listOrders({
        search: search.trim() || undefined,
        status: statusFilter || undefined,
        page,
        limit: 20,
      });

      const list = Array.isArray(res) ? res : res?.data || [];
      setOrders(list);

      const pag = res?.pagination || res?.meta || res?.data?.pagination;
      if (pag) setPagination(pag);
    } catch (err) {
      console.error('Failed to load orders:', err);
      setError(err?.message || 'Failed to load store bookings.');
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrders(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchOrders]);

  useEffect(() => {
    const handleUpdate = () => fetchOrders(1);
    window.addEventListener('products-updated', handleUpdate);
    window.addEventListener('focus', handleUpdate);
    return () => {
      window.removeEventListener('products-updated', handleUpdate);
      window.removeEventListener('focus', handleUpdate);
    };
  }, [fetchOrders]);

  const handleOpenDetails = async (orderNumber) => {
    setIsDetailsLoading(true);
    setStatusNote('');
    try {
      const res = await adminService.getOrderByNumber(orderNumber);
      const data = res?.data || res;
      setSelectedOrder(data);
    } catch (err) {
      console.error('Failed to load order details:', err);
      setError(err?.message || 'Failed to load order details.');
    } finally {
      setIsDetailsLoading(false);
    }
  };

  const handleStatusChange = async (targetStatus) => {
    if (!selectedOrder) return;
    setIsUpdatingStatus(true);
    setActionSuccess(null);
    try {
      await adminService.updateOrderStatus(selectedOrder.orderNumber, {
        toStatus: targetStatus,
        notes: statusNote.trim() || undefined,
      });

      setActionSuccess(`Order #${selectedOrder.orderNumber} transitioned to "${STATUS_LABELS[targetStatus]}".`);
      
      // Refresh modal
      await handleOpenDetails(selectedOrder.orderNumber);
      // Refresh table list
      await fetchOrders(pagination.page);
    } catch (err) {
      console.error('Failed to update status:', err);
      setError(err?.message || 'Failed to update order status.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Metrics
  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const confirmedCount = orders.filter((o) => o.status === 'confirmed').length;
  const dispatchedCount = orders.filter((o) => o.status === 'dispatched').length;
  const deliveredCount = orders.filter((o) => o.status === 'delivered').length;

  return (
    <div className="admin-orders-page">
      <header className="orders-header">
        <div>
          <h1 className="orders-title">Customer Bookings & Orders</h1>
          <p className="orders-desc">
            Verify motorcycle reservations, confirm delivery schedules, and manage shipment dispatch.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-dark"
          onClick={() => fetchOrders(pagination.page)}
          disabled={isLoading}
        >
          {isLoading ? 'Refreshing...' : '↻ Refresh Orders'}
        </button>
      </header>

      {/* Metrics Strip */}
      <div className="orders-stats-strip">
        <div className="order-stat-card">
          <span className="order-stat-label">Total Bookings</span>
          <span className="order-stat-val">{pagination.total || orders.length}</span>
        </div>
        <div className="order-stat-card">
          <span className="order-stat-label">Pending</span>
          <span className="order-stat-val val-amber">{pendingCount}</span>
        </div>
        <div className="order-stat-card">
          <span className="order-stat-label">Confirmed</span>
          <span className="order-stat-val" style={{ color: '#6ba5ff' }}>{confirmedCount}</span>
        </div>
        <div className="order-stat-card">
          <span className="order-stat-label">In Transit</span>
          <span className="order-stat-val" style={{ color: '#c084fc' }}>{dispatchedCount}</span>
        </div>
        <div className="order-stat-card">
          <span className="order-stat-label">Delivered</span>
          <span className="order-stat-val val-green">{deliveredCount}</span>
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
      <div className="orders-controls-bar">
        <input
          type="search"
          className="orders-search-input"
          placeholder="Search by Order #, customer name, phone, city..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="orders-filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="dispatched">In Transit (Dispatched)</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="orders-table-card">
        {isLoading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#8f8f9d' }}>
            Loading store orders...
          </div>
        ) : orders.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#8f8f9d' }}>
            No customer orders found. Bookings placed by customers will appear here.
          </div>
        ) : (
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order # / Date</th>
                <th>Customer</th>
                <th>City & Address</th>
                <th>Payment</th>
                <th>Total (PKR)</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const dateStr = o.createdAt
                  ? new Date(o.createdAt).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })
                  : '—';

                return (
                  <tr key={o.orderNumber || o.id}>
                    <td>
                      <div style={{ fontWeight: 800, color: '#ffffff', letterSpacing: '0.02em' }}>
                        #{o.orderNumber}
                      </div>
                      <span style={{ fontSize: '0.8rem', color: '#8f8f9d' }}>{dateStr}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#ffffff' }}>{o.customerName}</div>
                      <span style={{ fontSize: '0.8rem', color: '#8f8f9d' }}>
                        {o.customerPhone || o.customerEmail}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{o.shippingCity || 'Pakistan'}</div>
                      <span style={{ fontSize: '0.8rem', color: '#8f8f9d', display: 'block', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {o.shippingAddress}
                      </span>
                    </td>
                    <td>
                      <span style={{ textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 700, color: '#a0a0b2' }}>
                        {o.paymentMethod || 'COD'}
                      </span>
                    </td>
                    <td>
                      <strong style={{ color: '#ffffff', fontSize: '0.95rem' }}>
                        {o.totalPkr ? `PKR ${Number(o.totalPkr).toLocaleString()}` : '—'}
                      </strong>
                    </td>
                    <td>
                      <span className={`stock-badge order-badge-${o.status || 'pending'}`}>
                        {STATUS_LABELS[o.status] || o.status}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="order-action-btn"
                        onClick={() => handleOpenDetails(o.orderNumber)}
                      >
                        Inspect & Process
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Order Details & Status Transition Modal */}
      {selectedOrder && (
        <div className="modal-backdrop" onClick={() => setSelectedOrder(null)} role="presentation">
          <div
            className="order-modal-dialog"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <header className="modal-header">
              <div>
                <h2 className="modal-title">Booking Details #{selectedOrder.orderNumber}</h2>
                <span style={{ fontSize: '0.82rem', color: '#8f8f9d' }}>
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                </span>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setSelectedOrder(null)}
              >
                &times;
              </button>
            </header>

            <div className="modal-body">
              {/* Customer & Shipping Summary */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', background: '#0e0e13', padding: 'var(--space-4)', borderRadius: '6px' }}>
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#8f8f9d', textTransform: 'uppercase', fontWeight: 700 }}>
                    Customer Details
                  </div>
                  <div style={{ fontWeight: 700, color: '#ffffff', marginTop: '4px' }}>{selectedOrder.customerName}</div>
                  <div style={{ fontSize: '0.85rem', color: '#8f8f9d' }}>{selectedOrder.customerEmail}</div>
                  <div style={{ fontSize: '0.85rem', color: '#8f8f9d' }}>{selectedOrder.customerPhone}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#8f8f9d', textTransform: 'uppercase', fontWeight: 700 }}>
                    Delivery Destination
                  </div>
                  <div style={{ fontWeight: 700, color: '#ffffff', marginTop: '4px' }}>{selectedOrder.shippingCity}</div>
                  <div style={{ fontSize: '0.85rem', color: '#8f8f9d' }}>{selectedOrder.shippingAddress}</div>
                </div>
              </div>

              {/* Reserved Motorcycles */}
              <div>
                <h4 style={{ color: '#ffffff', marginBottom: '8px', fontSize: '0.95rem' }}>
                  Ordered Motorcycle Line Items:
                </h4>
                <div className="order-items-list">
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="order-item-row">
                        <div>
                          <strong style={{ color: '#ffffff' }}>{item.productName}</strong>
                          <div style={{ fontSize: '0.8rem', color: '#8f8f9d' }}>
                            Color: {item.selectedColor || 'Standard'} | Qty: {item.quantity}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ color: '#ffffff', fontWeight: 700 }}>
                            PKR {Number(item.lineTotalPkr || item.unitPricePkr).toLocaleString()}
                          </div>
                          <span style={{ fontSize: '0.78rem', color: '#8f8f9d' }}>
                            @ PKR {Number(item.unitPricePkr).toLocaleString()} each
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p style={{ color: '#8f8f9d', fontSize: '0.85rem' }}>No items recorded.</p>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px', paddingRight: '8px' }}>
                  <div style={{ textAlign: 'right', fontSize: '0.95rem' }}>
                    <span style={{ color: '#8f8f9d' }}>Total Booking Value: </span>
                    <strong style={{ color: '#ffffff', fontSize: '1.15rem' }}>
                      PKR {Number(selectedOrder.totalPkr || 0).toLocaleString()}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Status Workflow Action Box */}
              <div className="status-change-box">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ fontSize: '0.78rem', color: '#8f8f9d', textTransform: 'uppercase', fontWeight: 700 }}>
                      Current Booking Status
                    </span>
                    <div style={{ marginTop: '4px' }}>
                      <span className={`stock-badge order-badge-${selectedOrder.status}`}>
                        {STATUS_LABELS[selectedOrder.status] || selectedOrder.status}
                      </span>
                    </div>
                  </div>

                  {ORDER_TRANSITIONS[selectedOrder.status]?.length > 0 ? (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {ORDER_TRANSITIONS[selectedOrder.status].map((target) => (
                        <button
                          key={target}
                          type="button"
                          className={target === 'cancelled' ? 'btn-clear-image' : 'btn btn-primary'}
                          onClick={() => handleStatusChange(target)}
                          disabled={isUpdatingStatus}
                          style={{ fontSize: '0.82rem', padding: '6px 14px' }}
                        >
                          {target === 'confirmed' && '✓ Confirm Order'}
                          {target === 'dispatched' && '🚚 Mark Dispatched'}
                          {target === 'delivered' && '🎉 Mark Delivered'}
                          {target === 'cancelled' && '✕ Cancel Order'}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.85rem', color: '#8f8f9d' }}>
                      Terminal status (No further transitions)
                    </span>
                  )}
                </div>

                {ORDER_TRANSITIONS[selectedOrder.status]?.length > 0 && (
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Optional administrative note for status update (e.g. Courier tracking # / Call confirmed)..."
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    style={{ fontSize: '0.85rem' }}
                  />
                )}
              </div>

              {/* Status History Audit Trail */}
              {selectedOrder.history && selectedOrder.history.length > 0 && (
                <div>
                  <h5 style={{ color: '#8f8f9d', textTransform: 'uppercase', fontSize: '0.75rem', marginBottom: '8px' }}>
                    Status Audit Trail:
                  </h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {selectedOrder.history.map((h, i) => (
                      <div key={i} style={{ fontSize: '0.82rem', color: '#a0a0b2', background: '#0b0b0e', padding: '6px 10px', borderRadius: '4px' }}>
                        <span style={{ color: '#ffffff', fontWeight: 600 }}>{STATUS_LABELS[h.status] || h.status}</span>
                        {' — '}
                        <span>{h.notes || 'Status updated'}</span>
                        <span style={{ float: 'right', color: '#68687a' }}>{new Date(h.createdAt).toLocaleTimeString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <footer className="modal-footer">
              <button
                type="button"
                className="btn btn-dark"
                onClick={() => setSelectedOrder(null)}
              >
                Close Dialog
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminOrdersPage;

