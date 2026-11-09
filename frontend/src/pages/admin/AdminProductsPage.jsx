import React, { useState, useEffect, useCallback } from 'react';
import { adminService } from '../../services/adminService';
import ProductFormModal from '../../components/admin/ProductFormModal';
import ConfirmationModal from '../../components/admin/ConfirmationModal';
import './AdminProductsPage.css';

/**
 * AdminProductsPage: Full motorcycle catalog management for store administrators.
 * Supports searching, category/status filtering, pagination, creation, editing,
 * and soft deactivation/reactivation.
 */
function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  
  // Filter States
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // UI States
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Status Change Confirmation Dialog States
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    product: null,
    targetState: false, // false = deactivate, true = reactivate
    isProcessing: false,
  });

  // Fetch categories once
  useEffect(() => {
    let isMounted = true;
    adminService
      .getCategories()
      .then((res) => {
        if (isMounted) {
          const list = Array.isArray(res)
            ? res
            : Array.isArray(res?.data)
              ? res.data
              : [];
          setCategories(list);
        }
      })
      .catch((err) => {
        console.error('Failed to load categories:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch products based on filters and pagination
  const fetchProducts = useCallback(async (page = 1) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await adminService.listProducts({
        search: search.trim() || undefined,
        category: categoryFilter || undefined,
        status: statusFilter || undefined,
        page,
        limit: 10,
      });

      const list = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
          ? res.data
          : [];
      setProducts(list);

      const pag = res?.pagination || res?.meta || res?.data?.pagination || res?.data?.meta;
      if (pag) {
        setPagination(pag);
      }
    } catch (err) {
      console.error('Error fetching admin products:', err);
      setError(err?.message || 'Failed to load motorcycle catalog.');
    } finally {
      setIsLoading(false);
    }
  }, [search, categoryFilter, statusFilter]);

  // Debounced search / filter trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts(1);
    }, 250);

    return () => clearTimeout(timer);
  }, [fetchProducts]);

  const handleClearFilters = () => {
    setSearch('');
    setCategoryFilter('');
    setStatusFilter('');
  };

  // Add Product Flow
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setIsFormModalOpen(true);
  };

  // Edit Product Flow
  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    if (!isSaving) {
      setIsFormModalOpen(false);
      setEditingProduct(null);
    }
  };

  const handleSaveProduct = async (formData) => {
    setIsSaving(true);
    setActionSuccess(null);
    try {
      if (editingProduct) {
        const prodId = editingProduct.internalId || editingProduct.id;
        await adminService.updateProduct(prodId, formData);
        setActionSuccess(`Motorcycle "${formData.name}" was updated successfully.`);
      } else {
        await adminService.createProduct(formData);
        setActionSuccess(`New motorcycle model "${formData.name}" was created successfully.`);
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('products-updated'));
      }
      setIsFormModalOpen(false);
      setEditingProduct(null);
      await fetchProducts(pagination.page);
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle Active State Dialog Flow
  const handleOpenStatusModal = (product, targetState) => {
    setConfirmDialog({
      isOpen: true,
      product,
      targetState,
      isProcessing: false,
    });
  };

  const handleCloseStatusModal = () => {
    if (!confirmDialog.isProcessing) {
      setConfirmDialog({
        isOpen: false,
        product: null,
        targetState: false,
        isProcessing: false,
      });
    }
  };

  const handleConfirmStatusChange = async () => {
    const { product, targetState } = confirmDialog;
    if (!product) return;

    setConfirmDialog((prev) => ({ ...prev, isProcessing: true }));
    setActionSuccess(null);

    const prodId = product.internalId || product.id;
    try {
      if (targetState) {
        await adminService.reactivateProduct(prodId);
        setActionSuccess(`Motorcycle "${product.name}" has been reactivated and is now visible in the catalog.`);
      } else {
        await adminService.deactivateProduct(prodId);
        setActionSuccess(`Motorcycle "${product.name}" has been deactivated and hidden from the customer catalog.`);
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('products-updated'));
      }
      setConfirmDialog({
        isOpen: false,
        product: null,
        targetState: false,
        isProcessing: false,
      });
      await fetchProducts(pagination.page);
    } catch (err) {
      console.error('Error changing product active status:', err);
      setError(err?.message || 'Failed to update product status.');
      setConfirmDialog((prev) => ({ ...prev, isProcessing: false }));
    }
  };

  return (
    <div className="admin-products-page" data-testid="admin-products-page">
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Motorcycle Catalog Management</h1>
          <p className="admin-page-desc">
            View, search, add, edit, and toggle active status for Honda motorcycle models.
          </p>
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={handleOpenAddModal}
          data-testid="add-product-btn"
        >
          + Add Motorcycle Model
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

      {/* Metric Summary Badges */}
      <div className="admin-stats-summary-strip">
        <div className="summary-pill">
          <span className="summary-pill-label">Total Models</span>
          <span className="summary-pill-val">{pagination.total || products.length}</span>
        </div>
        <div className="summary-pill">
          <span className="summary-pill-label">Active on Web</span>
          <span className="summary-pill-val active-val">
            {products.filter((p) => Boolean(p.isActive !== undefined ? p.isActive : p.is_active)).length}
          </span>
        </div>
        <div className="summary-pill">
          <span className="summary-pill-label">Hidden / Inactive</span>
          <span className="summary-pill-val inactive-val">
            {products.filter((p) => (p.isActive !== undefined ? !p.isActive : !p.is_active)).length}
          </span>
        </div>
        <div className="summary-pill">
          <span className="summary-pill-label">Categories</span>
          <span className="summary-pill-val">{categories.length}</span>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
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
            placeholder="Search by model name or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search motorcycles"
            data-testid="admin-search-input"
          />
        </div>

        <select
          className="admin-filter-select"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          aria-label="Filter by Category"
          data-testid="category-filter-select"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id || cat.slug} value={cat.slug}>
              {cat.title}
            </option>
          ))}
        </select>

        <select
          className="admin-filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Filter by Status"
          data-testid="status-filter-select"
        >
          <option value="">All Statuses</option>
          <option value="active">Active Only</option>
          <option value="inactive">Inactive Only</option>
        </select>

        {(search || categoryFilter || statusFilter) && (
          <button
            type="button"
            className="admin-clear-filters-btn"
            onClick={handleClearFilters}
            data-testid="clear-filters-btn"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="admin-error-card" role="alert">
          <p className="admin-error-text">{error}</p>
          <button
            type="button"
            className="btn-retry"
            onClick={() => fetchProducts(pagination.page)}
          >
            Retry
          </button>
        </div>
      )}

      {/* Products Table Card */}
      <div className="admin-table-card">
        {isLoading ? (
          <div className="admin-loading-state" data-testid="admin-loading-state">
            <div className="admin-spinner" />
            <p>Loading motorcycle catalog...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="admin-empty-state" data-testid="admin-empty-state">
            <span className="empty-icon" aria-hidden="true">🏍️</span>
            <h3>No Motorcycles Found</h3>
            <p>
              {search || categoryFilter || statusFilter
                ? 'No models match your current search or filter criteria.'
                : 'No motorcycle models exist yet.'}
            </p>
            {search || categoryFilter || statusFilter ? (
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
                Add Your First Model
              </button>
            )}
          </div>
        ) : (
          <>
            <table className="admin-products-table">
              <thead>
                <tr>
                  <th scope="col" className="col-preview">Bike</th>
                  <th scope="col">Model / Slug</th>
                  <th scope="col">Category</th>
                  <th scope="col">Engine</th>
                  <th scope="col">Price</th>
                  <th scope="col">Availability</th>
                  <th scope="col">Status</th>
                  <th scope="col" className="col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const isActive = Boolean(p.isActive !== undefined ? p.isActive : p.is_active);
                  const priceStr = p.pricePkr || p.price_pkr
                    ? `PKR ${Number(p.pricePkr || p.price_pkr).toLocaleString()}`
                    : 'Price on Request';
                  const engineStr = p.engineCc || p.engine_cc ? `${p.engineCc || p.engine_cc}cc` : '—';
                  const categoryName = p.categoryTitle || p.category_title || p.category || '—';
                  const primaryImg =
                    Array.isArray(p.images) && p.images.length > 0 && typeof p.images[0] === 'string'
                      ? p.images[0]
                      : `/images/bikes/${p.slug || p.id}.jpg`;

                  return (
                    <tr key={p.internalId || p.id} data-testid={`product-row-${p.slug || p.id}`}>
                      <td className="col-preview">
                        <div className="product-thumb-container">
                          <img
                            src={primaryImg}
                            alt={p.name}
                            className="product-thumbnail"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              if (e.currentTarget.nextElementSibling) {
                                e.currentTarget.nextElementSibling.style.display = 'flex';
                              }
                            }}
                          />
                          <div className="product-thumb-fallback" style={{ display: 'none' }}>
                            🏍️
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="product-name-cell">
                          <div className="product-name-header">
                            <span className="product-name-text">{p.name}</span>
                            {p.featured ? <span className="featured-badge">Featured</span> : null}
                          </div>
                          <span className="product-slug-text">/{p.slug || p.id}</span>
                        </div>
                      </td>
                      <td>
                        <span className="category-pill">{categoryName}</span>
                      </td>
                      <td>
                        <span className="engine-pill">{engineStr}</span>
                      </td>
                      <td>
                        <strong className="price-text">{priceStr}</strong>
                      </td>
                      <td>
                        <span className={`availability-tag tag-${p.availability || 'unknown'}`}>
                          {p.availability ? p.availability.replace('_', ' ') : 'unknown'}
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
                      <td className="col-actions">
                        <div className="action-buttons-cell">
                          <button
                            type="button"
                            className="btn-action-edit"
                            onClick={() => handleOpenEditModal(p)}
                            data-testid={`edit-btn-${p.slug || p.id}`}
                            aria-label={`Edit ${p.name}`}
                          >
                            Edit
                          </button>
                          {isActive ? (
                            <button
                              type="button"
                              className="btn-action-deactivate"
                              onClick={() => handleOpenStatusModal(p, false)}
                              data-testid={`deactivate-btn-${p.slug || p.id}`}
                              aria-label={`Deactivate ${p.name}`}
                            >
                              Deactivate
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="btn-action-reactivate"
                              onClick={() => handleOpenStatusModal(p, true)}
                              data-testid={`reactivate-btn-${p.slug || p.id}`}
                              aria-label={`Reactivate ${p.name}`}
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

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="admin-pagination-bar">
                <span>
                  Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} models)
                </span>
                <div className="admin-page-nav">
                  <button
                    type="button"
                    className="admin-page-btn"
                    disabled={pagination.page <= 1}
                    onClick={() => fetchProducts(pagination.page - 1)}
                    aria-label="Previous page"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    className="admin-page-btn"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => fetchProducts(pagination.page + 1)}
                    aria-label="Next page"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      {isFormModalOpen && (
        <ProductFormModal
          product={editingProduct}
          categories={categories}
          onSave={handleSaveProduct}
          onClose={handleCloseFormModal}
          isSubmitting={isSaving}
        />
      )}

      {/* Deactivate / Reactivate Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.targetState ? 'Reactivate Motorcycle' : 'Deactivate Motorcycle'}
        message={
          confirmDialog.targetState
            ? `Are you sure you want to reactivate "${confirmDialog.product?.name}"? It will become visible on the customer storefront.`
            : `Are you sure you want to deactivate "${confirmDialog.product?.name}"? It will be hidden from the customer storefront immediately.`
        }
        note={
          !confirmDialog.targetState
            ? 'Note: Historical orders and data will remain intact. You can reactivate this motorcycle at any time.'
            : null
        }
        confirmLabel={confirmDialog.targetState ? 'Reactivate Model' : 'Deactivate Model'}
        cancelLabel="Cancel"
        isDanger={!confirmDialog.targetState}
        isLoading={confirmDialog.isProcessing}
        onConfirm={handleConfirmStatusChange}
        onCancel={handleCloseStatusModal}
      />
    </div>
  );
}

export default AdminProductsPage;
