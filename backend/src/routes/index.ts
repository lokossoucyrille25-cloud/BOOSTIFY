import { Router } from 'express';
import servicesRoutes from './services.routes.js';
import walletRoutes from './wallet.routes.js';
import ordersRoutes from './orders.routes.js';
import webhooksRoutes from './webhooks.routes.js';
import adminRoutes from './admin.routes.js';

const router = Router();

router.use('/services', servicesRoutes);
router.use('/wallet', walletRoutes);
router.use('/orders', ordersRoutes);
router.use('/webhooks', webhooksRoutes);
router.use('/admin', adminRoutes);

// Route de diagnostic de santé
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Boostify API',
    time: new Date().toISOString()
  });
});

export default router;
