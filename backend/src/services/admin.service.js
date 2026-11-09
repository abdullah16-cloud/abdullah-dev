import { ORDER_STATUS_TRANSITIONS } from '../config/constants.js';
import { pool } from '../db/pool.js';
import { withTransaction } from '../db/transaction.js';
import { AppError } from '../utils/AppError.js';
import { mapProductRow } from './catalog.service.js';

export function mapCategoryRow(row) {
  if (!row) return null;
  return {
    id: String(row.id),
    internalId: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    badgeText: row.badge_text,
    isActive: Boolean(row.is_active),
    productCount: Number(row.product_count || 0),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const adminService = {
  async getDashboardStats() {
    const [totalProductsRes, activeProductsRes, categoriesRes, ordersRes, customersRes] =
      await Promise.all([
        pool.query('SELECT COUNT(*) AS total FROM products'),
        pool.query('SELECT COUNT(*) AS active FROM products WHERE is_active = true'),
        pool.query('SELECT COUNT(*) AS total FROM categories'),
        pool.query('SELECT COUNT(*) AS total FROM orders'),
        pool.query("SELECT COUNT(*) AS total FROM users WHERE role = 'customer'"),
      ]);

    return {
      totalProducts: Number(totalProductsRes.rows[0]?.total || 0),
      activeProducts: Number(activeProductsRes.rows[0]?.active || 0),
      totalCategories: Number(categoriesRes.rows[0]?.total || 0),
      totalOrders: Number(ordersRes.rows[0]?.total || 0),
      totalCustomers: Number(customersRes.rows[0]?.total || 0),
    };
  },

  async listProducts({ search, category, status, page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    const conditions = [];
    const values = [];
    let idx = 1;

    if (search) {
      conditions.push(`(p.name LIKE $${idx} OR p.slug LIKE $${idx + 1})`);
      values.push(`%${search}%`, `%${search}%`);
      idx += 2;
    }

    if (category) {
      conditions.push(`c.slug = $${idx}`);
      values.push(category);
      idx++;
    }

    if (status !== undefined && status !== null && status !== '') {
      if (status === 'active') {
        conditions.push(`p.is_active = true`);
      } else if (status === 'inactive') {
        conditions.push(`p.is_active = false`);
      } else {
        conditions.push(`p.availability = $${idx}`);
        values.push(status);
        idx++;
      }
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countSql = `
      SELECT COUNT(*) AS total
      FROM products p
      JOIN categories c ON p.category_id = c.id
      ${whereClause}
    `;
    const countRes = await pool.query(countSql, values);
    const totalCount = countRes.rows[0]?.total || 0;

    const sql = `
      SELECT p.*, c.slug AS category_slug, c.title AS category_title
      FROM products p
      JOIN categories c ON p.category_id = c.id
      ${whereClause}
      ORDER BY p.id DESC
      LIMIT $${idx} OFFSET $${idx + 1}
    `;
    const result = await pool.query(sql, [...values, limit, offset]);

    return {
      products: result.rows.map(mapProductRow),
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit) || 1,
      },
    };
  },

  async getProductById(id) {
    const sql = `
      SELECT p.*, c.slug AS category_slug, c.title AS category_title
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.id = $1
      LIMIT 1
    `;
    const result = await pool.query(sql, [id]);
    if (result.rows.length === 0) {
      throw new AppError(`Product with ID ${id} not found.`, 404, 'NOT_FOUND');
    }
    return mapProductRow(result.rows[0]);
  },

  async createProduct(data) {
    let resolvedCategoryId = Number(data.categoryId);
    if (isNaN(resolvedCategoryId) || resolvedCategoryId <= 0) {
      const catLookup = await pool.query(
        'SELECT id FROM categories WHERE slug = $1 OR title = $2 LIMIT 1',
        [String(data.categoryId), String(data.categoryId)]
      );
      if (catLookup.rows.length > 0) {
        resolvedCategoryId = catLookup.rows[0].id;
      } else {
        const firstCat = await pool.query('SELECT id FROM categories ORDER BY id ASC LIMIT 1');
        resolvedCategoryId = firstCat.rows[0]?.id || 1;
      }
    }

    const insertSql = `
      INSERT INTO products (
        name, slug, category_id, engine_cc, price_pkr, availability,
        featured, track_inventory, stock_quantity, colors, specs, images,
        is_verified, source_url, last_verified, is_demo_data, is_active
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, false, true)
    `;

    const values = [
      data.name,
      data.slug,
      resolvedCategoryId,
      data.engineCc || null,
      data.pricePkr !== undefined && data.pricePkr !== null ? data.pricePkr : null,
      data.availability || 'unknown',
      Boolean(data.featured),
      Boolean(data.trackInventory),
      data.stockQuantity || 0,
      JSON.stringify(data.colors || []),
      JSON.stringify(data.specs || {}),
      JSON.stringify(data.images || []),
      Boolean(data.isVerified),
      data.sourceUrl || null,
      data.lastVerified || null,
    ];

    const result = await pool.query(insertSql, values);
    return await this.getProductById(result.insertId);
  },

  async updateProduct(id, data) {
    if (data.categoryId !== undefined) {
      let resolvedCategoryId = Number(data.categoryId);
      if (isNaN(resolvedCategoryId) || resolvedCategoryId <= 0) {
        const catLookup = await pool.query(
          'SELECT id FROM categories WHERE slug = $1 OR title = $2 LIMIT 1',
          [String(data.categoryId), String(data.categoryId)]
        );
        resolvedCategoryId = catLookup.rows[0]?.id || 1;
      }
      data.categoryId = resolvedCategoryId;
    }

    const fields = [];
    const values = [];
    let idx = 1;

    const columnMap = {
      name: 'name',
      slug: 'slug',
      categoryId: 'category_id',
      engineCc: 'engine_cc',
      pricePkr: 'price_pkr',
      availability: 'availability',
      featured: 'featured',
      trackInventory: 'track_inventory',
      stockQuantity: 'stock_quantity',
      isVerified: 'is_verified',
      sourceUrl: 'source_url',
      lastVerified: 'last_verified',
    };

    for (const [key, col] of Object.entries(columnMap)) {
      if (data[key] !== undefined) {
        fields.push(`${col} = $${idx++}`);
        values.push(data[key]);
      }
    }

    if (data.colors !== undefined) {
      fields.push(`colors = $${idx++}`);
      values.push(JSON.stringify(data.colors));
    }
    if (data.specs !== undefined) {
      fields.push(`specs = $${idx++}`);
      values.push(JSON.stringify(data.specs));
    }
    if (data.images !== undefined) {
      fields.push(`images = $${idx++}`);
      values.push(JSON.stringify(data.images));
    }

    if (fields.length === 0) {
      throw new AppError('No product fields provided to update.', 400, 'NO_DATA');
    }

    values.push(id);
    const sql = `
      UPDATE products
      SET ${fields.join(', ')}
      WHERE id = $${idx}
    `;

    await pool.query(sql, values);
    return await this.getProductById(id);
  },

  async setProductActiveState(id, isActive) {
    const sql = `
      UPDATE products
      SET is_active = $1
      WHERE id = $2
    `;
    await pool.query(sql, [isActive, id]);
    return await this.getProductById(id);
  },

  async updateInventory(id, { quantityOnHand, trackInventory }) {
    const sql = `
      UPDATE products
      SET stock_quantity = $1, track_inventory = $2
      WHERE id = $3
    `;
    await pool.query(sql, [quantityOnHand, trackInventory, id]);
    return await this.getProductById(id);
  },

  // ==========================================
  // Category Management
  // ==========================================
  async listCategories({ search, status } = {}) {
    const conditions = [];
    const values = [];
    let idx = 1;

    if (search) {
      conditions.push(`(c.title LIKE $${idx} OR c.slug LIKE $${idx + 1})`);
      values.push(`%${search}%`, `%${search}%`);
      idx += 2;
    }

    if (status !== undefined && status !== null && status !== '') {
      if (status === 'active') {
        conditions.push(`c.is_active = true`);
      } else if (status === 'inactive') {
        conditions.push(`c.is_active = false`);
      }
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const sql = `
      SELECT c.id, c.slug, c.title, c.description, c.badge_text, c.is_active, c.created_at, c.updated_at,
             COUNT(p.id) AS product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      ${whereClause}
      GROUP BY c.id, c.slug, c.title, c.description, c.badge_text, c.is_active, c.created_at, c.updated_at
      ORDER BY c.id ASC
    `;

    const result = await pool.query(sql, values);
    return result.rows.map(mapCategoryRow);
  },

  async getCategoryById(id) {
    const sql = `
      SELECT c.id, c.slug, c.title, c.description, c.badge_text, c.is_active, c.created_at, c.updated_at,
             COUNT(p.id) AS product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      WHERE c.id = $1
      GROUP BY c.id, c.slug, c.title, c.description, c.badge_text, c.is_active, c.created_at, c.updated_at
      LIMIT 1
    `;
    const result = await pool.query(sql, [id]);
    if (result.rows.length === 0) {
      throw new AppError(`Category with ID ${id} not found.`, 404, 'NOT_FOUND');
    }
    return mapCategoryRow(result.rows[0]);
  },

  async createCategory(data) {
    const existing = await pool.query('SELECT id FROM categories WHERE slug = $1 LIMIT 1', [data.slug]);
    if (existing.rows.length > 0) {
      throw new AppError('A category with this slug already exists.', 409, 'DUPLICATE_RESOURCE');
    }

    const insertSql = `
      INSERT INTO categories (title, slug, description, badge_text, is_active)
      VALUES ($1, $2, $3, $4, true)
    `;
    const values = [
      data.title,
      data.slug,
      data.description || null,
      data.badgeText || null,
    ];

    const result = await pool.query(insertSql, values);
    return await this.getCategoryById(result.insertId);
  },

  async updateCategory(id, data) {
    const current = await this.getCategoryById(id);

    if (data.slug && data.slug !== current.slug) {
      const existing = await pool.query(
        'SELECT id FROM categories WHERE slug = $1 AND id != $2 LIMIT 1',
        [data.slug, id]
      );
      if (existing.rows.length > 0) {
        throw new AppError('A category with this slug already exists.', 409, 'DUPLICATE_RESOURCE');
      }
    }

    const fields = [];
    const values = [];
    let idx = 1;

    if (data.title !== undefined) {
      fields.push(`title = $${idx++}`);
      values.push(data.title);
    }
    if (data.slug !== undefined) {
      fields.push(`slug = $${idx++}`);
      values.push(data.slug);
    }
    if (data.description !== undefined) {
      fields.push(`description = $${idx++}`);
      values.push(data.description);
    }
    if (data.badgeText !== undefined) {
      fields.push(`badge_text = $${idx++}`);
      values.push(data.badgeText);
    }

    if (fields.length === 0) {
      throw new AppError('No category fields provided to update.', 400, 'NO_DATA');
    }

    values.push(id);
    const sql = `
      UPDATE categories
      SET ${fields.join(', ')}
      WHERE id = $${idx}
    `;

    await pool.query(sql, values);
    return await this.getCategoryById(id);
  },

  async setCategoryActiveState(id, isActive) {
    await this.getCategoryById(id);
    const sql = `
      UPDATE categories
      SET is_active = $1
      WHERE id = $2
    `;
    await pool.query(sql, [isActive, id]);
    return await this.getCategoryById(id);
  },

  async listOrders({ search, status, page = 1, limit = 20 } = {}) {
    const offset = (page - 1) * limit;
    const conditions = [];
    const values = [];
    let idx = 1;

    if (search) {
      conditions.push(`(order_number LIKE $${idx} OR customer_name LIKE $${idx + 1} OR customer_email LIKE $${idx + 2} OR customer_phone LIKE $${idx + 3} OR shipping_city LIKE $${idx + 4})`);
      values.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
      idx += 5;
    }

    if (status) {
      conditions.push(`status = $${idx++}`);
      values.push(status);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countSql = `SELECT COUNT(*)::int AS total FROM orders ${whereClause}`;
    const countRes = await pool.query(countSql, values);
    const totalCount = countRes.rows[0]?.total || 0;

    const sql = `
      SELECT id, order_number, user_id, customer_name, customer_email, customer_phone,
             shipping_city, shipping_address, payment_method, status,
             subtotal_pkr, delivery_fee_pkr, total_pkr, created_at
      FROM orders
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${idx} OFFSET $${idx + 1}
    `;

    const result = await pool.query(sql, [...values, limit, offset]);

    return {
      orders: result.rows.map((r) => ({
        id: String(r.id),
        orderNumber: r.order_number,
        userId: r.user_id ? String(r.user_id) : null,
        customerName: r.customer_name,
        customerEmail: r.customer_email,
        customerPhone: r.customer_phone,
        shippingCity: r.shipping_city,
        shippingAddress: r.shipping_address,
        paymentMethod: r.payment_method,
        status: r.status,
        subtotalPkr: r.subtotal_pkr !== null ? parseFloat(r.subtotal_pkr) : null,
        deliveryFeePkr: r.delivery_fee_pkr !== null ? parseFloat(r.delivery_fee_pkr) : null,
        totalPkr: r.total_pkr !== null ? parseFloat(r.total_pkr) : null,
        createdAt: r.created_at,
      })),
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit) || 1,
      },
    };
  },

  async getOrderByNumber(orderNumber) {
    const orderSql = `
      SELECT id, order_number, user_id, customer_name, customer_email, customer_phone,
             shipping_city, shipping_address, payment_method, status,
             subtotal_pkr, delivery_fee_pkr, total_pkr, customer_notes, created_at
      FROM orders
      WHERE order_number = $1
      LIMIT 1
    `;
    const result = await pool.query(orderSql, [orderNumber]);
    const order = result.rows[0];

    if (!order) {
      throw new AppError(`Order #${orderNumber} not found.`, 404, 'NOT_FOUND');
    }

    const itemsRes = await pool.query(
      `SELECT product_name, product_slug, selected_color, unit_price_pkr, quantity, line_total_pkr
       FROM order_items WHERE order_id = $1`,
      [order.id]
    );

    const historyRes = await pool.query(
      `SELECT status, notes, created_at FROM order_status_history WHERE order_id = $1 ORDER BY created_at ASC`,
      [order.id]
    );

    return {
      orderNumber: order.order_number,
      status: order.status,
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      customerPhone: order.customer_phone,
      shippingCity: order.shipping_city,
      shippingAddress: order.shipping_address,
      paymentMethod: order.payment_method,
      subtotalPkr: order.subtotal_pkr !== null ? parseFloat(order.subtotal_pkr) : null,
      deliveryFeePkr: order.delivery_fee_pkr !== null ? parseFloat(order.delivery_fee_pkr) : null,
      totalPkr: order.total_pkr !== null ? parseFloat(order.total_pkr) : null,
      customerNotes: order.customer_notes,
      createdAt: order.created_at,
      items: itemsRes.rows.map((r) => ({
        productName: r.product_name,
        productSlug: r.product_slug,
        selectedColor: r.selected_color,
        unitPricePkr: r.unit_price_pkr !== null ? parseFloat(r.unit_price_pkr) : null,
        quantity: r.quantity,
        lineTotalPkr: r.line_total_pkr !== null ? parseFloat(r.line_total_pkr) : null,
      })),
      history: historyRes.rows.map((h) => ({
        status: h.status,
        notes: h.notes,
        createdAt: h.created_at,
      })),
    };
  },

  async updateOrderStatus(orderNumber, { toStatus, notes, adminName = 'Admin' }) {
    return await withTransaction(async (client) => {
      const orderRes = await client.query(
        'SELECT id, status FROM orders WHERE order_number = $1 FOR UPDATE',
        [orderNumber]
      );

      const order = orderRes.rows[0];
      if (!order) {
        throw new AppError(`Order #${orderNumber} not found.`, 404, 'NOT_FOUND');
      }

      const currentStatus = order.status;
      const allowedTransitions = ORDER_STATUS_TRANSITIONS[currentStatus] || [];

      if (!allowedTransitions.includes(toStatus)) {
        throw new AppError(
          `Cannot transition order from '${currentStatus}' to '${toStatus}'. Allowed transitions: ${allowedTransitions.length > 0 ? allowedTransitions.join(', ') : 'None (Terminal state)'}`,
          422,
          'INVALID_STATUS_TRANSITION',
          [{ field: 'toStatus', message: `Allowed transitions: ${allowedTransitions.join(', ')}` }]
        );
      }

      await client.query('UPDATE orders SET status = $1 WHERE id = $2', [toStatus, order.id]);

      const noteText = notes ? `Status changed by ${adminName}: ${notes}` : `Status changed by ${adminName}`;
      await client.query(
        'INSERT INTO order_status_history (order_id, status, notes) VALUES ($1, $2, $3)',
        [order.id, toStatus, noteText]
      );

      return {
        orderNumber,
        previousStatus: currentStatus,
        status: toStatus,
        updatedAt: new Date().toISOString(),
      };
    });
  },

  // ==========================================
  // Customer Management
  // ==========================================
  async listCustomers({ search, status, page = 1, limit = 20 } = {}) {
    const offset = (page - 1) * limit;
    const conditions = [];
    const values = [];
    let idx = 1;

    if (search) {
      conditions.push(`(u.full_name LIKE $${idx} OR u.email LIKE $${idx + 1} OR u.phone LIKE $${idx + 2} OR u.city LIKE $${idx + 3})`);
      values.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
      idx += 4;
    }

    if (status === 'active') {
      conditions.push(`u.is_active = true`);
    } else if (status === 'inactive') {
      conditions.push(`u.is_active = false`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countSql = `SELECT COUNT(*) AS total FROM users u ${whereClause}`;
    const countRes = await pool.query(countSql, values);
    const total = Number(countRes.rows[0]?.total || 0);

    const sql = `
      SELECT u.id, u.email, u.full_name, u.phone, u.role, u.city, u.shipping_address, u.is_active, u.created_at,
             COUNT(o.id) AS order_count,
             COALESCE(SUM(o.total_pkr), 0) AS total_spent
      FROM users u
      LEFT JOIN orders o ON o.user_id = u.id
      ${whereClause}
      GROUP BY u.id, u.email, u.full_name, u.phone, u.role, u.city, u.shipping_address, u.is_active, u.created_at
      ORDER BY u.id DESC
      LIMIT $${idx} OFFSET $${idx + 1}
    `;
    const result = await pool.query(sql, [...values, limit, offset]);

    return {
      customers: result.rows.map((row) => ({
        id: row.id,
        email: row.email,
        fullName: row.full_name,
        phone: row.phone,
        role: row.role,
        city: row.city,
        shippingAddress: row.shipping_address,
        isActive: Boolean(row.is_active),
        createdAt: row.created_at,
        orderCount: Number(row.order_count || 0),
        totalSpent: parseFloat(row.total_spent || 0),
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  },

  async setCustomerActiveState(id, isActive) {
    await pool.query('UPDATE users SET is_active = $1 WHERE id = $2', [isActive, id]);
    const res = await pool.query('SELECT id, email, full_name, role, is_active FROM users WHERE id = $1', [id]);
    if (res.rows.length === 0) {
      throw new AppError(`User with ID ${id} not found.`, 404, 'NOT_FOUND');
    }
    return res.rows[0];
  },
};
