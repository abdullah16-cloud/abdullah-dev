import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import App from '../../App';
import LoginPage from '../LoginPage';
import RegisterPage from '../RegisterPage';
import OrderCard from '../../components/account/OrderCard';
import OrderDetails from '../../components/account/OrderDetails';
import OrderHistoryPage from './OrderHistoryPage';
import { AuthProvider } from '../../context/AuthContext';
import { CartProvider } from '../../context/CartContext';
import { CompareProvider } from '../../context/CompareContext';

describe('Phase 7 Account Frontend Tests', () => {
  let fetchSpy;
  let setItemSpy;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, 'fetch');
    setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
  });

  afterEach(() => {
    fetchSpy.mockRestore();
    setItemSpy.mockRestore();
  });

  const renderWithProviders = (ui, initialEntry = '/') => {
    return render(
      <AuthProvider>
        <CompareProvider>
          <CartProvider>
            <MemoryRouter initialEntries={[initialEntry]}>{ui}</MemoryRouter>
          </CartProvider>
        </CompareProvider>
      </AuthProvider>
    );
  };

  // Test 3: Login form validation & connected API submit
  it('Login: empty submit shows error summary; valid submit calls backend API and clears password', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({
        success: true,
        data: { user: { id: '1', email: 'user@example.com', fullName: 'Test User' } },
      }),
    });

    renderWithProviders(<LoginPage />, '/login');

    const submitBtn = screen.getByRole('button', { name: /^log in$/i });
    fireEvent.click(submitBtn);

    // Error summary should be shown
    expect(
      screen.getByRole('alert', { name: /problem with your submission/i })
    ).toBeInTheDocument();
    expect(screen.getAllByText('Email is required.').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Password is required.').length).toBeGreaterThanOrEqual(1);

    // Enter valid credentials
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/^password/i);

    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'SecretPassword123' } });

    fireEvent.click(submitBtn);

    // Backend endpoint called with credentials
    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith(
        '/api/auth/login',
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
        })
      );
    });

    // Password must be cleared for security
    expect(passwordInput.value).toBe('');
    // Zero localStorage writes because auth token lives in httpOnly cookie
    expect(setItemSpy).not.toHaveBeenCalled();
  });

  // Test 4: Register validation & connected API submit
  it('Register: flags mismatches and missing terms; calls backend API on valid submit', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({
        success: true,
        data: { user: { id: '2', email: 'tariq@example.com', fullName: 'Tariq Mehmood' } },
      }),
    });

    renderWithProviders(<RegisterPage />, '/register');

    const submitBtn = screen.getByRole('button', { name: /create account/i });
    fireEvent.click(submitBtn);

    expect(screen.getAllByText('Full name is required.').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Confirm your password.').length).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByText('You must agree to the Terms and Privacy Policy.').length
    ).toBeGreaterThanOrEqual(1);

    // Fill with mismatched passwords
    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    const phoneInput = screen.getByLabelText(/mobile number/i);
    const passInput = screen.getByLabelText(/^password/i);
    const confirmInput = screen.getByLabelText(/^confirm password/i);
    const termsCheckbox = screen.getByRole('checkbox');

    fireEvent.change(nameInput, { target: { value: 'Tariq Mehmood' } });
    fireEvent.change(emailInput, { target: { value: 'tariq@example.com' } });
    fireEvent.change(phoneInput, { target: { value: '03009876543' } });
    fireEvent.change(passInput, { target: { value: 'MySecretPass123' } });
    fireEvent.change(confirmInput, { target: { value: 'DifferentPass123' } });
    fireEvent.click(termsCheckbox);

    fireEvent.click(submitBtn);

    expect(screen.getAllByText('Passwords do not match.').length).toBeGreaterThanOrEqual(1);

    // Fix mismatch
    fireEvent.change(confirmInput, { target: { value: 'MySecretPass123' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith(
        '/api/auth/register',
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
        })
      );
    });

    expect(passInput.value).toBe('');
    expect(confirmInput.value).toBe('');
    expect(setItemSpy).not.toHaveBeenCalled();
  });

  // Test 5: Show/hide password toggle
  it('Show/hide password toggle changes input type and aria-pressed', () => {
    renderWithProviders(<LoginPage />, '/login');

    const passwordInput = screen.getByLabelText(/^password/i);
    const toggleBtn = screen.getByRole('button', { name: /show password/i });

    expect(passwordInput.type).toBe('password');
    expect(toggleBtn).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(toggleBtn);
    expect(passwordInput.type).toBe('text');
    expect(toggleBtn).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(toggleBtn);
    expect(passwordInput.type).toBe('password');
    expect(toggleBtn).toHaveAttribute('aria-pressed', 'false');
  });

  // Test 6: Protected routes gate when unauthenticated
  it('Visiting /account and /account/orders while logged out shows "Please log in" state', () => {
    const { unmount } = renderWithProviders(<App />, '/account');
    expect(screen.getByRole('heading', { level: 1, name: /please log in/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /create an account/i })).toBeInTheDocument();
    unmount();

    renderWithProviders(<App />, '/account/orders');
    expect(screen.getByRole('heading', { level: 1, name: /please log in/i })).toBeInTheDocument();
  });

  // Test 7: OrderHistoryPage empty state, OrderCard, and OrderDetails mock rendering
  it('OrderHistoryPage shows EmptyState when empty, and OrderCard/OrderDetails render mock data properly', () => {
    // Empty state
    const { unmount } = renderWithProviders(<OrderHistoryPage testOrders={[]} />);
    expect(screen.getByText('No orders to show')).toBeInTheDocument();
    unmount();

    // Mock OrderCard
    const mockOrder = {
      id: 'ord_99',
      orderNumber: 'PK-99',
      createdAt: '2026-10-25',
      status: 'confirmed',
      totalPkr: 157900,
      itemsCount: 1,
      customer: { city: 'Islamabad' },
      items: [{ name: 'Honda CD 70', quantity: 1, pricePkr: 157900 }],
    };

    const { unmount: unmountCard } = renderWithProviders(<OrderCard order={mockOrder} />);
    expect(screen.getByText(/order #pk-99/i)).toBeInTheDocument();
    expect(screen.getByText(/total: pkr 157,900/i)).toBeInTheDocument();
    unmountCard();

    // Mock OrderDetails
    renderWithProviders(<OrderDetails order={mockOrder} />);
    expect(screen.getByText(/cash on delivery \(cod\)/i)).toBeInTheDocument();
    expect(screen.getByText('Honda CD 70')).toBeInTheDocument();
    expect(screen.getByLabelText(/order status timeline/i)).toBeInTheDocument();
  });

  // Test 8: Navbar links and Placeholders (/forgot-password, /terms, /privacy)
  it('Navbar contains Account Login link, and forgot-password, terms, privacy render placeholders', () => {
    const { unmount } = renderWithProviders(<App />, '/');
    const accountLinks = screen.getAllByRole('link', { name: /account/i });
    expect(accountLinks.length).toBeGreaterThan(0);
    unmount();

    const { unmount: u1 } = renderWithProviders(<App />, '/forgot-password');
    expect(screen.getByRole('heading', { level: 1, name: /password reset/i })).toBeInTheDocument();
    expect(screen.getByText(/password reset is not available yet/i)).toBeInTheDocument();
    u1();

    const { unmount: u2 } = renderWithProviders(<App />, '/terms');
    expect(
      screen.getByRole('heading', { level: 1, name: /terms of service/i })
    ).toBeInTheDocument();
    u2();

    renderWithProviders(<App />, '/privacy');
    expect(screen.getByRole('heading', { level: 1, name: /privacy policy/i })).toBeInTheDocument();
  });
});
