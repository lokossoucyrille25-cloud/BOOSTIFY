import { Response } from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../config/supabase.js';
import { ChariowService } from '../services/chariow.service.js';
import { AuthenticatedRequest } from '../types/index.js';

const depositSchema = z.object({
  amount: z.number().int().min(600, 'Le montant minimum de recharge est de 600 FCFA.'),
  payment_method: z.string().optional(),
  phone: z.string().optional()
});

export class WalletController {
  /**
   * Retourne les montants prédéfinis du cahier des charges et le solde actuel.
   */
  static async getWalletOverview(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;

      const { data: profile, error } = await supabaseAdmin
        .from('profiles')
        .select('balance, status')
        .eq('id', userId)
        .single();

      if (error || !profile) {
        res.status(404).json({ error: 'Profil utilisateur introuvable.' });
        return;
      }

      res.json({
        balance: profile.balance,
        currency: 'FCFA',
        suggested_packs: [
          { amount: 5000, label: '5 000 FCFA' },
          { amount: 10000, label: '10 000 FCFA', popular: true },
          { amount: 25000, label: '25 000 FCFA' }
        ],
        minimum_deposit: 600
      });
    } catch (err: any) {
      console.error('Erreur getWalletOverview:', err);
      res.status(500).json({ error: 'Erreur lors de la récupération du portefeuille.' });
    }
  }

  /**
   * Lance une nouvelle session de recharge via Chariow Mobile Money.
   */
  static async initiateDeposit(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const parseResult = depositSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({ error: parseResult.error.errors[0].message });
        return;
      }

      const { amount, payment_method, phone } = parseResult.data;
      const user = req.user!;

      // Récupération des informations complémentaires du profil
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('full_name, phone')
        .eq('id', user.id)
        .single();

      const session = await ChariowService.createDepositSession({
        userId: user.id,
        userEmail: user.email,
        userName: profile?.full_name || 'Client Boostify',
        userPhone: phone || profile?.phone || user.phone || '',
        amount,
        paymentMethod: payment_method
      });

      res.json({
        success: true,
        message: 'Session de paiement initialisée.',
        checkout_url: session.checkout_url,
        reference: session.reference,
        amount: session.amount,
        is_mock: session.is_mock
      });
    } catch (err: any) {
      console.error('Erreur initiateDeposit:', err);
      res.status(400).json({ error: err.message || 'Échec d\'initialisation du paiement.' });
    }
  }

  /**
   * Liste l'historique des transactions (recharges, débits commandes, remboursements).
   */
  static async getTransactions(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;

      const { data: transactions, error, count } = await supabaseAdmin
        .from('transactions')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw error;
      }

      res.json({
        transactions: transactions || [],
        total: count || 0,
        limit,
        offset
      });
    } catch (err: any) {
      console.error('Erreur getTransactions:', err);
      res.status(500).json({ error: 'Erreur lors de la récupération des transactions.' });
    }
  }
}
