import { describe, it, expect, vi } from 'vitest';
import { requireRole } from '../../src/middleware/requireRole.js';

describe('Role-Based Access Control (requireRole) Middleware', () => {
  it('rejects unauthenticated requests with 401 UNAUTHORIZED', () => {
    const req = { user: null };
    const res = {};
    const next = vi.fn();

    const guard = requireRole('admin');
    guard(req, res, next);

    expect(next).toHaveBeenCalled();
    const err = next.mock.calls[0][0];
    expect(err.statusCode).toBe(401);
    expect(err.code).toBe('UNAUTHORIZED');
  });

  it('rejects customer role with 403 FORBIDDEN when admin role is required', () => {
    const req = { user: { id: '1', role: 'customer' } };
    const res = {};
    const next = vi.fn();

    const guard = requireRole('admin');
    guard(req, res, next);

    expect(next).toHaveBeenCalled();
    const err = next.mock.calls[0][0];
    expect(err.statusCode).toBe(403);
    expect(err.code).toBe('FORBIDDEN');
  });

  it('allows access when user has the required admin role', () => {
    const req = { user: { id: '2', role: 'admin' } };
    const res = {};
    const next = vi.fn();

    const guard = requireRole('admin');
    guard(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });
});
