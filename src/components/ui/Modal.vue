<script setup lang="ts">
import { computed, onUnmounted, watch, ref, nextTick } from 'vue';
import { Close as CloseIcon } from '@vicons/ionicons5';
import { Button } from '@/components/ui';

/**
 * TDS Dialog 패턴 기반 Modal 컴포넌트
 *
 * @prop show - 모달 표시 여부 (v-model:show)
 * @prop title - 모달 제목
 * @prop size - 크기 (sm, md, lg, xl, full)
 * @prop closeOnOverlayClick - 오버레이 클릭 시 닫기 (기본: true)
 * @prop closeOnEscape - ESC 키 입력 시 닫기 (기본: true)
 * @prop showCloseButton - 닫기 버튼 표시 (기본: true)
 * @prop persistent - 외부 클릭/ESC로 닫히지 않음 (기본: false)
 */

interface Props {
  show: boolean;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  persistent?: boolean;
}

interface Emits {
  'update:show': [value: boolean];
  close: [];
  closed: []; // 애니메이션 완료 후
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  closeOnOverlayClick: true,
  closeOnEscape: true,
  showCloseButton: true,
  persistent: false,
});

const emit = defineEmits<Emits>();

const isVisible = ref(false);
const isAnimating = ref(false);

const sizeClass = computed(() => `modal-${props.size}`);

const canClose = computed(() => !props.persistent);

const handleClose = () => {
  if (!canClose.value) return;
  emit('update:show', false);
  emit('close');
};

const handleBackdropClick = (e: MouseEvent) => {
  if (e.target === e.currentTarget && props.closeOnOverlayClick) {
    handleClose();
  }
};

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.show && props.closeOnEscape) {
    handleClose();
  }
};

const handleAfterLeave = () => {
  isVisible.value = false;
  isAnimating.value = false;
  emit('closed');
};

const handleBeforeEnter = () => {
  isVisible.value = true;
  isAnimating.value = true;
};

const handleAfterEnter = () => {
  isAnimating.value = false;
};

watch(
  () => props.show,
  (show) => {
    if (show) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      nextTick(() => {
        isVisible.value = true;
      });
    } else {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    }
  },
  { immediate: true }
);

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown);
  document.body.style.overflow = '';
});
</script>

<template>
  <Teleport to="body">
    <Transition
      name="modal-backdrop"
      @before-enter="handleBeforeEnter"
      @after-enter="handleAfterEnter"
      @after-leave="handleAfterLeave"
    >
      <div
        v-if="show"
        class="modal-overlay"
        @click="handleBackdropClick"
        role="presentation"
      >
        <Transition name="modal-content" appear>
          <div
            v-if="show"
            :class="['modal-container', sizeClass]"
            role="dialog"
            aria-modal="true"
            :aria-labelledby="title ? 'modal-title' : undefined"
          >
            <!-- Header -->
            <header
              v-if="title || $slots.header || showCloseButton"
              class="modal-header"
            >
              <div class="modal-header-content">
                <slot name="header">
                  <h2 v-if="title" id="modal-title" class="modal-title">
                    {{ title }}
                  </h2>
                </slot>
              </div>
              <Button
                v-if="showCloseButton && canClose"
                color="light"
                variant="weak"
                size="sm"
                icon-only
                @click="handleClose"
                class="modal-close-btn"
                aria-label="닫기"
              >
                <CloseIcon class="w-5 h-5" />
              </Button>
            </header>

            <!-- Body -->
            <div class="modal-body" role="document">
              <slot />
            </div>

            <!-- Footer -->
            <footer v-if="$slots.footer" class="modal-footer">
              <slot name="footer" />
            </footer>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
}

.modal-container {
  position: relative;
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - var(--space-8));
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-xl);
  box-shadow:
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

/* Size variants */
.modal-sm {
  width: 320px;
}

.modal-md {
  width: 400px;
}

.modal-lg {
  width: 560px;
}

.modal-xl {
  width: min(720px, calc(100vw - var(--space-8)));
}

.modal-full {
  width: calc(100vw - var(--space-8));
  height: calc(100vh - var(--space-8));
  max-height: calc(100vh - var(--space-8));
}

/* Header */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  border-bottom: 1px solid var(--color-border-primary);
  background-color: var(--color-bg-secondary);
  flex-shrink: 0;
}

.modal-header-content {
  flex: 1;
  min-width: 0;
}

.modal-title {
  margin: 0;
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--color-text-primary);
  line-height: var(--leading-tight);
}

.modal-close-btn {
  flex-shrink: 0;
  margin: calc(var(--space-1) * -1);
}

/* Body */
.modal-body {
  flex: 1;
  padding: var(--space-5);
  color: var(--color-text-primary);
  overflow-y: auto;
  overscroll-behavior: contain;
}

/* Footer */
.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-2);
  padding: var(--space-4) var(--space-5);
  border-top: 1px solid var(--color-border-primary);
  background-color: var(--color-bg-secondary);
  flex-shrink: 0;
}

/* Backdrop Transition */
.modal-backdrop-enter-active,
.modal-backdrop-leave-active {
  transition: opacity 200ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

.modal-backdrop-enter-from,
.modal-backdrop-leave-to {
  opacity: 0;
}

/* Content Transition */
.modal-content-enter-active {
  transition:
    opacity 200ms cubic-bezier(0.2, 0.8, 0.2, 1),
    transform 200ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

.modal-content-leave-active {
  transition:
    opacity 150ms cubic-bezier(0.2, 0.8, 0.2, 1),
    transform 150ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

.modal-content-enter-from {
  opacity: 0;
  transform: scale(0.95) translateY(-8px);
}

.modal-content-leave-to {
  opacity: 0;
  transform: scale(0.98) translateY(4px);
}

/* Scrollbar styling */
.modal-body::-webkit-scrollbar {
  width: 6px;
}

.modal-body::-webkit-scrollbar-track {
  background: transparent;
}

.modal-body::-webkit-scrollbar-thumb {
  background-color: var(--color-border-secondary);
  border-radius: 3px;
}

.modal-body::-webkit-scrollbar-thumb:hover {
  background-color: var(--color-text-disabled);
}
</style>
