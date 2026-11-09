import { Router } from 'express';
import { adminController } from '../controllers/admin.controller.js';
import { authenticateJwt } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  createCategorySchema,
  createProductSchema,
  categoryIdParamSchema,
  productIdParamSchema,
  updateCategorySchema,
  updateInventorySchema,
  updateOrderStatusSchema,
  updateProductSchema,
} from '../validators/admin.validator.js';
import { orderNumberParamSchema } from '../validators/orders.validator.js';

export const adminRoutes = Router();

// Enforce authentication AND 'admin' role on EVERY admin route
adminRoutes.use(authenticateJwt, requireRole('admin'));

// Dashboard Statistics
adminRoutes.get('/stats', asyncHandler(adminController.getDashboardStats));

// Product Management
adminRoutes.get('/products', asyncHandler(adminController.listProducts));
adminRoutes.get('/products/:id', validate(productIdParamSchema), asyncHandler(adminController.getProductById));
adminRoutes.post('/products', validate(createProductSchema), asyncHandler(adminController.createProduct));
adminRoutes.patch('/products/:id', validate(updateProductSchema), asyncHandler(adminController.updateProduct));
adminRoutes.post(
  '/products/:id/deactivate',
  validate(productIdParamSchema),
  asyncHandler(adminController.deactivateProduct)
);
adminRoutes.post(
  '/products/:id/reactivate',
  validate(productIdParamSchema),
  asyncHandler(adminController.reactivateProduct)
);

// Category Management
adminRoutes.get('/categories', asyncHandler(adminController.listCategories));
adminRoutes.get(
  '/categories/:id',
  validate(categoryIdParamSchema),
  asyncHandler(adminController.getCategoryById)
);
adminRoutes.post(
  '/categories',
  validate(createCategorySchema),
  asyncHandler(adminController.createCategory)
);
adminRoutes.patch(
  '/categories/:id',
  validate(updateCategorySchema),
  asyncHandler(adminController.updateCategory)
);
adminRoutes.post(
  '/categories/:id/deactivate',
  validate(categoryIdParamSchema),
  asyncHandler(adminController.deactivateCategory)
);
adminRoutes.post(
  '/categories/:id/reactivate',
  validate(categoryIdParamSchema),
  asyncHandler(adminController.reactivateCategory)
);

// Inventory Management
adminRoutes.patch(
  '/inventory/:id',
  validate(updateInventorySchema),
  asyncHandler(adminController.updateInventory)
);

// Order Management
adminRoutes.get('/orders', asyncHandler(adminController.listOrders));
adminRoutes.get('/orders/:orderNumber', validate(orderNumberParamSchema), asyncHandler(adminController.getOrderByNumber));
adminRoutes.patch(
  '/orders/:orderNumber/status',
  validate(updateOrderStatusSchema),
  asyncHandler(adminController.updateOrderStatus)
);

// Customer Management
adminRoutes.get('/customers', asyncHandler(adminController.listCustomers));
adminRoutes.post('/customers/:id/status', asyncHandler(adminController.toggleCustomerStatus));
