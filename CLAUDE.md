# 답정너 — 기술 설계서 (CLAUDE.md)

> 데이터 기반 핫플 탐색 & 데이트 동선 추천 서비스

---

## 1. 기술 스택

| 영역 | 기술 |
|------|------|
| 프레임워크 | Next.js 14 (App Router) |
| 전역 상태 | Zustand |
| 서버 상태 | TanStack Query v5 |
| 테스트 | Vitest + Testing Library |
| 스타일 | Tailwind CSS |
| DB / Auth | Supabase (PostgreSQL + Auth) |
| 지도 | 카카오맵 JavaScript API |
| 외부 데이터 | 서울 실시간 도시데이터 API · 카카오 로컬 API |
| 배포 | Vercel (cron 포함) |

---

## 2. 폴더 구조

```
src/
├── app/
│   ├── page.tsx                          # 홈 — 핫플 지역 랭킹
│   ├── region/[regionId]/page.tsx        # 지역별 장소 목록
│   ├── place/[placeId]/page.tsx          # 장소 상세
│   ├── saved/page.tsx                    # 저장된 장소 & 코스
│   ├── share/[courseId]/page.tsx         # 코스 공유 뷰 (OG 태그)
│   └── api/
│       ├── cron/
│       │   ├── regions/route.ts          # 지역 카탈로그 동기화 (cron)
│       │   ├── region-images/route.ts    # 지역 대표 이미지 수집 (cron)
│       │   └── seoul-population/route.ts # 서울 실시간 인구 수집 (cron)
│       ├── places/route.ts
│       ├── saved-places/route.ts
│       ├── courses/route.ts
│       └── auth/route.ts
│
├── components/
│   ├── RegionCard.tsx
│   ├── PlaceCard.tsx
│   ├── FilterBar.tsx                     # 이중 필터 (카테고리 × 무드)
│   ├── KakaoMap.tsx                      # dynamic import, SSR 비활성화
│   ├── SaveButton.tsx                    # 낙관적 업데이트
│   ├── ReviewList.tsx
│   ├── CourseEditor.tsx                  # Post-MVP
│   └── AuthModal.tsx
│
├── hooks/
│   ├── useRegionRanking.ts
│   ├── usePlacesByRegion.ts
│   ├── usePlaceDetail.ts
│   ├── useSavedPlaces.ts
│   └── useSaveMutation.ts
│
├── stores/
│   ├── useFilterStore.ts                 # 필터 선택 상태
│   └── useAuthStore.ts                   # 로그인 유저 정보
│
├── types/index.ts                        # Region, Place, Course, FilterTag
├── constants/filterTags.ts               # 카테고리 7개, 무드 7개 고정값
└── lib/
    ├── supabase.ts
    ├── kakao.ts
    └── hotScore.ts                       # 지역 핫도 스코어 산출
```

---

## 3. User Flow

### Flow 1 — 홈 진입 & 지역 선택
```
1. 서버에서 regions fetch → RegionCard 그리드 (hot_score 내림차순, 상위 10개)
2. 카드 클릭 → router.push('/region/[regionId]')
```

### Flow 2 — 장소 탐색 & 필터
```
1. usePlacesByRegion(regionId) → PlaceCard 리스트
2. FilterBar에서 카테고리/무드 선택 → useFilterStore 업데이트
   → URL 쿼리 파라미터 동기화 → 클라이언트 사이드 필터링
3. 카드 클릭 → router.push('/place/[placeId]')
```

### Flow 3 — 장소 저장
```
1. usePlaceDetail(placeId) → 상세 정보 + 카카오맵 마커
2. 저장 버튼 클릭
   - 비로그인: AuthModal 노출 → 로그인 후 저장 재시도
   - 로그인: useSaveMutation.mutate(placeId)
     → 낙관적 업데이트 → 성공 시 ['saved-places'] invalidate
     → 실패 시 롤백 + 에러 토스트
```

### Flow 4 — 코스 공유
```
1. /saved → useSavedPlaces() → 장소 그리드
2. 코스 생성 → POST /api/courses → /share/[courseId] 이동
3. Web Share API 호출 (미지원 시 클립보드 복사 fallback) [추론]
```

---

## 4. Context Logic

**카카오맵 로딩**
- `KakaoMap.tsx`는 `next/dynamic`으로 `ssr: false` import
- 마운트 시 `window.kakao` 체크 후 초기화, 스크립트 중복 로드 방지

**필터 상태 초기화**
- 필터 변경 시 `router.replace`로 URL 쿼리 동기화
- 지역 페이지 진입 시 `useSearchParams()`로 초기값 복원
- 지역 페이지 이탈 시 `useFilterStore.reset()` 호출

**저장 버튼 — 비로그인 분기**
- `useAuthStore.user === null`이면 AuthModal 노출
- 로그인 성공 후 저장 액션 자동 재실행 [추론]

**Cron 보호**
- `/api/cron/*`는 `Authorization: Bearer CRON_SECRET` 검증, 실패 시 401

---

## 5. State 규칙

**useFilterStore**
- 필드: `category: string | null`, `mood: string[]`
- 액션: `setCategory()`, `toggleMood()`, `reset()`

**useAuthStore**
- 필드: `user`, `session`
- Supabase `onAuthStateChange`로 자동 동기화

**TanStack Query**
- `useRegionRanking` — `queryKey: ['regions']`, staleTime 5분
- `usePlacesByRegion` — `queryKey: ['places', regionId]`, staleTime 10분
- `usePlaceDetail` — `queryKey: ['place', placeId]`, staleTime 30분
- `useSavedPlaces` — `queryKey: ['saved-places', userId]`, staleTime 0
- `useSaveMutation` — 성공 시 `['saved-places', userId]` invalidate, 낙관적 업데이트

**Local useState**
- `FilterBar`: 드롭다운 열림 여부
- `AuthModal`: 모달 표시 여부 [추론]

---

## 6. Design System

**Layout**
- 전체 `max-w-sm` 센터 정렬, 페이지 배경 `bg-white`
- 헤더: 고정 없음, 페이지 상단 `px-5 pt-6`
- 필터 바: `sticky top-0 bg-white z-20 border-b border-gray-100`
- 지도 고정 높이: `h-[130px]` (장소 상세)
- 히어로 영역 높이: `h-[200px]` (장소 목록) · `h-[240px]` (장소 상세)
- 바텀 네비: `sticky bottom-0 bg-white/90 backdrop-blur-sm border-t border-gray-100`

**지역 고유 그라데이션 (region identity)**

각 지역은 고유 그라데이션을 가지며, 히어로 카드·장소 썸네일·아바타에 일관 적용.
실제 사진을 `background-image`로 올리고, 그라데이션은 사진 로드 실패 시 fallback.

| 지역 | CSS 변수 | 그라데이션 |
|------|----------|-----------|
| 성수동 | `g-seongsu` | `160deg, #ff6b35 → #f7c59f → #efefd0` |
| 홍대·합정 | `g-hongdae` | `160deg, #667eea → #764ba2 → #f093fb` |
| 강남·청담 | `g-gangnam` | `160deg, #f7971e → #ffd200` |
| 이태원·한남 | `g-itaewon` | `160deg, #11998e → #38ef7d` |
| 연남·망원 | `g-yeonnam` | `160deg, #ee0979 → #ff6a00` |

히어로 텍스트 가독성: 사진/그라데이션 위에 `linear-gradient(to top, rgba(0,0,0,0.65), transparent)` 오버레이 필수.

**테마 컬러**

| 용도 | Tailwind 클래스 |
|------|-----------------|
| 페이지 배경 | `bg-white` |
| 서브 카드 배경 | `bg-gray-50` |
| CTA 버튼 (저장하기) | `bg-gray-900 text-white` |
| 저장됨 상태 버튼 | `bg-white text-gray-900 border-2 border-gray-900` |
| 장소 카드 보더 | `border border-gray-100` |
| 카테고리 칩 — 선택 | `bg-gray-900 text-white border-gray-900` |
| 카테고리 칩 — 미선택 | `bg-white text-gray-600 border-gray-200` |
| 무드 칩 — 선택 | `bg-gray-900 text-white border-gray-900` |
| 무드 칩 — 미선택 | `bg-white text-gray-500 border-gray-200` |
| 장소 태그 (목록 내) | `bg-gray-100 text-gray-600` |
| 텍스트 주요 | `text-gray-900` |
| 텍스트 보조 | `text-gray-400` |
| 히어로 위 텍스트 | `text-white` / `text-white/60` |

**타이포그래피**

| 용도 | 클래스 |
|------|--------|
| 앱 이름 | `text-[22px] font-black tracking-tight` |
| 지역명 (히어로 대형) | `text-[26-28px] font-black tracking-tight leading-none` |
| 지역 서브라벨 | `text-[10-11px] tracking-[0.2em] uppercase text-white/60` |
| 장소명 (카드) | `text-[14px] font-bold` |
| 메타 정보 | `text-[11px] text-gray-400` |

**카드 통일값**

```
장소 카드:   rounded-2xl bg-white border border-gray-100 shadow-sm (flex, 썸네일 88px)
지역 빅카드: rounded-[1.75rem] shadow-md (aspect-ratio 4/3)
지역 서브카드: rounded-2xl shadow-md (aspect-ratio 3/4, w-32)
서브 인포카드: rounded-2xl bg-gray-50 p-3.5
```

**인터랙션 피드백**
- 탭 가능한 모든 카드: `transition: transform 0.1s; :active { transform: scale(0.96) }`
- 칩 전환: `transition: all 0.15s ease`
- 로딩 버튼: `disabled` + `<Loader2 className="animate-spin w-4 h-4" />`
- 스켈레톤: RegionCard `aspect-[4/3] rounded-[1.75rem]` × 5개, PlaceCard `h-[88px] rounded-2xl` × 6개
- 포커스 전역: `outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2`

---

## 7. 테스트

**단위** (`lib/*.test.ts`)
- `hotScore.test.ts` — 스코어 산출 로직
- `useFilterStore.test.ts` — setCategory, toggleMood, reset
- `kakao.test.ts` — 카카오맵 로드 유틸

**통합** (`__tests__/`)
- `home.test.tsx` — 지역 랭킹 렌더링 → 카드 클릭 → 페이지 이동
- `filter.test.tsx` — 필터 선택 → URL 변경 → 목록 필터링
- `save.test.tsx` — 비로그인 저장 → 모달 → 로그인 → 저장 완료
