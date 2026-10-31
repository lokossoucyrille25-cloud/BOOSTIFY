import { Response } from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../config/supabase.js';
import { SmmProviderService } from '../services/smm.service.js';
import { AuthenticatedRequest } from '../types/index.js';

const adjustBalanceSchema = z.object({
  amount: z.number().refine(val => val !== 0, 'Le montant ne peut pas être nul.'),
  reason: z.string().min(5, 'Le motif de l\'ajustement est obligatoire.')
});

export class AdminController {
  /**
   * Tableau de bord administrateur (CA, commandes, inscrits, recharges, échecs).
   */
  static async getDashboard(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      // 1. Chiffre d'affaires total
      const { data: revenueData } = await supabaseAdmin
        .from('orders')
        .select('amount')
        .neq('status', 'canceled');
      const totalRevenue = (revenueData || []).reduce((sum, item) => sum + parseFloat(item.amount), 0);

      // 2. Commandes du jour
      const { count: todayOrdersCount } = await supabaseAdmin
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', todayStart.toISOString());

      // 3. Nouveaux inscrits
      const { count: totalUsers } = await supabaseAdmin
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // 4. Commandes en échec
      const { count: failedOrders } = await supabaseAdmin
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'canceled');

      // 5. Total des recharges confirmées
      const { data: depositsData } = await supabaseAdmin
        .from('transactions')
        .select('amount')
        .eq('type', 'deposit')
        .eq('status', 'completed');
      const totalDeposits = (depositsData || []).reduce((sum, item) => sum + parseFloat(item.amount), 0);

      // 6. Solde chez le fournisseur SMM
      let smmBalance = { balance: 0, currency: 'USD' };
      try {
        smmBalance = await SmmProviderService.getBalance();
      } catch (e) {
        console.warn('Impossible de récupérer le solde SMM');
      }

      res.json({
        total_revenue: totalRevenue,
        today_orders: todayOrdersCount || 0,
        total_users: totalUsers || 0,
        failed_orders: failedOrders || 0,
        total_deposits: totalDeposits,
        smm_provider_balance: smmBalance.balance,
        smm_currency: smmBalance.currency,
        currency: 'FCFA'
      });
    } catch (err: any) {
      console.error('Erreur getDashboard:', err);
      res.status(500).json({ error: 'Erreur lors du calcul des statistiques du tableau de bord.' });
    }
  }

  /**
   * Crédit ou débit manuel du portefeuille utilisateur avec motif obligatoire et audit log.
   */
  static async adjustUserBalance(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const parseResult = adjustBalanceSchema.safeParse(req.body);

      if (!parseResult.success) {
        res.status(400).json({ error: parseResult.error.errors[0].message });
        return;
      }

      const { amount, reason } = parseResult.data;
      const adminId = req.user!.id;

      // Récupération de l'utilisateur
      const { data: profile, error: profileErr } = await supabaseAdmin
        .from('profiles')
        .select('balance, email, full_name')
        .eq('id', userId)
        .single();

      if (profileErr || !profile) {
        res.status(404).json({ error: 'Utilisateur introuvable.' });
        return;
      }

      const currentBalance = parseFloat(profile.balance);
      const newBalance = currentBalance + amount;

      if (newBalance < 0) {
        res.status(400).json({ error: `Impossible de débiter : le solde résultant serait négatif (${newBalance} FCFA).` });
        return;
      }

      // 1. Mise à jour du solde
      await supabaseAdmin
        .from('profiles')
        .update({ balance: newBalance })
        .eq('id', userId);

      // 2. Création de la transaction traçable
      const txType = amount > 0 ? 'manual_credit' : 'manual_debit';
      const txRef = `BST-ADJ-${Date.now()}`;
      await supabaseAdmin.from('transactions').insert({
        user_id: userId,
        type: txType,
        amount: Math.abs(amount),
        balance_after: newBalance,
        reference: txRef,
        payment_method: 'admin_adjustment',
        status: 'completed',
        metadata: {
          admin_id: adminId,
          reason
        }
      });

      // 3. Journal d'audit
      await supabaseAdmin.from('audit_logs').insert({
        actor_id: adminId,
        action: 'MANUAL_BALANCE_ADJUSTMENT',
        target_type: 'profiles',
        target_id: userId,
        details: { amount, old_balance: currentBalance, new_balance: newBalance, reason }
      });

      res.json({
        success: true,
        message: `Solde ajusté avec succès de ${amount} FCFA.`,
        new_balance: newBalance,
        reference: txRef
      });
    } catch (err: any) {
      console.error('Erreur adjustUserBalance:', err);
      res.status(500).json({ error: 'Erreur lors de l\'ajustement du solde.' });
    }
  }

  /**
   * Mise à jour d'un service (prix, statut actif/inactif, min, max).
   */
  static async updateService(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { price_per_1000, is_active, min_quantity, max_quantity, is_featured } = req.body;
      const adminId = req.user!.id;

      const updates: any = {};
      if (price_per_1000 !== undefined) updates.price_per_1000 = price_per_1000;
      if (is_active !== undefined) updates.is_active = is_active;
      if (min_quantity !== undefined) updates.min_quantity = min_quantity;
      if (max_quantity !== undefined) updates.max_quantity = max_quantity;
      if (is_featured !== undefined) updates.is_featured = is_featured;

      const { data: updatedService, error } = await supabaseAdmin
        .from('services')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        res.status(400).json({ error: error.message });
        return;
      }

      // Audit log
      await supabaseAdmin.from('audit_logs').insert({
        actor_id: adminId,
        action: 'UPDATE_SERVICE',
        target_type: 'services',
        target_id: id,
        details: updates
      });

      res.json({
        success: true,
        message: 'Service mis à jour avec succès.',
        service: updatedService
      });
    } catch (err: any) {
      console.error('Erreur updateService:', err);
      res.status(500).json({ error: 'Erreur lors de la mise à jour du service.' });
    }
  }

  /**
   * Envoi de notification push ciblée ou générale.
   */
  static async broadcastNotification(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { title, body, user_id } = req.body;

      if (!title || !body) {
        res.status(400).json({ error: 'Le titre et le corps de la notification sont requis.' });
        return;
      }

      const { data, error } = await supabaseAdmin
        .from('notifications')
        .insert({
          user_id: user_id || null, // null = broadcast global
          title,
          body,
          data: { sent_by: req.user!.id }
        })
        .select()
        .single();

      if (error) {
        res.status(400).json({ error: error.message });
        return;
      }

      res.json({
        success: true,
        message: user_id ? 'Notification individuelle envoyée.' : 'Notification globale diffusée avec succès.',
        notification: data
      });
    } catch (err: any) {
      console.error('Erreur broadcastNotification:', err);
      res.status(500).json({ error: 'Erreur lors de la diffusion de la notification.' });
    }
  }
}
