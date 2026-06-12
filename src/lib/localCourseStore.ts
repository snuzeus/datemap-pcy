// Supabase 연결 전 임시 서버 인메모리 코스 저장소
// Feature 7에서 courses API(Supabase)로 교체 예정
import type { Place } from '@/types';

export type CourseData = {
  id: string;
  title: string;
  places: Place[];
  created_at: string;
};

export const courseStore = new Map<string, CourseData>();
