import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { calcHotScore } from '@/lib/hotScore';

const REGIONS = [
  { id: 'seongsu', name: '성수동', keyword: '성수동' },
  { id: 'hongdae', name: '홍대', keyword: '홍대' },
  { id: 'gangnam', name: '강남', keyword: '강남' },
  { id: 'itaewon', name: '이태원', keyword: '이태원' },
  { id: 'yeonnam', name: '연남동', keyword: '연남동' },
];

async function fetchSearchVolume(keyword: string): Promise<number> {
  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const res = await fetch('https://openapi.naver.com/v1/datalab/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Naver-Client-Id': process.env.NAVER_CLIENT_ID!,
      'X-Naver-Client-Secret': process.env.NAVER_CLIENT_SECRET!,
    },
    body: JSON.stringify({
      startDate,
      endDate,
      timeUnit: 'week',
      keywordGroups: [{ groupName: keyword, keywords: [keyword] }],
    }),
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) throw new Error(`Naver API error: ${res.status}`);
  const data = await res.json();
  return data.results[0]?.data[0]?.ratio ?? 0;
}

export async function GET(request: Request) {
  const auth = request.headers.get('Authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const results = await Promise.allSettled(
      REGIONS.map(async (region) => {
        const searchVolume = await fetchSearchVolume(region.keyword);

        const { data: existing } = await supabase
          .from('regions')
          .select('hot_score, population_density')
          .eq('id', region.id)
          .single();

        const populationDensity = existing?.population_density ?? 50;
        const hot_score = calcHotScore({ searchVolume, populationDensity });

        await supabase.from('regions').upsert({
          id: region.id,
          name: region.name,
          search_volume: searchVolume,
          hot_score,
          updated_at: new Date().toISOString(),
        });

        return { id: region.id, hot_score };
      })
    );

    const updated = results.filter((r) => r.status === 'fulfilled').length;
    return NextResponse.json({ updated, total: REGIONS.length });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
