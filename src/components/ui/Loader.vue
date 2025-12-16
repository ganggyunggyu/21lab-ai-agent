<script setup lang="ts">
import { computed } from 'vue';
import { Vue3Lottie } from 'vue3-lottie';
import loadingDotsAnimation from '@/assets/lottie/loading-dots.json';

interface Props {
  size?: 'small' | 'medium' | 'large';
  type?: 'primary' | 'dark' | 'light';
  label?: string;
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  type: 'primary',
});

const sizeMap = {
  small: { width: 40, height: 20 },
  medium: { width: 60, height: 30 },
  large: { width: 80, height: 40 },
};

const dimensions = computed(() => sizeMap[props.size]);

const labelSizeClass = computed(() => {
  const sizes = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base',
  };
  return sizes[props.size];
});

const colorClass = computed(() => {
  const colors = {
    primary: 'loader-primary',
    dark: 'loader-dark',
    light: 'loader-light',
  };
  return colors[props.type];
});
</script>

<template>
  <div :class="['loader-container', colorClass]" role="status" aria-label="로딩 중">
    <Vue3Lottie
      :animation-data="loadingDotsAnimation"
      :width="dimensions.width"
      :height="dimensions.height"
      :loop="true"
      :auto-play="true"
    />
    <span v-if="label" :class="['loader-label', labelSizeClass]">
      {{ label }}
    </span>
  </div>
</template>

<style scoped>
.loader-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
}

.loader-label {
  color: var(--color-text-secondary);
  text-align: center;
  white-space: pre-line;
}

.loader-primary {
  --loader-color: var(--color-primary);
}

.loader-dark {
  --loader-color: var(--color-text-primary);
}

.loader-light {
  --loader-color: var(--color-text-inverse);
}

.loader-light .loader-label {
  color: var(--color-text-inverse);
}
</style>
