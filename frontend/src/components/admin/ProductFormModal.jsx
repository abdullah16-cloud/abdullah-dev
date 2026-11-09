import React, { useState, useEffect } from 'react';
import FormField from '../common/FormField';
import './ProductFormModal.css';

function getInitialForm(product, categories) {
  if (product) {
    const matchedCat = categories.find(
      (c) =>
        String(c.internalId || c.id) === String(product.categoryId) ||
        c.slug === product.category ||
        c.title === product.categoryTitle
    );

    return {
      name: product.name || '',
      slug: product.slug || product.id || '',
      categoryId: matchedCat
        ? String(matchedCat.internalId || matchedCat.id || matchedCat.slug)
        : (categories[0] ? String(categories[0].internalId || categories[0].id || categories[0].slug) : '1'),
      engineCc:
        product.engineCc !== null && product.engineCc !== undefined
          ? String(product.engineCc)
          : '',
      pricePkr:
        product.pricePkr !== null && product.pricePkr !== undefined
          ? String(product.pricePkr)
          : '',
      availability: product.availability || 'unknown',
      featured: Boolean(product.featured),
      trackInventory: Boolean(product.trackInventory),
      stockQuantity:
        product.stockQuantity !== null && product.stockQuantity !== undefined
          ? String(product.stockQuantity)
          : '0',
      colors: Array.isArray(product.colors) ? product.colors.join(', ') : '',
      specsSummary:
        product.specs && typeof product.specs === 'object'
          ? (product.specs.highlights || JSON.stringify(product.specs))
          : '',
      imageUrl:
        Array.isArray(product.images) && product.images.length > 0
          ? product.images[0]
          : (product.imageUrl || ''),
    };
  }

  const defaultCatId = categories[0]
    ? String(categories[0].internalId || categories[0].id || categories[0].slug)
    : '1';

  return {
    name: '',
    slug: '',
    categoryId: defaultCatId,
    engineCc: '',
    pricePkr: '',
    availability: 'unknown',
    featured: false,
    trackInventory: false,
    stockQuantity: '0',
    colors: '',
    specsSummary: '',
    imageUrl: '',
  };
}

/**
 * ProductFormModal: Accessible modal dialog for creating and editing motorcycle models.
 */
function ProductFormModal({ product = null, categories = [], onSave, onClose, isSubmitting = false }) {
  const isEdit = Boolean(product && (product.internalId || product.id));

  const [form, setForm] = useState(() => getInitialForm(product, categories));
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, isSubmitting]);

  const handleChange = (field, val) => {
    setForm((prev) => {
      const next = { ...prev, [field]: val };
      // Auto-generate slug from name if adding
      if (!isEdit && field === 'name' && !prev.slugManuallyEdited) {
        next.slug = val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
      }
      return next;
    });

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim() || form.name.trim().length < 2) {
      errs.name = 'Product name must be at least 2 characters.';
    }
    if (!form.slug.trim() || !/^[a-z0-9-]+$/.test(form.slug.trim())) {
      errs.slug = 'Slug must be lowercase alphanumeric with hyphens (e.g. honda-cd-70).';
    }
    if (!form.categoryId) {
      errs.categoryId = 'Please select a category.';
    }
    if (form.engineCc !== '' && (isNaN(Number(form.engineCc)) || Number(form.engineCc) <= 0)) {
      errs.engineCc = 'Engine capacity must be a positive integer.';
    }
    if (form.pricePkr !== '' && (isNaN(Number(form.pricePkr)) || Number(form.pricePkr) < 0)) {
      errs.pricePkr = 'Price must be a valid positive number.';
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    const valErrors = validate();
    if (Object.keys(valErrors).length > 0) {
      setErrors(valErrors);
      return;
    }

    // Resolve categoryId to valid positive integer or slug
    let resolvedCategoryId = Number(form.categoryId);
    if (isNaN(resolvedCategoryId) || resolvedCategoryId <= 0) {
      const found = categories.find(
        (c) =>
          String(c.slug) === String(form.categoryId) ||
          String(c.id) === String(form.categoryId) ||
          String(c.title).toLowerCase() === String(form.categoryId).toLowerCase()
      );
      if (found) {
        resolvedCategoryId = Number(found.internalId || found.id);
      }
    }
    if (isNaN(resolvedCategoryId) || resolvedCategoryId <= 0) {
      resolvedCategoryId = form.categoryId || 1;
    }

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      categoryId: resolvedCategoryId,
      engineCc: form.engineCc !== '' ? Number(form.engineCc) : null,
      pricePkr: form.pricePkr !== '' ? Number(form.pricePkr) : null,
      availability: form.availability,
      featured: Boolean(form.featured),
      trackInventory: Boolean(form.trackInventory),
      stockQuantity: Number(form.stockQuantity) || 0,
      colors: form.colors
        ? form.colors.split(',').map((c) => c.trim()).filter(Boolean)
        : [],
      specs: form.specsSummary ? { highlights: form.specsSummary.trim() } : {},
      images: form.imageUrl.trim() ? [form.imageUrl.trim()] : [],
    };

    try {
      await onSave(payload);
    } catch (err) {
      if (err?.details && Array.isArray(err.details)) {
        const fieldErrors = {};
        err.details.forEach((d) => {
          const fieldKey = d.path ? d.path[d.path.length - 1] : d.field?.replace(/^body\./, '');
          if (fieldKey) {
            fieldErrors[fieldKey] = d.message;
          }
        });
        setErrors((prev) => ({ ...prev, ...fieldErrors }));
      }
      setSubmitError(err?.message || 'Failed to save product. Please check your data.');
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal-dialog"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-modal-title"
      >
        <header className="modal-header">
          <h2 id="product-modal-title" className="modal-title">
            {isEdit ? `Edit Motorcycle: ${product.name}` : 'Add New Motorcycle Model'}
          </h2>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close dialog"
            disabled={isSubmitting}
          >
            &times;
          </button>
        </header>

        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body">
            {submitError && (
              <div className="modal-error-alert" role="alert">
                {submitError}
              </div>
            )}

            <div className="form-grid-2">
              <FormField id="prod-name" label="Motorcycle Model Name" required error={errors.name}>
                <input
                  id="prod-name"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Honda CD 70"
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  autoFocus
                />
              </FormField>

              <FormField id="prod-slug" label="URL Slug" required error={errors.slug}>
                <input
                  id="prod-slug"
                  type="text"
                  className="form-input"
                  placeholder="e.g. honda-cd-70"
                  value={form.slug}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, slugManuallyEdited: true }));
                    handleChange('slug', e.target.value);
                  }}
                />
              </FormField>
            </div>

            <div className="form-grid-2">
              <FormField id="prod-category" label="Riding Category" required error={errors.categoryId}>
                <select
                  id="prod-category"
                  className="form-input"
                  value={form.categoryId}
                  onChange={(e) => handleChange('categoryId', e.target.value)}
                >
                  {categories.map((c) => {
                    const catVal = String(c.internalId || c.id || c.slug);
                    return (
                      <option key={catVal || c.slug} value={catVal}>
                        {c.title} ({c.slug})
                      </option>
                    );
                  })}
                </select>
              </FormField>

              <FormField id="prod-availability" label="Market Availability">
                <select
                  id="prod-availability"
                  className="form-input"
                  value={form.availability}
                  onChange={(e) => handleChange('availability', e.target.value)}
                >
                  <option value="in_stock">In Stock</option>
                  <option value="coming_soon">Coming Soon</option>
                  <option value="out_of_stock">Out of Stock</option>
                  <option value="unknown">Unknown / Showroom Order</option>
                </select>
              </FormField>
            </div>

            <div className="form-grid-2">
              <FormField id="prod-engine" label="Engine Capacity (cc)" error={errors.engineCc}>
                <input
                  id="prod-engine"
                  type="number"
                  className="form-input"
                  placeholder="e.g. 70, 125, 150"
                  value={form.engineCc}
                  onChange={(e) => handleChange('engineCc', e.target.value)}
                />
              </FormField>

              <FormField id="prod-price" label="Estimated Price (PKR)" error={errors.pricePkr}>
                <input
                  id="prod-price"
                  type="number"
                  step="0.01"
                  className="form-input"
                  placeholder="e.g. 157900"
                  value={form.pricePkr}
                  onChange={(e) => handleChange('pricePkr', e.target.value)}
                />
              </FormField>
            </div>

            <FormField id="prod-colors" label="Available Color Options (Comma separated)">
              <input
                id="prod-colors"
                type="text"
                className="form-input"
                placeholder="e.g. Red, Black, Blue"
                value={form.colors}
                onChange={(e) => handleChange('colors', e.target.value)}
              />
            </FormField>

            <div className="product-image-container">
              <FormField id="prod-image" label="Bike Picture / Photo URL">
                <input
                  id="prod-image"
                  type="text"
                  className="form-input"
                  placeholder="e.g. /images/bikes/honda-cd-70.jpg or upload below"
                  value={form.imageUrl}
                  onChange={(e) => handleChange('imageUrl', e.target.value)}
                />
              </FormField>

              <div className="image-action-row">
                <label className="btn-upload-file" title="Upload image from your computer">
                  <span>📷 Upload from Computer</span>
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          handleChange('imageUrl', reader.result);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>

                <select
                  className="form-input preset-select"
                  value=""
                  onChange={(e) => {
                    if (e.target.value) {
                      handleChange('imageUrl', e.target.value);
                    }
                  }}
                  aria-label="Select from Showroom Studio Photos"
                >
                  <option value="">-- Or Choose Showroom Photo --</option>
                  <option value="/images/bikes/honda-cd-70.jpg">Honda CD 70</option>
                  <option value="/images/bikes/honda-cd-70-dream.jpg">Honda CD 70 Dream</option>
                  <option value="/images/bikes/honda-pridor.jpg">Honda Pridor</option>
                  <option value="/images/bikes/honda-cg-125.jpg">Honda CG 125</option>
                  <option value="/images/bikes/honda-cg-125s.jpg">Honda CG 125S</option>
                  <option value="/images/bikes/honda-cg-125s-gold.jpg">Honda CG 125S Gold Edition</option>
                  <option value="/images/bikes/honda-cb-125f.jpg">Honda CB 125F</option>
                  <option value="/images/bikes/honda-cb-150f.jpg">Honda CB 150F</option>
                  <option value="/images/bikes/honda-cg-150.jpg">Honda CG 150</option>
                </select>

                {form.imageUrl ? (
                  <button
                    type="button"
                    className="btn-clear-image"
                    onClick={() => handleChange('imageUrl', '')}
                    title="Remove selected image"
                  >
                    Clear Photo
                  </button>
                ) : null}
              </div>

              {form.imageUrl ? (
                <div className="product-image-preview-box">
                  <span className="preview-heading">Live Preview:</span>
                  <div className="preview-img-wrapper">
                    <img
                      src={form.imageUrl}
                      alt="Product preview"
                      className="preview-img"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        if (e.currentTarget.nextElementSibling) {
                          e.currentTarget.nextElementSibling.style.display = 'block';
                        }
                      }}
                    />
                    <div className="preview-fallback-notice" style={{ display: 'none' }}>
                      ⚠️ Image failed to load from provided source.
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            <FormField id="prod-specs" label="Specifications & Key Features">
              <textarea
                id="prod-specs"
                className="form-input"
                rows={3}
                placeholder="4-stroke OHC air-cooled engine, 4-speed transmission, 9.0L fuel tank..."
                value={form.specsSummary}
                onChange={(e) => handleChange('specsSummary', e.target.value)}
              />
            </FormField>

            <div style={{ display: 'flex', gap: 'var(--space-6)', marginTop: 'var(--space-2)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer', color: '#ffffff' }}>
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => handleChange('featured', e.target.checked)}
                />
                <span>Feature on Homepage</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer', color: '#ffffff' }}>
                <input
                  type="checkbox"
                  checked={form.trackInventory}
                  onChange={(e) => handleChange('trackInventory', e.target.checked)}
                />
                <span>Track Stock Inventory</span>
              </label>
            </div>
          </div>

          <footer className="modal-footer">
            <button
              type="button"
              className="btn btn-dark"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Save Changes' : 'Create Product')}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}

export default ProductFormModal;
