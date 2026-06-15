import { NextRequest, NextResponse } from 'next/server';
import type { Place } from '@/types';
import { localSavedPlaces } from '@/lib/localSavedStore';
import { createSupabaseRouteClient } from '@/lib/supabaseServer';

type SavedPlaceRow = {
  place: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isPlace(value: unknown): value is Place {
  if (!isRecord(value)) return false;

  return (
    typeof value.id === 'string' &&
    typeof value.region_id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.address === 'string' &&
    typeof value.category === 'string' &&
    Array.isArray(value.moods) &&
    value.moods.every((mood) => typeof mood === 'string') &&
    isFiniteNumber(value.rating) &&
    isFiniteNumber(value.review_count) &&
    (typeof value.image_url === 'string' || value.image_url === null) &&
    typeof value.kakao_place_id === 'string' &&
    isFiniteNumber(value.lat) &&
    isFiniteNumber(value.lng)
  );
}

async function readJson(request: NextRequest): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

async function getSupabaseUser() {
  const supabase = createSupabaseRouteClient();
  if (!supabase) return { supabase: null, userId: null, response: null };

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      supabase,
      userId: null,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  return { supabase, userId: user.id, response: null };
}

async function getSavedPlaces(userId: string) {
  const supabase = createSupabaseRouteClient();
  if (!supabase) return [...localSavedPlaces];

  const { data, error } = await supabase
    .from('saved_places')
    .select('place')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return ((data ?? []) as SavedPlaceRow[])
    .map((row) => row.place)
    .filter(isPlace);
}

export async function GET() {
  const { supabase, userId, response } = await getSupabaseUser();
  if (!supabase) return NextResponse.json({ places: [...localSavedPlaces] });
  if (response) return response;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const places = await getSavedPlaces(userId);
    return NextResponse.json({ places });
  } catch {
    return NextResponse.json(
      { error: 'Failed to load saved places' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const body = await readJson(request);
  const place = isRecord(body) ? body.place : null;

  if (!isPlace(place)) {
    return NextResponse.json({ error: 'Invalid place' }, { status: 400 });
  }

  const { supabase, userId, response } = await getSupabaseUser();

  if (!supabase) {
    const exists = localSavedPlaces.some((savedPlace) => savedPlace.id === place.id);
    if (!exists) localSavedPlaces.unshift(place);
    return NextResponse.json({ saved: true, place }, { status: 201 });
  }

  if (response) return response;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { error } = await supabase.from('saved_places').upsert(
    {
      user_id: userId,
      place_id: place.id,
      place,
    },
    { onConflict: 'user_id,place_id' },
  );

  if (error) {
    return NextResponse.json(
      { error: 'Failed to save place' },
      { status: 500 },
    );
  }

  return NextResponse.json({ saved: true, place }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const body = await readJson(request);
  const placeId = isRecord(body) ? body.placeId : null;

  if (typeof placeId !== 'string' || placeId.length === 0) {
    return NextResponse.json({ error: 'Invalid placeId' }, { status: 400 });
  }

  const { supabase, userId, response } = await getSupabaseUser();

  if (!supabase) {
    const index = localSavedPlaces.findIndex((place) => place.id === placeId);
    if (index >= 0) localSavedPlaces.splice(index, 1);
    return NextResponse.json({ saved: false, placeId });
  }

  if (response) return response;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { error } = await supabase
    .from('saved_places')
    .delete()
    .eq('user_id', userId)
    .eq('place_id', placeId);

  if (error) {
    return NextResponse.json(
      { error: 'Failed to delete saved place' },
      { status: 500 },
    );
  }

  return NextResponse.json({ saved: false, placeId });
}
