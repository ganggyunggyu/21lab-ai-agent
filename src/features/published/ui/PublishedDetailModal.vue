<script setup lang="ts">
import { storeToRefs } from 'pinia';
import {
  Code as MarkdownIcon,
  CheckmarkCircle as CheckIcon,
} from '@vicons/ionicons5';
import { Input, Button, Modal } from '@/components/ui';
import { usePublishedStore, usePublishedModal, usePublishedList } from '@/features';

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

const { handleUseTemplate, handleDelete } = usePublishedList();

// Vue 파일에서 handle~ 이름으로 wrapper 함수들
const handleStartEditMemo = (item: any) => {
  startEditMemo(item.id, item.memo || '');
};

const handleSaveMemo = (item: any) => {
  saveMemo(item, editing.value.tempMemo);
};

const handleMemoKeydown = (e: KeyboardEvent, item: any) => {
  memoKeydown(e, item, editing.value.tempMemo);
};

const handleStartEditBlogId = (item: any) => {
  startEditBlogId(item.id, item.blogId || '');
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

// 개선된 복사 핸들러들
const handleCopyKeywordWithMessage = (item: any) => {
  navigator.clipboard.writeText(item.keyword);
};

const handleCopyRefWithMessage = (item: any) => {
  if (item.refMsg) {
    navigator.clipboard.writeText(item.refMsg);
  }
};

const handleCopyResultWithMessage = (item: any) => {
  if (item.botContent) {
    navigator.clipboard.writeText(item.botContent);
  }
};
</script>

<template>
  <Modal v-model:show="detailModal.open" class="modal-size">
    <template #header>
      <header class="modal-header">
        <CheckIcon class="modal-badge-icon" />
        <h2>{{ detailModal.selectedItem?.title }}</h2>
      </header>
    </template>

    <main v-if="detailModal.selectedItem" class="modal-content" role="main" aria-label="발행원고 세부 정보">
      <section class="modal-section" aria-label="키워드 정보">
        <header class="modal-item-header">
          <h3>키워드:</h3>
          <Button
            variant="secondary"
            size="sm"
            @click="handleCopyKeywordWithMessage(detailModal.selectedItem!)"
            aria-label="키워드 복사"
          >
            복사
          </Button>
        </header>
        <p class="modal-text">{{ detailModal.selectedItem.keyword }}</p>
      </section>

      <section v-if="detailModal.selectedItem.refMsg" class="modal-section" aria-label="참조원고">
        <header class="modal-item-header">
          <h3>참조원고:</h3>
          <Button
            variant="secondary"
            size="sm"
            @click="handleCopyRefWithMessage(detailModal.selectedItem!)"
            aria-label="참조원고 복사"
          >
            복사
          </Button>
        </header>
        <article class="preview-container">
          {{ detailModal.selectedItem.refMsg }}
        </article>
      </section>

      <section class="modal-section" v-if="detailModal.selectedItem.botContent" aria-label="결과원고">
        <header class="modal-item-header">
          <h3>결과원고:</h3>
          <Button
            variant="secondary"
            size="sm"
            @click="handleCopyResultWithMessage(detailModal.selectedItem!)"
            aria-label="결과원고 복사"
          >
            복사
          </Button>
        </header>
        <article class="preview-container">
          {{ detailModal.selectedItem.botContent }}
        </article>
      </section>

      <section class="modal-section" aria-label="메모 관리">
        <header class="modal-item-header">
          <h3>메모:</h3>
          <nav
            v-if="editing.memo !== detailModal.selectedItem.id"
            class="action-buttons"
            aria-label="메모 편집 액션"
          >
            <Button
              variant="secondary"
              size="sm"
              @click="handleStartEditMemo(detailModal.selectedItem!)"
              aria-label="메모 편집"
            >
              편집
            </Button>
            <Button
              variant="secondary"
              size="sm"
              class="markdown-button"
              @click="handleOpenMarkdownEditor(detailModal.selectedItem!)"
              title="마크다운으로 수정하기"
              aria-label="마크다운 에디터로 편집"
            >
              <MarkdownIcon class="markdown-icon" />
              MD
            </Button>
          </nav>
          <nav v-else class="action-buttons" aria-label="메모 저장 액션">
            <Button
              variant="primary"
              size="sm"
              @click="handleSaveMemo(detailModal.selectedItem!)"
              aria-label="메모 저장"
            >
              저장
            </Button>
            <Button variant="ghost" size="sm" @click="cancelEditMemo" aria-label="편집 취소">
              취소
            </Button>
          </nav>
        </header>
        <div
          v-if="editing.memo === detailModal.selectedItem.id"
          class="memo-edit"
        >
          <Input
            v-model="editing.tempMemo"
            type="textarea"
            placeholder="수정 내역, 발행 일정 등을 기록해주세요 (Shift+Enter로 저장)"
            :autosize="{ minRows: 2, maxRows: 4 }"
            @keydown="handleMemoKeydown($event, detailModal.selectedItem!)"
            aria-label="메모 편집 텍스트 영역"
          />
        </div>
        <p v-else class="memo-display">
          {{ detailModal.selectedItem.memo || '메모가 없습니다.' }}
        </p>
      </section>

      <section class="modal-section" aria-label="블로그 ID 관리">
        <header class="modal-item-header">
          <h3>블로그 ID:</h3>
          <nav
            v-if="editing.blogId !== detailModal.selectedItem.id"
            class="action-buttons"
            aria-label="블로그 ID 편집 액션"
          >
            <Button
              variant="secondary"
              size="sm"
              @click="handleStartEditBlogId(detailModal.selectedItem!)"
              aria-label="블로그 ID 편집"
            >
              편집
            </Button>
          </nav>
          <nav v-else class="action-buttons" aria-label="블로그 ID 저장 액션">
            <Button
              variant="primary"
              size="sm"
              @click="handleSaveBlogId(detailModal.selectedItem!)"
              aria-label="블로그 ID 저장"
            >
              저장
            </Button>
            <Button variant="ghost" size="sm" @click="cancelEditBlogId" aria-label="편집 취소">
              취소
            </Button>
          </nav>
        </header>
        <div
          v-if="editing.blogId === detailModal.selectedItem.id"
          class="memo-edit"
        >
          <Input
            v-model="editing.tempBlogId"
            placeholder="블로그 ID를 입력하세요 (Shift+Enter로 저장)"
            @keydown="handleBlogIdKeydown($event, detailModal.selectedItem!)"
            aria-label="블로그 ID 입력"
          />
        </div>
        <p v-else class="memo-display">
          {{ detailModal.selectedItem.blogId || 'ID가 없습니다.' }}
        </p>
      </section>

      <section class="modal-section" aria-label="활성화 설정">
        <header class="modal-item-header">
          <h3>활성화 설정:</h3>
          <Button
            :variant="detailModal.selectedItem.isActive ?? true ? 'primary' : 'danger'"
            size="sm"
            @click="handleToggleActive(detailModal.selectedItem!)"
            :aria-label="detailModal.selectedItem.isActive ?? true ? '활성화 상태 - 클릭하여 비활성화' : '비활성화 상태 - 클릭하여 활성화'"
          >
            {{ detailModal.selectedItem.isActive ?? true ? '활성화' : '비활성화' }}
          </Button>
        </header>
        <p class="setting-description">
          {{
            detailModal.selectedItem.isActive ?? true
              ? '현재 발행원고가 활성화되어 있습니다.'
              : '현재 발행원고가 비활성화되어 있습니다.'
          }}
        </p>
      </section>

      <section class="modal-section" aria-label="노출 및 관리 설정">
        <header class="modal-item-header">
          <h3>노출 설정:</h3>
          <nav class="action-buttons" aria-label="발행원고 관리 액션">
            <Button
              :variant="detailModal.selectedItem.isVisible ? 'primary' : 'secondary'"
              size="sm"
              @click="handleToggleVisibility(detailModal.selectedItem!)"
              :aria-label="detailModal.selectedItem.isVisible ? '노출중 - 클릭하여 숨김' : '미노출 - 클릭하여 노출'"
            >
              {{ detailModal.selectedItem.isVisible ? '노출중' : '미노출' }}
            </Button>
            <Button
              variant="danger"
              size="sm"
              @click="handleDelete(detailModal.selectedItem!)"
              aria-label="발행원고 삭제"
            >
              삭제
            </Button>
            <Button
              variant="primary"
              size="sm"
              @click="handleUseTemplate(detailModal.selectedItem!)"
              aria-label="이 발행원고로 새 원고 작성"
            >
              원고 발행
            </Button>
          </nav>
        </header>
        <div v-if="detailModal.selectedItem.isVisible" class="rank-setting" role="group" aria-label="노출 순위 설정">
          <label for="exposure-rank">노출 순위:</label>
          <Input
            id="exposure-rank"
            type="number"
            :modelValue="String(detailModal.selectedItem.exposureRank || 0)"
            @update:modelValue="handleUpdateExposureRank(detailModal.selectedItem!, Number($event))"
            placeholder="순위"
            class="rank-input"
            aria-label="노출 순위 숫자 입력"
          />
        </div>
      </section>
    </main>
  </Modal>
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

.modal-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.modal-badge-icon {
  width: 18px;
  height: 18px;
  color: var(--color-success);
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

.modal-item-header h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.modal-text {
  margin: 0;
  color: var(--color-text-primary);
  line-height: 1.5;
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
  margin: 0;
}

:global(.dark) .memo-display {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

.markdown-button {
  color: var(--color-primary);
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
  color: var(--color-text-secondary);
  margin: 4px 0 0 0;
  font-style: italic;
}

.rank-input {
  width: 100px;
  margin-left: 8px;
}

.action-buttons {
  display: flex;
  gap: 8px;
  align-items: center;
}
</style>
