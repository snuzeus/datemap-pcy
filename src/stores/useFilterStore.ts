'use client';

import { create } from 'zustand';
import type { CategoryTag, MoodTag } from '@/types';

type FilterState = {
  category: CategoryTag | null;
  mood: MoodTag[];
  setCategory: (category: CategoryTag | null) => void;
  toggleMood: (mood: MoodTag) => void;
  reset: () => void;
};

export const useFilterStore = create<FilterState>((set) => ({
  category: null,
  mood: [],
  setCategory: (category) => set({ category }),
  toggleMood: (mood) =>
    set((state) => ({
      mood: state.mood.includes(mood)
        ? state.mood.filter((m) => m !== mood)
        : [...state.mood, mood],
    })),
  reset: () => set({ category: null, mood: [] }),
}));
