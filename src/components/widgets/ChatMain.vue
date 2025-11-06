<script setup lang="ts">
import { computed, onMounted, ref, watch, type Ref } from 'vue';
import { storeToRefs } from 'pinia';
import { NScrollbar } from 'naive-ui';
import { ChevronDown as ChevronDownIcon } from '@vicons/ionicons5';
import {
  MessageBubble,
  MessageDetailModal,
  Button,
} from '@/components/ui';
import {
  PublishedDetailModal,
  PublishedRegisterModal,
  usePublishedStore,
} from '@/features';
import { useChatStore } from '@/stores';
import { useChatActions } from '@/hooks';
import { delay } from 'es-toolkit';
import { AUTO_SCROLL_DELAY } from '@/constants';
import type { Message, SelectedMessagePackage } from '@/types';
import type { FavoriteSearch } from '@/entities';
import { sanitizeFileName } from '@/utils';

const chatStore = useChatStore();

const {
  displayMessages,
  messages,
  selectedMessageIds,
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

const { copyMsg, handleDownloadClick, downloadMultipleFiles } = useChatActions();

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
  openDetailModal(item);
};

const formatTimestampForFileName = (timestamp?: number): string => {
  const target = timestamp ? new Date(timestamp) : new Date();
  const pad = (value: number) => value.toString().padStart(2, '0');
  return `${target.getFullYear()}${pad(target.getMonth() + 1)}${pad(
    target.getDate()
  )}-${pad(target.getHours())}${pad(target.getMinutes())}`;
};

const composeResultContent = (
  pkg: SelectedMessagePackage
): { fileName: string; content: string } => {
  const { userMessage, responses } = pkg;
  const safeKeyword = sanitizeFileName(userMessage.keyword || 'message');

  const resultBody = responses.length
    ? responses.map((response) => response.content).join('\n\n---\n\n')
    : '결과가 생성되지 않았습니다.';

  const resultLength = resultBody.replace(/\s+/g, '').length;

  const fileName = `${safeKeyword}-${resultLength}.txt`;

  const content = resultBody;

  return { fileName, content };
};

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
  try {
    const scrollbarEl = scrollbarRef.value?.$el as HTMLElement | undefined;
    const contentEl = scrollbarEl?.querySelector(
      '.n-scrollbar-container'
    ) as HTMLElement | null;

    if (contentEl && scrollAnchorRef.value) {
      const anchorTop = scrollAnchorRef.value.offsetTop;
      contentEl.scrollTo({
        top: anchorTop + 150,
        behavior: 'smooth',
      });
    } else {
      scrollAnchorRef.value?.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      });
    }
  } catch (err) {
    scrollAnchorRef.value?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    });
  }
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
  <main
    class="flex-1 px-4 overflow-hidden flex flex-col pt-[calc(var(--spacing-header)+var(--spacing-main-top))]"
    role="main"
    aria-label="채팅 대화"
  >
    <section
      class="w-screen max-w-[90vw] md:w-screen md:max-w-screen mx-auto flex-1 flex flex-col overflow-hidden"
    >
      <section
        class="flex-1 flex flex-col overflow-hidden relative"
        aria-label="메시지 목록"
      >
        <n-scrollbar
          ref="scrollbarRef"
          class="flex-1 h-full"
          role="log"
          aria-live="polite"
          aria-label="채팅 메시지들"
        >
          <ul class="py-4 pb-[200px] flex flex-col gap-4" role="list">
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
            <div ref="scrollAnchorRef" class="h-px w-px"></div>
          </ul>
        </n-scrollbar>

        <aside
          class="fixed bottom-[150px] left-1/2 -translate-x-1/2 z-[100]"
          aria-label="스크롤 컨트롤"
        >
          <Button
            variant="secondary"
            size="lg"
            icon-only
            :icon="ChevronDownIcon"
            @click="handleScrollToBottom"
            class="!w-12 !h-12 rounded-full! !shadow-[0_4px_16px_rgba(0,0,0,0.12),0_8px_32px_rgba(59,130,246,0.2)] backdrop-blur-[10px] !transition-all !duration-300 !ease-[cubic-bezier(0.23,1,0.32,1)] hover:!-translate-y-0.5 hover:!scale-105 hover:!shadow-[0_8px_32px_rgba(0,0,0,0.16),0_12px_48px_rgba(59,130,246,0.3)] active:!translate-y-0 active:!scale-95"
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

    <PublishedRegisterModal
      :show="showRegisterModal"
      :message="messageToRegister"
      @close="handleCloseRegisterModal"
      @registered="handleRegistered"
    />

    <PublishedDetailModal />
  </main>
</template>
