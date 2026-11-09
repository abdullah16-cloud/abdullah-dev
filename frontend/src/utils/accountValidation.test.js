import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validatePassword,
  getPasswordStrength,
  validateLogin,
  validateRegistration,
  validateProfile,
} from './accountValidation';

describe('accountValidation - validateEmail', () => {
  it('validates correct email formats', () => {
    expect(validateEmail('test@example.com')).toBeNull();
    expect(validateEmail('user.name+tag@domain.pk')).toBeNull();
  });

  it('rejects invalid or empty emails', () => {
    expect(validateEmail('')).toBe('Email is required.');
    expect(validateEmail('notanemail')).toBe('Enter a valid email address.');
    expect(validateEmail('test@')).toBe('Enter a valid email address.');
    expect(validateEmail('a'.repeat(250) + '@example.com')).toBe(
      'Email must not exceed 254 characters.'
    );
  });
});

describe('accountValidation - validatePassword', () => {
  it('requires min 10 chars, max 128, non-whitespace, and not equal to email', () => {
    expect(validatePassword('short')).toBe('Password must be at least 10 characters long.');
    expect(validatePassword('   '.repeat(4))).toBe('Password must not consist only of whitespace.');
    expect(validatePassword('a'.repeat(129))).toBe('Password must not exceed 128 characters.');
    expect(validatePassword('test@example.com', 'test@example.com')).toBe(
      'Password cannot be the same as your email address.'
    );
    expect(validatePassword('superSecurePass123')).toBeNull();
  });

  it('calculates friendly password strength hint', () => {
    expect(getPasswordStrength('short')).toBe('Weak');
    expect(getPasswordStrength('simplepass10')).toBe('Okay');
    expect(getPasswordStrength('StrongPass!123')).toBe('Strong');
  });
});

describe('accountValidation - validateLogin', () => {
  it('validates presence of email and password only without leaking password rules', () => {
    const res = validateLogin({ email: '', password: '' });
    expect(res.email).toBe('Email is required.');
    expect(res.password).toBe('Password is required.');

    const valid = validateLogin({ email: 'test@example.com', password: 'anyPassword' });
    expect(Object.keys(valid)).toHaveLength(0);
  });
});

describe('accountValidation - validateRegistration', () => {
  it('flags missing name, mismatched passwords, invalid phone, and missing terms', () => {
    const res = validateRegistration({
      fullName: 'A',
      email: 'bad',
      phone: '123',
      password: 'short',
      confirmPassword: 'differentPassword',
      agreeToTerms: false,
    });

    expect(res.fullName).toBe('Full name must be at least 2 characters.');
    expect(res.email).toBe('Enter a valid email address.');
    expect(res.phone).toBe('Enter a valid 11-digit Pakistani phone number (e.g. 03001234567).');
    expect(res.password).toBe('Password must be at least 10 characters long.');
    expect(res.confirmPassword).toBe('Passwords do not match.');
    expect(res.agreeToTerms).toBe('You must agree to the Terms and Privacy Policy.');
  });

  it('accepts valid registration data', () => {
    const valid = validateRegistration({
      fullName: 'Ali Khan',
      email: 'ali@example.com',
      phone: '03001234567',
      password: 'ValidPassword123!',
      confirmPassword: 'ValidPassword123!',
      agreeToTerms: true,
    });
    expect(Object.keys(valid)).toHaveLength(0);
  });
});

describe('accountValidation - validateProfile', () => {
  it('validates profile fields safely', () => {
    const res = validateProfile({
      fullName: '',
      phone: '03001234567',
      defaultCity: 'Lahore',
    });
    expect(res.fullName).toBe('Full name is required.');

    const valid = validateProfile({
      fullName: 'Ahmed Raza',
      phone: '03121234567',
      defaultCity: 'Karachi',
      defaultAddress: 'Main Boulevard, Gulberg',
    });
    expect(Object.keys(valid)).toHaveLength(0);
  });
});
