import { describe, it, expect } from 'vitest';
import { calculateOrderPricing, fromPaisa, toPaisa } from '../../src/utils/pricing.js';

describe('Pricing & Currency Utility', () => {
  it('toPaisa and fromPaisa maintain exact decimal precision with integer math', () => {
    expect(toPaisa(157900.5)).toBe(15790050);
    expect(fromPaisa(15790050)).toBe(157900.5);
    expect(toPaisa(null)).toBeNull();
    expect(fromPaisa(null)).toBeNull();
  });

  it('calculates final price when all items and delivery fee are verified numbers', () => {
    const items = [
      { unitPricePkr: 157900, quantity: 1 },
      { unitPricePkr: 229900, quantity: 2 },
    ];
    const deliveryFee = 2500;

    const result = calculateOrderPricing(items, deliveryFee);

    expect(result.isPriceFinal).toBe(true);
    expect(result.subtotalPkr).toBe(617700);
    expect(result.deliveryFeePkr).toBe(2500);
    expect(result.totalPkr).toBe(620200);
  });

  it('marks isPriceFinal = false and totalPkr = null if any item price is NULL', () => {
    const items = [
      { unitPricePkr: null, quantity: 1 },
      { unitPricePkr: 157900, quantity: 1 },
    ];
    const deliveryFee = 2500;

    const result = calculateOrderPricing(items, deliveryFee);

    expect(result.isPriceFinal).toBe(false);
    expect(result.totalPkr).toBeNull();
    expect(result.subtotalPkr).toBe(157900); // Only covers verified items
  });

  it('marks isPriceFinal = false and totalPkr = null if delivery charge is NULL', () => {
    const items = [{ unitPricePkr: 157900, quantity: 1 }];
    const deliveryFee = null; // Unverified delivery fee

    const result = calculateOrderPricing(items, deliveryFee);

    expect(result.isPriceFinal).toBe(false);
    expect(result.deliveryFeePkr).toBeNull();
    expect(result.totalPkr).toBeNull();
    expect(result.subtotalPkr).toBe(157900);
  });
});
