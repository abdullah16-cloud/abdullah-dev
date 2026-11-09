import rateLimit from 'express-rate-limit';
import { config } from '../config/env.js';
import { sendError } from '../utils/response.js';

const rateLimitHandler = (message) => (_req, res) => {
  return sendError(res, message, 429, 'TOO_MANY_REQUESTS');
};

export const generalLimiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler('Too many requests from this IP. Please try again later.'),
});

export const authLimiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.AUTH_RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler('Too many authentication attempts. Please wait 15 minutes before trying again.'),
});

export const orderLimiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.ORDER_RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler('Too many order requests created. Please wait a few minutes before trying again.'),
});
