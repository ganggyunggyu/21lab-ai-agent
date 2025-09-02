<script setup lang="ts">
import { ref, watch, onMounted, type Ref } from 'vue';
import { storeToRefs } from 'pinia';
import { NScrollbar, NSelect } from 'naive-ui';

import { useRouter } from 'vue-router';
import { useChatStore } from '@/stores';
import { useChatActions } from '@/hooks/useChatActions';
import { useScrollToBottom } from '@/hooks/useScrollToBottom';
import { useLayoutManager } from '@/hooks/useLayoutManager';
import { MODEL_OPTIONS } from '@/constants/_models';

import { useAutoScroll } from '@/hooks/useAutoScroll';
import ModernButton from '../ui/ModernButton.vue';
import { ChatService } from '@/types';

const chatStore = useChatStore();

const { messages, service } = storeToRefs(chatStore);

const { updateService, clearChat, exportChat } = chatStore;

const { downloadChatHistory } = useChatActions();

const scrollbarRef: Ref<InstanceType<typeof NScrollbar> | null> = ref(null);
const { scrollToLast } = useAutoScroll({
  containerRef: scrollbarRef,
  lastItemRef: ref(null),
});

const { hardScrollToBottom } = useScrollToBottom(scrollbarRef);

const router = useRouter();

const { headerRef } = useLayoutManager();

const handleChatHistoryDownload = () => {
  downloadChatHistory(exportChat);
};

const handlePrevChat = () => {
  router.push('/prev');
};

watch(service, (newService) => {
  updateService(newService as ChatService);
});

onMounted(async () => {
  scrollToLast();
  hardScrollToBottom(false);
});
</script>

<template>
  <header class="floating-header" ref="headerRef">
    <div class="header-content">
      <div class="logo-section">
        <ModernButton
          variant="ghost"
          size="sm"
          @click="handlePrevChat"
          title="이전 버전 라우트"
        >
          이전 버전 사용
        </ModernButton>
      </div>
      <div class="header-controls">
        <div class="model-selector">
          <n-select
            v-model:value="service"
            :options="MODEL_OPTIONS"
            size="small"
            :consistent-menu-width="false"
          />
        </div>

        <ModernButton
          variant="ghost"
          size="sm"
          @click="clearChat"
          :disabled="messages.length <= 1"
          title="채팅 삭제"
        >
          초기화
        </ModernButton>

        <ModernButton
          variant="ghost"
          size="sm"
          @click="handleChatHistoryDownload"
          :disabled="messages.length <= 1"
          title="채팅 내역 다운로드"
        >
          내보내기
        </ModernButton>
      </div>
    </div>
  </header>
</template>
<style lang="css" scoped>
/* ===== HEADER ===== */
.floating-header {
  position: fixed;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  width: calc(100% - 32px);
  max-width: var(--container-max);
}
.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(25px) saturate(180%);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06),
    0 1px 0 rgba(255, 255, 255, 0.8) inset, 0 -1px 0 rgba(0, 0, 0, 0.05) inset;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}
.header-content::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(
    circle,
    rgba(99, 102, 241, 0.03) 0%,
    transparent 70%
  );
  animation: liquidBubble 15s ease-in-out infinite;
  pointer-events: none;
}
.header-content:hover {
  transform: translateY(-2px) scale(1.01);
  box-shadow: 0 16px 64px rgba(0, 0, 0, 0.1),
    0 1px 0 rgba(255, 255, 255, 0.9) inset;
}
</style>
