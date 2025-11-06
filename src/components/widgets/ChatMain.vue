<script setup lang="ts">
import { computed, onMounted, ref, watch, type Ref } from 'vue';
import { storeToRefs } from 'pinia';
import { NScrollbar } from 'naive-ui';
import { ChevronDown as ChevronDownIcon } from '@vicons/ionicons5';
import MessageBubble from '@/components/ui/MessageBubble.vue';
import MessageDetailModal from '@/components/ui/MessageDetailModal.vue';
import ModernButton from '@/components/ui/ModernButton.vue';
import PublishedDetailModal from '@/features/published/ui/PublishedDetailModal.vue';
import PublishedRegisterModal from '@/features/published/ui/PublishedRegisterModal.vue';
import { useChatStore } from '@/stores/_chat';
import { useChatActions } from '@/hooks/useChatActions';
import { delay } from 'es-toolkit';
import { AUTO_SCROLL_DELAY } from '@/constants/_timings';
import type { Message, SelectedMessagePackage } from '@/types/_chat';
import type { FavoriteSearch } from '@/entities/published';
import { usePublishedStore } from '@/features/published/stores/publishedStore';
import { sanitizeFileName } from '@/utils/_sanitizeFileName';

const chatStore = useChatStore();

const {
  displayMessages,
  messages,
  isSelectionMode,
  selectedMessageIds,
  selectedMessagesCount,
  selectableMessagesCount,
  hasSelectedMessages,
} = storeToRefs(chatStore);

const {
  handleRegenerate,
  deleteMessage,
  toggleSelectionMode,
  selectAllMessages,
  clearSelection,
  exportSelectedMessages,
} = chatStore;

const { copyMsg, handleDownloadClick, downloadZipFiles } = useChatActions();

const publishedStore = usePublishedStore();
const { openDetailModal, closeDetailModal } = publishedStore;

const scrollbarRef: Ref<InstanceType<typeof NScrollbar> | null> = ref(null);
const scrollAnchorRef = ref<HTMLDivElement | null>(null);

const showDetailModal = ref(false);
const selectedMessage = ref<Message | null>(null);

const showRegisterModal = ref(false);
const messageToRegister = ref<Message | null>(null);

const handleShowDetail = (message: Message) => {
  selectedMessage.value = message;
  showDetailModal.value = true;
};

const handleCloseDetailModal = () => {
  showDetailModal.value = false;
  selectedMessage.value = null;
};

const handleShowWorkModal = (message: Message) => {
  messageToRegister.value = message;
  showRegisterModal.value = true;
};

const handleCloseRegisterModal = () => {
  showRegisterModal.value = false;
  messageToRegister.value = null;
};

const handleRegistered = (item: FavoriteSearch) => {
  // 등록 완료 후 상세 모달 열기 (선택사항)
  openDetailModal(item);
};

const formatTimestampForFileName = (timestamp?: number): string => {
  const target = timestamp ? new Date(timestamp) : new Date();
  const pad = (value: number) => value.toString().padStart(2, '0');
  return `${target.getFullYear()}${pad(target.getMonth() + 1)}${pad(
    target.getDate()
  )}-${pad(target.getHours())}${pad(target.getMinutes())}`;
};

const formatTimestampForContent = (timestamp?: number): string => {
  if (!timestamp) return '기록되지 않음';
  return new Date(timestamp).toLocaleString('ko-KR');
};

const composeResultContent = (
  pkg: SelectedMessagePackage
): { fileName: string; content: string } => {
  const { userMessage, responses } = pkg;
  const safeKeyword = sanitizeFileName(userMessage.keyword || 'message');

  // 결과원고만 추출 (봇 응답만)
  const resultBody = responses.length
    ? responses.map((response) => response.content).join('\n\n---\n\n')
    : '결과가 생성되지 않았습니다.';

  // 결과원고 길이 계산 (공백 제외)
  const resultLength = resultBody.replace(/\s+/g, '').length;

  // 파일명: 키워드-결과원고길이.txt
  const fileName = `${safeKeyword}-${resultLength}.txt`;

  // 내용: 결과원고만
  const content = resultBody;

  return { fileName, content };
};

const handleDownloadSelected = async () => {
  if (!hasSelectedMessages.value) return;

  const packages = exportSelectedMessages();
  if (packages.length === 0) {
    return;
  }

  const files = packages.map(composeResultContent);
  const zipName = `selected-results-${formatTimestampForFileName()}`;

  const nameCountMap = new Map<string, number>();
  const uniqueFiles = files.map(({ fileName, content }) => {
    // .txt 확장자 분리
    const baseName = fileName.replace(/\.txt$/, '');
    const extension = '.txt';

    const currentCount = nameCountMap.get(baseName) ?? 0;
    nameCountMap.set(baseName, currentCount + 1);

    if (currentCount === 0) {
      return { fileName, content };
    }

    // 중복된 경우 (2), (3) 등을 파일명에 추가
    return {
      fileName: `${baseName}(${currentCount + 1})${extension}`,
      content,
    };
  });

  await downloadZipFiles(uniqueFiles, zipName);

  toggleSelectionMode();
};

// 전체 선택/해제 토글
const totalSelectable = computed(() => selectableMessagesCount.value);
const isAllSelected = computed(
  () =>
    totalSelectable.value > 0 &&
    selectedMessageIds.value.size === totalSelectable.value
);

const handleToggleSelectAll = () => {
  if (isAllSelected.value) {
    clearSelection();
  } else {
    selectAllMessages();
  }
};

const handleScrollToBottom = () => {
  scrollAnchorRef.value?.scrollIntoView({
    behavior: 'smooth',
    block: 'end',
  });
};

watch(
  () => messages.value.length,
  async (newLength, oldLength) => {
    if (newLength > oldLength) {
      await delay(AUTO_SCROLL_DELAY);
      scrollAnchorRef.value?.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      });
    }
  }
);

onMounted(async () => {
  await delay(100);
  scrollAnchorRef.value?.scrollIntoView({ behavior: 'auto', block: 'end' });
});
</script>
<template>
  <main class="chat-main" role="main" aria-label="채팅 대화">
    <section class="chat-container">
      <section class="messages-container" aria-label="메시지 목록">
        <n-scrollbar
          ref="scrollbarRef"
          class="messages-scroll"
          role="log"
          aria-live="polite"
          aria-label="채팅 메시지들"
        >
          <ul class="messages-list" role="list">
            <li
              v-for="(msg, idx) in displayMessages"
              :key="`${idx}-${msg.timestamp}`"
              role="listitem"
            >
              <MessageBubble
                :message="msg"
                :index="idx"
                :render-md="idx === 0"
                @copy="(text, message) => copyMsg(text, message)"
                @download="handleDownloadClick"
                @regenerate="handleRegenerate"
                @delete="deleteMessage"
                @show-detail="handleShowDetail"
                @show-work-modal="handleShowWorkModal"
              />
            </li>
            <div ref="scrollAnchorRef" class="scroll-anchor"></div>
          </ul>
        </n-scrollbar>

        <aside class="scroll-to-bottom" aria-label="스크롤 컨트롤">
          <ModernButton
            variant="secondary"
            size="lg"
            icon-only
            :icon="ChevronDownIcon"
            @click="handleScrollToBottom"
            class="scroll-btn"
            title="맨 아래로 스크롤"
            aria-label="채팅 맨 아래로 이동"
          />
        </aside>
      </section>
    </section>

    <MessageDetailModal
      :show="showDetailModal"
      :message="selectedMessage"
      @close="handleCloseDetailModal"
    />

    <!-- 발행원고 등록 모달 -->
    <PublishedRegisterModal
      :show="showRegisterModal"
      :message="messageToRegister"
      @close="handleCloseRegisterModal"
      @registered="handleRegistered"
    />

    <!-- Published Detail Modal을 사용하여 작업선택 기능 제공 -->
    <PublishedDetailModal />
  </main>
</template>
<style scoped>
.chat-main {
  flex: 1;
  padding: calc(var(--header-h, 80px) + var(--main-top-pad, 16px))
    var(--page-pad-x, 16px) 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.chat-container {
  width: 100vw;
  max-width: 90vw;
  margin: 0 auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  /* 작은 화면에서 100vw */
  @media (max-width: 768px) {
    width: 100vw;
    max-width: 100vw;
  }
}
.messages-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}
.messages-scroll {
  flex: 1;
  height: 100%;
}
.messages-list {
  padding: 16px 0 200px 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ===== SCROLL TO BOTTOM BUTTON ===== */
.scroll-to-bottom {
  position: fixed;
  bottom: 150px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
}
.scroll-btn {
  width: 48px !important;
  height: 48px !important;
  border-radius: 50% !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12), 0 8px 32px rgba(59, 130, 246, 0.2) !important;
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1) !important;
}
.scroll-btn:hover {
  transform: translateY(-2px) scale(1.05) !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.16),
    0 12px 48px rgba(59, 130, 246, 0.3) !important;
}
.scroll-btn:active {
  transform: translateY(0) scale(0.95) !important;
}

/* 선택 툴바 제거 - 이제 헤더에 통합됨 */

.scroll-anchor {
  height: 1px;
  width: 1px;
}
</style>
