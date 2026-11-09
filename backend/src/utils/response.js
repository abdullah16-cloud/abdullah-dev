/**
 * Standard JSON response formatting helpers.
 */

export function sendSuccess(res, data = null, statusCode = 200, meta = null) {
  const responseBody = {
    success: true,
    data,
  };

  if (meta !== null && typeof meta === 'object') {
    responseBody.meta = meta;
  }

  return res.status(statusCode).json(responseBody);
}

export function sendError(res, message, statusCode = 400, code = 'ERROR', details = []) {
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(details && details.length > 0 ? { details } : {}),
    },
  });
}
