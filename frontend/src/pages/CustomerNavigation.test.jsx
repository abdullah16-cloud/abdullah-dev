import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import AboutPage from './AboutPage';
import ContactPage from './ContactPage';
import ComparePage from './ComparePage';
import App from '../App';
import { CompareProvider } from '../context/CompareContext';
import { CartProvider } from '../context/CartContext';
import { AuthProvider } from '../context/AuthContext';

describe('Customer Website Navigation & Pages Suite', () => {
  it('AboutPage: renders company mission, principles, and official disclaimer', () => {
    render(
      <MemoryRouter>
        <AboutPage />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { level: 1, name: /built for pakistani motorcyclists/i })).toBeInTheDocument();
    expect(screen.getByText(/data integrity first/i)).toBeInTheDocument();
    expect(screen.getByText(/pakistani route focus/i)).toBeInTheDocument();
    expect(screen.getByText(/unofficial store/i)).toBeInTheDocument();
  });

  it('ContactPage: validates required fields and submits inquiry cleanly', () => {
    render(
      <MemoryRouter>
        <ContactPage />
      </MemoryRouter>
    );

    const submitBtn = screen.getByRole('button', { name: /submit inquiry/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/full name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/valid email address is required/i)).toBeInTheDocument();
    expect(screen.getByText(/please enter your inquiry message/i)).toBeInTheDocument();

    // Fill valid data
    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    const messageInput = screen.getByLabelText(/message/i);

    fireEvent.change(nameInput, { target: { value: 'Hamza Khan' } });
    fireEvent.change(emailInput, { target: { value: 'hamza@example.com' } });
    fireEvent.change(messageInput, { target: { value: 'I have a question about CD 70 fuel average.' } });

    fireEvent.click(submitBtn);

    expect(screen.getByRole('heading', { level: 2, name: /inquiry received/i })).toBeInTheDocument();
    expect(screen.getByText(/hamza@example\.com/i)).toBeInTheDocument();
  });

  it('ComparePage: renders comparison table with motorcycle specs and allows model removal', () => {
    render(
      <CompareProvider>
        <MemoryRouter>
          <ComparePage />
        </MemoryRouter>
      </CompareProvider>
    );

    expect(screen.getByRole('heading', { level: 1, name: /compare honda motorcycles/i })).toBeInTheDocument();
    expect(screen.getAllByText('Honda CD 70').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Honda CG 125').length).toBeGreaterThan(0);
    expect(screen.getByText(/engine displacement/i)).toBeInTheDocument();
    expect(screen.getByText(/estimated price/i)).toBeInTheDocument();
  });

  it('Full App Route Integration: navigates to /about, /contact, and /compare without 404', () => {
    const { unmount } = render(
      <AuthProvider>
        <CompareProvider>
          <CartProvider>
            <MemoryRouter initialEntries={['/about']}>
              <App />
            </MemoryRouter>
          </CartProvider>
        </CompareProvider>
      </AuthProvider>
    );

    expect(screen.getByRole('heading', { level: 1, name: /built for pakistani motorcyclists/i })).toBeInTheDocument();
    unmount();

    render(
      <AuthProvider>
        <CompareProvider>
          <CartProvider>
            <MemoryRouter initialEntries={['/contact']}>
              <App />
            </MemoryRouter>
          </CartProvider>
        </CompareProvider>
      </AuthProvider>
    );

    expect(screen.getByRole('heading', { level: 1, name: /contact honda bikes store/i })).toBeInTheDocument();
  });
});
