import type { ChatService } from '@/types';

export const AUTO_SCROLL_DELAY = 300;

export const EXPECTED_RESPONSE_TIME: Record<ChatService, number> = {
  'gpt-5-v2': 90,
  test: 45,
  restaurant: 70,
  grok: 25,
  'gpt-4-v3': 50,
  'gemini-3-pro': 100,
  'restaurant-gpt5': 120,
  'restaurant-oai-4': 90,
  claude: 70,
  'clean-claude': 60,
  'restaurant-grok': 25,
  'restaurant-claude': 70,
  'restaurant-deepseek': 80,
  deepseek: 100,
  'clean-deepseek': 100,
};
