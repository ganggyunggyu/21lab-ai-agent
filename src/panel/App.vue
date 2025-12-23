<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import type { Draft, StorageData, MessageResponse, DraftStatus, MessageAction } from '@extension/types';
import { MODEL_OPTIONS } from '@/constants';
import { Button, Select } from '@/components/ui';

// 원고 관련
const keyword = ref('');
const refMsg = ref('');
const service = ref(MODEL_OPTIONS[0]?.value || 'grok');
const drafts = ref<Draft[]>([]);
const isLoading = ref(false);
const copiedId = ref<string | null>(null);

// 글자수 세기
const charCountText = ref('');
const charCountExcludingSpaces = computed(() => {
  return charCountText.value.replace(/\s/g, '').length;
});

const sortedDrafts = computed(() => {
  return [...drafts.value].sort((a, b) => b.createdAt - a.createdAt);
});

const sendMessage = <T>(message: MessageAction): Promise<MessageResponse<T>> => {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(message, (response: MessageResponse<T> | undefined) => {
      const { lastError } = chrome.runtime;
      if (lastError) {
        resolve({ success: false, error: lastError.message });
        return;
      }
      if (!response) {
        resolve({ success: false, error: 'No response from background' });
        return;
      }
      resolve(response);
    });
  });
};

const loadDrafts = async () => {
  const response = await sendMessage<StorageData>({ type: 'GET_DRAFTS' });
  const { data, success } = response;
  if (success && data) {
    drafts.value = data.draftQueue;
  }
};

// 원고 생성
const handleGenerate = async () => {
  if (!keyword.value.trim() || isLoading.value) return;

  isLoading.value = true;

  const response = await sendMessage({
    type: 'GENERATE_DRAFT',
    payload: {
      keyword: keyword.value.trim(),
      refMsg: refMsg.value.trim(),
      service: service.value,
      withImage: false,
    },
  });

  if (response.success) {
    keyword.value = '';
    refMsg.value = '';
  }

  await loadDrafts();
  isLoading.value = false;
};

// 복사
const handleCopy = async (draft: Draft) => {
  const { content, title, keyword: draftKeyword, id } = draft;
  if (!content) return;

  const textToCopy = `${title || draftKeyword}\n\n${content}`;

  try {
    await navigator.clipboard.writeText(textToCopy);
    copiedId.value = id;

    await sendMessage({
      type: 'UPDATE_DRAFT_STATUS',
      payload: { id, status: 'COPIED' },
    });

    await loadDrafts();

    if (copyResetTimerId !== null) {
      window.clearTimeout(copyResetTimerId);
    }
    copyResetTimerId = window.setTimeout(() => {
      copiedId.value = null;
    }, 2000);
  } catch (error) {
    console.error('복사 실패:', error);
  }
};

// 삭제
const handleDelete = async (id: string) => {
  await sendMessage({ type: 'DELETE_DRAFT', payload: { id } });
  await loadDrafts();
};

// 전체 삭제
const handleClearAll = async () => {
  await sendMessage({ type: 'CLEAR_ALL_DRAFTS' });
  await loadDrafts();
};

const getStatusLabel = (status: DraftStatus) => {
  const labels: Record<DraftStatus, string> = {
    PENDING: '대기',
    GENERATING: '생성중',
    IMAGE_GENERATING: '이미지 생성중',
    COMPLETED: '완료',
    COPIED: '복사됨',
    POSTING: '발행중',
    POSTED: '발행완료',
    ERROR: '오류',
  };
  return labels[status] || status;
};

const getStatusClass = (status: DraftStatus) => {
  const classes: Record<DraftStatus, string> = {
    PENDING: 'status-pending',
    GENERATING: 'status-generating',
    IMAGE_GENERATING: 'status-generating',
    COMPLETED: 'status-completed',
    COPIED: 'status-copied',
    POSTING: 'status-generating',
    POSTED: 'status-completed',
    ERROR: 'status-error',
  };
  return classes[status] || '';
};

let copyResetTimerId: number | null = null;
const handleStorageChange = () => {
  loadDrafts();
};

onMounted(() => {
  loadDrafts();
  chrome.storage.onChanged.addListener(handleStorageChange);
});

onBeforeUnmount(() => {
  chrome.storage.onChanged.removeListener(handleStorageChange);
  if (copyResetTimerId !== null) {
    window.clearTimeout(copyResetTimerId);
  }
});
</script>

<template>
  <div class="panel">
    <header class="panel-header">
      <h1 class="panel-title">21Lab Agent</h1>
    </header>

    <!-- 글자수 세기 -->
    <section class="char-section">
      <div class="char-header">
        <span class="section-label">글자수 세기</span>
        <span v-if="charCountText" class="char-result">
          {{ charCountExcludingSpaces.toLocaleString() }}자 (공백 제외)
        </span>
      </div>
      <textarea
        v-model="charCountText"
        class="char-textarea"
        placeholder="글자수를 확인할 텍스트를 붙여넣으세요"
        rows="3"
      />
    </section>

    <!-- 원고 생성 -->
    <section class="generate-section">
      <div class="section-label">원고 생성</div>
      <div class="generate-form">
        <div class="form-row">
          <Select v-model="service" :options="MODEL_OPTIONS" size="sm" class="service-select" />
        </div>
        <input
          v-model="keyword"
          type="text"
          class="keyword-input"
          placeholder="키워드 입력"
          @keyup.enter="handleGenerate"
        />
        <textarea
          v-model="refMsg"
          class="ref-textarea"
          placeholder="참조원고 (선택)"
          rows="2"
        />
        <Button
          display="full"
          size="md"
          :loading="isLoading"
          :disabled="!keyword.trim()"
          @click="handleGenerate"
        >
          원고 생성
        </Button>
      </div>
    </section>

    <!-- 원고 목록 -->
    <section class="drafts-section">
      <div class="drafts-header">
        <span class="section-label">생성된 원고 ({{ drafts.length }})</span>
        <button v-if="drafts.length > 0" class="clear-btn" @click="handleClearAll">
          전체 삭제
        </button>
      </div>

      <div v-if="sortedDrafts.length === 0" class="empty-state">
        생성된 원고가 없습니다
      </div>

      <ul class="draft-list">
        <li
          v-for="draft in sortedDrafts"
          :key="draft.id"
          class="draft-item"
          :class="{ 'draft-copied': copiedId === draft.id }"
          @dblclick="handleCopy(draft)"
        >
          <div class="draft-header">
            <span class="draft-keyword">{{ draft.keyword }}</span>
            <span :class="['draft-status', getStatusClass(draft.status)]">
              {{ getStatusLabel(draft.status) }}
            </span>
          </div>

          <p v-if="draft.content" class="draft-preview">
            {{ draft.content.substring(0, 100) }}...
          </p>

          <p v-if="draft.error" class="draft-error">
            {{ draft.error }}
          </p>

          <div class="draft-actions">
            <Button
              v-if="['COMPLETED', 'COPIED'].includes(draft.status)"
              size="sm"
              color="primary"
              @click.stop="handleCopy(draft)"
            >
              복사
            </Button>
            <Button
              size="sm"
              color="danger"
              @click.stop="handleDelete(draft.id)"
            >
              삭제
            </Button>
          </div>
        </li>
      </ul>
    </section>

    <footer class="panel-footer">
      <p class="hint-text">더블클릭으로 빠른 복사</p>
    </footer>
  </div>
</template>

<style scoped>
.panel {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  font-family: var(--font-family);
}

.panel-header {
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border-primary);
  background: var(--color-primary);
}

.panel-title {
  margin: 0;
  font-size: var(--text-md);
  font-weight: var(--font-semibold);
  color: white;
}

.section-label {
  font-size: 12px;
  font-weight: var(--font-semibold);
  color: var(--color-text-secondary);
  text-transform: uppercase;
}

/* 글자수 세기 */
.char-section {
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border-primary);
}

.char-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-2);
}

.char-result {
  font-size: 14px;
  font-weight: var(--font-semibold);
  color: var(--color-primary);
}

.char-textarea {
  width: 100%;
  padding: var(--space-2);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-md);
  font-size: 13px;
  font-family: inherit;
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  resize: vertical;
}

.char-textarea:focus {
  outline: none;
  border-color: var(--color-primary);
}

/* 원고 생성 */
.generate-section {
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border-primary);
}

.generate-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-top: var(--space-2);
}

.form-row {
  display: flex;
  gap: var(--space-2);
}

.service-select {
  flex: 1;
}

.keyword-input {
  height: 36px;
  padding: 0 var(--space-3);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-md);
  font-size: 13px;
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
}

.keyword-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.ref-textarea {
  width: 100%;
  padding: var(--space-2);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-md);
  font-size: 12px;
  font-family: inherit;
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  resize: vertical;
}

.ref-textarea:focus {
  outline: none;
  border-color: var(--color-primary);
}

/* 원고 목록 */
.drafts-section {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-3) var(--space-4);
}

.drafts-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-2);
}

.clear-btn {
  padding: 2px 6px;
  font-size: 11px;
  color: var(--color-urgent);
  background: transparent;
  border: 1px solid var(--color-urgent);
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.clear-btn:hover {
  background: var(--color-urgent-bg);
}

.empty-state {
  padding: var(--space-6);
  text-align: center;
  color: var(--color-text-tertiary);
  font-size: var(--text-sm);
}

.draft-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.draft-item {
  padding: var(--space-2);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.draft-item:hover {
  background: var(--color-bg-tertiary);
}

.draft-copied {
  background: var(--color-success-bg) !important;
}

.draft-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.draft-keyword {
  font-size: 13px;
  font-weight: var(--font-medium);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 65%;
}

.draft-status {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  font-weight: var(--font-medium);
}

.status-pending {
  background: #ffeeba;
  color: #856404;
}

.status-generating {
  background: #bee5eb;
  color: #0c5460;
  animation: pulse 1.5s infinite;
}

.status-completed {
  background: var(--color-success-bg);
  color: #155724;
}

.status-copied {
  background: #cce5ff;
  color: #004085;
}

.status-error {
  background: var(--color-urgent-bg);
  color: #721c24;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.draft-preview {
  margin: 0 0 var(--space-1);
  font-size: 11px;
  color: var(--color-text-secondary);
  line-height: 1.4;
}

.draft-error {
  margin: 0 0 var(--space-1);
  font-size: 11px;
  color: var(--color-urgent);
}

.draft-actions {
  display: flex;
  gap: var(--space-1);
}

.panel-footer {
  padding: var(--space-2) var(--space-4);
  border-top: 1px solid var(--color-border-primary);
  text-align: center;
}

.hint-text {
  margin: 0;
  font-size: 10px;
  color: var(--color-text-tertiary);
}
</style>
