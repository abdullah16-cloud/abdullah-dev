import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { authenticateJwt } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiters.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { loginSchema, registerSchema, updateProfileSchema } from '../validators/auth.validator.js';

export const authRoutes = Router();

authRoutes.post('/register', authLimiter, validate(registerSchema), asyncHandler(authController.register));
authRoutes.post('/login', authLimiter, validate(loginSchema), asyncHandler(authController.login));
authRoutes.post('/logout', asyncHandler(authController.logout));
authRoutes.get('/me', authenticateJwt, asyncHandler(authController.getMe));
authRoutes.patch('/me', authenticateJwt, validate(updateProfileSchema), asyncHandler(authController.updateMe));
