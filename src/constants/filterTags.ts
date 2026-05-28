import type { CategoryTag, FilterTag, MoodTag } from '@/types';

export const CATEGORY_TAGS: FilterTag[] = [
  { value: '카페', label: '카페' },
  { value: '맛집', label: '맛집' },
  { value: '바/펍', label: '바/펍' },
  { value: '공원/야외', label: '공원/야외' },
  { value: '전시/문화', label: '전시/문화' },
  { value: '쇼핑', label: '쇼핑' },
  { value: '이색체험', label: '이색체험' },
] as const;

export const MOOD_TAGS: FilterTag[] = [
  { value: '감성적인', label: '감성적인' },
  { value: '조용한', label: '조용한' },
  { value: '활동적인', label: '활동적인' },
  { value: '뷰 맛집', label: '뷰 맛집' },
  { value: '힙한', label: '힙한' },
  { value: '아늑한', label: '아늑한' },
  { value: '로맨틱한', label: '로맨틱한' },
] as const;

export const CATEGORY_VALUES = CATEGORY_TAGS.map((t) => t.value) as CategoryTag[];
export const MOOD_VALUES = MOOD_TAGS.map((t) => t.value) as MoodTag[];
