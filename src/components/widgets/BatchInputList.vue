<script setup lang="ts">
import { computed } from 'vue';
import { NButton, NSpace } from 'naive-ui';
import ModernInput from '@/components/ui/ModernInput.vue';
import type { BatchRequest } from '@/types/_chat';
import { Trash as TrashIcon } from '@vicons/ionicons5';

const props = defineProps<{
  requests: BatchRequest[];
  statuses: Record<string, 'pending' | 'loading' | 'success' | 'error'>;
  maxCount?: number;
}>();

const emit = defineEmits<{
  'add': [];
  'remove': [index: number];
  'update': [index: number, updates: Partial<BatchRequest>];
}>();

const maxCountValue = computed(() => props.maxCount || 10);

const handleAddRequest = () => {
  emit('add');
};

const handleRemoveRequest = (index: number) => {
  emit('remove', index);
};

const handleKeywordUpdate = (index: number, value: string) => {
  emit('update', index, { keyword: value });
};

const handleRefMsgUpdate = (index: number, value: string) => {
  emit('update', index, { refMsg: value });
};

const getStatusText = (status: 'pending' | 'loading' | 'success' | 'error') => {
  const statusMap = {
    pending: '대기 중',
    loading: '생성 중...',
    success: '✓ 완료',
    error: '✗ 실패',
  };
  return statusMap[status];
};

const getStatusClass = (status: 'pending' | 'loading' | 'success' | 'error') => {
  return `status-${status}`;
};
</script>

<template>
  <div class="batch-list">
    <TransitionGroup name="batch-item">
      <article
        v-for="(req, idx) in requests"
        :key="req.id"
        class="batch-item-card"
      >
        <header class="batch-item-header">
          <span class="batch-number">{{ idx + 1 }}</span>
          <n-button
            size="tiny"
            type="error"
            @click="handleRemoveRequest(idx)"
            :quaternary="true"
            aria-label="삭제"
          >
            <template #icon>
              <component :is="TrashIcon" />
            </template>
          </n-button>
        </header>

        <n-space vertical :size="12">
          <ModernInput
            :value="req.keyword"
            @update:value="(val) => handleKeywordUpdate(idx, val)"
            placeholder="키워드를 입력해주세요"
            type="text"
          />

          <ModernInput
            :value="req.refMsg || ''"
            @update:value="(val) => handleRefMsgUpdate(idx, val)"
            placeholder="참조원고 (선택)"
            type="textarea"
            :rows="2"
            :autosize="{ minRows: 2, maxRows: 4 }"
          />

          <div v-if="statuses[req.id]" class="batch-status">
            <span :class="getStatusClass(statuses[req.id])">
              {{ getStatusText(statuses[req.id]) }}
            </span>
          </div>
        </n-space>
      </article>
    </TransitionGroup>

    <n-button
      @click="handleAddRequest"
      :disabled="requests.length >= maxCountValue"
      dashed
      block
      size="large"
      class="add-batch-btn"
    >
      + 원고 추가 ({{ requests.length }}/{{ maxCountValue }})
    </n-button>
  </div>
</template>

<style scoped>
.batch-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
}

.batch-item-card {
  background: linear-gradient(145deg, #f8fafc, #f1f5f9);
  border-radius: 16px;
  padding: 16px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.batch-item-card:hover {
  border-color: rgba(99, 102, 241, 0.3);
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.1);
}

.batch-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.batch-number {
  font-weight: 700;
  font-size: 16px;
  color: #6366f1;
  background: rgba(99, 102, 241, 0.1);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.batch-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.03);
  font-size: 13px;
  font-weight: 500;
}

.status-pending {
  color: #6b7280;
}

.status-loading {
  color: #f59e0b;
  animation: pulse 1.5s ease-in-out infinite;
}

.status-success {
  color: #10b981;
}

.status-error {
  color: #ef4444;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.add-batch-btn {
  margin-top: 8px;
  border: 2px dashed rgba(99, 102, 241, 0.3);
  color: #6366f1;
  font-weight: 600;
  transition: all 0.2s ease;
}

.add-batch-btn:hover:not(:disabled) {
  border-color: rgba(99, 102, 241, 0.5);
  background: rgba(99, 102, 241, 0.05);
}

.add-batch-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* 애니메이션 */
.batch-item-enter-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.batch-item-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.batch-item-enter-from {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}

.batch-item-leave-to {
  opacity: 0;
  transform: translateX(20px) scale(0.95);
}

.batch-item-move {
  transition: transform 0.3s ease;
}
</style>
