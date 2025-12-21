import { defineStore } from 'pinia';
import { ref, computed, reactive } from 'vue';
import { generateText, generateImage } from '@/service/_chat.service';
import { MODEL_OPTIONS, INTRO_MARKDOWN, PART_SEPARATOR, EXPECTED_RESPONSE_TIME } from '@/constants';
import { getSelectedService, setSelectedService, addBatchHistory } from '@/utils';
import type { ChatService, Message, SelectedMessagePackage, BatchRequest } from '@/types';

export const useChatStore = defineStore(
  'chat',
  () => {
    const defaultService = (MODEL_OPTIONS?.[0]?.value ??
      'openai') as ChatService;
    const storedValue = getSelectedService() as ChatService;
    // 저장된 값이 현재 MODEL_OPTIONS에 없으면 기본값 사용
    const isValidService = MODEL_OPTIONS.some(opt => opt.value === storedValue);
    const storedService = isValidService ? storedValue : defaultService;

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
    const selectedUserMessage = ref<Message | null>(null);

    // 메시지 선택 상태 관리
    const selectedMessageIds = ref<Set<string>>(new Set());
    const isSelectionMode = ref(false);

    // 배치 모드 상태 관리
    const isBatchMode = ref(false);
    const batchRequests = ref<BatchRequest[]>([]);
    const batchStatuses = reactive<Record<string, 'pending' | 'loading' | 'success' | 'error'>>({});

    // 이미지 생성 옵션
    const includeImage = ref(false);
    const onlyImage = ref(false);

    const displayMessages = computed(() => messages.value);
    const hasMessages = computed(() => messages.value.length > 1);
    const isLoading = computed(() => pendingMessages.size > 0);
    const selectedMessagesCount = computed(() => selectedMessageIds.value.size);
    const userMessages = computed(() =>
      messages.value.filter((msg) => msg.role === 'user' && Boolean(msg.id))
    );
    const selectableMessagesCount = computed(() => userMessages.value.length);
    const hasSelectedMessages = computed(() => selectedMessagesCount.value > 0);

    const openActionModal = (userMsg: Message) => {
      selectedUserMessage.value = userMsg;
      showActionModal.value = true;
    };

    const handleGenerate = async () => {
      if (!keyword.value.trim()) return;

      const input = keyword.value;
      const refSnapshot = refMsg.value;
      const baseId = `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
      const shouldGenerateImage = includeImage.value || onlyImage.value;
      const shouldGenerateText = !onlyImage.value;

      // 1. 사용자 메시지 추가
      messages.value.push({
        id: `user-${baseId}`,
        role: 'user',
        content: input,
        keyword: input,
        ref: refSnapshot,
        service: service.value,
        timestamp: Date.now(),
      });

      const textLoadingId = `text-${baseId}`;
      const imageLoadingId = `image-${baseId}`;

      // 2. 텍스트 로딩 메시지 추가 (onlyImage가 아닐 때만)
      if (shouldGenerateText) {
        messages.value.push({
          id: textLoadingId,
          role: 'bot',
          content: 'loading',
          keyword: input,
          ref: refSnapshot,
          service: service.value,
          timestamp: Date.now(),
          loadingProgress: 0,
        });
        pendingMessages.add(textLoadingId);
      }

      // 3. 이미지 로딩 메시지 추가
      if (shouldGenerateImage) {
        messages.value.push({
          id: imageLoadingId,
          role: 'bot',
          content: '',
          keyword: input,
          timestamp: Date.now(),
          imageLoading: true,
        });
        pendingMessages.add(imageLoadingId);
      }

      keyword.value = '';
      showRefInput.value = false;

      const abortController = new AbortController();
      if (shouldGenerateText) {
        activeRequests.set(textLoadingId, abortController);
      }

      // 텍스트 진행률 업데이트
      let progressInterval: ReturnType<typeof setInterval> | null = null;
      if (shouldGenerateText) {
        const startTime = Date.now();
        const expectedTime = (EXPECTED_RESPONSE_TIME[service.value] || 30) * 1000;
        progressInterval = setInterval(() => {
          const loadingMsg = messages.value.find((msg) => msg.id === textLoadingId);
          if (loadingMsg && loadingMsg.content === 'loading') {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(95, (elapsed / expectedTime) * 100);
            loadingMsg.loadingProgress = Math.round(progress);
          }
        }, 100);
      }

      // 4. 텍스트 요청 (onlyImage가 아닐 때만)
      if (shouldGenerateText) {
        generateText({
          service: service.value || defaultService,
          keyword: input,
          ref: refSnapshot,
        })
          .then((res) => {
            if (progressInterval) clearInterval(progressInterval);
            const botResponse = res?.content || '(응답 없음)';
            const manuscriptId = res?._id;
            const parts = botResponse.split(PART_SEPARATOR).map((p) => p.trim()).filter(Boolean);

            const textLoadingIndex = messages.value.findIndex((msg) => msg.id === textLoadingId);
            if (textLoadingIndex !== -1) {
              if (parts.length > 0) {
                messages.value[textLoadingIndex] = {
                  id: textLoadingId,
                  role: 'bot',
                  content: parts[0],
                  keyword: input,
                  ref: refSnapshot,
                  service: service.value,
                  timestamp: Date.now(),
                  manuscriptId,
                };

                for (let i = 1; i < parts.length; i++) {
                  messages.value.splice(textLoadingIndex + i, 0, {
                    id: `text-part-${baseId}-${i}`,
                    role: 'bot',
                    content: parts[i],
                    keyword: input,
                    ref: refSnapshot,
                    service: service.value,
                    timestamp: Date.now(),
                    manuscriptId,
                  });
                }
              } else {
                messages.value[textLoadingIndex] = {
                  id: textLoadingId,
                  role: 'bot',
                  content: '(응답 없음)',
                  keyword: input,
                  ref: refSnapshot,
                  service: service.value,
                  timestamp: Date.now(),
                  manuscriptId,
                };
              }
            }
          })
          .catch((error) => {
            if (progressInterval) clearInterval(progressInterval);
            if (abortController.signal.aborted) return;

            const textLoadingIndex = messages.value.findIndex((msg) => msg.id === textLoadingId);
            if (textLoadingIndex !== -1) {
              messages.value[textLoadingIndex] = {
                id: textLoadingId,
                role: 'bot',
                content: `⚠️ ${(error as Error).message || '오류가 발생했어요. 다시 시도해주세요!'}`,
                keyword: input,
                ref: refSnapshot,
                service: service.value,
                timestamp: Date.now(),
              };
            }
          })
          .finally(() => {
            pendingMessages.delete(textLoadingId);
            activeRequests.delete(textLoadingId);
            refMsg.value = '';
          });
      } else {
        // onlyImage 모드일 때 refMsg 클리어
        refMsg.value = '';
      }

      // 5. 이미지 요청
      if (shouldGenerateImage) {
        generateImage({ keyword: input })
          .then((imageRes) => {
            const imageLoadingIndex = messages.value.findIndex((msg) => msg.id === imageLoadingId);
            if (imageLoadingIndex !== -1) {
              if (imageRes.images && imageRes.images.length > 0) {
                messages.value[imageLoadingIndex] = {
                  id: imageLoadingId,
                  role: 'bot',
                  content: '',
                  keyword: input,
                  timestamp: Date.now(),
                  images: imageRes.images,
                  imageLoading: false,
                };
              } else {
                messages.value[imageLoadingIndex] = {
                  id: imageLoadingId,
                  role: 'bot',
                  content: '',
                  keyword: input,
                  timestamp: Date.now(),
                  imageError: '이미지 생성 실패',
                  imageLoading: false,
                };
              }
            }
          })
          .catch((err) => {
            const imageLoadingIndex = messages.value.findIndex((msg) => msg.id === imageLoadingId);
            if (imageLoadingIndex !== -1) {
              messages.value[imageLoadingIndex] = {
                id: imageLoadingId,
                role: 'bot',
                content: '',
                keyword: input,
                timestamp: Date.now(),
                imageError: (err as Error).message || '이미지 생성 실패',
                imageLoading: false,
              };
            }
          })
          .finally(() => {
            pendingMessages.delete(imageLoadingId);
          });
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
        // pendingMessages.delete()가 호출되면 isLoading computed가 자동으로 false가 됨
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

      // 반응성을 위해 새 Set 객체 할당
      const newSet = new Set(selectedMessageIds.value);

      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }

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
      const selectedMessages = userMessages.value.filter(
        (msg) => msg.id && selectedMessageIds.value.has(msg.id)
      );

      return selectedMessages.map((userMessage) => ({
        userMessage,
        responses: collectBotResponses(userMessage.id!),
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
      includeImage,
      onlyImage,

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
