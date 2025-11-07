<script setup lang="ts">
import type { SearchDocument } from '@/entities/search';

interface Props {
  document: SearchDocument;
}

interface Emits {
  (e: 'click', doc: SearchDocument): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const handleClick = () => {
  emit('click', props.document);
};
</script>

<template>
  <div
    class="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)] hover:shadow-[0_4px_16px_rgba(99,102,241,0.15)] dark:hover:shadow-[0_4px_16px_rgba(59,130,246,0.2)] transition-all hover:-translate-y-1 cursor-pointer border border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-blue-500"
    @click="handleClick"
  >
    <!-- Header -->
    <div class="flex items-start justify-between mb-3">
      <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100 line-clamp-2 flex-1">
        {{ document.keyword }}
      </h3>
      <div class="flex items-center gap-2 ml-2">
        <span
          v-if="document.category"
          class="px-2 py-1 text-xs font-semibold bg-indigo-500/10 dark:bg-blue-500/20 text-indigo-600 dark:text-blue-400 rounded-md"
        >
          {{ document.category }}
        </span>
      </div>
    </div>

    <!-- Content Preview -->
    <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-3">
      {{ document.content.substring(0, 150) }}{{ document.content.length > 150 ? '...' : '' }}
    </p>

    <!-- Footer -->
    <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
      <div class="flex items-center gap-2">
        <span class="font-medium">{{ document.engine }}</span>
        <span>•</span>
        <span>{{ formatDate(document.timestamp) }}</span>
      </div>
      <span class="text-indigo-500 dark:text-blue-400 font-semibold">
        클릭하여 복사
      </span>
    </div>
  </div>
</template>
