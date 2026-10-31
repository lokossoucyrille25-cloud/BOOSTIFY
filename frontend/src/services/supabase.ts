import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://bakyzjoysazkjukqanqs.supabase.co';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJha3l6am95c2F6a2p1a3FhbnFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMzNjA5ODMsImV4cCI6MjEwODkzNjk4M30.PsPY644ZkmO1sF_Gj-lJReixqazkJ4ryHaRLiW8xi-A';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

