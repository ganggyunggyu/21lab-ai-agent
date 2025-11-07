<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';

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
  size?: 'small' | 'medium' | 'large';
  round?: boolean;
  status?: 'success' | 'warning' | 'error';
  loading?: boolean;
  class?: string;
  style?: string;

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
  size: 'medium',
  round: false,
  loading: false,
  preventEnterSubmit: false,
});

const emit = defineEmits<Emits>();

const isComposing = ref(false);
const composingValue = ref('');

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
  emit('focus', e);
};

const handleBlur = (e: FocusEvent) => {
  emit('blur', e);
};

</script>

<template>
  <textarea
    v-if="type === 'textarea'"
    v-model="localValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :readonly="readonly"
    :maxlength="maxlength"
    :minlength="minlength"
    :rows="rows"
    :class="[
      'w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors resize-none',
      disabled && 'opacity-50 cursor-not-allowed',
      props.class
    ]"
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
  <input
    v-else
    v-model="localValue"
    :type="type"
    :placeholder="placeholder"
    :disabled="disabled"
    :readonly="readonly"
    :maxlength="maxlength"
    :minlength="minlength"
    :class="[
      'w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors',
      disabled && 'opacity-50 cursor-not-allowed',
      props.class
    ]"
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
</template>
