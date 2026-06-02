# MAGI SYSTEM — Trinity Decision Engine

> 에반게리온 세계관 기반 다중 AI 에이전트 교차 검증 시뮬레이션

![NERV](https://img.shields.io/badge/NERV-MAGI%20SYSTEM-ff6600?style=flat-square&labelColor=0a0a0a)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square)

## 개요

MAGI Trinity는 3개의 AI 엔진(GPT-4o, Claude 3.5 Sonnet, Gemini 1.5 Pro)이 에반게리온의 마기 시스템 페르소나(멜키오르, 발타자르, 카스파르)로 분하여 유저의 안건에 대해 찬/반 투표를 수행하는 웹 시뮬레이션입니다.

9개의 연산 체임버가 독립적으로 판단한 뒤, 이카리 겐도 사령관이 제3의 타협안을 제시하고, 최종 결단은 유저가 내립니다.

## 데모

**Mock 모드**: API 키 없이도 전체 플로우를 체험할 수 있습니다. 가짜 응답 데이터로 동작합니다.

**Real 모드**: OpenRouter API 키를 입력하면 실제 AI 엔진이 판단합니다.

## 시뮬레이션 흐름

```
1. 안건 입력 (최대 500자)
   └→ "회사에서 주 4일 근무제를 도입해야 할까"

2. AI 전처리
   └→ "주 4일 근무제를 도입해야 하는가?" (찬반 판정 가능 형식으로 변환)

3. 9개 체임버 병렬 연산
   ├── 독립형 3개: 각 AI가 3 페르소나 모두 수행
   └── 협력형 6개: AI별 1 페르소나, 독립→토론→투표

4. 트리니티 매트릭스
   └→ 9개 체임버 가결/부결 집계 (예: APPROVE 6 : REJECT 3)

5. 사령관 중재안
   └→ 이카리 겐도가 냉철한 제3의 타협안 제시

6. 최종 결단
   ├── [1] 마기 다수결에 따른다
   ├── [2] 사령관 권고안을 채택한다
   └── [3] 인류보완계획을 발동한다
```

## 9개 연산 체임버

### 독립형 (각 AI가 3 페르소나 모두 담당)

| 체임버 | AI 엔진 |
|--------|---------|
| Chamber-1 | GPT-4o |
| Chamber-2 | Claude 3.5 Sonnet |
| Chamber-3 | Gemini 1.5 Pro |

### 협력형 (AI 순열 조합, 2라운드 토론)

| 체임버 | 멜키오르 | 발타자르 | 카스파르 |
|--------|----------|----------|----------|
| Chamber-4 | GPT | Claude | Gemini |
| Chamber-5 | GPT | Gemini | Claude |
| Chamber-6 | Claude | GPT | Gemini |
| Chamber-7 | Claude | Gemini | GPT |
| Chamber-8 | Gemini | GPT | Claude |
| Chamber-9 | Gemini | Claude | GPT |

## 3대 인격 페르소나

- **멜키오르 (MELCHIOR)** — 과학자: 순수 논리, 데이터 효율성, 정량 리스크 분석
- **발타자르 (BALTHASAR)** — 어머니: 인간 중심 윤리, 주관적 가치, 장기적 안정성
- **카스파르 (CASPAR)** — 여성: 파괴적 혁신, 변칙성, 과감한 실험적 아이디어

## 사용법

### 1. 로컬 실행

```bash
git clone https://github.com/kkaengEminE/magi-trinity.git
cd magi-trinity
npm install
npm run dev
```

`http://localhost:3000` 으로 접속합니다.

### 2. API 키 설정 (선택)

API 키 없이도 **Mock 모드**로 전체 플로우를 체험할 수 있습니다.
실제 AI를 사용하려면 아래 절차를 따르세요:

#### OpenRouter API 키 발급

1. [https://openrouter.ai](https://openrouter.ai) 에 접속하여 회원가입
2. 로그인 후 [https://openrouter.ai/keys](https://openrouter.ai/keys) 에서 **Create Key** 클릭
3. 생성된 `sk-or-v1-...` 형태의 키를 복사

#### 앱에 키 입력

1. MAGI SYSTEM 메인 화면 우상단의 **🟡 MOCK MODE — CONFIG** 클릭
2. 모달 창에 OpenRouter API 키 붙여넣기
3. **SAVE** 클릭

> **보안 안내**: API 키는 브라우저의 `localStorage`에만 저장되며, 외부 서버로 전송되지 않습니다. 키는 브라우저에서 OpenRouter API로 직접 호출할 때만 사용됩니다.

키를 입력하면 상태가 **🟢 API ACTIVE**로 변경되고, 이후 시뮬레이션에서 실제 GPT-4o / Claude 3.5 Sonnet / Gemini 1.5 Pro가 응답합니다.

키를 삭제하면 자동으로 Mock 모드로 복귀합니다.

### 3. 빌드 및 배포

```bash
npm run build    # out/ 디렉토리에 정적 파일 생성
```

GitHub에 push하면 GitHub Actions를 통해 GitHub Pages로 자동 배포됩니다.
(Settings → Pages → Source를 **GitHub Actions**로 설정 필요)

## 기술 스택

| 항목 | 기술 |
|------|------|
| 프레임워크 | Next.js 14 (App Router, Static Export) |
| 언어 | TypeScript |
| 상태 관리 | Zustand |
| 스타일링 | Tailwind CSS |
| AI API | OpenRouter (GPT-4o, Claude, Gemini 통합) |
| 배포 | GitHub Pages |

## 프로젝트 구조

```
src/
├── app/              # Next.js 페이지 (layout, page, CSS)
├── components/       # React 컴포넌트
│   ├── AgendaInput   # Phase 1: 안건 입력 폼
│   ├── ChamberGrid   # Phase 2: 체임버 연산 진행
│   ├── TrinityMatrix # Phase 3: 결과 매트릭스
│   ├── FinalDecision # Phase 4: 최종 결단
│   └── ...           # ApiKeyModal, ErrorOverlay 등
├── core/             # 비즈니스 로직
│   ├── chamber.ts    # 체임버 오케스트레이터
│   ├── prompts.ts    # 페르소나 프롬프트
│   └── voting.ts     # 투표 집계
├── providers/        # AI API 추상화
│   ├── openrouter.ts # OpenRouter 실제 호출 (5회 재시도)
│   ├── mock.ts       # Mock 데이터 프로바이더
│   └── factory.ts    # Mock/Real 자동 전환
├── store/            # Zustand 상태 관리
└── types/            # TypeScript 타입 정의
```

## 라이선스

MIT
