import { axios } from '../app';
import type { ChatService } from '../types/_chat';

type GenerationRequest = {
  service: ChatService;
  keyword: string;
  ref: string;
};
type GetCategoryReq = {
  keyword: string;
};

const API = import.meta.env.VITE_API_URL;

export const generateText = async (params: GenerationRequest) => {
  try {
    const response = await axios.post(
      `${API}/generate/${params.service}`,
      params
    );
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.status === 429) {
      throw new Error(
        'API 요청 할당량을 초과했습니다. 잠시 후 다시 시도해주세요.'
      );
    }
    console.error(error);
    throw error;
  }
};

export const getCategory = async (params: GetCategoryReq) => {
  try {
    const response = await axios.get(`${API}/category/${params.keyword}`);

    return response.data;
  } catch (error) {
    console.error(error);

    throw error;
  }
};
