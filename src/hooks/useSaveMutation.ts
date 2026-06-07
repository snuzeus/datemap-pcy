'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/useAuthStore';
import { localSavedIds } from '@/lib/localSavedStore';

export function useSaveMutation() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: async (placeId: string) => {
      if (localSavedIds.has(placeId)) {
        localSavedIds.delete(placeId);
      } else {
        localSavedIds.add(placeId);
      }
      return Array.from(localSavedIds);
    },
    onMutate: async (placeId) => {
      const key = ['saved-places', user?.id];
      await queryClient.cancelQueries({ queryKey: key });
      const prev = queryClient.getQueryData<string[]>(key) ?? [];
      const next = prev.includes(placeId)
        ? prev.filter((id) => id !== placeId)
        : [...prev, placeId];
      queryClient.setQueryData(key, next);
      return { prev };
    },
    onError: (_err, _placeId, ctx) => {
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
