'use client';

import Link from 'next/link';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import KakaoMapDynamic from '@/components/KakaoMapDynamic';
import { usePlacesByRegion } from '@/hooks/usePlacesByRegion';
import { SaveButton } from '@/components/SaveButton';
import { ReviewList } from '@/components/ReviewList';
import { getRegionGradient } from '@/lib/regionCatalog';

const DARK_OVERLAY = 'linear-gradient(to top, rgba(0,0,0,0.65), transparent 55%)';

type Props = { params: { placeId: string } };

export default function PlaceDetailPage({ params }: Props) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <PlaceDetailContent placeId={params.placeId} />
    </Suspense>
  );
}

function PlaceDetailContent({ placeId }: { placeId: string }) {
  const searchParams = useSearchParams();
  const regionId = searchParams.get('regionId');
  const gradient = regionId ? getRegionGradient(regionId) : 'g-seongsu';
  const backHref = regionId ? `/region/${regionId}` : '/';

  const { data: places, isLoading } = usePlacesByRegion(regionId ?? '');
  const place = regionId ? (places?.find(p => p.id === placeId) ?? null) : null;

  if (isLoading) return <DetailSkeleton gradient={gradient} backHref={backHref} />;

  if (!place) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen max-w-sm mx-auto">
        <p className="text-gray-400 text-sm">장소 정보를 찾을 수 없어요.</p>
        <Link href={backHref} className="mt-4 text-gray-900 font-semibold text-sm underline outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2">
          {regionId ? '목록으로' : '홈으로'}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen max-w-sm mx-auto bg-white">

      {/* 히어로 */}
      <div className={`${gradient} relative`} style={{ height: '240px' }}>
        <div className="absolute inset-0" style={{ background: DARK_OVERLAY }} />
        <Link
          href={backHref}
          className="absolute top-5 left-5 bg-black/25 backdrop-blur-sm text-white text-[12px] px-3 py-1.5 rounded-full z-10 outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
        >
          ← 뒤로
        </Link>
        <Link
          href="/saved"
          className="absolute top-5 right-5 bg-black/25 backdrop-blur-sm text-white text-[12px] px-3 py-1.5 rounded-full z-10 outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
        >
          저장 목록
        </Link>
        <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
          <p className="text-white/60 text-[11px] font-medium tracking-[0.2em] uppercase mb-0.5">
            {place.category}
          </p>
          <h1 className="text-white text-[26px] font-black tracking-tight leading-tight">
            {place.name}
          </h1>
          <p className="text-white/60 text-[12px] mt-1 truncate">{place.address}</p>
        </div>
      </div>

      {/* 카카오맵 단독 마커 */}
      <div className="mx-4 mt-3">
        <div className="h-[130px] rounded-2xl overflow-hidden">
          <KakaoMapDynamic
            markers={[{ lat: place.lat, lng: place.lng, label: place.name }]}
            center={{ lat: place.lat, lng: place.lng }}
            className="h-full"
          />
        </div>
        <a
          href={`https://place.map.kakao.com/${place.kakao_place_id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1.5 flex justify-end text-[12px] text-gray-400 underline outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
        >
          카카오맵에서 보기 →
        </a>
      </div>

      {/* 상세 정보 */}
      <div className="px-4 pt-4 pb-32 space-y-3">

        {/* 무드 태그 */}
        {place.moods.length > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            {place.moods.map((mood) => (
              <span key={mood} className="text-[12px] bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                {mood}
              </span>
            ))}
          </div>
        )}

        {/* 평점 / 리뷰 수 */}
        <div className="flex gap-3">
          <div className="flex-1 rounded-2xl bg-gray-50 p-3.5">
            <p className="text-[11px] text-gray-400 mb-0.5">평점</p>
            <p className="text-[20px] font-black text-gray-900">
              {place.rating > 0 ? `★ ${place.rating.toFixed(1)}` : '—'}
            </p>
          </div>
          <div className="flex-1 rounded-2xl bg-gray-50 p-3.5">
            <p className="text-[11px] text-gray-400 mb-0.5">리뷰</p>
            <p className="text-[20px] font-black text-gray-900">
              {place.review_count > 0 ? place.review_count.toLocaleString() : '—'}
            </p>
          </div>
        </div>

        {/* 주소 */}
        <div className="rounded-2xl bg-gray-50 p-3.5">
          <p className="text-[11px] text-gray-400 mb-0.5">주소</p>
          <p className="text-[13px] text-gray-900 font-medium">{place.address}</p>
        </div>

        <ReviewList place={place} />
      </div>

      {/* 저장 버튼 */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm px-4 py-4 bg-white/90 backdrop-blur-sm border-t border-gray-100 z-30">
        <SaveButton place={place} />
      </div>
    </div>
  );
}

function DetailSkeleton({ gradient = 'g-seongsu', backHref = '/' }: { gradient?: string; backHref?: string }) {
  return (
    <div className="flex flex-col min-h-screen max-w-sm mx-auto bg-white animate-pulse">
      <div className={`${gradient} relative`} style={{ height: '240px' }}>
        <Link href={backHref} className="absolute top-5 left-5 bg-black/25 backdrop-blur-sm text-white text-[12px] px-3 py-1.5 rounded-full z-10">
          ← 뒤로
        </Link>
        <div className="absolute bottom-0 left-0 right-0 p-5 space-y-2">
          <div className="h-3 w-12 bg-white/30 rounded" />
          <div className="h-7 w-44 bg-white/30 rounded" />
          <div className="h-3 w-36 bg-white/30 rounded" />
        </div>
      </div>
      <div className="h-[130px] mx-4 mt-3 rounded-2xl bg-gray-100" />
      <div className="px-4 pt-4 space-y-3">
        <div className="flex gap-1.5">
          <div className="h-7 w-14 bg-gray-100 rounded-full" />
          <div className="h-7 w-14 bg-gray-100 rounded-full" />
        </div>
        <div className="flex gap-3">
          <div className="flex-1 h-[72px] bg-gray-100 rounded-2xl" />
          <div className="flex-1 h-[72px] bg-gray-100 rounded-2xl" />
        </div>
        <div className="h-[60px] bg-gray-100 rounded-2xl" />
      </div>
    </div>
  );
}
