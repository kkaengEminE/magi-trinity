export type AIEngine = 'gpt-4o' | 'claude-3.5-sonnet' | 'gemini-1.5-pro';

export type PersonaId = 'melchior' | 'balthasar' | 'caspar';

export type Vote = 'APPROVE' | 'REJECT';

export type ChamberVerdict = 'APPROVE' | 'REJECT';

export type ChamberType = 'independent' | 'collaborative';

export type Phase = 'input' | 'computing' | 'result' | 'decision';

export interface PersonaOpinion {
  personaId: PersonaId;
  personaName: string;
  opinion: string;
  vote: Vote;
  aiEngine: AIEngine;
}

export interface ChamberConfig {
  id: number;
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
  approveCount: number;
  rejectCount: number;
  verdict: ChamberVerdict;
}

export interface GendoMediation {
  statement: string;
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
