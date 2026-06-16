'use client';

import { useState } from 'react';
import type { Place } from '@/types';

type Props = {
  places: Place[];
  onChange: (places: Place[]) => void;
};

const REGION_GRADIENT: Record<string, string> = {
  seongsu: 'g-seongsu',
  hongdae: 'g-hongdae',
  gangnam: 'g-gangnam',
  itaewon: 'g-itaewon',
  yeonnam: 'g-yeonnam',
};

function reorderPlaces(places: Place[], fromIndex: number, toIndex: number) {
  if (fromIndex === toIndex) return places;
  if (fromIndex < 0 || toIndex < 0) return places;
  if (fromIndex >= places.length || toIndex >= places.length) return places;

  const next = [...places];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

export function CourseEditor({ places, onChange }: Props) {
  const [draggingId, setDraggingId] = useState<string | null>(null);

  function movePlace(fromIndex: number, toIndex: number) {
    onChange(reorderPlaces(places, fromIndex, toIndex));
  }

  function handleDrop(toIndex: number) {
    if (!draggingId) return;

    const fromIndex = places.findIndex((place) => place.id === draggingId);
    movePlace(fromIndex, toIndex);
    setDraggingId(null);
  }

  if (places.length < 2) return null;

  return (
    <section className="space-y-3" aria-labelledby="course-editor-title">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] text-gray-400 mb-0.5">Course</p>
          <h2 id="course-editor-title" className="text-[16px] font-black text-gray-900">
            동선 순서
          </h2>
        </div>
        <p className="text-[12px] text-gray-400">{places.length}곳</p>
      </div>

      <ol className="space-y-2.5">
        {places.map((place, index) => {
          const gradient = REGION_GRADIENT[place.region_id] ?? 'g-seongsu';
          const isDragging = draggingId === place.id;

          return (
            <li
              key={place.id}
              draggable
              onDragStart={() => setDraggingId(place.id)}
              onDragEnd={() => setDraggingId(null)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => handleDrop(index)}
              className={`rounded-2xl border border-gray-100 bg-white shadow-sm transition-opacity ${
                isDragging ? 'opacity-50' : 'opacity-100'
              }`}
            >
              <article className="flex overflow-hidden">
                <div className="flex w-9 flex-shrink-0 items-center justify-center">
                  <span className="text-[13px] font-black text-gray-300">{index + 1}</span>
                </div>

                <div className={`w-[64px] flex-shrink-0 ${!place.image_url ? gradient : ''}`}>
                  {place.image_url ? (
                    <img
                      src={place.image_url}
                      alt={place.name}
                      className="h-full min-h-[76px] w-full object-cover"
                    />
                  ) : (
                    <div className="h-full min-h-[76px] w-full" />
                  )}
                </div>

                <div className="min-w-0 flex-1 p-3">
                  <p className="truncate text-[14px] font-bold text-gray-900">{place.name}</p>
                  <p className="mt-0.5 truncate text-[11px] text-gray-400">
                    {place.category} · {place.address}
                  </p>
                  <div className="mt-2 flex gap-1">
                    <button
                      type="button"
                      onClick={() => movePlace(index, index - 1)}
                      disabled={index === 0}
                      aria-label={`${place.name} 위로 이동`}
                      className="h-7 w-9 rounded-full border border-gray-200 text-[12px] font-bold text-gray-500 outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => movePlace(index, index + 1)}
                      disabled={index === places.length - 1}
                      aria-label={`${place.name} 아래로 이동`}
                      className="h-7 w-9 rounded-full border border-gray-200 text-[12px] font-bold text-gray-500 outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 disabled:opacity-30"
                    >
                      ↓
                    </button>
                  </div>
                </div>
              </article>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
