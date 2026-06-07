'use client';

import { useFilterStore } from '@/stores/useFilterStore';
import { CATEGORY_TAGS, MOOD_TAGS } from '@/constants/filterTags';
import type { CategoryTag, MoodTag } from '@/types';

export default function FilterBar() {
  const { category, mood, setCategory, toggleMood } = useFilterStore();

  return (
    <div className="sticky top-0 bg-white z-20 border-b border-gray-100 px-4 pt-2.5 pb-3 space-y-2">
      <div
        className="flex gap-1.5 overflow-x-auto [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none' }}
      >
        {CATEGORY_TAGS.map((tag) => {
          const selected = category === tag.value;
          return (
            <button
              key={tag.value}
              type="button"
              onClick={() => setCategory(selected ? null : (tag.value as CategoryTag))}
              className={`flex-shrink-0 text-[12px] font-medium px-3 py-1.5 rounded-full border transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 ${
                selected
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-600 border-gray-200'
              }`}
            >
              {tag.label}
            </button>
          );
        })}
      </div>

      <div
        className="flex gap-1.5 overflow-x-auto [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none' }}
      >
        {MOOD_TAGS.map((tag) => {
          const selected = mood.includes(tag.value as MoodTag);
          return (
            <button
              key={tag.value}
              type="button"
              onClick={() => toggleMood(tag.value as MoodTag)}
              className={`flex-shrink-0 text-[12px] font-medium px-3 py-1.5 rounded-full border transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 ${
                selected
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-500 border-gray-200'
              }`}
            >
              {tag.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
