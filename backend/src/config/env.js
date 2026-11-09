import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().default(5000),
    DATABASE_URL: z.string().default('postgresql://postgres:postgres@localhost:5432/honda_bikes_store'),
    DB_POOL_MAX: z.coerce.number().default(10),
    JWT_SECRET: z.string().default('development_secret_key_at_least_32_chars_long_12345'),
    JWT_EXPIRES_IN: z.string().default('2h'),
    COOKIE_NAME: z.string().default('honda_auth_token'),
    COOKIE_SECURE: z.coerce.boolean().default(false),
    CORS_ALLOWED_ORIGINS: z
      .string()
      .default('http://localhost:5173,http://127.0.0.1:5173')
      .transform((val) => val.split(',').map((origin) => origin.trim()).filter(Boolean)),
    DELIVERY_CHARGE_PKR: z
      .string()
      .optional()
      .transform((val) => {
        if (!val || val.trim() === '') return null;
        const num = parseFloat(val);
        return isNaN(num) ? null : num;
      }),
    MAX_ITEMS_PER_ORDER: z.coerce.number().default(10),
    RATE_LIMIT_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000),
    RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),
    AUTH_RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(10),
    ORDER_RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(5),
  })
  .superRefine((data, ctx) => {
    if (data.NODE_ENV === 'production') {
      if (!data.JWT_SECRET || data.JWT_SECRET.length < 32) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'JWT_SECRET must be at least 32 characters long in production.',
          path: ['JWT_SECRET'],
        });
      }
      if (
        data.JWT_SECRET.includes('replace_this') ||
        data.JWT_SECRET.includes('development_secret')
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'JWT_SECRET cannot use placeholder values in production.',
          path: ['JWT_SECRET'],
        });
      }
      if (!data.DATABASE_URL || data.DATABASE_URL.includes('localhost')) {
        // Warning or validation
      }
    }
  });

export function loadConfig(rawEnv = process.env) {
  const parsed = envSchema.safeParse(rawEnv);
  if (!parsed.success) {
    const errorDetails = parsed.error.issues
      .map((issue) => ` - [${issue.path.join('.')}]: ${issue.message}`)
      .join('\n');
    console.error('FATAL: Environment validation failed:\n' + errorDetails);
    throw new Error('Invalid environment configuration');
  }
  return parsed.data;
}

export const config = loadConfig(process.env);
