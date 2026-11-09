import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { ordersService } from '../../services/ordersService';
import { formatPkr } from '../../utils/formatPrice';
import './CartDrawer.css';

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

function CartDrawer() {
  const {
    isDrawerOpen,
    closeDrawer,
    cartItems,
    cartCount,
    cartTotal,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const { user } = useAuth();

  // Navigation step inside the drawer: 'cart' | 'checkout' | 'success'
  const [drawerStep, setDrawerStep] = useState('cart');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [placedOrder, setPlacedOrder] = useState(null);

  // Form inputs
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    city: 'Lahore',
    address: '',
    notes: '',
  });

  // Pre-fill user data
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
  }, [user, isDrawerOpen]);

  // Reset step if cart becomes empty
  useEffect(() => {
    if (!cartItems || cartItems.length === 0) {
      if (drawerStep === 'checkout') {
        setDrawerStep('cart');
      }
    }
  }, [cartItems, drawerStep]);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isDrawerOpen && !isSubmitting) {
        closeDrawer();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawerOpen, isSubmitting, closeDrawer]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDrawerOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOpenCheckout = () => {
    setFormError(null);
    setDrawerStep('checkout');
  };

  const handleBackToCart = () => {
    setFormError(null);
    setDrawerStep('cart');
  };

  const handleCloseAndReset = () => {
    if (isSubmitting) return;
    closeDrawer();
    // After animation, reset to cart step if was on success
    setTimeout(() => {
      if (drawerStep === 'success') {
        setDrawerStep('cart');
        setPlacedOrder(null);
      }
    }, 300);
  };

  const handleOrderSubmit = async (e) => {
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
      setFormError('Please enter delivery address (minimum 10 characters).');
      return;
    }

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

      // Clear local cart
      clearCart();

      // Trigger sync for inventory / admin
      window.dispatchEvent(new CustomEvent('products-updated'));

      setPlacedOrder(orderData);
      setDrawerStep('success');
    } catch (err) {
      console.error('Failed to submit order in drawer:', err);
      setFormError(err?.message || 'Failed to place booking order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`cart-drawer-wrapper ${isDrawerOpen ? 'open' : ''}`}
      aria-hidden={!isDrawerOpen}
    >
      {/* Backdrop */}
      <div
        className="cart-drawer-backdrop"
        onClick={handleCloseAndReset}
        aria-label="Close cart panel"
      />

      {/* Drawer Panel */}
      <aside className="cart-drawer-panel" aria-label="Shopping Cart Drawer">
        {/* Header */}
        <div className="cart-drawer-header">
          <div className="drawer-title-wrap">
            {drawerStep === 'checkout' ? (
              <button
                type="button"
                className="drawer-back-btn"
                onClick={handleBackToCart}
                disabled={isSubmitting}
                aria-label="Back to items list"
              >
                &larr; Back
              </button>
            ) : null}

            <h2 className="drawer-title">
              {drawerStep === 'checkout'
                ? 'Dealership Booking'
                : drawerStep === 'success'
                ? 'Booking Confirmed!'
                : 'Shopping Cart'}
            </h2>

            {drawerStep === 'cart' && cartCount > 0 && (
              <span className="drawer-count-badge">{cartCount} unit{cartCount === 1 ? '' : 's'}</span>
            )}
          </div>

          <button
            type="button"
            className="drawer-close-btn"
            onClick={handleCloseAndReset}
            disabled={isSubmitting}
            aria-label="Close cart"
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="cart-drawer-body">
          {/* 1. SUCCESS STEP */}
          {drawerStep === 'success' && placedOrder && (
            <div className="drawer-success-view">
              <div className="drawer-success-badge">✓</div>
              <h3 className="drawer-success-title">Order Placed Successfully!</h3>
              <p className="drawer-success-desc">
                Your motorcycle reservation has been sent directly to the dealership.
              </p>

              <div className="drawer-order-ref-box">
                <span className="ref-label">Order Reference:</span>
                <strong className="ref-number">{placedOrder.orderNumber}</strong>
              </div>

              <div className="drawer-order-meta-box">
                <div className="meta-row">
                  <span>Customer:</span>
                  <strong>{formData.fullName}</strong>
                </div>
                <div className="meta-row">
                  <span>City:</span>
                  <strong>{formData.city}</strong>
                </div>
                <div className="meta-row">
                  <span>Payment:</span>
                  <strong>Cash on Delivery (COD)</strong>
                </div>
                <div className="meta-row">
                  <span>Status:</span>
                  <span className="drawer-status-pill">Pending Verification</span>
                </div>
              </div>

              <div className="drawer-instructions-box">
                📞 An official dealership representative will contact you at <strong>{formData.phone}</strong> within 24 hours to confirm delivery schedule and registration.
              </div>

              <button
                type="button"
                className="btn btn-primary drawer-done-btn"
                onClick={handleCloseAndReset}
              >
                Done & Continue Browsing
              </button>
            </div>
          )}

          {/* 2. CHECKOUT STEP */}
          {drawerStep === 'checkout' && (
            <form onSubmit={handleOrderSubmit} className="drawer-checkout-form">
              {formError && (
                <div className="drawer-form-alert error" role="alert">
                  ⚠️ {formError}
                </div>
              )}

              <div className="drawer-checkout-review-strip">
                <div>
                  <strong>{cartCount} Unit(s) Selected</strong>
                  <span className="review-sub">Cash on Delivery</span>
                </div>
                <strong className="review-price">
                  {cartTotal > 0 ? formatPkr(cartTotal) : 'Price on Request'}
                </strong>
              </div>

              <div className="drawer-form-group">
                <label htmlFor="drawer-fullName">Full Name *</label>
                <input
                  id="drawer-fullName"
                  name="fullName"
                  type="text"
                  required
                  placeholder="e.g. Muhammad Usman"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                />
              </div>

              <div className="drawer-form-group">
                <label htmlFor="drawer-phone">Pakistani Mobile Number *</label>
                <input
                  id="drawer-phone"
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

              <div className="drawer-form-group">
                <label htmlFor="drawer-email">Email Address *</label>
                <input
                  id="drawer-email"
                  name="email"
                  type="email"
                  required
                  placeholder="usman@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                />
              </div>

              <div className="drawer-form-group">
                <label htmlFor="drawer-city">Destination City *</label>
                <select
                  id="drawer-city"
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

              <div className="drawer-form-group">
                <label htmlFor="drawer-address">Delivery / Showroom Address *</label>
                <textarea
                  id="drawer-address"
                  name="address"
                  rows="2"
                  required
                  placeholder="Street / Area, City"
                  value={formData.address}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                />
              </div>

              <div className="drawer-form-group">
                <label htmlFor="drawer-notes">Special Instructions (Optional)</label>
                <input
                  id="drawer-notes"
                  name="notes"
                  type="text"
                  placeholder="Color preference, delivery time..."
                  value={formData.notes}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                />
              </div>

              <div className="drawer-cod-badge">
                <span>💳 Payment:</span>
                <strong>Cash on Delivery (COD) / Showroom Collection</strong>
              </div>

              <button
                type="submit"
                className="btn btn-primary drawer-submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Placing Order...' : 'Confirm Booking Order (COD)'}
              </button>
            </form>
          )}

          {/* 3. NORMAL CART ITEMS LIST */}
          {drawerStep === 'cart' && (!cartItems || cartItems.length === 0) && (
            <div className="drawer-empty-state">
              <span className="drawer-empty-icon" aria-hidden="true">🛒</span>
              <h3 className="drawer-empty-title">Your Cart is Empty</h3>
              <p className="drawer-empty-desc">
                Select from our authentic Atlas Honda motorcycle collection to start your booking reservation.
              </p>
              <button
                type="button"
                className="btn btn-primary drawer-empty-btn"
                onClick={handleCloseAndReset}
              >
                Browse All Bikes
              </button>
            </div>
          )}

          {drawerStep === 'cart' && cartItems && cartItems.length > 0 && (
            <div className="drawer-items-list">
              {cartItems.map((item) => {
                const priceFormatted = item.pricePkr
                  ? formatPkr(item.pricePkr)
                  : 'Price on Request';
                const subtotalFormatted = item.pricePkr
                  ? formatPkr(item.pricePkr * item.quantity)
                  : 'Price on Request';

                return (
                  <div key={item.id} className="drawer-item-card">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="drawer-item-thumb"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />

                    <div className="drawer-item-info">
                      <div className="drawer-item-heading-row">
                        <h4 className="drawer-item-name">{item.name}</h4>
                        <button
                          type="button"
                          className="drawer-item-remove"
                          onClick={() => removeFromCart(item.id)}
                          aria-label={`Remove ${item.name} from cart`}
                        >
                          &times;
                        </button>
                      </div>

                      <div className="drawer-item-meta">
                        <span>{item.category}</span>
                        {item.selectedColor && (
                          <span> &bull; Color: {item.selectedColor}</span>
                        )}
                      </div>

                      <div className="drawer-item-price-row">
                        <span className="drawer-item-unit-price">{priceFormatted}</span>

                        <div className="drawer-qty-wrap">
                          <button
                            type="button"
                            className="drawer-qty-btn"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            aria-label={`Decrease quantity of ${item.name}`}
                          >
                            -
                          </button>
                          <span className="drawer-qty-val">{item.quantity}</span>
                          <button
                            type="button"
                            className="drawer-qty-btn"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            aria-label={`Increase quantity of ${item.name}`}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="drawer-item-subtotal-row">
                        <span>Subtotal:</span>
                        <strong>{subtotalFormatted}</strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer (Only on Cart step when items exist) */}
        {drawerStep === 'cart' && cartItems && cartItems.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="drawer-summary-row">
              <span className="drawer-summary-label">Dealership Inspection</span>
              <span className="drawer-free-tag">Free Verification</span>
            </div>

            <div className="drawer-summary-row total-row">
              <span className="drawer-total-label">Estimated Total:</span>
              <strong className="drawer-total-val">
                {cartTotal > 0 ? formatPkr(cartTotal) : 'Price on Request'}
              </strong>
            </div>

            <p className="drawer-cod-note">
              💵 <strong>Cash on Delivery (COD):</strong> Pay at your verified dealership showroom upon vehicle collection.
            </p>

            <button
              type="button"
              className="btn btn-primary drawer-checkout-btn"
              onClick={handleOpenCheckout}
            >
              Proceed to Dealership Booking &rarr;
            </button>

            <div className="drawer-footer-actions">
              <button
                type="button"
                className="drawer-continue-btn"
                onClick={handleCloseAndReset}
              >
                Continue Shopping
              </button>
              <button
                type="button"
                className="drawer-clear-btn"
                onClick={clearCart}
              >
                Clear Cart
              </button>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}

export default CartDrawer;
