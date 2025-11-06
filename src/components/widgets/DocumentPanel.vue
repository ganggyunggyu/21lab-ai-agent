<script setup lang="ts">
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useChatStore } from '@/stores';
import { downloadText, copyText } from '@/utils';
import type { Message } from '@/types';
import {
  CheckmarkOutline as CheckmarkIcon,
  CheckmarkCircleOutline as CheckmarkCircleIcon,
  Download as DownloadIcon,
  Close as CloseIcon,
} from '@vicons/ionicons5';
import { NIcon } from 'naive-ui';

const chatStore = useChatStore();
const { messages, isSelectionMode, selectedMessageIds } =
  storeToRefs(chatStore);
const {
  cancelCurrentRequest,
  deleteMessage,
  toggleSelectionMode,
  toggleMessageSelection,
  selectAllMessages,
  exportSelectedMessages,
} = chatStore;

const isOpen = ref(true);
const selectedDocument = ref<Message | null>(null);
const showActionOverlay = ref(false);

const generatingMessages = computed(() => {
  return messages.value.filter(
    (msg) =>
      msg.role === 'bot' &&
      (msg.content === 'loading' || msg.loadingProgress !== undefined)
  );
});

const completedMessages = computed(() => {
  return messages.value.filter((msg) => {
    if (msg.role !== 'user') return false;
    if (!msg.keyword) return false;

    const userIndex = messages.value.findIndex((m) => m.id === msg.id);
    if (userIndex === -1) return false;

    for (let i = userIndex + 1; i < messages.value.length; i++) {
      const nextMsg = messages.value[i];
      if (nextMsg.role === 'user') break;
      if (
        nextMsg.role === 'bot' &&
        nextMsg.content !== 'loading' &&
        !nextMsg.loadingProgress
      ) {
        return true;
      }
    }
    return false;
  });
});

const togglePanel = () => {
  isOpen.value = !isOpen.value;
};

const handleDocumentClick = (msg: Message) => {
  if (isSelectionMode.value) {
    toggleMessageSelection(msg.id || '');
    return;
  }
  selectedDocument.value = msg;
  showActionOverlay.value = true;
};

const isMessageSelected = (messageId?: string) => {
  if (!messageId) return false;
  return selectedMessageIds.value.has(messageId);
};

const handleDownloadSelected = async () => {
  const packages = exportSelectedMessages();
  if (packages.length === 0) return;

  const files = packages.map((pkg) => {
    const keyword = pkg.userMessage.keyword || '원고';
    const sanitizedKeyword = keyword
      .slice(0, 30)
      .replace(/[/\\?%*:|"<>]/g, '_');
    const resultBody = pkg.responses.map((r) => r.content).join('\n\n---\n\n');
    const resultLength = resultBody.replace(/\s+/g, '').length;
    return {
      fileName: `${sanitizedKeyword}-${resultLength}.txt`,
      content: resultBody,
    };
  });

  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();
  files.forEach(({ fileName, content }) => {
    zip.file(fileName, content);
  });

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `selected-docs-${Date.now()}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  toggleSelectionMode();
};

const closeOverlay = () => {
  showActionOverlay.value = false;
  selectedDocument.value = null;
};

const getBotResponses = (userMsg: Message) => {
  const userIndex = messages.value.findIndex((m) => m.id === userMsg.id);
  if (userIndex === -1) return [];

  const botResponses: Message[] = [];
  for (let i = userIndex + 1; i < messages.value.length; i++) {
    const msg = messages.value[i];
    if (msg.role === 'user') break;
    if (
      msg.role === 'bot' &&
      msg.content !== 'loading' &&
      !msg.loadingProgress
    ) {
      botResponses.push(msg);
    }
  }
  return botResponses;
};

const handleDownload = () => {
  if (!selectedDocument.value) return;

  const userMsg = selectedDocument.value;
  const botResponses = getBotResponses(userMsg);
  if (botResponses.length === 0) return;

  const keyword = userMsg.keyword || '원고';
  const sanitizedKeyword = keyword.slice(0, 30).replace(/[/\\?%*:|"<>]/g, '_');
  const content = botResponses.map((r) => r.content).join('\n\n---\n\n');

  const resultLength = content.replace(/\s+/g, '').length;
  const fileName = `${sanitizedKeyword}-${resultLength}`;

  downloadText({ content, fileName });
  closeOverlay();
};

const handleCopy = async () => {
  if (!selectedDocument.value) return;

  const botResponses = getBotResponses(selectedDocument.value);
  if (botResponses.length === 0) return;

  const content = botResponses.map((r) => r.content).join('\n\n---\n\n');
  const success = await copyText(content);
  closeOverlay();
};

const handleCopyRef = async () => {
  if (!selectedDocument.value?.ref) return;
  await copyText(selectedDocument.value.ref);
  closeOverlay();
};

const handleCopyKeyword = async () => {
  if (!selectedDocument.value?.keyword) return;
  await copyText(selectedDocument.value.keyword);
  closeOverlay();
};

const handleDelete = () => {
  if (!selectedDocument.value) return;

  const userIndex = messages.value.findIndex(
    (m) => m.id === selectedDocument.value?.id
  );
  if (userIndex === -1) return;

  const indicesToDelete: number[] = [userIndex];
  for (let i = userIndex + 1; i < messages.value.length; i++) {
    const msg = messages.value[i];
    if (msg.role === 'user') break;
    if (msg.role === 'bot') {
      indicesToDelete.push(i);
    }
  }

  indicesToDelete.reverse().forEach((idx) => {
    deleteMessage(idx);
  });

  closeOverlay();
};

const formatTime = (timestamp: number | undefined) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getMessageTitle = (msg: Message) => {
  if (msg.keyword) return msg.keyword;
  if (msg.content && msg.content !== 'loading') {
    return msg.content.slice(0, 30) + '...';
  }
  return '제목 없음';
};
</script>

<template>
  <div class="document-panel" :class="{ 'panel-closed': !isOpen }">
    <div class="panel-header">
      <button
        v-if="!isOpen"
        class="toggle-btn"
        @click="togglePanel"
        aria-label="패널 펼치기"
      >
        <span class="toggle-icon">◀</span>
      </button>

      <template v-if="isOpen">
        <h2 v-if="!isSelectionMode" class="panel-title">
          원고 목록 ({{ generatingMessages.length + completedMessages.length }})
        </h2>
        <h2 v-else class="panel-title">
          {{ selectedMessageIds.size }}개 선택됨
        </h2>

        <div class="header-actions">
          <!-- 선택 모드가 아닐 때 -->
          <button
            v-if="!isSelectionMode && completedMessages.length > 0"
            class="action-btn"
            @click="toggleSelectionMode"
            title="원고 선택"
          >
            <n-icon :component="CheckmarkCircleIcon" />
          </button>

          <!-- 선택 모드일 때 -->
          <template v-if="isSelectionMode">
            <button
              class="action-btn"
              @click="selectAllMessages"
              title="모두 선택"
            >
              <n-icon :component="CheckmarkIcon" />
            </button>
            <button
              class="action-btn"
              @click="handleDownloadSelected"
              :disabled="selectedMessageIds.size === 0"
              title="다운로드"
            >
              <n-icon :component="DownloadIcon" />
            </button>
            <button
              class="action-btn"
              @click="toggleSelectionMode"
              title="취소"
            >
              <n-icon :component="CloseIcon" />
            </button>
          </template>

          <!-- 패널 닫기 -->
          <button
            v-if="!isSelectionMode"
            class="toggle-btn close-btn"
            @click="togglePanel"
            aria-label="패널 접기"
          >
            <n-icon :component="CloseIcon" />
          </button>
        </div>
      </template>
    </div>

    <div v-if="isOpen" class="panel-content">
      <!-- 생성 중인 원고 -->
      <section v-if="generatingMessages.length > 0" class="section">
        <h3 class="section-title">생성 중 ({{ generatingMessages.length }})</h3>
        <div class="document-list">
          <div
            v-for="msg in generatingMessages"
            :key="msg.id"
            class="document-item generating"
          >
            <div class="document-title-wrap">
              <div class="document-title">{{ getMessageTitle(msg) }}</div>
              <button
                class="cancel-btn-mini"
                @click="cancelCurrentRequest"
                aria-label="생성 취소"
              >
                <n-icon :component="CloseIcon" :size="12" />
              </button>
            </div>
            <div class="progress-wrapper">
              <div class="progress-bar">
                <div
                  class="progress-fill"
                  :style="{ width: `${msg.loadingProgress || 0}%` }"
                ></div>
              </div>
              <span class="progress-text">{{ msg.loadingProgress || 0 }}%</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 완료된 원고 -->
      <section v-if="completedMessages.length > 0" class="section">
        <h3 class="section-title">완료됨 ({{ completedMessages.length }})</h3>
        <div class="document-list">
          <div
            v-for="msg in completedMessages"
            :key="msg.id"
            class="document-item completed"
            :class="{
              'selection-mode': isSelectionMode,
              selected: isMessageSelected(msg.id),
            }"
            @click="handleDocumentClick(msg)"
          >
            <div
              v-if="isSelectionMode"
              class="checkbox"
              :class="{ checked: isMessageSelected(msg.id) }"
            >
              <n-icon
                v-if="isMessageSelected(msg.id)"
                :component="CheckmarkIcon"
                :size="14"
                color="white"
              />
            </div>
            <div class="document-title">{{ getMessageTitle(msg) }}</div>
          </div>
        </div>
      </section>

      <!-- 빈 상태 -->
      <div
        v-if="generatingMessages.length === 0 && completedMessages.length === 0"
        class="empty-state"
      >
        <p>아직 생성된 원고가 없습니다.</p>
      </div>
    </div>

    <!-- 작업 선택 오버레이 -->
    <Teleport to="body">
      <div
        v-if="showActionOverlay"
        class="action-overlay"
        @click="closeOverlay"
      >
        <div class="action-modal" @click.stop>
          <div class="action-header">
            <h3 class="action-title">작업 선택</h3>
            <button
              class="action-close"
              @click="closeOverlay"
              aria-label="닫기"
            >
              <n-icon :component="CloseIcon" />
            </button>
          </div>

          <div class="action-preview">
            <div class="preview-title">
              {{ getMessageTitle(selectedDocument!) }}
            </div>
            <div class="preview-meta">
              <span class="service-badge">{{ selectedDocument?.service }}</span>
              <span class="timestamp">{{
                formatTime(selectedDocument?.timestamp)
              }}</span>
            </div>
          </div>

          <div class="action-list">
            <button class="action-button" @click="handleCopy">
              <span class="action-icon">📋</span>
              <span class="action-label">내용 복사</span>
            </button>

            <button
              class="action-button"
              @click="handleCopyKeyword"
              :disabled="!selectedDocument?.keyword"
            >
              <span class="action-icon">🏷️</span>
              <span class="action-label">키워드 복사</span>
            </button>

            <button
              class="action-button"
              @click="handleCopyRef"
              :disabled="!selectedDocument?.ref"
            >
              <span class="action-icon">📝</span>
              <span class="action-label">참조원고 복사</span>
            </button>

            <button class="action-button" @click="handleDownload">
              <span class="action-icon">💾</span>
              <span class="action-label">다운로드</span>
            </button>

            <button class="action-button danger" @click="handleDelete">
              <span class="action-icon">🗑️</span>
              <span class="action-label">삭제하기</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.document-panel {
  position: fixed;
  top: 50%;
  right: 0;
  width: 280px;
  min-width: 280px;
  height: calc(100vh - var(--header-h, 84px) - var(--footer-h, 140px));
  max-height: calc(100vh - var(--header-h, 84px) - 140px);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-left: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 16px 0 0 16px;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  z-index: 50;
  transform: translateY(-50%);
}

.panel-closed {
  width: 56px;
  min-width: 56px;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  background: rgba(255, 255, 255, 0.5);
  position: sticky;
  top: 0;
  z-index: 10;
}

.panel-closed .panel-header {
  justify-content: center;
  border-bottom: none;
}

.toggle-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: none;
  background: rgba(99, 102, 241, 0.1);
  color: #6366f1;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.toggle-btn:hover {
  background: rgba(99, 102, 241, 0.2);
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.2);
}

.toggle-btn:active {
  transform: scale(0.95);
}

.toggle-icon {
  font-size: 16px;
}

.panel-title {
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  white-space: nowrap;
  flex: 1;
  text-align: left;
  margin-right: auto;
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0;
}

.document-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  max-width: 100%;
}

.document-item {
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  background: white;
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: all 0.2s;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.document-item.completed {
  cursor: pointer;
  padding: 12px;
}

.document-item.completed:hover {
  border-color: #6366f1;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.15);
  transform: translateY(-1px);
  background: rgba(99, 102, 241, 0.02);
}

.document-item.selection-mode {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
}

.document-item.selected {
  border-color: #6366f1 !important;
  background: rgba(99, 102, 241, 0.1) !important;
}

.checkbox {
  width: 20px;
  height: 20px;
  border: 2px solid #d1d5db;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;
}

.checkbox.checked {
  background: #6366f1;
  border-color: #6366f1;
}

.checkmark {
  color: white;
  font-size: 14px;
  font-weight: bold;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: rgba(99, 102, 241, 0.1);
  color: #6366f1;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.action-btn:hover:not(:disabled) {
  background: rgba(99, 102, 241, 0.2);
  transform: scale(1.05);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.document-item.generating {
  border-color: rgba(16, 185, 129, 0.3);
  background: rgba(16, 185, 129, 0.02);
}

.document-title-wrap {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.document-title {
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
  max-width: 100%;
}

.progress-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #059669);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 11px;
  font-weight: 600;
  color: #10b981;
  min-width: 35px;
  text-align: right;
}

.cancel-btn-mini {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: none;
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.cancel-btn-mini:hover {
  background: rgba(239, 68, 68, 0.2);
  transform: scale(1.1);
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #94a3b8;
  font-size: 14px;
  text-align: center;
}

/* 스크롤바 스타일링 */
.panel-content::-webkit-scrollbar {
  width: 6px;
}

.panel-content::-webkit-scrollbar-track {
  background: transparent;
}

.panel-content::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

.panel-content::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.2);
}

/* 작업 선택 오버레이 */
.action-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.action-modal {
  width: 90%;
  max-width: 400px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.action-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

.action-title {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.action-close {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: rgba(0, 0, 0, 0.05);
  color: #64748b;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.action-close:hover {
  background: rgba(0, 0, 0, 0.1);
  transform: scale(1.05);
}

.action-preview {
  padding: 20px 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.preview-title {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
  line-height: 1.4;
}

.preview-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-list {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 12px;
  border: none;
  background: rgba(0, 0, 0, 0.02);
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.action-button:hover {
  background: rgba(99, 102, 241, 0.1);
  transform: translateX(4px);
}

.action-button.danger:hover {
  background: rgba(239, 68, 68, 0.1);
}

.action-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.action-label {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  flex: 1;
}

.action-button.danger .action-label {
  color: #ef4444;
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-button:disabled:hover {
  background: rgba(0, 0, 0, 0.02);
  transform: none;
}

/* 반응형 */
@media (max-width: 768px) {
  .document-panel {
    width: 280px;
  }

  .panel-closed {
    width: 40px;
  }

  .action-modal {
    max-width: 90%;
    margin: 20px;
  }
}
</style>
