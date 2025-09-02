<script setup lang="ts">
import { computed } from 'vue';
import {
  Copy as CopyIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
} from '@vicons/ionicons5';
import { renderMarkdown } from '../../utils/_markdown';
import type { Message } from '../../types/_chat';
import ModernButton from '../ui/ModernButton.vue';

interface Props {
  message: Message;
  index: number;
}

interface Emits {
  copy: [text: string];
  download: [message: Message];
  regenerate: [message: Message];
  delete: [index: number];
}

const props = defineProps<Props>();
defineEmits<Emits>();

const renderedContent = computed(() => {
  if (props.message.content === 'loading') return '';
  return renderMarkdown(props.message.content);
});

const formatTime = (timestamp?: number) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  });
};
</script>

<template>
  <div :class="['message-bubble', `message-bubble--${message.role}`]">
    <div class="message-content">
      <div class="message-avatar"></div>

      <div class="message-body">
        <div class="message-header">
          <span class="message-sender">
            {{ message.role === 'user' ? 'You' : 'AI Assistant' }}
          </span>
          <span class="message-time">
            {{ formatTime(message.timestamp) }}
          </span>
        </div>

        <div class="message-text">
          <div v-if="message.content === 'loading'" class="loading-message">
            <div class="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span class="loading-text">AI가 응답을 생성하고 있습니다...</span>
          </div>

          <div
            v-else
            class="message-content-text"
            v-html="renderedContent"
          ></div>
        </div>

        <div class="message-actions">
          <div v-if="message.content !== 'loading'" class="bot-actions">
            <ModernButton
              variant="ghost"
              size="sm"
              :icon="CopyIcon"
              @click="$emit('copy', message.content)"
              class="action-btn"
            >
              복사
            </ModernButton>

            <ModernButton
              variant="ghost"
              size="sm"
              :icon="DownloadIcon"
              @click="$emit('download', message)"
              class="action-btn"
            >
              저장
            </ModernButton>

            <ModernButton
              variant="ghost"
              size="sm"
              :icon="RefreshIcon"
              @click="$emit('regenerate', message)"
              class="action-btn"
            >
              재생성
            </ModernButton>
          </div>

          <ModernButton
            v-if="index > 0"
            variant="ghost"
            size="sm"
            :icon="CloseIcon"
            @click="$emit('delete', index)"
            class="action-btn delete-btn"
            title="메시지 삭제"
          >
            삭제
          </ModernButton>
        </div>
      </div>
    </div>
  </div>
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
  font-size: 12px;
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
  font-size: 11px;
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
  gap: 12px;
}

.typing-indicator {
  display: flex;
  gap: 4px;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  background: #10b981;
  border-radius: 50%;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(1) {
  animation-delay: -0.32s;
}
.typing-indicator span:nth-child(2) {
  animation-delay: -0.16s;
}
.typing-indicator span:nth-child(3) {
  animation-delay: 0s;
}

.loading-text {
  font-size: 16px;
  color: #000000;
  font-style: italic;
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
  font-size: 12px !important;
  padding: 4px 8px !important;
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
    max-width: 95%;
  }

  .message-text {
    padding: 12px 16px;
    border-radius: 16px;
  }

  .avatar {
    width: 36px;
    height: 36px;
    font-size: 16px;
  }

  .message-actions {
    flex-wrap: wrap;
    gap: 2px;
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

@keyframes typing {
  0%,
  60%,
  100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  30% {
    transform: translateY(-10px);
    opacity: 1;
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
