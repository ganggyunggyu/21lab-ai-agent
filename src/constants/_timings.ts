import type { ChatService } from '@/types/_chat';

export const AUTO_SCROLL_DELAY = 300;

export const EXPECTED_RESPONSE_TIME: Record<ChatService, number> = {
  'gpt-5-v2': 90,
  test: 45,
  restaurant: 70,
  grok: 25,
};
