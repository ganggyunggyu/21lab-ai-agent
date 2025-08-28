import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { generateText } from '../service/chat.service';
import { MODEL_OPTIONS, type ModelService } from '../constants/models';
import { INTRO_MARKDOWN } from '../constants/texts';
import { PART_SEPARATOR } from '../constants/regex';
import { getSelectedService, setSelectedService } from '../utils/localStorage';
import type { Message } from '../types/chat';

export const useChatStore = defineStore(
  'chat',
  () => {
    const defaultService = (MODEL_OPTIONS?.[0]?.value ??
      'openai') as ModelService;
    const storedService =
      (getSelectedService() as ModelService) || defaultService;

    const messages = ref<Message[]>([
      {
        role: 'bot',
        content: INTRO_MARKDOWN,
        timestamp: Date.now(),
      },
    ]);

    const keyword = ref('');
    const refMsg = ref('');
    const service = ref<ModelService>(storedService);
    const isLoading = ref(false);
    const showRefInput = ref(true);

    const displayMessages = computed(() => messages.value);
    const hasMessages = computed(() => messages.value.length > 1);

    const handleGenerate = async () => {
      if (!keyword.value.trim()) return;

      const input = keyword.value;
      const refSnapshot = refMsg.value;

      messages.value.push({
        role: 'user',
        content: input,
        keyword: input,
        timestamp: Date.now(),
      });

      keyword.value = '';
      showRefInput.value = false;
      isLoading.value = true;

      const loadingIndex = messages.value.length;
      messages.value.push({
        role: 'bot',
        content: 'loading',
        keyword: input,
        timestamp: Date.now(),
      });

      try {
        const res = await generateText({
          service: service.value || defaultService,
          keyword: input,
          ref: refSnapshot,
        });

        const botResponse: string = res?.content || '(응답 없음)';
        const parts = botResponse
          .split(PART_SEPARATOR)
          .map((p) => p.trim())
          .filter(Boolean);

        messages.value.splice(loadingIndex, 1);

        for (const part of parts) {
          messages.value.push({
            role: 'bot',
            content: part,
            keyword: input,
            timestamp: Date.now(),
          });
        }
      } catch (error) {
        messages.value[loadingIndex] = {
          role: 'bot',
          content: `⚠️ ${
            (error as Error).message || '오류가 발생했어요. 다시 시도해주세요!'
          }`,
          keyword: input,
          timestamp: Date.now(),
        };
        console.error(error);
      } finally {
        isLoading.value = false;
        refMsg.value = '';
      }
    };

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleGenerate();
      }
    };

    const handleRegenerate = (msg: Message) => {
      if (msg.keyword) {
        keyword.value = msg.keyword;
        handleGenerate();
      }
    };

    const updateService = (newService: ModelService) => {
      service.value = newService;
      setSelectedService(newService || defaultService);
    };

    const addQuickMessage = (suggestionText: string) => {
      keyword.value = suggestionText;
      handleGenerate();
    };

    const deleteMessage = (index: number) => {
      if (index > 0 && index < messages.value.length) {
        messages.value.splice(index, 1);
      }
    };

    const clearChat = () => {
      messages.value = [
        {
          role: 'bot',
          content: INTRO_MARKDOWN,
          timestamp: Date.now(),
        },
      ];
    };

    const exportChat = () => {
      const exportData = {
        exportedAt: new Date().toISOString(),
        messageCount: messages.value.length,
        messages: messages.value.map((msg) => ({
          role: msg.role,
          content: msg.content,
          keyword: msg.keyword,
          timestamp: msg.timestamp,
          time: new Date(msg.timestamp || 0).toLocaleString('ko-KR'),
        })),
      };

      return JSON.stringify(exportData, null, 2);
    };

    return {
      // state
      messages,
      keyword,
      refMsg,
      service,
      isLoading,
      showRefInput,
      // computed
      displayMessages,
      hasMessages,
      // actions
      handleGenerate,
      handleKeyPress,
      handleRegenerate,
      updateService,
      addQuickMessage,
      deleteMessage,
      clearChat,
      exportChat,
    };
  },
  {
    persist: {
      key: 'chat-store',
      storage: localStorage,
    },
  }
);
