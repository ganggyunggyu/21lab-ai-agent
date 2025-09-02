import { defineStore } from 'pinia';
import { ref, computed, reactive } from 'vue';
import { generateText } from '../service/_chat.service';
import { MODEL_OPTIONS, type ModelService } from '../constants/_models';
import { INTRO_MARKDOWN } from '../constants/_texts';
import { PART_SEPARATOR } from '../constants/_regex';
import { getSelectedService, setSelectedService } from '../utils/_localStorage';
import type { Message } from '../types/_chat';

export const useChatStore = defineStore(
  'chat',
  () => {
    const defaultService = (MODEL_OPTIONS?.[0]?.value ??
      'openai') as ModelService;
    const storedService =
      (getSelectedService() as ModelService) || defaultService;

    const messages = ref<Message[]>([
      {
        id: 'intro-message',
        role: 'bot',
        content: INTRO_MARKDOWN,
        timestamp: Date.now(),
      },
    ]);

    const keyword = ref('');
    const refMsg = ref('');
    const service = ref<ModelService>(storedService);
    const pendingMessages = reactive(new Set<string>());
    const showRefInput = ref(true);
    const activeRequests = reactive(new Map<string, AbortController>());

    const displayMessages = computed(() => messages.value);
    const hasMessages = computed(() => messages.value.length > 1);
    const isLoading = computed(() => pendingMessages.size > 0);

    const handleGenerate = async () => {
      if (!keyword.value.trim()) return;

      const input = keyword.value;
      const refSnapshot = refMsg.value;
      const messageId = `msg-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      // User 메시지 추가
      messages.value.push({
        id: `user-${messageId}`,
        role: 'user',
        content: input,
        keyword: input,
        timestamp: Date.now(),
      });

      // 로딩 메시지 추가
      const loadingMessageId = `bot-${messageId}`;
      messages.value.push({
        id: loadingMessageId,
        role: 'bot',
        content: 'loading',
        keyword: input,
        timestamp: Date.now(),
      });

      keyword.value = '';
      showRefInput.value = false;
      pendingMessages.add(loadingMessageId);

      // AbortController 생성하여 요청 취소 가능하도록
      const abortController = new AbortController();
      activeRequests.set(loadingMessageId, abortController);

      try {
        const res = await generateText({
          service: service.value || defaultService,
          keyword: input,
          ref: refSnapshot,
        });

        // 성공 시 처리
        const botResponse: string = res?.content || '(응답 없음)';
        const parts = botResponse
          .split(PART_SEPARATOR)
          .map((p) => p.trim())
          .filter(Boolean);

        // 로딩 메시지 위치 찾기
        const currentLoadingIndex = messages.value.findIndex(
          (msg) => msg.id === loadingMessageId
        );
        if (currentLoadingIndex !== -1) {
          // 첫 번째 응답으로 로딩 메시지 교체
          if (parts.length > 0) {
            messages.value[currentLoadingIndex] = {
              id: `bot-${Date.now()}-${Math.random()
                .toString(36)
                .substr(2, 9)}`,
              role: 'bot',
              content: parts[0],
              keyword: input,
              timestamp: Date.now(),
            };

            // 나머지 응답들을 로딩 메시지 다음 위치에 순서대로 삽입
            for (let i = 1; i < parts.length; i++) {
              messages.value.splice(currentLoadingIndex + i, 0, {
                id: `bot-${Date.now()}-${Math.random()
                  .toString(36)
                  .substr(2, 9)}`,
                role: 'bot',
                content: parts[i],
                keyword: input,
                timestamp: Date.now(),
              });
            }
          } else {
            // 응답이 없는 경우 로딩 메시지를 오류 메시지로 교체
            messages.value[currentLoadingIndex] = {
              id: loadingMessageId,
              role: 'bot',
              content: '(응답 없음)',
              keyword: input,
              timestamp: Date.now(),
            };
          }
        }
      } catch (error) {
        // 에러 시 처리 (취소된 요청은 제외)
        if (abortController.signal.aborted) return;

        const currentLoadingIndex = messages.value.findIndex(
          (msg) => msg.id === loadingMessageId
        );
        if (currentLoadingIndex !== -1) {
          messages.value[currentLoadingIndex] = {
            id: loadingMessageId,
            role: 'bot',
            content: `⚠️ ${
              (error as Error).message ||
              '오류가 발생했어요. 다시 시도해주세요!'
            }`,
            keyword: input,
            timestamp: Date.now(),
          };
        }
        console.error(error);
      } finally {
        // 정리 작업
        pendingMessages.delete(loadingMessageId);
        activeRequests.delete(loadingMessageId);
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
        // 참조 메시지 기능이 필요하다면 여기서 refMsg.value도 설정
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
      // 진행 중인 모든 요청 취소 및 정리
      activeRequests.forEach((abortController: AbortController) => {
        abortController.abort();
      });
      activeRequests.clear();
      pendingMessages.clear();

      messages.value = [
        {
          id: 'intro-message',
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
      showRefInput,
      pendingMessages,
      // computed
      displayMessages,
      hasMessages,
      isLoading,
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
