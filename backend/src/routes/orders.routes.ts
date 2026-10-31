import { Router } from 'express';
import { OrderController } from '../controllers/order.controller.js';
import { authenticateUser } from '../middlewares/auth.middleware.js';

const router = Router();

// Routes protégées par authentification
router.use(authenticateUser);

router.post('/', OrderController.createOrder);
router.get('/', OrderController.listOrders);
router.get('/:id', OrderController.getOrderDetails);
router.post('/:id/repeat', OrderController.repeatOrder);

export default router;
