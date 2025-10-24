<script setup lang="ts">
import { computed } from 'vue';
import { NProgress } from 'naive-ui';
import {
  Copy as CopyIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  Information as InfoIcon,
  Options as OptionsIcon,
} from '@vicons/ionicons5';
import { renderMarkdown } from '../../utils/_markdown';
import type { Message } from '../../types/_chat';
import { MODEL_OPTIONS } from '../../constants/_models';
import ModernButton from '../ui/ModernButton.vue';
import { useChatStore } from '@/stores';

interface Props {
  message: Message;
  index: number;
}

interface Emits {
  copy: [text: string, message: any];
  download: [message: Message];
  regenerate: [message: Message];
  delete: [index: number];
  showDetail: [message: Message];
  showWorkModal: [message: Message];
}

const props = defineProps<Props>();
defineEmits<Emits>();

const { openActionModal } = useChatStore();

const renderedContent = computed(() => {
  if (props.message.content === 'loading') return '';

  if (props.index === 0) {
    return renderMarkdown(props.message.content);
  }

  return props.message.content.replace(/\n/g, '<br>');
});

const formatTime = (timestamp?: number) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getServiceLabel = (service?: string) => {
  if (!service) return 'Unknown';
  const option = MODEL_OPTIONS.find((opt) => opt.value === service);
  return option?.label || service;
};

const handleUserMessageClick = (userMsg: any) => {
  console.log(userMsg);
  openActionModal(userMsg);
};

</script>

<template>
  <article
    :class="['message-bubble', `message-bubble--${message.role}`]"
    role="article"
    :aria-label="
      message.role === 'user' ? '사용자 메시지' : 'AI 어시스턴트 메시지'
    "
  >
    <div class="message-content">
      <div class="message-body">
        <header class="message-header">
          <span class="message-sender">
            {{ message.role === 'user' ? 'You' : 'AI Assistant' }}
          </span>
          <time
            class="message-time"
            :datetime="new Date(message.timestamp || 0).toISOString()"
          >
            {{ formatTime(message.timestamp) }}
          </time>
        </header>

        <main class="message-text">
          <section
            v-if="message.content === 'loading'"
            class="loading-message"
            aria-live="polite"
            aria-label="AI 응답 생성 중"
          >
            <div class="progress-container">
              <NProgress
                type="line"
                :percentage="message.loadingProgress || 0"
                :show-indicator="false"
                :height="8"
                color="#6366f1"
                rail-color="rgba(99, 102, 241, 0.1)"
              />
              <span class="progress-text">{{ message.loadingProgress || 0 }}%</span>
            </div>
          </section>

          <section
            v-else
            @dblclick="
              message.content !== 'loading' &&
                $emit('copy', message.content, message)
            "
            role="document"
          >
            <!-- 사용자 메시지일 때 추가 정보 표시 -->
            <aside
              v-if="message.role === 'user'"
              class="user-message-info"
              aria-label="메시지 생성 정보"
            >
              <div class="generation-info">
                <span class="keyword-label">키워드:</span>
                {{ message.keyword }}
                <span class="service-label">서비스:</span>
                {{ getServiceLabel(message.service) }}
                <span class="ref-status" :class="{ 'has-ref': message.ref }">
                  {{ message.ref ? '참조원고 있음' : '참조원고 없음' }}
                </span>
              </div>
            </aside>

            <div
              v-show="message.role === 'bot'"
              class="message-content-text"
              v-html="renderedContent"
              role="document"
              aria-label="AI 응답 내용"
            ></div>
          </section>
        </main>

        <footer class="message-actions" role="toolbar" aria-label="메시지 액션">
          <nav
            v-if="message.content !== 'loading'"
            class="bot-actions"
            aria-label="메시지 액션 버튼"
          >
            <ModernButton
              variant="ghost"
              size="sm"
              :icon="CopyIcon"
              @click="$emit('copy', message.content, message)"
              class="action-btn"
              aria-label="메시지 내용 복사"
            >
              복사
            </ModernButton>

            <ModernButton
              variant="ghost"
              size="sm"
              :icon="DownloadIcon"
              @click="$emit('download', message)"
              class="action-btn"
              aria-label="메시지 파일로 저장"
            >
              저장
            </ModernButton>

            <ModernButton
              variant="ghost"
              size="sm"
              :icon="RefreshIcon"
              @click="$emit('regenerate', message)"
              class="action-btn"
              aria-label="AI 응답 재생성"
            >
              재생성
            </ModernButton>

            <ModernButton
              variant="ghost"
              size="sm"
              :icon="InfoIcon"
              @click="$emit('showDetail', message)"
              class="action-btn"
              aria-label="메시지 상세정보 보기"
            >
              상세정보
            </ModernButton>

            <ModernButton
              variant="ghost"
              size="sm"
              :icon="OptionsIcon"
              @click="handleUserMessageClick(message)"
              class="action-btn"
              aria-label="메시지 작업선택"
            >
              작업선택
            </ModernButton>
          </nav>

          <ModernButton
            v-if="index > 0"
            variant="ghost"
            size="sm"
            :icon="CloseIcon"
            @click="$emit('delete', index)"
            class="action-btn delete-btn"
            title="메시지 삭제"
            aria-label="이 메시지 삭제"
          >
            삭제
          </ModernButton>
        </footer>
      </div>
    </div>
  </article>
</template>

<style scoped>
.message-bubble {
  display: flex;
  margin-bottom: 24px;
  animation: slideIn 0.4s ease-out;
}

.message-bubble--user {
  justify-content: flex-end;
}

.message-bubble--bot {
  justify-content: flex-start;
}

.message-content {
  display: flex;
  gap: 12px;
  max-width: 80%;
  align-items: flex-start;
}

.message-bubble--user .message-content {
  flex-direction: row-reverse;
}

/* Avatar */
.message-avatar {
  flex-shrink: 0;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.avatar--user {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
}

.avatar--bot {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

/* Message Checkbox */
/* Message Body */
.message-body {
  flex: 1;
  min-width: 0;
}

.message-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.message-sender {
  font-size: 16px;
  font-weight: 600;
  opacity: 0.7;
}

.message-bubble--user .message-sender {
  color: #000000;
}

.message-bubble--bot .message-sender {
  color: #000000;
}

.message-time {
  font-size: 16px;
  opacity: 0.5;
  color: #000000;
}

/* Message Text */
.message-text {
  background: white;
  padding: 16px 20px;
  border-radius: 18px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.06);
  position: relative;
  transition: all 0.2s ease;
}

.message-bubble--user .message-text {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #eeeeee;
  border-color: rgba(59, 130, 246, 0.3);
}

.message-bubble--bot .message-text {
  background: rgba(16, 185, 129, 0.05);
  border-color: rgba(16, 185, 129, 0.1);
  color: #000000;
}

.message-text:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

/* Speech bubble tail */
.message-text::before {
  content: '';
  position: absolute;
  top: 12px;
  width: 0;
  height: 0;
  border-top: 8px solid transparent;
  border-bottom: 8px solid transparent;
}

.message-bubble--user .message-text::before {
  right: -8px;
  border-left: 8px solid #3b82f6;
}

.message-bubble--bot .message-text::before {
  left: -8px;
  border-right: 8px solid rgba(16, 185, 129, 0.05);
}

/* Loading Animation */
.loading-message {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 12px 0;
}

.progress-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  max-width: 400px;
}

.progress-text {
  font-size: 14px;
  color: #6366f1;
  font-weight: 600;
  text-align: right;
}

/* Message Actions */
.message-actions {
  margin-top: 8px;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.message-bubble:hover .message-actions {
  opacity: 1;
}

.bot-actions {
  display: flex;
  gap: 4px;
}

.action-btn {
  font-size: 16px !important;
  padding: 8px 12px !important;
  height: auto !important;
  border-radius: 8px !important;
}

.delete-btn {
  color: #ef4444 !important;
  border-color: rgba(239, 68, 68, 0.2) !important;
}

.delete-btn:hover {
  background: rgba(239, 68, 68, 0.1) !important;
  border-color: rgba(239, 68, 68, 0.3) !important;
}

/* User Message Info */
.user-message-info {
  padding: 8px;
  border-radius: 8px;
  font-size: 16px;
}

.generation-info {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  max-height: calc(1.6em * 3);
  overflow: hidden;
  line-height: 1.6;
}

.keyword-label,
.service-label {
  font-weight: 600;
  opacity: 0.8;
}

.ref-status {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
}

.ref-status.has-ref {
  background: #059669;
  color: white;
}

.ref-status:not(.has-ref) {
  background: #dc2626;
  color: white;
}

/* Content Styling */
.message-content-text {
  line-height: 1.6;
  font-size: 16px;
  word-break: break-word;
}

:deep(.message-content-text h1),
:deep(.message-content-text h2),
:deep(.message-content-text h3) {
  margin: 16px 0 8px 0;
  font-weight: 600;
  color: #000000;
}

:deep(.message-content-text p) {
  margin: 8px 0;
  color: #000000;
}

:deep(.message-content-text ul),
:deep(.message-content-text ol) {
  margin: 12px 0;
  padding-left: 20px;
}

:deep(.message-content-text li) {
  margin: 4px 0;
  color: #000000;
}

:deep(.message-content-text code) {
  background: rgba(0, 0, 0, 0.05);
  padding: 2px 4px;
  border-radius: 4px;
  font-size: 1em;
  font-family: ui-monospace, 'SF Mono', Monaco, monospace;
}

.message-bubble--user :deep(.message-content-text code) {
  background: rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.9);
}

:deep(.message-content-text pre) {
  background: rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  padding: 12px;
  margin: 12px 0;
  overflow-x: auto;
}

.message-bubble--user :deep(.message-content-text pre) {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

:deep(.message-content-text blockquote) {
  border-left: 3px solid #10b981;
  margin: 12px 0;
  padding: 8px 16px;
  background: rgba(16, 185, 129, 0.05);
  border-radius: 0 8px 8px 0;
}

:deep(.message-content-text a) {
  color: #3b82f6;
  text-decoration: underline;
}

.message-bubble--user :deep(.message-content-text a) {
  color: rgba(255, 255, 255, 0.9);
}

/* Responsive */
@media (max-width: 768px) {
  .message-content {
    max-width: 100%;
    gap: 8px;
  }

  .message-text {
    padding: 16px 20px;
    border-radius: 16px;
    font-size: 16px;
  }

  .message-content-text {
    font-size: 16px;
    line-height: 1.6;
  }

  .avatar {
    width: 40px;
    height: 40px;
    font-size: 16px;
  }

  .message-header {
    gap: 12px;
    margin-bottom: 8px;
  }

  .message-sender {
    font-size: 16px;
  }

  .message-time {
    font-size: 16px;
  }

  .user-message-info {
    padding: 12px;
    font-size: 16px;
  }

  .generation-info {
    gap: 8px;
    flex-direction: column;
    align-items: flex-start;
  }

  .ref-status {
    font-size: 16px;
    padding: 4px 8px;
  }

  .message-actions {
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 12px;
  }

  .bot-actions {
    gap: 6px;
    flex-wrap: wrap;
  }

  .action-btn {
    font-size: 16px !important;
    padding: 10px 14px !important;
    min-height: 44px !important;
    min-width: 80px !important;
  }

  .loading-text {
    font-size: 16px;
  }

  .typing-indicator span {
    width: 10px;
    height: 10px;
  }
}

@media (max-width: 480px) {
  .message-bubble {
    margin-bottom: 20px;
  }

  .message-content {
    max-width: 100%;
    gap: 6px;
  }

  .message-text {
    padding: 14px 18px;
    border-radius: 14px;
  }

  .message-header {
    gap: 8px;
    margin-bottom: 6px;
  }

  .user-message-info {
    padding: 10px;
  }

  .generation-info {
    gap: 6px;
  }

  .action-btn {
    font-size: 16px !important;
    padding: 12px 16px !important;
    min-height: 48px !important;
    flex: 1;
    justify-content: center;
  }

  .bot-actions {
    width: 100%;
    justify-content: space-between;
  }

  .message-actions {
    margin-top: 16px;
  }
}

/* Animations */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Stagger animation for multiple messages */
.message-bubble:nth-child(1) {
  animation-delay: 0s;
}
.message-bubble:nth-child(2) {
  animation-delay: 0.1s;
}
.message-bubble:nth-child(3) {
  animation-delay: 0.2s;
}
.message-bubble:nth-child(4) {
  animation-delay: 0.3s;
}
.message-bubble:nth-child(5) {
  animation-delay: 0.4s;
}
</style>
