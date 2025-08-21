export type ModelService =
  | "gpt"
  | "claude"
  | "solar"
  | "gemini"
  | "gpt-5"
  | "gpt-4-v2";

export const MODEL_OPTIONS: { label: string; value: ModelService }[] = [
  { label: "GPT", value: "gpt" },
  { label: "GPT5", value: "gpt-5" },
  { label: "GPT4V2", value: "gpt-4-v2" },
  { label: "Gemini", value: "gemini" },
  { label: "Claude", value: "claude" },
  { label: "Solar", value: "solar" },
];
