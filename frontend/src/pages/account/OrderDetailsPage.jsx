import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePageTitle } from '../../hooks/usePageTitle';
import { ordersService } from '../../services/ordersService';
import AccountLayout from '../../components/account/AccountLayout';
import OrderDetails from '../../components/account/OrderDetails';
import EmptyState from '../../components/common/EmptyState';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';

// Sample preview order for development mode when UI preview is active
const PREVIEW_ORDER_DETAIL = {
  id: 'ord_101',
  orderNumber: 'PK-2026-001',
  createdAt: '2026-10-15',
  status: 'confirmed',
  paymentMethod: 'Cash on Delivery (COD)',
  totalPkr: 157900,
  customer: {
    fullName: 'Muhammad Usman',
    phone: '03001234567',
    city: 'Lahore',
    address: 'Model Town, Block C',
  },
  items: [
    {
      name: 'Honda CD 70 (2026)',
      quantity: 1,
      pricePkr: 157900,
    },
  ],
};

function OrderDetailsPage({ testOrder }) {
  const { id } = useParams();
  usePageTitle(`Order #${id || 'Details'}`);

  const isPreview = import.meta.env.DEV && import.meta.env.VITE_ACCOUNT_UI_PREVIEW === 'true';

  const [order, setOrder] = useState(
    testOrder || (isPreview && id === 'ord_101' ? PREVIEW_ORDER_DETAIL : null)
  );
  const [isLoading, setIsLoading] = useState(!testOrder && !isPreview);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (testOrder || isPreview || !id) return;

    let isMounted = true;
    ordersService
      .getMyOrderByNumber(id)
      .then((data) => {
        if (isMounted) setOrder(data);
      })
      .catch((err) => {
        if (isMounted) {
          setError(err?.message || 'Order not found.');
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id, testOrder, isPreview]);

  return (
    <AccountLayout
      title={order ? `Order Details #${order.orderNumber || order.id}` : 'Order Details'}
    >
      {isLoading ? (
        <LoadingState message="Loading order details..." />
      ) : error ? (
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      ) : order ? (
        <>
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <Link
              to="/account/orders"
              style={{
                color: 'var(--color-red)',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'bold',
              }}
            >
              &larr; Back to Order History
            </Link>
          </div>
          <OrderDetails order={order} />
        </>
      ) : (
        <EmptyState
          title="Order not found"
          message="We could not find an order matching this identifier."
        >
          <Link
            to="/account/orders"
            className="btn btn-primary"
            style={{ marginTop: 'var(--space-4)' }}
          >
            Back to Orders
          </Link>
        </EmptyState>
      )}
    </AccountLayout>
  );
}

export default OrderDetailsPage;
