'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/useAuthStore';
import type { Place } from '@/types';

type ToggleSaveInput = {
  place: Place;
  shouldSave: boolean;
};

async function requestSaveToggle({ place, shouldSave }: ToggleSaveInput) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 10000);

  const response = await fetch('/api/saved-places', {
    method: shouldSave ? 'POST' : 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(shouldSave ? { place } : { placeId: place.id }),
    signal: controller.signal,
  }).finally(() => window.clearTimeout(timeoutId));

  if (!response.ok) {
    const data = await response.json().catch(() => null) as { error?: string } | null;
    throw new Error(data?.error ?? `Failed to ${shouldSave ? 'save' : 'delete'} place`);
  }
}

export function useSaveMutation() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: requestSaveToggle,
    onMutate: async ({ place, shouldSave }) => {
      const key = ['saved-places', user?.id];
      await queryClient.cancelQueries({ queryKey: key });
      const prev = queryClient.getQueryData<Place[]>(key) ?? [];
      const exists = prev.some((p) => p.id === place.id);
      const next = shouldSave
        ? (exists ? prev : [place, ...prev])
        : prev.filter((p) => p.id !== place.id);
      queryClient.setQueryData(key, next);
      return { prev };
    },
    onError: (_err, _variables, ctx) => {
      if (ctx?.prev !== undefined && user?.id) {
        queryClient.setQueryData(['saved-places', user.id], ctx.prev);
      }
    },
    onSettled: () => {
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: ['saved-places', user.id] });
      }
    },
  });
}
