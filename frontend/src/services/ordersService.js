import { apiClient } from './apiClient';

export const ordersService = {
  /**
   * Submits a bike booking order request via Cash on Delivery.
   */
  async createOrder(orderPayload) {
    return await apiClient.post('/orders', orderPayload);
  },

  /**
   * Retrieves authenticated customer's own order history.
   */
  async getMyOrders(params = {}) {
    const query = new URLSearchParams(params).toString();
    return await apiClient.get(query ? `/orders/mine?${query}` : '/orders/mine');
  },

  /**
   * Fetches single order details by public order number.
   */
  async getMyOrderByNumber(orderNumber) {
    return await apiClient.get(`/orders/mine/${orderNumber}`);
  },
};

