<script setup lang="ts">
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { NEmpty, NGrid, NGridItem } from 'naive-ui';
import { DocumentText as DocumentIcon } from '@vicons/ionicons5';

import PublishedHeader from '@/features/published/ui/PublishedHeader.vue';
import PublishedToolbar from '@/features/published/ui/PublishedToolbar.vue';
import PublishedCard from '@/features/published/ui/PublishedCard.vue';
import PublishedDetailModal from '@/features/published/ui/PublishedDetailModal.vue';
import PublishedMarkdownModal from '@/features/published/ui/PublishedMarkdownModal.vue';

import { usePublishedStore } from '@/features/published/stores/publishedStore';
import { usePublishedList } from '@/features/published/hooks/usePublishedList';

// 직접 store 사용
const publishedStore = usePublishedStore();
const { displayList } = storeToRefs(publishedStore);

const { getItemGroupInfo } = usePublishedList();

const goBack = () => {
  window.history.back();
};

onMounted(() => {
  publishedStore.loadArticles();
});
</script>

<template>
  <div class="published-list-container">
    <PublishedHeader :onGoBack="goBack" />

    <PublishedToolbar />
    <div class="list-container">
      <n-empty
        v-if="displayList?.length === 0"
        description="아직 등록된 발행원고가 없습니다"
        style="margin: 60px 0"
      >
        <template #icon>
          <component :is="DocumentIcon" style="font-size: 48px; color: #ccc" />
        </template>
        <template #extra>
          <n-text depth="3">
            채팅에서 원고를 생성한 후 "발행원고 등록" 기능을 사용해보세요!
          </n-text>
        </template>
      </n-empty>

      <n-grid v-else :cols="1" :x-gap="16" :y-gap="16" class="published-grid">
        <n-grid-item v-for="item in displayList" :key="item.id">
          <PublishedCard :item="item" :groupInfo="getItemGroupInfo(item)" />
        </n-grid-item>
      </n-grid>
    </div>

    <PublishedDetailModal />
    <PublishedMarkdownModal />
  </div>
</template>

<style scoped>
.published-list-container {
  min-height: 100vh;
  padding: 16px;
  /* Light theme: airy colorful halos */
  background: radial-gradient(
      1200px 600px at 50% -20%,
      rgba(59, 130, 246, 0.16),
      transparent
    ),
    radial-gradient(
      900px 500px at 80% 10%,
      rgba(16, 185, 129, 0.14),
      transparent
    ),
    radial-gradient(
      900px 500px at 20% 10%,
      rgba(236, 72, 153, 0.12),
      transparent
    );
}

/* Dark theme tuning: deeper base + neon glows */
:global(.dark) .published-list-container {
  background: #0b1220
      radial-gradient(
        1200px 600px at 50% -20%,
        rgba(59, 130, 246, 0.22),
        transparent
      ),
    radial-gradient(
      900px 500px at 80% 10%,
      rgba(16, 185, 129, 0.2),
      transparent
    ),
    radial-gradient(
      900px 500px at 20% 10%,
      rgba(236, 72, 153, 0.16),
      transparent
    );
}

.page-header {
  margin-bottom: 16px;
  max-width: 960px;
  margin-left: auto;
  margin-right: auto;
}

.header-wrapper {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 0;
}

.back-button {
  flex-shrink: 0;
}

.title-section {
  flex: 1;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 2px;
}

.title-icon {
  width: 20px !important;
  height: 20px !important;
  color: #3b82f6;
  flex-shrink: 0;
  min-width: 20px;
  min-height: 20px;
  max-width: 20px;
  max-height: 20px;
}

.page-title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1.2;
}

:global(.dark) .page-title {
  color: #fff;
}

.page-subtitle {
  margin: 0;
  font-size: 13px;
  color: #666;
  font-weight: 500;
}

:global(.dark) .page-subtitle {
  color: #94a3b8;
}

/* Toolbar */
/* 컴팩트 툴바 스타일 */
.compact-toolbar {
  margin-bottom: 16px;
  max-width: 960px;
  margin-left: auto;
  margin-right: auto;
}

.compact-toolbar-card {
  padding: 10px 16px;
  backdrop-filter: blur(15px);
  background: rgba(255, 255, 255, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

:global(.dark) .compact-toolbar-card {
  background: rgba(17, 24, 39, 0.6);
  border-color: rgba(255, 255, 255, 0.1);
}

.compact-toolbar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.toolbar-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.compact-select {
  min-width: 110px;
  font-size: 13px;
}

.filter-group {
  gap: 12px;
}

.filter-group-label {
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
  margin-right: 8px;
}

:global(.dark) .filter-group-label {
  color: #9ca3af;
}

.switch-group {
  display: flex;
  gap: 16px;
  align-items: center;
}

.compact-switch {
  display: flex;
  align-items: center;
  gap: 6px;
}

.compact-switch-label {
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  white-space: nowrap;
}

:global(.dark) .compact-switch-label {
  color: #9ca3af;
}

/* List */
.list-container {
  max-width: 960px;
  margin: 0 auto;
}
.published-item-card {
  cursor: pointer;
  transition: box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease;
  border: 1px solid rgba(59, 130, 246, 0.14);
}
.published-item-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(59, 130, 246, 0.18),
    0 6px 14px rgba(16, 185, 129, 0.12);
  border-color: rgba(16, 185, 129, 0.28);
}
.item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}
.item-title-section {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}
.published-badge-icon {
  width: 16px;
  height: 16px;
  color: #10b981;
  background: rgba(16, 185, 129, 0.15);
  border-radius: 50%;
  padding: 2px;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.18),
    0 6px 18px rgba(16, 185, 129, 0.25);
  flex-shrink: 0;
}

.modal-badge-icon {
  width: 18px;
  height: 18px;
  color: #10b981;
  flex-shrink: 0;
}
.item-title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
}
.item-content {
  margin-top: 4px;
}
.item-content.compact {
  padding: 0;
}
.keyword-line {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
}

.tag-group {
  display: flex;
  gap: 6px;
  align-items: center;
}
.label {
  font-weight: 600;
  font-size: 13px;
  color: #333;
}
.keyword {
  margin-left: 6px;
  color: #111;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
}
.ref-flag {
  font-size: 12px;
  color: #2563eb;
  background: rgba(37, 99, 235, 0.08);
  border: 1px solid rgba(37, 99, 235, 0.2);
  padding: 2px 6px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  gap: 3px;
}

.visibility-badge {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 999px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 3px;
}

.visibility-badge.visible {
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.visibility-badge.hidden {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.blog-id-badge {
  font-size: 11px;
  color: #6366f1;
  background: rgba(99, 102, 241, 0.08);
  border: 1px solid rgba(99, 102, 241, 0.2);
  padding: 2px 6px;
  border-radius: 999px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 3px;
}

.group-version-badge {
  font-size: 10px;
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
  padding: 1px 4px;
  border-radius: 4px;
  font-weight: 600;
  margin-left: 6px;
}
.item-footer {
  margin-top: 8px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  padding-top: 8px;
}
.created-date {
  font-size: 12px;
  color: #888;
}

/* Compact card spacing & actions */
.published-item {
  padding: 12px;
}
.item-actions {
  display: flex;
  gap: 6px;
  align-items: center;
}
.action-btn {
  border-radius: 999px;
}

/* Modal polish */
.preview-container {
  white-space: pre-wrap;
  word-break: break-word;
  background: rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(0, 0, 0, 0.06);
  padding: 10px 12px;
  border-radius: 8px;
  max-height: 100px;
  overflow-y: auto;
  line-height: 1.4;
  font-size: 13px;
  color: #444;

  /* 스크롤바 스타일링 */
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
}

.preview-container::-webkit-scrollbar {
  width: 6px;
}

.preview-container::-webkit-scrollbar-track {
  background: transparent;
}

.preview-container::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.15);
  border-radius: 3px;
}

.preview-container::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.25);
}

:global(.dark) .preview-container {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
}

:global(.dark) .preview-container::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
}

:global(.dark) .preview-container::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

.modal-section {
  margin-bottom: 12px;
}

.modal-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.modal-text {
  margin: 4px 0;
  color: #333;
  font-weight: 500;
}

:global(.dark) .modal-text {
  color: #e2e8f0;
}

.memo-preview {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
  font-style: italic;
  display: flex;
  align-items: center;
  gap: 4px;
}

.memo-preview .memo-text {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  flex: 1;
}

:global(.dark) .memo-preview {
  color: #94a3b8;
}

.memo-display {
  margin: 4px 0;
  color: #555;
  font-size: 13px;
  line-height: 1.4;
  white-space: pre-wrap;
  word-break: break-word;
  background: rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(0, 0, 0, 0.06);
  padding: 10px 12px;
  border-radius: 8px;
  max-height: 100px;
  overflow-y: auto;

  /* 스크롤바 스타일링 */
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
}

.memo-display::-webkit-scrollbar {
  width: 6px;
}

.memo-display::-webkit-scrollbar-track {
  background: transparent;
}

.memo-display::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.15);
  border-radius: 3px;
}

.memo-display::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.25);
}

:global(.dark) .memo-display {
  color: #cbd5e1;
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.1);
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
}

:global(.dark) .memo-display::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
}

:global(.dark) .memo-display::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

.memo-edit {
  margin-top: 8px;
}

.exposure-controls {
  margin-top: 6px;
  padding: 10px;
  background: rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 6px;
}

:global(.dark) .exposure-controls {
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(255, 255, 255, 0.08);
}

.exposure-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.exposure-row:last-child {
  margin-bottom: 0;
}

.control-label {
  font-size: 13px;
  font-weight: 600;
  color: #555;
  min-width: 70px;
}

:global(.dark) .control-label {
  color: #cbd5e1;
}

.rank-hint {
  font-size: 12px;
  color: #888;
  font-style: italic;
}

:global(.dark) .rank-hint {
  color: #94a3b8;
}

/* 아이콘 크기 강제 제한 */
.ref-icon,
.visibility-icon,
.memo-icon {
  width: 12px !important;
  height: 12px !important;
  flex-shrink: 0;
  min-width: 12px;
  min-height: 12px;
  max-width: 12px;
  max-height: 12px;
}

.title-icon {
  width: 24px !important;
  height: 24px !important;
  color: #3b82f6;
  flex-shrink: 0;
  min-width: 24px;
  min-height: 24px;
  max-width: 24px;
  max-height: 24px;
}

.published-badge-icon {
  width: 16px !important;
  height: 16px !important;
  min-width: 16px;
  min-height: 16px;
  max-width: 16px;
  max-height: 16px;
}

.modal-badge-icon {
  width: 18px !important;
  height: 18px !important;
  min-width: 18px;
  min-height: 18px;
  max-width: 18px;
  max-height: 18px;
}

/* Responsive */
@media (max-width: 768px) {
  .published-list-container {
    padding: 12px;
  }

  .page-header {
    margin-bottom: 12px;
  }

  .header-wrapper {
    gap: 12px;
    padding: 8px 0;
  }

  .title-icon {
    width: 18px !important;
    height: 18px !important;
    min-width: 18px;
    min-height: 18px;
    max-width: 18px;
    max-height: 18px;
  }

  .page-title {
    font-size: 20px;
  }

  .page-subtitle {
    font-size: 12px;
  }

  .compact-toolbar-content {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .toolbar-section {
    justify-content: center;
  }

  .switch-group {
    justify-content: center;
    gap: 12px;
  }

  .filter-group {
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }
}

@media (max-width: 480px) {
  .published-list-container {
    padding: 8px;
  }

  .header-wrapper {
    gap: 10px;
    padding: 6px 0;
  }

  .title-icon {
    width: 16px !important;
    height: 16px !important;
    min-width: 16px;
    min-height: 16px;
    max-width: 16px;
    max-height: 16px;
  }

  .page-title {
    font-size: 18px;
  }

  .page-subtitle {
    font-size: 11px;
  }

  .back-button {
    min-width: 36px;
    min-height: 36px;
  }
}

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

.markdown-content h1,
.markdown-content h2,
.markdown-content h3 {
  margin: 16px 0 8px;
  color: #1a1a1a;
  font-weight: 600;
}

.markdown-content h1 {
  font-size: 24px;
}
.markdown-content h2 {
  font-size: 20px;
}
.markdown-content h3 {
  font-size: 16px;
}

:global(.dark) .markdown-content h1,
:global(.dark) .markdown-content h2,
:global(.dark) .markdown-content h3 {
  color: #e2e8f0;
}

.markdown-content strong {
  font-weight: 600;
  color: #374151;
}

:global(.dark) .markdown-content strong {
  color: #f3f4f6;
}

.markdown-content em {
  font-style: italic;
  color: #4b5563;
}

:global(.dark) .markdown-content em {
  color: #d1d5db;
}

.markdown-content code {
  background: rgba(79, 70, 229, 0.1);
  color: #4f46e5;
  padding: 2px 4px;
  border-radius: 4px;
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 13px;
}

:global(.dark) .markdown-content code {
  background: rgba(99, 102, 241, 0.2);
  color: #a5b4fc;
}

.markdown-content a {
  color: #3b82f6;
  text-decoration: none;
  border-bottom: 1px solid rgba(59, 130, 246, 0.3);
}

.markdown-content a:hover {
  border-bottom-color: #3b82f6;
}

.markdown-content li {
  margin: 4px 0;
  padding-left: 8px;
  position: relative;
}

.markdown-content li::before {
  content: '•';
  position: absolute;
  left: -8px;
  color: #6b7280;
}

.editor-help {
  flex: 1;
}

/* 마크다운 에디터 모바일 최적화 */
/* 모달 스타일 - 뷰포트 기반 반응형 */
.published-detail-modal :deep(.n-card) {
  width: 80vw !important;
  max-width: 560px !important;
  min-width: 320px !important;
  max-height: 85vh !important;
  overflow-y: auto;
}

.markdown-editor-modal :deep(.n-card) {
  width: 90vw !important;
  max-width: 900px !important;
  min-width: 320px !important;
  max-height: 90vh !important;
  overflow: hidden;
}

.markdown-editor-modal :deep(.n-card-body) {
  padding: 2vh 2vw;
  overflow: hidden;
  height: calc(90vh - 8vh);
}

.published-detail-modal :deep(.n-card-body) {
  padding: 2vh 3vw;
  overflow-y: auto;
  max-height: calc(85vh - 10vh);
}

@media (max-width: 768px) {
  .published-detail-modal :deep(.n-card) {
    width: 95vw !important;
    max-width: none !important;
    max-height: 90vh !important;
  }

  .markdown-editor-modal :deep(.n-card) {
    width: 95vw !important;
    max-width: none !important;
    max-height: 95vh !important;
  }

  .markdown-editor-modal :deep(.n-card-body) {
    padding: 1vh 2vw;
    height: calc(95vh - 6vh);
  }

  .published-detail-modal :deep(.n-card-body) {
    padding: 1vh 2vw;
    max-height: calc(90vh - 6vh);
  }

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
