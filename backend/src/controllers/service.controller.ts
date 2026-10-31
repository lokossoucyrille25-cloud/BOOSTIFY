import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase.js';

export class ServiceController {
  /**
   * Retourne la liste des services actifs, filtrable par réseau social.
   */
  static async listServices(req: Request, res: Response): Promise<void> {
    try {
      const network = req.query.network as string;

      let query = supabaseAdmin
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('price_per_1000', { ascending: true });

      if (network) {
        query = query.eq('network', network);
      }

      const { data: services, error } = await query;

      if (error) {
        throw error;
      }

      // Organisation par réseau pour faciliter l'affichage mobile
      const groupedByNetwork = (services || []).reduce((acc: any, service: any) => {
        if (!acc[service.network]) {
          acc[service.network] = [];
        }
        acc[service.network].push(service);
        return acc;
      }, {});

      res.json({
        services: services || [],
        grouped: groupedByNetwork
      });
    } catch (err: any) {
      console.error('Erreur listServices:', err);
      res.status(500).json({ error: 'Erreur lors de la récupération des services.' });
    }
  }

  /**
   * Retourne l'offre vedette (pack vedette en page d'accueil de l'application).
   */
  static async getFeaturedPack(req: Request, res: Response): Promise<void> {
    try {
      const { data: featured, error } = await supabaseAdmin
        .from('services')
        .select('*')
        .eq('is_featured', true)
        .eq('is_active', true)
        .limit(1)
        .single();

      if (error) {
        res.status(404).json({ error: 'Aucune offre vedette active.' });
        return;
      }

      res.json({ featured });
    } catch (err: any) {
      console.error('Erreur getFeaturedPack:', err);
      res.status(500).json({ error: 'Erreur lors de la récupération du pack vedette.' });
    }
  }

  /**
   * Simulateur de calcul de prix en temps réel pour l'UI mobile.
   * Règle cahier des charges : arrondi au franc supérieur.
   */
  static async calculatePrice(req: Request, res: Response): Promise<void> {
    try {
      const { service_id, quantity } = req.query;

      if (!service_id || !quantity) {
        res.status(400).json({ error: 'service_id et quantity sont requis.' });
        return;
      }

      const qty = parseInt(quantity as string, 10);
      if (isNaN(qty) || qty <= 0) {
        res.status(400).json({ error: 'Quantité invalide.' });
        return;
      }

      const { data: service, error } = await supabaseAdmin
        .from('services')
        .select('name, price_per_1000, min_quantity, max_quantity')
        .eq('id', service_id)
        .single();

      if (error || !service) {
        res.status(404).json({ error: 'Service introuvable.' });
        return;
      }

      const unitPrice = service.price_per_1000 / 1000.0;
      const totalAmount = Math.ceil(qty * unitPrice);

      const isValidQuantity = qty >= service.min_quantity && qty <= service.max_quantity;

      res.json({
        service_id,
        service_name: service.name,
        quantity: qty,
        unit_price: unitPrice,
        price_per_1000: service.price_per_1000,
        total_amount: totalAmount,
        currency: 'FCFA',
        is_valid_quantity: isValidQuantity,
        min_quantity: service.min_quantity,
        max_quantity: service.max_quantity
      });
    } catch (err: any) {
      console.error('Erreur calculatePrice:', err);
      res.status(500).json({ error: 'Erreur lors du calcul de prix.' });
    }
  }
}
