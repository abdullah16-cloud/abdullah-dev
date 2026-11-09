import React, { useState, useEffect, useCallback } from 'react';
import { adminService } from '../../services/adminService';
import CategoryFormModal from '../../components/admin/CategoryFormModal';
import ConfirmationModal from '../../components/admin/ConfirmationModal';
import './AdminProductsPage.css'; // Reuses base admin table and filter toolbar styling
import './AdminCategoriesPage.css';

/**
 * AdminCategoriesPage: Full category management for store administrators.
 * Supports searching, active/inactive filtering, category creation, editing,
 * and soft deactivation/reactivation.
 */
function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // UI States
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  // Form Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Deactivation / Reactivation Confirmation Dialog
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    category: null,
    targetState: false, // false = deactivate, true = reactivate
    isProcessing: false,
  });

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await adminService.listCategories({
        search: search.trim() || undefined,
        status: statusFilter || undefined,
      });

      const catList = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
          ? res.data
          : [];
      setCategories(catList);
    } catch (err) {
      console.error('Error fetching admin categories:', err);
      setError(err?.message || 'Failed to load motorcycle categories.');
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter]);

  // Debounced search / filter trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCategories();
    }, 250);

    return () => clearTimeout(timer);
  }, [fetchCategories]);

  const handleClearFilters = () => {
    setSearch('');
    setStatusFilter('');
  };

  // Add Category Flow
  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setIsFormModalOpen(true);
  };

  // Edit Category Flow
  const handleOpenEditModal = (cat) => {
    setEditingCategory(cat);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    if (!isSaving) {
      setIsFormModalOpen(false);
      setEditingCategory(null);
    }
  };

  const handleSaveCategory = async (formData) => {
    setIsSaving(true);
    setActionSuccess(null);
    try {
      if (editingCategory) {
        const catId = editingCategory.internalId || editingCategory.id;
        await adminService.updateCategory(catId, formData);
        setActionSuccess(`Category "${formData.title}" was updated successfully.`);
      } else {
        await adminService.createCategory(formData);
        setActionSuccess(`New category "${formData.title}" was created successfully.`);
      }
      setIsFormModalOpen(false);
      setEditingCategory(null);
      await fetchCategories();
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle Active State Dialog Flow
  const handleOpenStatusModal = (cat, targetState) => {
    setConfirmDialog({
      isOpen: true,
      category: cat,
      targetState,
      isProcessing: false,
    });
  };

  const handleCloseStatusModal = () => {
    if (!confirmDialog.isProcessing) {
      setConfirmDialog({
        isOpen: false,
        category: null,
        targetState: false,
        isProcessing: false,
      });
    }
  };

  const handleConfirmStatusChange = async () => {
    const { category, targetState } = confirmDialog;
    if (!category) return;

    setConfirmDialog((prev) => ({ ...prev, isProcessing: true }));
    setActionSuccess(null);

    const catId = category.internalId || category.id;
    try {
      if (targetState) {
        await adminService.reactivateCategory(catId);
        setActionSuccess(`Category "${category.title}" has been reactivated and is now visible in the catalog.`);
      } else {
        await adminService.deactivateCategory(catId);
        setActionSuccess(`Category "${category.title}" has been deactivated and hidden from the customer catalog.`);
      }
      setConfirmDialog({
        isOpen: false,
        category: null,
        targetState: false,
        isProcessing: false,
      });
      await fetchCategories();
    } catch (err) {
      console.error('Error changing category active status:', err);
      setError(err?.message || 'Failed to update category status.');
      setConfirmDialog((prev) => ({ ...prev, isProcessing: false }));
    }
  };

  return (
    <div className="admin-categories-page" data-testid="admin-categories-page">
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Category Management</h1>
          <p className="admin-page-desc">
            Organize motorcycle models into customer segments and manage promotional badges.
          </p>
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={handleOpenAddModal}
          data-testid="add-category-btn"
        >
          + Add Category
        </button>
      </div>

      {/* Success Notification Banner */}
      {actionSuccess && (
        <div className="admin-success-banner" role="status">
          <span>{actionSuccess}</span>
          <button
            type="button"
            className="admin-banner-dismiss"
            onClick={() => setActionSuccess(null)}
            aria-label="Dismiss message"
          >
            ×
          </button>
        </div>
      )}

      {/* Filters Toolbar */}
      <div className="admin-filters-bar" role="search">
        <div className="admin-search-input-wrap">
          <svg
            className="admin-search-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="admin-search-input"
            placeholder="Search by category title or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search categories"
            data-testid="admin-category-search-input"
          />
        </div>

        <select
          className="admin-filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Filter by Status"
          data-testid="category-status-filter"
        >
          <option value="">All Statuses</option>
          <option value="active">Active Only</option>
          <option value="inactive">Inactive Only</option>
        </select>

        {(search || statusFilter) && (
          <button
            type="button"
            className="admin-clear-filters-btn"
            onClick={handleClearFilters}
            data-testid="clear-category-filters-btn"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="admin-error-card" role="alert">
          <p className="admin-error-text">{error}</p>
          <button type="button" className="btn-retry" onClick={fetchCategories}>
            Retry
          </button>
        </div>
      )}

      {/* Categories Table Card */}
      <div className="admin-table-card">
        {isLoading ? (
          <div className="admin-loading-state" data-testid="category-loading-state">
            <div className="admin-spinner" />
            <p>Loading categories...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="admin-empty-state" data-testid="category-empty-state">
            <span className="empty-icon" aria-hidden="true">📁</span>
            <h3>No Categories Found</h3>
            <p>
              {search || statusFilter
                ? 'No categories match your search or filter criteria.'
                : 'No motorcycle categories exist yet.'}
            </p>
            {search || statusFilter ? (
              <button
                type="button"
                className="admin-clear-filters-btn"
                onClick={handleClearFilters}
              >
                Clear Filters
              </button>
            ) : (
              <button
                type="button"
                className="btn-primary"
                onClick={handleOpenAddModal}
              >
                Create Your First Category
              </button>
            )}
          </div>
        ) : (
          <table className="admin-products-table">
            <thead>
              <tr>
                <th scope="col">Category / Slug</th>
                <th scope="col">Badge</th>
                <th scope="col">Description</th>
                <th scope="col">Bikes Count</th>
                <th scope="col">Status</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => {
                const isActive = Boolean(cat.isActive);
                const count = cat.productCount || 0;

                return (
                  <tr key={cat.internalId || cat.id} data-testid={`category-row-${cat.slug}`}>
                    <td>
                      <div className="category-name-cell">
                        <span className="category-title-text">{cat.title}</span>
                        <span className="category-slug-text">/{cat.slug}</span>
                      </div>
                    </td>
                    <td>
                      {cat.badgeText ? (
                        <span className="category-badge-tag">{cat.badgeText}</span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td>
                      <div className="category-desc-preview" title={cat.description || ''}>
                        {cat.description || '—'}
                      </div>
                    </td>
                    <td>
                      <span className="category-count-pill">
                        🏍️ {count} {count === 1 ? 'model' : 'models'}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`status-indicator ${isActive ? 'status-active' : 'status-inactive'}`}
                      >
                        <span className="status-dot" />
                        {isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons-cell">
                        <button
                          type="button"
                          className="btn-action-edit"
                          onClick={() => handleOpenEditModal(cat)}
                          data-testid={`edit-cat-${cat.slug}`}
                          aria-label={`Edit ${cat.title}`}
                        >
                          Edit
                        </button>
                        {isActive ? (
                          <button
                            type="button"
                            className="btn-action-deactivate"
                            onClick={() => handleOpenStatusModal(cat, false)}
                            data-testid={`deactivate-cat-${cat.slug}`}
                            aria-label={`Deactivate ${cat.title}`}
                          >
                            Deactivate
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="btn-action-reactivate"
                            onClick={() => handleOpenStatusModal(cat, true)}
                            data-testid={`reactivate-cat-${cat.slug}`}
                            aria-label={`Reactivate ${cat.title}`}
                          >
                            Reactivate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Add / Edit Category Modal */}
      {isFormModalOpen && (
        <CategoryFormModal
          category={editingCategory}
          onSave={handleSaveCategory}
          onClose={handleCloseFormModal}
          isSubmitting={isSaving}
        />
      )}

      {/* Deactivate / Reactivate Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.targetState ? 'Reactivate Category' : 'Deactivate Category'}
        message={
          confirmDialog.targetState
            ? `Are you sure you want to reactivate category "${confirmDialog.category?.title}"? It will become visible on the customer storefront.`
            : `Are you sure you want to deactivate category "${confirmDialog.category?.title}"? It will be hidden from the customer storefront immediately.`
        }
        note={
          !confirmDialog.targetState && confirmDialog.category?.productCount > 0
            ? `Notice: This category currently contains ${confirmDialog.category.productCount} motorcycle models. Deactivating it will hide this category segment from navigation.`
            : !confirmDialog.targetState
            ? 'Note: You can reactivate this category at any time.'
            : null
        }
        confirmLabel={confirmDialog.targetState ? 'Reactivate Category' : 'Deactivate Category'}
        cancelLabel="Cancel"
        isDanger={!confirmDialog.targetState}
        isLoading={confirmDialog.isProcessing}
        onConfirm={handleConfirmStatusChange}
        onCancel={handleCloseStatusModal}
      />
    </div>
  );
}

export default AdminCategoriesPage;

