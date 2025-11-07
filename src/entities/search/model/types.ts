export interface SearchDocument {
  _id: string;
  content: string;
  timestamp: number;
  engine: string;
  service?: string;
  category?: string;
  keyword: string;
  ref?: string;
  work_start_date?: string;
  test_mode?: boolean;
}

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
