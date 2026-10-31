import dotenv from 'dotenv';
import path from 'path';

dotenv.config();
if (!process.env.SUPABASE_URL) {
  dotenv.config({ path: path.resolve(process.cwd(), 'backend/.env') });
}

export const ENV = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 4000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',

  CHARIOW_API_BASE_URL: process.env.CHARIOW_API_BASE_URL || 'https://api.chariow.com/v1',
  CHARIOW_EDGE_API_BASE_URL: process.env.CHARIOW_EDGE_API_BASE_URL || 'https://api-edge.chariow.com',
  CHARIOW_STORE_ID: process.env.CHARIOW_STORE_ID || 'store_fuu7ejozbr0j',
  CHARIOW_PUBLIC_KEY: process.env.CHARIOW_PUBLIC_KEY || '',
  CHARIOW_SECRET_KEY: process.env.CHARIOW_SECRET_KEY || '',
  CHARIOW_PRODUCT_ID: process.env.CHARIOW_PRODUCT_ID || 'prd_fav7tf9d',
  CHARIOW_PRODUCT_5000: process.env.CHARIOW_PRODUCT_5000 || '',
  CHARIOW_PRODUCT_10000: process.env.CHARIOW_PRODUCT_10000 || '',
  CHARIOW_PRODUCT_25000: process.env.CHARIOW_PRODUCT_25000 || '',
  CHARIOW_WEBHOOK_SECRET: process.env.CHARIOW_WEBHOOK_SECRET || '',
  CHARIOW_WEBHOOK_CALLBACK_URL: process.env.CHARIOW_WEBHOOK_CALLBACK_URL || '',
  CHARIOW_REDIRECT_URL: process.env.CHARIOW_REDIRECT_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'),

  SMM_PROVIDER_API_URL: process.env.SMM_PROVIDER_API_URL || '',
  SMM_PROVIDER_API_KEY: process.env.SMM_PROVIDER_API_KEY || '',
  SMM_MIN_BALANCE_ALERT: process.env.SMM_MIN_BALANCE_ALERT ? parseFloat(process.env.SMM_MIN_BALANCE_ALERT) : 50.0,

  CORS_ORIGIN: process.env.CORS_ORIGIN || '*'
};
