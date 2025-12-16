<script setup lang="ts">
/**
 * TDS Skeleton 패턴 기반 로딩 플레이스홀더
 *
 * @prop variant - 형태 (text, circular, rectangular)
 * @prop width - 너비 (CSS 값)
 * @prop height - 높이 (CSS 값)
 * @prop lines - 텍스트 줄 수 (variant="text"일 때)
 * @prop animated - 애니메이션 활성화
 */

interface Props {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string;
  height?: string;
  lines?: number;
  animated?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'text',
  animated: true,
  lines: 1,
});

const getLineWidth = (index: number, total: number): string => {
  if (total === 1) return '100%';
  if (index === total - 1) return '60%';
  return '100%';
};
</script>

<template>
  <div class="skeleton-wrapper">
    <!-- Text variant -->
    <template v-if="variant === 'text'">
      <div
        v-for="i in lines"
        :key="i"
        :class="['skeleton', 'skeleton-text', animated && 'skeleton-animated']"
        :style="{
          width: width || getLineWidth(i - 1, lines),
          height: height || '1em',
        }"
      />
    </template>

    <!-- Circular variant -->
    <div
      v-else-if="variant === 'circular'"
      :class="['skeleton', 'skeleton-circular', animated && 'skeleton-animated']"
      :style="{
        width: width || '40px',
        height: height || width || '40px',
      }"
    />

    <!-- Rectangular variant -->
    <div
      v-else
      :class="['skeleton', 'skeleton-rectangular', animated && 'skeleton-animated']"
      :style="{
        width: width || '100%',
        height: height || '100px',
      }"
    />
  </div>
</template>

<style scoped>
.skeleton-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-bg-tertiary) 0%,
    var(--color-bg-secondary) 50%,
    var(--color-bg-tertiary) 100%
  );
  background-size: 200% 100%;
}

.skeleton-animated {
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}

.skeleton-text {
  border-radius: var(--radius-sm);
}

.skeleton-circular {
  border-radius: 50%;
}

.skeleton-rectangular {
  border-radius: var(--radius-md);
}

@keyframes skeleton-pulse {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
