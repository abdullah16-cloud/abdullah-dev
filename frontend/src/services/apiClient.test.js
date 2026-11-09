import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiClient } from './apiClient';
import { ApiError } from './errors';

describe('Frontend API Client (apiClient)', () => {
  let fetchSpy;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, 'fetch');
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it('sends GET request with credentials: include and returns parsed data', async () => {
    const mockData = [{ id: 'honda-cd-70', name: 'Honda CD 70' }];
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ success: true, data: mockData }),
    });

    const result = await apiClient.get('/products');

    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/products',
      expect.objectContaining({
        method: 'GET',
        credentials: 'include',
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
      })
    );
    expect(result).toEqual(mockData);
  });

  it('sends POST request with serialized JSON body and credentials: include', async () => {
    const payload = { email: 'user@example.com', password: 'SecretPassword123' };
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ success: true, data: { user: { email: 'user@example.com' } } }),
    });

    const result = await apiClient.post('/auth/login', payload);

    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/auth/login',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify(payload),
      })
    );
    expect(result).toEqual({ user: { email: 'user@example.com' } });
  });

  it('throws ApiError with status and message when server returns an HTTP error', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: false,
      status: 401,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Email or password is incorrect.' },
      }),
    });

    await expect(apiClient.post('/auth/login', {})).rejects.toThrow(ApiError);
  });

  it('handles network failure gracefully with code NETWORK_ERROR', async () => {
    fetchSpy.mockRejectedValueOnce(new TypeError('Failed to fetch'));

    await expect(apiClient.get('/health')).rejects.toMatchObject({
      code: 'NETWORK_ERROR',
      status: 0,
    });
  });
});

