import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { pool } from '../db/pool.js';
import { AppError } from '../utils/AppError.js';

// Pre-computed dummy hash to run constant-time comparison when an email is not found,
// preventing timing-attack user enumeration.
const DUMMY_HASH = '$2a$12$e8YdC0Vz2gQhLq79e5Z07uq/J0W7Y0hU.c9gK4B6N0O2B8A0G1E2K';

export const authService = {
  /**
   * Registers a new customer account.
   *
   * Security & UX Design Decision:
   * When an email is already registered, we return a 409 Conflict with 'An account with this email already exists.'
   * Trade-off: While silent generic responses can obscure account existence, in e-commerce customer onboarding,
   * silent responses lead to high cart abandonment and confused users. A clear 409 helps users switch to login.
   */
  async register({ fullName, email, phone, password }) {
    const existingCheck = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingCheck.rows.length > 0) {
      throw new AppError('An account with this email already exists.', 409, 'EMAIL_EXISTS');
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const insertSql = `
      INSERT INTO users (full_name, email, phone, password_hash, role, is_active)
      VALUES ($1, $2, $3, $4, 'customer', true)
    `;
    const result = await pool.query(insertSql, [fullName, email, phone, passwordHash]);
    const userId = result.insertId;
    const fetchUser = await pool.query(
      'SELECT id, full_name, email, phone, role, city, shipping_address, created_at FROM users WHERE id = $1',
      [userId]
    );
    const user = fetchUser.rows[0];

    const token = jwt.sign({ sub: user.id, role: user.role }, config.JWT_SECRET, {
      expiresIn: config.JWT_EXPIRES_IN,
    });

    return {
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        city: user.city,
        shippingAddress: user.shipping_address,
      },
      token,
    };
  },

  /**
   * Authenticates user with email and password.
   * Implements constant-time password check and identical generic error messages.
   */
  async login({ email, password }) {
    const result = await pool.query(
      'SELECT id, full_name, email, phone, password_hash, role, city, shipping_address, is_active FROM users WHERE email = $1',
      [email]
    );

    const user = result.rows[0];

    if (!user) {
      // Run dummy hash to equalize response timing
      await bcrypt.compare(password, DUMMY_HASH);
      throw new AppError('Email or password is incorrect.', 401, 'INVALID_CREDENTIALS');
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      throw new AppError('Email or password is incorrect.', 401, 'INVALID_CREDENTIALS');
    }

    if (!user.is_active) {
      throw new AppError('Your account has been deactivated. Please contact support.', 401, 'ACCOUNT_DEACTIVATED');
    }

    const token = jwt.sign({ sub: user.id, role: user.role }, config.JWT_SECRET, {
      expiresIn: config.JWT_EXPIRES_IN,
    });

    return {
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        city: user.city,
        shippingAddress: user.shipping_address,
      },
      token,
    };
  },

  async updateProfile(userId, { fullName, phone, city, shippingAddress }) {
    const fields = [];
    const values = [];
    let idx = 1;

    if (fullName !== undefined) {
      fields.push(`full_name = $${idx++}`);
      values.push(fullName);
    }
    if (phone !== undefined) {
      fields.push(`phone = $${idx++}`);
      values.push(phone);
    }
    if (city !== undefined) {
      fields.push(`city = $${idx++}`);
      values.push(city);
    }
    if (shippingAddress !== undefined) {
      fields.push(`shipping_address = $${idx++}`);
      values.push(shippingAddress);
    }

    if (fields.length === 0) {
      throw new AppError('No profile fields provided to update.', 400, 'NO_DATA');
    }

    values.push(userId);
    const updateSql = `
      UPDATE users
      SET ${fields.join(', ')}
      WHERE id = $${idx} AND is_active = true
    `;

    await pool.query(updateSql, values);
    const result = await pool.query(
      'SELECT id, full_name, email, phone, role, city, shipping_address FROM users WHERE id = $1 AND is_active = true',
      [userId]
    );
    if (result.rows.length === 0) {
      throw new AppError('User not found or account is deactivated.', 404, 'NOT_FOUND');
    }

    const updated = result.rows[0];
    return {
      id: updated.id,
      fullName: updated.full_name,
      email: updated.email,
      phone: updated.phone,
      role: updated.role,
      city: updated.city,
      shippingAddress: updated.shipping_address,
    };
  },

  setAuthCookie(res, token) {
    res.cookie(config.COOKIE_NAME, token, {
      httpOnly: true,
      secure: config.COOKIE_SECURE,
      sameSite: 'lax',
      path: '/',
      maxAge: 2 * 60 * 60 * 1000, // 2 hours
    });
  },

  clearAuthCookie(res) {
    res.clearCookie(config.COOKIE_NAME, {
      httpOnly: true,
      secure: config.COOKIE_SECURE,
      sameSite: 'lax',
      path: '/',
    });
  },
};
