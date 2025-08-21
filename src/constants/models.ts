export type ModelService = 'gpt' | 'claude' | 'solar' | 'gemini' | 'gpt-5'

export const MODEL_OPTIONS: { label: string; value: ModelService }[] = [
  { label: 'GPT', value: 'gpt' },
  { label: 'GPT5', value: 'gpt-5' },
  { label: 'Gemini', value: 'gemini' },
  { label: 'Claude', value: 'claude' },
  { label: 'Solar', value: 'solar' }
]

