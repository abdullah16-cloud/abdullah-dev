/**
 * Custom Operational Application Error.
 * Operational errors are trusted errors (invalid user input, 404, 401, etc.)
 * whose messages are safe to send to the client.
 */
export class AppError extends Error {
  constructor(message, statusCode = 400, code = 'APP_ERROR', details = []) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}
