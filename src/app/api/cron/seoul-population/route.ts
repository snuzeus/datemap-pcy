import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const AREA_MAP: Record<string, string> = {
  seongsu: '성수1가1동',
  hongdae: '서교동',
  gangnam: '역삼1동',
  itaewon: '이태원1동',
  yeonnam: '연남동',
};

async function fetchPopulationDensity(areaName: string): Promise<number> {
  const key = process.env.SEOUL_API_KEY!;
  const url = `http://openapi.seoul.go.kr:8088/${key}/json/citydata_ppltn/1/5/${encodeURIComponent(areaName)}`;

  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`Seoul API error: ${res.status}`);

  const data = await res.json();
  const level = data.SeoulRtd?.CITYDATA?.LIVE_PPLTN_STTS?.AREA_CONGEST_LVL;

  // 혼잡도 레벨 → 0~100 변환
  const levelMap: Record<string, number> = {
    '여유': 20,
    '보통': 50,
    '약간 붐빔': 70,
    '붐빔': 90,
  };
  return levelMap[level] ?? 50;
}

export async function GET(request: Request) {
  const auth = request.headers.get('Authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!isSupabaseConfigured) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  try {
    const results = await Promise.allSettled(
      Object.entries(AREA_MAP).map(async ([regionId, areaName]) => {
        const density = await fetchPopulationDensity(areaName);
        await supabase!
          .from('regions')
          .update({ population_density: density, updated_at: new Date().toISOString() })
          .eq('id', regionId);
        return { regionId, density };
      })
    );

    const updated = results.filter((r) => r.status === 'fulfilled').length;
    return NextResponse.json({ updated, total: Object.keys(AREA_MAP).length });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
