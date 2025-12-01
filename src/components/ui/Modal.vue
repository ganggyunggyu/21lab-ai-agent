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
    enter-active-class="modal-backdrop-enter-active"
    enter-from-class="modal-backdrop-enter-from"
    enter-to-class="modal-backdrop-enter-to"
    leave-active-class="modal-backdrop-leave-active"
    leave-from-class="modal-backdrop-enter-to"
    leave-to-class="modal-backdrop-enter-from"
  >
    <div
      v-if="show"
      class="modal-backdrop"
      @click="handleBackdropClick"
    >
      <Transition
        enter-active-class="modal-content-enter-active"
        enter-from-class="modal-content-enter-from"
        enter-to-class="modal-content-enter-to"
        leave-active-class="modal-content-leave-active"
        leave-from-class="modal-content-enter-to"
        leave-to-class="modal-content-enter-from"
      >
        <div
          v-if="show"
          class="modal-content"
          role="dialog"
          aria-modal="true"
        >
          <!-- Header -->
          <div
            v-if="title || $slots.header"
            class="modal-header"
          >
            <slot name="header">
              <h2 class="modal-title">{{ title }}</h2>
            </slot>
          </div>

          <!-- Body -->
          <div class="modal-body">
            <slot />
          </div>

          <!-- Footer -->
          <div
            v-if="$slots.footer"
            class="modal-footer"
          >
            <slot name="footer" />
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-content {
  width: 400px;
  max-width: calc(100vw - var(--space-8));
  max-height: calc(100vh - var(--space-8));
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  overflow: hidden;
}

.modal-header {
  padding: var(--space-4) var(--space-6);
  border-bottom: 1px solid var(--color-border-primary);
  background-color: var(--color-bg-secondary);
}

.modal-title {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--color-text-primary);
}

.modal-body {
  padding: var(--space-5) var(--space-6);
  color: var(--color-text-primary);
}

.modal-footer {
  padding: var(--space-4) var(--space-6);
  border-top: 1px solid var(--color-border-primary);
  background-color: var(--color-bg-secondary);
}

/* Backdrop Transitions */
.modal-backdrop-enter-active,
.modal-backdrop-leave-active {
  transition: opacity var(--transition-normal);
}

.modal-backdrop-enter-from {
  opacity: 0;
}

.modal-backdrop-enter-to {
  opacity: 1;
}

/* Content Transitions */
.modal-content-enter-active,
.modal-content-leave-active {
  transition: opacity var(--transition-normal), transform var(--transition-normal);
}

.modal-content-enter-from {
  opacity: 0;
  transform: translateY(-16px);
}

.modal-content-enter-to {
  opacity: 1;
  transform: translateY(0);
}
</style>
