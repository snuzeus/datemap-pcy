'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Region } from '@/types';

async function fetchRegions(): Promise<Region[]> {
  const { data, error } = await supabase
    .from('regions')
    .select('*')
    .order('hot_score', { ascending: false })
    .limit(10);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export function useRegionRanking() {
  return useQuery<Region[]>({
    queryKey: ['regions'],
    queryFn: fetchRegions,
    staleTime: 1000 * 60 * 5,
  });
}
