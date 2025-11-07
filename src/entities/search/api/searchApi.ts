import { axios } from '@/app';
import type { SearchRequest, SearchResponse } from '../model/types';

const API = import.meta.env.VITE_API_URL;

export const searchManuscripts = async (
  params: SearchRequest
): Promise<SearchResponse> => {
  try {
    const response = await axios.post<SearchResponse>(
      `${API}/search/keyword`,
      params
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 400) {
      throw new Error(
        error.response.data?.detail || '검색 키워드를 입력해주세요.'
      );
    }
    if (error.response?.status === 500) {
      throw new Error(
        error.response.data?.detail || '원고 검색 중 오류가 발생했습니다.'
      );
    }
    throw error;
  }
};
