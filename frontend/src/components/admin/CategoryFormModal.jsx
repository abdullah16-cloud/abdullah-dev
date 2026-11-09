import React, { useState, useEffect } from 'react';
import FormField from '../common/FormField';
import './CategoryFormModal.css';

function getInitialForm(category) {
  if (category) {
    return {
      title: category.title || '',
      slug: category.slug || '',
      badgeText: category.badgeText || category.badge_text || '',
      description: category.description || '',
    };
  }
  return {
    title: '',
    slug: '',
    badgeText: '',
    description: '',
  };
}

/**
 * CategoryFormModal: Accessible modal dialog for creating and editing motorcycle categories.
 */
function CategoryFormModal({ category = null, onSave, onClose, isSubmitting = false }) {
  const isEdit = Boolean(category && (category.internalId || category.id));

  const [form, setForm] = useState(() => getInitialForm(category));
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(Boolean(isEdit));
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);

  // Handle ESC key to dismiss dialog
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSubmitting, onClose]);

  const handleTitleChange = (e) => {
    const titleVal = e.target.value;
    const updates = { title: titleVal };

    // Auto-generate slug from title in create mode unless manually changed
    if (!slugManuallyEdited && !isEdit) {
      updates.slug = titleVal
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
    }

    setForm((prev) => ({ ...prev, ...updates }));
    if (errors.title) setErrors((prev) => ({ ...prev, title: null }));
  };

  const handleSlugChange = (e) => {
    setSlugManuallyEdited(true);
    setForm((prev) => ({ ...prev, slug: e.target.value }));
    if (errors.slug) setErrors((prev) => ({ ...prev, slug: null }));
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const validate = () => {
    const newErrors = {};

    if (!form.title.trim()) {
      newErrors.title = 'Category title is required.';
    } else if (form.title.trim().length < 2) {
      newErrors.title = 'Title must be at least 2 characters.';
    }

    if (!form.slug.trim()) {
      newErrors.slug = 'Category slug is required.';
    } else if (!/^[a-z0-9-]+$/.test(form.slug.trim())) {
      newErrors.slug = 'Slug must only contain lowercase letters, numbers, and hyphens.';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    const valErrors = validate();
    if (Object.keys(valErrors).length > 0) {
      setErrors(valErrors);
      return;
    }

    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim(),
      badgeText: form.badgeText.trim() || null,
      description: form.description.trim() || null,
    };

    try {
      await onSave(payload);
    } catch (err) {
      setSubmitError(err?.message || 'Failed to save category.');
    }
  };

  return (
    <div className="category-modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="category-modal-dialog"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="category-modal-title"
      >
        <header className="category-modal-header">
          <h2 id="category-modal-title" className="category-modal-title">
            {isEdit ? `Edit Category: ${category.title}` : 'Add New Category'}
          </h2>
          <button
            type="button"
            className="category-modal-close-btn"
            onClick={onClose}
            aria-label="Close dialog"
            disabled={isSubmitting}
          >
            ×
          </button>
        </header>

        <form onSubmit={handleSubmit} noValidate>
          <div className="category-modal-form">
            {submitError && (
              <div className="category-error-alert" role="alert">
                {submitError}
              </div>
            )}

            <FormField
              id="cat-title"
              label="Category Title"
              required
              error={errors.title}
            >
              <input
                id="cat-title"
                type="text"
                className="form-input"
                value={form.title}
                onChange={handleTitleChange}
                placeholder="e.g. Electric & Hybrid"
                autoFocus
              />
            </FormField>

            <FormField
              id="cat-slug"
              label="URL Slug"
              required
              error={errors.slug}
            >
              <input
                id="cat-slug"
                type="text"
                className="form-input"
                value={form.slug}
                onChange={handleSlugChange}
                placeholder="e.g. electric-hybrid"
              />
            </FormField>

            <FormField
              id="cat-badge"
              label="Badge Text (Optional)"
              error={errors.badgeText}
            >
              <input
                id="cat-badge"
                type="text"
                className="form-input"
                value={form.badgeText}
                onChange={(e) => handleChange('badgeText', e.target.value)}
                placeholder="e.g. Eco Future or High Efficiency"
              />
            </FormField>

            <div className="form-field-group">
              <label htmlFor="cat-description" className="form-label">
                Description (Optional)
              </label>
              <textarea
                id="cat-description"
                className="category-form-textarea"
                rows="3"
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Brief summary of motorcycles in this category..."
              />
            </div>
          </div>

          <footer className="category-modal-actions">
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
              {isSubmitting
                ? 'Saving...'
                : isEdit
                ? 'Save Changes'
                : 'Create Category'}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}

export default CategoryFormModal;
