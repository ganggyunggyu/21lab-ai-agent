export const AUTO_SCROLL_DELAY = 300;

// 서비스별 예상 응답 시간 (초)
export const EXPECTED_RESPONSE_TIME = {
  grok: 20,
  restaurant: 20,
  test: 60,
  'gpt-5-v2': 60,
} as const;
