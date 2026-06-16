import { NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase';
import { isSupabaseAdminConfigured, supabaseAdmin } from '@/lib/supabaseAdmin';
import { calcHotScore } from '@/lib/hotScore';

const AREA_MAP: Record<string, string> = {
  seongsu: '성수카페거리',
  hongdae: '홍대 관광특구',
  gangnam: '강남역',
  itaewon: '이태원 관광특구',
  yeonnam: '연남동',
};

const CONGESTION_SCORE: Record<string, number> = {
  여유: 20,
  보통: 50,
  '약간 붐빔': 70,
  붐빔: 90,
};

type SeoulPopulationStatus = {
  AREA_CONGEST_LVL?: string;
};

type SeoulPopulationResponse = {
  SeoulRtd?: {
    CITYDATA?: {
      LIVE_PPLTN_STTS?: SeoulPopulationStatus | SeoulPopulationStatus[];
    };
  };
  'SeoulRtd.citydata_ppltn'?: SeoulPopulationStatus[];
};

function getPopulationStatus(data: SeoulPopulationResponse) {
  const cityDataStatus = data['SeoulRtd.citydata_ppltn'];
  if (cityDataStatus?.length) return cityDataStatus[0];

  const status = data.SeoulRtd?.CITYDATA?.LIVE_PPLTN_STTS;
  return Array.isArray(status) ? status[0] : status;
}

function toDensityScore(level: string | undefined) {
  if (!level) return 50;
  return CONGESTION_SCORE[level] ?? 50;
}

async function fetchPopulationDensity(areaName: string): Promise<{
  areaName: string;
  congestionLevel: string | null;
  density: number;
}> {
  const key = process.env.SEOUL_API_KEY;
  if (!key) throw new Error('SEOUL_API_KEY is missing');

  const url = `http://openapi.seoul.go.kr:8088/${key}/json/citydata_ppltn/1/5/${encodeURIComponent(areaName)}`;

  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`Seoul API error: ${res.status}`);

  const data = (await res.json()) as SeoulPopulationResponse;
  const congestionLevel = getPopulationStatus(data)?.AREA_CONGEST_LVL ?? null;

  return {
    areaName,
    congestionLevel,
    density: toDensityScore(congestionLevel ?? undefined),
  };
}

function getFailureReason(result: PromiseSettledResult<unknown>) {
  if (result.status === 'fulfilled') return null;
  return result.reason instanceof Error ? result.reason.message : 'Unknown error';
}

export async function GET(request: Request) {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'CRON_SECRET is missing' }, { status: 503 });
  }

  const auth = request.headers.get('Authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.SEOUL_API_KEY) {
    return NextResponse.json({ error: 'SEOUL_API_KEY is missing' }, { status: 503 });
  }

  if (!isSupabaseConfigured) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  if (!isSupabaseAdminConfigured || !supabaseAdmin) {
    return NextResponse.json(
      { error: 'SUPABASE_SERVICE_ROLE_KEY is missing' },
      { status: 503 },
    );
  }

  const admin = supabaseAdmin;

  const results = await Promise.allSettled(
    Object.entries(AREA_MAP).map(async ([regionId, areaName]) => {
      const population = await fetchPopulationDensity(areaName);
      const updatedAt = new Date().toISOString();

      const { data: existing, error: readError } = await admin
        .from('regions')
        .select('search_volume')
        .eq('id', regionId)
        .single();

      if (readError) throw new Error(`Supabase read failed for ${regionId}: ${readError.message}`);

      const searchVolume = Number(existing?.search_volume ?? 0);
      const hotScore = calcHotScore({
        searchVolume,
        populationDensity: population.density,
      });

      const { data, error } = await admin
        .from('regions')
        .update({
          population_density: population.density,
          hot_score: hotScore,
          updated_at: updatedAt,
        })
        .eq('id', regionId)
        .select('id, hot_score, population_density, updated_at')
        .single();

      if (error) throw new Error(`Supabase update failed for ${regionId}: ${error.message}`);
      if (!data) throw new Error(`Supabase update affected no rows for ${regionId}`);

      return {
        regionId,
        ...population,
        searchVolume,
        hotScore: data.hot_score as number,
        updatedAt: data.updated_at as string,
      };
    }),
  );

  const successes = results.filter((result) => result.status === 'fulfilled');
  const failures = results
    .map((result, index) => ({
      regionId: Object.keys(AREA_MAP)[index],
      reason: getFailureReason(result),
    }))
    .filter((failure) => failure.reason);

  return NextResponse.json(
    {
      updated: successes.length,
      total: Object.keys(AREA_MAP).length,
      results: successes.map((result) => result.value),
      failures,
    },
    { status: failures.length > 0 ? 207 : 200 },
  );
}
