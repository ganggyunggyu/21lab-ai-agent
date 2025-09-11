<script setup lang="ts">
import { NModal, NButton, NSpace, NInput, NInputNumber } from 'naive-ui';
import { storeToRefs } from 'pinia';
import {
  Code as MarkdownIcon,
  CheckmarkCircle as CheckIcon,
} from '@vicons/ionicons5';
import { usePublishedStore } from '@/features/published/stores/publishedStore';
import { usePublishedModal } from '@/features/published/hooks/usePublishedModal';
import { usePublishedList } from '@/features/published/hooks/usePublishedList';
import { copyText } from '@/utils';

// 직접 store에서 reactive data 가져오기
const publishedStore = usePublishedStore();
const { detailModal, editing } = storeToRefs(publishedStore);

// hook에서는 actions만 가져오기
const {
  startEditMemo,
  saveMemo,
  cancelEditMemo,
  memoKeydown,
  startEditBlogId,
  saveBlogId,
  cancelEditBlogId,
  blogIdKeydown,
  openMarkdownEditor,
  toggleVisibility,
  toggleActive,
  updateExposureRank,
} = usePublishedModal();

const { handleCopyKeyword, handleUseTemplate, handleDelete } =
  usePublishedList();

// Vue 파일에서 handle~ 이름으로 wrapper 함수들
const handleStartEditMemo = (item: any) => {
  startEditMemo(item);
};

const handleSaveMemo = (item: any) => {
  saveMemo(item, editing.value.tempMemo);
};

const handleMemoKeydown = (e: KeyboardEvent, item: any) => {
  memoKeydown(e, item, editing.value.tempMemo);
};

const handleStartEditBlogId = (item: any) => {
  startEditBlogId(item);
};

const handleSaveBlogId = (item: any) => {
  saveBlogId(item, editing.value.tempBlogId);
};

const handleBlogIdKeydown = (e: KeyboardEvent, item: any) => {
  blogIdKeydown(e, item, editing.value.tempBlogId);
};

const handleOpenMarkdownEditor = (item: any) => {
  openMarkdownEditor(item);
};

const handleToggleVisibility = (item: any) => {
  toggleVisibility(item);
};

const handleUpdateExposureRank = (item: any, rank: number) => {
  updateExposureRank(item, rank);
};

const handleToggleActive = (item: any) => {
  toggleActive(item);
};
</script>

<template>
  <n-modal v-model:show="detailModal.open" preset="card" class="modal-size">
    <template #header>
      <div class="modal-header">
        <CheckIcon class="modal-badge-icon" />
        {{ detailModal.selectedItem?.title }}
      </div>
    </template>

    <div v-if="detailModal.selectedItem" class="modal-content">
      <div class="modal-section">
        <div class="modal-item-header">
          <strong>키워드:</strong>
          <n-button
            size="tiny"
            @click="handleCopyKeyword(detailModal.selectedItem!)"
          >
            복사
          </n-button>
        </div>
        <p class="modal-text">{{ detailModal.selectedItem.keyword }}</p>
      </div>

      <div v-if="detailModal.selectedItem.refMsg" class="modal-section">
        <div class="modal-item-header">
          <strong>참조원고:</strong>
          <n-button
            size="tiny"
            @click="copyText(detailModal?.selectedItem?.refMsg)"
          >
            복사
          </n-button>
        </div>
        <div class="preview-container">
          {{ detailModal.selectedItem.refMsg }}
        </div>
      </div>

      <div class="modal-section" v-if="detailModal.selectedItem.botContent">
        <div class="modal-item-header">
          <strong>결과원고:</strong>
          <n-button
            size="tiny"
            @click="copyText(detailModal?.selectedItem?.botContent)"
          >
            복사
          </n-button>
        </div>
        <div class="preview-container">
          {{ detailModal.selectedItem.botContent }}
        </div>
      </div>

      <div class="modal-section">
        <div class="modal-item-header">
          <strong>메모:</strong>
          <n-space
            v-if="editing.memo !== detailModal.selectedItem.id"
            size="small"
          >
            <n-button
              size="tiny"
              @click="handleStartEditMemo(detailModal.selectedItem!)"
            >
              편집
            </n-button>
            <n-button
              size="tiny"
              class="markdown-button"
              @click="handleOpenMarkdownEditor(detailModal.selectedItem!)"
              title="마크다운으로 수정하기"
            >
              <MarkdownIcon class="markdown-icon" />
              MD
            </n-button>
          </n-space>
          <n-space v-else size="small">
            <n-button
              size="tiny"
              type="primary"
              @click="handleSaveMemo(detailModal.selectedItem!)"
            >
              저장
            </n-button>
            <n-button size="tiny" @click="cancelEditMemo"> 취소 </n-button>
          </n-space>
        </div>
        <div
          v-if="editing.memo === detailModal.selectedItem.id"
          class="memo-edit"
        >
          <n-input
            v-model:value="editing.tempMemo"
            type="textarea"
            placeholder="수정 내역, 발행 일정 등을 기록해주세요 (Shift+Enter로 저장)"
            :autosize="{ minRows: 2, maxRows: 4 }"
            @keydown="handleMemoKeydown($event, detailModal.selectedItem!)"
          />
        </div>
        <div v-else class="memo-display">
          {{ detailModal.selectedItem.memo || '메모가 없습니다.' }}
        </div>
      </div>

      <div class="modal-section">
        <div class="modal-item-header">
          <strong>블로그 ID:</strong>
          <n-space
            v-if="editing.blogId !== detailModal.selectedItem.id"
            size="small"
          >
            <n-button
              size="tiny"
              @click="handleStartEditBlogId(detailModal.selectedItem!)"
            >
              편집
            </n-button>
          </n-space>
          <n-space v-else size="small">
            <n-button
              size="tiny"
              type="primary"
              @click="handleSaveBlogId(detailModal.selectedItem!)"
            >
              저장
            </n-button>
            <n-button size="tiny" @click="cancelEditBlogId"> 취소 </n-button>
          </n-space>
        </div>
        <div
          v-if="editing.blogId === detailModal.selectedItem.id"
          class="memo-edit"
        >
          <n-input
            v-model:value="editing.tempBlogId"
            placeholder="블로그 ID를 입력하세요 (Shift+Enter로 저장)"
            @keydown="handleBlogIdKeydown($event, detailModal.selectedItem!)"
          />
        </div>
        <div v-else class="memo-display">
          {{ detailModal.selectedItem.blogId || 'ID가 없습니다.' }}
        </div>
      </div>

      <div class="modal-section">
        <div class="modal-item-header">
          <strong>활성화 설정:</strong>
          <n-button
            size="tiny"
            :type="
              detailModal.selectedItem.isActive ?? true ? 'success' : 'error'
            "
            @click="handleToggleActive(detailModal.selectedItem!)"
          >
            {{
              detailModal.selectedItem.isActive ?? true ? '활성화' : '비활성화'
            }}
          </n-button>
        </div>
        <div class="setting-description">
          {{
            detailModal.selectedItem.isActive ?? true
              ? '현재 발행원고가 활성화되어 있습니다.'
              : '현재 발행원고가 비활성화되어 있습니다.'
          }}
        </div>
      </div>

      <div class="modal-section">
        <div class="modal-item-header">
          <strong>노출 설정:</strong>
          <n-space size="small">
            <n-button
              size="tiny"
              :type="detailModal.selectedItem.isVisible ? 'success' : 'default'"
              @click="handleToggleVisibility(detailModal.selectedItem!)"
            >
              {{ detailModal.selectedItem.isVisible ? '노출중' : '미노출' }}
            </n-button>
            <n-button
              size="tiny"
              type="error"
              @click="handleDelete(detailModal.selectedItem!)"
            >
              삭제
            </n-button>
            <n-button
              size="tiny"
              type="primary"
              @click="handleUseTemplate(detailModal.selectedItem!)"
            >
              원고 발행
            </n-button>
          </n-space>
        </div>
        <div v-if="detailModal.selectedItem.isVisible" class="rank-setting">
          <label>노출 순위:</label>
          <n-input-number
            :value="detailModal.selectedItem.exposureRank"
            @update:value="
              handleUpdateExposureRank(detailModal.selectedItem!, $event)
            "
            placeholder="순위"
            size="small"
            class="rank-input"
          />
        </div>
      </div>
    </div>
  </n-modal>
</template>

<style scoped>
.modal-size {
  max-width: 70vw;
  max-height: 90vh;
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.modal-badge-icon {
  width: 18px;
  height: 18px;
  color: #10b981;
  flex-shrink: 0;
}

.modal-content {
  padding: 8px 0;
  max-height: 70vh;
  overflow-y: auto;
}

.modal-section {
  margin-bottom: 16px;
}

.modal-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.modal-text {
  margin: 0;
  color: #374151;
  line-height: 1.5;
}

:global(.dark) .modal-text {
  color: #d1d5db;
}

.preview-container {
  background: rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 6px;
  padding: 12px;
  max-height: 200px;
  overflow-y: auto;
  white-space: pre-wrap;
  font-size: 14px;
  line-height: 1.5;
}

:global(.dark) .preview-container {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

.memo-edit {
  margin-top: 8px;
}

.memo-display {
  background: rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 6px;
  padding: 12px;
  min-height: 32px;
  max-height: 200px;
  overflow-y: auto;
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
}

:global(.dark) .memo-display {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

.markdown-button {
  color: #6366f1;
}

.markdown-icon {
  width: 12px;
  height: 12px;
  margin-right: 2px;
}

.rank-setting {
  display: flex;
  align-items: center;
  margin-top: 8px;
  font-size: 14px;
}

.setting-description {
  font-size: 13px;
  color: #6b7280;
  margin-top: 4px;
  font-style: italic;
}

:global(.dark) .setting-description {
  color: #9ca3af;
}

.rank-input {
  width: 100px;
  margin-left: 8px;
}
</style>
