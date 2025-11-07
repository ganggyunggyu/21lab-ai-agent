<script setup lang="ts">
import { useLayoutManager } from '@/hooks';
import { ChatFooter, ChatMain, ChatHeader, DocumentPanel } from '@/components/widgets';

const { appRef } = useLayoutManager();
</script>

<template>
  <div
    class="min-h-screen flex flex-col relative overflow-hidden"
    ref="appRef"
    role="application"
    aria-label="AI 채팅 애플리케이션"
  >
    <ChatHeader />

    <div class="flex-1 flex overflow-hidden relative">
      <ChatMain />
      <DocumentPanel />
    </div>

    <ChatFooter />
  </div>
</template>
