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
            'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
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
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
        }
      }
    }
    throw new Error(`NERV_COMM_FAILURE: ${lastError?.message}`);
  }
}
