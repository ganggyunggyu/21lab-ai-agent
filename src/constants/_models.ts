export interface ModelOption {
  label: string;
  value: string;
  description: string;
}

export const MODEL_OPTIONS: ModelOption[] = [
  // { label: 'TEST', value: 'test', description: '' },
  // { label: 'GPT5.2', value: 'gpt-5-2', description: '' },
  // { label: 'GPT5', value: 'gpt-5-v2', description: '' },
  {
    label: 'GROK',
    value: 'grok',
    description: '빠름 잘뜸',
  },
  { label: 'GPT4O', value: 'gpt4o', description: '두번째로 잘뜸' },
  { label: 'CHATGPT4O', value: 'chatgpt4o', description: 'chatgpt-4o-latest' },
  // { label: 'GEM', value: 'gemini-3-pro', description: '' },
  // { label: 'CLAUDE', value: 'claude', description: '' },
  // { label: 'CLEAN_CLAUDE', value: 'clean-claude', description: '' },
  // { label: 'DS', value: 'deepseek', description: '' },
  // { label: 'GPT5.2_NEW', value: 'openai-new', description: '' },
  {
    label: 'GEM_NEW',
    value: 'gemini-new',
    description: '네이버 새로운 로직 프롬프트 적용',
  },
  // { label: 'DS_NEW', value: 'deepseek-new', description: '' },
  // { label: 'GROK_NEW', value: 'grok-new', description: '' },
  { label: 'CLEAN_DEEPSEEK', value: 'clean-deepseek', description: '' },
  // { label: 'GPT5.1_맛집', value: 'restaurant-gpt5', description: '' },
  // { label: 'GPT4O_맛집', value: 'restaurant-oai-4', description: '' },
  // { label: 'GEM_맛집', value: 'restaurant', description: '' },
  // { label: 'GROK_맛집', value: 'restaurant-grok', description: '' },
  // { label: 'CLAUDE_맛집', value: 'restaurant-claude', description: '' },
  // { label: 'DEEPSEEK_맛집', value: 'restaurant-deepseek', description: '' },
  // { label: 'SOLAR', value: 'solar', description: '' },
  // { label: 'SOLAR_CLEAN', value: 'solar-ver3-clean', description: '' },
  {
    label: 'GPT_CLEAN',
    value: 'gpt-ver3-clean',
    description: '기본 데이터와 프롬프트만 사용한 GPT 4O 참조원고 권장',
  },
  {
    label: 'GPT_글쓰기2',
    value: 'gpt-ceo',
    description: 'GPT 5.2 글쓰기2 프롬프트',
  },
  {
    label: 'GEM_글쓰기2',
    value: 'gemini-ceo',
    description: 'Gemini 3 Flash 글쓰기2 프롬프트',
  },
  {
    label: 'GEM_카페',
    value: 'gemini-cafe',
    description: '카페용 200~300자 짧은 글',
  },
  // { label: 'GROK_CLEAN', value: 'grok-ver3-clean', description: '' },
  // { label: 'GEM3_FLASH', value: 'gemini-3-flash', description: '' },
  // { label: 'GEM3_FLASH_CLEAN', value: 'gemini-3-flash-clean', description: '' },
];

export type ChatService = (typeof MODEL_OPTIONS)[number]['value'];
