import { Response } from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../config/supabase.js';
import { SmmProviderService } from '../services/smm.service.js';
import { AuthenticatedRequest } from '../types/index.js';

const createOrderSchema = z.object({
  service_id: z.string().uuid('Identifiant de service invalide.'),
  target_url: z.string().url('Veuillez fournir une URL valide vers le profil ou la publication.').min(5),
  quantity: z.number().int().positive('La quantité doit être supérieure à zéro.')
});

export class OrderController {
  /**
   * Création et débit immédiat d'une commande via le portefeuille.
   * Règle du cahier des charges : calcul temps réel, contrôle format URL, débit atomique.
   */
  static async createOrder(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const parseResult = createOrderSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({ error: parseResult.error.errors[0].message });
        return;
      }

      const { service_id, target_url, quantity } = parseResult.data;
      const userId = req.user!.id;

      // 1. Débit atomique et création en base via la fonction stockée PostgreSQL
      const { data: dbResult, error: dbError } = await supabaseAdmin.rpc('place_order_with_wallet', {
        p_user_id: userId,
        p_service_id: service_id,
        p_target_url: target_url,
        p_quantity: quantity
      });

      if (dbError) {
        res.status(400).json({ error: dbError.message });
        return;
      }

      const orderId = dbResult.order_id;

      // 2. Récupération du service pour lier au fournisseur SMM
      const { data: service } = await supabaseAdmin
        .from('services')
        .select('name, provider_service_id')
        .eq('id', service_id)
        .single();

      // 3. Transmission asynchrone au fournisseur SMM
      // On lance l'appel sans bloquer indûment le client si l'API externe est lente
      (async () => {
        try {
          const smmResult = await SmmProviderService.createOrder({
            serviceId: service?.provider_service_id || '1',
            targetUrl: target_url,
            quantity: quantity
          });

          await supabaseAdmin
            .from('orders')
            .update({
              provider_order_id: smmResult.providerOrderId,
              status: 'processing'
            })
            .eq('id', orderId);

          // Notification push de démarrage
          await supabaseAdmin.from('notifications').insert({
            user_id: userId,
            title: 'Commande en cours de traitement 🚀',
            body: `Votre commande #${orderId.slice(0, 8)} (${quantity} ${service?.name || ''}) est en cours de livraison.`,
            data: { order_id: orderId }
          });
        } catch (smmErr: any) {
          console.error(`Erreur envoi SMM commande ${orderId}:`, smmErr.message);
          await supabaseAdmin
            .from('orders')
            .update({
              error_message: smmErr.message
            })
            .eq('id', orderId);
        }
      })();

      res.status(201).json({
        success: true,
        message: 'Commande validée avec succès.',
        order: {
          id: orderId,
          amount: dbResult.amount,
          new_balance: dbResult.new_balance,
          reference: dbResult.reference,
          status: 'pending'
        }
      });
    } catch (err: any) {
      console.error('Erreur createOrder:', err);
      res.status(500).json({ error: err.message || 'Erreur lors de la validation de la commande.' });
    }
  }

  /**
   * Liste les commandes de l'utilisateur avec filtrage par statut.
   * Règle cahier des charges : Filtrable (En attente, En cours, Terminé, Partiel, Annulé).
   */
  static async listOrders(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const status = req.query.status as string;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;

      let query = supabaseAdmin
        .from('orders')
        .select(`
          id,
          target_url,
          quantity,
          amount,
          start_count,
          remains,
          delivered_quantity,
          status,
          refund_amount,
          created_at,
          services (
            id,
            name,
            network,
            category
          )
        `, { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (status && status !== 'all') {
        query = query.eq('status', status);
      }

      const { data: orders, error, count } = await query;

      if (error) {
        throw error;
      }

      res.json({
        orders: orders || [],
        total: count || 0,
        limit,
        offset
      });
    } catch (err: any) {
      console.error('Erreur listOrders:', err);
      res.status(500).json({ error: 'Erreur lors de la récupération des commandes.' });
    }
  }

  /**
   * Détail d'une commande spécifique.
   */
  static async getOrderDetails(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const { data: order, error } = await supabaseAdmin
        .from('orders')
        .select(`
          *,
          services (
            id,
            name,
            network,
            category,
            price_per_1000
          )
        `)
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (error || !order) {
        res.status(404).json({ error: 'Commande introuvable.' });
        return;
      }

      res.json({ order });
    } catch (err: any) {
      console.error('Erreur getOrderDetails:', err);
      res.status(500).json({ error: 'Erreur lors de la récupération du détail de la commande.' });
    }
  }

  /**
   * Répète une commande existante ("Recommander" dans le cahier des charges).
   */
  static async repeatOrder(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const { data: previousOrder, error } = await supabaseAdmin
        .from('orders')
        .select('service_id, target_url, quantity')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (error || !previousOrder) {
        res.status(404).json({ error: 'Commande source introuvable.' });
        return;
      }

      // Ré-exécution de la logique de création
      req.body = {
        service_id: previousOrder.service_id,
        target_url: previousOrder.target_url,
        quantity: previousOrder.quantity
      };

      await OrderController.createOrder(req, res);
    } catch (err: any) {
      console.error('Erreur repeatOrder:', err);
      res.status(500).json({ error: 'Impossible de renouveler la commande.' });
    }
  }
}
