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
  const dropdownWidth = 192;

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

const handleClickOutside = (e: MouseEvent) => {
  const target = e.target as HTMLElement;
  if (!target.closest('.dropdown-wrapper') && !target.closest('.dropdown-menu')) {
    isOpen.value = false;
  }
};

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
    class="dropdown-wrapper"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <div @click.stop="toggleDropdown">
      <slot />
    </div>

    <Teleport to="body">
      <Transition
        enter-active-class="dropdown-enter-active"
        enter-from-class="dropdown-enter-from"
        enter-to-class="dropdown-enter-to"
        leave-active-class="dropdown-leave-active"
        leave-from-class="dropdown-enter-to"
        leave-to-class="dropdown-enter-from"
      >
        <div
          v-if="isOpen"
          class="dropdown-menu"
          :style="{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
          }"
        >
          <div
            v-for="(option, index) in options"
            :key="index"
            :class="[
              'dropdown-item',
              option.type === 'divider' && 'dropdown-divider',
              option.disabled && 'dropdown-item-disabled',
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

<style scoped>
.dropdown-wrapper {
  position: relative;
  display: inline-block;
}

.dropdown-menu {
  position: fixed;
  z-index: 9999;
  width: 192px;
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

.dropdown-item {
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-sm);
  color: var(--color-text-primary);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.dropdown-item:hover:not(.dropdown-divider):not(.dropdown-item-disabled) {
  background-color: var(--color-bg-secondary);
}

.dropdown-divider {
  height: 1px;
  margin: var(--space-1) 0;
  padding: 0;
  background-color: var(--color-border-primary);
}

.dropdown-item-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Transitions */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity var(--transition-fast), transform var(--transition-fast);
}

.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}

.dropdown-enter-to {
  opacity: 1;
  transform: translateY(0);
}
</style>
