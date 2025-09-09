<template>
  <div
    :class="[
      'modern-card',
      `modern-card--${variant}`,
      {
        'modern-card--hover': hoverable,
        'modern-card--bordered': bordered,
        'modern-card--elevated': elevated,
      },
    ]"
  >
    <div v-if="$slots.header" class="modern-card__header">
      <slot name="header" />
    </div>

    <div class="modern-card__body">
      <slot />
    </div>

    <div v-if="$slots.footer" class="modern-card__footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'default' | 'glass' | 'solid' | 'gradient';
  hoverable?: boolean;
  bordered?: boolean;
  elevated?: boolean;
}

withDefaults(defineProps<Props>(), {
  variant: 'default',
  hoverable: false,
  bordered: false,
  elevated: false,
});
</script>

<style scoped>
.modern-card {
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.modern-card--default {
  background: rgba(30, 41, 59, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(148, 163, 184, 0.1);
}

.modern-card--glass {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.modern-card--solid {
  background: #1e293b;
  border: 1px solid #334155;
}

.modern-card--gradient {
  background: linear-gradient(
    135deg,
    rgba(59, 130, 246, 0.1) 0%,
    rgba(16, 185, 129, 0.1) 100%
  );
  backdrop-filter: blur(20px);
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.modern-card--bordered {
  border-width: 2px;
}

.modern-card--elevated {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.modern-card--hover:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.modern-card--hover:hover.modern-card--glass {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.15);
}

.modern-card--hover:hover.modern-card--gradient {
  background: linear-gradient(
    135deg,
    rgba(59, 130, 246, 0.15) 0%,
    rgba(16, 185, 129, 0.15) 100%
  );
  border-color: rgba(59, 130, 246, 0.3);
}

.modern-card__header {
  padding: 20px 24px 0;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
  margin-bottom: 20px;
  padding-bottom: 16px;
}

.modern-card__body {
  padding: 24px;
}

.modern-card__footer {
  padding: 0 24px 20px;
  border-top: 1px solid rgba(148, 163, 184, 0.1);
  margin-top: 20px;
  padding-top: 16px;
}

/* Responsive padding */
@media (max-width: 768px) {
  .modern-card__header,
  .modern-card__body,
  .modern-card__footer {
    padding-left: 16px;
    padding-right: 16px;
  }

  .modern-card__body {
    padding-top: 16px;
    padding-bottom: 16px;
  }
}
</style>
