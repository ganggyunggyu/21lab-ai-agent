<script setup lang="ts">
import { computed, watch, ref } from 'vue';
import { NModal, NButton, NSpace } from 'naive-ui';
import {
  Information as InfoIcon,
  Copy as CopyIcon,
  Close as CloseIcon,
} from '@vicons/ionicons5';
import type { Message } from '@/types/_chat';
import { MODEL_OPTIONS } from '@/constants/_models';
import { copyText } from '@/utils/_copyText';

interface Props {
  show: boolean;
  message: Message | null;
}

interface Emits {
  close: [];
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const localShow = ref(false);

watch(() => props.show, (newValue) => {
  localShow.value = newValue;
});

watch(localShow, (newValue) => {
  if (!newValue && props.show) {
    emit('close');
  }
});

const handleClose = () => {
  localShow.value = false;
  emit('close');
};

const getServiceLabel = (service?: string) => {
  if (!service) return 'Unknown';
  const option = MODEL_OPTIONS.find((opt) => opt.value === service);
  return option?.label || service;
};

const formatTime = (timestamp?: number) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

const handleCopyKeyword = async () => {
  if (props.message?.keyword) {
    await copyText(props.message.keyword);
  }
};

const handleCopyRef = async () => {
  if (props.message?.ref) {
    await copyText(props.message.ref);
  }
};

const handleCopyContent = async () => {
  if (props.message?.content) {
    await copyText(props.message.content);
  }
};
</script>

<template>
  <n-modal
    v-model:show="localShow"
    preset="card"
    class="message-detail-modal"
    @mask-click="handleClose"
    @esc="handleClose"
  >
    <template #header>
      <header class="modal-header">
        <InfoIcon class="modal-badge-icon" />
        <h2>메시지 상세정보</h2>
      </header>
    </template>

    <main v-if="message" class="modal-content">
      <section class="modal-section">
        <header class="modal-item-header">
          <h3>역할:</h3>
        </header>
        <p class="modal-text">
          {{ message.role === 'user' ? '사용자' : 'AI 어시스턴트' }}
        </p>
      </section>

      <section v-if="message.keyword" class="modal-section">
        <header class="modal-item-header">
          <h3>키워드:</h3>
          <n-button
            size="tiny"
            @click="handleCopyKeyword"
            aria-label="키워드 복사"
          >
            복사
          </n-button>
        </header>
        <p class="modal-text">{{ message.keyword }}</p>
      </section>

      <section v-if="message.service" class="modal-section">
        <header class="modal-item-header">
          <h3>AI 서비스:</h3>
        </header>
        <p class="modal-text">{{ getServiceLabel(message.service) }}</p>
      </section>

      <section v-if="message.ref" class="modal-section">
        <header class="modal-item-header">
          <h3>참조원고:</h3>
          <n-button
            size="tiny"
            @click="handleCopyRef"
            aria-label="참조원고 복사"
          >
            복사
          </n-button>
        </header>
        <article class="preview-container">
          {{ message.ref }}
        </article>
      </section>

      <section class="modal-section">
        <header class="modal-item-header">
          <h3>메시지 내용:</h3>
          <n-button
            size="tiny"
            @click="handleCopyContent"
            aria-label="메시지 내용 복사"
          >
            복사
          </n-button>
        </header>
        <article class="preview-container">
          {{ message.content }}
        </article>
      </section>

      <section v-if="message.timestamp" class="modal-section">
        <header class="modal-item-header">
          <h3>생성시간:</h3>
        </header>
        <p class="modal-text">{{ formatTime(message.timestamp) }}</p>
      </section>

      <section v-if="message.id" class="modal-section">
        <header class="modal-item-header">
          <h3>메시지 ID:</h3>
        </header>
        <p class="modal-text">{{ message.id }}</p>
      </section>
    </main>

    <template #action>
      <n-space justify="end">
        <n-button @click="handleClose" type="primary">
          닫기
        </n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<style scoped>
.message-detail-modal {
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
  color: #374151;
}

.modal-badge-icon {
  width: 18px;
  height: 18px;
  color: #3b82f6;
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
  color: #374151;
}

.modal-text {
  margin: 0;
  color: #374151;
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
  color: #374151;
}

:global(.dark) .modal-header h2,
:global(.dark) .modal-item-header h3,
:global(.dark) .modal-text {
  color: #d1d5db;
}

:global(.dark) .preview-container {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
  color: #d1d5db;
}
</style>