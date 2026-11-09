import { z } from 'zod';
import { ALLOWED_SORT_OPTIONS, AVAILABILITY_STATES } from '../config/constants.js';

export const catalogQuerySchema = z.object({
  query: z.object({
    search: z.string().trim().optional(),
    category: z.string().trim().optional(),
    availability: z.enum(AVAILABILITY_STATES).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    sort: z.enum(ALLOWED_SORT_OPTIONS).default('name-asc'),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(12),
  }),
});

export const slugParamSchema = z.object({
  params: z.object({
    slug: z
      .string()
      .trim()
      .min(2, 'Slug must be at least 2 characters.')
      .max(100, 'Slug cannot exceed 100 characters.')
      .regex(/^[a-z0-9-]+$/, 'Slug may only contain lowercase letters, numbers, and hyphens.'),
  }),
});
