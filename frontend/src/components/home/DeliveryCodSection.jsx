import React from 'react';
import './DeliveryCodSection.css';

/**
 * Delivery & Cash on Delivery Section:
 * Clearly details the 4-step arrangement process with realistic dealership disclaimers.
 */
function DeliveryCodSection() {
  const steps = [
    {
      num: '01',
      title: 'Choose Motorcycle',
      desc: 'Browse candidate models and select the bike that matches your riding requirements.',
      icon: (
        <svg
          className="step-icon-svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v8" />
          <path d="M8 12h8" />
        </svg>
      ),
    },
    {
      num: '02',
      title: 'Submit Inquiry / Order',
      desc: 'Provide your city, contact information, and preferred color preferences.',
      icon: (
        <svg
          className="step-icon-svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      ),
    },
    {
      num: '03',
      title: 'Dealership Confirmation',
      desc: 'An authorized regional showroom checks inventory, color availability, and road registration.',
      icon: (
        <svg
          className="step-icon-svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
    },
    {
      num: '04',
      title: 'Delivery & Payment',
      desc: 'Arrange showroom collection or doorstep delivery with Cash on Delivery verified before handover.',
      icon: (
        <svg
          className="step-icon-svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="1" y="3" width="15" height="13" />
          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
          <circle cx="5.5" cy="18.5" r="2.5" />
          <circle cx="18.5" cy="18.5" r="2.5" />
        </svg>
      ),
    },
  ];

  return (
    <section className="delivery-cod-section" aria-labelledby="delivery-heading">
      <div className="container">
        <div className="delivery-header">
          <span className="delivery-tag">Transparent Process</span>
          <h2 id="delivery-heading" className="delivery-heading">
            How Cash on Delivery Works
          </h2>
          <p className="delivery-subtext">
            Simple, secure steps to reserve your motorcycle and settle payment with verified local
            dealership coordination.
          </p>
        </div>

        <div className="delivery-steps-grid">
          {steps.map((st) => (
            <div key={st.num} className="step-card">
              <span className="step-number" aria-hidden="true">
                {st.num}
              </span>
              <div className="step-icon-wrap">{st.icon}</div>
              <h3 className="step-title">{st.title}</h3>
              <p className="step-desc">{st.desc}</p>
            </div>
          ))}
        </div>

        <div className="delivery-notice-box" role="note">
          <svg
            className="delivery-notice-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p className="delivery-notice-text">
            <strong>Important Purchase Note:</strong> Motorcycle purchases may require dealership
            confirmation, delivery and registration arrangements. Details are confirmed before
            dispatch.
          </p>
        </div>
      </div>
    </section>
  );
}

export default DeliveryCodSection;
