import { adminService } from '../services/admin.service.js';
import { sendSuccess } from '../utils/response.js';

export const adminController = {
  async getDashboardStats(_req, res) {
    const stats = await adminService.getDashboardStats();
    return sendSuccess(res, stats);
  },

  async listProducts(req, res) {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const search = req.query.search || null;
    const category = req.query.category || null;
    const status = req.query.status || null;
    const result = await adminService.listProducts({ search, category, status, page, limit });
    return sendSuccess(res, result.products, 200, result.pagination);
  },

  async getProductById(req, res) {
    const product = await adminService.getProductById(req.params.id);
    return sendSuccess(res, product);
  },

  async createProduct(req, res) {
    const product = await adminService.createProduct(req.body);
    return sendSuccess(res, product, 201);
  },

  async updateProduct(req, res) {
    const product = await adminService.updateProduct(req.params.id, req.body);
    return sendSuccess(res, product);
  },

  async deactivateProduct(req, res) {
    const product = await adminService.setProductActiveState(req.params.id, false);
    return sendSuccess(res, { message: 'Product deactivated successfully.', product });
  },

  async reactivateProduct(req, res) {
    const product = await adminService.setProductActiveState(req.params.id, true);
    return sendSuccess(res, { message: 'Product reactivated successfully.', product });
  },

  async updateInventory(req, res) {
    const product = await adminService.updateInventory(req.params.id, req.body);
    return sendSuccess(res, product);
  },

  // Category Management
  async listCategories(req, res) {
    const search = req.query.search || null;
    const status = req.query.status || null;
    const categories = await adminService.listCategories({ search, status });
    return sendSuccess(res, categories);
  },

  async getCategoryById(req, res) {
    const category = await adminService.getCategoryById(req.params.id);
    return sendSuccess(res, category);
  },

  async createCategory(req, res) {
    const category = await adminService.createCategory(req.body);
    return sendSuccess(res, category, 201);
  },

  async updateCategory(req, res) {
    const category = await adminService.updateCategory(req.params.id, req.body);
    return sendSuccess(res, category);
  },

  async deactivateCategory(req, res) {
    const category = await adminService.setCategoryActiveState(req.params.id, false);
    return sendSuccess(res, { message: 'Category deactivated successfully.', category });
  },

  async reactivateCategory(req, res) {
    const category = await adminService.setCategoryActiveState(req.params.id, true);
    return sendSuccess(res, { message: 'Category reactivated successfully.', category });
  },

  async listOrders(req, res) {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const search = req.query.search || null;
    const status = req.query.status || null;
    const result = await adminService.listOrders({ search, status, page, limit });
    return sendSuccess(res, result.orders, 200, result.pagination);
  },

  async getOrderByNumber(req, res) {
    const order = await adminService.getOrderByNumber(req.params.orderNumber);
    return sendSuccess(res, order);
  },

  async updateOrderStatus(req, res) {
    const result = await adminService.updateOrderStatus(req.params.orderNumber, {
      ...req.body,
      adminName: req.user.fullName || 'Admin',
    });
    return sendSuccess(res, result);
  },

  // Customer Management
  async listCustomers(req, res) {
    const search = req.query.search || null;
    const status = req.query.status || null;
    const page = req.query.page ? parseInt(req.query.page, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 20;

    const data = await adminService.listCustomers({ search, status, page, limit });
    return sendSuccess(res, data.customers, 200, { pagination: data.pagination });
  },

  async toggleCustomerStatus(req, res) {
    const { id } = req.params;
    const { isActive } = req.body;
    const user = await adminService.setCustomerActiveState(id, isActive);
    return sendSuccess(res, user);
  },
};
