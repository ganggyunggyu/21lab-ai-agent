<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { ChevronDown as ChevronDownIcon } from '@vicons/ionicons5';
import { MessageBubble, MessageDetailModal, Button } from '@/components/ui';
import {
  PublishedDetailModal,
  PublishedRegisterModal,
  usePublishedStore,
} from '@/features';
import { useChatStore } from '@/stores';
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
} = storeToRefs(chatStore);

const { selectAllMessages, clearSelection } = chatStore;

const publishedStore = usePublishedStore();
const { openDetailModal } = publishedStore;

const scrollAnchorRef = ref<HTMLDivElement | null>(null);
const scrollContainerRef = ref<HTMLElement | null>(null);

const showDetailModal = ref(false);
const selectedMessage = ref<Message | null>(null);

const showRegisterModal = ref(false);
const messageToRegister = ref<Message | null>(null);

const SCROLL_EXTRA_OFFSET = 150;

const getScrollContainer = () => {
  if (scrollContainerRef.value) return scrollContainerRef.value;

  const anchor = scrollAnchorRef.value;
  if (!anchor) return null;

  let current: HTMLElement | null = anchor.parentElement as HTMLElement | null;
  while (current) {
    const { overflowY } = window.getComputedStyle(current);
    if (overflowY === 'auto' || overflowY === 'scroll') {
      return current;
    }
    current = current.parentElement;
  }

  return document.scrollingElement as HTMLElement | null;
};

const scrollToBottom = async (isSmooth: boolean = true) => {
  await nextTick();

  const behavior: ScrollBehavior = isSmooth ? 'smooth' : 'auto';

  if (scrollAnchorRef.value) {
    scrollAnchorRef.value.scrollIntoView({
      behavior,
      block: 'end',
    });
  }

  const target = getScrollContainer();
  if (!target) return;

  const maxScrollTop = target.scrollHeight - target.clientHeight;
  const desiredScrollTop = Math.max(0, Math.min(target.scrollHeight, maxScrollTop + SCROLL_EXTRA_OFFSET));

  if (typeof target.scrollTo === 'function') {
    target.scrollTo({
      top: desiredScrollTop,
      behavior,
    });
    return;
  }

  target.scrollTop = desiredScrollTop;
};

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
  scrollToBottom(true);
};

watch(
  () => messages.value.length,
  async (newLength, oldLength) => {
    if (newLength > oldLength) {
      await delay(AUTO_SCROLL_DELAY);
      await scrollToBottom(true);
    }
  }
);

onMounted(async () => {
  await delay(100);
  await scrollToBottom(false);
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
        <div
          ref="scrollContainerRef"
          class="flex-1 h-full overflow-y-auto"
          role="log"
          aria-live="polite"
          aria-label="채팅 메시지들"
        >
          <TransitionGroup
            tag="ul"
            name="message-list"
            class="py-4 pb-0 flex flex-col gap-4"
            role="list"
          >
            <li
              v-for="(msg, idx) in displayMessages"
              :key="`${msg.id}-${msg.images?.length || 0}`"
              role="listitem"
              class="message-item"
              :style="{ '--item-index': idx }"
            >
              <MessageBubble
                :message="msg"
                :index="idx"
                @show-detail="handleShowDetail"
                @show-work-modal="handleShowWorkModal"
              />
            </li>
          </TransitionGroup>
          <div ref="scrollAnchorRef" class="h-px w-px mt-[150px]"></div>
        </div>

        <aside
          class="fixed bottom-[150px] left-1/2 -translate-x-1/2 z-[100]"
          aria-label="스크롤 컨트롤"
        >
          <Button
            color="light"
            size="lg"
            icon-only
            :icon="ChevronDownIcon"
            @click="handleScrollToBottom"
            class="w-12 h-12 rounded-full shadow-lg"
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

<style scoped>
/* TransitionGroup 애니메이션 */
.message-list-enter-active {
  animation: messageEnter 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.message-list-leave-active {
  animation: messageLeave 0.3s ease-out forwards;
}

.message-list-move {
  transition: transform 0.4s ease;
}

@keyframes messageEnter {
  0% {
    opacity: 0;
    transform: translateY(30px) scale(0.9);
  }
  50% {
    opacity: 0.8;
    transform: translateY(-5px) scale(1.02);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes messageLeave {
  0% {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateX(-30px) scale(0.9);
  }
}

.message-item {
  will-change: transform, opacity;
}
</style>
