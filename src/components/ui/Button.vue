<template>
  <button
    :class="buttonClasses"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <div v-if="loading" :class="spinnerClasses">
      <div class="spinner"></div>
    </div>

    <component v-if="icon && !loading" :is="icon" :style="{ width: iconSize + 'px', height: iconSize + 'px' }" class="flex-shrink-0" />

    <span v-if="!loading && !iconOnly" class="slot-content">
      <slot />
    </span>
    <slot v-else-if="!loading && iconOnly" />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '@/utils';

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

const baseClasses = 'inline-flex items-center justify-center gap-2 font-semibold cursor-pointer whitespace-nowrap btn-base';

const sizeClasses = computed(() => {
  const sizes = {
    sm: 'btn-sm',
    md: 'btn-md',
    lg: 'btn-lg',
  };
  return sizes[props.size];
});

const variantClasses = computed(() => {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
    danger: 'btn-danger',
  };
  return variants[props.variant];
});

const stateClasses = computed(() => {
  return cn({
    'btn-disabled': props.disabled,
    'btn-loading': props.loading,
    'btn-icon-only': props.iconOnly,
  });
});

const buttonClasses = computed(() => {
  return cn(baseClasses, sizeClasses.value, variantClasses.value, stateClasses.value);
});

const spinnerClasses = 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event);
  }
};
</script>

<style scoped>
.btn-base {
  transition: background-color var(--transition-fast),
              border-color var(--transition-fast),
              box-shadow var(--transition-fast),
              transform var(--transition-fast);
}

.btn-base:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* Sizes */
.btn-sm {
  height: 36px;
  padding: 0 var(--space-4);
  font-size: var(--text-sm);
  border-radius: var(--radius-sm);
}

.btn-md {
  height: 44px;
  padding: 0 var(--space-5);
  font-size: var(--text-base);
  border-radius: var(--radius-md);
}

.btn-lg {
  height: 52px;
  padding: 0 var(--space-6);
  font-size: var(--text-lg);
  border-radius: var(--radius-lg);
}

/* Variants */
.btn-primary {
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
  border: 1px solid var(--color-primary);
  box-shadow: var(--shadow-sm);
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--color-primary-hover);
  border-color: var(--color-primary-hover);
  box-shadow: var(--shadow-primary), var(--shadow-md);
  transform: translateY(-1px);
}

.btn-primary:active:not(:disabled) {
  background-color: var(--color-primary-active);
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
}

.btn-secondary {
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border-secondary);
  box-shadow: var(--shadow-sm);
}

.btn-secondary:hover:not(:disabled) {
  background-color: var(--color-bg-secondary);
  border-color: var(--color-primary);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.btn-secondary:active:not(:disabled) {
  background-color: var(--color-bg-tertiary);
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
}

.btn-ghost {
  background-color: transparent;
  color: var(--color-text-secondary);
  border: 1px solid transparent;
}

.btn-ghost:hover:not(:disabled) {
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  border-color: var(--color-border-primary);
  box-shadow: var(--shadow-sm);
}

.btn-ghost:active:not(:disabled) {
  background-color: var(--color-border-primary);
}

.btn-danger {
  background-color: var(--color-urgent);
  color: var(--color-text-inverse);
  border: 1px solid var(--color-urgent);
  box-shadow: var(--shadow-sm);
}

.btn-danger:hover:not(:disabled) {
  background-color: var(--color-urgent-hover);
  border-color: var(--color-urgent-hover);
  box-shadow: var(--shadow-urgent), var(--shadow-md);
  transform: translateY(-1px);
}

.btn-danger:active:not(:disabled) {
  background-color: var(--color-urgent-active);
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
}

/* States */
.btn-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-loading {
  cursor: not-allowed;
  color: transparent;
}

.btn-icon-only {
  aspect-ratio: 1;
  padding: 0;
}

.slot-content {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

/* Spinner */
.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  opacity: 0.3;
}

.btn-loading .spinner {
  color: var(--color-text-inverse);
  opacity: 1;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
