export type SocialNetwork = 'tiktok' | 'instagram' | 'facebook' | 'discord';

export interface ServiceItem {
  id: string;
  network: SocialNetwork;
  name: string;
  category: string;
  price_per_1000: number;
  min_quantity: number;
  max_quantity: number;
  is_active: boolean;
  is_featured: boolean;
  description: string;
}

export interface OrderItem {
  id: string;
  service_id: string;
  service_name: string;
  network: SocialNetwork;
  target_url: string;
  quantity: number;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'partial' | 'canceled';
  start_count: number;
  remains: number;
  delivered_quantity: number;
  created_at: string;
}

export interface TransactionItem {
  id: string;
  type: 'deposit' | 'order_debit' | 'refund' | 'manual_credit';
  amount: number;
  balance_after: number;
  reference: string;
  payment_method?: string;
  status: 'completed' | 'pending' | 'failed';
  created_at: string;
  note?: string;
}

export interface UserWallet {
  balance: number;
  currency: string;
  full_name: string;
  email: string;
  phone: string;
}

export type AppTab = 'home' | 'order' | 'orders' | 'wallet' | 'profile' | 'policy' | 'auth';

export interface PolicyArticle {
  number: number;
  title: string;
  summary: string;
  content: string[];
}

export interface CoreRule {
  number: number;
  title: string;
  shortDescription: string;
}
