import request from 'supertest';
import jwt from 'jsonwebtoken';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { app } from '../../src/app.js';
import { config } from '../../src/config/env.js';
import { pool } from '../../src/db/pool.js';

describe('Admin Categories API Integration Suite (/api/admin/categories)', () => {
  let adminUserId = null;
  let customerUserId = null;
  let adminCookie = '';
  let customerCookie = '';
  let createdCategoryId = null;
  const testCategorySlug = `test-cat-${Date.now()}`;

  beforeAll(async () => {
    // 1. Ensure test admin exists
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

    // 2. Ensure test customer exists
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
    if (createdCategoryId) {
      try {
        await pool.query('DELETE FROM categories WHERE id = $1', [createdCategoryId]);
      } catch (err) {
        console.error('Failed to clean up test category:', err.message);
      }
    }
  });

  describe('Security & Authorization Guards', () => {
    it('rejects unauthenticated requests to GET /api/admin/categories with 401 UNAUTHORIZED', async () => {
      const res = await request(app).get('/api/admin/categories');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('rejects customer role requests to GET /api/admin/categories with 403 FORBIDDEN', async () => {
      const res = await request(app)
        .get('/api/admin/categories')
        .set('Cookie', [customerCookie]);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('rejects unauthenticated creation requests with 401 UNAUTHORIZED', async () => {
      const res = await request(app)
        .post('/api/admin/categories')
        .send({ title: 'New Category', slug: 'new-category' });

      expect(res.status).toBe(401);
    });

    it('rejects non-admin creation requests with 403 FORBIDDEN', async () => {
      const res = await request(app)
        .post('/api/admin/categories')
        .set('Cookie', [customerCookie])
        .send({ title: 'New Category', slug: 'new-category' });

      expect(res.status).toBe(403);
    });
  });

  describe('Category Listing, Creation, Updating & Deactivation/Reactivation', () => {
    it('allows admin to list categories with product counts and active status', async () => {
      const res = await request(app)
        .get('/api/admin/categories')
        .set('Cookie', [adminCookie]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(3);

      const firstCat = res.body.data[0];
      expect(firstCat).toHaveProperty('slug');
      expect(firstCat).toHaveProperty('title');
      expect(firstCat).toHaveProperty('productCount');
      expect(typeof firstCat.productCount).toBe('number');
      expect(firstCat).toHaveProperty('isActive');
    });

    it('filters categories by search keyword', async () => {
      const res = await request(app)
        .get('/api/admin/categories?search=commuter')
        .set('Cookie', [adminCookie]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.some((c) => c.slug === 'commuter')).toBe(true);
    });

    it('validates input and rejects invalid slug formats', async () => {
      const res = await request(app)
        .post('/api/admin/categories')
        .set('Cookie', [adminCookie])
        .send({
          title: 'Electric Scooters',
          slug: 'INVALID SLUG WITH UPPERCASE',
        });

      expect([400, 422]).toContain(res.status);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('creates a new motorcycle category when admin submits valid data', async () => {
      const res = await request(app)
        .post('/api/admin/categories')
        .set('Cookie', [adminCookie])
        .send({
          title: 'Electric & Hybrid',
          slug: testCategorySlug,
          description: 'Next generation electric and hybrid mobility bikes.',
          badgeText: 'Eco Future',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.slug).toBe(testCategorySlug);
      expect(res.body.data.title).toBe('Electric & Hybrid');
      expect(res.body.data.badgeText).toBe('Eco Future');
      expect(res.body.data.isActive).toBe(true);
      expect(res.body.data.productCount).toBe(0);

      createdCategoryId = res.body.data.internalId || res.body.data.id;
      expect(createdCategoryId).toBeTruthy();
    });

    it('rejects duplicate category slug with 409 conflict', async () => {
      const res = await request(app)
        .post('/api/admin/categories')
        .set('Cookie', [adminCookie])
        .send({
          title: 'Another Category',
          slug: testCategorySlug,
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('DUPLICATE_RESOURCE');
    });

    it('updates existing category details accurately', async () => {
      expect(createdCategoryId).toBeTruthy();

      const res = await request(app)
        .patch(`/api/admin/categories/${createdCategoryId}`)
        .set('Cookie', [adminCookie])
        .send({
          title: 'Electric & Hybrid Vehicles',
          badgeText: 'Zero Emission',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Electric & Hybrid Vehicles');
      expect(res.body.data.badgeText).toBe('Zero Emission');
    });

    it('soft deactivates category and hides it from the public categories endpoint', async () => {
      expect(createdCategoryId).toBeTruthy();

      // Deactivate
      const deactRes = await request(app)
        .post(`/api/admin/categories/${createdCategoryId}/deactivate`)
        .set('Cookie', [adminCookie]);

      expect(deactRes.status).toBe(200);
      expect(deactRes.body.success).toBe(true);
      expect(deactRes.body.data.category.isActive).toBe(false);

      // Verify public categories endpoint hides this inactive category
      const publicRes = await request(app).get('/api/categories');
      expect(publicRes.status).toBe(200);
      const publicCategories = publicRes.body.data;
      const foundInPublic = publicCategories.some((c) => c.slug === testCategorySlug);
      expect(foundInPublic).toBe(false);
    });

    it('reactivates category and restores its visibility in the public catalog', async () => {
      expect(createdCategoryId).toBeTruthy();

      // Reactivate
      const reactRes = await request(app)
        .post(`/api/admin/categories/${createdCategoryId}/reactivate`)
        .set('Cookie', [adminCookie]);

      expect(reactRes.status).toBe(200);
      expect(reactRes.body.success).toBe(true);
      expect(reactRes.body.data.category.isActive).toBe(true);

      // Verify public categories endpoint now shows it
      const publicRes = await request(app).get('/api/categories');
      expect(publicRes.status).toBe(200);
      const publicCategories = publicRes.body.data;
      const foundInPublic = publicCategories.some((c) => c.slug === testCategorySlug);
      expect(foundInPublic).toBe(true);
    });
  });
});
