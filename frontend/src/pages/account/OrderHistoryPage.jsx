import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usePageTitle } from '../../hooks/usePageTitle';
import { ordersService } from '../../services/ordersService';
import AccountLayout from '../../components/account/AccountLayout';
import EmptyState from '../../components/common/EmptyState';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import OrderList from '../../components/account/OrderList';

// Sample preview orders (strictly used for development UI preview when flag is enabled)
const PREVIEW_ORDERS = [
  {
    id: 'ord_101',
    orderNumber: 'PK-2026-001',
    createdAt: '2026-10-15',
    status: 'confirmed',
    totalPkr: 157900,
    itemsCount: 1,
  },
  {
    id: 'ord_102',
    orderNumber: 'PK-2026-002',
    createdAt: '2026-10-20',
    status: 'dispatched',
    totalPkr: 234900,
    itemsCount: 1,
  },
];

function OrderHistoryPage({ testOrders }) {
  usePageTitle('My Orders');

  const isPreview = import.meta.env.DEV && import.meta.env.VITE_ACCOUNT_UI_PREVIEW === 'true';

  const [orders, setOrders] = useState(testOrders || (isPreview ? PREVIEW_ORDERS : []));
  const [isLoading, setIsLoading] = useState(!testOrders && !isPreview);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (testOrders || isPreview) return;

    let isMounted = true;
    ordersService
      .getMyOrders()
      .then((data) => {
        if (isMounted) {
          setOrders(Array.isArray(data) ? data : data?.orders || []);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err?.message || 'Unable to load orders at this time.');
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [testOrders, isPreview]);

  return (
    <AccountLayout title="Order History">
      {isLoading ? (
        <LoadingState message="Loading your order history..." />
      ) : error ? (
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      ) : orders.length === 0 ? (
        <EmptyState
          title="No orders to show"
          message="Orders will appear here once you place a motorcycle booking."
        >
          <Link to="/bikes" className="btn btn-primary" style={{ marginTop: 'var(--space-4)' }}>
            Explore Motorcycles
          </Link>
        </EmptyState>
      ) : (
        <OrderList orders={orders} />
      )}
    </AccountLayout>
  );
}

export default OrderHistoryPage;
