export interface Message {
  role: 'user' | 'bot';
  content: string;
  keyword?: string;
  timestamp?: number;
  id?: string;
  ref?: string;
  service?: string;
}

export type ChatService =
  | 'gpt-4-v2'
  | 'gpt-5-v2'
  | 'solar'
  | 'test'
  | 'chunk'
  | 'gpt-merge';
