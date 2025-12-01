<script setup lang="ts">
import { Button } from '@/components/ui';
import {
  CopyOutline as CopyIcon,
  DownloadOutline as DownloadIcon,
} from '@vicons/ionicons5';
import { renderMarkdown } from '../utils/_markdown';
import { formatMessage } from '../utils/_formatMsg';
import { type ComponentPublicInstance } from 'vue';
import type { Message } from '../types/_chat';
import LoadingDots from './LoadingDots.vue';

const props = defineProps<{
  msg: Message;
  idx: number;
  isIntro: boolean;
  setLastMessageRef: (
    el: Element | ComponentPublicInstance | null,
    idx: number
  ) => void;
}>();

const emit = defineEmits<{
  (e: 'copy', text: string): void;
  (e: 'download', msg: Message): void;
}>();

const onCopy = () => emit('copy', props.msg.content);
const onDownload = () => emit('download', props.msg);
</script>

<template>
  <div :class="['message', msg.role]">
    <div
      class="bubble"
      :ref="(el) => setLastMessageRef(el, idx)"
      @dblclick="onCopy"
    >
      <div class="chat-content">
        <template v-if="msg.content === 'loading'">
          <LoadingDots />
        </template>
        <template v-else>
          <div
            v-html="
              isIntro ? renderMarkdown(msg.content) : formatMessage(msg.content)
            "
          />
        </template>
      </div>
      <div
        v-if="msg.role === 'bot' && msg.content !== 'loading' && !isIntro"
        class="action-buttons"
      >
        <Button
          class="copy-btn"
          size="sm"
          variant="ghost"
          :icon="CopyIcon"
          @click="onCopy"
        >
          복사
        </Button>
        <Button
          class="download-btn"
          size="sm"
          variant="ghost"
          :icon="DownloadIcon"
          @click="onDownload"
        >
          다운로드
        </Button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.message {
  display: flex;
  margin-bottom: 12px;
}
.message.user {
  justify-content: flex-end;
}
.message.bot {
  justify-content: flex-start;
}
.bubble {
  display: flex;
  flex-direction: column;
  gap: 3px;
  position: relative;
  padding: 12px;
  border-radius: 12px;
  word-break: break-word;
}
.message.user .bubble {
  background: #4f46e5;
  color: #fff;
  border-top-right-radius: 0;
}
.message.bot .bubble {
  background: #2d2d2d;
  color: #f0f0f0;
  border-top-left-radius: 0;
  max-width: 70vw;
}
.chat-content {
  line-height: 1.7;
  white-space: pre-wrap;
}

.action-buttons {
  display: flex;
  gap: 8px;
  margin-left: auto;
}

.copy-btn,
.download-btn {
  color: #93c5fd;
  transition: all 0.3s ease;
}
.copy-btn:hover,
.download-btn:hover {
  color: white;
  transform: scale(1.05);
}

.bubble :deep(h1) {
  font-size: 20px;
  color: #e5e7eb;
}
.bubble :deep(h2) {
  font-size: 18px;
  color: #e5e7eb;
}
.bubble :deep(h3) {
  font-size: 16px;
  color: #e5e7eb;
}
.bubble :deep(ul) {
  margin: 0 0 0 20px;
  list-style: disc;
}
.bubble :deep(ol) {
  margin: 0 0 0 20px;
  list-style: decimal;
}
.bubble :deep(code),
.bubble :deep(kbd) {
  background: #111827;
  padding: 2px 6px;
  border-radius: 6px;
}
.bubble :deep(blockquote) {
  padding: 8px 12px;
  border-left: 3px solid #4f46e5;
  background: #1f2937;
  border-radius: 6px;
}
</style>
