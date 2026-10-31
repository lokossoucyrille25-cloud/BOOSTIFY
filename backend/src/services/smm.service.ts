import axios from 'axios';
import { ENV } from '../config/env.js';
import { SmmCreateOrderResponse, SmmOrderStatusResponse } from '../types/index.js';

export class SmmProviderService {
  /**
   * Envoie une nouvelle commande à l'API du fournisseur SMM.
   */
  static async createOrder(params: {
    serviceId: string;
    targetUrl: string;
    quantity: number;
  }): Promise<{ providerOrderId: string; rawResponse: any }> {
    const { serviceId, targetUrl, quantity } = params;

    // Mode simulation si aucune clé réelle n'est renseignée
    if (!ENV.SMM_PROVIDER_API_KEY || ENV.SMM_PROVIDER_API_KEY.startsWith('dummy')) {
      const mockId = Math.floor(100000 + Math.random() * 900000).toString();
      console.log(`ℹ️ [Mode Simulation SMM] Commande transmise avec succès (ID SMM: ${mockId}) pour ${quantity} unités sur ${targetUrl}`);
      return {
        providerOrderId: mockId,
        rawResponse: { order: mockId, simulation: true }
      };
    }

    try {
      const response = await axios.post<SmmCreateOrderResponse>(
        ENV.SMM_PROVIDER_API_URL,
        new URLSearchParams({
          key: ENV.SMM_PROVIDER_API_KEY,
          action: 'add',
          service: serviceId,
          link: targetUrl,
          quantity: quantity.toString()
        }).toString(),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }
      );

      if (response.data.error) {
        throw new Error(`Erreur API Fournisseur SMM: ${response.data.error}`);
      }

      if (!response.data.order) {
        throw new Error('Identifiant de commande non renvoyé par le fournisseur.');
      }

      return {
        providerOrderId: response.data.order.toString(),
        rawResponse: response.data
      };
    } catch (err: any) {
      console.error('Erreur transmission fournisseur SMM:', err.response?.data || err.message);
      throw new Error(`Échec d'envoi au fournisseur de livraison: ${err.message}`);
    }
  }

  /**
   * Récupère le statut en temps réel d'une commande auprès du fournisseur SMM.
   */
  static async getOrderStatus(providerOrderId: string): Promise<SmmOrderStatusResponse> {
    if (!ENV.SMM_PROVIDER_API_KEY || ENV.SMM_PROVIDER_API_KEY.startsWith('dummy')) {
      return {
        status: 'In progress',
        start_count: '150',
        remains: '0',
        currency: 'USD'
      };
    }

    try {
      const response = await axios.post<SmmOrderStatusResponse>(
        ENV.SMM_PROVIDER_API_URL,
        new URLSearchParams({
          key: ENV.SMM_PROVIDER_API_KEY,
          action: 'status',
          order: providerOrderId
        }).toString(),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }
      );

      return response.data;
    } catch (err: any) {
      console.error(`Erreur vérification statut commande SMM ${providerOrderId}:`, err.message);
      throw err;
    }
  }

  /**
   * Récupère le solde du compte chez le fournisseur SMM.
   */
  static async getBalance(): Promise<{ balance: number; currency: string }> {
    if (!ENV.SMM_PROVIDER_API_KEY || ENV.SMM_PROVIDER_API_KEY.startsWith('dummy')) {
      return { balance: 250.75, currency: 'USD' };
    }

    try {
      const response = await axios.post(
        ENV.SMM_PROVIDER_API_URL,
        new URLSearchParams({
          key: ENV.SMM_PROVIDER_API_KEY,
          action: 'balance'
        }).toString(),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }
      );

      return {
        balance: parseFloat(response.data.balance || '0'),
        currency: response.data.currency || 'USD'
      };
    } catch (err: any) {
      console.error('Erreur récupération solde fournisseur SMM:', err.message);
      throw err;
    }
  }
}
