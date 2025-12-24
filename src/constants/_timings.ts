import type { ChatService } from '@/types';

export const AUTO_SCROLL_DELAY = 300;

export const EXPECTED_RESPONSE_TIME: Record<ChatService, number> = {
  grok: 30,
  'gpt-4-v3': 70,
  'gemini-3-pro': 100,
  claude: 80,
  'clean-claude': 60,
  deepseek: 200,
  'openai-new': 100,
  'gemini-new': 100,
  'grok-new': 30,
  'deepseek-new': 150,
  'clean-deepseek': 100,
  'gemini-cafe': 70,
  'gpt-ver3-clean': 80,
  'gpt-ceo': 90,
  'gemini-ceo': 110,
};
