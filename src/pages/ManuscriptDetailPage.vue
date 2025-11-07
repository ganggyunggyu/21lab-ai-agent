<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { NButton, NIcon, useMessage } from 'naive-ui';
import { ArrowBackOutline as BackIcon, CopyOutline as CopyIcon } from '@vicons/ionicons5';
import type { SearchDocument } from '@/entities/search';

const route = useRoute();
const router = useRouter();
const message = useMessage();

const document = ref<SearchDocument | null>(null);

onMounted(() => {
  // 라우터 state에서 document 가져오기
  const routeState = history.state as { document?: SearchDocument };
  if (routeState?.document) {
    document.value = routeState.document;
  } else {
    // document가 없으면 검색 페이지로 리다이렉트
    message.error('원고 정보를 찾을 수 없습니다.');
    router.push({ name: 'Search' });
  }
});

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const handleCopy = async () => {
  if (!document.value) return;

  try {
    await navigator.clipboard.writeText(document.value.content);
    message.success('원고가 복사되었습니다.');
  } catch (err) {
    message.error('복사에 실패했습니다.');
  }
};

const handleBack = () => {
  router.back();
};
</script>

<template>
  <div v-if="document" class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 dark:from-gray-950 dark:to-gray-900 p-6">
    <div class="max-w-[900px] mx-auto">
      <!-- Header -->
      <header class="mb-6 flex items-center gap-4">
        <NButton
          text
          size="large"
          @click="handleBack"
          class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
        >
          <template #icon>
            <NIcon :component="BackIcon" />
          </template>
          뒤로가기
        </NButton>
      </header>

      <!-- Main Card -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] p-8">
        <!-- Title & Actions -->
        <div class="flex items-start justify-between mb-6">
          <div class="flex-1">
            <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
              {{ document.keyword }}
            </h1>
            <div class="flex items-center gap-3 flex-wrap">
              <span
                v-if="document.category"
                class="px-3 py-1.5 text-sm font-semibold bg-indigo-500/10 dark:bg-blue-500/20 text-indigo-600 dark:text-blue-400 rounded-lg"
              >
                {{ document.category }}
              </span>
              <span class="text-sm text-gray-600 dark:text-gray-400">
                {{ document.engine }}
              </span>
              <span class="text-sm text-gray-400 dark:text-gray-500">•</span>
              <span class="text-sm text-gray-600 dark:text-gray-400">
                {{ formatDate(document.timestamp) }}
              </span>
            </div>
          </div>
          <NButton
            type="primary"
            size="large"
            @click="handleCopy"
            class="ml-4 font-bold bg-gradient-to-br from-indigo-500 to-purple-600 border-none shadow-[0_4px_16px_rgba(99,102,241,0.3)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(99,102,241,0.4)]"
          >
            <template #icon>
              <NIcon :component="CopyIcon" />
            </template>
            복사
          </NButton>
        </div>

        <!-- Divider -->
        <div class="h-px bg-gray-200 dark:bg-gray-700 mb-6"></div>

        <!-- Content -->
        <div class="prose prose-slate dark:prose-invert max-w-none">
          <pre class="whitespace-pre-wrap text-base leading-relaxed text-gray-700 dark:text-gray-300 font-sans">{{ document.content }}</pre>
        </div>

        <!-- Reference (if exists) -->
        <div v-if="document.ref" class="mt-8 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
          <h3 class="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
            참조 원고
          </h3>
          <pre class="whitespace-pre-wrap text-sm text-gray-600 dark:text-gray-400 font-sans">{{ document.ref }}</pre>
        </div>

        <!-- Metadata -->
        <div class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
            <div class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
              서비스
            </div>
            <div class="text-base font-bold text-gray-900 dark:text-gray-100">
              {{ document.service || 'N/A' }}
            </div>
          </div>
          <div class="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
            <div class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
              작업 시작일
            </div>
            <div class="text-base font-bold text-gray-900 dark:text-gray-100">
              {{ document.work_start_date || 'N/A' }}
            </div>
          </div>
          <div class="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
            <div class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
              테스트 모드
            </div>
            <div class="text-base font-bold text-gray-900 dark:text-gray-100">
              {{ document.test_mode ? 'Yes' : 'No' }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
