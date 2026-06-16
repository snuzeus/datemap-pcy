'use client';

import { useQuery } from '@tanstack/react-query';
import type { Place } from '@/types';

type PlacesResponse = Place[] | { error?: string };

async function fetchPlaces(regionId: string): Promise<Place[]> {
  const res = await fetch(`/api/places?regionId=${regionId}`, { cache: 'no-store' });
  const data = await res.json() as PlacesResponse;

  if (!res.ok) {
    const message = Array.isArray(data) ? `Failed to fetch places: ${res.status}` : data.error;
    throw new Error(message ?? `Failed to fetch places: ${res.status}`);
  }

  return Array.isArray(data) ? data : [];
}

export function usePlacesByRegion(regionId: string) {
  return useQuery<Place[]>({
    queryKey: ['places', regionId],
    queryFn: () => fetchPlaces(regionId),
    staleTime: 1000 * 60 * 10,
    enabled: !!regionId,
  });
}
