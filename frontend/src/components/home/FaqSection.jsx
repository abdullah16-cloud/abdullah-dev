import React from 'react';
import { faqs } from '../../data/faqs';
import './FaqSection.css';

/**
 * FAQ Section: Accessible accordions utilizing native semantic <details> and <summary> tags.
 */
function FaqSection() {
  return (
    <section className="faq-section" aria-labelledby="faq-heading">
      <div className="container">
        <div className="faq-header">
          <span className="faq-tag">Have Questions?</span>
          <h2 id="faq-heading" className="faq-heading">
            Frequently Asked Questions
          </h2>
          <p className="faq-subtext">
            Essential facts on our platform status, Cash on Delivery mechanics, and model
            specifications.
          </p>
        </div>

        <div className="faq-list">
          {faqs.map((faq, index) => (
            <details key={faq.id} className="faq-item" open={index === 0}>
              <summary className="faq-summary">
                <span>{faq.question}</span>
                <svg
                  className="faq-chevron"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </summary>
              <p className="faq-answer">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FaqSection;
