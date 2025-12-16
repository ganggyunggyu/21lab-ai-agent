<script setup lang="ts">
import { Code as MarkdownIcon, Eye as PreviewIcon } from '@vicons/ionicons5';
import { storeToRefs } from 'pinia';
import { Modal, Button } from '@/components/ui';
import { usePublishedStore, usePublishedModal } from '@/features';

// 직접 store에서 reactive data 가져오기
const publishedStore = usePublishedStore();
const { markdownModal, detailModal } = storeToRefs(publishedStore);

// hook에서는 actions만 가져오기
const {
  saveMarkdownMemo,
  closeMarkdownModal,
  markdownKeydown,
  renderMarkdown,
} = usePublishedModal();

// Vue handle~ wrapper 함수들
const handleSaveMarkdownMemo = () => {
  if (detailModal.value.selectedItem && markdownModal.value.content) {
    saveMarkdownMemo(
      detailModal.value.selectedItem,
      markdownModal.value.content
    );
  }
};

const handleMarkdownKeydown = (e: KeyboardEvent) => {
  if (detailModal.value.selectedItem && markdownModal.value.content) {
    markdownKeydown(
      e,
      detailModal.value.selectedItem,
      markdownModal.value.content
    );
  }
};

const handleCloseMarkdownModal = () => {
  closeMarkdownModal();
};
</script>

<template>
  <Modal
    v-model:show="markdownModal.open"
    class="markdown-editor-modal"
  >
    <template #header>
      <header class="modal-header-content">
        <MarkdownIcon class="modal-header-icon" />
        <h2>마크다운 에디터</h2>
      </header>
    </template>

    <main class="markdown-editor-container" role="main" aria-label="마크다운 에디터 메인 영역">
      <!-- 에디터 헤더 -->
      <header class="editor-header">
        <div class="editor-header-content">
          <h3 class="editor-title">실시간 마크다운 에디터</h3>
          <aside class="editor-hint-container" aria-label="사용법 안내">
            <span class="editor-syntax-hint">
              **굵게**, *기울임*, `코드`, # 제목, - 리스트, [링크](url)
            </span>
            <span class="editor-save-hint">
              💾 Shift + Enter로 저장
            </span>
          </aside>
        </div>
      </header>

      <!-- 분할 에디터 -->
      <section class="split-editor" aria-label="분할 에디터 영역">
        <!-- 왼쪽: 마크다운 입력 -->
        <section class="editor-input-panel" aria-label="마크다운 입력 패널">
          <header class="panel-header">
            <MarkdownIcon class="panel-header-icon" />
            <h4>마크다운 작성</h4>
          </header>
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
              aria-label="마크다운 텍스트 입력 영역"
            ></textarea>
            <aside class="character-count" aria-label="문자 수 표시">
              {{ markdownModal.content.length }}자
            </aside>
          </div>
        </section>

        <!-- 오른쪽: 미리보기 -->
        <section class="editor-preview-panel" aria-label="미리보기 패널">
          <header class="panel-header">
            <PreviewIcon class="panel-header-icon" />
            <h4>미리보기</h4>
          </header>
          <article
            class="live-preview"
            v-html="renderMarkdown(markdownModal.content)"
            role="document"
            aria-label="마크다운 미리보기 결과"
          ></article>
        </section>
      </section>
    </main>

    <template #footer>
      <nav class="modal-actions" aria-label="에디터 액션">
        <Button color="light" variant="weak" size="sm" @click="handleCloseMarkdownModal" aria-label="에디터 닫기">
          취소
        </Button>
        <Button color="primary" size="sm" @click="handleSaveMarkdownMemo" aria-label="마크다운 저장">
          저장
        </Button>
      </nav>
    </template>
  </Modal>
</template>

<style scoped>
/* 마크다운 에디터 스타일 */
.markdown-editor-modal {
  min-height: 80vh;
}
.modal-header-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.modal-header-content h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.modal-header-icon {
  width: 20px;
  height: 20px;
  color: var(--color-primary);
}

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

.editor-header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.editor-title {
  color: var(--color-primary);
  font-weight: 600;
  font-size: 14px;
  margin: 0;
}

.editor-hint-container {
  display: flex;
  flex-direction: column;
  align-items: end;
  gap: 2px;
}

.editor-syntax-hint {
  font-size: 12px;
}

.editor-save-hint {
  font-size: 11px;
  color: var(--color-success);
  font-weight: 500;
}

:global(.dark) .editor-header {
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

.split-editor {
  display: flex;
  gap: 16px;
  height: 700px;
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
  min-height: 48vh;
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
  color: var(--color-text-primary);
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
  color: var(--color-text-tertiary);
  background: rgba(255, 255, 255, 0.8);
  padding: 2px 6px;
  border-radius: 4px;
  backdrop-filter: blur(4px);
}

:global(.dark) .character-count {
  background: rgba(0, 0, 0, 0.3);
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 8px;
  padding: 6px 0;
}

.panel-header h4 {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.panel-header-icon {
  width: 14px;
  height: 14px;
  margin-right: 4px;
}

.live-preview {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  height: 650px;
  max-height: 650px;

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
    height: 40vh;
  }

  .live-preview {
    height: 40vh;
    max-height: 40vh;
  }

  .panel-header {
    font-size: clamp(12px, 3vw, 16px);
  }
}
</style>
