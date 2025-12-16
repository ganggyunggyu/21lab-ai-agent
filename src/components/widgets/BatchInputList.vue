<script setup lang="ts">
import { Input, Button } from '@/components/ui';
import type { BatchRequest } from '@/types';
import { Trash as TrashIcon } from '@vicons/ionicons5';

const props = defineProps<{
  requests: BatchRequest[];
  statuses: Record<string, 'pending' | 'loading' | 'success' | 'error'>;
}>();

const emit = defineEmits<{
  'add': [];
  'remove': [index: number];
  'update': [index: number, updates: Partial<BatchRequest>];
}>();

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
  <div class="flex flex-col gap-3 p-4">
    <TransitionGroup name="batch-item">
      <article
        v-for="(req, idx) in requests"
        :key="req.id"
        class="flex flex-col gap-3 py-4 border-b border-gray-200 last:border-b-0"
      >
        <header class="flex justify-between items-center">
          <span class="font-semibold text-sm text-gray-500">
            #{{ idx + 1 }}
          </span>
          <Button
            size="sm"
            color="danger"
            @click="handleRemoveRequest(idx)"
            aria-label="삭제"
            :icon="TrashIcon"
          />
        </header>

        <Input
          :model-value="req.keyword"
          @update:model-value="(val: string) => handleKeywordUpdate(idx, val)"
          placeholder="키워드를 입력해주세요"
          type="text"
        />

        <Input
          :model-value="req.refMsg || ''"
          @update:model-value="(val: string) => handleRefMsgUpdate(idx, val)"
          placeholder="참조원고 (선택)"
          type="textarea"
          :rows="2"
        />

        <span
          v-if="statuses[req.id]"
          :class="[
            'text-[13px] font-medium',
            statuses[req.id] === 'pending' && 'text-gray-500',
            statuses[req.id] === 'loading' && 'text-amber-600 animate-pulse',
            statuses[req.id] === 'success' && 'text-emerald-600',
            statuses[req.id] === 'error' && 'text-red-600'
          ]"
        >
          {{ getStatusText(statuses[req.id]) }}
        </span>
      </article>
    </TransitionGroup>

    <Button
      @click="handleAddRequest"
      color="light"
      size="lg"
      class="mt-2 w-full border-2 border-dashed border-brand/30 text-brand font-semibold transition-all duration-200 hover:border-brand/50 hover:bg-brand/5"
    >
      + 원고 추가 ({{ requests.length }})
    </Button>
  </div>
</template>

<style scoped>
/* TransitionGroup 애니메이션 */
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
