<script setup lang="ts">
import { computed } from 'vue';
import {
  DocumentTextOutline as DocIcon,
  TimeOutline as TimeIcon,
  ServerOutline as EngineIcon,
  CopyOutline as CopyIcon,
  EyeOutline as EyeIcon,
  EyeOffOutline as EyeOffIcon,
} from '@vicons/ionicons5';
import type { SearchDocument } from '@/entities/search';

interface Props {
  document: SearchDocument;
}

interface Emits {
  (e: 'click', doc: SearchDocument): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const formatDate = (doc: SearchDocument) => {
  let date: Date | null = null;

  if (doc.createdAt) {
    date = new Date(doc.createdAt);
  } else if ((doc as any).timestamp) {
    const ts = (doc as any).timestamp;
    date = new Date(ts < 10000000000 ? ts * 1000 : ts);
  }

  if (!date || isNaN(date.getTime())) return '';

  return date.toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const contentPreview = computed(() => {
  const content = props.document.content || '';
  const firstLine = content.split('\n')[0] || '';
  return firstLine.length > 80 ? firstLine.substring(0, 80) + '...' : firstLine;
});

const contentLength = computed(() => {
  const len = props.document.content?.length || 0;
  if (len >= 1000) return `${(len / 1000).toFixed(1)}k`;
  return len.toString();
});

const categoryLabel = computed(() => props.document.__category || props.document.category || '');

const isVisible = computed(() => props.document.isVisible === true);

const handleClick = () => {
  emit('click', props.document);
};
</script>

<template>
  <article
    class="group relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden cursor-pointer transition-all duration-200 hover:border-brand dark:hover:border-brand hover:shadow-[0_8px_30px_rgba(98,194,176,0.12)]"
    @click="handleClick"
  >
    <!-- 상단 카테고리 바 -->
    <div
      class="px-4 py-2 bg-linear-to-r from-brand/10 to-transparent border-b border-gray-100 dark:border-gray-700 flex items-center justify-between"
    >
      <span v-if="categoryLabel" class="text-xs font-semibold text-brand">{{ categoryLabel }}</span>
      <span v-else />
      <div
        class="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
        :class="isVisible
          ? 'bg-brand/10 text-brand'
          : 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
        "
      >
        <component :is="isVisible ? EyeIcon : EyeOffIcon" class="w-3 h-3" />
        {{ isVisible ? '노출' : '비노출' }}
      </div>
    </div>

    <!-- 메인 컨텐츠 -->
    <div class="p-4">
      <!-- 키워드 (제목) -->
      <h3 class="text-base font-bold text-gray-900 dark:text-gray-100 mb-2 line-clamp-1 group-hover:text-brand transition-colors">
        {{ document.keyword }}
      </h3>

      <!-- 내용 미리보기 -->
      <p class="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 min-h-10">
        {{ contentPreview }}
      </p>

      <!-- 메타 정보 -->
      <div class="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
        <div class="flex items-center gap-1">
          <EngineIcon class="w-3.5 h-3.5" />
          <span class="truncate max-w-20">{{ document.engine }}</span>
        </div>
        <div class="flex items-center gap-1">
          <DocIcon class="w-3.5 h-3.5" />
          <span>{{ contentLength }}자</span>
        </div>
        <div class="flex items-center gap-1 ml-auto">
          <TimeIcon class="w-3.5 h-3.5" />
          <span>{{ formatDate(document) }}</span>
        </div>
      </div>
    </div>

    <!-- 호버 시 복사 힌트 -->
    <div class="absolute inset-0 bg-brand/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex items-center justify-center">
      <div class="absolute bottom-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-brand text-white text-xs font-medium rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-2 group-hover:translate-y-0">
        <CopyIcon class="w-3.5 h-3.5" />
        클릭하여 상세보기
      </div>
    </div>
  </article>
</template>
