import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import {
  isSupabaseConfigured,
  supabaseAnonKey,
  supabaseUrl,
} from '@/lib/supabase';

export function createSupabaseRouteClient() {
  if (!isSupabaseConfigured) return null;

  const cookieStore = cookies();

  return createServerClient(supabaseUrl!, supabaseAnonKey!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      },
    },
  });
}
