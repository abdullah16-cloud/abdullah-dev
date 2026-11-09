import { ordersService } from '../services/orders.service.js';
import { sendSuccess } from '../utils/response.js';

export const ordersController = {
  async createOrder(req, res) {
    const userId = req.user ? req.user.id : null;
    const order = await ordersService.createOrder({
      customer: req.body.customer,
      items: req.body.items,
      userId,
    });
    return sendSuccess(res, order, 201);
  },

  async getMyOrders(req, res) {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const result = await ordersService.getMyOrders(req.user.id, { page, limit });
    return sendSuccess(res, result.orders, 200, result.pagination);
  },

  async getMyOrderByNumber(req, res) {
    const order = await ordersService.getMyOrderByNumber(req.user.id, req.params.orderNumber);
    return sendSuccess(res, order);
  },
};
