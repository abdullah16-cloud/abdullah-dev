import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { authService } from './authService';
import { ApiError } from './errors';

describe('authService API Integration', () => {
  let fetchSpy;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, 'fetch');
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it('login calls /api/auth/login with credentials: include and returns user', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({
        success: true,
        data: { user: { id: '1', email: 'user@example.com' } },
      }),
    });

    const result = await authService.login({ email: 'user@example.com', password: 'Password123' });

    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/auth/login',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
      })
    );
    expect(result.user.email).toBe('user@example.com');
  });

  it('register calls /api/auth/register with credentials: include', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({
        success: true,
        data: { user: { id: '2', email: 'new@example.com' } },
      }),
    });

    const result = await authService.register({
      fullName: 'New User',
      email: 'new@example.com',
      phone: '03001234567',
      password: 'Password123',
    });

    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/auth/register',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
      })
    );
    expect(result.user.id).toBe('2');
  });

  it('logout calls /api/auth/logout and clears cookie', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ success: true, data: { message: 'Logged out successfully.' } }),
    });

    await authService.logout();

    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/auth/logout',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
      })
    );
  });

  it('getCurrentUser calls /api/auth/me to restore session', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({
        success: true,
        data: { user: { id: '1', email: 'user@example.com' } },
      }),
    });

    const result = await authService.getCurrentUser();
    expect(fetchSpy).toHaveBeenCalledWith('/api/auth/me', expect.anything());
    expect(result.user.id).toBe('1');
  });

  it('updateProfile calls /api/auth/me with PATCH', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({
        success: true,
        data: { user: { id: '1', fullName: 'Updated Name' } },
      }),
    });

    await authService.updateProfile({ fullName: 'Updated Name' });
    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/auth/me',
      expect.objectContaining({
        method: 'PATCH',
      })
    );
  });

  it('getMyOrders and getMyOrderById call /api/orders/mine endpoints', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ success: true, data: [] }),
    });
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ success: true, data: { orderNumber: 'PK-001' } }),
    });

    await authService.getMyOrders({ page: 1 });
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('/api/orders/mine'),
      expect.anything()
    );

    await authService.getMyOrderById('PK-001');
    expect(fetchSpy).toHaveBeenCalledWith('/api/orders/mine/PK-001', expect.anything());
  });

  it('throws ApiError when backend returns an error envelope', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: false,
      status: 409,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({
        success: false,
        error: { message: 'An account with this email already exists.' },
      }),
    });

    await expect(authService.register({ email: 'existing@example.com' })).rejects.toThrow(
      ApiError
    );
  });
});
