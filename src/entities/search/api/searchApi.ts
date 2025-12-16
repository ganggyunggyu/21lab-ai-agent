import { axios } from '@/app';
import type {
  SearchRequest,
  SearchResponse,
  SearchDocument,
  SearchAllRequest,
  SearchAllResponse,
  AutocompleteResponse,
  PopularResponse,
  PopularPeriod,
  SearchHistoryResponse,
  BookmarksResponse,
  StatsResponse,
  UpdateManuscriptRequest,
  UpdateManuscriptResponse,
  DeleteManuscriptResponse,
} from '../model/types';

const API = import.meta.env.VITE_API_URL;

// 전체 카테고리 검색 API
export const searchAll = async (params: SearchAllRequest): Promise<SearchAllResponse> => {
  try {
    const { data } = await axios.post<SearchAllResponse>(`${API}/search/all`, params);
    return data;
  } catch (error: any) {
    if (error.response?.status === 400) {
      throw new Error(error.response.data?.detail || '검색 키워드를 입력해주세요.');
    }
    throw error;
  }
};

// 카테고리 내 검색 API
export const searchManuscripts = async (
  params: SearchRequest
): Promise<SearchResponse> => {
  try {
    const { data } = await axios.post<SearchResponse>(`${API}/search/keyword`, params);
    return data;
  } catch (error: any) {
    if (error.response?.status === 400) {
      throw new Error(error.response.data?.detail || '검색 키워드를 입력해주세요.');
    }
    if (error.response?.status === 500) {
      throw new Error(error.response.data?.detail || '원고 검색 중 오류가 발생했습니다.');
    }
    throw error;
  }
};

export const getManuscriptById = async (
  manuscriptId: string,
  category?: string
): Promise<SearchDocument> => {
  try {
    const params = category ? { category } : {};
    const { data } = await axios.get<SearchDocument>(
      `${API}/search/manuscript/${manuscriptId}`,
      { params }
    );
    return data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error('원고를 찾을 수 없습니다.');
    }
    if (error.response?.status === 500) {
      throw new Error(error.response.data?.detail || '원고 조회 중 오류가 발생했습니다.');
    }
    throw error;
  }
};

// 자동완성 API
export const getAutocomplete = async (
  query: string,
  limit: number = 5
): Promise<AutocompleteResponse> => {
  const { data } = await axios.get<AutocompleteResponse>(`${API}/search/autocomplete`, {
    params: { q: query, limit },
  });
  return data;
};

// 인기 검색어 API
export const getPopularKeywords = async (
  period: PopularPeriod = 'week',
  limit: number = 10
): Promise<PopularResponse> => {
  const { data } = await axios.get<PopularResponse>(`${API}/search/popular`, {
    params: { period, limit },
  });
  return data;
};

// 검색 히스토리 API
export const getSearchHistory = async (limit: number = 10): Promise<SearchHistoryResponse> => {
  const { data } = await axios.get<SearchHistoryResponse>(`${API}/search/history`, {
    params: { limit },
  });
  return data;
};

export const addSearchHistory = async (
  keyword: string,
  category?: string
): Promise<{ ok: boolean }> => {
  const { data } = await axios.post<{ ok: boolean }>(`${API}/search/history`, {
    keyword,
    category,
  });
  return data;
};

export const deleteSearchHistory = async (id: string): Promise<{ ok: boolean }> => {
  const { data } = await axios.delete<{ ok: boolean }>(`${API}/search/history/${id}`);
  return data;
};

export const clearSearchHistory = async (): Promise<{ ok: boolean }> => {
  const { data } = await axios.delete<{ ok: boolean }>(`${API}/search/history`);
  return data;
};

// 즐겨찾기 API
export const getBookmarks = async (
  page: number = 1,
  limit: number = 10
): Promise<BookmarksResponse> => {
  const { data } = await axios.get<BookmarksResponse>(`${API}/search/bookmarks`, {
    params: { page, limit },
  });
  return data;
};

export const addBookmark = async (manuscriptId: string): Promise<{ ok: boolean }> => {
  const { data } = await axios.post<{ ok: boolean }>(`${API}/search/bookmark/${manuscriptId}`);
  return data;
};

export const removeBookmark = async (manuscriptId: string): Promise<{ ok: boolean }> => {
  const { data } = await axios.delete<{ ok: boolean }>(`${API}/search/bookmark/${manuscriptId}`);
  return data;
};

// 통계 API
export const getStats = async (period: string = 'week'): Promise<StatsResponse> => {
  const { data } = await axios.get<StatsResponse>(`${API}/search/stats`, {
    params: { period },
  });
  return data;
};

// 원고 관리 API
export const updateManuscript = async (
  manuscriptId: string,
  updates: UpdateManuscriptRequest
): Promise<UpdateManuscriptResponse> => {
  const { data } = await axios.patch<UpdateManuscriptResponse>(
    `${API}/search/manuscript/${manuscriptId}`,
    updates
  );
  return data;
};

export const deleteManuscript = async (manuscriptId: string): Promise<DeleteManuscriptResponse> => {
  const { data } = await axios.delete<DeleteManuscriptResponse>(
    `${API}/search/manuscript/${manuscriptId}`
  );
  return data;
};
