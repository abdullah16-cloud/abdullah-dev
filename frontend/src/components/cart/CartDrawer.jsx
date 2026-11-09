import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { formatPkr } from '../../utils/formatPrice';
import './CartDrawer.css';

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

  const navigate = useNavigate();

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isDrawerOpen) {
        closeDrawer();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawerOpen, closeDrawer]);

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

  const handleCheckoutNavigation = () => {
    closeDrawer();
    navigate('/cart');
  };

  return (
    <div
      className={`cart-drawer-wrapper ${isDrawerOpen ? 'open' : ''}`}
      aria-hidden={!isDrawerOpen}
    >
      {/* Backdrop */}
      <div
        className="cart-drawer-backdrop"
        onClick={closeDrawer}
        aria-label="Close cart panel"
      />

      {/* Drawer Panel */}
      <aside className="cart-drawer-panel" aria-label="Shopping Cart Drawer">
        {/* Header */}
        <div className="cart-drawer-header">
          <div className="drawer-title-wrap">
            <h2 className="drawer-title">Shopping Cart</h2>
            <span className="drawer-count-badge">{cartCount} unit{cartCount === 1 ? '' : 's'}</span>
          </div>
          <button
            type="button"
            className="drawer-close-btn"
            onClick={closeDrawer}
            aria-label="Close cart"
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="cart-drawer-body">
          {!cartItems || cartItems.length === 0 ? (
            <div className="drawer-empty-state">
              <span className="drawer-empty-icon" aria-hidden="true">🛒</span>
              <h3 className="drawer-empty-title">Your Cart is Empty</h3>
              <p className="drawer-empty-desc">
                Select from our authentic Atlas Honda motorcycle collection to start your booking reservation.
              </p>
              <button
                type="button"
                className="btn btn-primary drawer-empty-btn"
                onClick={() => {
                  closeDrawer();
                  navigate('/bikes');
                }}
              >
                Browse All Bikes
              </button>
            </div>
          ) : (
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

        {/* Footer */}
        {cartItems && cartItems.length > 0 && (
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
              💵 <strong>Cash on Delivery (COD):</strong> Pay at your verified dealership showroom upon vehicle handover.
            </p>

            <button
              type="button"
              className="btn btn-primary drawer-checkout-btn"
              onClick={handleCheckoutNavigation}
            >
              Proceed to Dealership Booking &rarr;
            </button>

            <div className="drawer-footer-actions">
              <button
                type="button"
                className="drawer-continue-btn"
                onClick={closeDrawer}
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
