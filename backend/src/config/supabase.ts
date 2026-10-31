import { createClient } from '@supabase/supabase-js';
import { ENV } from './env.js';

if (!ENV.SUPABASE_URL || !ENV.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('⚠️ Attention: SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY est manquant. Les requêtes directes échoueront sans configuration.');
}

/**
 * Client Supabase avec privilèges Service Role (Bypass RLS pour opérations système critiques,
 * webhooks Chariow, cron jobs et administration).
 */
export const supabaseAdmin = createClient(
  ENV.SUPABASE_URL || 'https://placeholder.supabase.co',
  ENV.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  }
);

/**
 * Client Supabase agissant au nom de l'utilisateur authentifié (respecte les politiques RLS).
 */
export function createSupabaseUserClient(accessToken: string) {
  return createClient(
    ENV.SUPABASE_URL || 'https://placeholder.supabase.co',
    ENV.SUPABASE_ANON_KEY || 'placeholder-key',
    {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      },
      auth: {
        persistSession: false
      }
    }
  );
}
