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
  | 'test'
  | 'chunk'
  | 'gpt-merge';

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
