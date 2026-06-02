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
  { id: 1, type: 'independent', assignments: { melchior: 'gpt-4o', balthasar: 'gpt-4o', caspar: 'gpt-4o' } },
  { id: 2, type: 'independent', assignments: { melchior: 'claude-3.5-sonnet', balthasar: 'claude-3.5-sonnet', caspar: 'claude-3.5-sonnet' } },
  { id: 3, type: 'independent', assignments: { melchior: 'gemini-1.5-pro', balthasar: 'gemini-1.5-pro', caspar: 'gemini-1.5-pro' } },
  { id: 4, type: 'collaborative', assignments: { melchior: 'gpt-4o', balthasar: 'claude-3.5-sonnet', caspar: 'gemini-1.5-pro' } },
  { id: 5, type: 'collaborative', assignments: { melchior: 'gpt-4o', balthasar: 'gemini-1.5-pro', caspar: 'claude-3.5-sonnet' } },
  { id: 6, type: 'collaborative', assignments: { melchior: 'claude-3.5-sonnet', balthasar: 'gpt-4o', caspar: 'gemini-1.5-pro' } },
  { id: 7, type: 'collaborative', assignments: { melchior: 'claude-3.5-sonnet', balthasar: 'gemini-1.5-pro', caspar: 'gpt-4o' } },
  { id: 8, type: 'collaborative', assignments: { melchior: 'gemini-1.5-pro', balthasar: 'gpt-4o', caspar: 'claude-3.5-sonnet' } },
  { id: 9, type: 'collaborative', assignments: { melchior: 'gemini-1.5-pro', balthasar: 'claude-3.5-sonnet', caspar: 'gpt-4o' } },
];

function parsePersonaResponse(raw: string): { opinion: string; vote: 'APPROVE' | 'REJECT' } {
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found');
    const parsed = JSON.parse(jsonMatch[0]);
    const vote = parsed.vote === 'APPROVE' ? 'APPROVE' : 'REJECT';
    const opinion = String(parsed.opinion || '').slice(0, 60);
    return { opinion, vote };
  } catch {
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
    if (rawAgenda.endsWith('?') || rawAgenda.endsWith('가?')) {
      return rawAgenda;
    }
    return `${rawAgenda}을(를) 실행해야 하는가?`;
  }

  const result = await provider.call({
    model: 'gpt-4o',
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

  const round1 = await Promise.all(
    personas.map(p =>
      runPersona(provider, config.assignments[p], p, agenda, buildPersonaPrompt(p))
    )
  );

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
