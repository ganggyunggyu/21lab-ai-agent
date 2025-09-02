import type { ChatService } from '../types';

export const MODEL_OPTIONS: { label: string; value: ChatService }[] = [
  { label: 'Chunk', value: 'chunk' },
  { label: 'GPT', value: 'gpt' },
  { label: 'GPT5', value: 'gpt-5' },
  { label: 'GPT5V2', value: 'gpt-5-v2' },
  { label: 'GPT4V2', value: 'gpt-4-v2' },
  { label: 'Gemini', value: 'gemini' },
  { label: 'Claude', value: 'claude' },
  { label: 'Solar', value: 'solar' },
  { label: 'Test', value: 'test' },
];
