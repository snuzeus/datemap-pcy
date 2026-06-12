import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { courseStore } from '@/lib/localCourseStore';
import type { Place } from '@/types';

const REGION_NAMES: Record<string, string> = {
  seongsu: '성수동',
  hongdae: '홍대·합정',
  gangnam: '강남·청담',
  itaewon: '이태원·한남',
  yeonnam: '연남·망원',
};

function deriveTitle(places: Place[]): string {
  const counts: Record<string, number> = {};
  for (const p of places) counts[p.region_id] = (counts[p.region_id] ?? 0) + 1;
  const topRegion = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
  const name = topRegion ? (REGION_NAMES[topRegion] ?? topRegion) : '서울';
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

  courseStore.set(id, course);
  return NextResponse.json({ id, title: course.title }, { status: 201 });
}
