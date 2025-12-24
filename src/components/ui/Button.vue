<script setup lang="ts">
import { computed } from 'vue';
import { Vue3Lottie } from 'vue3-lottie';
import loadingDotsAnimation from '@/assets/lottie/loading-dots.json';
import { cn } from '@/utils';

/**
 * TDS 패턴 기반 Button 컴포넌트
 *
 * @prop color - 버튼 색상 (primary, danger, light, dark)
 * @prop variant - 스타일 강도 (fill: 채워진, weak: 약한)
 * @prop display - 너비/배치 (inline, block, full)
 * @prop size - 크기 (sm, md, lg, xl)
 * @prop loading - 로딩 상태 (Lottie 애니메이션)
 * @prop disabled - 비활성화 상태
 * @prop icon - 아이콘 컴포넌트
 * @prop iconOnly - 아이콘만 표시
 */

interface Props {
  color?: 'primary' | 'danger' | 'light' | 'dark';
  variant?: 'fill' | 'weak';
  display?: 'inline' | 'block' | 'full';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  disabled?: boolean;
  icon?: any;
  iconOnly?: boolean;
  as?: 'button' | 'a';
}

interface Emits {
  click: [event: MouseEvent];
}

const props = withDefaults(defineProps<Props>(), {
  color: 'primary',
  variant: 'fill',
  display: 'inline',
  size: 'md',
  loading: false,
  disabled: false,
  iconOnly: false,
  as: 'button',
});

const emit = defineEmits<Emits>();

const iconSize = computed(() => {
  const sizes = { sm: 16, md: 18, lg: 20, xl: 22 };
  return sizes[props.size];
});

const lottieSize = computed(() => {
  const sizes = { sm: 32, md: 40, lg: 48, xl: 56 };
  return sizes[props.size];
});

const baseClasses = 'btn-base';

const sizeClasses = computed(() => {
  const sizes = {
    sm: 'btn-sm',
    md: 'btn-md',
    lg: 'btn-lg',
    xl: 'btn-xl',
  };
  return sizes[props.size];
});

const colorVariantClasses = computed(() => {
  const map = {
    'primary-fill': 'btn-primary-fill',
    'primary-weak': 'btn-primary-weak',
    'danger-fill': 'btn-danger-fill',
    'danger-weak': 'btn-danger-weak',
    'light-fill': 'btn-light-fill',
    'light-weak': 'btn-light-weak',
    'dark-fill': 'btn-dark-fill',
    'dark-weak': 'btn-dark-weak',
  };
  return map[`${props.color}-${props.variant}`];
});

const displayClasses = computed(() => {
  const displays = {
    inline: 'btn-inline',
    block: 'btn-block',
    full: 'btn-full',
  };
  return displays[props.display];
});

const stateClasses = computed(() => {
  return cn({
    'btn-disabled': props.disabled,
    'btn-loading': props.loading,
    'btn-icon-only': props.iconOnly,
  });
});

const buttonClasses = computed(() => {
  return cn(
    baseClasses,
    sizeClasses.value,
    colorVariantClasses.value,
    displayClasses.value,
    stateClasses.value
  );
});

const handleClick = (event: MouseEvent) => {
  if (!props.disabled) {
    emit('click', event);
  }
};
</script>

<template>
  <component
    :is="as"
    :class="buttonClasses"
    :disabled="disabled"
    @click="handleClick"
    :aria-busy="loading"
    :aria-disabled="disabled"
  >
    <!-- 로딩 상태: Lottie 애니메이션 -->
    <div v-if="loading" class="btn-loader">
      <Vue3Lottie
        :animation-data="loadingDotsAnimation"
        :width="lottieSize"
        :height="lottieSize / 2"
        :loop="true"
        :auto-play="true"
      />
    </div>

    <!-- 아이콘 -->
    <component
      v-if="icon && !loading"
      :is="icon"
      :style="{ width: iconSize + 'px', height: iconSize + 'px' }"
      class="btn-icon"
    />

    <!-- 텍스트 슬롯 -->
    <span v-if="!loading && !iconOnly" class="btn-text">
      <slot />
    </span>

    <!-- 아이콘 전용일 때 슬롯 -->
    <slot v-else-if="!loading && iconOnly" />
  </component>
</template>

<style scoped>
.btn-base {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  border: none;
  outline: none;
  text-decoration: none;
  transition:
    background-color 0.2s cubic-bezier(0.2, 0.8, 0.2, 1),
    color 0.2s cubic-bezier(0.2, 0.8, 0.2, 1),
    transform 0.15s cubic-bezier(0.2, 0.8, 0.2, 1),
    box-shadow 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.btn-base:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.btn-base:active:not(:disabled) {
  transform: scale(0.97);
}

/* ===== Sizes ===== */
.btn-sm {
  height: 36px;
  padding: 0 var(--space-3);
  font-size: 13px;
  border-radius: var(--radius-sm);
}

.btn-md {
  height: 44px;
  padding: 0 var(--space-4);
  font-size: 14px;
  border-radius: var(--radius-md);
}

.btn-lg {
  height: 52px;
  padding: 0 var(--space-5);
  font-size: 15px;
  border-radius: var(--radius-lg);
}

.btn-xl {
  height: 60px;
  padding: 0 var(--space-6);
  font-size: 16px;
  border-radius: var(--radius-lg);
}

/* ===== Display ===== */
.btn-inline {
  display: inline-flex;
}

.btn-block {
  display: flex;
  width: auto;
}

.btn-full {
  display: flex;
  width: 100%;
}

/* ===== Color + Variant Combinations ===== */

/* Primary Fill */
.btn-primary-fill {
  background-color: var(--color-primary);
  color: white;
}

.btn-primary-fill:hover:not(:disabled) {
  background-color: var(--color-primary-hover);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

/* Primary Weak */
.btn-primary-weak {
  background-color: rgba(59, 130, 246, 0.1);
  color: var(--color-primary);
}

.btn-primary-weak:hover:not(:disabled) {
  background-color: rgba(59, 130, 246, 0.2);
}

/* Danger Fill */
.btn-danger-fill {
  background-color: var(--color-urgent);
  color: white;
}

.btn-danger-fill:hover:not(:disabled) {
  background-color: var(--color-urgent-hover);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

/* Danger Weak */
.btn-danger-weak {
  background-color: rgba(239, 68, 68, 0.1);
  color: var(--color-urgent);
}

.btn-danger-weak:hover:not(:disabled) {
  background-color: rgba(239, 68, 68, 0.2);
}

/* Light Fill */
.btn-light-fill {
  background-color: var(--color-bg-secondary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border-primary);
}

.btn-light-fill:hover:not(:disabled) {
  background-color: var(--color-bg-tertiary);
  border-color: var(--color-border-secondary);
}

/* Light Weak */
.btn-light-weak {
  background-color: transparent;
  color: var(--color-text-secondary);
}

.btn-light-weak:hover:not(:disabled) {
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
}

/* Dark Fill */
.btn-dark-fill {
  background-color: var(--color-text-primary);
  color: var(--color-bg-primary);
}

.btn-dark-fill:hover:not(:disabled) {
  opacity: 0.9;
}

/* Dark Weak */
.btn-dark-weak {
  background-color: rgba(0, 0, 0, 0.05);
  color: var(--color-text-primary);
}

.btn-dark-weak:hover:not(:disabled) {
  background-color: rgba(0, 0, 0, 0.1);
}

/* ===== States ===== */
.btn-disabled {
  opacity: 0.4;
  cursor: not-allowed;
  pointer-events: none;
}

.btn-loading {
  cursor: wait;
  color: transparent !important;
}

.btn-loading .btn-text,
.btn-loading .btn-icon {
  visibility: hidden;
}

.btn-icon-only {
  aspect-ratio: 1;
  padding: 0;
}

/* ===== Inner Elements ===== */
.btn-loader {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-icon {
  flex-shrink: 0;
}

.btn-text {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
}
</style>
