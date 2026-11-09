import { AppError } from '../utils/AppError.js';

/**
 * Creates an Express middleware to validate request parameters using Zod schemas.
 *
 * @param {Object} schemas - { body, query, params }
 */
export function validate(schemas = {}) {
  return (req, _res, next) => {
    const details = [];

    // Case 1: schemas is a Zod schema object (e.g. z.object({ body, query, params }))
    if (typeof schemas?.safeParse === 'function') {
      const parsed = schemas.safeParse({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      if (!parsed.success) {
        parsed.error.issues.forEach((issue) => {
          details.push({
            field: issue.path.join('.') || 'root',
            message: issue.message,
          });
        });
      } else {
        if (parsed.data.body !== undefined) req.body = parsed.data.body;
        if (parsed.data.query !== undefined) req.query = parsed.data.query;
        if (parsed.data.params !== undefined) req.params = parsed.data.params;
      }
    } else {
      // Case 2: schemas is a plain dictionary of individual schemas { body, query, params }
      if (schemas.params) {
        const parsedParams = schemas.params.safeParse(req.params);
        if (!parsedParams.success) {
          parsedParams.error.issues.forEach((issue) => {
            details.push({
              field: issue.path.join('.') || 'param',
              message: issue.message,
            });
          });
        } else {
          req.params = parsedParams.data;
        }
      }

      if (schemas.query) {
        const parsedQuery = schemas.query.safeParse(req.query);
        if (!parsedQuery.success) {
          parsedQuery.error.issues.forEach((issue) => {
            details.push({
              field: issue.path.join('.') || 'query',
              message: issue.message,
            });
          });
        } else {
          req.query = parsedQuery.data;
        }
      }

      if (schemas.body) {
        const parsedBody = schemas.body.safeParse(req.body);
        if (!parsedBody.success) {
          parsedBody.error.issues.forEach((issue) => {
            details.push({
              field: issue.path.join('.') || 'body',
              message: issue.message,
            });
          });
        } else {
          req.body = parsedBody.data;
        }
      }
    }

    if (details.length > 0) {
      return next(new AppError('Validation failed. Please correct the highlighted errors.', 422, 'VALIDATION_ERROR', details));
    }

    return next();
  };
}
