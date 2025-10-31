import { defineStore } from 'pinia';
import { ref, computed, reactive } from 'vue';
import { generateText } from '../service/_chat.service';
import { MODEL_OPTIONS } from '../constants/_models';
import type { ChatService } from '../types/_chat';
import { INTRO_MARKDOWN } from '../constants/_texts';
import { PART_SEPARATOR } from '../constants/_regex';
import { EXPECTED_RESPONSE_TIME } from '../constants/_timings';
import { getSelectedService, setSelectedService, addBatchHistory } from '../utils/_localStorage';
import type { Message, SelectedMessagePackage, BatchRequest } from '../types/_chat';

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

    // 메시지 선택 상태 관리
    const selectedMessageIds = ref<Set<string>>(new Set());
    const isSelectionMode = ref(false);

    // 배치 모드 상태 관리
    const isBatchMode = ref(false);
    const batchRequests = ref<BatchRequest[]>([]);
    const batchStatuses = reactive<Record<string, 'pending' | 'loading' | 'success' | 'error'>>({});

    const displayMessages = computed(() => messages.value);
    const hasMessages = computed(() => messages.value.length > 1);
    const isLoading = computed(() => pendingMessages.size > 0);
    const selectedMessagesCount = computed(() => {
      const ids = selectedMessageIds.value;
      if (ids instanceof Set) return ids.size;
      if (Array.isArray(ids)) return ids.length;
      return 0;
    });
    const userMessages = computed(() =>
      messages.value.filter((msg) => msg.role === 'user' && Boolean(msg.id))
    );
    const selectableMessagesCount = computed(() => userMessages.value.length);
    const hasSelectedMessages = computed(() => selectedMessagesCount.value > 0);

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
        loadingProgress: 0,
      });

      keyword.value = '';
      showRefInput.value = false;
      pendingMessages.add(loadingMessageId);

      const abortController = new AbortController();
      activeRequests.set(loadingMessageId, abortController);

      const startTime = Date.now();
      const expectedTime = (EXPECTED_RESPONSE_TIME[service.value as keyof typeof EXPECTED_RESPONSE_TIME] || 30) * 1000;

      const progressInterval = setInterval(() => {
        const loadingMsg = messages.value.find((msg) => msg.id === loadingMessageId);
        if (loadingMsg) {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(95, (elapsed / expectedTime) * 100);
          loadingMsg.loadingProgress = Math.round(progress);
        }
      }, 100);

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
      } finally {
        clearInterval(progressInterval);
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

    const cancelCurrentRequest = () => {
      // 가장 최근 요청만 취소
      const lastRequestId = Array.from(activeRequests.keys()).pop();
      if (lastRequestId) {
        const controller = activeRequests.get(lastRequestId);
        controller?.abort();
        activeRequests.delete(lastRequestId);
        pendingMessages.delete(lastRequestId);

        // 로딩 메시지 제거
        const loadingIndex = messages.value.findIndex(msg => msg.id === lastRequestId);
        if (loadingIndex !== -1) {
          messages.value.splice(loadingIndex, 1);
        }

        isLoading.value = false;
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

    // 메시지 선택 관련 액션들
    const toggleSelectionMode = () => {
      isSelectionMode.value = !isSelectionMode.value;
      if (!isSelectionMode.value) {
        clearSelection();
      }
    };

    const toggleMessageSelection = (messageId: string) => {
      const targetMessage = userMessages.value.find(
        (msg) => msg.id === messageId
      );
      if (!targetMessage) return;

      // 배열인 경우와 Set인 경우 모두 처리
      const currentIds = selectedMessageIds.value;
      let newSet: Set<string>;

      if (currentIds instanceof Set) {
        newSet = new Set(currentIds);
      } else if (Array.isArray(currentIds)) {
        newSet = new Set(currentIds);
      } else {
        newSet = new Set();
      }

      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }

      // 반응성을 위해 새 Set 객체 할당
      selectedMessageIds.value = newSet;
    };

    const selectAllMessages = () => {
      const allMessageIds = userMessages.value
        .map((msg) => msg.id)
        .filter((id): id is string => Boolean(id));
      selectedMessageIds.value = new Set(allMessageIds);
    };

    const clearSelection = () => {
      // 반응성을 위해 새로운 빈 Set 할당
      selectedMessageIds.value = new Set();
    };

    const collectBotResponses = (userMessageId: string): Message[] => {
      const userIndex = messages.value.findIndex((msg) => msg.id === userMessageId);
      if (userIndex === -1) {
        return [];
      }

      const responseList: Message[] = [];
      const userMessage = messages.value[userIndex];

      for (let i = userIndex + 1; i < messages.value.length; i += 1) {
        const candidate = messages.value[i];

        if (candidate.role === 'user') {
          break;
        }

        if (
          candidate.role === 'bot' &&
          candidate.content !== 'loading' &&
          candidate.keyword === userMessage.keyword
        ) {
          responseList.push(candidate);
        }
      }

      return responseList;
    };

    const exportSelectedMessages = (): SelectedMessagePackage[] => {
      const ids = selectedMessageIds.value;
      const selectedMessages = userMessages.value.filter((msg) => {
        if (!msg.id) return false;
        if (ids instanceof Set) return ids.has(msg.id);
        if (Array.isArray(ids)) return ids.includes(msg.id);
        return false;
      });

      return selectedMessages.map((userMessage) => ({
        userMessage,
        responses: collectBotResponses(userMessage.id as string),
      }));
    };

    // 배치 모드 관련 액션들
    const addBatchRequest = () => {
      if (batchRequests.value.length >= 20) return;

      const newRequest: BatchRequest = {
        id: `batch-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
        keyword: '',
        refMsg: '',
      };

      batchRequests.value.push(newRequest);
      batchStatuses[newRequest.id] = 'pending';
    };

    const removeBatchRequest = (index: number) => {
      const removed = batchRequests.value.splice(index, 1);
      if (removed[0]) {
        delete batchStatuses[removed[0].id];
      }
    };

    const updateBatchRequest = (index: number, updates: Partial<BatchRequest>) => {
      if (batchRequests.value[index]) {
        batchRequests.value[index] = {
          ...batchRequests.value[index],
          ...updates,
        };
      }
    };

    const clearBatchRequests = () => {
      batchRequests.value = [];
      Object.keys(batchStatuses).forEach(key => delete batchStatuses[key]);
    };

    const handleBatchGenerate = () => {
      const validRequests = batchRequests.value.filter(req => req.keyword.trim());

      if (validRequests.length === 0) return;

      // 배치 히스토리에 저장
      const requestsForHistory = validRequests.map(req => ({
        keyword: req.keyword,
        refMsg: req.refMsg
      }));
      addBatchHistory(service.value, requestsForHistory);

      // 각 요청을 그냥 handleGenerate로 실행
      validRequests.forEach((req) => {
        keyword.value = req.keyword;
        refMsg.value = req.refMsg || '';
        handleGenerate();
      });

      // 전송 후 배치 요청 클리어
      clearBatchRequests();
    };

    return {
      // state
      messages,
      keyword,
      refMsg,
      service,
      showRefInput,
      pendingMessages,
      selectedMessageIds,
      isSelectionMode,
      isBatchMode,
      batchRequests,
      batchStatuses,

      // computed
      displayMessages,
      hasMessages,
      isLoading,
      selectedUserMessage,
      showActionModal,
      selectedMessagesCount,
      selectableMessagesCount,
      hasSelectedMessages,
      userMessages,

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
      cancelCurrentRequest,
      toggleSelectionMode,
      toggleMessageSelection,
      selectAllMessages,
      clearSelection,
      exportSelectedMessages,
      addBatchRequest,
      removeBatchRequest,
      updateBatchRequest,
      clearBatchRequests,
      handleBatchGenerate,
    };
  },
  {
    persist: {
      key: 'chat-store',
      storage: localStorage,
      afterRestore: (context) => {
        // selectedMessageIds가 배열이면 Set으로 변환
        if (Array.isArray(context.store.selectedMessageIds)) {
          context.store.selectedMessageIds = new Set(context.store.selectedMessageIds);
        }

        // null이거나 undefined면 빈 Set으로
        if (!context.store.selectedMessageIds) {
          context.store.selectedMessageIds = new Set();
        }
      },
      serializer: {
        serialize: (state) => {
          // Set을 배열로 변환하여 저장
          const serialized = {
            ...state,
            selectedMessageIds: state.selectedMessageIds instanceof Set
              ? Array.from(state.selectedMessageIds)
              : state.selectedMessageIds
          };
          return JSON.stringify(serialized);
        },
        deserialize: (value) => {
          const parsed = JSON.parse(value);

          // 배열을 다시 Set으로 변환
          if (Array.isArray(parsed.selectedMessageIds)) {
            parsed.selectedMessageIds = new Set(parsed.selectedMessageIds);
          } else if (!parsed.selectedMessageIds) {
            parsed.selectedMessageIds = new Set();
          }

          return parsed;
        }
      }
    },
  }
);
