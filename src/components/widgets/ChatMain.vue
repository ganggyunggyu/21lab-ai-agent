<script setup lang="ts">
import { onMounted, ref, watch, type Ref } from 'vue';
import { storeToRefs } from 'pinia';
import { NScrollbar } from 'naive-ui';
import { ChevronDown as ChevronDownIcon } from '@vicons/ionicons5';
import MessageBubble from '@/components/ui/MessageBubble.vue';
import ModernButton from '@/components/ui/ModernButton.vue';
import { useChatStore } from '@/stores/chat';
import { useChatActions } from '@/composables/useChatActions';
import { useScrollToBottom } from '@/composables/useScrollToBottom';
import { useAutoScroll } from '@/composables/useAutoScroll';
import { delay } from 'es-toolkit';
import { AUTO_SCROLL_DELAY } from '@/constants/timings';

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
  <main class="chat-main">
    <div class="chat-container">
      <div class="messages-container">
        <n-scrollbar
          ref="scrollbarRef"
          class="messages-scroll"
          @scroll="checkScrollPosition"
        >
          <div class="messages-list">
            <MessageBubble
              v-for="(msg, idx) in displayMessages"
              :key="`${idx}-${msg.timestamp}`"
              :message="msg"
              :index="idx"
              @copy="copyMsg"
              @download="handleDownloadClick"
              @regenerate="handleRegenerate"
              @delete="deleteMessage"
            />
            <div class="bottom-spacer" />
          </div>
        </n-scrollbar>

        <div v-show="showScrollToBottom" class="scroll-to-bottom">
          <ModernButton
            variant="secondary"
            size="lg"
            icon-only
            :icon="ChevronDownIcon"
            @click="handleScrollToBottom"
            class="scroll-btn"
            title="맨 아래로 스크롤"
          />
        </div>
      </div>
    </div>
  </main>
</template>
<style scoped>
/* ===== MAIN ===== */
.chat-main {
  flex: 1;
  padding: calc(var(--header-h, 80px) + var(--main-top-pad, 16px))
    var(--page-pad-x, 16px)
    calc(var(--footer-h, 180px) + var(--main-bot-pad, 16px));
  overflow: hidden;
}
.chat-container {
  max-width: var(--container-max, 1000px);
  margin: 0 auto;
  height: 100%;
  display: flex;
  flex-direction: column;
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
.bottom-spacer {
  height: 24px;
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
  bottom: 200px;
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
