<script setup lang="ts">
import { ref, onMounted, computed, onBeforeUnmount } from 'vue';
import type {
  Draft,
  StorageData,
  MessageResponse,
  DraftStatus,
  MessageAction,
} from '@extension/types';
import { MODEL_OPTIONS } from '@/constants';
import { Button, Input, Select } from '@/components/ui';

const keyword = ref('');
const refMsg = ref('');
const service = ref(MODEL_OPTIONS[0]?.value || 'grok');
const showRefInput = ref(false);
const drafts = ref<Draft[]>([]);
const isLoading = ref(false);
const copiedId = ref<string | null>(null);
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
    const { draftQueue } = data;
    drafts.value = draftQueue;
  }
};

const handleGenerate = async () => {
  const { value: keywordValue } = keyword;
  const { value: refMsgValue } = refMsg;
  const { value: serviceValue } = service;
  if (!keywordValue.trim() || isLoading.value) return;

  isLoading.value = true;
  try {
    const response = await sendMessage({
      type: 'GENERATE_DRAFT',
      payload: {
        keyword: keywordValue.trim(),
        refMsg: refMsgValue.trim(),
        service: serviceValue,
      },
    });
    if (response.success) {
      keyword.value = '';
      refMsg.value = '';
      await loadDrafts();
    }
  } finally {
    isLoading.value = false;
  }
};

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

const handleDelete = async (id: string) => {
  await sendMessage({ type: 'DELETE_DRAFT', payload: { id } });
  await loadDrafts();
};

const getStatusLabel = (status: DraftStatus) => {
  const labels: Record<DraftStatus, string> = {
    PENDING: '대기',
    GENERATING: '생성중',
    COMPLETED: '완료',
    COPIED: '복사됨',
    ERROR: '오류',
  };
  return labels[status] || status;
};

const getStatusClass = (status: DraftStatus) => {
  const classes: Record<DraftStatus, string> = {
    PENDING: 'status-pending',
    GENERATING: 'status-generating',
    COMPLETED: 'status-completed',
    COPIED: 'status-copied',
    ERROR: 'status-error',
  };
  return classes[status] || '';
};

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  });
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
      <h1 class="panel-title">21Lab AI Agent</h1>
    </header>

    <section class="input-section">
      <div class="service-row">
        <div class="input-group">
          <label class="input-label-text">서비스</label>
          <Select
            v-model="service"
            :options="MODEL_OPTIONS"
            size="sm"
          />
        </div>
        <div class="char-counter">
          <label class="input-label-text">글자수</label>
          <input
            v-model="charCountText"
            type="text"
            class="char-input"
            placeholder="붙여넣기"
          />
          <span v-if="charCountText" class="char-count">
            {{ charCountExcludingSpaces.toLocaleString() }}자
          </span>
        </div>
      </div>

      <Input
        v-model="keyword"
        label="키워드"
        placeholder="키워드를 입력하세요"
        size="sm"
        :on-enter="handleGenerate"
      />

      <div class="input-group">
        <button class="toggle-ref-btn" @click="showRefInput = !showRefInput">
          {{ showRefInput ? '참조원고 숨기기' : '참조원고 추가' }}
        </button>
        <Input
          v-if="showRefInput"
          v-model="refMsg"
          type="textarea"
          placeholder="참조원고를 입력하세요"
          :rows="4"
          size="sm"
        />
      </div>

      <Button
        display="full"
        size="md"
        :loading="isLoading"
        :disabled="!keyword.trim()"
        @click="handleGenerate"
      >
        원고 생성
      </Button>
    </section>

    <section class="queue-section">
      <h2 class="section-title">원고 큐 ({{ drafts.length }})</h2>

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

          <div class="draft-meta">
            <span class="draft-service">{{ draft.service }}</span>
            <span class="draft-time">{{ formatTime(draft.createdAt) }}</span>
          </div>

          <p v-if="draft.content" class="draft-preview">
            {{ draft.content.substring(0, 100) }}...
          </p>

          <p v-if="draft.error" class="draft-error">
            {{ draft.error }}
          </p>

          <div class="draft-actions">
            <Button
              v-if="draft.status === 'COMPLETED' || draft.status === 'COPIED'"
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
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-border-primary);
  background: var(--color-primary);
}

.panel-title {
  margin: 0;
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: white;
}

.input-section {
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  border-bottom: 1px solid var(--color-border-primary);
}

.service-row {
  display: flex;
  gap: var(--space-3);
  align-items: flex-start;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.char-counter {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.char-input {
  height: 36px;
  padding: 0 var(--space-3);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-md);
  font-size: 13px;
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  transition: border-color var(--transition-fast);
}

.char-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.char-input::placeholder {
  color: var(--color-text-disabled);
}

.char-count {
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  color: var(--color-primary);
}

.input-label-text {
  font-size: 13px;
  font-weight: var(--font-medium);
  color: var(--color-text-secondary);
}

.toggle-ref-btn {
  align-self: flex-start;
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-xs);
  color: var(--color-primary);
  background: transparent;
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.toggle-ref-btn:hover {
  background: rgba(98, 194, 176, 0.1);
}

.queue-section {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-4);
}

.section-title {
  margin: 0 0 var(--space-3);
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--color-text-secondary);
}

.empty-state {
  padding: var(--space-8);
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
  padding: var(--space-3);
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
  margin-bottom: var(--space-1);
}

.draft-keyword {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 70%;
}

.draft-status {
  font-size: 11px;
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

.draft-meta {
  display: flex;
  gap: var(--space-2);
  font-size: 11px;
  color: var(--color-text-tertiary);
  margin-bottom: var(--space-2);
}

.draft-preview {
  margin: 0 0 var(--space-2);
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
  line-height: var(--leading-normal);
}

.draft-error {
  margin: 0 0 var(--space-2);
  font-size: var(--text-xs);
  color: var(--color-urgent);
}

.draft-actions {
  display: flex;
  gap: var(--space-2);
}

.panel-footer {
  padding: var(--space-3) var(--space-4);
  border-top: 1px solid var(--color-border-primary);
  text-align: center;
}

.hint-text {
  margin: 0;
  font-size: 11px;
  color: var(--color-text-tertiary);
}
</style>
