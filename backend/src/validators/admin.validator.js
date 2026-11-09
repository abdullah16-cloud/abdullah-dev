import { z } from 'zod';
import { AVAILABILITY_STATES, ORDER_STATUSES } from '../config/constants.js';

export const createProductSchema = z.object({
  body: z
    .object({
      name: z.string({ required_error: 'Product name is required.' }).trim().min(2).max(150),
      slug: z
        .string({ required_error: 'Product slug is required.' })
        .trim()
        .min(2)
        .max(100)
        .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens.'),
      categoryId: z.union(
        [z.coerce.number().int().positive(), z.string().trim().min(1)],
        { required_error: 'Category ID is required.' }
      ),
      engineCc: z.coerce.number().int().positive().nullable().optional(),
      pricePkr: z.coerce.number().min(0).nullable().optional(),
      availability: z.enum(AVAILABILITY_STATES).default('unknown'),
      featured: z.boolean().default(false),
      trackInventory: z.boolean().default(false),
      stockQuantity: z.coerce.number().int().min(0).default(0),
      colors: z.array(z.string().trim()).default([]),
      specs: z.record(z.any()).default({}),
      images: z.array(z.string().trim()).default([]),
      isVerified: z.boolean().default(false),
      sourceUrl: z.string().url().nullable().optional(),
      lastVerified: z.string().nullable().optional(),
    })
    .superRefine((data, ctx) => {
      if (data.isVerified) {
        if (!data.sourceUrl) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'sourceUrl is required when isVerified is true.',
            path: ['sourceUrl'],
          });
        }
        if (!data.lastVerified) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'lastVerified timestamp is required when isVerified is true.',
            path: ['lastVerified'],
          });
        }
      }
    }),
});

export const updateProductSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  body: z.object({
    name: z.string().trim().min(2).max(150).optional(),
    slug: z.string().trim().min(2).max(100).regex(/^[a-z0-9-]+$/).optional(),
    categoryId: z.union([z.coerce.number().int().positive(), z.string().trim().min(1)]).optional(),
    engineCc: z.coerce.number().int().positive().nullable().optional(),
    pricePkr: z.coerce.number().min(0).nullable().optional(),
    availability: z.enum(AVAILABILITY_STATES).optional(),
    featured: z.boolean().optional(),
    trackInventory: z.boolean().optional(),
    stockQuantity: z.coerce.number().int().min(0).optional(),
    colors: z.array(z.string().trim()).optional(),
    specs: z.record(z.any()).optional(),
    images: z.array(z.string().trim()).optional(),
    isVerified: z.boolean().optional(),
    sourceUrl: z.string().url().nullable().optional(),
    lastVerified: z.string().nullable().optional(),
  }),
});

export const updateInventorySchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  body: z.object({
    quantityOnHand: z.coerce.number().int().min(0, 'Quantity on hand must be >= 0.'),
    trackInventory: z.boolean(),
  }),
});

export const updateOrderStatusSchema = z.object({
  params: z.object({
    orderNumber: z.string().trim().min(3),
  }),
  body: z.object({
    toStatus: z.enum(ORDER_STATUSES, {
      errorMap: () => ({ message: `Invalid status. Must be one of: ${ORDER_STATUSES.join(', ')}` }),
    }),
    notes: z.string().trim().max(300).optional(),
  }),
});

export const productIdParamSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
});

export const categoryIdParamSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
});

export const createCategorySchema = z.object({
  body: z.object({
    title: z.string({ required_error: 'Category title is required.' }).trim().min(2).max(100),
    slug: z
      .string({ required_error: 'Category slug is required.' })
      .trim()
      .min(2)
      .max(50)
      .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens.'),
    description: z.string().trim().max(1000).nullable().optional(),
    badgeText: z.string().trim().max(50).nullable().optional(),
  }),
});

export const updateCategorySchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  body: z.object({
    title: z.string().trim().min(2).max(100).optional(),
    slug: z
      .string()
      .trim()
      .min(2)
      .max(50)
      .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens.')
      .optional(),
    description: z.string().trim().max(1000).nullable().optional(),
    badgeText: z.string().trim().max(50).nullable().optional(),
  }),
});
