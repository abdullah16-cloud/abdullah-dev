import React from 'react';
import { Link } from 'react-router-dom';
import './CtaSection.css';

/**
 * CTA Section: Final energetic call to action band.
 * High-contrast dark button on brand red backdrop meeting WCAG AA requirements.
 */
function CtaSection() {
  return (
    <section className="cta-section" aria-labelledby="cta-heading">
      <div className="container">
        <div className="cta-box">
          <h2 id="cta-heading" className="cta-heading">
            Ready to Explore Motorcycles?
          </h2>
          <p className="cta-subtext">
            View our catalog of candidate models, review engine profiles, and connect with regional
            dealerships for official booking.
          </p>
          <Link to="/bikes" className="btn cta-btn-white">
            Explore All Motorcycles &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}

export default CtaSection;
