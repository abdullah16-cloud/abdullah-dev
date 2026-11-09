import { catalogService } from '../services/catalog.service.js';
import { sendSuccess } from '../utils/response.js';

export const catalogController = {
  async getCategories(_req, res) {
    const categories = await catalogService.getCategories();
    return sendSuccess(res, categories);
  },

  async getProducts(req, res) {
    const result = await catalogService.getProducts(req.query);
    return sendSuccess(res, result.products, 200, result.pagination);
  },

  async getProductBySlug(req, res) {
    const product = await catalogService.getProductBySlug(req.params.slug);
    return sendSuccess(res, product);
  },
};
