<script setup lang="ts">
import { useLayoutManager } from '@/hooks/useLayoutManager';
import ChatFooter from '@/components/widgets/ChatFooter.vue';
import ChatMain from '@/components/widgets/ChatMain.vue';
import ChatHeader from '@/components/widgets/ChatHeader.vue';

const { appRef } = useLayoutManager();
</script>

<template>
  <div class="app-container" ref="appRef" role="application" aria-label="AI 채팅 애플리케이션">
    <ChatHeader />

    <ChatMain />

    <ChatFooter />
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100dvh;
  background: radial-gradient(
      circle at 25% 25%,
      rgba(99, 102, 241, 0.12) 0%,
      transparent 50%
    ),
    radial-gradient(
      circle at 75% 75%,
      rgba(16, 185, 129, 0.1) 0%,
      transparent 50%
    ),
    radial-gradient(
      circle at 50% 100%,
      rgba(59, 130, 246, 0.08) 0%,
      transparent 50%
    ),
    linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  background-size: 100% 100%;
  background-attachment: fixed;
  animation: liquidBackground 20s ease-in-out infinite;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}
</style>
