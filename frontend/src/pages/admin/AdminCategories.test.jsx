import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdminCategoriesPage from './AdminCategoriesPage';
import { adminService } from '../../services/adminService';

describe('Admin Category Management Suite (Phase 11.3)', () => {
  const mockCategories = [
    {
      id: '1',
      internalId: 1,
      slug: 'commuter',
      title: 'Commuter',
      badgeText: 'High Efficiency',
      description: 'Fuel-efficient, reliable daily riders.',
      productCount: 4,
      isActive: true,
    },
    {
      id: '2',
      internalId: 2,
      slug: 'standard',
      title: 'Standard',
      badgeText: 'All-Rounder',
      description: 'Versatile classic street motorcycles.',
      productCount: 3,
      isActive: false, // inactive category for testing
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(adminService, 'listCategories').mockResolvedValue({
      data: mockCategories,
    });
    vi.spyOn(adminService, 'createCategory').mockResolvedValue({
      data: { id: 3, slug: 'electric', title: 'Electric', isActive: true },
    });
    vi.spyOn(adminService, 'updateCategory').mockResolvedValue({
      data: { id: 1, slug: 'commuter', title: 'Commuter Updated', isActive: true },
    });
    vi.spyOn(adminService, 'deactivateCategory').mockResolvedValue({
      data: { message: 'Category deactivated successfully.' },
    });
    vi.spyOn(adminService, 'reactivateCategory').mockResolvedValue({
      data: { message: 'Category reactivated successfully.' },
    });
  });

  it('renders categories table with title, slug, badge, bike count, and status badges', async () => {
    render(<AdminCategoriesPage />);

    expect(screen.getByRole('heading', { level: 1, name: /category management/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Commuter')).toBeInTheDocument();
      expect(screen.getByText('/commuter')).toBeInTheDocument();
      expect(screen.getByText('High Efficiency')).toBeInTheDocument();
      expect(screen.getByText(/4 models/i)).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();

      expect(screen.getByText('Standard')).toBeInTheDocument();
      expect(screen.getByText('Inactive')).toBeInTheDocument();
    });
  });

  it('supports search and status filtering, and clear filters button', async () => {
    render(<AdminCategoriesPage />);

    await waitFor(() => {
      expect(screen.getByText('Commuter')).toBeInTheDocument();
    });

    const searchInput = screen.getByTestId('admin-category-search-input');
    fireEvent.change(searchInput, { target: { value: 'standard' } });

    await waitFor(() => {
      expect(adminService.listCategories).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'standard' })
      );
    });

    const resetBtn = screen.getByTestId('clear-category-filters-btn');
    fireEvent.click(resetBtn);

    expect(searchInput.value).toBe('');
  });

  it('renders empty state when no categories match search criteria', async () => {
    vi.spyOn(adminService, 'listCategories').mockResolvedValueOnce({
      data: [],
    });

    render(<AdminCategoriesPage />);

    await waitFor(() => {
      expect(screen.getByTestId('category-empty-state')).toBeInTheDocument();
      expect(screen.getByText(/no categories found/i)).toBeInTheDocument();
    });
  });

  it('renders error state and retries fetching when API fails', async () => {
    vi.spyOn(adminService, 'listCategories').mockRejectedValueOnce(
      new Error('Failed to connect to database')
    );

    render(<AdminCategoriesPage />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/failed to connect to database/i)).toBeInTheDocument();
    });

    const retryBtn = screen.getByRole('button', { name: /retry/i });
    fireEvent.click(retryBtn);

    await waitFor(() => {
      expect(adminService.listCategories).toHaveBeenCalledTimes(2);
    });
  });

  it('opens Add Category Modal, auto-generates slug, and creates category', async () => {
    render(<AdminCategoriesPage />);

    await waitFor(() => {
      expect(screen.getByText('Commuter')).toBeInTheDocument();
    });

    const addBtn = screen.getByTestId('add-category-btn');
    fireEvent.click(addBtn);

    expect(screen.getByRole('heading', { level: 2, name: /add new category/i })).toBeInTheDocument();

    const titleInput = screen.getByLabelText(/category title/i);
    const badgeInput = screen.getByLabelText(/badge text/i);
    const saveBtn = screen.getByRole('button', { name: /create category/i });

    fireEvent.change(titleInput, { target: { value: 'Electric & Hybrid' } });
    fireEvent.change(badgeInput, { target: { value: 'Eco Future' } });

    // Check slug auto-generation
    const slugInput = screen.getByLabelText(/url slug/i);
    expect(slugInput.value).toBe('electric-hybrid');

    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(adminService.createCategory).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Electric & Hybrid',
          slug: 'electric-hybrid',
          badgeText: 'Eco Future',
        })
      );
    });
  });

  it('opens Edit Category Modal with prefilled values and updates category', async () => {
    render(<AdminCategoriesPage />);

    await waitFor(() => {
      expect(screen.getByText('Commuter')).toBeInTheDocument();
    });

    const editBtn = screen.getByTestId('edit-cat-commuter');
    fireEvent.click(editBtn);

    expect(screen.getByRole('heading', { level: 2, name: /edit category: commuter/i })).toBeInTheDocument();

    const badgeInput = screen.getByLabelText(/badge text/i);
    expect(badgeInput.value).toBe('High Efficiency');

    fireEvent.change(badgeInput, { target: { value: 'Ultra Fuel Efficient' } });

    const saveBtn = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(adminService.updateCategory).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          badgeText: 'Ultra Fuel Efficient',
        })
      );
    });
  });

  it('confirms and triggers category deactivation when clicking Deactivate button', async () => {
    render(<AdminCategoriesPage />);

    await waitFor(() => {
      expect(screen.getByText('Commuter')).toBeInTheDocument();
    });

    const deactBtn = screen.getByTestId('deactivate-cat-commuter');
    fireEvent.click(deactBtn);

    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(screen.getByText(/are you sure you want to deactivate category "commuter"/i)).toBeInTheDocument();
    expect(screen.getByText(/this category currently contains 4 motorcycle models/i)).toBeInTheDocument();

    const confirmBtn = screen.getByRole('button', { name: /deactivate category/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(adminService.deactivateCategory).toHaveBeenCalledWith(1);
    });
  });

  it('confirms and triggers category reactivation when clicking Reactivate button', async () => {
    render(<AdminCategoriesPage />);

    await waitFor(() => {
      expect(screen.getByText('Standard')).toBeInTheDocument();
    });

    const reactBtn = screen.getByTestId('reactivate-cat-standard');
    fireEvent.click(reactBtn);

    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(screen.getByText(/are you sure you want to reactivate category "standard"/i)).toBeInTheDocument();

    const confirmBtn = screen.getByRole('button', { name: /reactivate category/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(adminService.reactivateCategory).toHaveBeenCalledWith(2);
    });
  });
});

