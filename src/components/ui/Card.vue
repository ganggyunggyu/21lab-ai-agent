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
    default: 'bg-slate-800/80 backdrop-blur-xl border border-slate-400/10',
    glass: 'bg-white/5 backdrop-blur-xl border border-white/10',
    solid: 'bg-slate-800 border border-slate-600',
    gradient: 'bg-gradient-to-br from-blue-500/10 to-emerald-500/10 backdrop-blur-xl border border-blue-500/20',
  };
  return variants[props.variant];
});

const stateClasses = computed(() => {
  return cn({
    'border-2': props.bordered,
    'shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)]': props.elevated,
    'hover:-translate-y-1 hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] xs:hover:-translate-y-0.5': props.hoverable,
    'hover:bg-white/8 hover:border-white/15': props.hoverable && props.variant === 'glass',
    'hover:bg-gradient-to-br hover:from-blue-500/15 hover:to-emerald-500/15 hover:border-blue-500/30': props.hoverable && props.variant === 'gradient',
  });
});

const cardClasses = computed(() => {
  return cn(baseClasses, variantClasses.value, stateClasses.value);
});

const headerClasses = 'pt-5 px-6 pb-0 border-b border-slate-400/10 mb-5 pb-4 md:pt-4 md:px-5 md:mb-4 md:pb-3 xs:pt-3 xs:px-4 xs:mb-3 xs:pb-2.5';

const bodyClasses = 'p-6 md:p-5 md:text-base md:leading-relaxed xs:p-4 xs:text-base xs:leading-relaxed';

const footerClasses = 'px-6 pb-5 pt-0 border-t border-slate-400/10 mt-5 pt-4 md:px-5 md:pb-4 md:mt-4 md:pt-3 xs:px-4 xs:pb-3 xs:mt-3 xs:pt-2.5';
</script>
