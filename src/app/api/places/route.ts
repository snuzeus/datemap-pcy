import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { isSupabaseAdminConfigured, supabaseAdmin } from '@/lib/supabaseAdmin';
import { REGION_CATALOG_BY_ID } from '@/lib/regionCatalog';
import type { CategoryTag, MoodTag, Place } from '@/types';

type KakaoPlace = {
  id: string;
  place_name: string;
  category_name: string;
  category_group_code: string;
  address_name: string;
  road_address_name: string;
  x: string;
  y: string;
};

type GoogleTextSearchPlace = {
  id?: string;
};

type GooglePlaceDetails = {
  photos?: Array<{ name?: string }>;
};

const KAKAO_CATEGORY_CODES = ['CE7', 'FD6', 'CT1', 'AT4', 'MT1'] as const;
const GOOGLE_PHOTO_ENRICH_LIMIT = 12;

const REGION_MOODS: Record<string, MoodTag[]> = {
  seongsu: ['힙한', '감성적인'],
  hongdae: ['활동적인', '힙한'],
  gangnam: ['뷰 맛집', '로맨틱한'],
  itaewon: ['로맨틱한', '뷰 맛집'],
  yeonnam: ['아늑한', '감성적인'],
};

function toCategory(kakao: KakaoPlace): CategoryTag {
  const text = kakao.category_name;

  if (kakao.category_group_code === 'CE7') return '카페';
  if (kakao.category_group_code === 'MT1') return '쇼핑';
  if (kakao.category_group_code === 'CT1') return '전시/문화';
  if (kakao.category_group_code === 'AT4') return text.includes('공원') ? '공원/야외' : '이색체험';
  if (/바|펍|호프|맥주|와인|술집/.test(text)) return '바/펍';
  if (kakao.category_group_code === 'FD6') return '맛집';

  return '이색체험';
}

function toMoods(place: KakaoPlace, category: CategoryTag, regionId: string): MoodTag[] {
  const moods = new Set<MoodTag>(REGION_MOODS[regionId] ?? ['감성적인']);
  const text = `${place.place_name} ${place.category_name}`;

  if (category === '카페') moods.add('아늑한');
  if (category === '맛집') moods.add('뷰 맛집');
  if (category === '바/펍') moods.add('로맨틱한');
  if (category === '공원/야외') moods.add('활동적인');
  if (category === '전시/문화') moods.add('조용한');
  if (/루프|전망|타워|스카이|한강/.test(text)) moods.add('뷰 맛집');
  if (/공방|체험|클래스|보드/.test(text)) moods.add('활동적인');

  return Array.from(moods).slice(0, 3);
}

function toPlace(kakao: KakaoPlace, regionId: string): Place | null {
  const lat = Number.parseFloat(kakao.y);
  const lng = Number.parseFloat(kakao.x);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  const category = toCategory(kakao);

  return {
    id: kakao.id,
    region_id: regionId,
    name: kakao.place_name,
    address: kakao.road_address_name || kakao.address_name,
    category,
    moods: toMoods(kakao, category, regionId),
    rating: 0,
    review_count: 0,
    image_url: null,
    kakao_place_id: kakao.id,
    lat,
    lng,
  };
}

function hasGooglePlacesKey() {
  return !!process.env.GOOGLE_PLACES_API_KEY;
}

function photoProxyUrl(photoName: string) {
  return `/api/google-place-photo?name=${encodeURIComponent(photoName)}`;
}

async function findGooglePlaceId(place: Place): Promise<string | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return null;

  const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': 'places.id',
    },
    body: JSON.stringify({
      textQuery: `${place.name} ${place.address}`,
      languageCode: 'ko',
      locationBias: {
        circle: {
          center: { latitude: place.lat, longitude: place.lng },
          radius: 300,
        },
      },
      maxResultCount: 1,
    }),
    signal: AbortSignal.timeout(5000),
  });

  if (!response.ok) return null;

  const data = await response.json() as { places?: GoogleTextSearchPlace[] };
  return data.places?.[0]?.id ?? null;
}

async function findGooglePhotoName(googlePlaceId: string): Promise<string | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return null;

  const response = await fetch(
    `https://places.googleapis.com/v1/places/${encodeURIComponent(googlePlaceId)}?fields=photos&languageCode=ko&key=${apiKey}`,
    { signal: AbortSignal.timeout(5000) },
  );

  if (!response.ok) return null;

  const data = await response.json() as GooglePlaceDetails;
  return data.photos?.[0]?.name ?? null;
}

async function enrichPlacesWithGooglePhotos(places: Place[]): Promise<Place[]> {
  if (!hasGooglePlacesKey()) return places;

  const enriched = [...places];
  await Promise.all(
    enriched.slice(0, GOOGLE_PHOTO_ENRICH_LIMIT).map(async (place, index) => {
      try {
        const googlePlaceId = await findGooglePlaceId(place);
        if (!googlePlaceId) return;

        const photoName = await findGooglePhotoName(googlePlaceId);
        if (!photoName) return;

        enriched[index] = {
          ...place,
          image_url: photoProxyUrl(photoName),
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error(`[places] Google photo enrichment failed for ${place.id}:`, message);
      }
    }),
  );

  return enriched;
}

async function fetchCachedPlaces(regionId: string): Promise<Place[]> {
  const client = supabaseAdmin ?? supabase;
  if (!client) return [];

  const { data, error } = await client
    .from('places')
    .select('id, region_id, name, address, category, moods, rating, review_count, image_url, kakao_place_id, lat, lng')
    .eq('region_id', regionId)
    .order('updated_at', { ascending: false })
    .limit(30);

  if (error) {
    console.error('[places] Supabase cache read failed:', error.message);
    return [];
  }

  return (data ?? []) as Place[];
}

async function upsertPlaces(places: Place[]) {
  if (!isSupabaseAdminConfigured || !supabaseAdmin || places.length === 0) return;
  const regionId = places[0]?.region_id;

  const { error } = await supabaseAdmin.from('places').upsert(
    places.map((place) => ({
      ...place,
      updated_at: new Date().toISOString(),
    })),
    { onConflict: 'id' },
  );

  if (error) {
    console.error('[places] Supabase cache upsert failed:', error.message);
  }

  if (regionId) {
    const { error: regionError } = await supabaseAdmin
      .from('regions')
      .update({
        place_count: places.length,
        updated_at: new Date().toISOString(),
      })
      .eq('id', regionId);

    if (regionError) {
      console.error('[places] Region place_count update failed:', regionError.message);
    }
  }
}

async function fetchKakaoPlaces(regionId: string) {
  const coords = REGION_CATALOG_BY_ID[regionId]?.coords;
  const restKey = process.env.KAKAO_REST_API_KEY;

  if (!coords || !restKey) return [];

  const responses = await Promise.all(
    KAKAO_CATEGORY_CODES.map(async (categoryCode) => {
      const params = new URLSearchParams({
        category_group_code: categoryCode,
        x: coords.x,
        y: coords.y,
        radius: '1800',
        size: '10',
        sort: 'distance',
      });

      const response = await fetch(`https://dapi.kakao.com/v2/local/search/category.json?${params}`, {
        headers: { Authorization: `KakaoAK ${restKey}` },
        signal: AbortSignal.timeout(8000),
      });

      if (!response.ok) {
        throw new Error(`Kakao API error: ${response.status}`);
      }

      const data = await response.json() as { documents?: KakaoPlace[] };
      return data.documents ?? [];
    }),
  );

  const seen = new Set<string>();
  return responses
    .flat()
    .filter((place) => {
      if (seen.has(place.id)) return false;
      seen.add(place.id);
      return true;
    })
    .map((place) => toPlace(place, regionId))
    .filter((place): place is Place => place !== null)
    .slice(0, 30);
}

export async function GET(request: NextRequest) {
  const regionId = request.nextUrl.searchParams.get('regionId');

  if (!regionId) return NextResponse.json({ error: 'regionId required' }, { status: 400 });
  if (!REGION_CATALOG_BY_ID[regionId]) return NextResponse.json({ error: 'Unknown region' }, { status: 400 });

  try {
    const livePlaces = await fetchKakaoPlaces(regionId);
    if (livePlaces.length > 0) {
      const places = await enrichPlacesWithGooglePhotos(livePlaces);
      await upsertPlaces(places);
      return NextResponse.json(places);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[places] Kakao fetch failed:', message);
  }

  const cachedPlaces = await fetchCachedPlaces(regionId);
  return NextResponse.json(cachedPlaces);
}
