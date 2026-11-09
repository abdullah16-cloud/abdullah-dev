import request from 'supertest';
import jwt from 'jsonwebtoken';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { app } from '../../src/app.js';
import { config } from '../../src/config/env.js';
import { pool } from '../../src/db/pool.js';

describe('Admin Products API Integration Suite (/api/admin/products)', () => {
  let adminUserId = null;
  let customerUserId = null;
  let adminCookie = '';
  let customerCookie = '';
  let createdProductId = null;
  const testProductSlug = `test-honda-model-${Date.now()}`;

  beforeAll(async () => {
    // 1. Ensure a test admin user exists
    const adminCheck = await pool.query(
      "SELECT id FROM users WHERE email = 'admin.integration@honda-bikes.test' LIMIT 1"
    );
    if (adminCheck.rows.length > 0) {
      adminUserId = adminCheck.rows[0].id;
    } else {
      const insertAdmin = await pool.query(
        `INSERT INTO users (email, password_hash, full_name, phone, role, is_active)
         VALUES ('admin.integration@honda-bikes.test', 'test_hash_integration', 'Admin Test User', '03001234567', 'admin', 1)`
      );
      adminUserId = insertAdmin.insertId;
    }

    // 2. Ensure a test customer user exists
    const customerCheck = await pool.query(
      "SELECT id FROM users WHERE email = 'customer.integration@honda-bikes.test' LIMIT 1"
    );
    if (customerCheck.rows.length > 0) {
      customerUserId = customerCheck.rows[0].id;
    } else {
      const insertCustomer = await pool.query(
        `INSERT INTO users (email, password_hash, full_name, phone, role, is_active)
         VALUES ('customer.integration@honda-bikes.test', 'test_hash_integration', 'Customer Test User', '03009876543', 'customer', 1)`
      );
      customerUserId = insertCustomer.insertId;
    }

    // 3. Generate signed tokens
    const adminToken = jwt.sign({ sub: adminUserId }, config.JWT_SECRET, { expiresIn: '1h' });
    adminCookie = `${config.COOKIE_NAME}=${adminToken}`;

    const customerToken = jwt.sign({ sub: customerUserId }, config.JWT_SECRET, { expiresIn: '1h' });
    customerCookie = `${config.COOKIE_NAME}=${customerToken}`;
  });

  afterAll(async () => {
    // Clean up created test product if any (without resetting seeded records)
    if (createdProductId) {
      try {
        await pool.query('DELETE FROM products WHERE id = $1', [createdProductId]);
      } catch (err) {
        console.error('Failed to clean up test product:', err.message);
      }
    }
  });

  describe('Security & Authorization Guards', () => {
    it('rejects unauthenticated requests to GET /api/admin/products with 401 UNAUTHORIZED', async () => {
      const res = await request(app).get('/api/admin/products');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('rejects customer role requests to GET /api/admin/products with 403 FORBIDDEN', async () => {
      const res = await request(app)
        .get('/api/admin/products')
        .set('Cookie', [customerCookie]);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('rejects unauthenticated creation requests with 401 UNAUTHORIZED', async () => {
      const res = await request(app)
        .post('/api/admin/products')
        .send({ name: 'Unauthorized Bike', slug: 'unauthorized-bike', categoryId: 1 });

      expect(res.status).toBe(401);
    });

    it('rejects non-admin creation requests with 403 FORBIDDEN', async () => {
      const res = await request(app)
        .post('/api/admin/products')
        .set('Cookie', [customerCookie])
        .send({ name: 'Customer Bike', slug: 'customer-bike', categoryId: 1 });

      expect(res.status).toBe(403);
    });
  });

  describe('Product Listing, Creation, Updating & Deactivation/Reactivation', () => {
    it('allows admin to list products with pagination metadata', async () => {
      const res = await request(app)
        .get('/api/admin/products')
        .set('Cookie', [adminCookie]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.meta).toBeDefined();
      expect(res.body.meta.total).toBeGreaterThanOrEqual(0);
    });

    it('validates product creation inputs and rejects invalid slugs', async () => {
      const res = await request(app)
        .post('/api/admin/products')
        .set('Cookie', [adminCookie])
        .send({
          name: 'Invalid Slug Bike',
          slug: 'INVALID SLUG WITH SPACES',
          categoryId: 1,
        });

      expect([400, 422]).toContain(res.status);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('creates a new motorcycle model when admin submits valid data', async () => {
      const res = await request(app)
        .post('/api/admin/products')
        .set('Cookie', [adminCookie])
        .send({
          name: 'Honda Test Concept 200',
          slug: testProductSlug,
          categoryId: 1,
          engineCc: 200,
          pricePkr: 450000,
          availability: 'in_stock',
          featured: false,
          trackInventory: true,
          stockQuantity: 15,
          colors: ['Red', 'Matte Black'],
          specs: { transmission: '5-speed', starter: 'Self/Kick' },
          images: ['https://example.com/honda-concept.jpg'],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.slug).toBe(testProductSlug);
      expect(res.body.data.name).toBe('Honda Test Concept 200');
      expect(res.body.data.isActive).toBe(true);

      createdProductId = res.body.data.internalId || res.body.data.id;
      expect(createdProductId).toBeTruthy();
    });

    it('updates existing product details accurately', async () => {
      expect(createdProductId).toBeTruthy();

      const res = await request(app)
        .patch(`/api/admin/products/${createdProductId}`)
        .set('Cookie', [adminCookie])
        .send({
          name: 'Honda Test Concept 200 Modified',
          pricePkr: 475000,
          availability: 'in_stock',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Honda Test Concept 200 Modified');
      expect(res.body.data.pricePkr).toBe(475000);
    });

    it('soft deactivates a product and hides it from the public catalog', async () => {
      expect(createdProductId).toBeTruthy();

      // Deactivate product
      const deactRes = await request(app)
        .post(`/api/admin/products/${createdProductId}/deactivate`)
        .set('Cookie', [adminCookie]);

      expect(deactRes.status).toBe(200);
      expect(deactRes.body.success).toBe(true);
      expect(deactRes.body.data.product.isActive).toBe(false);

      // Verify that public catalog endpoint hides this deactivated product
      const catalogRes = await request(app).get('/api/products');
      expect(catalogRes.status).toBe(200);
      const publicProducts = catalogRes.body.data;
      const foundInPublic = publicProducts.some((p) => p.slug === testProductSlug);
      expect(foundInPublic).toBe(false);
    });

    it('reactivates a product and makes it visible in public catalog again', async () => {
      expect(createdProductId).toBeTruthy();

      // Reactivate product
      const reactRes = await request(app)
        .post(`/api/admin/products/${createdProductId}/reactivate`)
        .set('Cookie', [adminCookie]);

      expect(reactRes.status).toBe(200);
      expect(reactRes.body.success).toBe(true);
      expect(reactRes.body.data.product.isActive).toBe(true);

      // Verify that public catalog now includes the product
      const catalogRes = await request(app).get('/api/products');
      expect(catalogRes.status).toBe(200);
      const publicProducts = catalogRes.body.data;
      const foundInPublic = publicProducts.some((p) => p.slug === testProductSlug);
      expect(foundInPublic).toBe(true);
    });
  });
});
