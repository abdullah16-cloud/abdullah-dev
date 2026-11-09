import { authService } from '../services/auth.service.js';
import { sendSuccess } from '../utils/response.js';

export const authController = {
  async register(req, res) {
    const { user, token } = await authService.register(req.body);
    authService.setAuthCookie(res, token);
    return sendSuccess(res, { user }, 201);
  },

  async login(req, res) {
    const { user, token } = await authService.login(req.body);
    authService.setAuthCookie(res, token);
    return sendSuccess(res, { user });
  },

  async logout(_req, res) {
    authService.clearAuthCookie(res);
    return sendSuccess(res, { message: 'Logged out successfully.' });
  },

  async getMe(req, res) {
    return sendSuccess(res, { user: req.user });
  },

  async updateMe(req, res) {
    const updatedUser = await authService.updateProfile(req.user.id, req.body);
    return sendSuccess(res, { user: updatedUser });
  },
};
