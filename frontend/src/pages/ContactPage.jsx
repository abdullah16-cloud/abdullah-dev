import React, { useState } from 'react';
import { usePageTitle } from '../hooks/usePageTitle';
import FormField from '../components/common/FormField';
import { siteConfig } from '../data/siteConfig';
import './ContactPage.css';

/**
 * ContactPage: Functional inquiry and feedback interface.
 * Connects riders with store assistance while maintaining honesty regarding official Atlas Honda dealerships.
 */
function ContactPage() {
  usePageTitle('Contact Us');

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    city: '',
    subject: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (field, val) => {
    setForm((prev) => ({ ...prev, [field]: val }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!form.fullName.trim()) newErrors.fullName = 'Full name is required.';
    if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) {
      newErrors.email = 'Valid email address is required.';
    }
    if (!form.message.trim()) newErrors.message = 'Please enter your inquiry message.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitted(true);
  };

  const majorCities = ['Lahore', 'Karachi', 'Rawalpindi', 'Islamabad', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta'];

  return (
    <div className="contact-page">
      <div className="container">
        <header className="contact-header">
          <span className="contact-tag">Get in Touch</span>
          <h1 className="contact-title">Contact Honda Bikes Store</h1>
          <p className="contact-subtitle">
            Have questions about motorcycle specifications, demo listings, or community inquiries? Reach out to our digital platform team below.
          </p>
        </header>

        <div className="contact-layout">
          {/* Inquiry Form */}
          <div className="contact-form-card">
            {submitted ? (
              <div className="contact-success-box" role="status">
                <h2 className="contact-success-title">Inquiry Received</h2>
                <p>
                  Thank you, <strong>{form.fullName}</strong>. Your inquiry regarding{' '}
                  <em>{form.subject || 'general feedback'}</em> has been submitted. Our team will review your message and reply to <strong>{form.email}</strong>.
                </p>
                <button
                  type="button"
                  className="btn btn-dark"
                  style={{ marginTop: 'var(--space-4)' }}
                  onClick={() => {
                    setSubmitted(false);
                    setForm({ fullName: '', email: '', phone: '', city: '', subject: '', message: '' });
                  }}
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <>
                <h2 className="contact-form-title">Send Us an Inquiry</h2>
                <p className="contact-form-desc">
                  Fill in your details below and we will respond as soon as possible.
                </p>

                <form onSubmit={handleSubmit} noValidate className="contact-form">
                  <FormField id="contact-name" label="Full Name" required error={errors.fullName}>
                    <input
                      id="contact-name"
                      type="text"
                      className="form-input"
                      placeholder="e.g. Tariq Mehmood"
                      value={form.fullName}
                      onChange={(e) => handleChange('fullName', e.target.value)}
                    />
                  </FormField>

                  <FormField id="contact-email" label="Email Address" required error={errors.email}>
                    <input
                      id="contact-email"
                      type="email"
                      className="form-input"
                      placeholder="e.g. name@example.com"
                      value={form.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                    />
                  </FormField>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                    <FormField id="contact-phone" label="Mobile Number (Optional)">
                      <input
                        id="contact-phone"
                        type="tel"
                        className="form-input"
                        placeholder="03XXXXXXXXX"
                        value={form.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                      />
                    </FormField>

                    <FormField id="contact-city" label="City">
                      <input
                        id="contact-city"
                        type="text"
                        className="form-input"
                        placeholder="e.g. Lahore, Karachi"
                        value={form.city}
                        onChange={(e) => handleChange('city', e.target.value)}
                      />
                    </FormField>
                  </div>

                  <FormField id="contact-subject" label="Subject / Motorcycle Model">
                    <input
                      id="contact-subject"
                      type="text"
                      className="form-input"
                      placeholder="e.g. Question about Honda CG 125"
                      value={form.subject}
                      onChange={(e) => handleChange('subject', e.target.value)}
                    />
                  </FormField>

                  <FormField id="contact-message" label="Message" required error={errors.message}>
                    <textarea
                      id="contact-message"
                      className="form-input"
                      rows={5}
                      placeholder="Enter your question, suggestion, or feedback..."
                      value={form.message}
                      onChange={(e) => handleChange('message', e.target.value)}
                    />
                  </FormField>

                  <button type="submit" className="btn btn-primary" style={{ marginTop: 'var(--space-2)' }}>
                    Submit Inquiry
                  </button>
                </form>
              </>
            )}
          </div>

          {/* Dealership & Official Disclaimer Info */}
          <div className="contact-info-card">
            <div>
              <h3 className="info-block-title">Official Dealership Bookings</h3>
              <p className="info-block-text">
                For verified on-road booking rates, official registration documentation, and manufacturer warranties, please visit an authorized 3S Atlas Honda dealership in your local area.
              </p>
              <div className="dealership-cities-list">
                {majorCities.map((c) => (
                  <span key={c} className="city-pill">
                    {c}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="info-block-title">Platform Transparency</h3>
              <p className="info-block-text">
                {siteConfig.disclaimer}
              </p>
            </div>

            <div>
              <h3 className="info-block-title">Delivery & Dispatch Policy</h3>
              <p className="info-block-text">
                {siteConfig.deliveryInfo}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactPage;
