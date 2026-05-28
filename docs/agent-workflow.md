# Agent 개발 Workflow

> 답정너 프로젝트의 AI 보조 개발 흐름 정의서
> Claude Code (claude-sonnet-4-6) 기반

---

## 1. 작업 단위 쪼개기 기준

### 기본 원칙
- **브랜치 단위**: Feature (기능 묶음) — `feature/data-pipeline`
- **Issue 단위**: 파일 1개 or 독립 로직 1개
- **커밋 단위**: Issue 1개 완료 시 — `feat: ... closes #N`

### 쪼개는 기준

| 상황 | 단위 |
|------|------|
| 새 페이지/라우트 추가 | 1 Issue |
| 새 컴포넌트 1개 | 1 Issue |
| API Route 1개 | 1 Issue |
| 외부 API 연동 1개 | 1 Issue |
| 훅(hook) 1개 | 1 Issue |
| 스토어(store) 1개 | 1 Issue |

### 쪼개지 않는 경우
- 타입 정의 + 상수 파일은 함께 (1 Issue)
- 컴포넌트와 그 전용 훅은 함께 (1 Issue)

---

## 2. Claude에게 요청하는 프롬프트 패턴

### 기본 구조
```
[맥락] + [요청] + [제약]
```

### 패턴 A — 새 파일 생성
```
CLAUDE.md의 설계를 따라서,
[파일명]을 구현해줘.

요구사항:
- [구체적 동작 1]
- [구체적 동작 2]

제약:
- TypeScript strict
- 타입은 types/index.ts에서 import
```

**예시:**
```
CLAUDE.md의 설계를 따라서,
hooks/useRegionRanking.ts를 구현해줘.

요구사항:
- Supabase regions 테이블에서 hot_score 내림차순으로 10개 fetch
- queryKey: ['regions'], staleTime: 5분
- 로딩/에러 상태 반환

제약:
- TanStack Query v5 문법 사용
- 타입은 types/index.ts의 Region 타입 사용
```

---

### 패턴 B — 버그 수정
```
[파일명]에서 [증상]이 발생해.

현재 코드: [코드 또는 파일 경로]
예상 동작: [무엇이 되어야 하는지]
실제 동작: [무엇이 되고 있는지]

원인 찾아서 수정해줘.
```

---

### 패턴 C — 기존 코드 수정
```
[파일명]에 [기능]을 추가해줘.

현재: [현재 동작]
추가할 것: [구체적으로 무엇]

CLAUDE.md §[섹션번호] 기준으로 구현.
```

---

### 패턴 D — 리뷰 요청
```
[파일명] 코드 리뷰해줘.

체크해줄 것:
- CLAUDE.md 설계와 일치하는지
- 타입 안전성
- 엣지 케이스 누락 여부
```

---

## 3. 맥락 제공 규칙

### Claude에게 항상 주는 맥락
- `CLAUDE.md` — 전체 설계 (자동 로드됨)
- 관련 타입 파일 (`types/index.ts`)
- 연관 파일 경로 명시

### 추가로 주면 좋은 맥락
- 현재 에러 메시지 (있을 경우)
- 연동되는 API Route의 응답 형태
- 관련 Supabase 테이블 스키마

### 주지 않아도 되는 것
- 이미 CLAUDE.md에 있는 내용 재설명
- 전체 코드베이스 설명 (파일명으로 충분)

---

## 4. 내가 직접 검증/판단해야 할 체크포인트

Claude가 코드를 생성하면 **반드시 아래를 직접 확인**해야 한다.

### 코드 생성 후 체크
- [ ] `types/index.ts` 타입과 실제 Supabase 컬럼명이 일치하는가
- [ ] 외부 API 키가 환경변수로 처리되었는가 (하드코딩 없는지)
- [ ] `CLAUDE.md`의 queryKey 형태와 동일한가
- [ ] 낙관적 업데이트 롤백 로직이 있는가 (mutation)

### 브라우저/서버 실행 후 체크
- [ ] 카카오맵이 SSR에서 에러 없이 로드되는가
- [ ] 필터 변경 시 URL 쿼리 파라미터가 실제로 업데이트되는가
- [ ] 비로그인 상태에서 저장 버튼이 AuthModal을 여는가
- [ ] Cron API가 인증 없이 호출되면 401을 반환하는가

### PR 머지 전 체크
- [ ] `docs/checklist.md`의 해당 항목을 `[x]`로 변경했는가
- [ ] 커밋 메시지에 `closes #이슈번호`가 있는가
- [ ] 새 환경변수가 생겼다면 `.env.example`에 추가했는가

---

## 5. 개발 사이클 한 바퀴

```
Issue 확인 (GitHub)
    ↓
CLAUDE.md 해당 섹션 열어두기
    ↓
Claude에게 패턴 A/B/C로 요청
    ↓
생성된 코드 체크포인트 4-1 검토
    ↓
로컬 실행 → 체크포인트 4-2 검토
    ↓
커밋 (closes #N)
    ↓
checklist.md [x] 체크
    ↓
다음 Issue
```

---

## 6. CLAUDE.md 업데이트 기준

개발 중 설계가 바뀌면 CLAUDE.md도 바꿔야 한다.

| 상황 | 업데이트 항목 |
|------|--------------|
| 새 컴포넌트 추가 | §2 폴더 구조 |
| User Flow 변경 | §3 User Flow |
| 새 상태/스토어 추가 | §5 State 규칙 |
| 디자인 토큰 변경 | §6 Design System |
| 새 외부 API 추가 | §1 기술 스택, §4 Context Logic |
