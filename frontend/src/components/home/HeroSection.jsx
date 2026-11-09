import React from 'react';
import { Link } from 'react-router-dom';
import ImagePlaceholder from '../common/ImagePlaceholder';
import './HeroSection.css';

/**
 * Hero Section: The primary homepage fold.
 * Contains the single <h1> tag for SEO and page structure.
 */
function HeroSection() {
  return (
    <section className="hero-section-home" aria-labelledby="hero-title">
      <div className="container hero-grid">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="hero-badge-dot" aria-hidden="true" />
            <span>Pakistan Edition &bull; Unofficial Showcase</span>
          </div>

          <h1 id="hero-title" className="hero-heading">
            Find Your Next <span className="hero-heading-accent">Honda</span> Motorcycle
          </h1>

          <p className="hero-subheading">
            Explore authentic specifications, verify model details, and compare iconic Pakistani
            rides—from the daily CD 70 to the legendary CG 125.
          </p>

          <div className="hero-cta-group">
            <Link to="/bikes" className="btn btn-primary hero-cta-primary">
              Explore Bikes
            </Link>
            <Link to="/compare" className="btn hero-cta-secondary">
              Compare Specs
            </Link>
          </div>
        </div>

        <div className="hero-visual-card">
          <img
            src="/images/showroom/showroom-hero.jpg"
            alt="Honda Showroom Showcase"
            className="hero-visual-img"
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              if (e.currentTarget.nextElementSibling) {
                e.currentTarget.nextElementSibling.style.display = 'flex';
              }
            }}
          />
          <div style={{ display: 'none', width: '100%', height: '100%' }}>
            <ImagePlaceholder
              label="Hero Showcase"
              subText="Featured Honda Lineup Preview"
              aspectRatio="16 / 10"
              className="hero-visual-placeholder"
            />
          </div>
          <p className="hero-visual-note">
            Independent enthusiast store &mdash; Model specifications confirmed before booking.
          </p>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
