import { Router } from 'express';
import { ordersController } from '../controllers/orders.controller.js';
import { authenticateJwt, optionalAuth } from '../middleware/auth.js';
import { orderLimiter } from '../middleware/rateLimiters.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createOrderSchema, orderNumberParamSchema } from '../validators/orders.validator.js';

export const ordersRoutes = Router();

// Guest and logged-in customer order creation
ordersRoutes.post(
  '/',
  orderLimiter,
  optionalAuth,
  validate(createOrderSchema),
  asyncHandler(ordersController.createOrder)
);

// Authenticated user's personal order history
ordersRoutes.get('/mine', authenticateJwt, asyncHandler(ordersController.getMyOrders));
ordersRoutes.get(
  '/mine/:orderNumber',
  authenticateJwt,
  validate(orderNumberParamSchema),
  asyncHandler(ordersController.getMyOrderByNumber)
);
