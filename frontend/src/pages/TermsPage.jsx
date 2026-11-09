import React from 'react';
import { usePageTitle } from '../hooks/usePageTitle';

function TermsPage() {
  usePageTitle('Terms of Service');

  return (
    <div className="container placeholder-page">
      <h1>Terms of Service</h1>
      <p>Draft placeholder &mdash; to be replaced with real legal text before launch.</p>
      <p
        style={{
          marginTop: 'var(--space-4)',
          fontSize: 'var(--font-size-sm)',
          color: 'var(--color-gray-600)',
        }}
      >
        This is an unofficial fan and community website for Honda motorcycles in Pakistan. No
        official warranties or terms are implied.
      </p>
    </div>
  );
}

export default TermsPage;
