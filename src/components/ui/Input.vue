<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { NInput } from 'naive-ui';

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

const handleClear = () => {
  localValue.value = '';
  emit('clear');
};

const inputProps = computed(() => ({
  type: props.type,
  placeholder: props.placeholder,
  disabled: props.disabled,
  readonly: props.readonly,
  clearable: props.clearable,
  showPasswordOn: props.showPasswordOn,
  maxlength: props.maxlength,
  minlength: props.minlength,
  rows: props.rows,
  autosize: props.autosize,
  size: props.size,
  round: props.round,
  status: props.status,
  loading: props.loading,
}));
</script>

<template>
  <n-input
    v-model:value="localValue"
    v-bind="inputProps"
    :class="props.class"
    :style="props.style"
    @input="handleInput"
    @keydown="handleKeydown"
    @keyup="handleKeyup"
    @keypress="handleKeypress"
    @focus="handleFocus"
    @blur="handleBlur"
    @clear="handleClear"
    @compositionstart="handleCompositionStart"
    @compositionupdate="handleCompositionUpdate"
    @compositionend="handleCompositionEnd"
  />
</template>

<style scoped>
/* 추가적인 스타일링이 필요한 경우 */
</style>
