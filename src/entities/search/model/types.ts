export interface SearchDocument {
  _id: string;
  content: string;
  createdAt: string;
  engine: string;
  service?: string;
  category?: string;
  keyword: string;
  ref?: string;
  work_start_date?: string;
  test_mode?: boolean;
  deleted?: boolean;
  deletedAt?: string;
  memo?: string;
  isVisible?: boolean;
  // 전체 검색 결과에서 추가되는 필드
  __category?: string;
  __score?: number;
}

// 카테고리 내 검색
export interface SearchRequest {
  query: string;
  category?: string;
  page?: number;
  limit?: number;
}

export interface SearchResponse {
  documents: SearchDocument[];
  total: number;
  skip: number;
  limit: number;
}

// 전체 카테고리 검색
export interface SearchAllRequest {
  q: string;
  limit?: number;
}

export interface SearchAllResponse {
  query: string;
  count: number;
  results: SearchDocument[];
}

// 자동완성
export interface AutocompleteItem {
  keyword: string;
  count: number;
}

export interface AutocompleteResponse {
  suggestions: AutocompleteItem[];
}

// 인기 검색어
export type PopularPeriod = 'today' | 'week' | 'month';

export interface PopularKeyword {
  rank: number;
  keyword: string;
  count: number;
  change: number;
}

export interface PopularResponse {
  period: PopularPeriod;
  keywords: PopularKeyword[];
}

// 검색 히스토리
export interface SearchHistoryItem {
  id: string;
  keyword: string;
  category?: string;
  searchedAt: number;
}

export interface SearchHistoryResponse {
  history: SearchHistoryItem[];
}

// 즐겨찾기
export interface BookmarkItem {
  id: string;
  manuscript: SearchDocument;
  createdAt: number;
}

export interface BookmarksResponse {
  bookmarks: BookmarkItem[];
  total: number;
  page: number;
  limit: number;
}

// 통계
export interface StatsResponse {
  period: string;
  totalCount: number;
  byEngine: Record<string, number>;
  byCategory: Record<string, number>;
  daily: Array<{ date: string; count: number }>;
}

// 원고 수정
export interface UpdateManuscriptRequest {
  content?: string;
  memo?: string;
}

export interface UpdateManuscriptResponse {
  ok: boolean;
  manuscript: SearchDocument;
}

export interface DeleteManuscriptResponse {
  ok: boolean;
  deletedId: string;
}

// 노출 토글
export interface ToggleVisibilityRequest {
  category: string;
  manuscript_id: string;
}

export interface ToggleVisibilityResponse {
  success: boolean;
  manuscript_id: string;
  isVisible: boolean;
  message: string;
}

export interface VisibilityResponse {
  manuscript_id: string;
  category: string;
  isVisible: boolean;
}
