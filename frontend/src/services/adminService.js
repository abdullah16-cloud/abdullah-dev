import { apiClient } from './apiClient';

/**
 * Admin Service: Communicates with backend /api/admin/* endpoints.
 * All requests automatically carry the secure httpOnly admin session cookie.
 */
export const adminService = {
  /**
   * Fetches real live database statistics for the dashboard cards.
   */
  async getDashboardStats() {
    return apiClient.get('/admin/stats');
  },

  /**
   * Fetches the latest customer orders for the dashboard overview.
   */
  async getRecentOrders(limit = 5) {
    return apiClient.get(`/admin/orders?limit=${limit}`);
  },

  /**
   * Fetches paginated and filtered product list for admin management.
   */
  async listProducts(params = {}) {
    const cleanParams = {};
    for (const [key, val] of Object.entries(params)) {
      if (val !== undefined && val !== null && val !== '') {
        cleanParams[key] = val;
      }
    }
    const query = new URLSearchParams(cleanParams).toString();
    return apiClient.get(`/admin/products${query ? `?${query}` : ''}`);
  },

  /**
   * Fetches a single product by ID.
   */
  async getProductById(id) {
    return apiClient.get(`/admin/products/${id}`);
  },

  /**
   * Creates a new motorcycle product.
   */
  async createProduct(productData) {
    return apiClient.post('/admin/products', productData);
  },

  /**
   * Updates an existing motorcycle product by ID.
   */
  async updateProduct(id, productData) {
    return apiClient.patch(`/admin/products/${id}`, productData);
  },

  /**
   * Deactivates a product (soft deactivation: is_active = false).
   */
  async deactivateProduct(id) {
    return apiClient.post(`/admin/products/${id}/deactivate`);
  },

  /**
   * Reactivates a product (is_active = true).
   */
  async reactivateProduct(id) {
    return apiClient.post(`/admin/products/${id}/reactivate`);
  },

  /**
   * Fetches categories list for select dropdowns.
   */
  async getCategories() {
    return apiClient.get('/admin/categories');
  },

  /**
   * Fetches full categories list with product counts and active status for admin management.
   */
  async listCategories(params = {}) {
    const cleanParams = {};
    for (const [key, val] of Object.entries(params)) {
      if (val !== undefined && val !== null && val !== '') {
        cleanParams[key] = val;
      }
    }
    const query = new URLSearchParams(cleanParams).toString();
    return apiClient.get(`/admin/categories${query ? `?${query}` : ''}`);
  },

  /**
   * Fetches a single category by ID.
   */
  async getCategoryById(id) {
    return apiClient.get(`/admin/categories/${id}`);
  },

  /**
   * Creates a new motorcycle category.
   */
  async createCategory(categoryData) {
    return apiClient.post('/admin/categories', categoryData);
  },

  /**
   * Updates an existing category by ID.
   */
  async updateCategory(id, categoryData) {
    return apiClient.patch(`/admin/categories/${id}`, categoryData);
  },

  /**
   * Deactivates a category (soft deactivation: is_active = false).
   */
  async deactivateCategory(id) {
    return apiClient.post(`/admin/categories/${id}/deactivate`);
  },

  /**
   * Reactivates a category (is_active = true).
   */
  async reactivateCategory(id) {
    return apiClient.post(`/admin/categories/${id}/reactivate`);
  },

  /**
   * Fetches paginated orders list.
   */
  async listOrders(params = {}) {
    const cleanParams = {};
    for (const [key, val] of Object.entries(params)) {
      if (val !== undefined && val !== null && val !== '') {
        cleanParams[key] = val;
      }
    }
    const query = new URLSearchParams(cleanParams).toString();
    return apiClient.get(`/admin/orders${query ? `?${query}` : ''}`);
  },

  /**
   * Fetches full order details including line items and history by order number.
   */
  async getOrderByNumber(orderNumber) {
    return apiClient.get(`/admin/orders/${orderNumber}`);
  },

  /**
   * Updates order lifecycle status (pending -> confirmed -> dispatched -> delivered, cancelled).
   */
  async updateOrderStatus(orderNumber, { toStatus, notes }) {
    return apiClient.patch(`/admin/orders/${orderNumber}/status`, { toStatus, notes });
  },

  /**
   * Updates product inventory stock quantity and tracking status.
   */
  async updateInventory(id, { quantityOnHand, trackInventory }) {
    return apiClient.patch(`/admin/inventory/${id}`, {
      quantityOnHand,
      trackInventory,
    });
  },

  /**
   * Fetches list of customers and registered users for admin oversight.
   */
  async listCustomers(params = {}) {
    const cleanParams = {};
    for (const [key, val] of Object.entries(params)) {
      if (val !== undefined && val !== null && val !== '') {
        cleanParams[key] = val;
      }
    }
    const query = new URLSearchParams(cleanParams).toString();
    return apiClient.get(`/admin/customers${query ? `?${query}` : ''}`);
  },

  /**
   * Toggles customer account active/inactive state.
   */
  async toggleCustomerStatus(id, isActive) {
    return apiClient.post(`/admin/customers/${id}/status`, { isActive });
  },
};
