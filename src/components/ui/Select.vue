<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { ChevronDown as ChevronDownIcon } from '@vicons/ionicons5';

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

const sizeClass = computed(() => {
  const sizes = {
    sm: 'select-sm',
    md: 'select-md',
    lg: 'select-lg',
  };
  return sizes[props.size];
});

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

const handleClickOutside = (e: MouseEvent) => {
  const target = e.target as HTMLElement;
  if (!target.closest('.select-wrapper') && !target.closest('.select-dropdown')) {
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
  <div class="select-wrapper" ref="triggerRef" @click.stop="toggleDropdown">
    <div :class="['select-trigger', sizeClass, isOpen && 'select-open']">
      <span class="select-label">
        {{ selectedOption?.label || placeholder }}
      </span>
      <ChevronDownIcon :class="['select-icon', isOpen && 'select-icon-open']" />
    </div>

    <Teleport to="body">
      <Transition
        enter-active-class="select-enter-active"
        enter-from-class="select-enter-from"
        enter-to-class="select-enter-to"
        leave-active-class="select-leave-active"
        leave-from-class="select-enter-to"
        leave-to-class="select-enter-from"
      >
        <div
          v-if="isOpen"
          class="select-dropdown"
          :style="{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`,
          }"
        >
          <div
            v-for="option in options"
            :key="option.value"
            :class="['select-option', option.value === modelValue && 'select-option-selected']"
            @click.stop="handleSelect(option.value)"
          >
            {{ option.label }}
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.select-wrapper {
  position: relative;
}

.select-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-md);
  cursor: pointer;
  user-select: none;
  transition: border-color var(--transition-fast),
              box-shadow var(--transition-fast);
}

.select-trigger:hover {
  border-color: var(--color-primary);
}

.select-open {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(98, 194, 176, 0.15);
}

/* Sizes */
.select-sm {
  min-width: 130px;
  font-size: var(--text-sm);
}

.select-md {
  min-width: 150px;
  font-size: var(--text-base);
}

.select-lg {
  min-width: 170px;
  font-size: var(--text-lg);
}

.select-label {
  font-weight: var(--font-medium);
  color: var(--color-text-primary);
  white-space: nowrap;
}

.select-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  color: var(--color-text-tertiary);
  transition: transform var(--transition-fast);
}

.select-icon-open {
  transform: rotate(180deg);
}

/* Dropdown */
.select-dropdown {
  position: fixed;
  z-index: 9999;
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

.select-option {
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--color-text-primary);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.select-option:hover {
  background-color: var(--color-bg-secondary);
}

.select-option-selected {
  background-color: rgba(98, 194, 176, 0.1);
  color: var(--color-primary);
}

.select-option-selected:hover {
  background-color: rgba(98, 194, 176, 0.15);
}

/* Transitions */
.select-enter-active,
.select-leave-active {
  transition: opacity var(--transition-fast), transform var(--transition-fast);
}

.select-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}

.select-enter-to {
  opacity: 1;
  transform: translateY(0);
}
</style>
