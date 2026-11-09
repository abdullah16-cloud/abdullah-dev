import { Router } from 'express';
import { adminRoutes } from './admin.routes.js';
import { authRoutes } from './auth.routes.js';
import { catalogRoutes } from './catalog.routes.js';
import { healthRoutes } from './health.routes.js';
import { ordersRoutes } from './orders.routes.js';

export const apiRouter = Router();

apiRouter.use(healthRoutes);
apiRouter.use(catalogRoutes);
apiRouter.use('/auth', authRoutes);
apiRouter.use('/orders', ordersRoutes);
apiRouter.use('/admin', adminRoutes);
