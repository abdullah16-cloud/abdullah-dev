import { apiClient } from './apiClient';
import { bikes as staticBikes } from '../data/bikes';
import { categories as staticCategories } from '../data/categories';

export const catalogService = {
  /**
   * Fetches active motorcycle categories from the backend.
   * Gracefully falls back to static demo categories if the backend is unreachable.
   */
  async getCategories() {
    try {
      const data = await apiClient.get('/categories');
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
      return staticCategories;
    } catch {
      // Graceful fallback to static data when backend or DB is offline
      return staticCategories;
    }
  },

  /**
   * Fetches active motorcycle catalog from the backend with URL filters.
   * Gracefully falls back to static demo bikes if the backend is unreachable.
   */
  async getProducts(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.search) queryParams.set('search', params.search);
      if (params.category && params.category !== 'all')
        queryParams.set('category', params.category);
      if (params.availability && params.availability !== 'all')
        queryParams.set('availability', params.availability);
      if (params.maxPrice) queryParams.set('maxPrice', String(params.maxPrice));
      if (params.sort) queryParams.set('sort', params.sort);
      if (params.page) queryParams.set('page', String(params.page));
      queryParams.set('limit', String(params.limit || 50));

      const queryStr = queryParams.toString();
      const endpoint = queryStr ? `/products?${queryStr}` : '/products';
      const data = await apiClient.get(endpoint);

      if (Array.isArray(data)) {
        return data;
      }
      return staticBikes;
    } catch {
      return staticBikes;
    }
  },

  /**
   * Fetches single motorcycle details by slug.
   */
  async getProductBySlug(slug) {
    try {
      return await apiClient.get(`/products/${slug}`);
    } catch (err) {
      // Fallback search in static list
      const found = staticBikes.find((b) => b.id === slug || b.slug === slug);
      if (found) return found;
      throw err;
    }
  },
};
