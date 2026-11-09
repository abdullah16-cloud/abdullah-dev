import React, { useEffect } from 'react';
import './ConfirmationModal.css';

/**
 * ConfirmationModal: Confirmation dialog for critical operations like product deactivation.
 */
function ConfirmationModal({
  isOpen,
  title,
  message,
  note,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDanger = false,
  isLoading = false,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isLoading) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="confirmation-modal-backdrop" onClick={onCancel} role="presentation">
      <div
        className="confirmation-modal-dialog"
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
      >
        <div className="confirmation-modal-header">
          <span
            className={`confirmation-modal-icon ${isDanger ? 'warning' : 'success'}`}
            aria-hidden="true"
          >
            {isDanger ? '⚠️' : '✅'}
          </span>
          <h2 id="confirm-modal-title" className="confirmation-modal-title">
            {title}
          </h2>
        </div>

        <div className="confirmation-modal-body">
          <p>{message}</p>
          {note && <p className="confirmation-modal-note">{note}</p>}
        </div>

        <div className="confirmation-modal-actions">
          <button
            type="button"
            className="confirmation-btn confirmation-btn-cancel"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`confirmation-btn ${isDanger ? 'confirmation-btn-danger' : 'confirmation-btn-success'}`}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationModal;

