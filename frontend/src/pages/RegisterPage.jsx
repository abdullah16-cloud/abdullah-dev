import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle';
import { useAuth } from '../context/AuthContext';
import { validateRegistration, getPasswordStrength } from '../utils/accountValidation';
import FormField from '../components/common/FormField';
import './LoginPage.css';

function RegisterPage() {
  usePageTitle('Register');
  const { register } = useAuth();

  const [formValues, setFormValues] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [serviceMessage, setServiceMessage] = useState(null);

  const errorSummaryRef = useRef(null);

  const handleChange = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const validationErrors = validateRegistration(formValues);
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

    const validationErrors = validateRegistration(formValues);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setTouched({
        fullName: true,
        email: true,
        phone: true,
        password: true,
        confirmPassword: true,
        agreeToTerms: true,
      });
      if (errorSummaryRef.current) {
        errorSummaryRef.current.focus();
      }
      return;
    }

    setErrors({});
    try {
      await register({
        fullName: formValues.fullName.trim(),
        email: formValues.email.trim(),
        phone: formValues.phone.trim(),
        password: formValues.password,
      });
    } catch (err) {
      setServiceMessage(
        err?.message ||
        'Unable to register. Please check your details or network connection.'
      );
    } finally {
      // SECURITY: Clear password fields from state immediately
      setFormValues((prev) => ({
        ...prev,
        password: '',
        confirmPassword: '',
      }));
    }
  };

  const errorKeys = Object.keys(errors);
  const strengthHint = getPasswordStrength(formValues.password);

  return (
    <div className="auth-page-wrap">
      <div className="auth-card">
        <header className="auth-header">
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">
            Sign up to manage your bike bookings and customer profile.
          </p>
        </header>

        {errorKeys.length > 0 && (
          <div
            ref={errorSummaryRef}
            tabIndex="-1"
            className="auth-error-summary"
            role="alert"
            aria-labelledby="reg-error-title"
          >
            <h2 id="reg-error-title" className="auth-error-summary-title">
              Please fix the following errors:
            </h2>
            <ul>
              {errorKeys.map((key) => (
                <li key={key}>
                  <a href={`#reg-${key}`} className="auth-error-link">
                    {errors[key]}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {serviceMessage && (
          <div className="auth-honest-alert" role="alert">
            {serviceMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <FormField
            id="reg-fullName"
            label="Full Name"
            required
            error={touched.fullName ? errors.fullName : undefined}
          >
            <input
              type="text"
              className="form-input"
              autoComplete="name"
              value={formValues.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              onBlur={() => handleBlur('fullName')}
            />
          </FormField>

          <FormField
            id="reg-email"
            label="Email Address"
            required
            error={touched.email ? errors.email : undefined}
          >
            <input
              type="email"
              className="form-input"
              autoComplete="email"
              value={formValues.email}
              onChange={(e) => handleChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
            />
          </FormField>

          <FormField
            id="reg-phone"
            label="Mobile Number (03XXXXXXXXX)"
            required
            helperText="11 digits starting with 03"
            error={touched.phone ? errors.phone : undefined}
          >
            <input
              type="tel"
              className="form-input"
              autoComplete="tel"
              value={formValues.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              onBlur={() => handleBlur('phone')}
            />
          </FormField>

          <FormField
            id="reg-password"
            label="Password"
            required
            helperText={`Minimum 10 characters. (Strength hint: ${strengthHint})`}
            error={touched.password ? errors.password : undefined}
          >
            <div className="password-input-wrap">
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                autoComplete="new-password"
                value={formValues.password}
                onChange={(e) => handleChange('password', e.target.value)}
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

          <FormField
            id="reg-confirmPassword"
            label="Confirm Password"
            required
            error={touched.confirmPassword ? errors.confirmPassword : undefined}
          >
            <div className="password-input-wrap">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                className="form-input"
                autoComplete="new-password"
                value={formValues.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                onBlur={() => handleBlur('confirmPassword')}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                aria-pressed={showConfirmPassword}
              >
                {showConfirmPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </FormField>

          {/* Terms Agreement Checkbox */}
          <div style={{ margin: 'var(--space-4) 0' }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 'var(--space-2)',
                fontSize: 'var(--font-size-sm)',
              }}
            >
              <input
                id="reg-agreeToTerms"
                type="checkbox"
                checked={formValues.agreeToTerms}
                onChange={(e) => handleChange('agreeToTerms', e.target.checked)}
                style={{ marginTop: '3px' }}
              />
              <span>
                I agree to the <Link to="/terms">Terms</Link> and{' '}
                <Link to="/privacy">Privacy Policy</Link>.
              </span>
            </label>
            {touched.agreeToTerms && errors.agreeToTerms && (
              <span
                className="form-error"
                role="alert"
                style={{ display: 'block', marginTop: 'var(--space-1)' }}
              >
                {errors.agreeToTerms}
              </span>
            )}
          </div>

          <button type="submit" className="btn btn-primary auth-submit-btn">
            Create Account
          </button>
        </form>

        <div className="auth-switch-prompt">
          Already have an account? <Link to="/login">Log in</Link>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
