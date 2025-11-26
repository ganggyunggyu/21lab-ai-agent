import type { ChatService } from '../types';

export const MODEL_OPTIONS: { label: string; value: ChatService }[] = [
  { label: 'TEST', value: 'test' },
  { label: 'GPT5', value: 'gpt-5-v2' },
  { label: 'GPT4O', value: 'gpt-4-v3' },
  { label: 'GEM', value: 'gemini-3-pro' },
  { label: 'GROK', value: 'grok' },
  { label: 'CLAUDE', value: 'claude' },
  { label: 'GPT5.1_맛집', value: 'restaurant-gpt5' },
  { label: 'GPT4O_맛집', value: 'restaurant-oai-4' },
  { label: 'GEM_맛집', value: 'restaurant' },
  { label: 'GROK_맛집', value: 'restaurant-grok' },
  { label: 'CLAUDE_맛집', value: 'restaurant-claude' },
];
