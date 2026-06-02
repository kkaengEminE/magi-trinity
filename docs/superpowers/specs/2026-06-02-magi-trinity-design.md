# MAGI Trinity — 설계 문서

## 개요

에반게리온 세계관 기반 다중 AI 에이전트 교차 검증 시뮬레이션 웹 애플리케이션.
유저가 안건을 입력하면 3개 AI 엔진(GPT-4o, Claude 3.5 Sonnet, Gemini 1.5 Pro)이 3개 페르소나(멜키오르, 발타자르, 카스파르)로 9개 체임버에서 찬/반 투표를 수행하고, 이카리 겐도가 중재안을 제시한 뒤 유저가 최종 결단을 내린다.

## 아키텍처

### 기술 스택
- **프레임워크**: Next.js 14 (App Router, `output: 'export'` 정적 빌드)
- **언어**: TypeScript
- **상태 관리**: Zustand
- **스타일링**: Tailwind CSS
- **AI API 호출**: OpenRouter API (단일 키로 GPT/Claude/Gemini 모두 호출)
- **배포**: GitHub Pages (정적 SPA)

### 폴더 구조
```
src/
├── app/                  # Next.js App Router (layout, page)
├── components/
│   ├── AgendaInput/      # Phase 1: 안건 입력 폼
│   ├── ChamberGrid/      # Phase 2: 체임버 연산 진행
│   ├── TrinityMatrix/    # Phase 3: 결과 매트릭스 + 겐도
│   ├── FinalDecision/    # Phase 4: 유저 최종 결단
│   ├── ApiKeySettings/   # API 키 설정 모달
│   └── shared/           # 공용 UI (버튼, 로딩, 에러)
├── core/
│   ├── chamber.ts        # 체임버 연산 오케스트레이터
│   ├── voting.ts         # 투표 집계 알고리즘
│   └── preprocess.ts     # 안건 전처리 파이프라인
├── providers/
│   ├── types.ts          # AI 프로바이더 인터페이스
│   ├── openrouter.ts     # OpenRouter 실제 API 호출
│   └── mock.ts           # Mock 데이터 프로바이더
├── store/
│   └── useStore.ts       # Zustand 글로벌 상태
├── styles/
│   └── evangelion.css     # NERV 콘솔 테마 커스텀 CSS
└── types/
    └── index.ts          # 공유 타입 정의
```

### 데이터 흐름
```
유저 안건 입력 (500자 제한)
    → 전처리 AI: "~~해야 하는가?" 표준 형식 변환
    → 9개 체임버 병렬 연산
        ├── 독립형 3개: 각 AI가 3 페르소나 모두 수행
        └── 협력형 6개: AI별 1 페르소나, 독립→토론→투표
    → 트리니티 매트릭스 집계 (가결/부결 스코어)
    → 이카리 겐도 중재안 생성
    → 유저 최종 결단 (3가지 선택지)
```

## 9개 연산 체임버

### 독립형 체임버 (3개)
각 AI 엔진이 단독으로 멜키오르, 발타자르, 카스파르 3역할을 모두 수행.

| 체임버 | AI 엔진 | 설명 |
|--------|---------|------|
| Chamber-1 | GPT-4o | 3 페르소나 각각 의견 + 투표 |
| Chamber-2 | Claude 3.5 Sonnet | 3 페르소나 각각 의견 + 투표 |
| Chamber-3 | Gemini 1.5 Pro | 3 페르소나 각각 의견 + 투표 |

### 협력형 체임버 (6개)
3개 AI의 순열 조합. "독립 후 토론" 2라운드 방식:
- **Round 1**: 각 AI가 배정된 페르소나로 독립 의견 생성
- **Round 2**: 다른 AI의 Round 1 의견을 컨텍스트로 받고 최종 투표

| 체임버 | 멜키오르 | 발타자르 | 카스파르 |
|--------|----------|----------|----------|
| Chamber-4 | GPT | Claude | Gemini |
| Chamber-5 | GPT | Gemini | Claude |
| Chamber-6 | Claude | GPT | Gemini |
| Chamber-7 | Claude | Gemini | GPT |
| Chamber-8 | Gemini | GPT | Claude |
| Chamber-9 | Gemini | Claude | GPT |

### 투표 규칙
- 체임버당 3표 (페르소나당 1표)
- 다수결: 2:1 또는 3:0 — 중립 불가
- 체임버 결과: 가결(APPROVE) 또는 부결(REJECT)

## 페르소나 정의

### MAGI 3대 인격
- **멜키오르 (Melchior)**: 과학자. 순수 논리, 데이터 효율성, 정량 리스크 분석.
- **발타자르 (Balthasar)**: 어머니. 인간 중심 윤리, 주관적 가치, 장기적 안정성.
- **카스파르 (Caspar)**: 여성. 파괴적 혁신, 변칙성, 과감한 실험적 아이디어.

### 이카리 겐도 (사령관)
- 9개 체임버 결과를 모두 피딩받아 제3의 타협안 제시
- 스코어 비율에 영향받지 않는 독립적 판단
- 말투: "~한다", "~인정하지 않는다" 등 단호한 하향식 명령조

## UI/UX

### 4단계 화면 전환 (단일 페이지, 상태 기반)

**Phase 1 — 안건 입력**
- 터미널 스타일 입력 폼
- 500자 실시간 카운터
- API 키 설정 버튼 (우상단)
- "MAGI SYSTEM ACTIVATE" 제출 버튼

**Phase 2 — 체임버 연산 중**
- 9개 체임버 그리드, 순차적 활성화 애니메이션
- 체임버별 "동기화 중..." → 완료 시 가결/부결 아이콘
- 전체 진행률 표시

**Phase 3 — 트리니티 매트릭스 + 겐도 중재안**
- 9개 체임버 가결/부결 매트릭스 테이블
- 체임버 클릭 시 3 페르소나 의견 펼쳐보기
- 전체 스코어 요약 (예: APPROVE 6 / REJECT 3)
- 이카리 겐도 인용구 블록

**Phase 4 — 유저 최종 결단**
- 3개 선택지 버튼:
  1. "마기 다수결에 따른다" (매트릭스 결과 수용)
  2. "사령관 권고안을 채택한다" (겐도 중재안 수용)
  3. "인류보완계획을 발동한다" (유저 독자 판단)
- 클릭 시 결과 아카이브 저장 + 완료 화면

### 비주얼 테마
- 검정/주황/녹색 기조 — NERV 콘솔 스타일
- 모노스페이스 폰트
- 스캔라인/글리치 이펙트
- 반응형 (모바일 대응)

## API 연동

### OpenRouter 통합
- 단일 OpenRouter API 키로 GPT-4o, Claude 3.5 Sonnet, Gemini 1.5 Pro 모두 호출
- CORS 문제 없음 (OpenRouter는 브라우저 직접 호출 허용)
- 모델 ID: `openai/gpt-4o`, `anthropic/claude-3.5-sonnet`, `google/gemini-pro-1.5`

### API 키 관리
- 유저가 설정 화면에서 OpenRouter API 키 입력
- `localStorage`에만 저장 (서버 전송 없음)
- 키 미입력 시 자동으로 Mock 모드 전환

### Mock 프로바이더
- 실제 API와 동일한 인터페이스
- 랜덤 지연(1~3초) + 사전 정의된 응답 데이터
- API 키 없이도 전체 플로우 체험 가능

## 에러 처리

- API 호출 실패 시 최대 5회 자동 재시도 (exponential backoff)
- 재시도 중 "마기 시스템 동기화 중..." 로딩 애니메이션
- 5회 초과 실패 → "네르프 본부 통신 회선 장애" 에러 팝업 → Phase 1으로 복귀
- 유저 입력 500자 초과 시 프론트엔드에서 제출 차단 + 경고

## 제약 사항
- 유저 입력: 최대 500자
- 페르소나 의견: 1줄 50자 내외 (프롬프트 가드레일)
- 투표: 찬/반만 허용, 중립 불가
- 겐도 중재안: 투표 스코어와 독립적, 항상 제3의 대안 제시
