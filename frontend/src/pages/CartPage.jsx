import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ordersService } from '../services/ordersService';
import { formatPkr } from '../utils/formatPrice';
import './CartPage.css';

const PAKISTAN_CITIES = [
  'Lahore',
  'Karachi',
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Multan',
  'Peshawar',
  'Quetta',
  'Sialkot',
  'Gujranwala',
  'Hyderabad',
  'Sargodha',
  'Bahawalpur',
  'Abbottabad',
];

/**
 * CartPage: Interactive customer cart with live Dealership Checkout,
 * Cash on Delivery (COD) order placement, stock decrement, and Admin Order integration.
 */
function CartPage() {
  usePageTitle('Shopping Cart & Dealership Booking');
  const { cartItems, cartCount, cartTotal, removeFromCart, updateQuantity, clearCart } = useCart();
  const { user } = useAuth();

  // Checkout Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // Placed Order Success State
  const [placedOrder, setPlacedOrder] = useState(null);

  // Checkout Form State
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    city: 'Lahore',
    address: '',
    notes: '',
  });

  // Pre-fill user data when user logs in or modal opens
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || user.fullName || '',
        phone: prev.phone || user.phone || '',
        email: prev.email || user.email || '',
        city: prev.city || user.defaultCity || 'Lahore',
        address: prev.address || user.defaultAddress || '',
      }));
    }
  }, [user, isModalOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOpenCheckout = () => {
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleCloseCheckout = () => {
    if (!isSubmitting) {
      setIsModalOpen(false);
    }
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    // Validation
    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
      setFormError('Please enter your full name (minimum 2 characters).');
      return;
    }

    const cleanPhone = formData.phone.trim().replace(/[\s-]/g, '');
    if (!/^03\d{9}$/.test(cleanPhone)) {
      setFormError('Please enter a valid 11-digit Pakistani mobile number (e.g. 03001234567).');
      return;
    }

    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email.trim())) {
      setFormError('Please enter a valid email address.');
      return;
    }

    if (!formData.address.trim() || formData.address.trim().length < 10) {
      setFormError('Please enter your complete delivery/showroom address (minimum 10 characters).');
      return;
    }

    // Format items for backend API
    const items = cartItems.map((item) => ({
      productSlug: item.slug || item.id,
      selectedColor: item.selectedColor || undefined,
      quantity: Number(item.quantity) || 1,
    }));

    setIsSubmitting(true);

    try {
      const orderPayload = {
        customer: {
          fullName: formData.fullName.trim(),
          phone: cleanPhone,
          email: formData.email.trim().toLowerCase(),
          city: formData.city,
          address: formData.address.trim(),
          notes: formData.notes.trim() || undefined,
        },
        items,
        paymentMethod: 'cod',
        acceptedDealershipConfirmation: true,
      };

      const response = await ordersService.createOrder(orderPayload);
      const orderData = response?.data || response;

      // Clear the local cart
      clearCart();

      // Notify any other components that stock or orders updated
      window.dispatchEvent(new CustomEvent('products-updated'));

      setIsModalOpen(false);
      setPlacedOrder(orderData);
    } catch (err) {
      console.error('Failed to submit order:', err);
      setFormError(err?.message || 'Failed to place booking order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 1. Success Screen after order is placed
  if (placedOrder) {
    return (
      <div className="container cart-page">
        <div className="cart-order-success-card">
          <div className="cart-order-success-badge">✓</div>
          <h1 className="cart-order-success-title">Dealership Booking Confirmed!</h1>
          <p className="cart-order-success-desc">
            Your motorcycle reservation has been registered with our dealership network.
          </p>

          <div className="cart-order-number-banner">
            <span className="cart-order-number-label">Order Reference Number:</span>
            <span className="cart-order-number-val">{placedOrder.orderNumber}</span>
          </div>

          <div className="cart-order-summary-box">
            <div className="cart-order-summary-item">
              <span>Customer Name:</span>
              <strong>{formData.fullName}</strong>
            </div>
            <div className="cart-order-summary-item">
              <span>Delivery City:</span>
              <strong>{formData.city}</strong>
            </div>
            <div className="cart-order-summary-item">
              <span>Payment Method:</span>
              <strong>Cash on Delivery (COD) / Showroom Collection</strong>
            </div>
            <div className="cart-order-summary-item">
              <span>Order Status:</span>
              <span className="cart-status-pill pending">Pending Dealership Verification</span>
            </div>
            {placedOrder.totalPkr !== undefined && placedOrder.totalPkr > 0 && (
              <div className="cart-order-summary-item total">
                <span>Total Amount:</span>
                <strong className="cart-order-total-price">{formatPkr(placedOrder.totalPkr)}</strong>
              </div>
            )}
          </div>

          <div className="cart-order-instructions">
            <p>
              📞 <strong>Next Steps:</strong> An official Honda dealership representative will call your number (<strong>{formData.phone}</strong>) within 24 hours to confirm stock verification, delivery timeline, and motorcycle registration formalities.
            </p>
          </div>

          <div className="cart-order-success-actions">
            <Link to="/account/orders" className="btn btn-primary">
              View in My Orders
            </Link>
            <Link to="/bikes" className="btn btn-secondary" onClick={() => setPlacedOrder(null)}>
              Browse Showroom
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. Empty State
  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="container cart-page">
        <div className="cart-empty-state">
          <div className="cart-empty-icon" aria-hidden="true">🛒</div>
          <h1 className="cart-empty-title">Your Cart is Empty</h1>
          <p className="cart-empty-desc">
            You haven&apos;t added any motorcycles or accessories to your cart yet.
            Explore our Honda lineup and add models to your order.
          </p>
          <Link to="/bikes" className="btn btn-primary">
            Explore All Motorcycles
          </Link>
        </div>
      </div>
    );
  }

  // 3. Normal Cart View
  return (
    <div className="container cart-page">
      <header className="cart-header">
        <h1 className="cart-title">Your Shopping Cart</h1>
        <p className="cart-subtitle">
          Review your selected motorcycle models and proceed to dealership booking.
        </p>
      </header>

      <div className="cart-layout">
        {/* Cart Items List */}
        <div className="cart-items-card">
          {cartItems.map((item) => {
            const priceText = item.pricePkr ? formatPkr(item.pricePkr) : 'Price on Request';
            const subtotalText = item.pricePkr
              ? formatPkr(item.pricePkr * item.quantity)
              : 'Price on Request';

            return (
              <div key={item.id} className="cart-item-row" data-testid={`cart-item-${item.slug || item.id}`}>
                <div className="cart-item-info">
                  <h2 className="cart-item-title">{item.name}</h2>
                  <span className="cart-item-meta">
                    Category: {item.category} {item.selectedColor ? `• Color: ${item.selectedColor}` : ''}
                  </span>
                  <span className="cart-item-unit-price">{priceText}</span>
                </div>

                <div className="cart-item-qty-wrap">
                  <button
                    type="button"
                    className="cart-qty-btn"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    aria-label={`Decrease quantity of ${item.name}`}
                  >
                    -
                  </button>
                  <span className="cart-qty-number">{item.quantity}</span>
                  <button
                    type="button"
                    className="cart-qty-btn"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    aria-label={`Increase quantity of ${item.name}`}
                  >
                    +
                  </button>
                </div>

                <div className="cart-item-subtotal">
                  <span>{subtotalText}</span>
                </div>

                <button
                  type="button"
                  className="cart-item-remove-btn"
                  onClick={() => removeFromCart(item.id)}
                  aria-label={`Remove ${item.name} from cart`}
                >
                  &times;
                </button>
              </div>
            );
          })}
        </div>

        {/* Order Summary Box */}
        <aside className="cart-summary-card">
          <h2 className="cart-summary-title">Booking Summary</h2>

          <div className="cart-summary-row">
            <span>Selected Units</span>
            <strong>{cartCount}</strong>
          </div>

          <div className="cart-summary-row">
            <span>Subtotal</span>
            <strong>{cartTotal > 0 ? formatPkr(cartTotal) : 'Price on Request'}</strong>
          </div>

          <div className="cart-summary-row">
            <span>Dealership Verification</span>
            <span style={{ color: '#2e7d32', fontWeight: 600 }}>Free Consultation</span>
          </div>

          <div className="cart-summary-total">
            <span>Estimated Total</span>
            <span className="cart-total-amount">
              {cartTotal > 0 ? formatPkr(cartTotal) : 'Price on Request'}
            </span>
          </div>

          <button
            type="button"
            className="cart-checkout-btn"
            onClick={handleOpenCheckout}
          >
            Proceed to Dealership Booking
          </button>

          <button type="button" className="cart-clear-btn" onClick={clearCart}>
            Clear Cart
          </button>
        </aside>
      </div>

      {/* Checkout Modal */}
      {isModalOpen && (
        <div className="cart-modal-backdrop" onClick={handleCloseCheckout}>
          <div className="cart-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cart-modal-header">
              <h2 className="cart-modal-title">Dealership Motorcycle Booking</h2>
              <button
                type="button"
                className="cart-modal-close"
                onClick={handleCloseCheckout}
                disabled={isSubmitting}
                aria-label="Close modal"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCheckoutSubmit} className="cart-checkout-form">
              <div className="cart-modal-body">
                {formError && (
                  <div className="cart-form-alert error">
                    ⚠️ {formError}
                  </div>
                )}

                <div className="cart-checkout-summary-bar">
                  <div>
                    <strong>{cartCount} Unit(s) Selected</strong>
                    <div style={{ fontSize: '0.825rem', color: '#666' }}>
                      {cartItems.map((i) => `${i.name} (x${i.quantity})`).join(', ')}
                    </div>
                  </div>
                  <strong style={{ color: '#cc0000', fontSize: '1.1rem' }}>
                    {cartTotal > 0 ? formatPkr(cartTotal) : 'Price on Request'}
                  </strong>
                </div>

                <div className="cart-form-row">
                  <div className="cart-form-group">
                    <label htmlFor="fullName">Full Name *</label>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      required
                      placeholder="e.g. Muhammad Tariq"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="cart-form-group">
                    <label htmlFor="phone">Pakistani Mobile Number *</label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      placeholder="03001234567"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                    />
                    <small>11 digits format (e.g. 03001234567)</small>
                  </div>
                </div>

                <div className="cart-form-row">
                  <div className="cart-form-group">
                    <label htmlFor="email">Email Address *</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="tariq@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="cart-form-group">
                    <label htmlFor="city">Destination City *</label>
                    <select
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                    >
                      {PAKISTAN_CITIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="cart-form-group">
                  <label htmlFor="address">Delivery / Showroom Address *</label>
                  <textarea
                    id="address"
                    name="address"
                    rows="2"
                    required
                    placeholder="House / Street, Block, Area, City"
                    value={formData.address}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="cart-form-group">
                  <label htmlFor="notes">Special Order Notes (Optional)</label>
                  <input
                    id="notes"
                    name="notes"
                    type="text"
                    placeholder="Color preference, delivery schedule, registration assistance..."
                    value={formData.notes}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="cart-payment-badge">
                  <span>💳 Payment Method:</span>
                  <strong>Cash on Delivery (COD) / Dealership Showroom Collection</strong>
                </div>
              </div>

              <div className="cart-modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCloseCheckout}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary cart-confirm-order-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Booking Order...' : 'Confirm Booking Order (COD)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CartPage;
