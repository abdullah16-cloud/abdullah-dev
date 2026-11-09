import React from 'react';
import { usePageTitle } from '../hooks/usePageTitle';

function PrivacyPage() {
  usePageTitle('Privacy Policy');

  return (
    <div className="container placeholder-page">
      <h1>Privacy Policy</h1>
      <p>Draft placeholder &mdash; to be replaced with real legal text before launch.</p>
      <p
        style={{
          marginTop: 'var(--space-4)',
          fontSize: 'var(--font-size-sm)',
          color: 'var(--color-gray-600)',
        }}
      >
        Your privacy is important to us. No personal data, passwords, or payment information are
        currently transmitted or saved.
      </p>
    </div>
  );
}

export default PrivacyPage;
