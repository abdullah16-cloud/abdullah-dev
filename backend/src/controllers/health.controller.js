import { checkDatabaseHealth } from '../db/pool.js';
import { sendSuccess } from '../utils/response.js';

export const healthController = {
  async getHealth(_req, res) {
    const isDbUp = await checkDatabaseHealth();
    const statusCode = isDbUp ? 200 : 503;

    return sendSuccess(
      res,
      {
        status: isDbUp ? 'ok' : 'degraded',
        uptime: process.uptime(),
        database: isDbUp ? 'up' : 'down',
      },
      statusCode
    );
  },
};
