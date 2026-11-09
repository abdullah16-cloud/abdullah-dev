import React from 'react';
import { Link } from 'react-router-dom';
import { siteConfig } from '../../data/siteConfig';
import './Footer.css';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          {/* About Column */}
          <div className="footer-column">
            <h2 className="footer-heading">{siteConfig.name}</h2>
            <p className="footer-blurb">{siteConfig.aboutBlurb}</p>
          </div>

          {/* Quick Links Column */}
          <div className="footer-column">
            <h3 className="footer-heading">Quick Links</h3>
            <ul className="footer-links-list">
              {siteConfig.navLinks.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="footer-nav-link">
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/admin" className="footer-nav-link" style={{ color: '#ff6b6b', fontWeight: '600' }}>
                  Admin Panel
                </Link>
              </li>
            </ul>
          </div>

          {/* Delivery Information Column */}
          <div className="footer-column">
            <h3 className="footer-heading">Delivery Information</h3>
            <p className="footer-info-text">{siteConfig.deliveryInfo}</p>
          </div>

          {/* Contact & Social Placeholders Column */}
          <div className="footer-column">
            <h3 className="footer-heading">Contact & Connect</h3>
            <ul className="contact-list">
              <li className="contact-item">
                <span className="contact-label">Phone: </span>
                {siteConfig.contact.phone}
              </li>
              <li className="contact-item">
                <span className="contact-label">Email: </span>
                {siteConfig.contact.email}
              </li>
              <li className="contact-item">
                <span className="contact-label">Address: </span>
                {siteConfig.contact.address}
              </li>
            </ul>

            <div className="social-links" aria-label="Social media channels">
              {siteConfig.socialLinks.map((social) => (
                <span
                  key={social.name}
                  className="social-link disabled"
                  aria-label={social.ariaLabel}
                  title="Coming soon"
                >
                  {social.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="footer-bottom">
          <p className="footer-disclaimer">{siteConfig.disclaimer}</p>
          <p className="footer-copyright">
            &copy; {currentYear} {siteConfig.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
