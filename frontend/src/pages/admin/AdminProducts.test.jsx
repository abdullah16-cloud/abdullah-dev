import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdminProductsPage from './AdminProductsPage';
import { adminService } from '../../services/adminService';

describe('Admin Products Management Suite (Phase 11.2)', () => {
  const mockCategories = [
    { id: 1, slug: 'commuter', title: 'Commuter' },
    { id: 2, slug: 'standard', title: 'Standard' },
    { id: 3, slug: 'sport', title: 'Sport & Touring' },
  ];

  const mockProducts = [
    {
      id: 'honda-cd-70',
      internalId: 1,
      name: 'Honda CD 70',
      slug: 'honda-cd-70',
      category: 'commuter',
      categoryTitle: 'Commuter',
      engineCc: 72,
      pricePkr: 157900,
      availability: 'in_stock',
      isActive: true,
      featured: true,
      images: ['https://example.com/cd70.jpg'],
    },
    {
      id: 'honda-cg-125',
      internalId: 2,
      name: 'Honda CG 125',
      slug: 'honda-cg-125',
      category: 'standard',
      categoryTitle: 'Standard',
      engineCc: 124,
      pricePkr: 234900,
      availability: 'in_stock',
      isActive: false, // inactive model
      featured: false,
      images: [],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(adminService, 'getCategories').mockResolvedValue({
      data: mockCategories,
    });
    vi.spyOn(adminService, 'listProducts').mockResolvedValue({
      data: mockProducts,
      pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
    });
    vi.spyOn(adminService, 'createProduct').mockResolvedValue({
      data: { id: 3, name: 'Honda New Bike', slug: 'honda-new-bike', isActive: true },
    });
    vi.spyOn(adminService, 'updateProduct').mockResolvedValue({
      data: { id: 1, name: 'Honda CD 70 Updated', slug: 'honda-cd-70', isActive: true },
    });
    vi.spyOn(adminService, 'deactivateProduct').mockResolvedValue({
      data: { message: 'Deactivated' },
    });
    vi.spyOn(adminService, 'reactivateProduct').mockResolvedValue({
      data: { message: 'Reactivated' },
    });
  });

  it('renders products table with model name, category, price, and status badges', async () => {
    render(<AdminProductsPage />);

    expect(screen.getByRole('heading', { level: 1, name: /motorcycle catalog management/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Honda CD 70')).toBeInTheDocument();
      expect(screen.getByText('/honda-cd-70')).toBeInTheDocument();
      expect(screen.getByText('PKR 157,900')).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();

      expect(screen.getByText('Honda CG 125')).toBeInTheDocument();
      expect(screen.getByText('Inactive')).toBeInTheDocument();
    });
  });

  it('supports search and category filtering, and reset filters button', async () => {
    render(<AdminProductsPage />);

    await waitFor(() => {
      expect(screen.getByText('Honda CD 70')).toBeInTheDocument();
    });

    const searchInput = screen.getByTestId('admin-search-input');
    fireEvent.change(searchInput, { target: { value: 'pridor' } });

    await waitFor(() => {
      expect(adminService.listProducts).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'pridor' })
      );
    });

    const resetBtn = screen.getByTestId('clear-filters-btn');
    fireEvent.click(resetBtn);

    expect(searchInput.value).toBe('');
  });

  it('renders empty state when no products match search criteria', async () => {
    vi.spyOn(adminService, 'listProducts').mockResolvedValueOnce({
      data: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
    });

    render(<AdminProductsPage />);

    await waitFor(() => {
      expect(screen.getByTestId('admin-empty-state')).toBeInTheDocument();
      expect(screen.getByText(/no motorcycles found/i)).toBeInTheDocument();
    });
  });

  it('renders error state and retries fetching when API fails', async () => {
    vi.spyOn(adminService, 'listProducts').mockRejectedValueOnce(
      new Error('Database query timed out')
    );

    render(<AdminProductsPage />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/database query timed out/i)).toBeInTheDocument();
    });

    const retryBtn = screen.getByRole('button', { name: /retry/i });
    fireEvent.click(retryBtn);

    await waitFor(() => {
      expect(adminService.listProducts).toHaveBeenCalledTimes(2);
    });
  });

  it('opens Add Motorcycle Modal, validates fields, and creates product', async () => {
    render(<AdminProductsPage />);

    await waitFor(() => {
      expect(screen.getByText('Honda CD 70')).toBeInTheDocument();
    });

    const addBtn = screen.getByTestId('add-product-btn');
    fireEvent.click(addBtn);

    // Modal is opened
    expect(screen.getByRole('heading', { level: 2, name: /add new motorcycle model/i })).toBeInTheDocument();

    const nameInput = screen.getByLabelText(/model name/i);
    const priceInput = screen.getByLabelText(/price \(pkr\)/i);
    const saveBtn = screen.getByRole('button', { name: /create product/i });

    fireEvent.change(nameInput, { target: { value: 'Honda CG 150 Special' } });
    fireEvent.change(priceInput, { target: { value: '380000' } });

    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(adminService.createProduct).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Honda CG 150 Special',
          slug: 'honda-cg-150-special',
          pricePkr: 380000,
        })
      );
    });
  });

  it('opens Edit Motorcycle Modal with prefilled values and updates product', async () => {
    render(<AdminProductsPage />);

    await waitFor(() => {
      expect(screen.getByText('Honda CD 70')).toBeInTheDocument();
    });

    const editBtn = screen.getByTestId('edit-btn-honda-cd-70');
    fireEvent.click(editBtn);

    // Modal opened with edit title
    expect(screen.getByRole('heading', { level: 2, name: /edit motorcycle: honda cd 70/i })).toBeInTheDocument();

    const priceInput = screen.getByLabelText(/price \(pkr\)/i);
    expect(priceInput.value).toBe('157900');

    fireEvent.change(priceInput, { target: { value: '159900' } });

    const saveBtn = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(adminService.updateProduct).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          pricePkr: 159900,
        })
      );
    });
  });

  it('confirms and triggers product deactivation when clicking Deactivate button', async () => {
    render(<AdminProductsPage />);

    await waitFor(() => {
      expect(screen.getByText('Honda CD 70')).toBeInTheDocument();
    });

    const deactBtn = screen.getByTestId('deactivate-btn-honda-cd-70');
    fireEvent.click(deactBtn);

    // Confirmation dialog appears
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(screen.getByText(/are you sure you want to deactivate "honda cd 70"/i)).toBeInTheDocument();

    const confirmBtn = screen.getByRole('button', { name: /deactivate model/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(adminService.deactivateProduct).toHaveBeenCalledWith(1);
    });
  });

  it('confirms and triggers product reactivation when clicking Reactivate button', async () => {
    render(<AdminProductsPage />);

    await waitFor(() => {
      expect(screen.getByText('Honda CG 125')).toBeInTheDocument();
    });

    const reactBtn = screen.getByTestId('reactivate-btn-honda-cg-125');
    fireEvent.click(reactBtn);

    // Confirmation dialog appears
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(screen.getByText(/are you sure you want to reactivate "honda cg 125"/i)).toBeInTheDocument();

    const confirmBtn = screen.getByRole('button', { name: /reactivate model/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(adminService.reactivateProduct).toHaveBeenCalledWith(2);
    });
  });
});
