export interface ImageItem {
  url: string;
}

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
  manuscriptId?: string;
  // 이미지 관련 필드
  images?: ImageItem[];
  imageLoading?: boolean;
  imageError?: string;
  // 스트리밍 관련 필드
  isStreaming?: boolean;
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
