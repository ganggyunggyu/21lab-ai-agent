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
import { Button, Input, Select, Switch } from '@/components/ui';

const keywords = ref('');
const refMsg = ref('');
const service = ref(MODEL_OPTIONS[0]?.value || 'grok');
const showRefInput = ref(false);
const drafts = ref<Draft[]>([]);
const isLoading = ref(false);
const isBatchRunning = ref(false);
const copiedId = ref<string | null>(null);
const charCountText = ref('');

const withImage = ref(true);
const autoSchedule = ref(false);
const scheduleStartTime = ref('09:00');

const charCountExcludingSpaces = computed(() => {
  return charCountText.value.replace(/\s/g, '').length;
});

const keywordList = computed(() => {
  return keywords.value
    .split('\n')
    .map((k) => k.trim())
    .filter(Boolean);
});

const sortedDrafts = computed(() => {
  return [...drafts.value].sort((a, b) => b.createdAt - a.createdAt);
});

const completedCount = computed(() => {
  return drafts.value.filter((d) =>
    ['COMPLETED', 'COPIED', 'POSTED'].includes(d.status)
  ).length;
});

const processingCount = computed(() => {
  return drafts.value.filter((d) =>
    ['GENERATING', 'IMAGE_GENERATING', 'POSTING'].includes(d.status)
  ).length;
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

const handleBatchStart = async () => {
  const list = keywordList.value;
  if (list.length === 0 || isBatchRunning.value) return;

  isBatchRunning.value = true;
  isLoading.value = true;

  for (const kw of list) {
    if (!isBatchRunning.value) break;

    const response = await sendMessage({
      type: 'GENERATE_DRAFT',
      payload: {
        keyword: kw,
        refMsg: refMsg.value.trim(),
        service: service.value,
        withImage: withImage.value,
      },
    });

    if (response.success && withImage.value) {
      await loadDrafts();
      const draft = drafts.value.find((d) => d.keyword === kw && d.status === 'COMPLETED');
      if (draft) {
        await sendMessage({
          type: 'GENERATE_IMAGE',
          payload: { id: draft.id, keyword: kw },
        });
      }
    }

    await loadDrafts();
  }

  isBatchRunning.value = false;
  isLoading.value = false;
  keywords.value = '';
};

const handleBatchStop = () => {
  isBatchRunning.value = false;
  isLoading.value = false;
};

const handleClearAll = async () => {
  await sendMessage({ type: 'CLEAR_ALL_DRAFTS' });
  await loadDrafts();
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

const handleGenerateImage = async (draft: Draft) => {
  await sendMessage({
    type: 'GENERATE_IMAGE',
    payload: { id: draft.id, keyword: draft.keyword },
  });
  await loadDrafts();
};

const getStatusLabel = (status: DraftStatus) => {
  const labels: Record<DraftStatus, string> = {
    PENDING: '대기',
    GENERATING: '원고 생성중',
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
    IMAGE_GENERATING: 'status-image',
    COMPLETED: 'status-completed',
    COPIED: 'status-copied',
    POSTING: 'status-posting',
    POSTED: 'status-posted',
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
      <h1 class="panel-title">21Lab 자동화 봇</h1>
      <span class="panel-badge">{{ completedCount }}/{{ drafts.length }}</span>
    </header>

    <section class="input-section">
      <div class="config-row">
        <div class="input-group">
          <label class="input-label-text">서비스</label>
          <Select v-model="service" :options="MODEL_OPTIONS" size="sm" />
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

      <div class="options-row">
        <label class="option-item">
          <Switch v-model="withImage" size="sm" />
          <span class="option-label">이미지 자동생성</span>
        </label>
        <label class="option-item">
          <Switch v-model="autoSchedule" size="sm" />
          <span class="option-label">예약발행</span>
        </label>
        <input
          v-if="autoSchedule"
          v-model="scheduleStartTime"
          type="time"
          class="time-input"
        />
      </div>

      <div class="input-group">
        <label class="input-label-text">
          키워드 ({{ keywordList.length }}개)
        </label>
        <textarea
          v-model="keywords"
          class="keywords-textarea"
          placeholder="키워드를 줄바꿈으로 구분하여 입력하세요&#10;예시:&#10;강남 맛집&#10;홍대 카페&#10;부산 여행"
          rows="6"
          :disabled="isBatchRunning"
        />
      </div>

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

      <div class="action-row">
        <Button
          v-if="!isBatchRunning"
          display="full"
          size="md"
          :loading="isLoading"
          :disabled="keywordList.length === 0"
          @click="handleBatchStart"
        >
          배치 시작 ({{ keywordList.length }}개)
        </Button>
        <Button
          v-else
          display="full"
          size="md"
          color="danger"
          @click="handleBatchStop"
        >
          중지
        </Button>
      </div>
    </section>

    <section class="queue-section">
      <div class="queue-header">
        <h2 class="section-title">
          원고 큐
          <span v-if="processingCount > 0" class="processing-badge">
            {{ processingCount }} 처리중
          </span>
        </h2>
        <button
          v-if="drafts.length > 0"
          class="clear-btn"
          @click="handleClearAll"
        >
          전체 삭제
        </button>
      </div>

      <div v-if="sortedDrafts.length === 0" class="empty-state">
        키워드를 입력하고 배치를 시작하세요
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
            <span v-if="draft.images?.length" class="draft-images">
              📷 {{ draft.images.length }}장
            </span>
          </div>

          <p v-if="draft.content" class="draft-preview">
            {{ draft.content.substring(0, 80) }}...
          </p>

          <p v-if="draft.error" class="draft-error">
            {{ draft.error }}
          </p>

          <div class="draft-actions">
            <Button
              v-if="draft.status === 'COMPLETED' && !draft.images?.length"
              size="sm"
              color="light"
              @click.stop="handleGenerateImage(draft)"
            >
              이미지
            </Button>
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
      <p class="hint-text">더블클릭으로 빠른 복사 | 2시간 간격 자동 예약</p>
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
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.panel-badge {
  padding: 4px 10px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
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

.config-row {
  display: flex;
  gap: var(--space-3);
  align-items: flex-start;
}

.options-row {
  display: flex;
  gap: var(--space-4);
  align-items: center;
  flex-wrap: wrap;
}

.option-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  cursor: pointer;
}

.option-label {
  font-size: 13px;
  color: var(--color-text-secondary);
}

.time-input {
  height: 28px;
  padding: 0 var(--space-2);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-sm);
  font-size: 12px;
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
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

.keywords-textarea {
  width: 100%;
  padding: var(--space-3);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-md);
  font-size: 13px;
  font-family: inherit;
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  resize: vertical;
  line-height: 1.5;
}

.keywords-textarea:focus {
  outline: none;
  border-color: var(--color-primary);
}

.keywords-textarea:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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

.action-row {
  margin-top: var(--space-2);
}

.queue-section {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-4);
}

.queue-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-3);
}

.section-title {
  margin: 0;
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.processing-badge {
  padding: 2px 8px;
  background: var(--color-primary);
  color: white;
  border-radius: var(--radius-full);
  font-size: 11px;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.clear-btn {
  padding: var(--space-1) var(--space-2);
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
  max-width: 60%;
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

.status-image {
  background: #d4edda;
  color: #155724;
}

.status-completed {
  background: var(--color-success-bg);
  color: #155724;
}

.status-copied {
  background: #cce5ff;
  color: #004085;
}

.status-posting {
  background: #fff3cd;
  color: #856404;
}

.status-posted {
  background: #c3e6cb;
  color: #155724;
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

.draft-images {
  color: var(--color-primary);
  font-weight: var(--font-medium);
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
