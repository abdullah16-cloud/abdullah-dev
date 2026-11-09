import { describe, it, expect, vi } from 'vitest';
import { originCheck } from '../../src/middleware/originCheck.js';

describe('CSRF Origin Check Middleware', () => {
  it('allows safe HTTP GET requests without checking Origin', () => {
    const req = { method: 'GET', headers: {} };
    const res = {};
    const next = vi.fn();

    originCheck(req, res, next);
    expect(next).toHaveBeenCalledWith();
  });

  it('blocks mutating POST request when Origin is not in the CORS allowlist', () => {
    const req = {
      method: 'POST',
      headers: {
        origin: 'https://malicious-phishing-site.com',
        'content-type': 'application/json',
        'content-length': '15',
      },
    };
    const res = {};
    const next = vi.fn();

    originCheck(req, res, next);
    expect(next).toHaveBeenCalled();
    const errorArg = next.mock.calls[0][0];
    expect(errorArg).toBeDefined();
    expect(errorArg.statusCode).toBe(403);
    expect(errorArg.code).toBe('CSRF_BLOCKED');
  });

  it('allows mutating POST request when Origin matches CORS allowed origin', () => {
    const req = {
      method: 'POST',
      headers: {
        origin: 'http://localhost:5173',
        'content-type': 'application/json',
        'content-length': '20',
      },
    };
    const res = {};
    const next = vi.fn();

    originCheck(req, res, next);
    expect(next).toHaveBeenCalledWith();
  });
});
