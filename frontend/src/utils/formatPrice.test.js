import { describe, it, expect } from 'vitest';
import { formatPkr } from './formatPrice';

describe('formatPkr utility', () => {
  it('formats positive numbers with PKR and commas', () => {
    expect(formatPkr(1234)).toBe('PKR 1,234');
    expect(formatPkr(150000)).toBe('PKR 150,000');
  });

  it('returns "Price not verified" when value is null or undefined', () => {
    expect(formatPkr(null)).toBe('Price not verified');
    expect(formatPkr(undefined)).toBe('Price not verified');
  });

  it('returns "Price not verified" for invalid numbers or NaN', () => {
    expect(formatPkr(NaN)).toBe('Price not verified');
    expect(formatPkr('150000')).toBe('Price not verified');
    expect(formatPkr({})).toBe('Price not verified');
  });
});
