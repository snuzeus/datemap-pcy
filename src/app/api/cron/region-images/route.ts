import { NextResponse } from 'next/server';
import { isSupabaseAdminConfigured, supabaseAdmin } from '@/lib/supabaseAdmin';
import { REGION_CATALOG } from '@/lib/regionCatalog';

type GoogleTextSearchPlace = {
  id?: string;
};

type GooglePlaceDetails = {
  photos?: Array<{ name?: string }>;
};

function photoProxyUrl(photoName: string) {
  return `/api/google-place-photo?name=${encodeURIComponent(photoName)}`;
}

async function findGooglePlaceId(query: string): Promise<string | null> {
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
      textQuery: query,
      languageCode: 'ko',
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

  if (!process.env.GOOGLE_PLACES_API_KEY) {
    return NextResponse.json({ error: 'GOOGLE_PLACES_API_KEY is missing' }, { status: 503 });
  }

  if (!isSupabaseAdminConfigured || !supabaseAdmin) {
    return NextResponse.json(
      { error: 'SUPABASE_SERVICE_ROLE_KEY is missing' },
      { status: 503 },
    );
  }

  const results = await Promise.allSettled(
    REGION_CATALOG.map(async (region) => {
      const googlePlaceId = await findGooglePlaceId(region.imageQuery);
      if (!googlePlaceId) throw new Error(`No Google place found for ${region.id}`);

      const photoName = await findGooglePhotoName(googlePlaceId);
      if (!photoName) throw new Error(`No Google photo found for ${region.id}`);

      const imageUrl = photoProxyUrl(photoName);
      const { error } = await supabaseAdmin!
        .from('regions')
        .update({
          image_url: imageUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', region.id);

      if (error) throw new Error(`Supabase update failed for ${region.id}: ${error.message}`);

      return {
        regionId: region.id,
        imageUrl,
      };
    }),
  );

  const successes = results.filter((result) => result.status === 'fulfilled');
  const failures = results
    .map((result, index) => ({
      regionId: REGION_CATALOG[index].id,
      reason: getFailureReason(result),
    }))
    .filter((failure) => failure.reason);

  return NextResponse.json(
    {
      updated: successes.length,
      total: REGION_CATALOG.length,
      results: successes.map((result) => result.value),
      failures,
    },
    { status: failures.length > 0 ? 207 : 200 },
  );
}
