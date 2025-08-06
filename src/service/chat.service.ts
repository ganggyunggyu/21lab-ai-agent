import { axios } from "../app";

type GenerationRequest = {
  service: "gpt" | "claude" | 'solar'
  keyword: string
}

export const generateText = async (params: GenerationRequest) => {
  try {
    const response = await axios.post("http://127.0.0.1:8000/generate", params)
    return response.data
  } catch (error: any) {
    console.error("⚠️ 텍스트 생성 오류:", error.response?.data || error.message)
    throw error
  }
}