<script setup lang="ts">
import { ref, watch, onMounted, type Ref } from 'vue';
import { storeToRefs } from 'pinia';
import { NScrollbar, NInput, NSelect, NTag, NText } from 'naive-ui';
import {
  Document as DocumentIcon,
  Send as SendIcon,
  ChevronDown as ChevronDownIcon,
} from '@vicons/ionicons5';
import { delay } from 'es-toolkit';
import { MODEL_OPTIONS, type ModelService } from '../constants/models';
import { AUTO_SCROLL_DELAY } from '../constants/timings';
import { useAutoScroll } from '../composables/useAutoScroll';
import type { Message } from '../types/chat';
import ModernButton from '../components/ui/ModernButton.vue';
import ModernCard from '../components/ui/ModernCard.vue';
import MessageBubble from '../components/ui/MessageBubble.vue';
import { useChatStore } from '../stores/chat';
import { useChatActions } from '../composables/useChatActions';
import { useScrollToBottom } from '../composables/useScrollToBottom';
import { useLayoutManager } from '../composables/useLayoutManager';
import { useRouter } from 'vue-router';

const chatStore = useChatStore();

const {
  messages,
  keyword,
  refMsg,
  service,
  isLoading,
  showRefInput,
  displayMessages,
} = storeToRefs(chatStore);

const {
  handleGenerate,
  handleKeyPress,
  handleRegenerate,
  updateService,
  deleteMessage,
  clearChat,
  exportChat,
} = chatStore;

// Chat Actions
const { copyMsg, handleDownloadClick, downloadChatHistory } = useChatActions();

// Scroll Management
const scrollbarRef: Ref<InstanceType<typeof NScrollbar> | null> = ref(null);
const { scrollToLast } = useAutoScroll({
  containerRef: scrollbarRef,
  lastItemRef: ref(null),
});

const {
  showScrollToBottom,
  hardScrollToBottom,
  checkScrollPosition,
  handleScrollToBottom,
} = useScrollToBottom(scrollbarRef);

const actionChips = ['스마일라식', '라섹수술', '안구건조증', '시력교정'];

const router = useRouter();

// Layout Management
const { appRef, headerRef, footerRef } = useLayoutManager();

watch(
  () => messages.value.length,
  async (newLength, oldLength) => {
    // 메시지가 추가된 경우에만 스크롤 (삭제된 경우는 제외)
    if (newLength > oldLength) {
      await delay(AUTO_SCROLL_DELAY);
      scrollToLast();
      hardScrollToBottom(true);
    }
  }
);

watch(service, (newService) => {
  updateService(newService as ModelService);
});

// Handlers
const handleChatHistoryDownload = () => {
  downloadChatHistory(exportChat);
};

const handlePrevChat = () => {
  router.push('/prev');
};

// Lifecycle
onMounted(async () => {
  scrollToLast();
  hardScrollToBottom(false);
});
</script>

<template>
  <div class="app-container" ref="appRef">
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

          <!-- Scroll to Bottom Button -->
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

    <footer class="floating-input" ref="footerRef">
      <div class="input-container">
        <ModernCard variant="glass" class="input-card">
          <transition name="ref-slide">
            <div v-show="showRefInput" class="ref-input-section">
              <div class="input-surface">
                <n-input
                  v-model:value="refMsg"
                  type="textarea"
                  :rows="1"
                  :autosize="{ minRows: 1, maxRows: 3 }"
                  placeholder="📄 참고 문서나 컨텍스트를 입력해주세요 (선택사항)"
                  class="ref-input"
                />
              </div>
            </div>
          </transition>

          <div class="main-input-row">
            <div class="input-wrapper">
              <n-input
                v-model:value="keyword"
                placeholder="메시지를 입력하세요..."
                class="main-input"
                @keyup.enter="handleKeyPress"
              />

              <div class="input-actions">
                <ModernButton
                  variant="ghost"
                  size="sm"
                  icon-only
                  :icon="DocumentIcon"
                  @click="showRefInput = !showRefInput"
                  :class="{ active: showRefInput }"
                  aria-label="참조 입력 토글"
                />
                <ModernButton
                  v-if="keyword"
                  variant="primary"
                  size="sm"
                  icon-only
                  :icon="SendIcon"
                  :loading="isLoading"
                  @click="handleGenerate"
                  aria-label="메시지 전송"
                />
              </div>
            </div>
          </div>

          <div class="bottom-actions">
            <div class="action-chips">
              <n-tag
                v-for="chip in actionChips"
                :key="chip"
                size="small"
                :bordered="false"
                @click="keyword = chip"
                class="action-chip"
              >
                {{ chip }}
              </n-tag>
            </div>

            <div class="status-info">
              <n-text depth="3" v-if="keyword.length > 0">
                {{ keyword.length }}/1000
              </n-text>
            </div>
          </div>
        </ModernCard>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* ===== LAYOUT ===== */
.app-container {
  min-height: 100dvh;
  background: radial-gradient(
      circle at 25% 25%,
      rgba(99, 102, 241, 0.12) 0%,
      transparent 50%
    ),
    radial-gradient(
      circle at 75% 75%,
      rgba(16, 185, 129, 0.1) 0%,
      transparent 50%
    ),
    radial-gradient(
      circle at 50% 100%,
      rgba(59, 130, 246, 0.08) 0%,
      transparent 50%
    ),
    linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  background-size: 100% 100%;
  background-attachment: fixed;
  animation: liquidBackground 20s ease-in-out infinite;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;

  --header-h: 80px;
  --footer-h: 180px;
  --container-max: 1000px;
  --page-pad-x: 16px;
  --main-top-pad: 16px;
  --main-bot-pad: 16px;
}

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

/* ===== MAIN ===== */
.chat-main {
  flex: 1;
  padding: calc(var(--header-h) + var(--main-top-pad)) var(--page-pad-x)
    calc(var(--footer-h) + var(--main-bot-pad));
  overflow: hidden;
}
.chat-container {
  max-width: var(--container-max);
  margin: 0 auto;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.messages-container {
  height: calc(100dvh - var(--header-h) - var(--footer-h));
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

/* ===== FOOTER / INPUT ===== */
.floating-input {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100vw;
  max-width: var(--container-max);
  z-index: 100;
}
.input-container {
  position: relative;
}
.input-card {
  padding: 0;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(30px) saturate(200%);
  border-radius: 32px 32px 0 0;
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 20px 64px rgba(0, 0, 0, 0.1),
    0 1px 0 rgba(255, 255, 255, 0.8) inset, 0 -1px 0 rgba(0, 0, 0, 0.03) inset;
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.input-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  transition: left 0.6s ease;
}
.input-card:hover::before {
  left: 100%;
}
.input-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 32px 80px rgba(0, 0, 0, 0.15),
    0 1px 0 rgba(255, 255, 255, 0.9) inset;
}

/* 펼침/접힘(참고 입력) */
.ref-input-section {
  padding: 16px 20px 0;
  position: relative;
  overflow: hidden;
}
.ref-slide-enter-from,
.ref-slide-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-6px);
  filter: blur(1px);
}
.ref-slide-enter-to,
.ref-slide-leave-from {
  max-height: 180px;
  opacity: 1;
  transform: translateY(0);
  filter: none;
}
.ref-slide-enter-active,
.ref-slide-leave-active {
  transition: max-height 260ms cubic-bezier(0.2, 0.8, 0.2, 1),
    opacity 220ms ease, transform 260ms cubic-bezier(0.2, 0.8, 0.2, 1),
    filter 220ms ease;
}

/* 공통 입력 래퍼(참고/메인 동일 스타일) */
.input-wrapper,
.input-surface {
  margin-top: 5px;
  color: #000;
  display: flex;
  align-items: flex-end;
  gap: 8px;
  background: linear-gradient(
    145deg,
    rgba(248, 250, 252, 0.9),
    rgba(241, 245, 249, 0.8)
  );
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 24px;
  padding: 16px 20px;
  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04),
    0 1px 0 rgba(255, 255, 255, 0.8) inset;
  position: relative;
  overflow: hidden;
}
.input-wrapper::after,
.input-surface::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #6366f1, #8b5cf6, #06b6d4, #10b981);
  background-size: 200% 100%;
  opacity: 0;
  transition: opacity 0.3s ease;
  animation: liquidGradient 3s linear infinite;
}
.input-wrapper:focus-within,
.input-surface:focus-within {
  border-color: rgba(99, 102, 241, 0.4);
  background: linear-gradient(
    145deg,
    rgba(255, 255, 255, 0.95),
    rgba(248, 250, 252, 0.9)
  );
  box-shadow: 0 0 0 6px rgba(99, 102, 241, 0.08),
    0 8px 32px rgba(99, 102, 241, 0.15), 0 1px 0 rgba(255, 255, 255, 0.9) inset;
  transform: translateY(-1px) scale(1.01);
}
.input-wrapper:focus-within::after,
.input-surface:focus-within::after {
  opacity: 1;
}

/* Naive UI n-input 공통 오버라이드 */
.main-input :deep(.n-input),
.ref-input :deep(.n-input) {
  background: transparent;
  border: none;
  padding: 0;
}
.main-input :deep(.n-input .n-input-wrapper),
.ref-input :deep(.n-input .n-input-wrapper) {
  background: transparent;
  border: none;
  box-shadow: none;
  padding: 0;
}
.main-input :deep(.n-input .n-input__input),
.main-input :deep(.n-input .n-input__textarea),
.ref-input :deep(.n-input .n-input__input),
.ref-input :deep(.n-input .n-input__textarea) {
  color: #000 !important;
  background: transparent !important;
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
  font-family: inherit !important;
  font-size: 16px !important;
  line-height: 1.5 !important;
  padding: 0 !important;
  resize: none;
}
.main-input :deep(textarea:focus),
.ref-input :deep(textarea:focus),
.main-input :deep(input:focus),
.ref-input :deep(input:focus) {
  outline: none !important;
  box-shadow: none !important;
  border-color: transparent !important;
}
.main-input :deep(.n-input__input-el::placeholder),
.ref-input :deep(.n-input__input-el::placeholder) {
  color: rgba(0, 0, 0, 0.45);
}
.main-input {
  flex: 1;
}

/* 액션/칩 */
.input-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}
.input-actions .modern-btn {
  opacity: 0.6;
  transition: all 0.2s ease;
}
.input-actions .modern-btn:hover,
.input-actions .modern-btn.active {
  opacity: 1;
}
.bottom-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  padding: 5px;
  padding-top: 10px;
}
.action-chips {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.action-chip {
  cursor: pointer;
  transition: all 0.2s ease;
  background: rgba(99, 102, 241, 0.1);
  color: #000;
  border: 1px solid rgba(99, 102, 241, 0.2);
}
.action-chip:hover {
  background: rgba(99, 102, 241, 0.15);
  transform: translateY(-1px);
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

/* ===== MEDIA ===== */
@media (max-width: 768px) {
  .app-container {
    --header-h: 76px;
    --footer-h: 156px;
  }
  .floating-header {
    top: 8px;
    width: calc(100% - 16px);
  }
  .header-content {
    padding: 12px 16px;
    border-radius: 16px;
  }
  .chat-main {
    padding: calc(var(--header-h) + 8px) 8px calc(var(--footer-h) + 8px);
  }
}

/* ===== KEYFRAMES (필요한 것만) ===== */
@keyframes liquidBackground {
  0%,
  100% {
    background-position: 0% 50%, 100% 50%, 50% 100%, 0% 0%;
  }
  25% {
    background-position: 100% 25%, 75% 75%, 25% 75%, 25% 25%;
  }
  50% {
    background-position: 50% 0%, 50% 100%, 75% 25%, 50% 50%;
  }
  75% {
    background-position: 25% 75%, 25% 25%, 100% 50%, 75% 75%;
  }
}
@keyframes liquidGradient {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
@keyframes liquidBubble {
  0%,
  100% {
    transform: translateY(0) rotate(0) scale(1);
  }
  25% {
    transform: translateY(-10px) rotate(90deg) scale(1.05);
  }
  50% {
    transform: translateY(-5px) rotate(180deg) scale(0.95);
  }
  75% {
    transform: translateY(-15px) rotate(270deg) scale(1.1);
  }
}
</style>
