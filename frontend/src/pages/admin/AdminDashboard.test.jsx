import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import AdminProtectedRoute from '../../components/admin/AdminProtectedRoute';
import AdminDashboardPage from './AdminDashboardPage';
import RecentOrdersTable from '../../components/admin/RecentOrdersTable';
import AdminSidebar from '../../components/admin/AdminSidebar';
import * as AuthContextModule from '../../context/AuthContext';

describe('Admin Dashboard Suite (Phase 11.1)', () => {
  const mockStats = {
    totalProducts: 9,
    activeProducts: 9,
    totalCategories: 3,
    totalOrders: 0,
    totalCustomers: 1,
  };

  const mockOrders = [
    {
      id: '1',
      orderNumber: 'PK-20261102-1234',
      customerName: 'Muhammad Ali',
      shippingCity: 'Lahore',
      createdAt: '2026-11-02T10:30:00Z',
      totalPkr: 149500,
      status: 'pending',
    },
  ];

  it('AdminProtectedRoute: denies unauthenticated visitors with login prompt', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      isAuthenticated: false,
      user: null,
      status: 'idle',
    });

    render(
      <MemoryRouter>
        <AdminProtectedRoute>
          <div>Secret Admin Content</div>
        </AdminProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { level: 1, name: /admin login required/i })).toBeInTheDocument();
    expect(screen.queryByText('Secret Admin Content')).not.toBeInTheDocument();
  });

  it('AdminProtectedRoute: denies non-admin authenticated customers with Access Denied', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      isAuthenticated: true,
      user: { email: 'customer@example.com', role: 'customer' },
      status: 'idle',
    });

    render(
      <MemoryRouter>
        <AdminProtectedRoute>
          <div>Secret Admin Content</div>
        </AdminProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { level: 1, name: /access denied/i })).toBeInTheDocument();
    expect(screen.queryByText('Secret Admin Content')).not.toBeInTheDocument();
  });

  it('AdminProtectedRoute: allows users with role === "admin" to enter', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      isAuthenticated: true,
      user: { email: 'admin@hondabikes.pk', role: 'admin' },
      status: 'idle',
    });

    render(
      <MemoryRouter>
        <AdminProtectedRoute>
          <div>Authorized Admin Content</div>
        </AdminProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Authorized Admin Content')).toBeInTheDocument();
  });

  it('AdminDashboardPage: renders all 5 KPI cards with real numeric telemetry', () => {
    render(
      <MemoryRouter>
        <AdminDashboardPage testStats={mockStats} testOrders={mockOrders} />
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/Total Products: 9/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Active Products: 9/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Categories: 3/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Total Orders: 0/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Total Customers: 1/i)).toBeInTheDocument();
  });

  it('RecentOrdersTable: renders orders correctly and handles empty states gracefully', () => {
    const { rerender } = render(
      <MemoryRouter>
        <RecentOrdersTable orders={mockOrders} />
      </MemoryRouter>
    );

    expect(screen.getByText('PK-20261102-1234')).toBeInTheDocument();
    expect(screen.getByText('Muhammad Ali')).toBeInTheDocument();
    expect(screen.getByText('Lahore')).toBeInTheDocument();
    expect(screen.getByText('pending')).toBeInTheDocument();

    // Rerender empty state
    rerender(
      <MemoryRouter>
        <RecentOrdersTable orders={[]} />
      </MemoryRouter>
    );

    expect(screen.getByText(/no orders have been placed yet/i)).toBeInTheDocument();
  });

  it('AdminSidebar: renders all 6 navigation links and admin profile', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { fullName: 'Super Admin', email: 'admin@hondabikes.pk' },
      logout: vi.fn(),
    });

    render(
      <MemoryRouter>
        <AdminSidebar isOpen={true} onClose={vi.fn()} />
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /products/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /categories/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /inventory/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /orders/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /customers/i })).toBeInTheDocument();
    expect(screen.getByText('Super Admin')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log out of admin dashboard/i })).toBeInTheDocument();
  });
});
