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

// ChatService 타입은 constants/_models.ts에서 자동 추출됨
export type { ChatService } from '@/constants/_models';

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
