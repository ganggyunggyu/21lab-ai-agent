import { useMutation } from '@tanstack/vue-query';
import { generateText } from '../service/chat.service';
import type { ModelService } from '../constants/models';

export interface ChatGenerationParams {
  service: ModelService;
  keyword: string;
  ref: string;
  messageId: string;
}

export const useChatGeneration = () => {
  return useMutation({
    mutationFn: async (params: ChatGenerationParams) => {
      const { messageId, ...apiParams } = params;
      const response = await generateText(apiParams);
      return { ...response, messageId };
    },
    onError: (error, variables) => {
      console.error(`Message generation failed for ${variables.messageId}:`, error);
    },
  });
};

// 여러 개의 mutation을 동시에 관리하기 위한 헬퍼
export const useChatMutations = () => {
  const activeMutations = new Map<string, ReturnType<typeof useChatGeneration>>();

  const createMutation = (messageId: string) => {
    const mutation = useChatGeneration();
    activeMutations.set(messageId, mutation);
    return mutation;
  };

  const removeMutation = (messageId: string) => {
    activeMutations.delete(messageId);
  };

  const getMutation = (messageId: string) => {
    return activeMutations.get(messageId);
  };

  const isAnyLoading = () => {
    return Array.from(activeMutations.values()).some(mutation => mutation.isPending.value);
  };

  return {
    createMutation,
    removeMutation,
    getMutation,
    isAnyLoading,
    activeMutations,
  };
};