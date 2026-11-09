import React from 'react';
import { Link } from 'react-router-dom';
import { formatPkr } from '../../utils/formatPrice';
import './OrderCard.css';

export const ORDER_STATUSES = ['pending', 'confirmed', 'dispatched', 'delivered', 'cancelled'];

function OrderCard({ order }) {
  const displayTotal =
    order.totalPkr !== null && order.totalPkr !== undefined
      ? formatPkr(order.totalPkr)
      : 'To be confirmed';

  const statusClass = `status-${(order.status || 'pending').toLowerCase()}`;

  return (
    <article className="order-card" aria-labelledby={`order-${order.id}`}>
      <div className="order-card-header">
        <div>
          <span id={`order-${order.id}`} className="order-card-num">
            Order #{order.orderNumber || order.id}
          </span>
          <div className="order-card-date">{order.createdAt || 'Recent'}</div>
        </div>
        <span className={`order-status-badge ${statusClass}`}>{order.status || 'pending'}</span>
      </div>

      <div className="order-card-body">
        <span className="order-card-items-count">
          {order.itemsCount || (order.items && order.items.length) || 1} item(s)
        </span>
        <span className="order-card-total">Total: {displayTotal}</span>
        <Link
          to={`/account/orders/${order.id}`}
          className="btn btn-dark"
          style={{ padding: 'var(--space-1) var(--space-3)', fontSize: 'var(--font-size-xs)' }}
        >
          View Details
        </Link>
      </div>
    </article>
  );
}

export default OrderCard;
