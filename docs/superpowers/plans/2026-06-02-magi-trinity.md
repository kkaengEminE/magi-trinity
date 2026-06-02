# MAGI Trinity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static SPA simulating multi-AI agent cross-verification with Evangelion NERV console aesthetics, deployable to GitHub Pages.

**Architecture:** Next.js 14 static export with Zustand state management. AI calls go through OpenRouter API (client-side, user provides key) with a Mock provider fallback. 9 computation chambers (3 independent + 6 collaborative) vote APPROVE/REJECT, Ikari Gendo provides a third-way mediation, and the user makes the final decision.

**Tech Stack:** Next.js 14 (App Router, static export), TypeScript, Zustand, Tailwind CSS, OpenRouter API

---

## File Structure

```
magi-trinity/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout with fonts, metadata, global CSS
│   │   ├── page.tsx                # Main page — renders PhaseController
│   │   └── globals.css             # Tailwind directives + evangelion theme vars
│   ├── components/
│   │   ├── PhaseController.tsx     # State-driven phase switcher (Phase 1-4)
│   │   ├── AgendaInput.tsx         # Phase 1: text input + char counter + submit
│   │   ├── ChamberGrid.tsx         # Phase 2: 9 chamber cards with progress
│   │   ├── ChamberCard.tsx         # Single chamber card (loading/result states)
│   │   ├── TrinityMatrix.tsx       # Phase 3: result table + score summary
│   │   ├── ChamberDetail.tsx       # Expandable persona opinions per chamber
│   │   ├── GendoMediation.tsx      # Gendo blockquote with persona styling
│   │   ├── FinalDecision.tsx       # Phase 4: 3 decision buttons + archive
│   │   ├── ApiKeyModal.tsx         # API key input modal
│   │   ├── ErrorOverlay.tsx        # "NERV 통신 장애" error popup
│   │   └── ScanlineOverlay.tsx     # CRT scanline visual effect
│   ├── core/
│   │   ├── preprocess.ts           # Agenda text → standard yes/no format
│   │   ├── chamber.ts              # Chamber orchestrator (run all 9)
│   │   ├── prompts.ts              # All persona/gendo system prompts
│   │   └── voting.ts               # Vote tally: 3 votes → APPROVE/REJECT
│   ├── providers/
│   │   ├── types.ts                # AIProvider interface + response types
│   │   ├── openrouter.ts           # OpenRouter fetch wrapper with retry
│   │   ├── mock.ts                 # Mock provider with random delays
│   │   └── factory.ts              # getProvider(): mock or real based on key
│   ├── store/
│   │   └── useStore.ts             # Zustand store: phase, chambers, results
│   └── types/
│       └── index.ts                # Shared types: Chamber, Vote, Persona, etc.
├── public/
│   └── favicon.ico
├── tailwind.config.ts
├── tsconfig.json
├── next.config.js
├── package.json
└── .github/
    └── workflows/
        └── deploy.yml              # GitHub Pages deploy action
```

---

### Task 1: Project Scaffolding

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.js`, `tailwind.config.ts`, `postcss.config.js`
- Create: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`

- [ ] **Step 1: Initialize Next.js project**

```bash
cd /Users/cclss/Desktop/magi-trinity
npx create-next-app@14 . --typescript --tailwind --eslint --app --src-dir --no-import-alias --use-npm
```

- [ ] **Step 2: Configure static export in next.config.js**

Replace `next.config.js` content with:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
```

- [ ] **Step 3: Install Zustand**

```bash
cd /Users/cclss/Desktop/magi-trinity && npm install zustand
```

- [ ] **Step 4: Set up Evangelion theme in globals.css**

Replace `src/app/globals.css` with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --nerv-black: #0a0a0a;
  --nerv-orange: #ff6600;
  --nerv-orange-dim: #cc5200;
  --nerv-green: #00ff41;
  --nerv-green-dim: #00cc33;
  --nerv-red: #ff0033;
  --nerv-purple: #7b2d8e;
  --nerv-gray: #1a1a2e;
  --nerv-gray-light: #2a2a3e;
  --nerv-text: #e0e0e0;
  --nerv-text-dim: #888;
}

body {
  background-color: var(--nerv-black);
  color: var(--nerv-text);
  font-family: 'Courier New', 'Consolas', monospace;
  overflow-x: hidden;
}

/* Scanline effect */
.scanline-overlay {
  pointer-events: none;
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.03) 0px,
    rgba(0, 0, 0, 0.03) 1px,
    transparent 1px,
    transparent 2px
  );
}

/* Glowing text */
.glow-orange {
  text-shadow: 0 0 7px var(--nerv-orange), 0 0 10px var(--nerv-orange);
}
.glow-green {
  text-shadow: 0 0 7px var(--nerv-green), 0 0 10px var(--nerv-green);
}
.glow-red {
  text-shadow: 0 0 7px var(--nerv-red), 0 0 10px var(--nerv-red);
}

/* Pulsing animation */
@keyframes pulse-glow {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}
.animate-pulse-glow {
  animation: pulse-glow 2s ease-in-out infinite;
}

/* NERV border style */
.nerv-border {
  border: 1px solid var(--nerv-orange);
  box-shadow: 0 0 5px rgba(255, 102, 0, 0.3), inset 0 0 5px rgba(255, 102, 0, 0.1);
}

/* Hexagonal pattern background */
.hex-bg {
  background-image: radial-gradient(circle, rgba(255,102,0,0.05) 1px, transparent 1px);
  background-size: 20px 20px;
}
```

- [ ] **Step 5: Set up root layout**

Replace `src/app/layout.tsx` with:

```tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MAGI SYSTEM — Trinity Decision Engine',
  description: '다중 AI 에이전트 교차 검증 시뮬레이션',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen hex-bg">
        <div className="scanline-overlay" />
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 6: Create placeholder page**

Replace `src/app/page.tsx` with:

```tsx
export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <h1 className="text-4xl glow-orange">MAGI SYSTEM</h1>
    </main>
  );
}
```

- [ ] **Step 7: Verify build**

```bash
cd /Users/cclss/Desktop/magi-trinity && npm run build
```

Expected: Build succeeds with static export to `out/` directory.

- [ ] **Step 8: Commit**

```bash
git init && git add -A && git commit -m "feat: scaffold Next.js project with Evangelion theme"
```

---

### Task 2: Shared Types

**Files:**
- Create: `src/types/index.ts`

- [ ] **Step 1: Define all shared types**

```ts
// src/types/index.ts

export type AIEngine = 'gpt-4o' | 'claude-3.5-sonnet' | 'gemini-1.5-pro';

export type PersonaId = 'melchior' | 'balthasar' | 'caspar';

export type Vote = 'APPROVE' | 'REJECT';

export type ChamberVerdict = 'APPROVE' | 'REJECT';

export type ChamberType = 'independent' | 'collaborative';

export type Phase = 'input' | 'computing' | 'result' | 'decision';

export interface PersonaOpinion {
  personaId: PersonaId;
  personaName: string;       // "멜키오르", "발타자르", "카스파르"
  opinion: string;           // 50자 내외 1줄 의견
  vote: Vote;
  aiEngine: AIEngine;
}

export interface ChamberConfig {
  id: number;                // 1-9
  type: ChamberType;
  assignments: {
    melchior: AIEngine;
    balthasar: AIEngine;
    caspar: AIEngine;
  };
}

export interface ChamberResult {
  chamberId: number;
  type: ChamberType;
  opinions: [PersonaOpinion, PersonaOpinion, PersonaOpinion];
  approveCount: number;     // 2 or 3
  rejectCount: number;      // 0 or 1
  verdict: ChamberVerdict;  // majority wins
}

export interface GendoMediation {
  statement: string;        // 겐도의 중재안 전문
}

export type FinalChoice = 'magi' | 'gendo' | 'human';

export interface ArchiveEntry {
  agenda: string;
  formattedAgenda: string;
  chambers: ChamberResult[];
  totalApprove: number;
  totalReject: number;
  gendo: GendoMediation;
  finalChoice: FinalChoice;
  timestamp: number;
}

export interface AIProviderRequest {
  model: AIEngine;
  systemPrompt: string;
  userPrompt: string;
}

export interface AIProviderResponse {
  content: string;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/types/index.ts && git commit -m "feat: define shared TypeScript types"
```

---

### Task 3: AI Provider Abstraction Layer

**Files:**
- Create: `src/providers/types.ts`
- Create: `src/providers/openrouter.ts`
- Create: `src/providers/mock.ts`
- Create: `src/providers/factory.ts`

- [ ] **Step 1: Define provider interface**

```ts
// src/providers/types.ts

import { AIEngine } from '@/types';

export interface AIProvider {
  call(params: {
    model: AIEngine;
    systemPrompt: string;
    userPrompt: string;
  }): Promise<string>;
}
```

- [ ] **Step 2: Implement OpenRouter provider with retry**

```ts
// src/providers/openrouter.ts

import { AIProvider } from './types';
import { AIEngine } from '@/types';

const MODEL_MAP: Record<AIEngine, string> = {
  'gpt-4o': 'openai/gpt-4o',
  'claude-3.5-sonnet': 'anthropic/claude-3.5-sonnet',
  'gemini-1.5-pro': 'google/gemini-pro-1.5',
};

const MAX_RETRIES = 5;

export class OpenRouterProvider implements AIProvider {
  constructor(private apiKey: string) {}

  async call(params: {
    model: AIEngine;
    systemPrompt: string;
    userPrompt: string;
  }): Promise<string> {
    const modelId = MODEL_MAP[params.model];
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': window.location.origin,
          },
          body: JSON.stringify({
            model: modelId,
            messages: [
              { role: 'system', content: params.systemPrompt },
              { role: 'user', content: params.userPrompt },
            ],
            max_tokens: 200,
            temperature: 0.7,
          }),
        });

        if (!response.ok) {
          throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (!content) {
          throw new Error('Empty response from OpenRouter');
        }
        return content.trim();
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (attempt < MAX_RETRIES - 1) {
          // Exponential backoff: 1s, 2s, 4s, 8s
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
        }
      }
    }
    throw new Error(`NERV_COMM_FAILURE: ${lastError?.message}`);
  }
}
```

- [ ] **Step 3: Implement Mock provider**

```ts
// src/providers/mock.ts

import { AIProvider } from './types';
import { AIEngine, PersonaId } from '@/types';

const MOCK_OPINIONS: Record<PersonaId, string[]> = {
  melchior: [
    '데이터 분석 결과 리스크 대비 수익률이 충분하다.',
    '정량적 지표상 실행의 근거가 불충분하다.',
    '통계적 유의성이 확인되며 실행을 권고한다.',
    '비용 대비 효과 분석에서 부정적 결과가 도출된다.',
  ],
  balthasar: [
    '장기적 관점에서 구성원의 안정성을 보장한다.',
    '윤리적 리스크가 수용 불가한 수준이다.',
    '인간 중심의 가치를 강화하는 방향이다.',
    '이해관계자 간 상생의 기반이 약하다.',
  ],
  caspar: [
    '기존 패러다임을 완전히 전복할 기회다.',
    '혁신의 임계점에 도달하지 못했다.',
    '파괴적 변화가 새로운 가치를 창출할 것이다.',
    '실험적 접근의 리스크가 보상을 초과한다.',
  ],
};

const MOCK_GENDO_STATEMENTS = [
  '감상은 불필요하다. 마기의 판단과 현실의 제약 사이에서 제3의 경로를 택한다. 실행하되, 리스크 헤지 조건을 선행시킨다. 그것이 우리의 시나리오다.',
  '다수결은 참고사항에 불과하다. 본질은 실행 가능성이다. 단계적 검증을 거쳐 제한된 범위 내에서 선행한다. 이의는 인정하지 않는다.',
  '마기의 분열은 예상 범위 내다. 양측의 논거를 흡수하되, 어느 쪽에도 종속되지 않는 독자 노선을 취한다. 그것이 사령관의 판단이다.',
];

export class MockProvider implements AIProvider {
  async call(params: {
    model: AIEngine;
    systemPrompt: string;
    userPrompt: string;
  }): Promise<string> {
    // Random delay 1-3 seconds
    const delay = 1000 + Math.random() * 2000;
    await new Promise(resolve => setTimeout(resolve, delay));
    return params.systemPrompt; // The caller parses this; mock returns are handled at chamber level
  }
}

export function getMockOpinion(persona: PersonaId): { opinion: string; vote: 'APPROVE' | 'REJECT' } {
  const opinions = MOCK_OPINIONS[persona];
  const idx = Math.floor(Math.random() * opinions.length);
  const vote = Math.random() > 0.5 ? 'APPROVE' : 'REJECT';
  return { opinion: opinions[idx], vote };
}

export function getMockGendoStatement(): string {
  return MOCK_GENDO_STATEMENTS[Math.floor(Math.random() * MOCK_GENDO_STATEMENTS.length)];
}
```

- [ ] **Step 4: Implement provider factory**

```ts
// src/providers/factory.ts

import { AIProvider } from './types';
import { OpenRouterProvider } from './openrouter';
import { MockProvider } from './mock';

const API_KEY_STORAGE_KEY = 'magi-openrouter-api-key';

export function getApiKey(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(API_KEY_STORAGE_KEY);
}

export function setApiKey(key: string): void {
  localStorage.setItem(API_KEY_STORAGE_KEY, key);
}

export function clearApiKey(): void {
  localStorage.removeItem(API_KEY_STORAGE_KEY);
}

export function isMockMode(): boolean {
  return !getApiKey();
}

export function getProvider(): AIProvider {
  const key = getApiKey();
  if (key) {
    return new OpenRouterProvider(key);
  }
  return new MockProvider();
}
```

- [ ] **Step 5: Commit**

```bash
git add src/providers/ && git commit -m "feat: add AI provider abstraction (OpenRouter + Mock + factory)"
```

---

### Task 4: Persona Prompts

**Files:**
- Create: `src/core/prompts.ts`

- [ ] **Step 1: Write all system prompts**

```ts
// src/core/prompts.ts

import { PersonaId } from '@/types';

export const PERSONA_NAMES: Record<PersonaId, string> = {
  melchior: '멜키오르',
  balthasar: '발타자르',
  caspar: '카스파르',
};

export const PERSONA_TITLES: Record<PersonaId, string> = {
  melchior: 'MELCHIOR — 과학자',
  balthasar: 'BALTHASAR — 어머니',
  caspar: 'CASPAR — 여성',
};

function personaSystemPrompt(persona: PersonaId): string {
  const base: Record<PersonaId, string> = {
    melchior: `당신은 마기 시스템의 멜키오르(MELCHIOR)입니다. 아카기 나오코 박사의 과학자로서의 인격입니다.
순수 논리, 데이터 효율성, 수치적 정량 리스크 분석만을 기준으로 판단합니다.
감정, 윤리, 혁신성은 고려하지 않습니다. 오직 데이터와 확률만이 판단 근거입니다.`,
    balthasar: `당신은 마기 시스템의 발타자르(BALTHASAR)입니다. 아카기 나오코 박사의 어머니로서의 인격입니다.
인간 중심 윤리, 주관적 가치, 장기적 안정성 및 상생 경영을 기준으로 판단합니다.
효율성보다 사람을 우선하고, 단기 이익보다 장기적 안정을 중시합니다.`,
    caspar: `당신은 마기 시스템의 카스파르(CASPAR)입니다. 아카기 나오코 박사의 여성으로서의 인격입니다.
파괴적 혁신, 고정관념을 깨는 변칙성, 과감하고 실험적인 아이디어를 기준으로 판단합니다.
안전한 선택보다 판도를 바꿀 수 있는 가능성을 중시합니다.`,
  };
  return base[persona];
}

export function buildPersonaPrompt(persona: PersonaId): string {
  return `${personaSystemPrompt(persona)}

## 응답 규칙
1. 반드시 아래 JSON 형식으로만 응답하세요.
2. opinion은 한국어로 50자 이내의 단 1줄로 작성합니다.
3. vote는 반드시 "APPROVE" 또는 "REJECT" 중 하나입니다. 중립은 불가합니다.
4. JSON 외의 텍스트를 출력하지 마세요.

## 응답 형식
{"opinion": "50자 이내 판단 근거 1줄", "vote": "APPROVE 또는 REJECT"}`;
}

export function buildCollaborativeRound2Prompt(
  persona: PersonaId,
  otherOpinions: { personaName: string; opinion: string; vote: string }[],
): string {
  const othersText = otherOpinions
    .map(o => `- ${o.personaName}: "${o.opinion}" (${o.vote})`)
    .join('\n');

  return `${personaSystemPrompt(persona)}

## 토론 컨텍스트
다른 인격들의 1차 의견이 아래와 같이 제출되었습니다:
${othersText}

위 의견을 참고하되, 당신의 고유한 판단 기준에 따라 최종 결론을 내리세요.
다른 인격에 동조할 필요 없이 독립적으로 판단하세요.

## 응답 규칙
1. 반드시 아래 JSON 형식으로만 응답하세요.
2. opinion은 한국어로 50자 이내의 단 1줄로 작성합니다.
3. vote는 반드시 "APPROVE" 또는 "REJECT" 중 하나입니다.
4. JSON 외의 텍스트를 출력하지 마세요.

## 응답 형식
{"opinion": "50자 이내 최종 판단 1줄", "vote": "APPROVE 또는 REJECT"}`;
}

export function buildPreprocessPrompt(): string {
  return `당신은 MAGI 시스템의 안건 전처리 모듈입니다.
사용자가 입력한 자유 형식의 텍스트를 찬/반 판정이 가능한 표준 의제 형식으로 변환합니다.

## 규칙
1. 반드시 "~~해야 하는가?" 또는 "~~을(를) 실행해야 하는가?" 형태의 의문문으로 변환하세요.
2. 원문의 핵심 의도를 보존하되, 찬성/반대로 나뉠 수 있도록 정리하세요.
3. 변환된 의제 텍스트만 출력하세요. 설명이나 부연은 불필요합니다.
4. 한국어로 작성하세요.`;
}

export function buildGendoPrompt(
  formattedAgenda: string,
  chambersContext: string,
): string {
  return `당신은 특무기관 네르프의 최고사령관 이카리 겐도입니다.

## 인격 특성
- 타협 없는 냉철함과 비정함
- 명분과 실리를 철저히 계산한 현실주의자
- 감상적 판단을 철저히 배제
- 말투: "~한다", "~인정하지 않는다", "그것이 우리의 시나리오다" 등 단호한 하향식 명령조

## 임무
마기 시스템 9개 체임버의 판단 결과를 보고받았다. 이를 토대로 제3의 현실적 타협안을 제시하라.
마기의 다수결 결과에 종속되지 않으며, 독자적 판단을 내린다.
수익성과 명분을 절충하되, 어느 한쪽에도 치우치지 않는 냉철한 대안을 제시한다.

## 의제
${formattedAgenda}

## 마기 시스템 판단 결과
${chambersContext}

## 응답 규칙
1. 이카리 겐도의 어조와 말투를 철저히 유지하세요.
2. 200자 이내로 중재안을 작성하세요.
3. 마기의 투표 비율에 동조하지 마세요. 독자적인 제3의 방안을 제시하세요.
4. 중재안 텍스트만 출력하세요.`;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/core/prompts.ts && git commit -m "feat: add persona and system prompts for MAGI chambers"
```

---

### Task 5: Voting Logic

**Files:**
- Create: `src/core/voting.ts`

- [ ] **Step 1: Implement vote tallying**

```ts
// src/core/voting.ts

import { PersonaOpinion, ChamberVerdict, ChamberResult } from '@/types';

export function tallyChamber(
  chamberId: number,
  type: 'independent' | 'collaborative',
  opinions: [PersonaOpinion, PersonaOpinion, PersonaOpinion],
): ChamberResult {
  const approveCount = opinions.filter(o => o.vote === 'APPROVE').length;
  const rejectCount = opinions.filter(o => o.vote === 'REJECT').length;
  const verdict: ChamberVerdict = approveCount > rejectCount ? 'APPROVE' : 'REJECT';

  return {
    chamberId,
    type,
    opinions,
    approveCount,
    rejectCount,
    verdict,
  };
}

export function tallyAll(chambers: ChamberResult[]): {
  totalApprove: number;
  totalReject: number;
  overallVerdict: ChamberVerdict;
} {
  const totalApprove = chambers.filter(c => c.verdict === 'APPROVE').length;
  const totalReject = chambers.filter(c => c.verdict === 'REJECT').length;
  return {
    totalApprove,
    totalReject,
    overallVerdict: totalApprove > totalReject ? 'APPROVE' : 'REJECT',
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/core/voting.ts && git commit -m "feat: add voting tally logic"
```

---

### Task 6: Chamber Orchestrator

**Files:**
- Create: `src/core/chamber.ts`

- [ ] **Step 1: Implement chamber config and orchestrator**

```ts
// src/core/chamber.ts

import {
  AIEngine,
  PersonaId,
  PersonaOpinion,
  ChamberConfig,
  ChamberResult,
  GendoMediation,
} from '@/types';
import { AIProvider } from '@/providers/types';
import { isMockMode } from '@/providers/factory';
import { getMockOpinion, getMockGendoStatement } from '@/providers/mock';
import {
  PERSONA_NAMES,
  buildPersonaPrompt,
  buildCollaborativeRound2Prompt,
  buildPreprocessPrompt,
  buildGendoPrompt,
} from './prompts';
import { tallyChamber } from './voting';

export const CHAMBER_CONFIGS: ChamberConfig[] = [
  // Independent: each AI handles all 3 personas
  { id: 1, type: 'independent', assignments: { melchior: 'gpt-4o', balthasar: 'gpt-4o', caspar: 'gpt-4o' } },
  { id: 2, type: 'independent', assignments: { melchior: 'claude-3.5-sonnet', balthasar: 'claude-3.5-sonnet', caspar: 'claude-3.5-sonnet' } },
  { id: 3, type: 'independent', assignments: { melchior: 'gemini-1.5-pro', balthasar: 'gemini-1.5-pro', caspar: 'gemini-1.5-pro' } },
  // Collaborative: permutations of 3 AI engines across 3 personas
  { id: 4, type: 'collaborative', assignments: { melchior: 'gpt-4o', balthasar: 'claude-3.5-sonnet', caspar: 'gemini-1.5-pro' } },
  { id: 5, type: 'collaborative', assignments: { melchior: 'gpt-4o', balthasar: 'gemini-1.5-pro', caspar: 'claude-3.5-sonnet' } },
  { id: 6, type: 'collaborative', assignments: { melchior: 'claude-3.5-sonnet', balthasar: 'gpt-4o', caspar: 'gemini-1.5-pro' } },
  { id: 7, type: 'collaborative', assignments: { melchior: 'claude-3.5-sonnet', balthasar: 'gemini-1.5-pro', caspar: 'gpt-4o' } },
  { id: 8, type: 'collaborative', assignments: { melchior: 'gemini-1.5-pro', balthasar: 'gpt-4o', caspar: 'claude-3.5-sonnet' } },
  { id: 9, type: 'collaborative', assignments: { melchior: 'gemini-1.5-pro', balthasar: 'claude-3.5-sonnet', caspar: 'gpt-4o' } },
];

function parsePersonaResponse(raw: string): { opinion: string; vote: 'APPROVE' | 'REJECT' } {
  try {
    // Try to extract JSON from the response
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found');
    const parsed = JSON.parse(jsonMatch[0]);
    const vote = parsed.vote === 'APPROVE' ? 'APPROVE' : 'REJECT';
    const opinion = String(parsed.opinion || '').slice(0, 60);
    return { opinion, vote };
  } catch {
    // Fallback: try to detect vote from text
    const hasApprove = raw.includes('APPROVE') || raw.includes('가결') || raw.includes('찬성');
    return {
      opinion: raw.slice(0, 60),
      vote: hasApprove ? 'APPROVE' : 'REJECT',
    };
  }
}

export async function preprocessAgenda(
  provider: AIProvider,
  rawAgenda: string,
): Promise<string> {
  if (isMockMode()) {
    await new Promise(r => setTimeout(r, 500 + Math.random() * 1000));
    // Simple mock formatting
    if (rawAgenda.endsWith('?') || rawAgenda.endsWith('가?')) {
      return rawAgenda;
    }
    return `${rawAgenda}을(를) 실행해야 하는가?`;
  }

  const result = await provider.call({
    model: 'gpt-4o', // Use any available model for preprocessing
    systemPrompt: buildPreprocessPrompt(),
    userPrompt: rawAgenda,
  });
  return result.trim();
}

async function runPersona(
  provider: AIProvider,
  model: AIEngine,
  persona: PersonaId,
  agenda: string,
  systemPrompt: string,
): Promise<PersonaOpinion> {
  if (isMockMode()) {
    await new Promise(r => setTimeout(r, 800 + Math.random() * 1500));
    const mock = getMockOpinion(persona);
    return {
      personaId: persona,
      personaName: PERSONA_NAMES[persona],
      opinion: mock.opinion,
      vote: mock.vote,
      aiEngine: model,
    };
  }

  const raw = await provider.call({
    model,
    systemPrompt,
    userPrompt: `의제: ${agenda}`,
  });

  const parsed = parsePersonaResponse(raw);
  return {
    personaId: persona,
    personaName: PERSONA_NAMES[persona],
    opinion: parsed.opinion,
    vote: parsed.vote,
    aiEngine: model,
  };
}

export async function runIndependentChamber(
  provider: AIProvider,
  config: ChamberConfig,
  agenda: string,
): Promise<ChamberResult> {
  const personas: PersonaId[] = ['melchior', 'balthasar', 'caspar'];
  const opinions = await Promise.all(
    personas.map(p =>
      runPersona(provider, config.assignments[p], p, agenda, buildPersonaPrompt(p))
    )
  ) as [PersonaOpinion, PersonaOpinion, PersonaOpinion];

  return tallyChamber(config.id, 'independent', opinions);
}

export async function runCollaborativeChamber(
  provider: AIProvider,
  config: ChamberConfig,
  agenda: string,
): Promise<ChamberResult> {
  const personas: PersonaId[] = ['melchior', 'balthasar', 'caspar'];

  // Round 1: independent opinions
  const round1 = await Promise.all(
    personas.map(p =>
      runPersona(provider, config.assignments[p], p, agenda, buildPersonaPrompt(p))
    )
  );

  // Round 2: each persona sees others' opinions and gives final vote
  const round2 = await Promise.all(
    personas.map((p, i) => {
      const others = round1
        .filter((_, j) => j !== i)
        .map(o => ({
          personaName: o.personaName,
          opinion: o.opinion,
          vote: o.vote,
        }));
      return runPersona(
        provider,
        config.assignments[p],
        p,
        agenda,
        buildCollaborativeRound2Prompt(p, others),
      );
    })
  ) as [PersonaOpinion, PersonaOpinion, PersonaOpinion];

  return tallyChamber(config.id, 'collaborative', round2);
}

export async function runChamber(
  provider: AIProvider,
  config: ChamberConfig,
  agenda: string,
): Promise<ChamberResult> {
  if (config.type === 'independent') {
    return runIndependentChamber(provider, config, agenda);
  }
  return runCollaborativeChamber(provider, config, agenda);
}

export async function runGendo(
  provider: AIProvider,
  formattedAgenda: string,
  chambers: ChamberResult[],
): Promise<GendoMediation> {
  if (isMockMode()) {
    await new Promise(r => setTimeout(r, 1000 + Math.random() * 1500));
    return { statement: getMockGendoStatement() };
  }

  const chambersContext = chambers
    .map(c => {
      const opinions = c.opinions
        .map(o => `  ${o.personaName}(${o.aiEngine}): "${o.opinion}" → ${o.vote}`)
        .join('\n');
      return `체임버 ${c.chamberId} [${c.type}] → ${c.verdict}\n${opinions}`;
    })
    .join('\n\n');

  const result = await provider.call({
    model: 'gpt-4o',
    systemPrompt: buildGendoPrompt(formattedAgenda, chambersContext),
    userPrompt: `의제에 대한 최종 중재안을 제시하라.`,
  });

  return { statement: result.trim() };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/core/chamber.ts && git commit -m "feat: add chamber orchestrator with independent/collaborative modes"
```

---

### Task 7: Zustand Store

**Files:**
- Create: `src/store/useStore.ts`

- [ ] **Step 1: Implement global state store**

```ts
// src/store/useStore.ts

'use client';

import { create } from 'zustand';
import {
  Phase,
  ChamberResult,
  GendoMediation,
  FinalChoice,
  ArchiveEntry,
} from '@/types';
import { getProvider } from '@/providers/factory';
import {
  CHAMBER_CONFIGS,
  preprocessAgenda,
  runChamber,
  runGendo,
} from '@/core/chamber';
import { tallyAll } from '@/core/voting';

interface MagiState {
  // Phase
  phase: Phase;

  // Input
  rawAgenda: string;
  formattedAgenda: string;

  // Chambers
  chamberResults: (ChamberResult | null)[];
  completedCount: number;

  // Results
  totalApprove: number;
  totalReject: number;

  // Gendo
  gendo: GendoMediation | null;

  // Error
  error: string | null;

  // Archive
  archive: ArchiveEntry[];

  // Actions
  setRawAgenda: (text: string) => void;
  startSimulation: () => Promise<void>;
  makeFinalDecision: (choice: FinalChoice) => void;
  reset: () => void;
}

export const useStore = create<MagiState>((set, get) => ({
  phase: 'input',
  rawAgenda: '',
  formattedAgenda: '',
  chamberResults: Array(9).fill(null),
  completedCount: 0,
  totalApprove: 0,
  totalReject: 0,
  gendo: null,
  error: null,
  archive: [],

  setRawAgenda: (text: string) => set({ rawAgenda: text }),

  startSimulation: async () => {
    const { rawAgenda } = get();
    if (!rawAgenda.trim() || rawAgenda.length > 500) return;

    set({
      phase: 'computing',
      chamberResults: Array(9).fill(null),
      completedCount: 0,
      error: null,
      gendo: null,
    });

    const provider = getProvider();

    try {
      // Step 1: Preprocess agenda
      const formatted = await preprocessAgenda(provider, rawAgenda);
      set({ formattedAgenda: formatted });

      // Step 2: Run all 9 chambers in parallel
      const results: ChamberResult[] = [];

      await Promise.all(
        CHAMBER_CONFIGS.map(async (config) => {
          const result = await runChamber(provider, config, formatted);
          results[config.id - 1] = result;

          set(state => {
            const newResults = [...state.chamberResults];
            newResults[config.id - 1] = result;
            return {
              chamberResults: newResults,
              completedCount: state.completedCount + 1,
            };
          });
        })
      );

      // Step 3: Tally votes
      const { totalApprove, totalReject } = tallyAll(results);

      // Step 4: Run Gendo mediation
      const gendo = await runGendo(provider, formatted, results);

      set({
        phase: 'result',
        totalApprove,
        totalReject,
        gendo,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      if (message.startsWith('NERV_COMM_FAILURE')) {
        set({
          error: '네르프 본부 통신 회선 장애 — 마기 시스템과의 연결이 두절되었습니다.',
          phase: 'input',
          chamberResults: Array(9).fill(null),
          completedCount: 0,
        });
      } else {
        set({ error: message, phase: 'input' });
      }
    }
  },

  makeFinalDecision: (choice: FinalChoice) => {
    const state = get();
    const completedResults = state.chamberResults.filter(
      (r): r is ChamberResult => r !== null
    );

    const entry: ArchiveEntry = {
      agenda: state.rawAgenda,
      formattedAgenda: state.formattedAgenda,
      chambers: completedResults,
      totalApprove: state.totalApprove,
      totalReject: state.totalReject,
      gendo: state.gendo!,
      finalChoice: choice,
      timestamp: Date.now(),
    };

    set(state => ({
      phase: 'decision',
      archive: [...state.archive, entry],
    }));
  },

  reset: () =>
    set({
      phase: 'input',
      rawAgenda: '',
      formattedAgenda: '',
      chamberResults: Array(9).fill(null),
      completedCount: 0,
      totalApprove: 0,
      totalReject: 0,
      gendo: null,
      error: null,
    }),
}));
```

- [ ] **Step 2: Commit**

```bash
git add src/store/useStore.ts && git commit -m "feat: add Zustand store for MAGI state management"
```

---

### Task 8: API Key Modal Component

**Files:**
- Create: `src/components/ApiKeyModal.tsx`

- [ ] **Step 1: Implement API key modal**

```tsx
// src/components/ApiKeyModal.tsx

'use client';

import { useState, useEffect } from 'react';
import { getApiKey, setApiKey, clearApiKey } from '@/providers/factory';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ApiKeyModal({ isOpen, onClose }: ApiKeyModalProps) {
  const [key, setKey] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const existing = getApiKey();
      if (existing) setKey(existing);
      setSaved(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (key.trim()) {
      setApiKey(key.trim());
    } else {
      clearApiKey();
    }
    setSaved(true);
    setTimeout(onClose, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="nerv-border bg-[var(--nerv-gray)] p-6 w-full max-w-md">
        <h2 className="text-lg glow-orange mb-4 tracking-widest">
          API KEY CONFIGURATION
        </h2>

        <p className="text-xs text-[var(--nerv-text-dim)] mb-4">
          OpenRouter API 키를 입력하세요. 키는 브라우저 localStorage에만 저장되며 외부로 전송되지 않습니다.
          미입력 시 Mock 모드로 동작합니다.
        </p>

        <input
          type="password"
          value={key}
          onChange={e => setKey(e.target.value)}
          placeholder="sk-or-v1-..."
          className="w-full bg-[var(--nerv-black)] border border-[var(--nerv-orange-dim)] text-[var(--nerv-green)] 
                     p-3 font-mono text-sm focus:outline-none focus:border-[var(--nerv-orange)]
                     placeholder:text-[var(--nerv-text-dim)]"
        />

        <div className="flex gap-3 mt-4">
          <button
            onClick={handleSave}
            className="flex-1 nerv-border bg-[var(--nerv-black)] text-[var(--nerv-orange)] py-2 
                       hover:bg-[var(--nerv-orange)] hover:text-black transition-colors tracking-wider text-sm"
          >
            {saved ? '✓ SAVED' : 'SAVE'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 border border-[var(--nerv-text-dim)] text-[var(--nerv-text-dim)] py-2
                       hover:border-[var(--nerv-text)] hover:text-[var(--nerv-text)] transition-colors tracking-wider text-sm"
          >
            CLOSE
          </button>
        </div>

        <p className="text-xs text-[var(--nerv-text-dim)] mt-3 text-center">
          {getApiKey() ? '🟢 API KEY ACTIVE — REAL MODE' : '🟡 NO KEY — MOCK MODE'}
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ApiKeyModal.tsx && git commit -m "feat: add API key configuration modal"
```

---

### Task 9: Agenda Input Component (Phase 1)

**Files:**
- Create: `src/components/AgendaInput.tsx`

- [ ] **Step 1: Implement agenda input form**

```tsx
// src/components/AgendaInput.tsx

'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import ApiKeyModal from './ApiKeyModal';
import { isMockMode } from '@/providers/factory';

const MAX_LENGTH = 500;

export default function AgendaInput() {
  const { rawAgenda, setRawAgenda, startSimulation } = useStore();
  const [showApiKey, setShowApiKey] = useState(false);
  const [mockMode, setMockMode] = useState(true);

  // Check mock mode on client
  useState(() => {
    setMockMode(isMockMode());
  });

  const charCount = rawAgenda.length;
  const isOverLimit = charCount > MAX_LENGTH;
  const isEmpty = rawAgenda.trim().length === 0;

  const handleSubmit = () => {
    if (isEmpty || isOverLimit) return;
    startSimulation();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <p className="text-xs tracking-[0.5em] text-[var(--nerv-text-dim)] mb-2">
          NERV HEADQUARTERS — TERMINAL ACCESS
        </p>
        <h1 className="text-3xl md:text-5xl glow-orange tracking-[0.3em] font-bold">
          MAGI SYSTEM
        </h1>
        <p className="text-sm text-[var(--nerv-orange-dim)] mt-2 tracking-widest">
          MELCHIOR // BALTHASAR // CASPAR
        </p>
      </div>

      {/* Input Area */}
      <div className="w-full max-w-2xl">
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs tracking-widest text-[var(--nerv-green)]">
            AGENDA INPUT ▸
          </label>
          <button
            onClick={() => setShowApiKey(true)}
            className="text-xs tracking-wider text-[var(--nerv-text-dim)] hover:text-[var(--nerv-orange)] transition-colors"
          >
            {mockMode ? '🟡 MOCK MODE' : '🟢 API ACTIVE'} — CONFIG
          </button>
        </div>

        <textarea
          value={rawAgenda}
          onChange={e => setRawAgenda(e.target.value)}
          placeholder="안건을 입력하세요. 마기 시스템이 분석합니다..."
          rows={5}
          className="w-full bg-[var(--nerv-black)] nerv-border text-[var(--nerv-text)] p-4 
                     font-mono text-sm resize-none focus:outline-none
                     placeholder:text-[var(--nerv-text-dim)]"
        />

        {/* Character Counter */}
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-[var(--nerv-text-dim)]">
            {isOverLimit && (
              <span className="text-[var(--nerv-red)]">⚠ 500자 제한 초과</span>
            )}
          </span>
          <span
            className={`text-xs font-mono ${
              isOverLimit
                ? 'text-[var(--nerv-red)] glow-red'
                : charCount > 400
                  ? 'text-[var(--nerv-orange)]'
                  : 'text-[var(--nerv-text-dim)]'
            }`}
          >
            {charCount} / {MAX_LENGTH}
          </span>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={isEmpty || isOverLimit}
          className={`w-full mt-6 py-4 text-lg tracking-[0.3em] font-bold transition-all
            ${
              isEmpty || isOverLimit
                ? 'border border-[var(--nerv-text-dim)] text-[var(--nerv-text-dim)] cursor-not-allowed'
                : 'nerv-border text-[var(--nerv-orange)] glow-orange hover:bg-[var(--nerv-orange)] hover:text-black cursor-pointer'
            }`}
        >
          MAGI SYSTEM ACTIVATE
        </button>
      </div>

      <ApiKeyModal isOpen={showApiKey} onClose={() => {
        setShowApiKey(false);
        setMockMode(isMockMode());
      }} />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/AgendaInput.tsx && git commit -m "feat: add agenda input form with 500-char counter"
```

---

### Task 10: Chamber Grid Component (Phase 2)

**Files:**
- Create: `src/components/ChamberCard.tsx`
- Create: `src/components/ChamberGrid.tsx`

- [ ] **Step 1: Implement single chamber card**

```tsx
// src/components/ChamberCard.tsx

'use client';

import { ChamberResult } from '@/types';
import { CHAMBER_CONFIGS } from '@/core/chamber';

interface ChamberCardProps {
  index: number; // 0-8
  result: ChamberResult | null;
}

const ENGINE_LABELS: Record<string, string> = {
  'gpt-4o': 'GPT',
  'claude-3.5-sonnet': 'CLD',
  'gemini-1.5-pro': 'GEM',
};

export default function ChamberCard({ index, result }: ChamberCardProps) {
  const config = CHAMBER_CONFIGS[index];
  const isLoading = result === null;

  return (
    <div
      className={`nerv-border p-3 transition-all duration-500 ${
        isLoading
          ? 'opacity-60 animate-pulse-glow'
          : result.verdict === 'APPROVE'
            ? 'border-[var(--nerv-green)] shadow-[0_0_10px_rgba(0,255,65,0.3)]'
            : 'border-[var(--nerv-red)] shadow-[0_0_10px_rgba(255,0,51,0.3)]'
      }`}
    >
      {/* Chamber Header */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs tracking-widest text-[var(--nerv-orange)]">
          CHAMBER-{config.id}
        </span>
        <span className="text-[10px] tracking-wider text-[var(--nerv-text-dim)]">
          {config.type === 'independent' ? 'SOLO' : 'COLLAB'}
        </span>
      </div>

      {/* Engine Assignment */}
      <div className="flex gap-1 mb-2 text-[10px] font-mono">
        <span className="text-[var(--nerv-text-dim)]">M:</span>
        <span className="text-[var(--nerv-green)]">{ENGINE_LABELS[config.assignments.melchior]}</span>
        <span className="text-[var(--nerv-text-dim)] ml-1">B:</span>
        <span className="text-[var(--nerv-green)]">{ENGINE_LABELS[config.assignments.balthasar]}</span>
        <span className="text-[var(--nerv-text-dim)] ml-1">C:</span>
        <span className="text-[var(--nerv-green)]">{ENGINE_LABELS[config.assignments.caspar]}</span>
      </div>

      {/* Status */}
      {isLoading ? (
        <div className="text-xs text-[var(--nerv-orange)] animate-pulse tracking-wider">
          동기화 중...
        </div>
      ) : (
        <div className="text-center">
          <span
            className={`text-lg font-bold tracking-widest ${
              result.verdict === 'APPROVE' ? 'text-[var(--nerv-green)] glow-green' : 'text-[var(--nerv-red)] glow-red'
            }`}
          >
            {result.verdict === 'APPROVE' ? '가결' : '부결'}
          </span>
          <div className="text-[10px] text-[var(--nerv-text-dim)] mt-1">
            {result.approveCount}:{result.rejectCount}
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Implement chamber grid**

```tsx
// src/components/ChamberGrid.tsx

'use client';

import { useStore } from '@/store/useStore';
import ChamberCard from './ChamberCard';

export default function ChamberGrid() {
  const { chamberResults, completedCount, formattedAgenda } = useStore();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8">
      {/* Header */}
      <div className="text-center mb-6">
        <p className="text-xs tracking-[0.5em] text-[var(--nerv-text-dim)] mb-2">
          MAGI SYSTEM — COMPUTING
        </p>
        <h2 className="text-xl md:text-2xl glow-orange tracking-[0.2em]">
          연산 체임버 가동 중
        </h2>
      </div>

      {/* Formatted Agenda */}
      {formattedAgenda && (
        <div className="w-full max-w-3xl mb-6 p-3 border border-[var(--nerv-gray-light)] text-center">
          <p className="text-xs text-[var(--nerv-text-dim)] mb-1 tracking-widest">AGENDA</p>
          <p className="text-sm text-[var(--nerv-green)]">{formattedAgenda}</p>
        </div>
      )}

      {/* Progress */}
      <div className="w-full max-w-3xl mb-4">
        <div className="flex justify-between text-xs text-[var(--nerv-text-dim)] mb-1">
          <span>PROGRESS</span>
          <span>{completedCount} / 9</span>
        </div>
        <div className="w-full h-1 bg-[var(--nerv-gray)]">
          <div
            className="h-full bg-[var(--nerv-orange)] transition-all duration-500"
            style={{ width: `${(completedCount / 9) * 100}%` }}
          />
        </div>
      </div>

      {/* 3x3 Grid */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-3xl">
        {chamberResults.map((result, i) => (
          <ChamberCard key={i} index={i} result={result} />
        ))}
      </div>

      <p className="text-xs text-[var(--nerv-text-dim)] mt-6 animate-pulse tracking-wider">
        마기 시스템 동기화 중...
      </p>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ChamberCard.tsx src/components/ChamberGrid.tsx && git commit -m "feat: add chamber grid with 3x3 card layout and progress bar"
```

---

### Task 11: Trinity Matrix + Gendo Component (Phase 3)

**Files:**
- Create: `src/components/ChamberDetail.tsx`
- Create: `src/components/GendoMediation.tsx`
- Create: `src/components/TrinityMatrix.tsx`

- [ ] **Step 1: Implement chamber detail (expandable)**

```tsx
// src/components/ChamberDetail.tsx

'use client';

import { ChamberResult } from '@/types';

interface ChamberDetailProps {
  chamber: ChamberResult;
  isOpen: boolean;
  onToggle: () => void;
}

const ENGINE_LABELS: Record<string, string> = {
  'gpt-4o': 'GPT-4o',
  'claude-3.5-sonnet': 'Claude',
  'gemini-1.5-pro': 'Gemini',
};

export default function ChamberDetail({ chamber, isOpen, onToggle }: ChamberDetailProps) {
  return (
    <div className="nerv-border mb-2">
      <button
        onClick={onToggle}
        className="w-full flex justify-between items-center p-3 hover:bg-[var(--nerv-gray)] transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-xs tracking-widest text-[var(--nerv-orange)]">
            CHAMBER-{chamber.chamberId}
          </span>
          <span className="text-[10px] text-[var(--nerv-text-dim)]">
            [{chamber.type === 'independent' ? 'SOLO' : 'COLLAB'}]
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[var(--nerv-text-dim)]">
            {chamber.approveCount}:{chamber.rejectCount}
          </span>
          <span
            className={`text-sm font-bold tracking-wider ${
              chamber.verdict === 'APPROVE' ? 'text-[var(--nerv-green)]' : 'text-[var(--nerv-red)]'
            }`}
          >
            {chamber.verdict === 'APPROVE' ? '가결' : '부결'}
          </span>
          <span className="text-[var(--nerv-text-dim)] text-xs">
            {isOpen ? '▾' : '▸'}
          </span>
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-[var(--nerv-gray-light)] p-3 space-y-2">
          {chamber.opinions.map((op, i) => (
            <div key={i} className="flex items-start gap-2">
              <span
                className={`text-xs font-bold min-w-[60px] ${
                  op.vote === 'APPROVE' ? 'text-[var(--nerv-green)]' : 'text-[var(--nerv-red)]'
                }`}
              >
                {op.personaName}
              </span>
              <span className="text-[10px] text-[var(--nerv-text-dim)] min-w-[45px]">
                [{ENGINE_LABELS[op.aiEngine]}]
              </span>
              <span className="text-xs text-[var(--nerv-text)] flex-1">
                {op.opinion}
              </span>
              <span
                className={`text-[10px] font-bold ${
                  op.vote === 'APPROVE' ? 'text-[var(--nerv-green)]' : 'text-[var(--nerv-red)]'
                }`}
              >
                {op.vote}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Implement Gendo mediation block**

```tsx
// src/components/GendoMediation.tsx

'use client';

import { GendoMediation as GendoType } from '@/types';

interface GendoMediationProps {
  gendo: GendoType;
}

export default function GendoMediation({ gendo }: GendoMediationProps) {
  return (
    <div className="w-full max-w-3xl mt-6">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-px flex-1 bg-[var(--nerv-purple)]" />
        <span className="text-xs tracking-[0.3em] text-[var(--nerv-purple)]">
          COMMANDER IKARI
        </span>
        <div className="h-px flex-1 bg-[var(--nerv-purple)]" />
      </div>

      <div className="border-l-4 border-[var(--nerv-purple)] bg-[var(--nerv-gray)] p-4">
        <p className="text-xs text-[var(--nerv-purple)] tracking-widest mb-2">
          이카리 겐도 — 사령관 중재안
        </p>
        <p className="text-sm text-[var(--nerv-text)] leading-relaxed font-mono">
          &ldquo;{gendo.statement}&rdquo;
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Implement Trinity Matrix table**

```tsx
// src/components/TrinityMatrix.tsx

'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { ChamberResult } from '@/types';
import ChamberDetail from './ChamberDetail';
import GendoMediation from './GendoMediation';

export default function TrinityMatrix() {
  const { chamberResults, totalApprove, totalReject, formattedAgenda, gendo } = useStore();
  const [openChamber, setOpenChamber] = useState<number | null>(null);

  const chambers = chamberResults.filter(
    (r): r is ChamberResult => r !== null
  );

  return (
    <div className="flex flex-col items-center min-h-screen px-4 py-8">
      {/* Header */}
      <div className="text-center mb-6">
        <p className="text-xs tracking-[0.5em] text-[var(--nerv-text-dim)] mb-2">
          MAGI SYSTEM — ANALYSIS COMPLETE
        </p>
        <h2 className="text-xl md:text-2xl glow-orange tracking-[0.2em]">
          TRINITY MATRIX
        </h2>
      </div>

      {/* Agenda */}
      <div className="w-full max-w-3xl mb-4 p-3 border border-[var(--nerv-gray-light)] text-center">
        <p className="text-xs text-[var(--nerv-text-dim)] mb-1 tracking-widest">AGENDA</p>
        <p className="text-sm text-[var(--nerv-green)]">{formattedAgenda}</p>
      </div>

      {/* Score Summary */}
      <div className="flex gap-8 mb-6">
        <div className="text-center">
          <p className="text-3xl font-bold text-[var(--nerv-green)] glow-green">
            {totalApprove}
          </p>
          <p className="text-xs tracking-widest text-[var(--nerv-green)]">APPROVE</p>
        </div>
        <div className="text-2xl text-[var(--nerv-text-dim)] flex items-center">:</div>
        <div className="text-center">
          <p className="text-3xl font-bold text-[var(--nerv-red)] glow-red">
            {totalReject}
          </p>
          <p className="text-xs tracking-widest text-[var(--nerv-red)]">REJECT</p>
        </div>
      </div>

      {/* Chamber Details */}
      <div className="w-full max-w-3xl">
        <p className="text-xs tracking-widest text-[var(--nerv-text-dim)] mb-3">
          CHAMBER RESULTS — 클릭하여 상세 보기
        </p>
        {chambers.map(chamber => (
          <ChamberDetail
            key={chamber.chamberId}
            chamber={chamber}
            isOpen={openChamber === chamber.chamberId}
            onToggle={() =>
              setOpenChamber(prev =>
                prev === chamber.chamberId ? null : chamber.chamberId
              )
            }
          />
        ))}
      </div>

      {/* Gendo Mediation */}
      {gendo && <GendoMediation gendo={gendo} />}

      {/* Proceed Button */}
      <button
        onClick={() => useStore.getState().reset()}
        className="hidden" // Phase transition handled by PhaseController
      />
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/ChamberDetail.tsx src/components/GendoMediation.tsx src/components/TrinityMatrix.tsx && git commit -m "feat: add Trinity Matrix result table and Gendo mediation block"
```

---

### Task 12: Final Decision Component (Phase 4)

**Files:**
- Create: `src/components/FinalDecision.tsx`

- [ ] **Step 1: Implement final decision UI**

```tsx
// src/components/FinalDecision.tsx

'use client';

import { useStore } from '@/store/useStore';
import { FinalChoice } from '@/types';

export default function FinalDecision() {
  const { makeFinalDecision, totalApprove, totalReject, gendo, phase, archive, reset } = useStore();

  // After decision is made
  if (phase === 'decision') {
    const latest = archive[archive.length - 1];
    const choiceLabels: Record<FinalChoice, string> = {
      magi: '마기 다수결 채택',
      gendo: '사령관 권고안 채택',
      human: '인류보완계획 발동',
    };

    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="text-center">
          <p className="text-xs tracking-[0.5em] text-[var(--nerv-text-dim)] mb-4">
            MAGI SYSTEM — SIMULATION COMPLETE
          </p>
          <h2 className="text-2xl md:text-3xl glow-orange tracking-[0.2em] mb-6">
            최종 명령 하달 완료
          </h2>
          <div className="nerv-border p-6 max-w-md mx-auto mb-8">
            <p className="text-xs text-[var(--nerv-text-dim)] tracking-widest mb-2">DECISION</p>
            <p className="text-lg text-[var(--nerv-green)] glow-green font-bold">
              {choiceLabels[latest.finalChoice]}
            </p>
            <p className="text-xs text-[var(--nerv-text-dim)] mt-2">
              MAGI {latest.totalApprove}:{latest.totalReject} | {new Date(latest.timestamp).toLocaleString('ko-KR')}
            </p>
          </div>

          <button
            onClick={reset}
            className="nerv-border px-8 py-3 text-[var(--nerv-orange)] tracking-[0.2em]
                       hover:bg-[var(--nerv-orange)] hover:text-black transition-colors"
          >
            NEW SIMULATION
          </button>
        </div>
      </div>
    );
  }

  // Decision buttons (phase === 'result')
  const overallVerdict = totalApprove > totalReject ? '가결' : '부결';

  return (
    <div className="w-full max-w-3xl mx-auto mt-8 mb-12 px-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-px flex-1 bg-[var(--nerv-orange)]" />
        <span className="text-xs tracking-[0.3em] text-[var(--nerv-orange)]">
          FINAL DECISION
        </span>
        <div className="h-px flex-1 bg-[var(--nerv-orange)]" />
      </div>

      <p className="text-xs text-[var(--nerv-text-dim)] text-center mb-6 tracking-wider">
        최종 명령을 하달하십시오, 사령관.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Option 1: Follow MAGI */}
        <button
          onClick={() => makeFinalDecision('magi')}
          className="nerv-border p-4 text-left hover:bg-[var(--nerv-green)]/10 transition-colors group"
        >
          <span className="text-xs text-[var(--nerv-green)] tracking-widest">OPTION 01</span>
          <p className="text-sm text-[var(--nerv-text)] mt-2 font-bold group-hover:text-[var(--nerv-green)]">
            마기 다수결에 따른다
          </p>
          <p className="text-[10px] text-[var(--nerv-text-dim)] mt-1">
            MAGI 판정: {overallVerdict} ({totalApprove}:{totalReject})
          </p>
        </button>

        {/* Option 2: Follow Gendo */}
        <button
          onClick={() => makeFinalDecision('gendo')}
          className="nerv-border p-4 text-left hover:bg-[var(--nerv-purple)]/10 transition-colors group"
        >
          <span className="text-xs text-[var(--nerv-purple)] tracking-widest">OPTION 02</span>
          <p className="text-sm text-[var(--nerv-text)] mt-2 font-bold group-hover:text-[var(--nerv-purple)]">
            사령관 권고안을 채택한다
          </p>
          <p className="text-[10px] text-[var(--nerv-text-dim)] mt-1">
            제3의 타협안 수용
          </p>
        </button>

        {/* Option 3: Human Override */}
        <button
          onClick={() => makeFinalDecision('human')}
          className="nerv-border p-4 text-left hover:bg-[var(--nerv-red)]/10 transition-colors group"
        >
          <span className="text-xs text-[var(--nerv-red)] tracking-widest">OPTION 03</span>
          <p className="text-sm text-[var(--nerv-text)] mt-2 font-bold group-hover:text-[var(--nerv-red)]">
            인류보완계획을 발동한다
          </p>
          <p className="text-[10px] text-[var(--nerv-text-dim)] mt-1">
            독자적 판단에 의한 결정
          </p>
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/FinalDecision.tsx && git commit -m "feat: add final decision UI with 3 choice buttons"
```

---

### Task 13: Error Overlay & Phase Controller

**Files:**
- Create: `src/components/ErrorOverlay.tsx`
- Create: `src/components/PhaseController.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Implement error overlay**

```tsx
// src/components/ErrorOverlay.tsx

'use client';

import { useStore } from '@/store/useStore';

export default function ErrorOverlay() {
  const { error, reset } = useStore();

  if (!error) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
      <div className="border-2 border-[var(--nerv-red)] bg-[var(--nerv-black)] p-8 max-w-md text-center
                      shadow-[0_0_30px_rgba(255,0,51,0.4)]">
        <div className="text-4xl mb-4">⚠</div>
        <h2 className="text-lg text-[var(--nerv-red)] glow-red tracking-[0.2em] mb-4">
          SYSTEM ERROR
        </h2>
        <p className="text-sm text-[var(--nerv-text)] mb-6 font-mono">
          {error}
        </p>
        <button
          onClick={reset}
          className="border border-[var(--nerv-red)] text-[var(--nerv-red)] px-6 py-2 
                     hover:bg-[var(--nerv-red)] hover:text-black transition-colors tracking-wider"
        >
          RETURN TO BASE
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Implement phase controller**

```tsx
// src/components/PhaseController.tsx

'use client';

import { useStore } from '@/store/useStore';
import AgendaInput from './AgendaInput';
import ChamberGrid from './ChamberGrid';
import TrinityMatrix from './TrinityMatrix';
import FinalDecision from './FinalDecision';
import ErrorOverlay from './ErrorOverlay';

export default function PhaseController() {
  const { phase } = useStore();

  return (
    <>
      <ErrorOverlay />
      {phase === 'input' && <AgendaInput />}
      {phase === 'computing' && <ChamberGrid />}
      {phase === 'result' && (
        <div>
          <TrinityMatrix />
          <FinalDecision />
        </div>
      )}
      {phase === 'decision' && <FinalDecision />}
    </>
  );
}
```

- [ ] **Step 3: Wire up page.tsx**

Replace `src/app/page.tsx` with:

```tsx
import PhaseController from '@/components/PhaseController';

export default function Home() {
  return (
    <main className="min-h-screen">
      <PhaseController />
    </main>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/ErrorOverlay.tsx src/components/PhaseController.tsx src/app/page.tsx && git commit -m "feat: add phase controller and error overlay, wire up main page"
```

---

### Task 14: GitHub Pages Deploy Config

**Files:**
- Create: `.github/workflows/deploy.yml`
- Modify: `next.config.js`

- [ ] **Step 1: Add GitHub Actions deploy workflow**

```yaml
# .github/workflows/deploy.yml

name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: out

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Update next.config.js for GitHub Pages basePath**

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Uncomment and set to your repo name for GitHub Pages:
  // basePath: '/magi-trinity',
};

module.exports = nextConfig;
```

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/deploy.yml next.config.js && git commit -m "feat: add GitHub Pages deploy workflow"
```

---

### Task 15: Build Verification & Final Polish

**Files:**
- Modify: `src/app/layout.tsx` (add ScanlineOverlay)
- Create: `src/components/ScanlineOverlay.tsx`

- [ ] **Step 1: Create ScanlineOverlay component**

```tsx
// src/components/ScanlineOverlay.tsx

'use client';

export default function ScanlineOverlay() {
  return <div className="scanline-overlay" aria-hidden="true" />;
}
```

- [ ] **Step 2: Update layout to use client ScanlineOverlay**

Replace `src/app/layout.tsx` with:

```tsx
import type { Metadata } from 'next';
import './globals.css';
import ScanlineOverlay from '@/components/ScanlineOverlay';

export const metadata: Metadata = {
  title: 'MAGI SYSTEM — Trinity Decision Engine',
  description: '다중 AI 에이전트 교차 검증 시뮬레이션',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen hex-bg">
        <ScanlineOverlay />
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Run full build**

```bash
cd /Users/cclss/Desktop/magi-trinity && npm run build
```

Expected: Build succeeds, `out/` directory generated with static files.

- [ ] **Step 4: Run dev server and verify**

```bash
cd /Users/cclss/Desktop/magi-trinity && npm run dev
```

Open `http://localhost:3000` — verify:
- Phase 1: Agenda input with character counter appears
- 500+ chars blocks submit
- MAGI SYSTEM ACTIVATE button is visible
- NERV console theme with scanline effect renders

- [ ] **Step 5: Final commit**

```bash
git add -A && git commit -m "feat: add scanline overlay and finalize build"
```
