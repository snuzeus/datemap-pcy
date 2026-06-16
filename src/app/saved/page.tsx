'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSavedPlaces } from '@/hooks/useSavedPlaces';
import { PlaceCard, PlaceCardSkeleton } from '@/components/PlaceCard';
import { AuthModal } from '@/components/AuthModal';
import { CourseEditor } from '@/components/CourseEditor';
import { CourseSummaryCard } from '@/components/CourseSummaryCard';
import KakaoMapDynamic from '@/components/KakaoMapDynamic';
import type { Place } from '@/types';

export default function SavedPage() {
  const user = useAuthStore((s) => s.user);
  const [showModal, setShowModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const { data: savedPlaces = [], isLoading } = useSavedPlaces(user?.id);
  const [coursePlaces, setCoursePlaces] = useState<Place[]>([]);
  const router = useRouter();
  const routePoints = coursePlaces
    .filter((place) => Number.isFinite(place.lat) && Number.isFinite(place.lng))
    .map((place) => ({ lat: place.lat, lng: place.lng, label: place.name }));

  useEffect(() => {
    setCoursePlaces((prev) => {
      if (prev.length === 0) return savedPlaces;

      const savedIds = new Set(savedPlaces.map((place) => place.id));
      const orderedExisting = prev.filter((place) => savedIds.has(place.id));
      const existingIds = new Set(orderedExisting.map((place) => place.id));
      const newlySaved = savedPlaces.filter((place) => !existingIds.has(place.id));
      return [...orderedExisting, ...newlySaved];
    });
  }, [savedPlaces]);

  const handleCourseOrderChange = useCallback((places: Place[]) => {
    setCoursePlaces(places);
  }, []);

  async function handleCreateCourse() {
    if (isCreating || coursePlaces.length < 2) return;
    setIsCreating(true);
    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ places: coursePlaces }),
      });
      if (!res.ok) throw new Error('코스 생성 실패');
      const { id } = await res.json() as { id: string };
      router.push(`/share/${id}`);
    } catch {
      setIsCreating(false);
    }
  }

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen max-w-sm mx-auto bg-white">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-4">
          <p className="text-gray-400 text-sm text-center">
            로그인하면 저장한 장소를 볼 수 있어요.
          </p>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="px-6 py-3 bg-gray-900 text-white font-bold text-[14px] rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
          >
            로그인하기
          </button>
        </div>
        <AuthModal isOpen={showModal} onClose={() => setShowModal(false)} />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen max-w-sm mx-auto bg-white">
        <Header />
        <div className="px-4 pt-2 space-y-2.5">
          {Array.from({ length: 4 }).map((_, i) => <PlaceCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen max-w-sm mx-auto bg-white">
      <Header count={savedPlaces.length} />

      {savedPlaces.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-2">
          <p className="text-gray-900 font-bold text-[16px]">저장한 장소가 없어요</p>
          <p className="text-gray-400 text-sm text-center">마음에 드는 장소를 저장해보세요.</p>
          <Link
            href="/"
            className="mt-3 px-6 py-3 bg-gray-900 text-white font-bold text-[14px] rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
          >
            홈으로 가기
          </Link>
        </div>
      ) : (
        <div className="pb-32">
          <div className="bg-gray-50 border-y border-gray-100 px-4 py-4">
            <section className="mb-4 space-y-3" aria-labelledby="course-map-title">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="mb-0.5 text-[11px] text-gray-400">Route</p>
                  <h2 id="course-map-title" className="text-[16px] font-black text-gray-900">
                    동선 미리보기
                  </h2>
                </div>
                <p className="text-[12px] text-gray-400">{routePoints.length}개 지점</p>
              </div>

              {routePoints.length >= 2 ? (
                <div className="h-[160px] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                  <KakaoMapDynamic
                    markers={routePoints}
                    path={routePoints}
                    center={routePoints[0]}
                    className="h-full"
                  />
                </div>
              ) : (
                <div className="flex h-[120px] items-center justify-center rounded-2xl border border-gray-100 bg-white">
                  <p className="text-[12px] text-gray-400">
                    좌표가 있는 장소를 2개 이상 저장하면 동선을 볼 수 있어요.
                  </p>
                </div>
              )}
            </section>

            <CourseSummaryCard places={coursePlaces} className="mb-4" />
            <CourseEditor places={coursePlaces} onChange={handleCourseOrderChange} />
          </div>

          <section className="px-4 pt-5 space-y-3" aria-labelledby="saved-places-title">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="mb-0.5 text-[11px] text-gray-400">Saved</p>
                <h2 id="saved-places-title" className="text-[16px] font-black text-gray-900">
                  저장된 장소
                </h2>
              </div>
              <p className="text-[12px] text-gray-400">{savedPlaces.length}곳</p>
            </div>

            <div className="space-y-2.5">
              {savedPlaces.map((place) => (
                <PlaceCard key={place.id} place={place} regionId={place.region_id} />
              ))}
            </div>
          </section>
        </div>
      )}

      {coursePlaces.length >= 2 && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm px-4 py-4 bg-white/90 backdrop-blur-sm border-t border-gray-100 z-30">
          <button
            type="button"
            onClick={handleCreateCourse}
            disabled={isCreating}
            className="w-full py-3.5 bg-gray-900 text-white font-bold text-[15px] rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isCreating ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                코스 만드는 중...
              </span>
            ) : (
              `코스 만들기 · ${coursePlaces.length}곳`
            )}
          </button>
        </div>
      )}
    </div>
  );
}

function Header({ count }: { count?: number }) {
  return (
    <div className="px-5 pt-6 pb-4 flex items-center gap-3">
      <Link
        href="/"
        className="text-gray-400 text-[13px] outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
      >
        ← 홈
      </Link>
      <h1 className="text-[18px] font-black text-gray-900">
        저장한 장소{count !== undefined && count > 0 ? ` ${count}` : ''}
      </h1>
    </div>
  );
}
