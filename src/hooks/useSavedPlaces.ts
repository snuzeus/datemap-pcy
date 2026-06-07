'use client';

import { useQuery } from '@tanstack/react-query';
import { localSavedIds } from '@/lib/localSavedStore';

export function useSavedPlaces(userId: string | undefined) {
  return useQuery<string[]>({
    queryKey: ['saved-places', userId],
    queryFn: () => Array.from(localSavedIds),
    staleTime: 0,
    enabled: !!userId,
  });
}
