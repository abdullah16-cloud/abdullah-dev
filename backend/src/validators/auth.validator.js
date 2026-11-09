import { z } from 'zod';
import { EMAIL_REGEX, normalizeEmail, normalizePhone, PK_PHONE_REGEX } from '../utils/normalize.js';

export const registerSchema = z.object({
  body: z.object({
    fullName: z
      .string({ required_error: 'Full name is required.' })
      .trim()
      .min(2, 'Full name must be at least 2 characters.')
      .max(100, 'Full name cannot exceed 100 characters.'),
    email: z
      .string({ required_error: 'Email is required.' })
      .trim()
      .transform(normalizeEmail)
      .refine((val) => EMAIL_REGEX.test(val), { message: 'Enter a valid email address.' }),
    phone: z
      .string({ required_error: 'Phone number is required.' })
      .trim()
      .transform(normalizePhone)
      .refine((val) => PK_PHONE_REGEX.test(val), {
        message: 'Enter a valid 11-digit Pakistani phone number (e.g. 03001234567).',
      }),
    password: z
      .string({ required_error: 'Password is required.' })
      .min(10, 'Password must be at least 10 characters long.'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email is required.' })
      .trim()
      .transform(normalizeEmail),
    password: z.string({ required_error: 'Password is required.' }).min(1, 'Password is required.'),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    fullName: z
      .string()
      .trim()
      .min(2, 'Full name must be at least 2 characters.')
      .max(100, 'Full name cannot exceed 100 characters.')
      .optional(),
    phone: z
      .string()
      .trim()
      .transform(normalizePhone)
      .refine((val) => !val || PK_PHONE_REGEX.test(val), {
        message: 'Enter a valid 11-digit Pakistani phone number (e.g. 03001234567).',
      })
      .optional(),
    city: z.string().trim().max(100).optional(),
    shippingAddress: z.string().trim().max(250).optional(),
  }),
});
