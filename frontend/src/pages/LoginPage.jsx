import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle';
import { useAuth } from '../context/AuthContext';
import { validateLogin } from '../utils/accountValidation';
import FormField from '../components/common/FormField';
import './LoginPage.css';

function LoginPage() {
  usePageTitle('Login');
  const { login, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [serviceMessage, setServiceMessage] = useState(null);

  const errorSummaryRef = useRef(null);
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);

  // If already logged in, redirect immediately
  useEffect(() => {
    if (isAuthenticated && user) {
      const redirectPath =
        location.state?.from || (user.role === 'admin' ? '/admin' : '/account');
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, user, navigate, location.state]);

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const validationErrors = validateLogin({ email, password });
    if (validationErrors[field]) {
      setErrors((prev) => ({ ...prev, [field]: validationErrors[field] }));
    } else {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServiceMessage(null);

    const validationErrors = validateLogin({ email, password });
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setTouched({ email: true, password: true });
      if (errorSummaryRef.current) {
        errorSummaryRef.current.focus();
      }
      return;
    }

    setErrors({});
    try {
      const res = await login({ email: email.trim(), password });
      const targetUser = res?.user || user;
      const redirectPath =
        location.state?.from || (targetUser?.role === 'admin' ? '/admin' : '/account');
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setServiceMessage(
        err?.message ||
        'Unable to log in. Please check your credentials or network connection.'
      );
    } finally {
      // SECURITY: Always clear password field from component state after submission
      setPassword('');
    }
  };

  const errorKeys = Object.keys(errors);

  return (
    <div className="auth-page-wrap">
      <div className="auth-card">
        <header className="auth-header">
          <h1 className="auth-title">Account & Admin Login</h1>
          <p className="auth-subtitle">Sign in to access your profile or the Admin Dashboard.</p>
        </header>

        {/* Admin Credentials Helper Box */}
        <div style={{
          backgroundColor: 'rgba(204, 0, 0, 0.1)',
          border: '1px solid rgba(204, 0, 0, 0.35)',
          borderRadius: '6px',
          padding: '10px 14px',
          marginBottom: '18px',
          fontSize: '0.85rem',
          color: '#d1d1db'
        }}>
          <strong style={{ color: '#ff6b6b' }}>🔑 Admin Credentials:</strong> <span style={{ color: '#ffffff' }}>admin@admin.com</span> / <span style={{ color: '#ffffff' }}>admin123</span>
        </div>

        {/* Error Summary */}
        {errorKeys.length > 0 && (
          <div
            ref={errorSummaryRef}
            tabIndex="-1"
            className="auth-error-summary"
            role="alert"
            aria-labelledby="error-summary-title"
          >
            <h2 id="error-summary-title" className="auth-error-summary-title">
              There was a problem with your submission:
            </h2>
            <ul>
              {errorKeys.map((key) => (
                <li key={key}>
                  <button
                    type="button"
                    className="auth-error-link"
                    onClick={() => {
                      if (key === 'email' && emailInputRef.current) {
                        emailInputRef.current.focus();
                      } else if (key === 'password' && passwordInputRef.current) {
                        passwordInputRef.current.focus();
                      }
                    }}
                  >
                    {errors[key]}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Honest Disconnected Status Alert */}
        {serviceMessage && (
          <div className="auth-honest-alert" role="alert">
            {serviceMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <FormField
            id="login-email"
            label="Email Address"
            required
            error={touched.email ? errors.email : undefined}
          >
            <input
              ref={emailInputRef}
              type="email"
              className="form-input"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => handleBlur('email')}
            />
          </FormField>

          <FormField
            id="login-password"
            label="Password"
            required
            error={touched.password ? errors.password : undefined}
          >
            <div className="password-input-wrap">
              <input
                ref={passwordInputRef}
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => handleBlur('password')}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </FormField>

          <div className="auth-extra-links">
            <Link to="/forgot-password">Forgot password?</Link>
          </div>

          <button type="submit" className="btn btn-primary auth-submit-btn">
            Log in
          </button>
        </form>

        <div className="auth-switch-prompt">
          Don&apos;t have an account? <Link to="/register">Create one</Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
