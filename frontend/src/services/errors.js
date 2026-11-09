/**
 * Custom error class for disconnected / placeholder frontend services.
 */
export class NotConnectedError extends Error {
  constructor(message = 'Account services are not connected yet.') {
    super(message);
    this.name = 'NotConnectedError';
  }
}

export class ApiError extends Error {
  constructor(message, status = 500, code = 'API_ERROR', details = []) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}
