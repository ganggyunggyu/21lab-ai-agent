export interface FavoriteSearch {
  id: string;
  keyword: string;
  refMsg?: string;
  title: string;
  createdAt: Date;
  isPublished?: boolean; // 발행원고 여부
  resultSample?: string; // 결과 원고 3줄 샘플
  memo?: string; // 메모 (수정 내역, 발행 일정 등)
  blogId?: string; // 블로그 포스트 ID (네이버 블로그 등)
  
  // 활성화 관리
  isActive?: boolean; // 활성화 여부 (기본값: true)
  
  // 노출 관리
  isVisible?: boolean; // 노출 여부 (기본값: false)
  exposureRank?: number; // 노출 순위 (낮을수록 우선 순위 높음)
  
  // 채팅 데이터 (발행원고용)
  userMessageId?: string; // 사용자 메시지 ID
  botMessageId?: string; // 봇 메시지 ID
  botContent?: string; // 봇 응답 전체 내용
  service?: string; // 사용된 AI 서비스
  originalTimestamp?: number; // 원본 메시지 타임스탬프
}

export interface BlogIdGroupInfo {
  total: number;
  position: number;
  isLatest: boolean;
}

export type SortBy = 'recent' | 'title';