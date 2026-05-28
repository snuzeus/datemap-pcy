import { NextRequest, NextResponse } from 'next/server';

const KAKAO_CATEGORY_MAP: Record<string, string> = {
  '카페': 'CE7',
  '맛집': 'FD6',
  '바/펍': 'FD6',
  '공원/야외': 'AT4',
  '전시/문화': 'CT1',
  '쇼핑': 'MT1',
  '이색체험': 'AT4',
};

const REGION_COORDS: Record<string, { x: string; y: string }> = {
  seongsu: { x: '127.0557', y: '37.5445' },
  hongdae: { x: '126.9236', y: '37.5561' },
  gangnam: { x: '127.0276', y: '37.4979' },
  itaewon: { x: '126.9946', y: '37.5348' },
  yeonnam: { x: '126.9207', y: '37.5612' },
};

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const regionId = searchParams.get('regionId');
  const category = searchParams.get('category');

  if (!regionId) return NextResponse.json({ error: 'regionId required' }, { status: 400 });

  const coords = REGION_COORDS[regionId];
  if (!coords) return NextResponse.json({ error: 'Unknown region' }, { status: 400 });

  const kakaoCategory = category ? KAKAO_CATEGORY_MAP[category] : undefined;
  const params = new URLSearchParams({
    x: coords.x,
    y: coords.y,
    radius: '1000',
    size: '15',
    sort: 'accuracy',
    ...(kakaoCategory && { category_group_code: kakaoCategory }),
  });

  const res = await fetch(`https://dapi.kakao.com/v2/local/search/category.json?${params}`, {
    headers: { Authorization: `KakaoAK ${process.env.KAKAO_REST_API_KEY}` },
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) return NextResponse.json({ error: 'Kakao API error' }, { status: res.status });

  const data = await res.json();
  return NextResponse.json(data.documents ?? []);
}
