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
