'use client';

import type { Place } from '@/types';

type Review = {
  id: string;
  author: string;
  rating: number;
  visitedAt: string;
  content: string;
  tags: string[];
};

type Props = {
  place: Place;
};

const MOCK_REVIEWS: Record<string, Review[]> = {
  'mock-1': [
    {
      id: 'mock-1-review-1',
      author: '데이트메이트',
      rating: 4.8,
      visitedAt: '최근 방문',
      content: '공간이 넓고 분위기가 좋아서 가볍게 걷고 쉬어가기 좋았어요.',
      tags: ['분위기', '대화하기 좋음'],
    },
    {
      id: 'mock-1-review-2',
      author: '성수 탐험가',
      rating: 4.6,
      visitedAt: '지난주',
      content: '주말에는 사람이 많지만 근처 코스와 묶기 좋아요.',
      tags: ['핫플', '코스 추천'],
    },
  ],
  'mock-2': [
    {
      id: 'mock-2-review-1',
      author: '전시 산책러',
      rating: 4.5,
      visitedAt: '이번 달',
      content: '사진 찍기 좋고 주변 카페로 이어가기 편한 장소예요.',
      tags: ['사진', '전시'],
    },
  ],
};

function getReviews(place: Place) {
  if (MOCK_REVIEWS[place.id]) return MOCK_REVIEWS[place.id];

  if (place.review_count <= 0) return [];

  return [
    {
      id: `${place.id}-summary`,
      author: '카카오맵 리뷰 요약',
      rating: place.rating,
      visitedAt: '외부 리뷰',
      content:
        '실제 리뷰 본문은 카카오맵 상세 페이지에서 확인할 수 있어요. 이 앱에서는 평점과 리뷰 수를 요약해 보여줍니다.',
      tags: [place.category, '카카오맵'],
    },
  ];
}

export function ReviewList({ place }: Props) {
  const reviews = getReviews(place);
  const kakaoPlaceUrl = `https://place.map.kakao.com/${place.kakao_place_id}`;

  return (
    <section className="space-y-3" aria-labelledby="review-list-title">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] text-gray-400 mb-0.5">Review</p>
          <h2 id="review-list-title" className="text-[16px] font-black text-gray-900">
            리뷰 요약
          </h2>
        </div>
        <a
          href={kakaoPlaceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[12px] font-semibold text-gray-400 underline outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
        >
          카카오맵에서 보기
        </a>
      </div>

      <div className="rounded-2xl bg-gray-50 p-3.5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] text-gray-400 mb-0.5">평균 평점</p>
            <p className="text-[20px] font-black text-gray-900">
              {place.rating > 0 ? `★ ${place.rating.toFixed(1)}` : '—'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-gray-400 mb-0.5">리뷰 수</p>
            <p className="text-[20px] font-black text-gray-900">
              {place.review_count > 0 ? place.review_count.toLocaleString() : '—'}
            </p>
          </div>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-4">
          <p className="text-[13px] font-bold text-gray-900">아직 보여줄 리뷰가 없어요</p>
          <p className="mt-1 text-[12px] leading-5 text-gray-400">
            카카오맵 상세 페이지에서 최신 리뷰를 확인해 주세요.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {reviews.map((review) => (
            <article
              key={review.id}
              className="rounded-2xl border border-gray-100 bg-white p-3.5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-bold text-gray-900">
                    {review.author}
                  </p>
                  <p className="mt-0.5 text-[11px] text-gray-400">{review.visitedAt}</p>
                </div>
                <span className="flex-shrink-0 text-[12px] font-bold text-gray-900">
                  ★ {review.rating.toFixed(1)}
                </span>
              </div>
              <p className="mt-2 text-[13px] leading-5 text-gray-600">{review.content}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {review.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-500"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
