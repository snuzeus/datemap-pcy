'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Place } from '@/types';

export function usePlaceDetail(placeId: string, regionId?: string | null) {
  const queryClient = useQueryClient();

  return useQuery<Place | null>({
    queryKey: ['place', placeId],
    queryFn: () => {
      // regionId 있으면 해당 캐시 우선 탐색
      if (regionId) {
        const cached = queryClient.getQueryData<Place[]>(['places', regionId]);
        const found = cached?.find((p) => p.id === placeId);
        if (found) return found;
      }
      // 모든 places 캐시에서 탐색 (직접 URL 접근 대비)
      const queries = queryClient.getQueriesData<Place[]>({ queryKey: ['places'] });
      for (const [, data] of queries) {
        const found = data?.find((p) => p.id === placeId);
        if (found) return found;
      }
      return null;
    },
    staleTime: 1000 * 60 * 30,
  });
}
