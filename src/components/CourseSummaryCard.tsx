import type { Place } from '@/types';
import {
  formatDistance,
  formatDuration,
  getCourseSummary,
} from '@/lib/courseSummary';

type Props = {
  places: Place[];
  className?: string;
};

export function CourseSummaryCard({ places, className = '' }: Props) {
  const summary = getCourseSummary(places);

  return (
    <section
      className={`rounded-2xl border border-gray-100 bg-white p-3.5 shadow-sm ${className}`}
      aria-labelledby="course-summary-title"
    >
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <p className="mb-0.5 text-[11px] text-gray-400">Summary</p>
          <h2 id="course-summary-title" className="text-[16px] font-black text-gray-900">
            코스 요약
          </h2>
        </div>
        {!summary.hasEnoughCoordinates && (
          <p className="text-[11px] text-gray-400">일부 좌표 제외</p>
        )}
      </div>

      <dl className="grid grid-cols-3 gap-2">
        <div className="rounded-2xl bg-gray-50 px-3 py-2.5">
          <dt className="text-[11px] text-gray-400">장소</dt>
          <dd className="mt-1 text-[15px] font-black text-gray-900">{summary.placeCount}곳</dd>
        </div>
        <div className="rounded-2xl bg-gray-50 px-3 py-2.5">
          <dt className="text-[11px] text-gray-400">거리</dt>
          <dd className="mt-1 text-[15px] font-black text-gray-900">
            {formatDistance(summary.distanceKm)}
          </dd>
        </div>
        <div className="rounded-2xl bg-gray-50 px-3 py-2.5">
          <dt className="text-[11px] text-gray-400">도보</dt>
          <dd className="mt-1 text-[15px] font-black text-gray-900">
            {formatDuration(summary.durationMinutes)}
          </dd>
        </div>
      </dl>
    </section>
  );
}
