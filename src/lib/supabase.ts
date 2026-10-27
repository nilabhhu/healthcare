import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * HealYaar Supabase Client Configuration
 *
 * Reads credentials strictly from Vite environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY).
 * Never hardcodes credentials or exposes service-role keys.
 */

const supabaseUrl: string | undefined =
  typeof import.meta !== 'undefined' && import.meta.env
    ? import.meta.env.VITE_SUPABASE_URL
    : undefined;
const supabaseAnonKey: string | undefined =
  typeof import.meta !== 'undefined' && import.meta.env
    ? import.meta.env.VITE_SUPABASE_ANON_KEY
    : undefined;

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== 'https://your-project-id.supabase.co' &&
    !supabaseUrl.includes('your-project-id') &&
    supabaseAnonKey !== 'your-anon-key-here'
  );
};

// Safe fallback for local development when credentials haven't been provided yet
const fallbackUrl = supabaseUrl || 'https://placeholder-healyaar.supabase.co';
const fallbackKey = supabaseAnonKey || 'placeholder-anon-key';

export const supabase: SupabaseClient = createClient(fallbackUrl, fallbackKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'healyaar_sb_auth_token'
  }
});

if (!isSupabaseConfigured()) {
  console.info(
    '%c[HealYaar Notice] Supabase environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) are not configured. The app will run in demo/offline-resilient mode until real credentials are provided in .env.',
    'color: #0d9488; font-weight: bold;'
  );
}
