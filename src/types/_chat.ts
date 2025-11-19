export interface Message {
  role: 'user' | 'bot';
  content: string;
  title?: string;
  keyword?: string;
  timestamp?: number;
  id?: string;
  ref?: string;
  service?: string;
  loadingProgress?: number;
}

export type ChatService =
  | 'gpt-5-v2'
  | 'gpt-4-v3'
  | 'test'
  | 'restaurant'
  | 'grok'
  | 'restaurant-oai-4'
  | 'gemini-3-pro'
  | 'restaurant-gpt5';

export interface SelectedMessagePackage {
  userMessage: Message;
  responses: Message[];
}

export interface BatchRequest {
  id: string;
  keyword: string;
  refMsg?: string;
}

export type BatchStatus = 'pending' | 'loading' | 'success' | 'error';
