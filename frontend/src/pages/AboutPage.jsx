import React from 'react';
import { Link } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle';
import { siteConfig } from '../data/siteConfig';
import './AboutPage.css';

/**
 * AboutPage: Functional company and platform overview.
 * Highlighting transparency, data integrity, and Pakistani rider focus.
 */
function AboutPage() {
  usePageTitle('About Us');

  return (
    <div className="about-page">
      <div className="container">
        <header className="about-hero">
          <span className="about-tag">About Our Platform</span>
          <h1 className="about-title">Built for Pakistani Motorcyclists</h1>
          <p className="about-lead">
            {siteConfig.aboutBlurb}
          </p>
        </header>

        <section className="about-grid" aria-label="Platform Core Principles">
          <article className="about-card">
            <div className="about-card-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '22px', height: '22px' }}>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <h2 className="about-card-title">Data Integrity First</h2>
            <p className="about-card-text">
              We never fabricate horsepower, fuel consumption averages, or dealership prices. Unverified models are explicitly labeled as demo placeholders until confirmed with official showroom invoices.
            </p>
          </article>

          <article className="about-card">
            <div className="about-card-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '22px', height: '22px' }}>
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </div>
            <h2 className="about-card-title">Pakistani Route Focus</h2>
            <p className="about-card-text">
              From crowded Karachi traffic to the Grand Trunk Road and Northern highways, our catalog categorizes motorcycles into sensible riding segments: daily commuters, versatile standards, and touring builds.
            </p>
          </article>

          <article className="about-card">
            <div className="about-card-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '22px', height: '22px' }}>
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <h2 className="about-card-title">Rider Community & Support</h2>
            <p className="about-card-text">
              We provide tools for honest model comparison, transparent booking inquiry workflows, and clear guidance for spare parts, maintenance schedules, and dealership pick-up across Pakistan.
            </p>
          </article>
        </section>

        {/* Action Callout */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
          <Link to="/bikes" className="btn btn-primary" style={{ marginRight: 'var(--space-4)' }}>
            Explore All Motorcycles
          </Link>
          <Link to="/contact" className="btn btn-dark">
            Contact Our Team
          </Link>
        </div>

        {/* Mandatory Transparency Disclaimer */}
        <aside className="about-disclaimer-box" aria-label="Official Disclaimer">
          <div className="about-disclaimer-title">Transparency Guarantee & Disclaimer</div>
          <p className="about-disclaimer-text">
            {siteConfig.disclaimer}
          </p>
        </aside>
      </div>
    </div>
  );
}

export default AboutPage;
