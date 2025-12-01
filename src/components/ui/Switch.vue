<template>
  <button
    type="button"
    role="switch"
    :aria-checked="modelValue"
    :class="switchClasses"
    :disabled="disabled"
    @click="toggle"
  >
    <span :class="thumbClasses" />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '@/utils';

interface Props {
  modelValue?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

interface Emits {
  'update:modelValue': [value: boolean];
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  disabled: false,
  size: 'md',
});

const emit = defineEmits<Emits>();

const toggle = () => {
  if (!props.disabled) {
    emit('update:modelValue', !props.modelValue);
  }
};

const sizeClasses = computed(() => {
  const sizes = {
    sm: 'w-8 h-[18px]',
    md: 'w-10 h-[22px]',
    lg: 'w-12 h-[26px]',
  };
  return sizes[props.size];
});

const thumbSizeClasses = computed(() => {
  const sizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-[18px] h-[18px]',
    lg: 'w-[22px] h-[22px]',
  };
  return sizes[props.size];
});

const thumbTranslateClasses = computed(() => {
  if (!props.modelValue) return 'translate-x-0.5';

  const translates = {
    sm: 'translate-x-[14px]',
    md: 'translate-x-[18px]',
    lg: 'translate-x-[22px]',
  };
  return translates[props.size];
});

const switchClasses = computed(() => {
  return cn(
    'relative inline-flex items-center rounded-full transition-colors duration-200 cursor-pointer border-0',
    sizeClasses.value,
    {
      'bg-brand': props.modelValue,
      'bg-gray-300 dark:bg-gray-600': !props.modelValue,
      'opacity-50 cursor-not-allowed': props.disabled,
    }
  );
});

const thumbClasses = computed(() => {
  return cn(
    'inline-block rounded-full bg-white shadow-sm transition-transform duration-200',
    thumbSizeClasses.value,
    thumbTranslateClasses.value
  );
});
</script>
