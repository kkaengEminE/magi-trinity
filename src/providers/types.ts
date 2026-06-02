import { AIEngine } from '@/types';

export interface AIProvider {
  call(params: {
    model: AIEngine;
    systemPrompt: string;
    userPrompt: string;
  }): Promise<string>;
}
