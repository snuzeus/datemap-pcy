# Agent 개발 Workflow

> 답정너 프로젝트 — Claude Code 기반 AI 보조 개발 워크플로우
> Feature 1~3 실제 개발 경험을 바탕으로 작성

---

## 1. 핵심 구조

이 프로젝트는 세 가지 파일이 AI와의 협업 기반이 된다.

| 파일 | 역할 |
|------|------|
| `CLAUDE.md` | 기술 설계서. 폴더 구조, User Flow, 상태 규칙, 디자인 시스템 정의. Claude가 항상 참조하는 컨텍스트. |
| `docs/checklist.md` | Feature별 개발 Task 목록. GitHub Issue와 1:1 매핑. |
| `docs/agent-workflow.md` | 지금 이 문서. 개발 방식과 패턴 정의. |

---

## 2. 작업 단위 쪼개기 기준

### 브랜치 단위 — Feature
기능 묶음 하나 = 브랜치 하나. Feature 완료 시 PR 1개.

```
feature/place-list      ← Feature 4: 지역별 장소 목록
feature/filter          ← Feature 5: 이중 필터
feature/place-detail    ← Feature 6: 장소 상세
```

새 Feature 시작 시 반드시 `main`에서 새 브랜치를 만들고 시작한다:

```bash
git checkout main
git pull upstream main        # upstream 최신 반영
git checkout -b feature/[이름]
```

브랜치 이름 규칙: `feature/[영문-소문자-하이픈]`

### Issue 단위 — 파일 or 독립 로직 1개
커밋 1개 = Issue 1개. `closes #N` 으로 자동 닫힘.

| Issue 기준 | 예시 |
|-----------|------|
| 새 파일 1개 | `RegionCard.tsx` 구현 |
| API Route 1개 | `/api/places/route.ts` |
| 훅 1개 | `useRegionRanking.ts` |
| 스토어 1개 | `useFilterStore.ts` |
| 타입/상수 묶음 | `types/index.ts` + `constants/filterTags.ts` |

### 쪼개지 않는 경우
- 컴포넌트와 그 컴포넌트에서만 쓰는 훅은 같은 Issue로 처리
- 버그 픽스는 별도 커밋 (`fix:`)으로 분리

---

## 3. 개발 사이클 한 바퀴

```
① GitHub에서 다음 Issue 확인
        ↓
① -1. 새 Feature면 브랜치 생성: git checkout main → git pull upstream main → git checkout -b feature/[이름]
        ↓
② Claude에게 요청 (패턴 A~D 중 선택)
        ↓
③ Claude가 구현 → 변경 사항 설명 + QA 체크리스트 제공
        ↓
④ npx tsc --noEmit 타입 확인
        ↓
⑤ 브라우저에서 직접 확인 (QA 체크리스트 기준)
        ↓
⑥ 커밋: git commit -m "feat: ... closes #N"
        ↓
⑦ checklist.md [x] 체크
        ↓
⑧ Feature 내 다음 Issue로 → 반복
        ↓
⑨ Feature 완료 → push origin + push upstream → PR 생성
```

---

## 4. AI 요청 프롬프트 패턴

### 패턴 A — 다음 이슈 진행 (가장 많이 씀)
```
다음 이슈 진행해줘
```
CLAUDE.md와 checklist.md를 Claude가 알고 있으므로 맥락 설명 없이도 작동한다.
Claude가 어떤 Issue를 선택했는지 확인하고, 맞으면 바로 진행.

---

### 패턴 B — 특정 이슈 지정
```
[Feature 4] PlaceCard 컴포넌트 구현해줘 (#12)
```
Issue 번호와 기능명을 명시하면 Claude가 CLAUDE.md에서 관련 설계를 찾아 구현한다.

---

### 패턴 C — 버그/에러 수정
```
[에러 메시지 붙여넣기]
이거 수정해줘
```
에러 메시지만 주면 충분하다. 파일 경로를 아는 경우 추가로 알려주면 더 빠르다.

---

### 패턴 D — 코드 이해 요청
```
[파일명 or 코드 블록]
이거 [구조 / 코드] 관점으로 설명해줘
```
단순 "이게 뭐야"보다 관점을 지정하면 원하는 수준의 설명이 나온다.

---

### 공통 규칙
- CLAUDE.md에 있는 내용은 재설명 안 해도 된다
- 에러가 있으면 메시지 전체를 그대로 붙여넣는다
- "어떻게 생각해?" 같은 열린 질문보다 "A 방식으로 할까, B 방식으로 할까?" 처럼 선택지를 주는 게 답이 더 빠르다

---

## 5. 내가 직접 검증해야 할 체크포인트

Claude는 코드를 짜지만, 아래는 **반드시 직접 확인**해야 한다.

### 커밋 전 (터미널)
- [ ] `npx tsc --noEmit` — 타입 에러 0개
- [ ] `npm run test:run` — 테스트 통과

### 브라우저 확인
- [ ] `npm run dev` 후 콘솔에 빨간 에러 없음
- [ ] 구현한 화면이 CLAUDE.md §6 디자인 시스템과 일치하는지
- [ ] 모바일 375px 기준 레이아웃 확인 (DevTools → iPhone 12 Pro)

### 외부 의존성 관련
- [ ] 환경변수가 필요한 기능은 `.env.local.example`에 키 추가됐는지
- [ ] 외부 API 연동 코드는 API 미설정 시 앱 크래시 없이 fallback 처리되는지
- [ ] Supabase 쿼리는 `isSupabaseConfigured` 체크 후 실행되는지

### PR 전
- [ ] `closes #이슈번호` 커밋 메시지에 포함됐는지
- [ ] checklist.md 해당 항목 `[x]` 체크했는지
- [ ] 새 환경변수 생겼다면 `.env.local.example`에 추가했는지

---

## 6. 외부 API 미연결 상태에서 개발하는 방법

Supabase, 카카오, 네이버 등 외부 API 없이도 UI 개발을 먼저 진행한다.

```
실제 데이터 필요한 부분 → mock 데이터로 대체
API 호출 훅 → enabled: isConfigured 조건으로 실행 방지
```

예시 패턴 (`useRegionRanking.ts`):
```ts
// Supabase 없으면 쿼리 실행 안 함
enabled: isSupabaseConfigured

// page.tsx에서 fallback
const regions = data && data.length > 0 ? data : MOCK_REGIONS;
```

외부 API 연결 후에는 mock 데이터 fallback 코드만 제거하면 된다.

---

## 7. CLAUDE.md 업데이트 기준

개발 중 설계가 바뀌면 CLAUDE.md도 바꿔야 한다.

| 상황 | 업데이트 섹션 |
|------|-------------|
| 새 컴포넌트 추가 | §2 폴더 구조 |
| User Flow 변경 | §3 User Flow |
| 새 스토어/훅 추가 | §5 State 규칙 |
| 디자인 토큰 변경 | §6 Design System |
| 새 외부 API 추가 | §1 기술 스택, §4 Context Logic |
