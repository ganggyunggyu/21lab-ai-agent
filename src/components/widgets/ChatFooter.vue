<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { NInput, NTag, NText } from 'naive-ui';
import { Document as DocumentIcon, Send as SendIcon } from '@vicons/ionicons5';
import ModernButton from '@/components/ui/ModernButton.vue';
import ModernCard from '@/components/ui/ModernCard.vue';
import { useChatStore } from '@/stores/_chat';
import { watch } from 'vue';

const chatStore = useChatStore();

const { keyword, refMsg, isLoading, showRefInput } = storeToRefs(chatStore);

const { handleGenerate, handleKeyPress } = chatStore;

const actionChips = ['스마일라식', '라섹수술', '안구건조증', '시력교정'];

watch(keyword, (newVal) => {
  if (!newVal) return;

  const cleaned = newVal
    .replace(/Previous imageNext image/gi, ' ')
    // 분리된 것도 제거
    .replace(/\b(Previous image|Next image)\b/gi, ' ');

  if (cleaned !== newVal) {
    keyword.value = cleaned;
  }
});
</script>
<template>
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
                placeholder="참고 문서나 컨텍스트를 입력해주세요 (선택사항)"
                class="ref-input"
              />
            </div>
          </div>
        </transition>

        <div class="main-input-row">
          <div class="input-wrapper">
            <n-input
              v-model:value="keyword"
              type="textarea"
              :rows="1"
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
</template>
<style scoped>
/* ===== FOOTER / INPUT ===== */
.floating-input {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100vw;
  max-width: var(--container-max, 1000px);
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

/* ===== KEYFRAMES ===== */
@keyframes liquidGradient {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
</style>
