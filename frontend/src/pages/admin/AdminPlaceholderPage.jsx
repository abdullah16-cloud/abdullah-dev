import React from 'react';
import { Link } from 'react-router-dom';

/**
 * AdminPlaceholderPage: Honest indicator for admin sub-modules scheduled for Phase 11.2+.
 */
function AdminPlaceholderPage({ title, description }) {
  return (
    <div
      style={{
        padding: 'var(--space-8)',
        backgroundColor: '#141419',
        border: '1px solid #1f1f27',
        borderRadius: 'var(--radius-lg, 8px)',
        textAlign: 'center',
        marginTop: 'var(--space-4)',
      }}
    >
      <h2 style={{ color: '#ffffff', marginBottom: 'var(--space-2)' }}>{title}</h2>
      <p style={{ color: '#8f8f9d', maxWidth: '600px', margin: '0 auto var(--space-6)' }}>
        {description ||
          'This module interface is scheduled for Phase 11.2. The backend REST endpoints are active and ready.'}
      </p>
      <Link to="/admin" className="btn btn-primary">
        Back to Dashboard
      </Link>
    </div>
  );
}

export default AdminPlaceholderPage;
