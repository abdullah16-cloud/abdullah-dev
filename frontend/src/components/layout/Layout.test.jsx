import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import App from '../../App';
import { CartProvider } from '../../context/CartContext';

describe('Layout and Navigation Tests', () => {
  // Test 1: Navbar renders all five links
  it('Navbar renders all five navigation links', () => {
    render(
      <CartProvider>
        <MemoryRouter>
          <Navbar />
        </MemoryRouter>
      </CartProvider>
    );

    const navLinks = ['Home', 'All Bikes', 'Compare', 'About', 'Contact'];
    navLinks.forEach((linkText) => {
      const links = screen.getAllByRole('link', {
        name: linkText,
        hidden: true,
      });
      expect(links.length).toBeGreaterThan(0);
    });
  });

  // Test 2: Hamburger button toggles mobile menu and Escape closes it
  it('Hamburger button toggles the mobile menu (aria-expanded changes) and Escape closes it', () => {
    render(
      <CartProvider>
        <MemoryRouter>
          <Navbar />
        </MemoryRouter>
      </CartProvider>
    );

    const hamburgerBtn = screen.getByRole('button', {
      name: /toggle navigation menu/i,
    });
    expect(hamburgerBtn).toHaveAttribute('aria-expanded', 'false');

    // Click hamburger button to open
    fireEvent.click(hamburgerBtn);
    expect(hamburgerBtn).toHaveAttribute('aria-expanded', 'true');

    // When open, mobile links are accessible
    const mobileLinks = screen.getAllByRole('link', { name: 'All Bikes' });
    expect(mobileLinks.length).toBeGreaterThan(0);

    // Press Escape to close
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(hamburgerBtn).toHaveAttribute('aria-expanded', 'false');
  });

  // Test 3: Submitting search navigates to /bikes?search=<term>; empty search does nothing
  it('Submitting search navigates to /bikes?search=<term>; empty search does nothing', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    // Initial page shows Home hero heading
    expect(
      screen.getByRole('heading', { level: 1, name: /find your next honda motorcycle/i })
    ).toBeInTheDocument();

    const searchInput = screen.getByLabelText(/search motorcycles or parts/i, {
      selector: '#desktop-search',
    });
    const searchForm = searchInput.closest('form');

    // Test empty search submit -> does nothing, stays on Home
    fireEvent.submit(searchForm);
    expect(
      screen.getByRole('heading', { level: 1, name: /find your next honda motorcycle/i })
    ).toBeInTheDocument();

    // Type query and submit
    fireEvent.change(searchInput, { target: { value: 'CG 125' } });
    fireEvent.submit(searchForm);

    // Navigates to BikesPage and renders filtered search results
    expect(screen.getByRole('heading', { level: 1, name: /all motorcycles/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Honda CG 125' })).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { level: 3, name: 'Honda CD 70' })
    ).not.toBeInTheDocument();
  });

  // Test 4: Footer shows the unofficial-store disclaimer and placeholder contact text
  it('Footer shows the unofficial-store disclaimer and placeholder contact text', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );

    expect(screen.getByText(/unofficial store — not affiliated with/i)).toBeInTheDocument();
    expect(screen.getByText(/\[Add phone number\]/i)).toBeInTheDocument();
    expect(screen.getByText(/\[Add email\]/i)).toBeInTheDocument();
    expect(screen.getByText(/\[Add store address\]/i)).toBeInTheDocument();
  });

  // Test 5: Visiting an unknown route shows the 404 page
  it('Visiting an unknown route shows the 404 page', () => {
    render(
      <MemoryRouter initialEntries={['/non-existent-route']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { level: 1, name: /404/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /back to home/i })).toBeInTheDocument();
  });
});
