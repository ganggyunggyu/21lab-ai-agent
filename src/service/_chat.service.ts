import { axios } from '@/app';
import { isAxiosError } from 'axios';
import type { ChatService } from '@/types';

type GenerationRequest = {
  service: ChatService;
  keyword: string;
  ref: string;
};

type GenerationResponse = {
  content: string;
};

type ImageGenerationRequest = {
  keyword: string;
};

type ImageItem = {
  url: string;
};

type ImageGenerationResponse = {
  images: ImageItem[];
  total: number;
  failed: number;
};

type GetCategoryReq = {
  keyword: string;
};

const API = import.meta.env.VITE_API_URL;

const getEndpoint = (service: ChatService): string => {
  return `${API}/generate/${service}`;
};

export const generateText = async (params: GenerationRequest): Promise<GenerationResponse> => {
  try {
    const endpoint = getEndpoint(params.service);
    const response = await axios.post<GenerationResponse>(endpoint, params);
    return response.data;
  } catch (error: unknown) {
    if (isAxiosError(error) && error.response?.status === 429) {
      throw new Error(
        'API 요청 할당량을 초과했습니다. 잠시 후 다시 시도해주세요.'
      );
    }
    throw error;
  }
};

export const getCategory = async (params: GetCategoryReq) => {
  try {
    const response = await axios.get(`${API}/category/${params.keyword}`);

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const generateImage = async (params: ImageGenerationRequest): Promise<ImageGenerationResponse> => {
  try {
    const response = await axios.post<ImageGenerationResponse>(`${API}/generate/image`, params);
    return response.data;
  } catch (error: unknown) {
    if (isAxiosError(error) && error.response?.status === 429) {
      throw new Error('이미지 API 요청 할당량을 초과했습니다.');
    }
    throw error;
  }
};
