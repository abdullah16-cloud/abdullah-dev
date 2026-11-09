import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatPkr } from '../../utils/formatPrice';
import { useCart } from '../../context/CartContext';
import ImagePlaceholder from '../common/ImagePlaceholder';
import './BikeCard.css';

/**
 * Reusable BikeCard component.
 * Displays bike model card with image, category, engine specs, estimated price,
 * and direct Add to Cart action.
 */
function BikeCard({ bike }) {
  const { addToCart, isInCart } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  const engineText =
    bike.engineCc !== null && bike.engineCc !== undefined
      ? `${bike.engineCc} cc`
      : 'Engine: not verified';

  const detailsUrl = `/bikes/${bike.slug || bike.id}`;
  const imageUrl =
    Array.isArray(bike.images) && bike.images.length > 0 && typeof bike.images[0] === 'string'
      ? bike.images[0]
      : `/images/bikes/${bike.slug || bike.id}.jpg`;

  const handleAddToCart = () => {
    addToCart(bike, 1);
    setJustAdded(true);
    setTimeout(() => {
      setJustAdded(false);
    }, 1600);
  };

  return (
    <article className="bike-card" aria-labelledby={`bike-title-${bike.id}`}>
      <Link to={detailsUrl} className="bike-card-image-wrap" tabIndex={-1}>
        {bike.isDemoData && <span className="bike-demo-badge">Demo Data</span>}
        <img
          src={imageUrl}
          alt={bike.name}
          className="bike-card-img"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            if (e.currentTarget.nextElementSibling) {
              e.currentTarget.nextElementSibling.style.display = 'flex';
            }
          }}
        />
        <div className="bike-card-img-fallback" style={{ display: 'none', width: '100%', height: '100%' }}>
          <ImagePlaceholder label={bike.name} subText={bike.category} aspectRatio="16 / 10" />
        </div>
      </Link>

      <div className="bike-card-body">
        <span className="bike-card-category">{bike.category}</span>
        <h3 id={`bike-title-${bike.id}`} className="bike-card-title">
          <Link to={detailsUrl} style={{ color: 'inherit', textDecoration: 'none' }}>
            {bike.name}
          </Link>
        </h3>
        <p className="bike-card-spec">{engineText}</p>

        <div className="bike-card-price-row">
          <span className="bike-card-price-label">Estimated Price:</span>
          <span className="bike-card-price">{formatPkr(bike.pricePkr)}</span>
        </div>

        <div className="bike-card-actions">
          <button
            type="button"
            className={`bike-card-btn-cart ${justAdded ? 'added' : ''}`}
            onClick={handleAddToCart}
            aria-label={`Add ${bike.name} to Cart`}
          >
            {justAdded ? 'Added' : 'Add to Cart'}
          </button>
          <Link
            to={detailsUrl}
            className="btn btn-dark bike-card-btn"
            aria-label={`View details for ${bike.name}`}
          >
            Details
          </Link>
        </div>
      </div>
    </article>
  );
}

export default BikeCard;
