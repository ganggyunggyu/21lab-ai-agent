import type { ChatService } from '../types';

export const MODEL_OPTIONS: { label: string; value: ChatService }[] = [
  { label: 'GPT5', value: 'gpt-5-v2' },
  { label: 'GPT4O', value: 'gpt-4-v3' },
  { label: 'Test', value: 'test' },
  { label: 'Grok', value: 'grok' },
  { label: '맛집', value: 'restaurant' },
  { label: '맛집GPT4O', value: 'restaurant-oai-4' },
];
