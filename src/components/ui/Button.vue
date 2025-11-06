<template>
  <button
    :class="buttonClasses"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <div v-if="loading" :class="spinnerClasses">
      <div class="w-5 h-5 border-2 border-white/30 border-t-current rounded-full animate-spin"></div>
    </div>

    <n-icon v-if="icon && !loading" :size="iconSize" class="flex items-center justify-center">
      <component :is="icon" />
    </n-icon>

    <span v-if="!iconOnly && !loading" class="font-inherit">
      <slot />
    </span>
  </button>
</template>

<script setup lang="ts">
import { NIcon } from 'naive-ui';
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
    primary: 'bg-gradient-to-br from-blue-500 to-blue-800 shadow-[0_4px_12px_rgba(59,130,246,0.3)] hover:shadow-[0_8px_25px_rgba(59,130,246,0.4)] hover:bg-gradient-to-br hover:from-blue-600 hover:to-blue-900',
    secondary: 'bg-white/10 backdrop-blur-[10px] border border-white/20 hover:bg-white/15 hover:border-white/30',
    ghost: 'bg-transparent text-slate-400 border border-slate-400/30 hover:bg-slate-400/10 hover:border-slate-400/50',
    danger: 'bg-gradient-to-br from-red-500 to-red-600 shadow-[0_4px_12px_rgba(239,68,68,0.3)] hover:shadow-[0_8px_25px_rgba(239,68,68,0.4)] hover:bg-gradient-to-br hover:from-red-600 hover:to-red-700',
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
