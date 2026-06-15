import { createBrowserClient } from '@supabase/ssr';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

let browserClient: SupabaseClient | null = null;

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

export function getSupabaseBrowserClient() {
  if (!isSupabaseConfigured) return null;

  if (typeof window === 'undefined') {
    return supabase;
  }

  if (!browserClient) {
    browserClient = createBrowserClient(supabaseUrl!, supabaseAnonKey!);
  }

  return browserClient;
}
