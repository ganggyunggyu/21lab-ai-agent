<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { ChevronDown as ChevronDownIcon } from '@vicons/ionicons5';
import { cn } from '@/utils';

interface Option {
  label: string;
  value: string;
}

interface Props {
  modelValue: string;
  options: Option[];
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
}

interface Emits {
  'update:modelValue': [value: string];
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '선택하세요',
  size: 'md',
});

const emit = defineEmits<Emits>();

const isOpen = ref(false);
const triggerRef = ref<HTMLElement | null>(null);
const dropdownPosition = ref({ top: 0, left: 0, width: 0 });

const selectedOption = computed(() => {
  return props.options.find((opt) => opt.value === props.modelValue);
});

const selectClasses = computed(() => {
  return cn(
    'relative inline-flex items-center justify-between gap-2 px-4 py-2 rounded-xl border transition-all duration-200',
    'bg-white/95 dark:bg-gray-800/95 border-indigo-500/20 dark:border-gray-600/40 shadow-lg dark:shadow-black/50',
    'hover:border-indigo-500/40 dark:hover:border-gray-500/60 hover:-translate-y-px',
    'cursor-pointer select-none text-gray-900 dark:text-gray-100',
    {
      'text-sm min-w-[100px]': props.size === 'sm',
      'text-base min-w-[120px]': props.size === 'md',
      'text-lg min-w-[140px]': props.size === 'lg',
      'border-indigo-500/40 dark:border-gray-500/60': isOpen.value,
    }
  );
});

const optionClasses = 'px-4 py-2 transition-colors duration-150 cursor-pointer hover:bg-indigo-500/10 dark:hover:bg-gray-700/50 text-sm font-medium text-gray-900 dark:text-gray-100';

const updateDropdownPosition = () => {
  if (!triggerRef.value) return;

  const rect = triggerRef.value.getBoundingClientRect();
  dropdownPosition.value = {
    top: rect.bottom + 4,
    left: rect.left,
    width: rect.width,
  };
};

const handleSelect = (value: string) => {
  emit('update:modelValue', value);
  isOpen.value = false;
};

const toggleDropdown = () => {
  if (!isOpen.value) {
    updateDropdownPosition();
  }
  isOpen.value = !isOpen.value;
};

// 외부 클릭 시 닫기
const handleClickOutside = (e: MouseEvent) => {
  const target = e.target as HTMLElement;
  if (!target.closest('.select-wrapper') && !target.closest('.select-dropdown')) {
    isOpen.value = false;
  }
};

// 스크롤 시 위치 업데이트
const handleScroll = () => {
  if (isOpen.value) {
    updateDropdownPosition();
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  window.addEventListener('scroll', handleScroll, true);
  window.addEventListener('resize', handleScroll);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  window.removeEventListener('scroll', handleScroll, true);
  window.removeEventListener('resize', handleScroll);
});
</script>

<template>
  <div class="select-wrapper relative" ref="triggerRef" @click.stop="toggleDropdown">
    <div :class="selectClasses">
      <span class="font-semibold">
        {{ selectedOption?.label || placeholder }}
      </span>
      <ChevronDownIcon
        :class="cn('w-4 h-4 transition-transform duration-200 flex-shrink-0', { 'rotate-180': isOpen })"
      />
    </div>

    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <div
          v-if="isOpen"
          class="select-dropdown fixed z-[9999] bg-white dark:bg-gray-800 rounded-xl border border-indigo-500/20 dark:border-gray-600/40 shadow-lg dark:shadow-black/50 overflow-hidden animate-[slideDown_0.2s_ease-out]"
          :style="{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`,
          }"
        >
          <div
            v-for="option in options"
            :key="option.value"
            :class="cn(optionClasses, {
              'bg-indigo-500/15 text-indigo-600 dark:bg-gray-700/70 dark:text-gray-100': option.value === modelValue,
            })"
            @click.stop="handleSelect(option.value)"
          >
            {{ option.label }}
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style>
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
