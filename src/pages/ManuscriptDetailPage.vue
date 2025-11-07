<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { NButton, NIcon, useMessage } from 'naive-ui';
import { ArrowBackOutline as BackIcon, CopyOutline as CopyIcon } from '@vicons/ionicons5';
import { useManuscriptDetail } from '@/entities/search';

const route = useRoute();
const router = useRouter();
const message = useMessage();

// URL params에서 ID 가져오기
const manuscriptId = ref(route.params.id as string);

// URL query에서 category 가져오기
const category = ref(route.query.category as string | undefined);

// API로 원고 데이터 가져오기
const { manuscript, isLoading, isError, error } = useManuscriptDetail(manuscriptId, category);

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
  if (!manuscript.value) return;

  try {
    await navigator.clipboard.writeText(manuscript.value.content);
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
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 dark:from-gray-950 dark:to-gray-900 p-6">
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

      <!-- Loading State -->
      <div v-if="isLoading" class="bg-white dark:bg-gray-800 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] p-8">
        <div class="animate-pulse space-y-6">
          <div class="h-10 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div class="space-y-2">
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="isError" class="bg-white dark:bg-gray-800 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] p-8 text-center">
        <p class="text-red-600 dark:text-red-400 font-semibold text-lg">
          {{ error?.message || '원고를 불러오는 중 오류가 발생했습니다.' }}
        </p>
      </div>

      <!-- Main Card -->
      <div v-else-if="manuscript" class="bg-white dark:bg-gray-800 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] p-8">
        <!-- Title & Actions -->
        <div class="flex items-start justify-between mb-6">
          <div class="flex-1">
            <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
              {{ manuscript.keyword }}
            </h1>
            <div class="flex items-center gap-3 flex-wrap">
              <span
                v-if="manuscript.category"
                class="px-3 py-1.5 text-sm font-semibold bg-indigo-500/10 dark:bg-blue-500/20 text-indigo-600 dark:text-blue-400 rounded-lg"
              >
                {{ manuscript.category }}
              </span>
              <span class="text-sm text-gray-600 dark:text-gray-400">
                {{ manuscript.engine }}
              </span>
              <span class="text-sm text-gray-400 dark:text-gray-500">•</span>
              <span class="text-sm text-gray-600 dark:text-gray-400">
                {{ formatDate(manuscript.timestamp) }}
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
          <pre class="whitespace-pre-wrap text-base leading-relaxed text-gray-700 dark:text-gray-300 font-sans">{{ manuscript.content }}</pre>
        </div>

        <!-- Reference (if exists) -->
        <div v-if="manuscript.ref" class="mt-8 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
          <h3 class="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
            참조 원고
          </h3>
          <pre class="whitespace-pre-wrap text-sm text-gray-600 dark:text-gray-400 font-sans">{{ manuscript.ref }}</pre>
        </div>

        <!-- Metadata -->
        <div class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
            <div class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
              서비스
            </div>
            <div class="text-base font-bold text-gray-900 dark:text-gray-100">
              {{ manuscript.service || 'N/A' }}
            </div>
          </div>
          <div class="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
            <div class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
              작업 시작일
            </div>
            <div class="text-base font-bold text-gray-900 dark:text-gray-100">
              {{ manuscript.work_start_date || 'N/A' }}
            </div>
          </div>
          <div class="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
            <div class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
              테스트 모드
            </div>
            <div class="text-base font-bold text-gray-900 dark:text-gray-100">
              {{ manuscript.test_mode ? 'Yes' : 'No' }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
