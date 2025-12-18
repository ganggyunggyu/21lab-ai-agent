<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue';

/**
 * TDS TextField 패턴 기반 Input 컴포넌트
 *
 * @prop label - 입력 필드 라벨
 * @prop helperText - 하단 도움말/에러 메시지
 * @prop status - 상태 (success, warning, error)
 * @prop size - 크기 (sm, md, lg)
 */

interface Props {
  modelValue: string;
  type?: 'text' | 'textarea' | 'password';
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  clearable?: boolean;
  showPasswordOn?: 'click' | 'mousedown';
  maxlength?: number;
  minlength?: number;
  rows?: number;
  autosize?: boolean | { minRows?: number; maxRows?: number };
  size?: 'sm' | 'md' | 'lg';
  round?: boolean;
  status?: 'success' | 'warning' | 'error';
  loading?: boolean;
  class?: string;
  style?: string;
  label?: string;
  helperText?: string;
  required?: boolean;

  preventEnterSubmit?: boolean;
  onEnter?: (value: string) => void;
  onShiftEnter?: (value: string) => void;
  onKeydown?: (e: KeyboardEvent) => void;
}

interface Emits {
  'update:modelValue': [value: string];
  blur: [e: FocusEvent];
  focus: [e: FocusEvent];
  clear: [];
  input: [value: string];
  keydown: [e: KeyboardEvent];
  keyup: [e: KeyboardEvent];
  keypress: [e: KeyboardEvent];
  compositionStart: [e: CompositionEvent];
  compositionUpdate: [e: CompositionEvent];
  compositionEnd: [e: CompositionEvent];
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  placeholder: '',
  disabled: false,
  readonly: false,
  clearable: false,
  showPasswordOn: 'click',
  size: 'md',
  round: false,
  loading: false,
  preventEnterSubmit: false,
  required: false,
});

const emit = defineEmits<Emits>();

const isComposing = ref(false);
const composingValue = ref('');
const isFocused = ref(false);

const localValue = ref(props.modelValue);

watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue !== localValue.value) {
      localValue.value = newValue;
    }
  }
);

watch(localValue, (newValue) => {
  emit('update:modelValue', newValue);
});

const sizeClass = computed(() => {
  const sizes = {
    sm: 'input-sm',
    md: 'input-md',
    lg: 'input-lg',
  };
  return sizes[props.size];
});

const statusClass = computed(() => {
  if (!props.status) return '';
  const statuses = {
    success: 'input-success',
    warning: 'input-warning',
    error: 'input-error',
  };
  return statuses[props.status];
});

const inputClasses = computed(() => [
  'input-base',
  sizeClass.value,
  statusClass.value,
  props.type === 'textarea' && 'input-textarea',
  props.disabled && 'input-disabled',
  isFocused.value && 'input-focused',
  props.class,
]);

const handleCompositionStart = (e: CompositionEvent) => {
  isComposing.value = true;
  composingValue.value = localValue.value;
  emit('compositionStart', e);
};

const handleCompositionUpdate = (e: CompositionEvent) => {
  emit('compositionUpdate', e);
};

const handleCompositionEnd = (e: CompositionEvent) => {
  isComposing.value = false;

  nextTick(() => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement;
    if (target) {
      localValue.value = target.value;
    }
  });

  emit('compositionEnd', e);
};

const handleInput = (value: string) => {
  if (!isComposing.value) {
    localValue.value = value;
  }
  emit('input', value);
};

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    if (isComposing.value || e.isComposing) {
      emit('keydown', e);
      return;
    }

    if (props.preventEnterSubmit) {
      e.preventDefault();
    }

    if (e.shiftKey) {
      props.onShiftEnter?.(localValue.value);
    } else {
      if (props.onEnter) {
        e.preventDefault();
        props.onEnter(localValue.value);
      }
    }
  }

  props.onKeydown?.(e);
  emit('keydown', e);
};

const handleKeyup = (e: KeyboardEvent) => {
  emit('keyup', e);
};

const handleKeypress = (e: KeyboardEvent) => {
  emit('keypress', e);
};

const handleFocus = (e: FocusEvent) => {
  isFocused.value = true;
  emit('focus', e);
};

const handleBlur = (e: FocusEvent) => {
  isFocused.value = false;
  emit('blur', e);
};
</script>

<template>
  <div class="input-wrapper">
    <!-- 라벨 -->
    <label v-if="label" class="input-label">
      {{ label }}
      <span v-if="required" class="input-required">*</span>
    </label>

    <!-- Textarea -->
    <textarea
      v-if="type === 'textarea'"
      v-model="localValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :maxlength="maxlength"
      :minlength="minlength"
      :rows="rows"
      :class="inputClasses"
      :style="props.style"
      @input="handleInput(($event.target as HTMLTextAreaElement).value)"
      @keydown="handleKeydown"
      @keyup="handleKeyup"
      @keypress="handleKeypress"
      @focus="handleFocus"
      @blur="handleBlur"
      @compositionstart="handleCompositionStart"
      @compositionupdate="handleCompositionUpdate"
      @compositionend="handleCompositionEnd"
    />

    <!-- Input -->
    <input
      v-else
      v-model="localValue"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :maxlength="maxlength"
      :minlength="minlength"
      :class="inputClasses"
      :style="props.style"
      @input="handleInput(($event.target as HTMLInputElement).value)"
      @keydown="handleKeydown"
      @keyup="handleKeyup"
      @keypress="handleKeypress"
      @focus="handleFocus"
      @blur="handleBlur"
      @compositionstart="handleCompositionStart"
      @compositionupdate="handleCompositionUpdate"
      @compositionend="handleCompositionEnd"
    />

    <!-- 헬퍼 텍스트 -->
    <p v-if="helperText" :class="['input-helper', status && `input-helper-${status}`]">
      {{ helperText }}
    </p>
  </div>
</template>

<style scoped>
.input-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  width: 100%;
}

.input-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.input-required {
  color: var(--color-urgent);
  margin-left: 2px;
}

.input-base {
  width: 100%;
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-size: var(--text-base);
  line-height: var(--leading-normal);
  transition:
    border-color 0.2s cubic-bezier(0.2, 0.8, 0.2, 1),
    box-shadow 0.2s cubic-bezier(0.2, 0.8, 0.2, 1),
    background-color 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.input-base::placeholder {
  color: var(--color-text-disabled);
}

.input-base:hover:not(:disabled):not(.input-error):not(.input-focused) {
  border-color: var(--color-border-secondary);
}

.input-base:focus,
.input-focused {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

/* Sizes */
.input-sm {
  height: 36px;
  padding: 0 var(--space-3);
  font-size: 13px;
}

.input-md {
  height: 44px;
  padding: 0 var(--space-4);
  font-size: 14px;
}

.input-lg {
  height: 52px;
  padding: 0 var(--space-5);
  font-size: 15px;
}

/* Textarea */
.input-textarea {
  height: auto;
  min-height: 100px;
  padding: var(--space-3) var(--space-4);
  resize: none;
}

.input-textarea.input-sm {
  padding: var(--space-2) var(--space-3);
  min-height: 80px;
}

.input-textarea.input-lg {
  padding: var(--space-4) var(--space-5);
  min-height: 120px;
}

/* Status */
.input-success {
  border-color: var(--color-success);
}

.input-success:focus,
.input-success.input-focused {
  border-color: var(--color-success);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
}

.input-warning {
  border-color: var(--color-warning);
}

.input-warning:focus,
.input-warning.input-focused {
  border-color: var(--color-warning);
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.15);
}

.input-error {
  border-color: var(--color-urgent);
}

.input-error:focus,
.input-error.input-focused {
  border-color: var(--color-urgent);
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
}

/* Disabled */
.input-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: var(--color-bg-tertiary);
}

/* Helper Text */
.input-helper {
  font-size: 12px;
  color: var(--color-text-tertiary);
  margin: 0;
}

.input-helper-success {
  color: var(--color-success);
}

.input-helper-warning {
  color: var(--color-warning);
}

.input-helper-error {
  color: var(--color-urgent);
}
</style>
