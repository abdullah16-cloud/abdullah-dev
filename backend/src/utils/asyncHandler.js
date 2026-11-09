/**
 * Wraps an async route handler or controller to automatically pass
 * any unhandled Promise rejections to Express error middleware next().
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
