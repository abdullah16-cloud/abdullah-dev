import { describe, it, expect } from 'vitest';
import { normalizeEmail, normalizePhone, PK_PHONE_REGEX } from '../../src/utils/normalize.js';
import { createOrderSchema } from '../../src/validators/orders.validator.js';
import { registerSchema } from '../../src/validators/auth.validator.js';

describe('Validation Schemas & Helpers', () => {
  it('normalizes Pakistani phone numbers and validates standard format 03XXXXXXXXX', () => {
    expect(normalizePhone('0300-1234567')).toBe('03001234567');
    expect(normalizePhone('+923001234567')).toBe('03001234567');
    expect(normalizePhone('923001234567')).toBe('03001234567');
    expect(PK_PHONE_REGEX.test('03001234567')).toBe(true);
    expect(PK_PHONE_REGEX.test('04212345678')).toBe(false); // Non-03 prefix rejected
    expect(PK_PHONE_REGEX.test('0300123456')).toBe(false); // 10 digits rejected
  });

  it('normalizes email to lowercase trimmed format', () => {
    expect(normalizeEmail('  User@Example.COM ')).toBe('user@example.com');
  });

  it('registerSchema rejects passwords shorter than 10 characters', () => {
    const invalid = {
      body: {
        fullName: 'Ali Khan',
        email: 'ali@example.com',
        phone: '03001234567',
        password: 'short',
      },
    };
    const res = registerSchema.safeParse(invalid);
    expect(res.success).toBe(false);
  });

  it('createOrderSchema automatically merges duplicate item lines by slug & color', () => {
    const orderData = {
      body: {
        customer: {
          fullName: 'Tariq Mehmood',
          phone: '03001234567',
          email: 'tariq@example.com',
          city: 'Lahore',
          address: 'Main Boulevard, Gulberg III, House 12',
          notes: 'Call before delivery',
        },
        items: [
          { productSlug: 'honda-cd-70', quantity: 1, selectedColor: 'Red' },
          { productSlug: 'honda-cd-70', quantity: 2, selectedColor: 'Red' },
          { productSlug: 'honda-cg-125', quantity: 1, selectedColor: 'Black' },
        ],
        paymentMethod: 'cod',
        acceptedDealershipConfirmation: true,
      },
    };

    const parsed = createOrderSchema.safeParse(orderData);
    expect(parsed.success).toBe(true);
    // Duplicate honda-cd-70 Red lines merged from 1 + 2 into 3
    expect(parsed.data.body.items).toHaveLength(2);
    expect(parsed.data.body.items[0].productSlug).toBe('honda-cd-70');
    expect(parsed.data.body.items[0].quantity).toBe(3);
    expect(parsed.data.body.items[1].productSlug).toBe('honda-cg-125');
  });
});
