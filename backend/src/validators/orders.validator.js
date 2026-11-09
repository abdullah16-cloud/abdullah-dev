import { z } from 'zod';
import { EMAIL_REGEX, normalizeEmail, normalizePhone, PK_PHONE_REGEX } from '../utils/normalize.js';

export const createOrderSchema = z.object({
  body: z.object({
    customer: z.object({
      fullName: z
        .string({ required_error: 'Full name is required.' })
        .trim()
        .min(2, 'Name must be between 2 and 80 characters.')
        .max(80, 'Name must be between 2 and 80 characters.'),
      phone: z
        .string({ required_error: 'Phone number is required.' })
        .trim()
        .transform(normalizePhone)
        .refine((val) => PK_PHONE_REGEX.test(val), {
          message: 'Enter a valid 11-digit Pakistani phone number (e.g. 03001234567).',
        }),
      email: z
        .string({ required_error: 'Email is required.' })
        .trim()
        .transform(normalizeEmail)
        .refine((val) => EMAIL_REGEX.test(val), {
          message: 'Enter a valid email address.',
        }),
      city: z
        .string({ required_error: 'City is required.' })
        .trim()
        .min(2, 'City must be between 2 and 60 characters.')
        .max(60, 'City must be between 2 and 60 characters.'),
      address: z
        .string({ required_error: 'Address is required.' })
        .trim()
        .min(10, 'Delivery address must be at least 10 characters.')
        .max(250, 'Delivery address cannot exceed 250 characters.'),
      notes: z.string().trim().max(300, 'Notes cannot exceed 300 characters.').optional().default(''),
    }),
    items: z
      .array(
        z.object({
          productSlug: z
            .string({ required_error: 'Product slug is required.' })
            .trim()
            .min(2)
            .max(100),
          variantId: z.string().trim().optional(),
          selectedColor: z.string().trim().max(50).optional(),
          quantity: z.coerce
            .number({ required_error: 'Quantity is required.' })
            .int('Quantity must be an integer.')
            .min(1, 'Quantity must be at least 1.')
            .max(10, 'Maximum 10 units per bike item.'),
        })
      )
      .min(1, 'Order must contain at least one item.')
      .max(10, 'Order cannot exceed 10 distinct bike items.')
      .transform((items) => {
        // Automatically merge duplicate lines by productSlug and selectedColor
        const merged = new Map();
        for (const item of items) {
          const key = `${item.productSlug}_${item.selectedColor || ''}`;
          if (merged.has(key)) {
            const existing = merged.get(key);
            existing.quantity = Math.min(10, existing.quantity + item.quantity);
          } else {
            merged.set(key, { ...item });
          }
        }
        return Array.from(merged.values());
      }),
    paymentMethod: z
      .literal('cod', {
        errorMap: () => ({ message: 'Only Cash on Delivery (COD) is supported.' }),
      })
      .default('cod'),
    acceptedDealershipConfirmation: z
      .boolean({
        errorMap: () => ({
          message: 'You must confirm that dealership will contact you to finalize details.',
        }),
      })
      .default(true),
  }),
});

export const orderNumberParamSchema = z.object({
  params: z.object({
    orderNumber: z.string().trim().min(3).max(50),
  }),
});
