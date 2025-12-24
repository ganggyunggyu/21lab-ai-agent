export type LoginStatus = 'LOGGED_OUT' | 'LOGGING_IN' | 'LOGGED_IN' | 'ERROR';
export type LogType = 'INFO' | 'SUCCESS' | 'ERROR' | 'WARNING';

export interface LogEntry {
  id: string;
  type: LogType;
  message: string;
  detail?: string;
  timestamp: number;
}

export interface UploadedFolder {
  name: string;
  manuscriptFile: File | null;
  imageFiles: File[];
}

export interface NaverAccount {
  id: string;
  password: string;
}
