import React from 'react';
import OrderCard from './OrderCard';

function OrderList({ orders = [] }) {
  if (!orders || orders.length === 0) {
    return null;
  }

  return (
    <div className="order-list" aria-label="Customer Orders">
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}

export default OrderList;
