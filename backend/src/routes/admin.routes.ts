import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller.js';
import { authenticateUser, requireAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

// Toutes les routes admin nécessitent authentification + rôle admin
router.use(authenticateUser);
router.use(requireAdmin);

router.get('/dashboard', AdminController.getDashboard);
router.post('/users/:userId/adjust-balance', AdminController.adjustUserBalance);
router.patch('/services/:id', AdminController.updateService);
router.post('/notifications/broadcast', AdminController.broadcastNotification);

export default router;
