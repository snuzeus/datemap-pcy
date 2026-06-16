import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const photoName = request.nextUrl.searchParams.get('name');
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!photoName || !apiKey || !photoName.startsWith('places/')) {
    return new NextResponse(null, { status: 404 });
  }

  const url = new URL(`https://places.googleapis.com/v1/${photoName}/media`);
  url.searchParams.set('maxWidthPx', '480');
  url.searchParams.set('key', apiKey);

  return NextResponse.redirect(url);
}
