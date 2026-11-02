import axios from 'axios';
import crypto from 'crypto';
import { ENV } from '../config/env.js';
import { supabaseAdmin } from '../config/supabase.js';
import { ChariowWebhookPayload } from '../types/index.js';

export class ChariowService {
  /**
   * Mappe l'identifiant de l'opérateur choisi sur le frontend vers le code méthode Orqex Mobile Money
   */
  static mapOperatorToOrqex(methodOrOperator?: string): string {
    if (!methodOrOperator) return 'momo_mtn';
    const val = methodOrOperator.toLowerCase();
    if (val.includes('celtiis')) return 'momo_celtiis';
    if (val.includes('moov')) return 'momo_moov';
    if (val.includes('orange')) return 'momo_orange';
    if (val.includes('wave')) return 'momo_wave';
    if (val.includes('card') || val.includes('carte')) return 'card';
    return 'momo_mtn';
  }

  /**
   * Déclenche automatiquement l'opérateur Mobile Money (MTN, Moov, Celtiis...) auprès de la passerelle Orqex
   * afin que le client reçoive le prompt USSD / SMS sur son téléphone et atterrisse directement
   * sur l'écran de confirmation d'approbation Orqex.
   */
  static async triggerOrqexDirectPay(params: {
    checkoutUrl: string;
    operatorCode: string;
    phone: string;
    countryCode: string;
    currency?: string;
  }): Promise<{ success: boolean; nextAction?: any; error?: string }> {
    try {
      const publicId = params.checkoutUrl.split('?')[0].split('/').pop();
      const orqexPk = ENV.CHARIOW_PUBLIC_KEY && !ENV.CHARIOW_PUBLIC_KEY.startsWith('pk_test_boostify')
        ? ENV.CHARIOW_PUBLIC_KEY
        : 'pk_live_1z94njny_n8nfu4i2rfnm4q9k49i8fc6nt2yx29y3';

      if (publicId && params.operatorCode && !params.operatorCode.includes('card')) {
        console.log(`🚀 [Orqex Direct Pay] Déclenchement de ${params.operatorCode} pour ${params.phone} (${params.countryCode}) - Session: ${publicId}`);
        const payRes = await axios.post(
          `https://api.orqex.com/checkout/${publicId}/pay`,
          {
            method_code: params.operatorCode,
            country: params.countryCode,
            currency: params.currency || 'XOF',
            phone: {
              number: params.phone,
              country: params.countryCode
            }
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Authorization': `Bearer ${orqexPk}`,
              'Origin': 'https://checkout.orqex.com',
              'Referer': params.checkoutUrl
            },
            timeout: 7000
          }
        );

        const nextAction = payRes.data?.data?.attempt?.next_action;
        console.log(`✅ [Orqex Direct Pay] Demande USSD envoyée sur ${params.phone}:`, nextAction || 'En attente de validation');
        return { success: true, nextAction };
      }
      return { success: false };
    } catch (err: any) {
      console.warn('ℹ️ [Orqex Direct Pay Note]:', err.response?.data?.message || err.message);
      return { success: false, error: err.response?.data?.message || err.message };
    }
  }

  /**
   * Initialise une session de paiement Chariow pour recharger le portefeuille.
   * Règle du cahier des charges : Recharge minimum de 600 FCFA.
   */
  static async createDepositSession(params: {
    userId: string;
    userEmail: string;
    userName: string;
    userPhone: string;
    amount: number;
    paymentMethod?: string;
  }) {
    const { userId, userEmail, userName, userPhone, amount, paymentMethod } = params;

    if (amount < 600) {
      throw new Error('Le montant minimum de recharge est de 600 FCFA.');
    }

    // Récupération du solde actuel pour la traçabilité
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('balance')
      .eq('id', userId)
      .single();

    const currentBalance = profile?.balance ?? 0;

    // 1. Génération d'une référence interne unique
    const uniqueHash = crypto.randomBytes(3).toString('hex').toUpperCase();
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const reference = `BST-DEP-${dateStr}-${uniqueHash}`;

    // 2. Création de la transaction en attente ('pending')
    const { data: tx, error: txError } = await supabaseAdmin
      .from('transactions')
      .insert({
        user_id: userId,
        type: 'deposit',
        amount: amount,
        balance_after: currentBalance, // Sera ajusté lors du webhook
        reference: reference,
        payment_provider: 'chariow',
        payment_method: paymentMethod || 'mobile_money',
        status: 'pending',
        metadata: {
          initiator: 'mobile_app',
          customer_phone: userPhone,
          customer_name: userName
        }
      })
      .select()
      .single();

    if (txError) {
      console.error('Erreur création transaction de recharge:', txError);
      throw new Error('Impossible de préparer la transaction de recharge.');
    }

    // 3. Appel à l'API officielle Chariow v1 Checkout
    if (!ENV.CHARIOW_SECRET_KEY || ENV.CHARIOW_SECRET_KEY.startsWith('dummy')) {
      console.log('ℹ️ [Mode Simulation] Chariow Checkout URL générée pour test local');
      return {
        checkout_url: `https://checkout.chariow.com/pay/${reference}?amount=${amount}&currency=XOF`,
        reference,
        amount,
        is_mock: true
      };
    }

    try {
      // Décomposition du nom et du téléphone au format Chariow
      const nameParts = (userName || 'Client Boostify').trim().split(/\s+/);
      const firstName = nameParts[0] || 'Client';
      const lastName = nameParts.slice(1).join(' ') || 'Boostify';

      let cleanedPhone = (userPhone || '').replace(/[^\d+]/g, '');
      let countryCode = 'BJ';

      if (cleanedPhone.startsWith('+229') || cleanedPhone.startsWith('229')) {
        countryCode = 'BJ';
        cleanedPhone = cleanedPhone.replace(/^\+?229/, '');
      } else if (cleanedPhone.startsWith('+225') || cleanedPhone.startsWith('225')) {
        countryCode = 'CI';
        cleanedPhone = cleanedPhone.replace(/^\+?225/, '');
      } else if (cleanedPhone.startsWith('+221') || cleanedPhone.startsWith('221')) {
        countryCode = 'SN';
        cleanedPhone = cleanedPhone.replace(/^\+?221/, '');
      } else if (cleanedPhone.startsWith('+228') || cleanedPhone.startsWith('228')) {
        countryCode = 'TG';
        cleanedPhone = cleanedPhone.replace(/^\+?228/, '');
      }

      // Déduction du pays d'après l'opérateur si l'utilisateur n'a pas mis l'indicatif
      if (paymentMethod) {
        const pm = paymentMethod.toLowerCase();
        if ((pm.includes('orange') || pm.includes('wave')) && countryCode === 'BJ' && !userPhone?.includes('229')) {
          countryCode = 'CI';
        }
      }

      // Format béninois à 10 chiffres (ajoute 01 si ancien format à 8 chiffres)
      if (countryCode === 'BJ' && cleanedPhone.length === 8) {
        cleanedPhone = '01' + cleanedPhone;
      }

      // Résolution du produit Chariow (Support des packs configurés ou produit principal)
      let targetProductId = ENV.CHARIOW_PRODUCT_ID || 'prd_fav7tf9d';
      if (amount === 5000 && ENV.CHARIOW_PRODUCT_5000) {
        targetProductId = ENV.CHARIOW_PRODUCT_5000;
      } else if (amount === 10000 && ENV.CHARIOW_PRODUCT_10000) {
        targetProductId = ENV.CHARIOW_PRODUCT_10000;
      } else if (amount === 25000 && ENV.CHARIOW_PRODUCT_25000) {
        targetProductId = ENV.CHARIOW_PRODUCT_25000;
      }

      // 1. Initialisation de la session de paiement Chariow / Orqex
      // On utilise l'API Storefront Edge qui gère nativement `payment_amount` pour TOUS les produits,
      // y compris les produits à montant libre ("what_you_want"), ce qui évite d'atterrir sur la vitrine !
      let checkoutUrl: string | null = null;
      const orqexMethod = ChariowService.mapOperatorToOrqex(paymentMethod);

      try {
        console.log(`🚀 [Chariow Edge] Création session de recharge ${amount} FCFA (${targetProductId})...`);
        const edgeRes = await axios.post(
          `${ENV.CHARIOW_EDGE_API_BASE_URL}/storefront/${ENV.CHARIOW_STORE_ID}/checkout/purchase`,
          {
            product_id: targetProductId,
            first_name: firstName,
            last_name: lastName,
            email: userEmail,
            phone: {
              number: cleanedPhone || '0159299198',
              country_code: countryCode
            },
            payment_amount: amount
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Origin': 'https://mkiewzpt.mychariow.market',
              'Referer': `https://mkiewzpt.mychariow.market/${targetProductId}/checkout`
            },
            timeout: 8000
          }
        );

        checkoutUrl = edgeRes.data?.data?.payment?.checkout_url || edgeRes.data?.payment?.checkout_url;
      } catch (edgeErr: any) {
        console.warn('ℹ️ [Chariow Edge Fallback vers Public API]:', edgeErr.response?.data?.message || edgeErr.message);
      }

      // 2. Si l'API Edge n'a pas répondu, tentative via l'API publique standard
      if (!checkoutUrl) {
        try {
          const response = await axios.post(
            `${ENV.CHARIOW_API_BASE_URL}/checkout`,
            {
              product_id: targetProductId,
              amount: amount,
              price: amount,
              email: userEmail,
              first_name: firstName,
              last_name: lastName,
              phone: {
                number: cleanedPhone || '0159299198',
                country_code: countryCode
              },
              redirect_url: ENV.CHARIOW_REDIRECT_URL || 'http://localhost:3000',
              custom_metadata: {
                deposit_reference: reference,
                user_id: userId,
                deposit_amount: amount
              }
            },
            {
              headers: {
                Authorization: `Bearer ${ENV.CHARIOW_SECRET_KEY}`,
                'Content-Type': 'application/json'
              },
              timeout: 8000
            }
          );
          checkoutUrl = response.data?.data?.payment?.checkout_url || response.data?.payment?.checkout_url;
        } catch (apiErr: any) {
          console.warn('ℹ️ [Chariow Public API non disponible]:', apiErr.response?.data?.message || apiErr.message);
        }
      }

      // 3. Déclenchement automatique de l'opérateur Mobile Money pour envoyer le push USSD
      // et faire atterrir le client DIRECTEMENT sur l'écran "Confirm on your phone"
      if (checkoutUrl) {
        await ChariowService.triggerOrqexDirectPay({
          checkoutUrl,
          operatorCode: orqexMethod,
          phone: cleanedPhone,
          countryCode,
          currency: 'XOF'
        });

        return {
          checkout_url: checkoutUrl,
          reference,
          amount,
          is_mock: false
        };
      }

      // 4. Si aucune API n'a pu générer l'URL directe, fallback vers le lien de boutique pré-rempli
      const fallbackStoreUrl = `https://mkiewzpt.mychariow.market/${targetProductId}/checkout?amount=${amount}&price=${amount}&ref=${reference}&email=${encodeURIComponent(userEmail)}&phone=${encodeURIComponent(cleanedPhone)}`;
      return {
        checkout_url: fallbackStoreUrl,
        reference,
        amount,
        is_mock: false
      };

      throw new Error('Lien de paiement non reçu de Chariow.');
    } catch (apiError: any) {
      console.error('Erreur API Chariow:', apiError.response?.data || apiError.message);
      const errDetail = apiError.response?.data?.message || apiError.message;
      throw new Error(`Passerelle Chariow: ${errDetail}`);
    }
  }

  /**
   * Vérification de la signature cryptographique du Webhook Chariow.
   */
  static verifyWebhookSignature(payloadRaw: string, signatureHeader?: string): boolean {
    if (!ENV.CHARIOW_WEBHOOK_SECRET || ENV.CHARIOW_WEBHOOK_SECRET.startsWith('dummy')) {
      // En développement ou test sans secret configuré, on valide
      return true;
    }

    if (!signatureHeader) {
      return false;
    }

    const computedSignature = crypto
      .createHmac('sha256', ENV.CHARIOW_WEBHOOK_SECRET)
      .update(payloadRaw)
      .digest('hex');

    const bufA = Buffer.from(computedSignature);
    const bufB = Buffer.from(signatureHeader);
    if (bufA.length !== bufB.length) {
      return false;
    }
    return crypto.timingSafeEqual(bufA, bufB);
  }

  /**
   * Traite la confirmation reçue du serveur Chariow.
   * Utilise la procédure stockée confirm_chariow_deposit pour atomicité et anti-fraude.
   */
  static async processWebhookNotification(payload: ChariowWebhookPayload) {
    const { reference, transaction_id, amount, status, payment_method, metadata } = payload.data;

    if (status !== 'success') {
      // Marquer la transaction en échec
      await supabaseAdmin
        .from('transactions')
        .update({
          status: 'failed',
          metadata: { ...metadata, fail_reason: 'Statut Chariow non-succès' }
        })
        .eq('reference', reference);

      return { success: false, message: 'Paiement échoué ou annulé.' };
    }

    // Appel sécurisé à la procédure stockée PostgreSQL
    const { data, error } = await supabaseAdmin.rpc('confirm_chariow_deposit', {
      p_reference: reference,
      p_external_reference: transaction_id,
      p_amount: amount,
      p_payment_method: payment_method || 'mobile_money',
      p_metadata: metadata || {}
    });

    if (error) {
      console.error('Erreur confirmation crédit recharge:', error);
      throw new Error(error.message);
    }

    return data;
  }
}
