import React from 'react';
import { Link } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle';

function ForgotPasswordPage() {
  usePageTitle('Forgot Password');

  return (
    <div className="container placeholder-page">
      <h1>Password Reset</h1>
      <p>
        Password reset is not available yet. Account and authentication services will be connected
        in a later phase.
      </p>
      <div style={{ marginTop: 'var(--space-6)' }}>
        <Link to="/login" className="btn btn-primary">
          Back to Login
        </Link>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
