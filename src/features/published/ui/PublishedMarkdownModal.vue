<script setup lang="ts">
import {
  NModal,
  NButton,
  NSpace,
  NText,
} from 'naive-ui';
import {
  Code as MarkdownIcon,
  Eye as PreviewIcon,
} from '@vicons/ionicons5';
import { storeToRefs } from 'pinia';
import { usePublishedStore } from '@/features/published/stores/publishedStore';
import { usePublishedModal } from '@/features/published/hooks/usePublishedModal';

// 직접 store에서 reactive data 가져오기
const publishedStore = usePublishedStore();
const { markdownModal, detailModal } = storeToRefs(publishedStore);

// hook에서는 actions만 가져오기
const {
  saveMarkdownMemo,
  closeMarkdownModal,
  markdownKeydown,
  renderMarkdown
} = usePublishedModal();

// Vue handle~ wrapper 함수들
const handleSaveMarkdownMemo = () => {
  if (detailModal.value.selectedItem && markdownModal.value.content) {
    saveMarkdownMemo(detailModal.value.selectedItem, markdownModal.value.content);
  }
};

const handleMarkdownKeydown = (e: KeyboardEvent) => {
  if (detailModal.value.selectedItem && markdownModal.value.content) {
    markdownKeydown(e, detailModal.value.selectedItem, markdownModal.value.content);
  }
};

const handleCloseMarkdownModal = () => {
  closeMarkdownModal();
};
</script>

<template>
  <n-modal
    v-model:show="markdownModal.open"
    preset="card"
    class="markdown-editor-modal"
  >
    <template #header>
      <div style="display: flex; align-items: center; gap: 8px">
        <MarkdownIcon style="width: 20px; height: 20px; color: #6366f1" />
        마크다운 에디터
      </div>
    </template>

    <div class="markdown-editor-container">
      <!-- 에디터 헤더 -->
      <div class="editor-header">
        <n-space align="center" justify="space-between">
          <span style="color: #6366f1; font-weight: 600; font-size: 14px">
            실시간 마크다운 에디터
          </span>
          <div
            style="
              display: flex;
              flex-direction: column;
              align-items: end;
              gap: 2px;
            "
          >
            <n-text depth="3" style="font-size: 12px">
              **굵게**, *기울임*, `코드`, # 제목, - 리스트, [링크](url)
            </n-text>
            <n-text
              depth="3"
              style="font-size: 11px; color: #10b981; font-weight: 500"
            >
              💾 Shift + Enter로 저장
            </n-text>
          </div>
        </n-space>
      </div>

      <!-- 분할 에디터 -->
      <div class="split-editor">
        <!-- 왼쪽: 마크다운 입력 -->
        <div class="editor-input-panel">
          <div class="panel-header">
            <MarkdownIcon style="width: 14px; height: 14px; margin-right: 4px" />
            마크다운 작성
          </div>
          <div class="markdown-input-wrapper">
            <textarea
              v-model="markdownModal.content"
              placeholder="# 제목

**굵은 글씨**, *기울임체*, `코드`

- 리스트 항목
- 또 다른 항목

[링크](https://example.com)"
              class="markdown-textarea"
              @keydown="handleMarkdownKeydown($event)"
            ></textarea>
            <div class="character-count">
              {{ markdownModal.content.length }}자
            </div>
          </div>
        </div>

        <!-- 오른쪽: 미리보기 -->
        <div class="editor-preview-panel">
          <div class="panel-header">
            <PreviewIcon style="width: 14px; height: 14px; margin-right: 4px" />
            미리보기
          </div>
          <div
            class="live-preview"
            v-html="renderMarkdown(markdownModal.content)"
          ></div>
        </div>
      </div>
    </div>

    <template #footer>
      <n-space justify="end">
        <n-button @click="handleCloseMarkdownModal">취소</n-button>
        <n-button type="primary" @click="handleSaveMarkdownMemo">저장</n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<style scoped>
/* 마크다운 에디터 스타일 */
.markdown-editor-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.editor-header {
  padding: 12px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  margin-bottom: 16px;
}

:global(.dark) .editor-header {
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

.split-editor {
  display: flex;
  gap: 16px;
  height: 500px;
  flex: 1;
}

.editor-input-panel,
.editor-preview-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.markdown-input-wrapper {
  flex: 1;
  height: 450px;
  position: relative;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 6px;
  background: #fff;
  overflow: hidden;
  box-sizing: border-box;
}

:global(.dark) .markdown-input-wrapper {
  border-color: rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.05);
}

.markdown-textarea {
  width: 100%;
  height: 100%;
  padding: 12px;
  border: none;
  outline: none;
  background: transparent;
  color: #374151;
  font-size: 14px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  line-height: 1.6;
  resize: none;
  overflow-y: auto;
  box-sizing: border-box;

  /* 스크롤바 스타일링 */
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
}

.markdown-textarea::-webkit-scrollbar {
  width: 6px;
}

.markdown-textarea::-webkit-scrollbar-track {
  background: transparent;
}

.markdown-textarea::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.15);
  border-radius: 3px;
}

.markdown-textarea::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.25);
}

:global(.dark) .markdown-textarea {
  color: #d1d5db;
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
}

:global(.dark) .markdown-textarea::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
}

:global(.dark) .markdown-textarea::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

.character-count {
  position: absolute;
  bottom: 8px;
  right: 12px;
  font-size: 12px;
  color: #9ca3af;
  background: rgba(255, 255, 255, 0.8);
  padding: 2px 6px;
  border-radius: 4px;
  backdrop-filter: blur(4px);
}

:global(.dark) .character-count {
  color: #6b7280;
  background: rgba(0, 0, 0, 0.3);
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
  padding: 6px 0;
}

:global(.dark) .panel-header {
  color: #d1d5db;
}

.live-preview {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  height: 450px;
  max-height: 450px;

  /* 스크롤바 스타일링 */
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
}

.live-preview::-webkit-scrollbar {
  width: 6px;
}

.live-preview::-webkit-scrollbar-track {
  background: transparent;
}

.live-preview::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.15);
  border-radius: 3px;
}

.live-preview::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.25);
}

:global(.dark) .live-preview {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
}

:global(.dark) .live-preview::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
}

:global(.dark) .live-preview::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* 마크다운 콘텐츠 스타일 */
.live-preview :deep(h1),
.live-preview :deep(h2),
.live-preview :deep(h3) {
  margin: 16px 0 8px;
  color: #1a1a1a;
  font-weight: 600;
}

.live-preview :deep(h1) {
  font-size: 24px;
}
.live-preview :deep(h2) {
  font-size: 20px;
}
.live-preview :deep(h3) {
  font-size: 16px;
}

:global(.dark) .live-preview :deep(h1),
:global(.dark) .live-preview :deep(h2),
:global(.dark) .live-preview :deep(h3) {
  color: #e2e8f0;
}

.live-preview :deep(strong) {
  font-weight: 600;
  color: #374151;
}

:global(.dark) .live-preview :deep(strong) {
  color: #f3f4f6;
}

.live-preview :deep(em) {
  font-style: italic;
  color: #4b5563;
}

:global(.dark) .live-preview :deep(em) {
  color: #d1d5db;
}

.live-preview :deep(code) {
  background: rgba(79, 70, 229, 0.1);
  color: #4f46e5;
  padding: 2px 4px;
  border-radius: 4px;
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 13px;
}

:global(.dark) .live-preview :deep(code) {
  background: rgba(99, 102, 241, 0.2);
  color: #a5b4fc;
}

.live-preview :deep(a) {
  color: #3b82f6;
  text-decoration: none;
}

.live-preview :deep(a):hover {
  text-decoration: underline;
}

/* 마크다운 에디터 모바일 최적화 */
@media (max-width: 768px) {
  .split-editor {
    flex-direction: column;
    height: auto;
    gap: 2vh;
  }

  .markdown-input-wrapper {
    height: 35vh;
  }

  .live-preview {
    height: 35vh;
    max-height: 35vh;
  }

  .panel-header {
    font-size: clamp(12px, 3vw, 16px);
  }
}
</style>