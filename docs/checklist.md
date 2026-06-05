PRD.md를 기반으로 생성한 **[개발 마일스톤 및 체크리스트]**입니다.

> **개발 방식**: Feature 단위 브랜치 → GitHub Issue 등록 → PR 머지
> **이슈 라벨 규칙**: `infra` `data` `feature` `ui` `deploy`
> **마일스톤**: Week 1 (05/27–05/31) · Week 2 (06/01–06/07) · Week 3 (06/08–06/14)

---

## Feature 1: 프로젝트 초기 세팅 `infra` · Week 1

- [x] **[ISSUE] Next.js 14 프로젝트 초기화 및 폴더 구조 설정** `infra` (High)
  - App Router 활성화, `src/` 구조, alias 설정 (`@/`)
- [x] **[ISSUE] Tailwind CSS + 글로벌 스타일 설정** `infra`
  - 폰트, 색상 토큰, 모바일 최적화 기본값 설정
- [x] **[ISSUE] Supabase 프로젝트 연결 및 환경변수 설정** `infra` (High)
  - `.env.local` 구성, `@/lib/supabase.ts` 클라이언트 초기화
- [ ] **[ISSUE] Supabase DB 스키마 설계 및 마이그레이션** `infra` (High) ⏸️ Supabase 프로젝트 생성 후 진행
  - 테이블: `regions`, `places`, `saved_places`, `courses`
  - 컬럼 정의, RLS(Row Level Security) 정책 설정
- [x] **[ISSUE] 공통 TypeScript 타입 정의** `infra` (High)
  - `types/index.ts` — `Region`, `Place`, `Course`, `FilterTag` 타입
- [x] **[ISSUE] ESLint / Prettier 설정 및 커밋 훅** `infra`

---

## Feature 2: 데이터 파이프라인 `data` · Week 1

- [x] **[ISSUE] 네이버 데이터랩 API 연동 — 지역별 검색량 트렌드 수집** `data` (High)
  - `app/api/cron/naver-trend/route.ts` 구현
  - 주요 서울 지역 키워드 배열 정의 (홍대, 강남, 성수 등)
- [x] **[ISSUE] 서울 실시간 도시데이터 API 연동 — 혼잡도 수집** `data` (High)
  - `app/api/cron/seoul-population/route.ts` 구현
  - 권역별 실시간 인구 데이터 파싱
- [x] **[ISSUE] 지역 핫도 스코어 산출 로직 구현** `data` (High)
  - 검색량 트렌드 + 혼잡도 가중치 합산 → `region_hot_score` 계산
  - 결과 Supabase `regions` 테이블에 upsert
- [x] **[ISSUE] Vercel Cron Job 설정 — 1일 1회 자동 수집** `data`
  - `vercel.json` cron 설정, API Route 보호 (`CRON_SECRET`)
- [x] **[ISSUE] 카카오 로컬 API 연동 — 장소 정보 수집** `data` (High)
  - `app/api/places/route.ts` — 지역명 기반 장소 검색
  - 카테고리 코드 → 서비스 태그 매핑 테이블 정의
- [ ] **[ISSUE] Supabase 캐싱 전략 — API fallback 처리** `data` ⏸️ Supabase 연결 후 진행
  - 외부 API 실패 시 이전 수집 데이터 반환하는 fallback 로직

---

## Feature 3: 핫플 지역 랭킹 (홈 화면) `feature` `ui` · Week 1–2

- [x] **[ISSUE] 홈 화면 레이아웃 구성** `ui` (High)
  - `app/page.tsx` — 지역 랭킹 카드 그리드 레이아웃
- [x] **[ISSUE] 지역 랭킹 카드 컴포넌트 구현** `ui` (High)
  - `components/RegionCard.tsx` — 지역명, 핫도 지표, 대표 이미지
- [x] **[ISSUE] 지역 랭킹 데이터 패칭 훅 구현** `feature` (High)
  - `hooks/useRegionRanking.ts` — Supabase에서 핫도 순위 fetch
- [x] **[ISSUE] 핫도 순위 표시 UI — 실시간 배지 및 트렌드 인디케이터** `ui`
  - 상승/하락 방향 표시, 혼잡도 색상 코드

---

## Feature 4: 지역별 장소 목록 `feature` `ui` · Week 2

- [x] **[ISSUE] 장소 목록 페이지 라우팅 구성** `feature` (High)
  - `app/region/[regionId]/page.tsx` 동적 라우트
- [x] **[ISSUE] 장소 카드 컴포넌트 구현** `ui` (High)
  - `components/PlaceCard.tsx` — 장소명, 카테고리, 무드 태그, 썸네일
- [x] **[ISSUE] 장소 목록 데이터 패칭 훅 구현** `feature` (High)
  - `hooks/usePlacesByRegion.ts` — regionId 기반 장소 목록 fetch
- [ ] **[ISSUE] 카카오맵 JavaScript API 연동 — 지도 초기화** `feature` (High)
  - `components/KakaoMap.tsx` — 동적 import (SSR 비활성화)
  - 장소 목록 마커 렌더링

---

## Feature 5: 이중 필터 (카테고리 × 무드) `feature` `ui` · Week 2

- [ ] **[ISSUE] 필터 태그 상수 정의** `feature` (High)
  - `constants/filterTags.ts` — 카테고리 7개, 무드 7개 고정값
- [ ] **[ISSUE] 필터 바 컴포넌트 구현** `ui` (High)
  - `components/FilterBar.tsx` — 카테고리 탭 + 무드 멀티셀렉트 칩
- [ ] **[ISSUE] 필터 상태 관리 — URL 쿼리 파라미터 동기화** `feature`
  - `useSearchParams` 기반 필터 상태 유지 (새로고침 시 복원)
- [ ] **[ISSUE] 필터 적용 시 장소 목록 실시간 업데이트** `feature` (High)
  - 클라이언트 사이드 필터링 또는 Supabase 쿼리 파라미터 연동

---

## Feature 6: 장소 상세 페이지 `feature` `ui` · Week 2–3

- [ ] **[ISSUE] 장소 상세 페이지 라우팅 구성** `feature` (High)
  - `app/place/[placeId]/page.tsx` 동적 라우트
- [ ] **[ISSUE] 장소 상세 정보 컴포넌트 구현** `ui`
  - 이름, 주소, 카테고리, 무드 태그, 리뷰 요약, 카카오맵 단독 마커
- [ ] **[ISSUE] 리뷰 섹션 컴포넌트 구현** `ui`
  - `components/ReviewList.tsx` — 카카오맵 리뷰 데이터 렌더링
- [ ] **[ISSUE] 저장 버튼 컴포넌트 구현** `ui` (High)
  - `components/SaveButton.tsx` — 로그인 여부 분기, 낙관적 업데이트

---

## Feature 7: 저장 & 공유 `feature` · Week 3

- [ ] **[ISSUE] Supabase Auth 설정 — 소셜 로그인 (카카오/구글)** `feature` (High)
  - `app/api/auth/route.ts`, 로그인 모달 컴포넌트
- [ ] **[ISSUE] 장소 저장/해제 API Route 구현** `feature` (High)
  - `app/api/saved-places/route.ts` — POST / DELETE
- [ ] **[ISSUE] 저장된 장소 목록 페이지 구현** `feature` `ui`
  - `app/saved/page.tsx` — 저장 장소 그리드, 코스 생성 버튼
- [ ] **[ISSUE] 코스 저장 API Route 구현** `feature` (High)
  - `app/api/courses/route.ts` — 장소 배열 → 코스 생성
- [ ] **[ISSUE] 공유 링크 생성 및 공유 페이지 구현** `feature`
  - `app/share/[courseId]/page.tsx` — OG 태그 포함 공유 뷰
  - Web Share API 또는 클립보드 복사 버튼

---

## Feature 8: 동선 묶기 `feature` `ui` · Week 3 (버퍼)

> ⚠️ 3주차 진행 상황에 따라 Post-MVP 조정 가능

- [ ] **[ISSUE] 동선 순서 편집 UI 구현** `ui`
  - `components/CourseEditor.tsx` — 드래그 앤 드롭 장소 순서 정렬
- [ ] **[ISSUE] 카카오맵 경로 폴리라인 렌더링** `feature`
  - 저장 장소 간 이동 경로 지도 위에 표시
- [ ] **[ISSUE] 코스 요약 카드 컴포넌트 구현** `ui`
  - 총 이동 거리, 예상 소요 시간, 장소 순서 요약

---

## Feature 9: 배포 & QA `deploy` · Week 3

- [ ] **[ISSUE] Vercel 프로젝트 연결 및 환경변수 설정** `deploy` (High)
  - Production / Preview 환경 분리, 도메인 설정
- [ ] **[ISSUE] 모바일 반응형 전체 점검** `deploy`
  - 375px(iPhone SE) 기준 레이아웃 검증
- [ ] **[ISSUE] Lighthouse 성능 점검 및 이미지 최적화** `deploy`
  - `next/image` 적용, LCP 3초 이내 목표
- [ ] **[ISSUE] 외부 API 에러 핸들링 전체 점검** `deploy`
  - API 실패 시 빈 상태(Empty State) UI 및 에러 바운더리 처리
- [ ] **[ISSUE] 크로스 브라우저 테스트 (Chrome / Safari 모바일)** `deploy`

---

## 전체 요약

| Feature | 이슈 수 | 마일스톤 |
|---------|---------|----------|
| 1. 프로젝트 초기 세팅 | 6개 (5완료 / 1보류) | Week 1 |
| 2. 데이터 파이프라인 | 6개 (5완료 / 1보류) | Week 1 |
| 3. 핫플 지역 랭킹 | 4개 | Week 1–2 |
| 4. 지역별 장소 목록 | 4개 | Week 2 |
| 5. 이중 필터 | 4개 | Week 2 |
| 6. 장소 상세 페이지 | 4개 | Week 2–3 |
| 7. 저장 & 공유 | 5개 | Week 3 |
| 8. 동선 묶기 | 3개 | Week 3 (버퍼) |
| 9. 배포 & QA | 5개 | Week 3 |
| **전체** | **41개** | |
| **High 우선순위** | **22개** | |
