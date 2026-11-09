import React, { useState, useEffect, useCallback } from 'react';
import { adminService } from '../../services/adminService';
import './AdminInventoryPage.css';

/**
 * AdminInventoryPage: Stock management and inventory adjustment tool.
 * Allows instant stock level adjustments and inventory tracking toggling for each bike.
 */
function AdminInventoryPage() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState('all');

  // Modified stock quantities: { [productId]: { quantityOnHand, trackInventory, changed } }
  const [editMap, setEditMap] = useState({});
  const [savingIds, setSavingIds] = useState({});

  const fetchInventory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await adminService.listProducts({ limit: 100 });
      const list = Array.isArray(res) ? res : res?.data || [];
      setProducts(list);

      const initialMap = {};
      list.forEach((p) => {
        const id = p.internalId || p.id;
        initialMap[id] = {
          quantityOnHand: Number(p.stockQuantity ?? 0),
          trackInventory: Boolean(p.trackInventory),
          changed: false,
        };
      });
      setEditMap(initialMap);
    } catch (err) {
      console.error('Failed to load inventory:', err);
      setError(err?.message || 'Failed to load inventory records.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const handleQtyChange = (id, newQty) => {
    const val = Math.max(0, parseInt(newQty, 10) || 0);
    setEditMap((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        quantityOnHand: val,
        changed: true,
      },
    }));
  };

  const handleTrackChange = (id, checked) => {
    setEditMap((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        trackInventory: checked,
        changed: true,
      },
    }));
  };

  const handleSaveStock = async (product) => {
    const id = product.internalId || product.id;
    const current = editMap[id];
    if (!current) return;

    setSavingIds((prev) => ({ ...prev, [id]: true }));
    setSuccessMsg(null);
    setError(null);

    try {
      await adminService.updateInventory(id, {
        quantityOnHand: current.quantityOnHand,
        trackInventory: current.trackInventory,
      });

      setSuccessMsg(`Inventory for "${product.name}" updated to ${current.quantityOnHand} units.`);
      setEditMap((prev) => ({
        ...prev,
        [id]: { ...prev[id], changed: false },
      }));

      // Update in local product state
      setProducts((prev) =>
        prev.map((p) =>
          (p.internalId || p.id) === id
            ? { ...p, stockQuantity: current.quantityOnHand, trackInventory: current.trackInventory }
            : p
        )
      );

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('products-updated'));
      }
    } catch (err) {
      console.error('Failed to update stock:', err);
      setError(err?.message || `Failed to update inventory for "${product.name}".`);
    } finally {
      setSavingIds((prev) => ({ ...prev, [id]: false }));
    }
  };

  // Filtered bikes
  const filteredBikes = products.filter((p) => {
    const id = p.internalId || p.id;
    const current = editMap[id] || { quantityOnHand: p.stockQuantity ?? 0, trackInventory: p.trackInventory };

    const matchesSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.slug && p.slug.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;

    if (stockFilter === 'in_stock') return current.quantityOnHand > 3;
    if (stockFilter === 'low_stock') return current.quantityOnHand > 0 && current.quantityOnHand <= 3;
    if (stockFilter === 'out_of_stock') return current.quantityOnHand === 0;
    if (stockFilter === 'tracked') return current.trackInventory;
    if (stockFilter === 'not_tracked') return !current.trackInventory;

    return true;
  });

  // Metric counts
  const totalTracked = products.filter((p) => p.trackInventory).length;
  const inStockCount = products.filter((p) => (p.stockQuantity ?? 0) > 3).length;
  const lowStockCount = products.filter((p) => (p.stockQuantity ?? 0) > 0 && (p.stockQuantity ?? 0) <= 3).length;
  const outOfStockCount = products.filter((p) => (p.stockQuantity ?? 0) === 0).length;

  return (
    <div className="admin-inventory-page">
      <header className="inventory-header">
        <div>
          <h1 className="inventory-title">Stock & Inventory Management</h1>
          <p className="inventory-desc">
            Monitor real-time warehouse inventory, track stock shortages, and adjust units on hand.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-dark"
          onClick={fetchInventory}
          disabled={isLoading}
        >
          {isLoading ? 'Refreshing...' : '↻ Refresh Stock'}
        </button>
      </header>

      {/* Metric Cards */}
      <div className="inventory-stats-strip">
        <div className="inventory-stat-card">
          <span className="inventory-stat-label">Total Models</span>
          <span className="inventory-stat-val">{products.length}</span>
        </div>
        <div className="inventory-stat-card">
          <span className="inventory-stat-label">In Stock (&gt;3)</span>
          <span className="inventory-stat-val val-green">{inStockCount}</span>
        </div>
        <div className="inventory-stat-card">
          <span className="inventory-stat-label">Low Stock (1-3)</span>
          <span className="inventory-stat-val val-amber">{lowStockCount}</span>
        </div>
        <div className="inventory-stat-card">
          <span className="inventory-stat-label">Out of Stock (0)</span>
          <span className="inventory-stat-val val-red">{outOfStockCount}</span>
        </div>
        <div className="inventory-stat-card">
          <span className="inventory-stat-label">Tracking Active</span>
          <span className="inventory-stat-val">{totalTracked}</span>
        </div>
      </div>

      {successMsg && (
        <div className="admin-success-banner" role="status">
          <span>{successMsg}</span>
          <button
            type="button"
            className="admin-banner-dismiss"
            onClick={() => setSuccessMsg(null)}
          >
            ×
          </button>
        </div>
      )}

      {error && (
        <div className="admin-error-card" role="alert">
          <p>{error}</p>
        </div>
      )}

      {/* Controls Bar */}
      <div className="inventory-controls-bar">
        <input
          type="search"
          className="inventory-search-input"
          placeholder="Search motorcycle by name or slug..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="inventory-filter-select"
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value)}
        >
          <option value="all">All Models</option>
          <option value="in_stock">In Stock (&gt;3 units)</option>
          <option value="low_stock">Low Stock (1–3 units)</option>
          <option value="out_of_stock">Out of Stock (0 units)</option>
          <option value="tracked">Inventory Tracked</option>
          <option value="not_tracked">Untracked</option>
        </select>
      </div>

      {/* Inventory Table */}
      <div className="inventory-table-card">
        {isLoading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#8f8f9d' }}>
            Loading warehouse stock data...
          </div>
        ) : filteredBikes.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#8f8f9d' }}>
            No motorcycle models found matching current criteria.
          </div>
        ) : (
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Bike</th>
                <th>Model / Slug</th>
                <th>Price (PKR)</th>
                <th>Track Stock</th>
                <th>Stock Quantity</th>
                <th>Stock Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBikes.map((bike) => {
                const id = bike.internalId || bike.id;
                const current = editMap[id] || {
                  quantityOnHand: bike.stockQuantity ?? 0,
                  trackInventory: Boolean(bike.trackInventory),
                  changed: false,
                };
                const isSaving = Boolean(savingIds[id]);
                const qty = current.quantityOnHand;

                const primaryImg =
                  Array.isArray(bike.images) && bike.images.length > 0 && typeof bike.images[0] === 'string'
                    ? bike.images[0]
                    : `/images/bikes/${bike.slug || bike.id}.jpg`;

                return (
                  <tr key={id}>
                    <td style={{ width: '60px' }}>
                      <div className="product-thumb-container">
                        <img
                          src={primaryImg}
                          alt={bike.name}
                          className="product-thumbnail"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#ffffff' }}>{bike.name}</div>
                      <span style={{ fontSize: '0.8rem', color: '#8f8f9d' }}>/{bike.slug}</span>
                    </td>
                    <td>
                      {bike.pricePkr
                        ? `PKR ${Number(bike.pricePkr).toLocaleString()}`
                        : '—'}
                    </td>
                    <td>
                      <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={current.trackInventory}
                          onChange={(e) => handleTrackChange(id, e.target.checked)}
                        />
                        <span style={{ fontSize: '0.85rem' }}>
                          {current.trackInventory ? 'Enabled' : 'Disabled'}
                        </span>
                      </label>
                    </td>
                    <td>
                      <div className="qty-control-wrap">
                        <button
                          type="button"
                          className="qty-btn"
                          onClick={() => handleQtyChange(id, qty - 1)}
                          disabled={qty <= 0}
                          title="Decrease 1"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          min="0"
                          className="qty-input"
                          value={qty}
                          onChange={(e) => handleQtyChange(id, e.target.value)}
                        />
                        <button
                          type="button"
                          className="qty-btn"
                          onClick={() => handleQtyChange(id, qty + 1)}
                          title="Increase 1"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td>
                      {!current.trackInventory ? (
                        <span className="stock-badge badge-not-tracked">Not Tracked</span>
                      ) : qty === 0 ? (
                        <span className="stock-badge badge-out-stock">Out of Stock</span>
                      ) : qty <= 3 ? (
                        <span className="stock-badge badge-low-stock">Low Stock ({qty})</span>
                      ) : (
                        <span className="stock-badge badge-in-stock">In Stock ({qty})</span>
                      )}
                    </td>
                    <td>
                      <button
                        type="button"
                        className={`btn-save-stock ${current.changed ? 'btn-changed' : 'btn-idle'}`}
                        onClick={() => handleSaveStock(bike)}
                        disabled={isSaving || !current.changed}
                      >
                        {isSaving ? 'Saving...' : current.changed ? 'Save Stock' : 'Saved'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default AdminInventoryPage;

