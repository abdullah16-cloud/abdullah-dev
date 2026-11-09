import { describe, it, expect } from 'vitest';
import { loadConfig } from '../../src/config/env.js';

describe('Config Environment Validation', () => {
  it('loads valid development environment configuration with defaults', () => {
    const raw = {
      NODE_ENV: 'development',
      PORT: '5000',
      JWT_SECRET: 'dev_secret_at_least_32_characters_long_12345',
    };
    const loaded = loadConfig(raw);
    expect(loaded.NODE_ENV).toBe('development');
    expect(loaded.PORT).toBe(5000);
    expect(loaded.COOKIE_SECURE).toBe(false);
    expect(loaded.CORS_ALLOWED_ORIGINS).toContain('http://localhost:5173');
  });

  it('fails fast if NODE_ENV is production and JWT_SECRET is shorter than 32 characters', () => {
    const invalidProduction = {
      NODE_ENV: 'production',
      PORT: '5000',
      JWT_SECRET: 'short_secret',
    };
    expect(() => loadConfig(invalidProduction)).toThrow(/Invalid environment configuration/);
  });

  it('fails fast if NODE_ENV is production and JWT_SECRET contains placeholder text', () => {
    const placeholderProduction = {
      NODE_ENV: 'production',
      PORT: '5000',
      JWT_SECRET: 'replace_this_with_a_secure_random_key_of_at_least_32_characters',
    };
    expect(() => loadConfig(placeholderProduction)).toThrow(/Invalid environment configuration/);
  });
});
