import React from 'react';
import './BenefitsSection.css';

/**
 * Benefits Section: Highlights general platform strengths with safe claims and clean vector icons.
 */
function BenefitsSection() {
  const benefits = [
    {
      id: 'compare',
      title: 'Compare in One Place',
      text: 'Browse and evaluate popular motorcycle variants side-by-side without travelling to multiple scattered showrooms.',
      icon: (
        <svg
          className="benefit-svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M16 3h5v5" />
          <path d="M4 20L21 3" />
          <path d="M21 16v5h-5" />
          <path d="M15 15l6 6" />
          <path d="M4 4l5 5" />
        </svg>
      ),
    },
    {
      id: 'cod',
      title: 'Cash on Delivery Option',
      text: 'Participating dealerships support verified Cash on Delivery arrangements confirmed directly before bike dispatch.',
      icon: (
        <svg
          className="benefit-svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <line x1="2" y1="10" x2="22" y2="10" />
          <circle cx="12" cy="15" r="2" />
        </svg>
      ),
    },
    {
      id: 'pricing',
      title: 'Clear Pricing Guidance',
      text: 'Showroom price estimates and tax indicators are clearly presented once verified against authorized dealership sheets.',
      icon: (
        <svg
          className="benefit-svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
    },
    {
      id: 'support',
      title: 'Inquiry & Dealer Guidance',
      text: 'Assistance for model availability, technical specifications, and dealership connection throughout major Pakistani cities.',
      icon: (
        <svg
          className="benefit-svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
  ];

  return (
    <section className="benefits-section" aria-labelledby="benefits-heading">
      <div className="container">
        <div className="benefits-header">
          <span className="benefits-tag">Why Riders Choose Us</span>
          <h2 id="benefits-heading" className="benefits-heading">
            Convenient Motorcycle Shopping
          </h2>
        </div>

        <div className="benefits-grid">
          {benefits.map((b) => (
            <div key={b.id} className="benefit-card">
              <div className="benefit-icon-wrap">{b.icon}</div>
              <h3 className="benefit-title">{b.title}</h3>
              <p className="benefit-text">{b.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default BenefitsSection;
