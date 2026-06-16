'use client';

import { useEffect } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import { useAuthStore } from '@/stores/useAuthStore';

export function AuthSync() {
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    let isActive = true;

    void supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!isActive) return;
        setUser(data.session?.user ?? null, data.session ?? null);
      })
      .catch(() => {
        if (!isActive) return;
        setUser(null, null);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null, session ?? null);
    });

    return () => {
      isActive = false;
      subscription.unsubscribe();
    };
  }, [setUser]);

  return null;
}
