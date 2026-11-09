import { AppError } from '../utils/AppError.js';

/**
 * Role-Based Access Control (RBAC) Guard Middleware.
 * Enforces that an authenticated user has one of the allowed roles.
 *
 * @param {string[]} allowedRoles - List of allowed roles, e.g. ['admin']
 */
export function requireRole(...allowedRoles) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401, 'UNAUTHORIZED'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError('Forbidden: You do not have permission to perform this action.', 403, 'FORBIDDEN')
      );
    }

    return next();
  };
}
