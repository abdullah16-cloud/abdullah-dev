import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { catalogService } from '../services/catalogService';
import { useCart } from '../context/CartContext';
import { formatPkr } from '../utils/formatPrice';
import { usePageTitle } from '../hooks/usePageTitle';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import ImagePlaceholder from '../components/common/ImagePlaceholder';
import './BikeDetailPage.css';

function BikeDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart, isInCart } = useCart();

  const [bike, setBike] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addedNotice, setAddedNotice] = useState(false);

  usePageTitle(bike ? `${bike.name} - Official Details` : 'Motorcycle Details');

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    catalogService
      .getProductBySlug(slug)
      .then((data) => {
        if (!isMounted) return;
        const bikeData = data?.data || data;
        setBike(bikeData);
        if (bikeData?.colors && bikeData.colors.length > 0) {
          setSelectedColor(bikeData.colors[0]);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Failed to load bike details:', err);
        setError(err?.message || 'Motorcycle details could not be loaded.');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const handleAddToCart = () => {
    if (!bike) return;
    addToCart(bike, quantity, selectedColor);
    setAddedNotice(true);
    setTimeout(() => {
      setAddedNotice(false);
    }, 2000);
  };

  const handleDirectBooking = () => {
    if (!bike) return;
    addToCart(bike, quantity, selectedColor);
    navigate('/cart');
  };

  if (isLoading) {
    return (
      <div className="container bike-detail-container">
        <LoadingState message="Loading motorcycle specifications..." />
      </div>
    );
  }

  if (error || !bike) {
    return (
      <div className="container bike-detail-container">
        <ErrorState
          title="Bike Not Found"
          message={error || 'The requested motorcycle model could not be found.'}
          onRetry={() => window.location.reload()}
        />
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link to="/bikes" className="btn btn-primary">
            Explore All Motorcycles
          </Link>
        </div>
      </div>
    );
  }

  const imageUrl =
    Array.isArray(bike.images) && bike.images.length > 0 && typeof bike.images[0] === 'string'
      ? bike.images[0]
      : `/images/bikes/${bike.slug || bike.id}.jpg`;

  const availableColors = Array.isArray(bike.colors) && bike.colors.length > 0
    ? bike.colors
    : ['Red', 'Black'];

  return (
    <div className="bike-detail-page">
      <div className="container">
        {/* Breadcrumb Navigation */}
        <nav className="detail-breadcrumbs" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span className="breadcrumb-separator">/</span>
          <Link to="/bikes">All Bikes</Link>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{bike.name}</span>
        </nav>

        <div className="detail-layout">
          {/* Left Column: Bike Image Showcase */}
          <div className="detail-media-card">
            <div className="detail-image-wrap">
              <img
                src={imageUrl}
                alt={bike.name}
                className="detail-main-img"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  if (e.currentTarget.nextElementSibling) {
                    e.currentTarget.nextElementSibling.style.display = 'flex';
                  }
                }}
              />
              <div
                className="detail-img-fallback"
                style={{ display: 'none', width: '100%', height: '100%' }}
              >
                <ImagePlaceholder
                  label={bike.name}
                  subText={bike.category || 'Motorcycle'}
                  aspectRatio="16 / 10"
                />
              </div>
            </div>

            {/* Dealership Assurance Badges */}
            <div className="detail-perks-strip">
              <div className="detail-perk-item">
                <span className="perk-icon">🛡️</span>
                <div>
                  <strong>Official Atlas Warranty</strong>
                  <p>Guaranteed authentic parts</p>
                </div>
              </div>
              <div className="detail-perk-item">
                <span className="perk-icon">🚚</span>
                <div>
                  <strong>Nationwide Dealerships</strong>
                  <p>Showroom delivery & verification</p>
                </div>
              </div>
              <div className="detail-perk-item">
                <span className="perk-icon">💵</span>
                <div>
                  <strong>Cash on Delivery (COD)</strong>
                  <p>Pay upon showroom collection</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Pricing, Specs & Booking Actions */}
          <div className="detail-info-card">
            <div className="detail-header-meta">
              <span className="detail-category-badge">{bike.category || 'Standard'}</span>
              <span className="detail-engine-badge">{bike.engineCc ? `${bike.engineCc} CC Engine` : 'Engine Verified'}</span>
            </div>

            <h1 className="detail-title">{bike.name}</h1>

            <div className="detail-price-box">
              <span className="detail-price-label">Official Showroom Price:</span>
              <div className="detail-price-row">
                <span className="detail-price-amount">
                  {bike.pricePkr ? formatPkr(bike.pricePkr) : 'Price on Request'}
                </span>
                <span className="detail-price-tax-note">Ex-Showroom Price (PKR)</span>
              </div>
            </div>

            {/* Colors Selection */}
            <div className="detail-option-group">
              <label className="detail-option-label">Available Color Variants:</label>
              <div className="detail-color-pills">
                {availableColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`detail-color-pill ${selectedColor === color ? 'active' : ''}`}
                    onClick={() => setSelectedColor(color)}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="detail-option-group">
              <label className="detail-option-label">Select Units:</label>
              <div className="detail-qty-control">
                <button
                  type="button"
                  className="qty-btn"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="qty-value">{quantity}</span>
                <button
                  type="button"
                  className="qty-btn"
                  onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                  disabled={quantity >= 10}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            {/* Order Feedback Alert */}
            {addedNotice && (
              <div className="detail-added-alert" role="status">
                ✓ Added {quantity} unit(s) of <strong>{bike.name}</strong> to your Cart!
              </div>
            )}

            {/* Call to Actions */}
            <div className="detail-action-buttons">
              <button
                type="button"
                className="btn btn-primary detail-cart-btn"
                onClick={handleAddToCart}
              >
                Add to Cart
              </button>
              <button
                type="button"
                className="btn btn-secondary detail-book-btn"
                onClick={handleDirectBooking}
              >
                Book Dealership Reservation (COD)
              </button>
            </div>

            {/* Specifications Table */}
            <div className="detail-specs-section">
              <h2 className="detail-specs-heading">Official Technical Specifications</h2>
              <div className="detail-specs-grid">
                <div className="detail-spec-row">
                  <span className="spec-label">Engine Displacement</span>
                  <span className="spec-val">{bike.engineCc ? `${bike.engineCc} cc` : 'Standard'}</span>
                </div>
                <div className="detail-spec-row">
                  <span className="spec-label">Engine Type</span>
                  <span className="spec-val">{bike.specs?.engineType || '4-Stroke OHC Air-Cooled'}</span>
                </div>
                <div className="detail-spec-row">
                  <span className="spec-label">Transmission</span>
                  <span className="spec-val">{bike.specs?.transmission || '4-Speed Constant Mesh'}</span>
                </div>
                <div className="detail-spec-row">
                  <span className="spec-label">Starting</span>
                  <span className="spec-val">{bike.specs?.starting || 'Kick Start / Electric'}</span>
                </div>
                <div className="detail-spec-row">
                  <span className="spec-label">Fuel Capacity</span>
                  <span className="spec-val">{bike.specs?.fuelCapacity || '9.0 Liters'}</span>
                </div>
                <div className="detail-spec-row">
                  <span className="spec-label">Category Segment</span>
                  <span className="spec-val">{bike.category || 'Commuter'}</span>
                </div>
              </div>
            </div>

            <div className="detail-back-link-wrap">
              <Link to="/bikes" className="detail-back-link">
                &larr; Return to All Motorcycles Showroom
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BikeDetailPage;

