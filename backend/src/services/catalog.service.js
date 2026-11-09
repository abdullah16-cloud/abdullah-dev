import { pool } from '../db/pool.js';
import { AppError } from '../utils/AppError.js';

/**
 * Maps PostgreSQL snake_case product row to camelCase response matching frontend bike shape.
 */
export function mapProductRow(row) {
  if (!row) return null;

  let parsedImages = [];
  if (Array.isArray(row.images)) {
    parsedImages = row.images;
  } else if (typeof row.images === 'string') {
    try {
      const parsed = JSON.parse(row.images);
      parsedImages = Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      parsedImages = row.images.trim() ? [row.images.trim()] : [];
    }
  }
  parsedImages = parsedImages.filter((img) => typeof img === 'string' && img.trim().length > 0);

  let parsedColors = [];
  if (Array.isArray(row.colors)) {
    parsedColors = row.colors;
  } else if (typeof row.colors === 'string') {
    try {
      const parsed = JSON.parse(row.colors);
      parsedColors = Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      parsedColors = row.colors.trim() ? [row.colors.trim()] : [];
    }
  }

  let parsedSpecs = {};
  if (row.specs && typeof row.specs === 'object' && !Array.isArray(row.specs)) {
    parsedSpecs = row.specs;
  } else if (typeof row.specs === 'string') {
    try {
      parsedSpecs = JSON.parse(row.specs);
    } catch {
      parsedSpecs = { highlights: row.specs };
    }
  }

  return {
    id: row.slug, // Frontend uses slug as public id ('honda-cd-70')
    internalId: String(row.id),
    name: row.name,
    slug: row.slug,
    category: row.category_slug || row.category || null,
    categoryTitle: row.category_title || null,
    engineCc: row.engine_cc !== null ? Number(row.engine_cc) : null,
    pricePkr: row.price_pkr !== null ? parseFloat(row.price_pkr) : null,
    colors: parsedColors,
    specs: parsedSpecs,
    images:
      parsedImages.length > 0
        ? parsedImages
        : [`/images/bikes/${row.slug}.jpg`],
    availability: row.availability || 'unknown',
    isVerified: Boolean(row.is_verified),
    sourceUrl: row.source_url || null,
    lastVerified: row.last_verified || null,
    isDemoData: Boolean(row.is_demo_data),
    featured: Boolean(row.featured),
    trackInventory: Boolean(row.track_inventory),
    stockQuantity: row.stock_quantity !== null ? Number(row.stock_quantity) : 0,
    isActive: Boolean(row.is_active),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const catalogService = {
  async getCategories() {
    const result = await pool.query(
      'SELECT id, slug, title, description, badge_text, is_active FROM categories WHERE is_active = true ORDER BY id ASC'
    );
    return result.rows.map((row) => ({
      id: row.slug,
      slug: row.slug,
      title: row.title,
      description: row.description,
      badgeText: row.badge_text,
    }));
  },

  async getProducts({ search, category, availability, maxPrice, sort = 'name-asc', page = 1, limit = 12 }) {
    const conditions = ['p.is_active = true'];
    const values = [];
    let paramIndex = 1;

    if (search) {
      conditions.push(`(p.name ILIKE $${paramIndex} OR c.title ILIKE $${paramIndex})`);
      values.push(`%${search}%`);
      paramIndex++;
    }

    if (category) {
      conditions.push(`c.slug = $${paramIndex}`);
      values.push(category);
      paramIndex++;
    }

    if (availability) {
      conditions.push(`p.availability = $${paramIndex}`);
      values.push(availability);
      paramIndex++;
    }

    if (maxPrice !== undefined && maxPrice !== null) {
      // Per Phase 4 rule: filtering by maxPrice excludes NULL prices
      conditions.push(`p.price_pkr IS NOT NULL AND p.price_pkr <= $${paramIndex}`);
      values.push(maxPrice);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Safe SQL Sort mapping (NULL prices always sorted LAST)
    let orderByClause;
    switch (sort) {
      case 'name-desc':
        orderByClause = 'ORDER BY p.name DESC';
        break;
      case 'price-asc':
        orderByClause = 'ORDER BY p.price_pkr ASC NULLS LAST, p.name ASC';
        break;
      case 'price-desc':
        orderByClause = 'ORDER BY p.price_pkr DESC NULLS LAST, p.name ASC';
        break;
      case 'name-asc':
      default:
        orderByClause = 'ORDER BY p.name ASC';
        break;
    }

    // 1. Get total count
    const countSql = `
      SELECT COUNT(*)::int AS total
      FROM products p
      JOIN categories c ON p.category_id = c.id
      ${whereClause}
    `;
    const countRes = await pool.query(countSql, values);
    const totalCount = countRes.rows[0]?.total || 0;

    // 2. Fetch paginated records
    const offset = (page - 1) * limit;
    const fetchSql = `
      SELECT p.*, c.slug AS category_slug, c.title AS category_title
      FROM products p
      JOIN categories c ON p.category_id = c.id
      ${whereClause}
      ${orderByClause}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const fetchValues = [...values, limit, offset];
    const dataRes = await pool.query(fetchSql, fetchValues);

    return {
      products: dataRes.rows.map(mapProductRow),
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit) || 1,
      },
    };
  },

  async getProductBySlug(slug) {
    const sql = `
      SELECT p.*, c.slug AS category_slug, c.title AS category_title
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.slug = $1 AND p.is_active = true
      LIMIT 1
    `;
    const result = await pool.query(sql, [slug]);
    if (result.rows.length === 0) {
      throw new AppError(`Motorcycle model '${slug}' not found.`, 404, 'NOT_FOUND');
    }
    return mapProductRow(result.rows[0]);
  },
};
