import { Router } from 'express';
import { ServiceController } from '../controllers/service.controller.js';

const router = Router();

// Routes publiques pour l'application mobile
router.get('/', ServiceController.listServices);
router.get('/featured', ServiceController.getFeaturedPack);
router.get('/calculate-price', ServiceController.calculatePrice);

export default router;
