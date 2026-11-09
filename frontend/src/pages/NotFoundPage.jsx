import React from 'react';
import { Link } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle';

function NotFoundPage() {
  usePageTitle('Page Not Found');

  return (
    <section className="container placeholder-page" aria-labelledby="not-found-heading">
      <h1 id="not-found-heading">404 &mdash; Page Not Found</h1>
      <p style={{ marginBottom: 'var(--space-6)' }}>
        We couldn&apos;t find the page you are looking for. It may have been moved, removed, or
        never existed.
      </p>
      <Link to="/" className="btn btn-primary">
        Back to Home
      </Link>
    </section>
  );
}

export default NotFoundPage;
