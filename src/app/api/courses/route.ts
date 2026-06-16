import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { courseStore } from '@/lib/localCourseStore';
import { createSupabaseRouteClient } from '@/lib/supabaseServer';
import { REGION_CATALOG_BY_ID } from '@/lib/regionCatalog';
import type { Place } from '@/types';

function deriveTitle(places: Place[]): string {
  const counts: Record<string, number> = {};
  for (const p of places) counts[p.region_id] = (counts[p.region_id] ?? 0) + 1;
  const topRegion = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
  const name = topRegion ? (REGION_CATALOG_BY_ID[topRegion]?.name ?? topRegion) : '서울';
  return `${name} 데이트 코스`;
}

export async function POST(request: NextRequest) {
  const body = await request.json() as { places?: Place[]; title?: string };
  const places = body.places ?? [];

  if (places.length < 2) {
    return NextResponse.json({ error: '장소를 2개 이상 선택해주세요' }, { status: 400 });
  }

  const id = randomUUID();
  const course = {
    id,
    title: body.title ?? deriveTitle(places),
    places,
    created_at: new Date().toISOString(),
  };

  const supabase = createSupabaseRouteClient();
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('courses')
      .insert({
        user_id: user?.id ?? null,
        title: course.title,
        place_ids: places.map((place) => place.id),
        places,
      })
      .select('id, title')
      .single();

    if (error) {
      return NextResponse.json(
        { error: `코스를 저장하지 못했어요: ${error.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json({ id: data.id, title: data.title }, { status: 201 });
  }

  courseStore.set(id, course);
  return NextResponse.json({ id, title: course.title }, { status: 201 });
}
