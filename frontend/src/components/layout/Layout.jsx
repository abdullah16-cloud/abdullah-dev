import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import ScrollToTop from './ScrollToTop';
import './Layout.css';

function Layout() {
  return (
    <div className="site-layout">
      {/* Accessible skip link for keyboard/screen-reader users */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <ScrollToTop />
      <Navbar />

      <main id="main-content" className="site-main-content" tabIndex="-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

export default Layout;
