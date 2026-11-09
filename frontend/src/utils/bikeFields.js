/**
 * Helper utilities for bike display values.
 */

export function displayValue(value, fallback = 'Not verified') {
  if (value === null || value === undefined || value === '') {
    return fallback;
  }
  return String(value);
}
