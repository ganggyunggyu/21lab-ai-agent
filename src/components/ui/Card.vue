<template>
  <div :class="cardClasses">
    <div v-if="$slots.header" :class="headerClasses">
      <slot name="header" />
    </div>

    <div :class="bodyClasses">
      <slot />
    </div>

    <div v-if="$slots.footer" :class="footerClasses">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '@/utils';

interface Props {
  variant?: 'default' | 'glass' | 'solid' | 'gradient';
  hoverable?: boolean;
  bordered?: boolean;
  elevated?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  hoverable: false,
  bordered: false,
  elevated: false,
});

const baseClasses = 'rounded-2xl md:rounded-xl xs:rounded-lg overflow-hidden transition-all duration-300 ease-in-out relative md:mx-2 xs:mx-1';

const variantClasses = computed(() => {
  const variants = {
    default: 'bg-white/90 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200 dark:border-slate-400/10 text-gray-900 dark:text-gray-100',
    glass: 'bg-white/5 dark:bg-white/5 backdrop-blur-xl border border-slate-200/30 dark:border-white/10 text-gray-900 dark:text-gray-100',
    solid: 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-gray-900 dark:text-gray-100',
    gradient: 'bg-gradient-to-br from-blue-50 to-emerald-50 dark:from-blue-500/10 dark:to-emerald-500/10 backdrop-blur-xl border border-blue-200 dark:border-blue-500/20 text-gray-900 dark:text-gray-100',
  };
  return variants[props.variant];
});

const stateClasses = computed(() => {
  return cn({
    'border-2': props.bordered,
    'shadow-lg dark:shadow-black/50': props.elevated,
    'hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-black/80 xs:hover:-translate-y-0.5': props.hoverable,
    'hover:bg-white/10 dark:hover:bg-white/8 hover:border-slate-300 dark:hover:border-white/15': props.hoverable && props.variant === 'glass',
    'hover:from-blue-100 hover:to-emerald-100 dark:hover:from-blue-500/15 dark:hover:to-emerald-500/15 hover:border-blue-300 dark:hover:border-blue-500/30': props.hoverable && props.variant === 'gradient',
  });
});

const cardClasses = computed(() => {
  return cn(baseClasses, variantClasses.value, stateClasses.value);
});

const headerClasses = 'pt-5 px-6 pb-0 border-b border-slate-200 dark:border-slate-400/10 mb-5 pb-4 md:pt-4 md:px-5 md:mb-4 md:pb-3 xs:pt-3 xs:px-4 xs:mb-3 xs:pb-2.5';

const bodyClasses = 'p-6 md:p-5 md:text-base md:leading-relaxed xs:p-4 xs:text-base xs:leading-relaxed';

const footerClasses = 'px-6 pb-5 pt-0 border-t border-slate-200 dark:border-slate-400/10 mt-5 pt-4 md:px-5 md:pb-4 md:mt-4 md:pt-3 xs:px-4 xs:pb-3 xs:mt-3 xs:pt-2.5';
</script>
