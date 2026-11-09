import { validatePhone } from './checkoutValidation';

export const GENERIC_LOGIN_ERROR = 'Email or password is incorrect.';

/**
 * Validates an email address.
 * Max 254 chars, reasonable format check.
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return 'Email is required.';
  }
  const trimmed = email.trim();
  if (trimmed.length > 254) {
    return 'Email must not exceed 254 characters.';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return 'Enter a valid email address.';
  }
  return null;
}

/**
 * Validates registration password.
 * Min 10 chars, max 128, not only whitespace, not equal to email.
 */
export function validatePassword(password, email = '') {
  if (!password || typeof password !== 'string') {
    return 'Password is required.';
  }
  if (password.trim().length === 0) {
    return 'Password must not consist only of whitespace.';
  }
  if (password.length < 10) {
    return 'Password must be at least 10 characters long.';
  }
  if (password.length > 128) {
    return 'Password must not exceed 128 characters.';
  }
  if (email && password.toLowerCase() === email.trim().toLowerCase()) {
    return 'Password cannot be the same as your email address.';
  }
  return null;
}

/**
 * Simple password strength indicator for user feedback (not a security guarantee).
 */
export function getPasswordStrength(password) {
  if (!password || password.length < 10) return 'Weak';
  let score = 0;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score >= 3) return 'Strong';
  if (score >= 1) return 'Okay';
  return 'Weak';
}

/**
 * Validates login form inputs without revealing password complexity rules.
 */
export function validateLogin(values = {}) {
  const errors = {};
  const emailError = validateEmail(values.email);
  if (emailError) {
    errors.email = emailError;
  }
  if (!values.password || values.password.length === 0) {
    errors.password = 'Password is required.';
  }
  return errors;
}

/**
 * Validates registration form inputs.
 */
export function validateRegistration(values = {}) {
  const errors = {};

  // Full Name: 2-80 characters
  const name = (values.fullName || '').trim();
  if (!name) {
    errors.fullName = 'Full name is required.';
  } else if (name.length < 2) {
    errors.fullName = 'Full name must be at least 2 characters.';
  } else if (name.length > 80) {
    errors.fullName = 'Full name cannot exceed 80 characters.';
  }

  // Email
  const emailError = validateEmail(values.email);
  if (emailError) {
    errors.email = emailError;
  }

  // Phone
  const phoneError = validatePhone(values.phone);
  if (phoneError) {
    errors.phone = phoneError;
  }

  // Password
  const passwordError = validatePassword(values.password, values.email);
  if (passwordError) {
    errors.password = passwordError;
  }

  // Confirm Password
  if (!values.confirmPassword) {
    errors.confirmPassword = 'Confirm your password.';
  } else if (values.password !== values.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  // Terms Agreement
  if (!values.agreeToTerms) {
    errors.agreeToTerms = 'You must agree to the Terms and Privacy Policy.';
  }

  return errors;
}

/**
 * Validates profile editing inputs.
 */
export function validateProfile(values = {}) {
  const errors = {};

  const name = (values.fullName || '').trim();
  if (!name) {
    errors.fullName = 'Full name is required.';
  } else if (name.length < 2) {
    errors.fullName = 'Full name must be at least 2 characters.';
  } else if (name.length > 80) {
    errors.fullName = 'Full name cannot exceed 80 characters.';
  }

  const phoneError = validatePhone(values.phone);
  if (phoneError) {
    errors.phone = phoneError;
  }

  if (values.defaultCity && values.defaultCity.trim().length > 50) {
    errors.defaultCity = 'City name cannot exceed 50 characters.';
  }

  if (values.defaultAddress && values.defaultAddress.trim().length > 150) {
    errors.defaultAddress = 'Address cannot exceed 150 characters.';
  }

  return errors;
}
