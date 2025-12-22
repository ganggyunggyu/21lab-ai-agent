export type DraftStatus = 'PENDING' | 'GENERATING' | 'COMPLETED' | 'COPIED' | 'ERROR';

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
}

export interface EventLog {
  id: string;
  type: 'GENERATE_START' | 'GENERATE_SUCCESS' | 'GENERATE_ERROR' | 'COPY' | 'STATUS_CHANGE';
  draftId: string;
  message: string;
  timestamp: number;
  data?: Record<string, unknown>;
}

export interface StorageData {
  draftQueue: Draft[];
  eventLog: EventLog[];
}

export type MessageAction =
  | { type: 'GENERATE_DRAFT'; payload: { keyword: string; refMsg?: string; service: string } }
  | { type: 'GET_DRAFTS' }
  | { type: 'UPDATE_DRAFT_STATUS'; payload: { id: string; status: DraftStatus } }
  | { type: 'DELETE_DRAFT'; payload: { id: string } }
  | { type: 'CLEAR_LOGS' };

export interface MessageResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
