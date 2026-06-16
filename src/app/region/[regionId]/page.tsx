'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { usePlacesByRegion } from '@/hooks/usePlacesByRegion';
import { PlaceCard, PlaceCardSkeleton } from '@/components/PlaceCard';
import KakaoMapDynamic from '@/components/KakaoMapDynamic';
import FilterBar from '@/components/FilterBar';
import { useFilterStore } from '@/stores/useFilterStore';
import { CATEGORY_VALUES, MOOD_VALUES } from '@/constants/filterTags';
import type { CategoryTag, MoodTag } from '@/types';

const REGION_META: Record<string, { name: string; district: string; gradient: string }> = {
  seongsu: { name: '성수동', district: '서울 성동구', gradient: 'g-seongsu' },
  hongdae: { name: '홍대·합정', district: '서울 마포구', gradient: 'g-hongdae' },
  gangnam: { name: '강남·청담', district: '서울 강남구', gradient: 'g-gangnam' },
  itaewon: { name: '이태원·한남', district: '서울 용산구', gradient: 'g-itaewon' },
  yeonnam: { name: '연남·망원', district: '서울 마포구', gradient: 'g-yeonnam' },
};

const DARK_OVERLAY = 'linear-gradient(to top, rgba(0,0,0,0.65), transparent 55%)';

type Props = {
  params: { regionId: string };
};

export default function RegionPage({ params }: Props) {
  const { regionId } = params;
  const meta = REGION_META[regionId];
  const { data: places, isLoading, isError, refetch } = usePlacesByRegion(regionId);
  const { category, mood, setCategory, toggleMood, reset } = useFilterStore();
  const router = useRouter();
  const hasMounted = useRef(false);

  // URL에서 필터 복원 (마운트 시) + 이탈 시 reset
  useEffect(() => {
    reset();

    const sp = new URLSearchParams(window.location.search);
    const catParam = sp.get('category');
    const moodParam = sp.get('mood');
    if (catParam && CATEGORY_VALUES.includes(catParam as CategoryTag)) {
      setCategory(catParam as CategoryTag);
    }
    if (moodParam) {
      moodParam.split(',').forEach((m) => {
        if (MOOD_VALUES.includes(m as MoodTag)) toggleMood(m as MoodTag);
      });
    }
    hasMounted.current = true;
    return () => reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 필터 변경 시 URL 동기화
  useEffect(() => {
    if (!hasMounted.current) return;
    const sp = new URLSearchParams();
    if (category) sp.set('category', category);
    if (mood.length > 0) sp.set('mood', mood.join(','));
    const qs = sp.toString();
    router.replace(`/region/${regionId}${qs ? `?${qs}` : ''}`, { scroll: false });
  }, [category, mood, regionId, router]);

  // 클라이언트 사이드 필터링
  const filteredPlaces = useMemo(() => {
    if (!places) return [];
    return places.filter((place) => {
      if (category && place.category !== category) return false;
      if (mood.length > 0 && !mood.some((m) => place.moods.includes(m))) return false;
      return true;
    });
  }, [places, category, mood]);

  if (!meta) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen max-w-sm mx-auto">
        <p className="text-gray-400 text-sm">존재하지 않는 지역이에요.</p>
        <Link href="/" className="mt-4 text-gray-900 font-semibold text-sm underline">홈으로</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen max-w-sm mx-auto bg-white">

      {/* 히어로 헤더 */}
      <div className={`${meta.gradient} relative`} style={{ height: '200px' }}>
        <div className="absolute inset-0" style={{ background: DARK_OVERLAY }} />
        <Link
          href="/"
          className="absolute top-5 left-5 bg-black/25 backdrop-blur-sm text-white text-[12px] px-3 py-1.5 rounded-full z-10"
        >
          ← 뒤로
        </Link>
        <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
          <p className="text-white/60 text-[11px] font-medium tracking-[0.2em] uppercase mb-0.5">
            {meta.district}
          </p>
          <div className="flex items-end justify-between">
            <h1 className="text-white text-[26px] font-black tracking-tight leading-none">
              {meta.name}
            </h1>
            {!isLoading && (
              <span className="text-white/50 text-[11px] pb-0.5">{places?.length ?? 0}곳</span>
            )}
          </div>
        </div>
      </div>

      {/* 필터 바 */}
      <FilterBar />

      {/* 지도 */}
      {!isLoading && filteredPlaces.length > 0 && (
        <div className="h-[130px] mx-4 mt-3 rounded-2xl overflow-hidden">
          <KakaoMapDynamic
            markers={filteredPlaces.map((p) => ({ lat: p.lat, lng: p.lng, label: p.name }))}
            className="h-full"
          />
        </div>
      )}

      {/* 장소 목록 */}
      <div className="flex-1 px-4 pt-3 pb-24 space-y-2.5">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <PlaceCardSkeleton key={i} />)
          : filteredPlaces.map((place) => (
              <PlaceCard key={place.id} place={place} regionId={regionId} />
            ))}

        {!isLoading && isError && (
          <div className="mt-8 flex flex-col items-center gap-3">
            <p className="text-center text-gray-400 text-sm">장소 정보를 불러오지 못했어요.</p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="rounded-2xl bg-gray-900 px-5 py-2.5 text-[13px] font-bold text-white outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
            >
              다시 불러오기
            </button>
          </div>
        )}

        {!isLoading && !isError && places && places.length > 0 && filteredPlaces.length === 0 && (
          <div className="mt-8 flex flex-col items-center gap-3">
            <p className="text-center text-gray-400 text-sm">필터에 맞는 장소가 없어요.</p>
            <button
              type="button"
              onClick={reset}
              className="rounded-2xl border border-gray-200 bg-white px-5 py-2.5 text-[13px] font-bold text-gray-900 outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
            >
              필터 초기화
            </button>
          </div>
        )}

        {!isLoading && !isError && (!places || places.length === 0) && (
          <p className="text-center text-gray-400 text-sm mt-8">장소 정보가 없어요.</p>
        )}
      </div>

      {/* 바텀 네비 */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm bg-white/90 backdrop-blur-sm border-t border-gray-100 flex z-30">
        <Link href="/" className="flex-1 py-3 flex flex-col items-center gap-0.5">
          <svg className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
          </svg>
          <span className="text-[10px] font-medium text-gray-300">홈</span>
        </Link>
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
