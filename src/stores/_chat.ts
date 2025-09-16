import { defineStore } from 'pinia';
import { ref, computed, reactive } from 'vue';
import { generateText } from '../service/_chat.service';
import { MODEL_OPTIONS } from '../constants/_models';
import type { ChatService } from '../types/_chat';
import { INTRO_MARKDOWN } from '../constants/_texts';
import { PART_SEPARATOR } from '../constants/_regex';
import { getSelectedService, setSelectedService } from '../utils/_localStorage';
import type { Message } from '../types/_chat';

export const useChatStore = defineStore(
  'chat',
  () => {
    const defaultService = (MODEL_OPTIONS?.[0]?.value ??
      'openai') as ChatService;
    const storedService =
      (getSelectedService() as ChatService) || defaultService;

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
    const service = ref<ChatService>(storedService);
    const pendingMessages = reactive(new Set<string>());
    const showRefInput = ref(true);
    const activeRequests = reactive(new Map<string, AbortController>());

    const showActionModal = ref(false);
    const selectedUserMessage = ref<any>(null);

    const displayMessages = computed(() => messages.value);
    const hasMessages = computed(() => messages.value.length > 1);
    const isLoading = computed(() => pendingMessages.size > 0);

    const openActionModal = (userMsg: any) => {
      selectedUserMessage.value = userMsg;
      showActionModal.value = true;
    };

    const handleGenerate = async () => {
      if (!keyword.value.trim()) return;

      const input = keyword.value;
      const refSnapshot = refMsg.value;
      const messageId = `msg-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 11)}`;

      messages.value.push({
        id: `user-${messageId}`,
        role: 'user',
        content: input,
        keyword: input,
        ref: refSnapshot,
        service: service.value,
        timestamp: Date.now(),
      });

      const loadingMessageId = `bot-${messageId}`;
      messages.value.push({
        id: loadingMessageId,
        role: 'bot',
        content: 'loading',
        keyword: input,
        ref: refSnapshot,
        service: service.value,
        timestamp: Date.now(),
      });

      keyword.value = '';
      showRefInput.value = false;
      pendingMessages.add(loadingMessageId);

      const abortController = new AbortController();
      activeRequests.set(loadingMessageId, abortController);

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

        const currentLoadingIndex = messages.value.findIndex(
          (msg) => msg.id === loadingMessageId
        );
        if (currentLoadingIndex !== -1) {
          if (parts.length > 0) {
            messages.value[currentLoadingIndex] = {
              id: `bot-${Date.now()}-${Math.random()
                .toString(36)
                .slice(2, 11)}`,
              role: 'bot',
              content: parts[0],
              keyword: input,
              ref: refSnapshot,
              service: service.value,
              timestamp: Date.now(),
            };

            for (let i = 1; i < parts.length; i++) {
              messages.value.splice(currentLoadingIndex + i, 0, {
                id: `bot-${Date.now()}-${Math.random()
                  .toString(36)
                  .slice(2, 11)}`,
                role: 'bot',
                content: parts[i],
                keyword: input,
                ref: refSnapshot,
                service: service.value,
                timestamp: Date.now(),
              });
            }
          } else {
            messages.value[currentLoadingIndex] = {
              id: loadingMessageId,
              role: 'bot',
              content: '(응답 없음)',
              keyword: input,
              ref: refSnapshot,
              service: service.value,
              timestamp: Date.now(),
            };
          }
        }
      } catch (error) {
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
            ref: refSnapshot,
            service: service.value,
            timestamp: Date.now(),
          };
        }
        console.error(error);
      } finally {
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
        if (msg.ref) refMsg.value = msg.ref;
        if (msg.service) service.value = msg.service as ChatService;
        handleGenerate();
      }
    };

    const updateService = (newService: ChatService) => {
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
          ref: msg.ref,
          service: msg.service,
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
      selectedUserMessage,
      showActionModal,

      // actions
      handleGenerate,
      handleKeyPress,
      handleRegenerate,
      updateService,
      addQuickMessage,
      deleteMessage,
      clearChat,
      exportChat,
      openActionModal,
    };
  },
  {
    persist: {
      key: 'chat-store',
      storage: localStorage,
    },
  }
);
