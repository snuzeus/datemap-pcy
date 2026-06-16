'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { CourseSummaryCard } from '@/components/CourseSummaryCard';
import type { CourseData } from '@/lib/localCourseStore';

const REGION_GRADIENT: Record<string, string> = {
  seongsu: 'g-seongsu',
  hongdae: 'g-hongdae',
  gangnam: 'g-gangnam',
  itaewon: 'g-itaewon',
  yeonnam: 'g-yeonnam',
};

type Props = { course: CourseData };

export default function ShareView({ course }: Props) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  async function handleShare() {
    const url = window.location.href;
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: course.title, url });
        return;
      } catch {
        // 사용자 취소 또는 API 미지원 → 클립보드로 fallback
      }
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    timerRef.current = setTimeout(() => setCopied(false), 2000);
  }

  const date = new Date(course.created_at).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="flex flex-col min-h-screen max-w-sm mx-auto bg-white">
      {/* 헤더 */}
      <div className="px-5 pt-6 pb-4 flex items-center gap-3">
        <Link
          href="/saved"
          className="flex-shrink-0 text-gray-400 text-[13px] outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
        >
          ← 저장 목록
        </Link>
        <h1 className="text-[18px] font-black text-gray-900 truncate">{course.title}</h1>
      </div>

      <div className="px-5 pb-4">
        <p className="text-[13px] text-gray-400">{date}</p>
      </div>

      <div className="px-4 pb-4">
        <CourseSummaryCard places={course.places} />
      </div>

      {/* 장소 목록 */}
      <div className="px-4 pb-32 space-y-3">
        {course.places.map((place, index) => {
          const gradient = REGION_GRADIENT[place.region_id] ?? 'g-seongsu';
          return (
            <Link
              key={place.id}
              href={`/place/${place.id}?regionId=${place.region_id}`}
              className="pressable block outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 rounded-2xl"
            >
              <article className="bg-white rounded-2xl border border-gray-100 shadow-sm flex overflow-hidden">
                {/* 순서 번호 */}
                <div className="flex-shrink-0 w-8 flex items-center justify-center">
                  <span className="text-[13px] font-bold text-gray-300">{index + 1}</span>
                </div>

                {/* 썸네일 */}
                <div className={`w-[72px] flex-shrink-0 ${!place.image_url ? gradient : ''}`}>
                  {place.image_url ? (
                    <img
                      src={place.image_url}
                      alt={place.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full min-h-[80px]" />
                  )}
                </div>

                {/* 정보 */}
                <div className="flex-1 p-3 min-w-0 flex flex-col justify-center gap-1">
                  <p className="text-[14px] font-bold text-gray-900 truncate">{place.name}</p>
                  <p className="text-[11px] text-gray-400 truncate">
                    {place.category} · {place.address}
                  </p>
                  <div className="flex gap-1 mt-0.5 overflow-hidden">
                    {place.moods.slice(0, 2).map((mood) => (
                      <span
                        key={mood}
                        className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full flex-shrink-0"
                      >
                        {mood}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            </Link>
          );
        })}
      </div>

      {/* 공유 버튼 */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm px-4 py-4 bg-white/90 backdrop-blur-sm border-t border-gray-100 z-30">
        <button
          type="button"
          onClick={handleShare}
          className="w-full py-3.5 bg-gray-900 text-white font-bold text-[15px] rounded-2xl transition-all active:scale-[0.98] outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
        >
          {copied ? '링크 복사됨 ✓' : '공유하기'}
        </button>
      </div>
    </div>
  );
}
