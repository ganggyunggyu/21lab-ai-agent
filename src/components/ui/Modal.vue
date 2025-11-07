<script setup lang="ts">
interface Props {
  show: boolean;
  title?: string;
}

interface Emits {
  'update:show': [value: boolean];
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const handleClose = () => {
  emit('update:show', false);
};

const handleBackdropClick = (e: MouseEvent) => {
  if (e.target === e.currentTarget) {
    handleClose();
  }
};
</script>

<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="show"
      class="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 dark:bg-black/70 backdrop-blur-sm"
      @click="handleBackdropClick"
    >
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 scale-95 -translate-y-4"
        enter-to-class="opacity-100 scale-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 scale-100 translate-y-0"
        leave-to-class="opacity-0 scale-95 -translate-y-4"
      >
        <div
          v-if="show"
          class="w-[400px] bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-black/80 overflow-hidden"
          role="dialog"
          aria-modal="true"
        >
          <!-- Header -->
          <div
            v-if="title || $slots.header"
            class="px-6 py-4 border-b border-slate-200 dark:border-gray-600 bg-slate-50/50 dark:bg-gray-700/50"
          >
            <slot name="header">
              <h2 class="text-lg font-semibold text-slate-900 dark:text-gray-100">{{ title }}</h2>
            </slot>
          </div>

          <!-- Body -->
          <div class="px-6 py-5 text-gray-900 dark:text-gray-100">
            <slot />
          </div>

          <!-- Footer -->
          <div
            v-if="$slots.footer"
            class="px-6 py-4 border-t border-slate-200 dark:border-gray-600 bg-slate-50/30 dark:bg-gray-700/30"
          >
            <slot name="footer" />
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>
