import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFound.js';
import { originCheck } from './middleware/originCheck.js';
import { generalLimiter } from './middleware/rateLimiters.js';
import { apiRouter } from './routes/index.js';

export function createApp() {
  const app = express();

  // 1. Security Headers & Server Identification Shielding
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );
  app.disable('x-powered-by');

  // 2. CORS (Cross-Origin Resource Sharing)
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, curl, or same-origin server-side tests)
        if (!origin) return callback(null, true);
        if (config.NODE_ENV !== 'production') {
          // Allow any local origin in development
          if (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
            return callback(null, true);
          }
        }
        const isAllowed = config.CORS_ALLOWED_ORIGINS.some(
          (allowed) => allowed === origin || allowed === origin + '/'
        );
        if (isAllowed) {
          callback(null, true);
        } else {
          callback(new Error('CORS request blocked by security policy.'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
      maxAge: 86400, // 24 hours preflight cache
    })
  );

  // 3. HTTP Request Logging (exclude in test environment to keep test output clean)
  if (config.NODE_ENV !== 'test') {
    app.use(morgan(config.NODE_ENV === 'production' ? 'combined' : 'dev'));
  }

  // 4. Request Body Parsing with Strict 20kb Limit
  app.use(express.json({ limit: '20kb' }));
  app.use(express.urlencoded({ extended: false, limit: '20kb' }));

  // 5. Cookie Parsing for httpOnly Auth Token
  app.use(cookieParser());

  // 6. Security Guards on API Routes
  app.use('/api', generalLimiter);
  app.use('/api', originCheck);

  // 7. Mount Core API Router
  app.use('/api', apiRouter);

  // 8. Error Handling & 404 Fallback
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

export const app = createApp();
