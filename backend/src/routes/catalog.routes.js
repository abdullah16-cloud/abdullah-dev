import { Router } from 'express';
import { catalogController } from '../controllers/catalog.controller.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { catalogQuerySchema, slugParamSchema } from '../validators/catalog.validator.js';

export const catalogRoutes = Router();

catalogRoutes.get('/categories', asyncHandler(catalogController.getCategories));
catalogRoutes.get('/products', validate(catalogQuerySchema), asyncHandler(catalogController.getProducts));
catalogRoutes.get('/products/:slug', validate(slugParamSchema), asyncHandler(catalogController.getProductBySlug));
