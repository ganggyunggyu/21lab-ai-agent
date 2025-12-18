<script setup lang="ts">
import { ref, nextTick } from 'vue';
import { storeToRefs } from 'pinia';
import { useLayoutManager } from '@/hooks';
import { ChatFooter, ChatMain, ChatHeader, DocumentPanel } from '@/components/widgets';
import { useChatStore } from '@/stores';
import { toast } from '@/utils';

const { appRef } = useLayoutManager();
const chatStore = useChatStore();
const { keyword, refMsg, showRefInput } = storeToRefs(chatStore);

const isDragging = ref(false);

const cleanText = (text: string) => {
  return text
    .replace(/Previous imageNext image/gi, ' ')
    .replace(/Previous image/gi, ' ')
    .replace(/Next image/gi, ' ')
    .trim();
};

const handleDragEnter = (e: DragEvent) => {
  e.preventDefault();
  e.stopPropagation();
  isDragging.value = true;
};

const handleDragOver = (e: DragEvent) => {
  e.preventDefault();
  e.stopPropagation();
  isDragging.value = true;
};

const handleDragLeave = (e: DragEvent) => {
  e.preventDefault();
  e.stopPropagation();
  if (e.currentTarget === e.target) {
    isDragging.value = false;
  }
};

const handleDrop = async (e: DragEvent) => {
  e.preventDefault();
  e.stopPropagation();
  isDragging.value = false;

  const files = e.dataTransfer?.files;
  if (!files || files.length === 0) return;

  const file = files[0];
  if (!file.name.endsWith('.txt')) {
    toast.error('TXT 파일만 업로드 가능합니다');
    return;
  }

  try {
    const content = await file.text();
    const fileKeyword = file.name.replace(/\.txt$/i, '');

    keyword.value = fileKeyword.trim();
    refMsg.value = cleanText(content.trim());
    showRefInput.value = true;

    toast.success(`"${fileKeyword}" 파일이 로드되었습니다`);

    await nextTick();
    const footerInput = document.querySelector('.footer-input input') as HTMLInputElement;
    footerInput?.focus();
  } catch {
    toast.error('파일을 읽는 중 오류가 발생했습니다');
  }
};
</script>

<template>
  <div
    class="min-h-screen flex flex-col relative overflow-hidden"
    ref="appRef"
    role="application"
    aria-label="AI 채팅 애플리케이션"
    @dragenter="handleDragEnter"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
  >
    <!-- 드래그 오버레이 -->
    <div v-if="isDragging" class="drag-overlay">
      <div class="drag-overlay-content">
        <p class="drag-overlay-text">TXT 파일을 여기에 드롭하세요</p>
        <p class="drag-overlay-hint">파일명 → 키워드, 내용 → 참조원고</p>
      </div>
    </div>

    <ChatHeader />

    <div class="flex-1 flex overflow-hidden relative">
      <ChatMain />
      <DocumentPanel />
    </div>

    <ChatFooter />
  </div>
</template>

<style scoped>
.drag-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(98, 194, 176, 0.15);
  border: 4px dashed var(--color-brand);
  pointer-events: none;
}

.drag-overlay-content {
  text-align: center;
  padding: var(--space-6);
  background-color: var(--color-bg-primary);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  border: 1px solid var(--color-border-primary);
}

.drag-overlay-text {
  margin: 0;
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
  color: var(--color-brand);
}

.drag-overlay-hint {
  margin: var(--space-2) 0 0 0;
  font-size: var(--text-sm);
  color: var(--color-text-tertiary);
}
</style>
