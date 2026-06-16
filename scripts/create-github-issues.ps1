# 답정너 GitHub Issues 일괄 생성 스크립트
# 실행 전: gh auth login 완료 필요
# 실행법: .\scripts\create-github-issues.ps1

$REPO = "boostcampwm-snu-2026-1/datemap-pcy"

Write-Host "=== Labels 생성 ===" -ForegroundColor Cyan
gh label create "infra"   --color "6e6e6e" --description "세팅, 환경, DB"           --repo $REPO 2>$null
gh label create "data"    --color "0075ca" --description "API 연동, 데이터 수집"     --repo $REPO 2>$null
gh label create "feature" --color "2ea44f" --description "기능 로직"                --repo $REPO 2>$null
gh label create "ui"      --color "7057ff" --description "컴포넌트, 화면"            --repo $REPO 2>$null
gh label create "deploy"  --color "e11d48" --description "배포, QA"                 --repo $REPO 2>$null
Write-Host "Labels 완료" -ForegroundColor Green

Write-Host "`n=== Milestones 생성 ===" -ForegroundColor Cyan
gh api repos/$REPO/milestones -f title="Week 1" -f due_on="2026-05-31T23:59:59Z" -f state="open" | Out-Null
gh api repos/$REPO/milestones -f title="Week 2" -f due_on="2026-06-07T23:59:59Z" -f state="open" | Out-Null
gh api repos/$REPO/milestones -f title="Week 3" -f due_on="2026-06-14T23:59:59Z" -f state="open" | Out-Null
Write-Host "Milestones 완료" -ForegroundColor Green

Write-Host "`n=== Issues 생성 ===" -ForegroundColor Cyan

# ── Feature 1: 프로젝트 초기 세팅 ──
$f1 = @(
  @{ title="[Feature 1] Next.js 14 프로젝트 초기화 및 폴더 구조 설정";      labels="infra"; milestone="Week 1" }
  @{ title="[Feature 1] Tailwind CSS 및 글로벌 스타일 설정";                labels="infra"; milestone="Week 1" }
  @{ title="[Feature 1] Supabase 프로젝트 연결 및 환경변수 설정";           labels="infra"; milestone="Week 1" }
  @{ title="[Feature 1] Supabase DB 스키마 설계 및 마이그레이션";           labels="infra"; milestone="Week 1" }
  @{ title="[Feature 1] 공통 TypeScript 타입 정의 (types/index.ts)";       labels="infra"; milestone="Week 1" }
  @{ title="[Feature 1] ESLint / Prettier 설정";                           labels="infra"; milestone="Week 1" }
)

# ── Feature 2: 데이터 파이프라인 ──
$f2 = @(
  @{ title="[Feature 2] 서울 실시간 도시데이터 API 연동 — 혼잡도 수집";      labels="data"; milestone="Week 1" }
  @{ title="[Feature 2] 지역 핫도 스코어 산출 로직 구현 (lib/hotScore.ts)"; labels="data"; milestone="Week 1" }
  @{ title="[Feature 2] Vercel Cron Job 설정 — 1일 1회 자동 수집";          labels="data"; milestone="Week 1" }
  @{ title="[Feature 2] 카카오 로컬 API 연동 — 장소 정보 수집";              labels="data"; milestone="Week 1" }
  @{ title="[Feature 2] Supabase 캐싱 전략 및 API fallback 처리";           labels="data"; milestone="Week 1" }
)

# ── Feature 3: 핫플 지역 랭킹 ──
$f3 = @(
  @{ title="[Feature 3] 홈 화면 레이아웃 구성 (빅카드 + 가로 스크롤)";       labels="ui";      milestone="Week 1" }
  @{ title="[Feature 3] RegionCard 컴포넌트 구현";                          labels="ui";      milestone="Week 1" }
  @{ title="[Feature 3] 지역 랭킹 데이터 패칭 훅 구현 (useRegionRanking)";  labels="feature"; milestone="Week 1" }
  @{ title="[Feature 3] 핫도 순위 배지 및 트렌드 인디케이터 UI";              labels="ui";      milestone="Week 2" }
)

# ── Feature 4: 지역별 장소 목록 ──
$f4 = @(
  @{ title="[Feature 4] 장소 목록 페이지 라우팅 구성 (region/[regionId])";  labels="feature"; milestone="Week 2" }
  @{ title="[Feature 4] PlaceCard 컴포넌트 구현";                           labels="ui";      milestone="Week 2" }
  @{ title="[Feature 4] 지역별 장소 패칭 훅 구현 (usePlacesByRegion)";      labels="feature"; milestone="Week 2" }
  @{ title="[Feature 4] 카카오맵 JavaScript API 연동 — 지도 초기화 및 마커"; labels="feature"; milestone="Week 2" }
)

# ── Feature 5: 이중 필터 ──
$f5 = @(
  @{ title="[Feature 5] 필터 태그 상수 정의 (카테고리 7개, 무드 7개)";        labels="feature"; milestone="Week 2" }
  @{ title="[Feature 5] FilterBar 컴포넌트 구현 (카테고리 x 무드 이중 필터)"; labels="ui";      milestone="Week 2" }
  @{ title="[Feature 5] 필터 상태 URL 쿼리 파라미터 동기화";                  labels="feature"; milestone="Week 2" }
  @{ title="[Feature 5] 필터 적용 시 장소 목록 실시간 업데이트";               labels="feature"; milestone="Week 2" }
)

# ── Feature 6: 장소 상세 ──
$f6 = @(
  @{ title="[Feature 6] 장소 상세 페이지 라우팅 구성 (place/[placeId])";    labels="feature"; milestone="Week 2" }
  @{ title="[Feature 6] 장소 상세 정보 컴포넌트 구현";                       labels="ui";      milestone="Week 2" }
  @{ title="[Feature 6] 리뷰 섹션 컴포넌트 구현 (ReviewList)";               labels="ui";      milestone="Week 3" }
  @{ title="[Feature 6] SaveButton 컴포넌트 구현 (낙관적 업데이트)";          labels="ui";      milestone="Week 3" }
)

# ── Feature 7: 저장 & 공유 ──
$f7 = @(
  @{ title="[Feature 7] Supabase Auth 설정 — 소셜 로그인 (카카오/구글)";    labels="feature"; milestone="Week 3" }
  @{ title="[Feature 7] 장소 저장/해제 API Route 구현";                     labels="feature"; milestone="Week 3" }
  @{ title="[Feature 7] 저장된 장소 목록 페이지 구현 (/saved)";              labels="ui";      milestone="Week 3" }
  @{ title="[Feature 7] 코스 저장 API Route 구현";                          labels="feature"; milestone="Week 3" }
  @{ title="[Feature 7] 공유 링크 생성 및 공유 페이지 구현 (/share/[courseId])"; labels="feature"; milestone="Week 3" }
)

# ── Feature 8: 동선 묶기 (버퍼) ──
$f8 = @(
  @{ title="[Feature 8] 동선 순서 편집 UI 구현 (CourseEditor)";             labels="ui";      milestone="Week 3" }
  @{ title="[Feature 8] 카카오맵 경로 폴리라인 렌더링";                       labels="feature"; milestone="Week 3" }
  @{ title="[Feature 8] 코스 요약 카드 컴포넌트 구현";                        labels="ui";      milestone="Week 3" }
)

# ── Feature 9: 배포 & QA ──
$f9 = @(
  @{ title="[Feature 9] Vercel 프로젝트 연결 및 환경변수 설정";              labels="deploy"; milestone="Week 3" }
  @{ title="[Feature 9] 모바일 반응형 전체 점검 (375px 기준)";               labels="deploy"; milestone="Week 3" }
  @{ title="[Feature 9] Lighthouse 성능 점검 및 이미지 최적화";              labels="deploy"; milestone="Week 3" }
  @{ title="[Feature 9] 외부 API 에러 핸들링 전체 점검";                     labels="deploy"; milestone="Week 3" }
  @{ title="[Feature 9] 크로스 브라우저 테스트 (Chrome / Safari 모바일)";   labels="deploy"; milestone="Week 3" }
)

$allIssues = $f1 + $f2 + $f3 + $f4 + $f5 + $f6 + $f7 + $f8 + $f9
$total = $allIssues.Count
$count = 0

foreach ($issue in $allIssues) {
  $count++
  Write-Host "[$count/$total] $($issue.title)" -ForegroundColor Gray
  gh issue create `
    --repo $REPO `
    --title $issue.title `
    --label $issue.labels `
    --milestone $issue.milestone `
    --body "" 2>&1 | Out-Null
}

Write-Host "`n=== 완료: $total개 Issue 생성됨 ===" -ForegroundColor Green
Write-Host "확인: https://github.com/$REPO/issues" -ForegroundColor Cyan
