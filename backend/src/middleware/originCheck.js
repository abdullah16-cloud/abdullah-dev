import { config } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

/**
 * CSRF Protection & Origin Validation Middleware.
 * 
 * For mutating HTTP methods (POST, PUT, PATCH, DELETE), verifies that:
 * 1. The 'Origin' or 'Referer' header matches an origin in the CORS allowlist.
 * 2. If a body is sent, the Content-Type is valid application/json.
 *
 * Security Rationale:
 * Modern browsers automatically attach the true 'Origin' header on cross-site requests
 * and prevent JavaScript from spoofing it. In tandem with SameSite=Lax authentication cookies,
 * enforcing an Origin allowlist match ensures that cross-site malicious forms or scripts cannot
 * trigger authenticated state-changing actions.
 */
export function originCheck(req, _res, next) {
  const mutatingMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
  if (!mutatingMethods.includes(req.method)) {
    return next();
  }

  // 1. Content-Type check for write methods with content
  const contentLength = req.headers['content-length'];
  if (contentLength && parseInt(contentLength, 10) > 0) {
    const contentType = req.headers['content-type'];
    if (!contentType || !contentType.includes('application/json')) {
      return next(
        new AppError('Content-Type must be application/json for write requests.', 415, 'UNSUPPORTED_MEDIA_TYPE')
      );
    }
  }

  // 2. Origin / Referer check
  const origin = req.headers['origin'];
  const referer = req.headers['referer'];

  // In development, allow any localhost or 127.0.0.1 port
  if (config.NODE_ENV !== 'production') {
    if (origin && (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1'))) {
      return next();
    }
    if (referer && (referer.startsWith('http://localhost') || referer.startsWith('http://127.0.0.1'))) {
      return next();
    }
  }

  // If origin is provided, validate strictly against allowlist
  if (origin) {
    const isAllowed = config.CORS_ALLOWED_ORIGINS.some(
      (allowed) => allowed === origin || allowed === origin + '/'
    );
    if (!isAllowed) {
      return next(new AppError('Forbidden: Cross-Origin request blocked by security policy.', 403, 'CSRF_BLOCKED'));
    }
  } else if (referer) {
    try {
      const refererOrigin = new URL(referer).origin;
      const isAllowed = config.CORS_ALLOWED_ORIGINS.some(
        (allowed) => allowed === refererOrigin || allowed === refererOrigin + '/'
      );
      if (!isAllowed) {
        return next(new AppError('Forbidden: Request referer is not in the allowed origins list.', 403, 'CSRF_BLOCKED'));
      }
    } catch {
      return next(new AppError('Forbidden: Malformed referer header.', 403, 'CSRF_BLOCKED'));
    }
  } else if (config.NODE_ENV === 'production') {
    // In production browsers, mutating requests must carry Origin or Referer
    return next(new AppError('Forbidden: Missing origin header on state-changing request.', 403, 'CSRF_BLOCKED'));
  }

  return next();
}
