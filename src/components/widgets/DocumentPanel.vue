<script setup lang="ts">
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useChatStore } from '@/stores';
import { downloadText, copyText, extractKeywordDisplay } from '@/utils';
import type { Message } from '@/types';
import {
  CheckmarkOutline as CheckmarkIcon,
  CheckmarkCircleOutline as CheckmarkCircleIcon,
  Download as DownloadIcon,
  Close as CloseIcon,
} from '@vicons/ionicons5';

const chatStore = useChatStore();
const { messages, isSelectionMode, selectedMessageIds } =
  storeToRefs(chatStore);
const {
  cancelCurrentRequest,
  deleteMessage,
  toggleSelectionMode,
  toggleMessageSelection,
  selectAllMessages,
  exportSelectedMessages,
} = chatStore;

const isOpen = ref(true);
const selectedDocument = ref<Message | null>(null);
const showActionOverlay = ref(false);

const generatingMessages = computed(() => {
  return messages.value.filter(
    (msg) =>
      msg.role === 'bot' &&
      (msg.content === 'loading' || msg.loadingProgress !== undefined)
  );
});

const completedMessages = computed(() => {
  const filtered = messages.value.filter((msg) => {
    if (msg.role !== 'user') return false;
    if (!msg.keyword) return false;

    const userIndex = messages.value.findIndex((m) => m.id === msg.id);
    if (userIndex === -1) return false;

    for (let i = userIndex + 1; i < messages.value.length; i++) {
      const nextMsg = messages.value[i];
      if (nextMsg.role === 'user') break;
      if (
        nextMsg.role === 'bot' &&
        nextMsg.content !== 'loading' &&
        !nextMsg.loadingProgress
      ) {
        return true;
      }
    }
    return false;
  });

  // 최신순으로 정렬 (최신 것이 위로)
  return filtered.sort((a, b) => {
    const timeA = a.timestamp || 0;
    const timeB = b.timestamp || 0;
    return timeB - timeA;
  });
});

const togglePanel = () => {
  isOpen.value = !isOpen.value;
};

const handleDocumentClick = (msg: Message) => {
  if (isSelectionMode.value) {
    toggleMessageSelection(msg.id || '');
    return;
  }
  selectedDocument.value = msg;
  showActionOverlay.value = true;
};

const isMessageSelected = (messageId?: string) => {
  if (!messageId) return false;
  return selectedMessageIds.value.has(messageId);
};

const handleDownloadSelected = async () => {
  const packages = exportSelectedMessages();
  if (packages.length === 0) return;

  const files = packages.map((pkg) => {
    const keyword = pkg.userMessage.keyword || '원고';
    const sanitizedKeyword = keyword
      .slice(0, 30)
      .replace(/[/\\?%*:|"<>]/g, '_');
    const resultBody = pkg.responses.map((r) => r.content).join('\n\n---\n\n');
    const resultLength = resultBody.replace(/\s+/g, '').length;
    return {
      fileName: `${sanitizedKeyword}-${resultLength}.txt`,
      content: resultBody,
    };
  });

  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();
  files.forEach(({ fileName, content }) => {
    zip.file(fileName, content);
  });

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `selected-docs-${Date.now()}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  toggleSelectionMode();
};

const closeOverlay = () => {
  showActionOverlay.value = false;
  selectedDocument.value = null;
};

const getBotResponses = (userMsg: Message) => {
  const userIndex = messages.value.findIndex((m) => m.id === userMsg.id);
  if (userIndex === -1) return [];

  const botResponses: Message[] = [];
  for (let i = userIndex + 1; i < messages.value.length; i++) {
    const msg = messages.value[i];
    if (msg.role === 'user') break;
    if (
      msg.role === 'bot' &&
      msg.content !== 'loading' &&
      !msg.loadingProgress
    ) {
      botResponses.push(msg);
    }
  }
  return botResponses;
};

const handleDownload = () => {
  if (!selectedDocument.value) return;

  const userMsg = selectedDocument.value;
  const botResponses = getBotResponses(userMsg);
  if (botResponses.length === 0) return;

  const keyword = userMsg.keyword || '원고';
  const sanitizedKeyword = keyword.slice(0, 30).replace(/[/\\?%*:|"<>]/g, '_');
  const content = botResponses.map((r) => r.content).join('\n\n---\n\n');

  const resultLength = content.replace(/\s+/g, '').length;
  const fileName = `${sanitizedKeyword}-${resultLength}`;

  downloadText({ content, fileName });
  closeOverlay();
};

const handleCopy = async () => {
  if (!selectedDocument.value) return;

  const botResponses = getBotResponses(selectedDocument.value);
  if (botResponses.length === 0) return;

  const content = botResponses.map((r) => r.content).join('\n\n---\n\n');
  const success = await copyText(content);
  closeOverlay();
};

const handleCopyRef = async () => {
  if (!selectedDocument.value?.ref) return;
  await copyText(selectedDocument.value.ref);
  closeOverlay();
};

const handleCopyKeyword = async () => {
  if (!selectedDocument.value?.keyword) return;
  await copyText(selectedDocument.value.keyword);
  closeOverlay();
};

const handleDelete = () => {
  if (!selectedDocument.value) return;

  const userIndex = messages.value.findIndex(
    (m) => m.id === selectedDocument.value?.id
  );
  if (userIndex === -1) return;

  const indicesToDelete: number[] = [userIndex];
  for (let i = userIndex + 1; i < messages.value.length; i++) {
    const msg = messages.value[i];
    if (msg.role === 'user') break;
    if (msg.role === 'bot') {
      indicesToDelete.push(i);
    }
  }

  indicesToDelete.reverse().forEach((idx) => {
    deleteMessage(idx);
  });

  closeOverlay();
};

const formatTime = (timestamp: number | undefined) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getMessageTitle = (msg: Message) => {
  if (msg.title) return msg.title;
  if (msg.keyword) return extractKeywordDisplay(msg.keyword);
  if (msg.content && msg.content !== 'loading') {
    return msg.content.slice(0, 30) + '...';
  }
  return '제목 없음';
};
</script>

<template>
  <div
    class="fixed top-1/2 right-0 h-[calc(100vh-var(--header-h,84px)-var(--footer-h,140px))] max-h-[calc(100vh-var(--header-h,84px)-140px)] bg-white/95 backdrop-blur-[20px] border-l border-black/8 rounded-l-2xl shadow-[-2px_0_10px_rgba(0,0,0,0.05)] flex flex-col transition-all duration-300 overflow-hidden z-50 -translate-y-1/2"
    :class="isOpen ? 'w-[280px] min-w-[280px]' : 'w-14 min-w-14'"
  >
    <!-- Header -->
    <div
      class="flex items-center gap-3 p-4 border-b border-black/6 bg-white/50 sticky top-0 z-10"
      :class="{
        'justify-center border-b-0': !isOpen,
        'justify-end': isOpen,
      }"
    >
      <!-- Toggle button when closed -->
      <button
        v-if="!isOpen"
        class="w-9 h-9 rounded-[10px] border-none bg-indigo-500/10 text-indigo-500 text-lg cursor-pointer flex items-center justify-center transition-all duration-200 shrink-0 hover:bg-indigo-500/20 hover:scale-110 hover:shadow-[0_2px_8px_rgba(99,102,241,0.2)] active:scale-95"
        @click="togglePanel"
        aria-label="패널 펼치기"
      >
        <span class="text-base">◀</span>
      </button>

      <template v-if="isOpen">
        <h2
          v-if="!isSelectionMode"
          class="text-base font-bold text-slate-800 m-0 whitespace-nowrap flex-1 text-left mr-auto"
        >
          원고 목록 ({{ generatingMessages.length + completedMessages.length }})
        </h2>
        <h2 v-else class="text-base font-bold text-slate-800 m-0 whitespace-nowrap flex-1 text-left mr-auto">
          {{ selectedMessageIds.size }}개 선택됨
        </h2>

        <div class="flex items-center gap-2">
          <!-- 선택 모드가 아닐 때 -->
          <button
            v-if="!isSelectionMode && completedMessages.length > 0"
            class="w-8 h-8 rounded-lg border-none bg-indigo-500/10 text-indigo-500 text-base cursor-pointer flex items-center justify-center transition-all duration-200 shrink-0 hover:bg-indigo-500/20 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            @click="toggleSelectionMode"
            title="원고 선택"
          >
            <component :is="CheckmarkCircleIcon" class="w-4 h-4" />
          </button>

          <!-- 선택 모드일 때 -->
          <template v-if="isSelectionMode">
            <button
              class="w-8 h-8 rounded-lg border-none bg-indigo-500/10 text-indigo-500 text-base cursor-pointer flex items-center justify-center transition-all duration-200 shrink-0 hover:bg-indigo-500/20 hover:scale-105"
              @click="selectAllMessages"
              title="모두 선택"
            >
              <component :is="CheckmarkIcon" class="w-4 h-4" />
            </button>
            <button
              class="w-8 h-8 rounded-lg border-none bg-indigo-500/10 text-indigo-500 text-base cursor-pointer flex items-center justify-center transition-all duration-200 shrink-0 hover:bg-indigo-500/20 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              @click="handleDownloadSelected"
              :disabled="selectedMessageIds.size === 0"
              title="다운로드"
            >
              <component :is="DownloadIcon" class="w-4 h-4" />
            </button>
            <button
              class="w-8 h-8 rounded-lg border-none bg-indigo-500/10 text-indigo-500 text-base cursor-pointer flex items-center justify-center transition-all duration-200 shrink-0 hover:bg-indigo-500/20 hover:scale-105"
              @click="toggleSelectionMode"
              title="취소"
            >
              <component :is="CloseIcon" class="w-4 h-4" />
            </button>
          </template>

          <!-- 패널 닫기 -->
          <button
            v-if="!isSelectionMode"
            class="w-9 h-9 rounded-[10px] border-none bg-indigo-500/10 text-indigo-500 text-lg cursor-pointer flex items-center justify-center transition-all duration-200 shrink-0 hover:bg-indigo-500/20 hover:scale-110 hover:shadow-[0_2px_8px_rgba(99,102,241,0.2)] active:scale-95"
            @click="togglePanel"
            aria-label="패널 접기"
          >
            <component :is="CloseIcon" class="w-4 h-4" />
          </button>
        </div>
      </template>
    </div>

    <!-- Content -->
    <div
      v-if="isOpen"
      class="flex-1 overflow-y-auto p-4 flex flex-col gap-6 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-black/10 [&::-webkit-scrollbar-thumb]:rounded [&::-webkit-scrollbar-thumb:hover]:bg-black/20"
    >
      <!-- 생성 중인 원고 -->
      <section v-if="generatingMessages.length > 0" class="flex flex-col gap-3">
        <h3 class="text-[13px] font-semibold text-slate-500 uppercase tracking-wide m-0">
          생성 중 ({{ generatingMessages.length }})
        </h3>
        <div class="flex flex-col gap-2 w-full max-w-full">
          <div
            v-for="msg in generatingMessages"
            :key="msg.id"
            class="p-2.5 rounded-lg border border-emerald-500/30 bg-emerald-500/2 flex flex-col gap-1.5 transition-all duration-200 w-full max-w-full box-border"
          >
            <div class="flex items-center justify-between gap-2">
              <div
                class="text-[13px] font-semibold text-slate-800 leading-snug overflow-hidden text-ellipsis whitespace-nowrap flex-1 min-w-0 max-w-full"
              >
                {{ getMessageTitle(msg) }}
              </div>
              <button
                class="w-5 h-5 rounded border-none bg-red-500/10 text-red-500 text-xs cursor-pointer flex items-center justify-center transition-all duration-200 shrink-0 hover:bg-red-500/20 hover:scale-110"
                @click="cancelCurrentRequest"
                aria-label="생성 취소"
              >
                <component :is="CloseIcon" class="w-3 h-3" />
              </button>
            </div>
            <div class="flex items-center gap-2">
              <div class="flex-1 h-1.5 bg-black/5 rounded-full overflow-hidden">
                <div
                  class="h-full bg-linear-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-300"
                  :style="{ width: `${msg.loadingProgress || 0}%` }"
                ></div>
              </div>
              <span class="text-[11px] font-semibold text-emerald-500 min-w-[35px] text-right">
                {{ msg.loadingProgress || 0 }}%
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- 완료된 원고 -->
      <section v-if="completedMessages.length > 0" class="flex flex-col gap-3">
        <h3 class="text-[13px] font-semibold text-slate-500 uppercase tracking-wide m-0">
          완료됨 ({{ completedMessages.length }})
        </h3>
        <div class="flex flex-col gap-2 w-full max-w-full">
          <div
            v-for="msg in completedMessages"
            :key="msg.id"
            class="p-3 rounded-lg border border-black/6 bg-white flex flex-col gap-1.5 transition-all duration-200 w-full max-w-full box-border cursor-pointer hover:border-indigo-500 hover:shadow-[0_2px_8px_rgba(99,102,241,0.15)] hover:-translate-y-px hover:bg-indigo-500/2"
            :class="{
              'flex-row items-center gap-2.5': isSelectionMode,
              'border-indigo-500! bg-indigo-500/10!': isMessageSelected(msg.id),
            }"
            @click="handleDocumentClick(msg)"
          >
            <!-- Checkbox for selection mode -->
            <div
              v-if="isSelectionMode"
              class="w-5 h-5 border-2 border-gray-300 rounded flex items-center justify-center shrink-0 transition-all duration-200"
              :class="{
                'bg-indigo-500 border-indigo-500': isMessageSelected(msg.id),
              }"
            >
              <component
                v-if="isMessageSelected(msg.id)"
                :is="CheckmarkIcon"
                class="w-3.5 h-3.5 text-white font-bold"
              />
            </div>
            <div
              class="text-[13px] font-semibold text-slate-800 leading-snug overflow-hidden text-ellipsis whitespace-nowrap flex-1 min-w-0 max-w-full"
            >
              {{ getMessageTitle(msg) }}
            </div>
          </div>
        </div>
      </section>

      <!-- 빈 상태 -->
      <div
        v-if="generatingMessages.length === 0 && completedMessages.length === 0"
        class="flex items-center justify-center py-10 px-5 text-slate-400 text-sm text-center"
      >
        <p>아직 생성된 원고가 없습니다.</p>
      </div>
    </div>

    <!-- 작업 선택 오버레이 -->
    <Teleport to="body">
      <div
        v-if="showActionOverlay"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] animate-[fadeIn_0.2s_ease]"
        @click="closeOverlay"
      >
        <div
          class="w-[90%] max-w-[400px] bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] overflow-hidden animate-[slideUp_0.3s_cubic-bezier(0.4,0,0.2,1)]"
          @click.stop
        >
          <!-- Modal Header -->
          <div
            class="flex items-center justify-between px-6 py-5 border-b border-black/6 bg-linear-to-br from-slate-50 to-slate-200"
          >
            <h3 class="text-lg font-bold text-slate-800 m-0">작업 선택</h3>
            <button
              class="w-8 h-8 rounded-lg border-none bg-black/5 text-slate-500 text-lg cursor-pointer flex items-center justify-center transition-all duration-200 hover:bg-black/10 hover:scale-105"
              @click="closeOverlay"
              aria-label="닫기"
            >
              <component :is="CloseIcon" class="w-4 h-4" />
            </button>
          </div>

          <!-- Preview -->
          <div class="px-6 py-5 border-b border-black/6">
            <div class="text-[15px] font-semibold text-slate-800 mb-2 leading-snug overflow-hidden text-ellipsis line-clamp-2">
              {{ getMessageTitle(selectedDocument!) }}
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs px-2 py-1 rounded-md bg-indigo-500/10 text-indigo-600 font-medium">
                {{ selectedDocument?.service }}
              </span>
              <span class="text-xs text-slate-500">
                {{ formatTime(selectedDocument?.timestamp) }}
              </span>
            </div>
          </div>

          <!-- Action List -->
          <div class="p-3 flex flex-col gap-2">
            <button
              class="flex items-center gap-3 px-4 py-3.5 rounded-xl border-none bg-black/2 cursor-pointer transition-all duration-200 text-left hover:bg-indigo-500/10 hover:translate-x-1"
              @click="handleCopy"
            >
              <span class="text-xl shrink-0">📋</span>
              <span class="text-[15px] font-semibold text-slate-800 flex-1">내용 복사</span>
            </button>

            <button
              class="flex items-center gap-3 px-4 py-3.5 rounded-xl border-none bg-black/2 cursor-pointer transition-all duration-200 text-left hover:bg-indigo-500/10 hover:translate-x-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-black/2 disabled:hover:translate-x-0"
              @click="handleCopyKeyword"
              :disabled="!selectedDocument?.keyword"
            >
              <span class="text-xl shrink-0">🏷️</span>
              <span class="text-[15px] font-semibold text-slate-800 flex-1">키워드 복사</span>
            </button>

            <button
              class="flex items-center gap-3 px-4 py-3.5 rounded-xl border-none bg-black/2 cursor-pointer transition-all duration-200 text-left hover:bg-indigo-500/10 hover:translate-x-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-black/2 disabled:hover:translate-x-0"
              @click="handleCopyRef"
              :disabled="!selectedDocument?.ref"
            >
              <span class="text-xl shrink-0">📝</span>
              <span class="text-[15px] font-semibold text-slate-800 flex-1">참조원고 복사</span>
            </button>

            <button
              class="flex items-center gap-3 px-4 py-3.5 rounded-xl border-none bg-black/2 cursor-pointer transition-all duration-200 text-left hover:bg-indigo-500/10 hover:translate-x-1"
              @click="handleDownload"
            >
              <span class="text-xl shrink-0">💾</span>
              <span class="text-[15px] font-semibold text-slate-800 flex-1">다운로드</span>
            </button>

            <button
              class="flex items-center gap-3 px-4 py-3.5 rounded-xl border-none bg-black/2 cursor-pointer transition-all duration-200 text-left hover:bg-red-500/10"
              @click="handleDelete"
            >
              <span class="text-xl shrink-0">🗑️</span>
              <span class="text-[15px] font-semibold text-red-500 flex-1">삭제하기</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
