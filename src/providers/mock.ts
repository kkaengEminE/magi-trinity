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
    const delay = 1000 + Math.random() * 2000;
    await new Promise(resolve => setTimeout(resolve, delay));
    return params.systemPrompt;
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
