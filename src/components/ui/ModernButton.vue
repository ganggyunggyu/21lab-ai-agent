<template>
  <button
    :class="[
      'modern-btn',
      `modern-btn--${variant}`,
      `modern-btn--${size}`,
      {
        'modern-btn--loading': loading,
        'modern-btn--disabled': disabled,
        'modern-btn--icon-only': iconOnly,
      },
    ]"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <div v-if="loading" class="modern-btn__spinner">
      <div class="spinner"></div>
    </div>

    <n-icon v-if="icon && !loading" :size="iconSize" class="modern-btn__icon">
      <component :is="icon" />
    </n-icon>

    <span v-if="!iconOnly && !loading" class="modern-btn__text">
      <slot />
    </span>
  </button>
</template>

<script setup lang="ts">
import { NIcon } from 'naive-ui';
import { computed } from 'vue';

interface Props {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: any;
  iconOnly?: boolean;
}

interface Emits {
  click: [event: MouseEvent];
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  loading: false,
  disabled: false,
  iconOnly: false,
});

const emit = defineEmits<Emits>();

const iconSize = computed(() => {
  const sizes = { sm: 16, md: 20, lg: 24 };
  return sizes[props.size];
});

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event);
  }
};
</script>

<style scoped>
.modern-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: inherit;
  overflow: hidden;
  white-space: nowrap;
}

.modern-btn:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Sizes */
.modern-btn--sm {
  height: 36px;
  padding: 0 16px;
  font-size: 14px;
  border-radius: 8px;
}

.modern-btn--md {
  height: 44px;
  padding: 0 20px;
  font-size: 16px;
}

.modern-btn--lg {
  height: 52px;
  padding: 0 24px;
  font-size: 18px;
  border-radius: 16px;
}

.modern-btn--icon-only {
  aspect-ratio: 1;
  padding: 0;
}

/* Variants */
.modern-btn--primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.modern-btn--primary:hover:not(.modern-btn--disabled):not(
    .modern-btn--loading
  ) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
}

.modern-btn--secondary {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);

  border: 1px solid rgba(255, 255, 255, 0.2);
}

.modern-btn--secondary:hover:not(.modern-btn--disabled):not(
    .modern-btn--loading
  ) {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

.modern-btn--ghost {
  background: transparent;
  color: #94a3b8;
  border: 1px solid rgba(148, 163, 184, 0.3);
}

.modern-btn--ghost:hover:not(.modern-btn--disabled):not(.modern-btn--loading) {
  background: rgba(148, 163, 184, 0.1);

  border-color: rgba(148, 163, 184, 0.5);
}

.modern-btn--danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);

  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.modern-btn--danger:hover:not(.modern-btn--disabled):not(.modern-btn--loading) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(239, 68, 68, 0.4);
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
}

/* States */
.modern-btn--disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

.modern-btn--loading {
  cursor: not-allowed;
  color: transparent;
}

.modern-btn__spinner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.modern-btn__icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.modern-btn__text {
  font-weight: inherit;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Active state */
.modern-btn:active:not(.modern-btn--disabled):not(.modern-btn--loading) {
  transform: translateY(0) scale(0.98);
}

/* Ripple effect */
.modern-btn::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  transform: translate(-50%, -50%);
  transition: width 0.3s, height 0.3s;
}

.modern-btn:active::before {
  width: 300px;
  height: 300px;
}
</style>
