import React from 'react';
import { Link } from 'react-router-dom';
import { useBikes } from '../../hooks/useBikes';
import BikeCard from '../bikes/BikeCard';
import './FeaturedModelsSection.css';

/**
 * Featured Models Section: Highlights bikes with featured: true.
 * Automatically displays live products and pictures from the backend / admin panel.
 * Supports testBikes override for testing.
 */
function FeaturedModelsSection({ testBikes }) {
  const { bikes } = useBikes();
  const sourceBikes = testBikes || bikes;
  const featuredBikes = sourceBikes.filter((bike) => bike.featured);

  return (
    <section className="featured-section" aria-labelledby="featured-models-heading">
      <div className="container">
        <div className="featured-header">
          <div className="featured-title-wrap">
            <span className="featured-section-tag">Popular Selection</span>
            <h2 id="featured-models-heading" className="featured-heading">
              Featured Motorcycle Models
            </h2>
            <p className="featured-subtext">
              Official models available across Pakistan. Live specifications, official pictures, and verified showroom prices.
            </p>
          </div>

          <Link to="/bikes" className="featured-view-all-link">
            <span>View All Bikes</span>
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>

        <div className="featured-grid">
          {featuredBikes.map((bike) => (
            <BikeCard key={bike.id || bike.slug} bike={bike} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturedModelsSection;
