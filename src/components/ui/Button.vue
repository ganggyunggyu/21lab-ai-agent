<template>
  <button
    :class="buttonClasses"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <div v-if="loading" :class="spinnerClasses">
      <div class="w-5 h-5 border-2 border-white/30 border-t-current rounded-full animate-spin"></div>
    </div>

    <component v-if="icon && !loading" :is="icon" :style="{ width: iconSize + 'px', height: iconSize + 'px' }" class="flex-shrink-0" />

    <span v-if="!iconOnly && !loading" class="font-inherit">
      <slot />
    </span>
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

const baseClasses = 'relative inline-flex items-center justify-center gap-2 border-none font-semibold cursor-pointer transition-all duration-200 ease-in-out font-inherit overflow-hidden whitespace-nowrap focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2 before:content-[""] before:absolute before:top-1/2 before:left-1/2 before:w-0 before:h-0 before:rounded-full before:bg-white/20 before:-translate-x-1/2 before:-translate-y-1/2 before:transition-all before:duration-300 active:before:w-[300px] active:before:h-[300px]';

const sizeClasses = computed(() => {
  const sizes = {
    sm: 'h-9 px-4 text-sm rounded-lg',
    md: 'h-11 px-5 text-base rounded-xl',
    lg: 'h-13 px-6 text-lg rounded-2xl',
  };
  return sizes[props.size];
});

const variantClasses = computed(() => {
  const variants = {
    primary: 'bg-gradient-to-br from-blue-500 to-blue-800 dark:from-blue-600 dark:to-blue-900 shadow-lg dark:shadow-blue-900/50 hover:shadow-xl text-white',
    secondary: 'bg-white/10 dark:bg-gray-700/30 backdrop-blur-[10px] border border-white/20 dark:border-gray-600/40 hover:bg-white/15 dark:hover:bg-gray-700/50 text-white dark:text-gray-100',
    ghost: 'bg-transparent text-slate-400 dark:text-gray-400 border border-slate-400/30 dark:border-gray-600/40 hover:bg-slate-400/10 dark:hover:bg-gray-700/30 hover:border-slate-400/50 dark:hover:border-gray-500/60',
    danger: 'bg-gradient-to-br from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 shadow-lg dark:shadow-red-900/50 hover:shadow-xl text-white',
  };
  return variants[props.variant];
});

const stateClasses = computed(() => {
  return cn({
    'opacity-50 cursor-not-allowed transform-none! shadow-none!': props.disabled,
    'cursor-not-allowed text-transparent': props.loading,
    'aspect-square p-0': props.iconOnly,
    'hover:-translate-y-0.5': !props.disabled && !props.loading && (props.variant === 'primary' || props.variant === 'danger'),
    'hover:-translate-y-px': !props.disabled && !props.loading && props.variant === 'secondary',
    'active:translate-y-0 active:scale-[0.98]': !props.disabled && !props.loading,
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
