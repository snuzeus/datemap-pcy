'use client';

import { useQuery } from '@tanstack/react-query';
import type { Place, CategoryTag, MoodTag } from '@/types';

// 카카오 로컬 API 응답 형태
type KakaoPlace = {
  id: string;
  place_name: string;
  category_name: string;
  category_group_code: string;
  address_name: string;
  road_address_name: string;
  x: string;
  y: string;
  phone: string;
};

const KAKAO_CATEGORY_MAP: Record<string, CategoryTag> = {
  CE7: '카페',
  FD6: '맛집',
  MT1: '쇼핑',
  CT1: '전시/문화',
  AT4: '공원/야외',
};

function toPlace(kakao: KakaoPlace, regionId: string): Place {
  return {
    id: kakao.id,
    region_id: regionId,
    name: kakao.place_name,
    address: kakao.road_address_name || kakao.address_name,
    category: KAKAO_CATEGORY_MAP[kakao.category_group_code] ?? '이색체험',
    moods: [],
    rating: 0,
    review_count: 0,
    image_url: null,
    kakao_place_id: kakao.id,
    lat: parseFloat(kakao.y),
    lng: parseFloat(kakao.x),
  };
}

async function fetchPlaces(regionId: string): Promise<Place[]> {
  const res = await fetch(`/api/places?regionId=${regionId}`);
  if (!res.ok) throw new Error(`Failed to fetch places: ${res.status}`);
  const data: KakaoPlace[] = await res.json();
  return data.map((p) => toPlace(p, regionId));
}

const MOCK_PLACES: Record<string, Place[]> = {
  seongsu: [
    { id: 'mock-1', region_id: 'seongsu', name: '어니언 성수', address: '서울 성동구 성수동 2가', category: '카페', moods: ['힙한', '감성적인'], rating: 4.7, review_count: 2341, image_url: null, kakao_place_id: 'mock-1', lat: 37.5445, lng: 127.0557 },
    { id: 'mock-2', region_id: 'seongsu', name: '대림창고', address: '서울 성동구 성수동', category: '전시/문화', moods: ['힙한', '활동적인'], rating: 4.5, review_count: 876, image_url: null, kakao_place_id: 'mock-2', lat: 37.5438, lng: 127.0551 },
    { id: 'mock-3', region_id: 'seongsu', name: '성수연방', address: '서울 성동구 성수동 1가', category: '맛집', moods: ['힙한'], rating: 4.6, review_count: 1102, image_url: null, kakao_place_id: 'mock-3', lat: 37.5441, lng: 127.0560 },
    { id: 'mock-4', region_id: 'seongsu', name: '루프탑바 O', address: '서울 성동구 성수동', category: '바/펍', moods: ['뷰 맛집', '힙한'], rating: 4.4, review_count: 543, image_url: null, kakao_place_id: 'mock-4', lat: 37.5450, lng: 127.0565 },
    { id: 'mock-5', region_id: 'seongsu', name: '갤러리 아워', address: '서울 성동구 성수동', category: '전시/문화', moods: ['감성적인', '조용한'], rating: 4.3, review_count: 321, image_url: null, kakao_place_id: 'mock-5', lat: 37.5436, lng: 127.0548 },
    { id: 'mock-6', region_id: 'seongsu', name: '성수 공원', address: '서울 성동구 성수동', category: '공원/야외', moods: ['활동적인', '아늑한'], rating: 4.2, review_count: 198, image_url: null, kakao_place_id: 'mock-6', lat: 37.5442, lng: 127.0570 },
  ],
};

export function usePlacesByRegion(regionId: string) {
  return useQuery<Place[]>({
    queryKey: ['places', regionId],
    queryFn: async () => {
      try {
        const places = await fetchPlaces(regionId);
        return places.length > 0 ? places : (MOCK_PLACES[regionId] ?? []);
      } catch {
        return MOCK_PLACES[regionId] ?? [];
      }
    },
    staleTime: 1000 * 60 * 10,
    enabled: !!regionId,
  });
}
