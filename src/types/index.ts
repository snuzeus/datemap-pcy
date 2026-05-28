export type Region = {
  id: string;
  name: string;
  district: string;
  hot_score: number;
  trend_direction: 'up' | 'down' | 'stable';
  place_count: number;
  image_url: string | null;
  updated_at: string;
};

export type Place = {
  id: string;
  region_id: string;
  name: string;
  address: string;
  category: CategoryTag;
  moods: MoodTag[];
  rating: number;
  review_count: number;
  image_url: string | null;
  kakao_place_id: string;
  lat: number;
  lng: number;
};

export type Course = {
  id: string;
  user_id: string;
  title: string;
  place_ids: string[];
  created_at: string;
};

export type FilterTag = {
  value: string;
  label: string;
};

export type CategoryTag =
  | '카페'
  | '맛집'
  | '바/펍'
  | '공원/야외'
  | '전시/문화'
  | '쇼핑'
  | '이색체험';

export type MoodTag =
  | '감성적인'
  | '조용한'
  | '활동적인'
  | '뷰 맛집'
  | '힙한'
  | '아늑한'
  | '로맨틱한';
