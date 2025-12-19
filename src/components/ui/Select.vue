<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { ChevronDown as ChevronDownIcon, Search as SearchIcon } from '@vicons/ionicons5';

interface Option {
  label: string;
  value: string;
  description?: string;
}

interface Props {
  modelValue: string;
  options: Option[];
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
  searchable?: boolean;
  maxHeight?: number;
}

interface Emits {
  'update:modelValue': [value: string];
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '선택하세요',
  size: 'md',
  searchable: false,
  maxHeight: 300,
});

const emit = defineEmits<Emits>();

const isOpen = ref(false);
const triggerRef = ref<HTMLElement | null>(null);
const searchInputRef = ref<HTMLInputElement | null>(null);
const dropdownPosition = ref({ top: 0, left: 0, width: 0 });
const searchQuery = ref('');
const hoveredValue = ref<string | null>(null);

const selectedOption = computed(() => {
  return props.options.find((opt) => opt.value === props.modelValue);
});

const filteredOptions = computed(() => {
  if (!props.searchable || !searchQuery.value.trim()) {
    return props.options;
  }
  const query = searchQuery.value.toLowerCase().trim();
  return props.options.filter(
    (opt) =>
      opt.label.toLowerCase().includes(query) ||
      opt.value.toLowerCase().includes(query)
  );
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
  const dropdownWidth = props.searchable ? Math.max(rect.width, 250) : rect.width;
  dropdownPosition.value = {
    top: rect.bottom + 4,
    left: rect.left,
    width: dropdownWidth,
  };
};

const handleSelect = (value: string) => {
  emit('update:modelValue', value);
  isOpen.value = false;
  searchQuery.value = '';
};

const toggleDropdown = () => {
  if (!isOpen.value) {
    updateDropdownPosition();
  }
  isOpen.value = !isOpen.value;
};

watch(isOpen, async (open) => {
  if (open && props.searchable) {
    await nextTick();
    searchInputRef.value?.focus();
  }
  if (!open) {
    searchQuery.value = '';
  }
});

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
          <div v-if="searchable" class="select-search">
            <SearchIcon class="select-search-icon" />
            <input
              ref="searchInputRef"
              v-model="searchQuery"
              type="text"
              placeholder="검색..."
              class="select-search-input"
              @click.stop
            />
          </div>
          <div
            class="select-options"
            :style="{ maxHeight: `${maxHeight}px` }"
          >
            <div
              v-for="option in filteredOptions"
              :key="option.value"
              :class="['select-option', option.value === modelValue && 'select-option-selected']"
              @click.stop="handleSelect(option.value)"
              @mouseenter="hoveredValue = option.value"
              @mouseleave="hoveredValue = null"
            >
              <span class="select-option-label">{{ option.label }}</span>
              <Transition name="desc">
                <span
                  v-if="option.description && hoveredValue === option.value"
                  class="select-option-desc"
                >
                  {{ option.description }}
                </span>
              </Transition>
            </div>
            <div v-if="searchable && filteredOptions.length === 0" class="select-empty">
              검색 결과가 없습니다
            </div>
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

/* Search */
.select-search {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3);
  border-bottom: 1px solid var(--color-border-primary);
  background-color: var(--color-bg-secondary);
}

.select-search-icon {
  width: 16px;
  height: 16px;
  color: var(--color-text-tertiary);
  flex-shrink: 0;
}

.select-search-input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: var(--text-sm);
  color: var(--color-text-primary);
}

.select-search-input::placeholder {
  color: var(--color-text-tertiary);
}

.select-options {
  overflow-y: auto;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
}

.select-options::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

.select-empty {
  padding: var(--space-4);
  text-align: center;
  font-size: var(--text-sm);
  color: var(--color-text-tertiary);
}

.select-option {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--color-text-primary);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.select-option-label {
  line-height: 1.4;
}

.select-option-desc {
  font-size: var(--text-xs);
  font-weight: var(--font-normal);
  color: var(--color-text-tertiary);
  line-height: 1.3;
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

/* Description transition */
.desc-enter-active,
.desc-leave-active {
  transition: opacity 0.15s ease, max-height 0.15s ease;
  overflow: hidden;
}

.desc-enter-from,
.desc-leave-to {
  opacity: 0;
  max-height: 0;
}

.desc-enter-to,
.desc-leave-from {
  opacity: 1;
  max-height: 40px;
}
</style>
