export type DraftStatus =
  | 'PENDING'
  | 'GENERATING'
  | 'IMAGE_GENERATING'
  | 'COMPLETED'
  | 'COPIED'
  | 'POSTING'
  | 'POSTED'
  | 'ERROR';

export interface ImageItem {
  url: string;
}

export interface Draft {
  id: string;
  keyword: string;
  refMsg?: string;
  service: string;
  content?: string;
  title?: string;
  status: DraftStatus;
  createdAt: number;
  updatedAt: number;
  manuscriptId?: string;
  error?: string;
  images?: ImageItem[];
  scheduledTime?: number;
  withImage?: boolean;
}

export interface EventLog {
  id: string;
  type: 'GENERATE_START' | 'GENERATE_SUCCESS' | 'GENERATE_ERROR' | 'COPY' | 'STATUS_CHANGE';
  draftId: string;
  message: string;
  timestamp: number;
  data?: Record<string, unknown>;
}

export interface NaverAccount {
  id: string;
  password: string;
}

export type LoginStatus = 'LOGGED_OUT' | 'LOGGING_IN' | 'LOGGED_IN' | 'ERROR';

export interface StorageData {
  draftQueue: Draft[];
  eventLog: EventLog[];
  account?: NaverAccount;
  loginStatus?: LoginStatus;
}

export interface BatchOptions {
  withImage: boolean;
  autoSchedule: boolean;
  scheduleInterval: number;
  startTime?: string;
}

export type MessageAction =
  | { type: 'GENERATE_DRAFT'; payload: { keyword: string; refMsg?: string; service: string; withImage?: boolean } }
  | { type: 'GENERATE_IMAGE'; payload: { id: string; keyword: string } }
  | { type: 'START_BATCH'; payload: { keywords: string[]; refMsg?: string; service: string; options: BatchOptions } }
  | { type: 'STOP_BATCH' }
  | { type: 'GET_DRAFTS' }
  | { type: 'UPDATE_DRAFT_STATUS'; payload: { id: string; status: DraftStatus } }
  | { type: 'UPDATE_DRAFT_IMAGES'; payload: { id: string; images: ImageItem[] } }
  | { type: 'DELETE_DRAFT'; payload: { id: string } }
  | { type: 'CLEAR_ALL_DRAFTS' }
  | { type: 'CLEAR_LOGS' }
  | { type: 'NAVER_LOGIN' }
  | { type: 'NAVER_LOGOUT' }
  | { type: 'GET_LOGIN_STATUS' };

export interface MessageResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
