import { Request } from 'express';

export type UserRole = 'customer' | 'admin' | 'support' | 'accountant';
export type UserStatus = 'active' | 'suspended' | 'pending_verification';

export type SocialNetwork = 'tiktok' | 'instagram' | 'facebook' | 'discord';
export type OrderStatus = 'pending' | 'processing' | 'completed' | 'partial' | 'canceled';
export type TransactionType = 'deposit' | 'order_debit' | 'refund' | 'manual_credit' | 'manual_debit';
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'canceled';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  phone_country_code: string;
  role: UserRole;
  status: UserStatus;
  balance: number;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    phone?: string;
  };
}

export interface ChariowWebhookPayload {
  event: string; // ex: 'payment.successful', 'charge.complete'
  data: {
    reference: string; // Notre référence interne (ex: BST-DEP-...)
    transaction_id: string; // Référence Chariow
    amount: number; // Montant en FCFA
    currency: string; // XOF
    status: 'success' | 'failed';
    customer: {
      email?: string;
      phone?: string;
      name?: string;
    };
    payment_method?: string; // mtn, moov, orange, wave, card
    metadata?: Record<string, any>;
  };
}

export interface SmmCreateOrderResponse {
  order?: number | string;
  error?: string;
}

export interface SmmOrderStatusResponse {
  charge?: string;
  start_count?: string;
  status?: string; // Pending, In progress, Completed, Partial, Canceled
  remains?: string;
  currency?: string;
  error?: string;
}
