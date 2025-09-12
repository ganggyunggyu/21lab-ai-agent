<script setup lang="ts">
import { onMounted, ref, watch, type Ref } from 'vue';
import { storeToRefs } from 'pinia';
import { NScrollbar } from 'naive-ui';
import { ChevronDown as ChevronDownIcon } from '@vicons/ionicons5';
import MessageBubble from '@/components/ui/MessageBubble.vue';
import ModernButton from '@/components/ui/ModernButton.vue';
import { useChatStore } from '@/stores/_chat';
import { useChatActions } from '@/hooks/useChatActions';
import { useScrollToBottom } from '@/hooks/useScrollToBottom';
import { useAutoScroll } from '@/hooks/useAutoScroll';
import { delay } from 'es-toolkit';
import { AUTO_SCROLL_DELAY } from '@/constants/_timings';

const chatStore = useChatStore();

const { displayMessages, messages } = storeToRefs(chatStore);

const { handleRegenerate, deleteMessage } = chatStore;

const { copyMsg, handleDownloadClick } = useChatActions();

const scrollbarRef: Ref<InstanceType<typeof NScrollbar> | null> = ref(null);

const {
  showScrollToBottom,
  checkScrollPosition,
  handleScrollToBottom,
  hardScrollToBottom,
} = useScrollToBottom(scrollbarRef);

const { scrollToLast } = useAutoScroll({
  containerRef: scrollbarRef,
  lastItemRef: ref(null),
});

watch(
  () => messages.value.length,
  async (newLength, oldLength) => {
    if (newLength > oldLength) {
      await delay(AUTO_SCROLL_DELAY);
      scrollToLast();
      hardScrollToBottom(true);
    }
  }
);

onMounted(async () => {
  scrollToLast();
  hardScrollToBottom(false);
});
</script>
<template>
  <main class="chat-main" role="main" aria-label="채팅 대화">
    <section class="chat-container">
      <section class="messages-container" aria-label="메시지 목록">
        <n-scrollbar
          ref="scrollbarRef"
          class="messages-scroll"
          @scroll="checkScrollPosition"
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
              />
            </li>
          </ul>
        </n-scrollbar>

        <aside v-show="showScrollToBottom" class="scroll-to-bottom" aria-label="스크롤 컨트롤">
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
  </main>
</template>
<style scoped>
.chat-main {
  flex: 1;
  padding: calc(var(--header-h, 80px) + var(--main-top-pad, 16px))
    var(--page-pad-x, 16px)
    calc(var(--footer-h, 120px) + var(--main-bot-pad, 8px));
  overflow: hidden;
}
.chat-container {
  max-width: 90vw;
  margin: 0 auto;
  height: 100%;
  display: flex;
  flex-direction: column;
  
  /* 작은 화면에서 100vw */
  @media (max-width: 768px) {
    max-width: calc(100vw - 32px);
  }
}
.messages-container {
  height: calc(100dvh - var(--header-h, 80px) - var(--footer-h, 180px));
  display: flex;
  flex-direction: column;
}
.messages-scroll {
  height: 100%;
}
.messages-list {
  padding: 16px 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ===== SCROLL TO BOTTOM BUTTON ===== */
.scroll-to-bottom {
  position: absolute;
  bottom: 20px;
  right: 20px;
  z-index: 10;
}
.scroll-btn {
  position: fixed;
  bottom: 230px;
  left: 50%;
  translate: -50% 0;
  z-index: 100;
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
</style>
