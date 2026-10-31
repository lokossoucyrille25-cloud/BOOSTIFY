import { Request, Response } from 'express';
import { ChariowService } from '../services/chariow.service.js';
import { ChariowWebhookPayload } from '../types/index.js';

export class WebhookController {
  /**
   * Endpoint de réception des notifications webhooks de Chariow.
   * Règle d'or : Le portefeuille n'est JAMAIS crédité par l'application cliente directement.
   */
  static async handleChariowWebhook(req: Request, res: Response): Promise<void> {
    try {
      const signature = req.headers['x-chariow-signature'] as string | undefined;
      const rawPayload = JSON.stringify(req.body);

      // 1. Vérification de la signature cryptographique
      const isAuthentic = ChariowService.verifyWebhookSignature(rawPayload, signature);
      if (!isAuthentic) {
        console.warn('⚠️ Tentative de webhook Chariow avec signature invalide reçue.');
        res.status(401).json({ error: 'Signature de webhook invalide.' });
        return;
      }

      const payload = req.body as ChariowWebhookPayload;

      // 2. Traitement sécurisé et idempotent
      console.log(`🔔 Webhook Chariow reçu : Événement [${payload.event}] pour réf [${payload.data?.reference}]`);
      const result = await ChariowService.processWebhookNotification(payload);

      // Réponse 200 immédiate à Chariow pour acquitter le webhook
      res.status(200).json({ received: true, result });
    } catch (err: any) {
      console.error('Erreur traitement Webhook Chariow:', err);
      // On renvoie un code 500 pour que le prestataire retente si problème serveur
      res.status(500).json({ error: 'Erreur interne lors du traitement du webhook.' });
    }
  }
}
