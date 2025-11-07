<script setup lang="ts">
import { computed } from 'vue';
import { NButton, NSpace } from 'naive-ui';
import { Input } from '@/components/ui';
import type { BatchRequest } from '@/types';
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
  <div class="flex flex-col gap-3 p-4">
    <TransitionGroup name="batch-item">
      <article
        v-for="(req, idx) in requests"
        :key="req.id"
        class="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-4 border border-black/8 transition-all duration-300 hover:border-indigo-500/30 hover:shadow-[0_4px_16px_rgba(99,102,241,0.1)]"
      >
        <header class="flex justify-between items-center mb-3">
          <span class="font-bold text-base text-indigo-500 bg-indigo-500/10 w-8 h-8 rounded-full flex items-center justify-center">
            {{ idx + 1 }}
          </span>
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
          <Input
            :value="req.keyword"
            @update:value="(val) => handleKeywordUpdate(idx, val)"
            placeholder="키워드를 입력해주세요"
            type="text"
          />

          <Input
            :value="req.refMsg || ''"
            @update:value="(val) => handleRefMsgUpdate(idx, val)"
            placeholder="참조원고 (선택)"
            type="textarea"
            :rows="2"
            :autosize="{ minRows: 2, maxRows: 4 }"
          />

          <div v-if="statuses[req.id]" class="flex items-center gap-2 px-3 py-2 rounded-lg bg-black/3 text-[13px] font-medium">
            <span
              :class="[
                statuses[req.id] === 'pending' && 'text-gray-600',
                statuses[req.id] === 'loading' && 'text-amber-600 animate-pulse',
                statuses[req.id] === 'success' && 'text-emerald-600',
                statuses[req.id] === 'error' && 'text-red-600'
              ]"
            >
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
      class="mt-2 border-2 border-dashed border-indigo-500/30 text-indigo-500 font-semibold transition-all duration-200 hover:border-indigo-500/50 hover:bg-indigo-500/5 disabled:opacity-40 disabled:cursor-not-allowed"
    >
      + 원고 추가 ({{ requests.length }}/{{ maxCountValue }})
    </n-button>
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
