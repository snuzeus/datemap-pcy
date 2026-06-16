'use client';

import { useQuery } from '@tanstack/react-query';
import type { Place } from '@/types';

type SavedPlacesResponse = {
  places?: Place[];
};

async function fetchSavedPlaces(): Promise<Place[]> {
  const response = await fetch('/api/saved-places', { cache: 'no-store' });

  if (!response.ok) {
    throw new Error(`Failed to fetch saved places: ${response.status}`);
  }

  const data = (await response.json()) as SavedPlacesResponse;
  return Array.isArray(data.places) ? data.places : [];
}

export function useSavedPlaces(userId: string | undefined) {
  return useQuery<Place[]>({
    queryKey: ['saved-places', userId],
    queryFn: fetchSavedPlaces,
    staleTime: 0,
    enabled: !!userId,
  });
}
