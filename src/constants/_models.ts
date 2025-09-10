import type { ChatService } from '../types';

export const MODEL_OPTIONS: { label: string; value: ChatService }[] = [
  { label: 'CHUNK', value: 'chunk' },
  { label: 'GPT5', value: 'gpt-5-v2' },
  { label: 'GPT4', value: 'gpt-4-v2' },
  { label: 'Solar', value: 'solar' },
  { label: 'TEST', value: 'test' },
  { label: 'GPT_MERGE', value: 'gpt-merge' },
];
