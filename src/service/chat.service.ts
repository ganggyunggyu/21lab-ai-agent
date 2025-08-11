import { axios } from "../app";

type GenerationRequest = {
  service: "gpt" | "claude" | 'solar' | 'gemini'
  keyword: string
  ref: string
}

export const generateText = async (params: GenerationRequest) => {
 
  try {
    const response = await axios.post(`http://localhost:8000/generate/${params.service}`, params)
    return response.data
  } catch (error: any) {
    console.error(error)
    
    throw error
  }
}