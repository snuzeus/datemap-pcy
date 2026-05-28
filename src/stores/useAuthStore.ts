'use client';

import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';

type AuthState = {
  user: User | null;
  session: Session | null;
  setUser: (user: User | null, session: Session | null) => void;
  clearUser: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  setUser: (user, session) => set({ user, session }),
  clearUser: () => set({ user: null, session: null }),
}));
