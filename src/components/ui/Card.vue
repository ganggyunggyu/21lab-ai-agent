<template>
  <div :class="['card-base', variantClass, props.hoverable && 'card-hoverable']">
    <div v-if="$slots.header" class="card-header">
      <slot name="header" />
    </div>

    <div class="card-body">
      <slot />
    </div>

    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  variant?: 'flat' | 'elevated';
  hoverable?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'flat',
  hoverable: false,
});

const variantClass = computed(() => {
  return props.variant === 'elevated' ? 'card-elevated' : 'card-flat';
});
</script>

<style scoped>
.card-base {
  border-radius: var(--radius-lg);
  overflow: hidden;
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
  transition: background-color var(--transition-normal),
              box-shadow var(--transition-normal),
              border-color var(--transition-normal);
}

.card-flat {
  border: 1px solid var(--color-border-primary);
}

.card-elevated {
  box-shadow: var(--shadow-md);
}

.card-hoverable {
  cursor: pointer;
}

.card-hoverable:hover {
  background-color: var(--color-bg-secondary);
}

.card-header {
  padding: var(--space-4) var(--space-6);
  border-bottom: 1px solid var(--color-border-primary);
}

.card-body {
  padding: var(--space-6);
}

.card-footer {
  padding: var(--space-4) var(--space-6);
  border-top: 1px solid var(--color-border-primary);
}
</style>
