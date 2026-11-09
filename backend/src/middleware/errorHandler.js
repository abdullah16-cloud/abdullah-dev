import { AppError } from '../utils/AppError.js';
import { sendError } from '../utils/response.js';

export function errorHandler(err, req, res, _next) {
  // 1. JSON parse syntax error from express.json()
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return sendError(res, 'Malformed JSON payload provided in request body.', 400, 'INVALID_JSON');
  }

  // 2. Operational AppError (explicit, safe error from our app logic)
  if (err instanceof AppError) {
    return sendError(res, err.message, err.statusCode, err.code, err.details);
  }

  // 3. PostgreSQL Specific Error Code Mapping (safe, sanitized messages)
  if (err && err.code) {
    // Unique violation (e.g. duplicate email or slug)
    if (err.code === '23505') {
      return sendError(
        res,
        'A record with this unique identifier or email already exists.',
        409,
        'DUPLICATE_RESOURCE'
      );
    }
    // Foreign key constraint violation
    if (err.code === '23503') {
      return sendError(
        res,
        'Referenced resource does not exist or cannot be modified.',
        409,
        'FOREIGN_KEY_VIOLATION'
      );
    }
    // Check constraint violation
    if (err.code === '23514') {
      return sendError(
        res,
        'Provided data violates business integrity rules.',
        422,
        'INTEGRITY_VIOLATION'
      );
    }
    // Invalid text representation / type mismatch
    if (err.code === '22P02') {
      return sendError(
        res,
        'Invalid parameter or identifier format provided.',
        400,
        'INVALID_DATA_FORMAT'
      );
    }
  }

  // 4. Unexpected / Unknown Server Error (500)
  // Log full error details server-side only; NEVER leak stack traces or internal queries to client
  console.error('[SERVER UNHANDLED ERROR]:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
  });

  return sendError(
    res,
    'An unexpected internal server error occurred. Please try again later.',
    500,
    'INTERNAL_SERVER_ERROR'
  );
}
