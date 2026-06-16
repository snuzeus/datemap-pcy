import { NextResponse } from 'next/server';
import { isSupabaseAdminConfigured, supabaseAdmin } from '@/lib/supabaseAdmin';
import { calcHotScore } from '@/lib/hotScore';
import { REGION_CATALOG } from '@/lib/regionCatalog';

export async function GET(request: Request) {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'CRON_SECRET is missing' }, { status: 503 });
  }

  const auth = request.headers.get('Authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isSupabaseAdminConfigured || !supabaseAdmin) {
    return NextResponse.json(
      { error: 'SUPABASE_SERVICE_ROLE_KEY is missing' },
      { status: 503 },
    );
  }

  const now = new Date().toISOString();
  const { data: existingRows, error: readError } = await supabaseAdmin
    .from('regions')
    .select('id, hot_score, trend_direction, place_count, image_url, search_volume, population_density')
    .in('id', REGION_CATALOG.map((region) => region.id));

  if (readError) {
    return NextResponse.json(
      { error: `Failed to read regions: ${readError.message}` },
      { status: 500 },
    );
  }

  const existingById = new Map((existingRows ?? []).map((row) => [row.id as string, row]));
  const rows = REGION_CATALOG.map((region) => {
    const existing = existingById.get(region.id);
    const searchVolume = Number(existing?.search_volume ?? region.defaultSearchVolume);
    const populationDensity = Number(existing?.population_density ?? region.defaultPopulationDensity);

    return {
      id: region.id,
      name: region.name,
      district: region.district,
      search_volume: searchVolume,
      population_density: populationDensity,
      hot_score: Number(existing?.hot_score ?? calcHotScore({ searchVolume, populationDensity })),
      trend_direction: existing?.trend_direction ?? 'stable',
      place_count: existing?.place_count ?? 0,
      image_url: existing?.image_url ?? null,
      updated_at: now,
    };
  });

  const { data, error } = await supabaseAdmin
    .from('regions')
    .upsert(rows, { onConflict: 'id', ignoreDuplicates: false })
    .select('id, name, hot_score');

  if (error) {
    return NextResponse.json(
      { error: `Failed to upsert regions: ${error.message}` },
      { status: 500 },
    );
  }

  return NextResponse.json({
    updated: data?.length ?? 0,
    total: rows.length,
    regions: data ?? [],
  });
}
