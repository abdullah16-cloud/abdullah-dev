import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { pool } from '../db/pool.js';
import { AppError } from '../utils/AppError.js';

/**
 * Authenticates requests via httpOnly JWT cookie.
 * 
 * Security Architecture:
 * 1. Reads token exclusively from httpOnly cookie. Rejects tokens in Authorization headers.
 * 2. Re-queries the database for user status on every request. This ensures that deactivated
 *    users (is_active = false) or demoted roles lose access immediately without waiting for
 *    the JWT token to expire.
 */
export async function authenticateJwt(req, _res, next) {
  const token = req.cookies && req.cookies[config.COOKIE_NAME];

  if (!token) {
    return next(new AppError('Authentication required. Please log in.', 401, 'UNAUTHORIZED'));
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);

    // Re-verify current active state from the database
    const result = await pool.query(
      'SELECT id, email, full_name, phone, role, city, shipping_address, is_active FROM users WHERE id = $1',
      [decoded.sub]
    );

    if (result.rows.length === 0) {
      return next(new AppError('User session is invalid. User account no longer exists.', 401, 'UNAUTHORIZED'));
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return next(new AppError('Your account has been deactivated. Please contact support.', 401, 'ACCOUNT_DEACTIVATED'));
    }

    req.user = {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      phone: user.phone,
      role: user.role,
      city: user.city,
      shippingAddress: user.shipping_address,
    };

    return next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Your session has expired. Please log in again.', 401, 'SESSION_EXPIRED'));
    }
    return next(new AppError('Invalid authentication token.', 401, 'INVALID_TOKEN'));
  }
}

/**
 * Optional authentication middleware.
 * If valid cookie exists, populates req.user.
 * If no cookie or invalid, leaves req.user = null and proceeds without throwing.
 */
export async function optionalAuth(req, _res, next) {
  const token = req.cookies && req.cookies[config.COOKIE_NAME];
  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    const result = await pool.query(
      'SELECT id, email, full_name, phone, role, city, shipping_address, is_active FROM users WHERE id = $1',
      [decoded.sub]
    );

    if (result.rows.length > 0 && result.rows[0].is_active) {
      const user = result.rows[0];
      req.user = {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        phone: user.phone,
        role: user.role,
        city: user.city,
        shippingAddress: user.shipping_address,
      };
    } else {
      req.user = null;
    }
  } catch {
    req.user = null;
  }

  return next();
}
