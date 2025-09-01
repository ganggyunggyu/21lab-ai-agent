export interface Message {
  role: 'user' | 'bot';
  content: string;
  keyword?: string;
  timestamp?: number;
  id?: string;
}

export type ChatService =
  | 'gpt'
  | 'claude'
  | 'solar'
  | 'gemini'
  | 'gpt-5'
  | 'gpt-4-v2'
  | 'gpt-5-v2'
  | 'test';
