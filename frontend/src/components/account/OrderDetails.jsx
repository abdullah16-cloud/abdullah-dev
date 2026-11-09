import React from 'react';
import { formatPkr } from '../../utils/formatPrice';
import { ORDER_STATUSES } from './OrderCard';
import './OrderDetails.css';

function OrderDetails({ order }) {
  if (!order) return null;

  const currentStatusIndex = ORDER_STATUSES.indexOf((order.status || 'pending').toLowerCase());

  return (
    <div className="order-details-box">
      <div className="order-meta-grid">
        <div className="order-meta-item">
          <span className="order-meta-label">Order Number</span>
          <span className="order-meta-val">#{order.orderNumber || order.id}</span>
        </div>
        <div className="order-meta-item">
          <span className="order-meta-label">Date Placed</span>
          <span className="order-meta-val">{order.createdAt || 'Recent'}</span>
        </div>
        <div className="order-meta-item">
          <span className="order-meta-label">Payment Method</span>
          <span className="order-meta-val">{order.paymentMethod || 'Cash on Delivery (COD)'}</span>
        </div>
        <div className="order-meta-item">
          <span className="order-meta-label">City</span>
          <span className="order-meta-val">{order.customer?.city || 'Lahore'}</span>
        </div>
      </div>

      {/* Status Timeline */}
      <div>
        <h3 style={{ fontSize: 'var(--font-size-base)', marginBottom: 'var(--space-2)' }}>
          Order Progress
        </h3>
        <div className="status-timeline" aria-label="Order status timeline">
          {ORDER_STATUSES.map((st, idx) => {
            const isCompleted = idx <= currentStatusIndex;
            return (
              <div key={st} className={`timeline-step ${isCompleted ? 'completed' : ''}`}>
                <div className="timeline-dot" aria-hidden="true">
                  {idx + 1}
                </div>
                <span className="timeline-label">{st}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Items Table */}
      <div>
        <h3 style={{ fontSize: 'var(--font-size-base)', marginBottom: 'var(--space-2)' }}>
          Ordered Items
        </h3>
        <table className="order-items-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {(order.items || []).map((item, idx) => (
              <tr key={idx}>
                <td>{item.name}</td>
                <td>{item.quantity || 1}</td>
                <td>{item.pricePkr ? formatPkr(item.pricePkr) : 'To be confirmed'}</td>
                <td>
                  {item.pricePkr
                    ? formatPkr(item.pricePkr * (item.quantity || 1))
                    : 'To be confirmed'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Total Box */}
      <div className="order-summary-box">
        <div className="order-summary-row">
          <span>Items Total:</span>
          <span>{order.totalPkr ? formatPkr(order.totalPkr) : 'To be confirmed'}</span>
        </div>
        <div className="order-summary-row">
          <span>Delivery Charges:</span>
          <span>Confirmed before dispatch</span>
        </div>
        <div className="order-summary-row total">
          <span>Final Total:</span>
          <span>{order.totalPkr ? formatPkr(order.totalPkr) : 'To be confirmed'}</span>
        </div>
      </div>
    </div>
  );
}

export default OrderDetails;
