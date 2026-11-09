import { app } from './app.js';
import { config } from './config/env.js';
import { pool } from './db/pool.js';

const server = app.listen(config.PORT, () => {
  console.log(`========================================================`);
  console.log(`Honda Bikes Store API Server running on port ${config.PORT}`);
  console.log(`Environment: ${config.NODE_ENV}`);
  console.log(`Health Check: http://localhost:${config.PORT}/api/health`);
  console.log(`========================================================`);
});

/**
 * Handles graceful process shutdown (SIGINT / SIGTERM).
 * Closes the HTTP listener first, then drains the database connection pool.
 */
async function shutdown(signal) {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);

  server.close(async () => {
    console.log('HTTP server closed.');
    try {
      await pool.end();
      console.log('PostgreSQL connection pool drained.');
      process.exit(0);
    } catch (err) {
      console.error('Error draining database connection pool:', err.message);
      process.exit(1);
    }
  });

  // Force exit if graceful shutdown takes longer than 10 seconds
  setTimeout(() => {
    console.error('Forced shutdown timeout reached. Exiting immediately.');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
