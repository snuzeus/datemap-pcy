'use client';

import Link from 'next/link';
import { useRegionRanking } from '@/hooks/useRegionRanking';
import {
  RegionBigCard,
  RegionSubCard,
  RegionBigCardSkeleton,
  RegionSubCardSkeleton,
} from '@/components/RegionCard';
import type { Region } from '@/types';

const MOCK_REGIONS: Region[] = [
  { id: 'seongsu', name: '성수동', district: '서울 성동구', hot_score: 94.2, trend_direction: 'up', place_count: 142, image_url: null, updated_at: '' },
  { id: 'hongdae', name: '홍대·합정', district: '서울 마포구', hot_score: 88.7, trend_direction: 'stable', place_count: 218, image_url: null, updated_at: '' },
  { id: 'gangnam', name: '강남·청담', district: '서울 강남구', hot_score: 82.1, trend_direction: 'stable', place_count: 189, image_url: null, updated_at: '' },
  { id: 'itaewon', name: '이태원·한남', district: '서울 용산구', hot_score: 76.5, trend_direction: 'up', place_count: 97, image_url: null, updated_at: '' },
  { id: 'yeonnam', name: '연남·망원', district: '서울 마포구', hot_score: 71.3, trend_direction: 'down', place_count: 83, image_url: null, updated_at: '' },
];

export default function HomePage() {
  const { data, isLoading, isError } = useRegionRanking();

  // Supabase 미연결 시 mock 데이터 fallback
  const regions = data && data.length > 0 ? data : MOCK_REGIONS;
  const [top, ...rest] = regions;

  return (
    <div className="flex flex-col min-h-screen max-w-sm mx-auto bg-white">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-5 pt-6 pb-1">
        <div>
          <p className="text-[10px] font-medium text-gray-300 tracking-[0.2em] uppercase">Discover</p>
          <h1 className="text-[22px] font-black text-gray-900 tracking-tight leading-none mt-0.5">답정너</h1>
        </div>
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <div className="px-5 pb-4 mt-1">
        <p className="text-[13px] text-gray-400 leading-snug">
          실시간 데이터로 뽑은<br />
          <span className="text-gray-800 font-semibold">오늘의 핫플 지역</span>
        </p>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-24">

        {/* 1위 빅카드 */}
        {isLoading ? (
          <RegionBigCardSkeleton />
        ) : (
          <RegionBigCard region={top} rank={1} />
        )}

        {/* 2~5위 가로 스크롤 */}
        <div className="mt-4">
          <p className="text-[13px] font-bold text-gray-900 mb-2.5">그 외 핫플</p>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => <RegionSubCardSkeleton key={i} />)
              : rest.map((region, i) => (
                  <RegionSubCard key={region.id} region={region} rank={i + 2} />
                ))}
          </div>
        </div>

        {isError && (
          <p className="text-center text-[12px] text-gray-400 mt-4">
            데이터를 불러오지 못했어요. 잠시 후 다시 시도해주세요.
          </p>
        )}

        <p className="text-center text-[11px] text-gray-300 mt-4">🕐 오늘 09:00 업데이트</p>
      </div>

      {/* 바텀 네비 */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm bg-white/90 backdrop-blur-sm border-t border-gray-100 flex z-30">
        <button className="flex-1 py-3 flex flex-col items-center gap-0.5">
          <svg className="w-5 h-5 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
          </svg>
          <span className="text-[10px] font-semibold text-gray-900">홈</span>
        </button>
        <Link href="/saved" className="flex-1 py-3 flex flex-col items-center gap-0.5">
          <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          <span className="text-[10px] font-medium text-gray-300">저장</span>
        </Link>
      </div>
    </div>
  );
}
