import { Router } from 'express';
import { WebhookController } from '../controllers/webhook.controller.js';

const router = Router();

// Endpoint public pour recevoir les notifications serveur Chariow
router.post('/chariow', WebhookController.handleChariowWebhook);

export default router;
