<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const card = ref<HTMLElement | null>(null)

function onMouseMove(e: MouseEvent) {
  if (!card.value)
    return

  const rect = card.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top

  card.value.style.setProperty('--mouse-x', `${x}px`)
  card.value.style.setProperty('--mouse-y', `${y}px`)
}

onMounted(() => {
  if (card.value)
    card.value.addEventListener('mousemove', onMouseMove)
})

onUnmounted(() => {
  if (card.value)
    card.value.removeEventListener('mousemove', onMouseMove)
})
</script>

<template>
  <div ref="card" class="card">
    <div class="card-border" />
    <div class="card-content">
      <!-- your content here -->
    </div>
  </div>
</template>

<style>
.card {
  --border-size: 3px;
  --border-angle: 0turn;
  --card-bg: hsl(0 0% 10%);
  --border-bg: conic-gradient(
    from var(--border-angle),
    hsl(0, 0%, 22%),
    hsl(0, 0%, 22%) 50%,
    hsl(0, 0%, 22%)
  );

  background-image:
    radial-gradient(
      circle at var(--mouse-x) var(--mouse-y),
      hsla(0, 0%, 100%, 0.2) 0%,
      hsla(0, 0%, 100%, 0) 25%
    ),
    linear-gradient(
      to bottom right,
      hsl(0, 0%, 15%),
      hsl(0, 0%, 5%)
    );
  position: relative;
  border-radius: 0.5rem;
  overflow: hidden;
}

.card-border {
  position: absolute;
  inset: 0;
  background-image: var(--border-bg);
  z-index: 0;
}

.card-content {
  background-image: var(--card-bg);
  position: relative;
  z-index: 1;
  margin: var(--border-size);
  border-radius: 0.25rem;
}

@property --border-angle {
  syntax: '<angle>';
  inherits: true;
  initial-value: 0turn;
}

@keyframes spin {
  to {
    --border-angle: 1turn;
  }
}

.card:hover {
  animation: spin 3s linear infinite;
}
</style>
