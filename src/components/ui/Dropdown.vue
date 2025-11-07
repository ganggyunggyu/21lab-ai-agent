<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

interface Option {
  label?: string;
  key: string;
  disabled?: boolean;
  type?: 'divider';
}

interface Props {
  options: Option[];
  trigger?: 'click' | 'hover';
}

interface Emits {
  select: [key: string];
}

const props = withDefaults(defineProps<Props>(), {
  trigger: 'click',
});

const emit = defineEmits<Emits>();

const isOpen = ref(false);
const triggerRef = ref<HTMLElement | null>(null);
const dropdownPosition = ref({ top: 0, left: 0 });

const updateDropdownPosition = () => {
  if (!triggerRef.value) return;

  const rect = triggerRef.value.getBoundingClientRect();
  const dropdownWidth = 192; // w-48 = 12rem = 192px

  dropdownPosition.value = {
    top: rect.bottom + 8,
    left: rect.right - dropdownWidth,
  };
};

const handleSelect = (option: Option) => {
  if (option.disabled || option.type === 'divider') return;
  emit('select', option.key);
  isOpen.value = false;
};

const toggleDropdown = () => {
  if (props.trigger === 'click') {
    if (!isOpen.value) {
      updateDropdownPosition();
    }
    isOpen.value = !isOpen.value;
  }
};

const handleMouseEnter = () => {
  if (props.trigger === 'hover') {
    updateDropdownPosition();
    isOpen.value = true;
  }
};

const handleMouseLeave = () => {
  if (props.trigger === 'hover') {
    isOpen.value = false;
  }
};

// 외부 클릭 시 닫기
const handleClickOutside = (e: MouseEvent) => {
  const target = e.target as HTMLElement;
  if (!target.closest('.dropdown-wrapper') && !target.closest('.dropdown-menu')) {
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
  <div
    ref="triggerRef"
    class="dropdown-wrapper relative inline-block"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <div @click.stop="toggleDropdown">
      <slot />
    </div>

    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 scale-95 -translate-y-2"
        enter-to-class="opacity-100 scale-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 scale-100 translate-y-0"
        leave-to-class="opacity-0 scale-95 -translate-y-2"
      >
        <div
          v-if="isOpen"
          class="dropdown-menu fixed w-48 bg-white dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-600/40 shadow-lg dark:shadow-black/50 overflow-hidden z-[9999]"
          :style="{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
          }"
        >
          <div
            v-for="(option, index) in options"
            :key="index"
            :class="[
              option.type === 'divider'
                ? 'h-px bg-slate-200 dark:bg-gray-600 my-1'
                : 'px-4 py-2.5 text-sm cursor-pointer transition-colors duration-150 text-gray-900 dark:text-gray-100',
              option.disabled
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-slate-50 dark:hover:bg-gray-700/50',
            ]"
            @click="handleSelect(option)"
          >
            {{ option.type === 'divider' ? '' : option.label }}
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
