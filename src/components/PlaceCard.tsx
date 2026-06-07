'use client';

import Link from 'next/link';
import type { Place } from '@/types';

const REGION_GRADIENT: Record<string, string> = {
  seongsu: 'g-seongsu',
  hongdae: 'g-hongdae',
  gangnam: 'g-gangnam',
  itaewon: 'g-itaewon',
  yeonnam: 'g-yeonnam',
};

type Props = {
  place: Place;
  regionId: string;
};

export function PlaceCard({ place, regionId }: Props) {
  const gradient = REGION_GRADIENT[regionId] ?? 'g-seongsu';

  return (
    <Link href={`/place/${place.id}?regionId=${regionId}`}>
      <article className="pressable bg-white rounded-2xl border border-gray-100 shadow-sm flex overflow-hidden">
        {/* 썸네일 */}
        <div className={`w-[88px] flex-shrink-0 ${!place.image_url ? gradient : ''}`}>
          {place.image_url ? (
            <img
              src={place.image_url}
              alt={place.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full min-h-[88px]" />
          )}
        </div>

        {/* 정보 */}
        <div className="flex-1 p-3 min-w-0 flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[14px] font-bold text-gray-900 truncate">{place.name}</p>
              <p className="text-[11px] text-gray-400 mt-0.5 truncate">
                {place.category} · {place.address}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between mt-2">
            {/* 무드 태그 */}
            <div className="flex gap-1 overflow-hidden">
              {place.moods.slice(0, 2).map((mood) => (
                <span
                  key={mood}
                  className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full flex-shrink-0"
                >
                  {mood}
                </span>
              ))}
            </div>

            {/* 평점 */}
            <p className="text-[11px] text-gray-400 flex-shrink-0">
              ★ {place.rating.toFixed(1)} · {place.review_count.toLocaleString()}
            </p>
          </div>
        </div>
      </article>
    </Link>
  );
}

export function PlaceCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex overflow-hidden animate-pulse">
      <div className="w-[88px] h-[88px] flex-shrink-0 bg-gray-100" />
      <div className="flex-1 p-3 space-y-2">
        <div className="h-4 bg-gray-100 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
        <div className="flex gap-1 mt-2">
          <div className="h-5 w-12 bg-gray-100 rounded-full" />
          <div className="h-5 w-12 bg-gray-100 rounded-full" />
        </div>
      </div>
    </div>
  );
}
