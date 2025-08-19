import { axios } from "../app";

type GenerationRequest = {
  service: "gpt" | "claude" | 'solar' | 'gemini'
  keyword: string
  ref: string
}
type GetCategoryReq = {
  keyword: string
}

export const generateText = async (params: GenerationRequest) => {
 
  try {
    const response = await axios.post(`http://192.168.0.90:8000/generate/${params.service}`, params)
    return response.data
  } catch (error: any) {
    console.error(error)
    
    throw error
  }
}

export const getCategory = async (params:GetCategoryReq) => {
  try {
    
    const response = await axios.get(`http://192.168.0.90:8000/category/${params.keyword}`)
    
    return response.data
  } catch (error) {
    console.error(error)

    throw error
  }
}

// http://43.201.97.68