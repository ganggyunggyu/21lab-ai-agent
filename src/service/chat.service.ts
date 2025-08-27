import { axios } from '../app';

type GenerationRequest = {
  service:
    | 'gpt'
    | 'claude'
    | 'solar'
    | 'gemini'
    | 'gpt-5'
    | 'gpt-4-v2'
    | 'gpt-5-v2';
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
    const response = await axios.get(`${API}/generate/${params.keyword}`);

    return response.data;
  } catch (error) {
    console.error(error);

    throw error;
  }
};

// http://43.201.97.68

// http://192.168.0.90
