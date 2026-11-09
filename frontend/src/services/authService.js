import { apiClient } from './apiClient';

/**
 * Auth & Customer Account Service Layer.
 * Fully connected to the backend API via apiClient.
 * Automatically transmits httpOnly cookies with credentials: 'include'.
 */
export const authService = {
  async register(payload) {
    return await apiClient.post('/auth/register', payload);
  },

  async login(credentials) {
    return await apiClient.post('/auth/login', credentials);
  },

  async logout() {
    return await apiClient.post('/auth/logout');
  },

  async getCurrentUser() {
    return await apiClient.get('/auth/me');
  },

  async updateProfile(payload) {
    return await apiClient.patch('/auth/me', payload);
  },

  async getMyOrders(params = {}) {
    const query = new URLSearchParams(params).toString();
    return await apiClient.get(query ? `/orders/mine?${query}` : '/orders/mine');
  },

  async getMyOrderById(id) {
    return await apiClient.get(`/orders/mine/${id}`);
  },
};
