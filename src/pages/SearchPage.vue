<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { NButton, NIcon, NSelect, useMessage } from 'naive-ui';
import { SearchOutline as SearchIcon } from '@vicons/ionicons5';
import { Input } from '@/components/ui';
import { useSearchManuscripts } from '@/entities/search';
import { ManuscriptCard } from '@/features/search';
import type { SearchRequest, SearchDocument } from '@/entities/search';

const router = useRouter();
const message = useMessage();

const query = ref('');
const category = ref<string | undefined>(undefined);
const page = ref(1);
const limit = ref(20);

const categoryOptions = [
  { label: '전체 카테고리', value: undefined },
  { label: '위고비', value: '위고비' },
  { label: '마운자로', value: '마운자로' },
  { label: '다이어트', value: '다이어트' },
  { label: '맛집', value: '맛집' },
  { label: '라미네이트', value: '라미네이트' },
  { label: '리쥬란', value: '리쥬란' },
  { label: '울쎄라', value: '울쎄라' },
  { label: '외국어교육', value: '외국어교육' },
  { label: '미용학원', value: '미용학원' },
];

const searchRequest = computed<SearchRequest | null>(() => {
  if (!query.value.trim()) return null;

  return {
    query: query.value.trim(),
    category: category.value,
    page: page.value,
    limit: limit.value,
  };
});

const { data, isLoading, isError, error, refetch, totalPages } = useSearchManuscripts(searchRequest);

const handleSearch = () => {
  if (!query.value.trim()) {
    message.warning('검색어를 입력해주세요.');
    return;
  }

  page.value = 1;
  refetch();
};

const handlePageChange = (newPage: number) => {
  if (newPage < 1 || newPage > totalPages.value) return;
  page.value = newPage;
};

watch(
  () => page.value,
  () => {
    if (searchRequest.value) {
      refetch();
    }
  }
);

const handleKeyPress = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    handleSearch();
  }
};

const handleCardClick = (doc: SearchDocument) => {
  router.push({
    name: 'ManuscriptDetail',
    params: { id: doc._id },
    state: { document: doc },
  });
};
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 dark:from-gray-950 dark:to-gray-900 p-6">
    <div class="max-w-[1200px] mx-auto">
      <!-- Header -->
      <header class="mb-6">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          원고 검색
        </h1>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          생성된 원고를 키워드로 검색하세요
        </p>
      </header>

      <!-- Search Bar -->
      <NCard class="bg-white dark:bg-gray-800 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] mb-6">
        <div class="flex flex-col md:flex-row gap-3">
          <!-- Search Input -->
          <div class="flex-1">
            <Input
              v-model="query"
              type="text"
              placeholder="검색어를 입력하세요 (예: 위고비, 다이어트)"
              @keydown="handleKeyPress"
              class="w-full"
            />
          </div>

          <!-- Category Select -->
          <div class="w-full md:w-[200px]">
            <NSelect
              v-model:value="category"
              :options="categoryOptions"
              placeholder="카테고리"
              class="w-full"
            />
          </div>

          <!-- Search Button -->
          <NButton
            type="primary"
            size="large"
            @click="handleSearch"
            :loading="isLoading"
            :disabled="!query.trim()"
            class="w-full md:w-auto min-w-[120px] h-[44px] font-bold bg-gradient-to-br from-indigo-500 to-purple-600 border-none shadow-[0_4px_16px_rgba(99,102,241,0.3)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(99,102,241,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <template #icon>
              <NIcon :component="SearchIcon" />
            </template>
            검색
          </NButton>
        </div>
      </NCard>

      <!-- Search Results Summary -->
      <div
        v-if="data && data.documents.length > 0"
        class="mb-4 text-sm text-gray-600 dark:text-gray-400"
      >
        총 <strong class="text-gray-900 dark:text-gray-100">{{ data.total }}</strong>개 결과 중
        <strong class="text-gray-900 dark:text-gray-100">{{ data.skip + 1 }}</strong>~<strong class="text-gray-900 dark:text-gray-100">{{ data.skip + data.documents.length }}</strong>번 표시
      </div>

      <!-- Error State -->
      <div
        v-if="isError"
        class="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-center"
      >
        <p class="text-red-600 dark:text-red-400 font-semibold">
          {{ error?.message || '검색 중 오류가 발생했습니다.' }}
        </p>
      </div>

      <!-- Loading State -->
      <div
        v-if="isLoading"
        class="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div
          v-for="i in 6"
          :key="i"
          class="h-[200px] bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"
        ></div>
      </div>

      <!-- Search Results -->
      <div
        v-if="data && data.documents.length > 0"
        class="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <ManuscriptCard
          v-for="doc in data.documents"
          :key="doc._id"
          :document="doc"
          @click="handleCardClick"
        />
      </div>

      <!-- Empty State -->
      <div
        v-if="data && data.documents.length === 0"
        class="p-10 text-center bg-white dark:bg-gray-800 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
      >
        <p class="text-gray-600 dark:text-gray-400 text-lg">
          검색 결과가 없습니다.
        </p>
      </div>

      <!-- Pagination -->
      <div
        v-if="data && data.documents.length > 0 && totalPages > 1"
        class="mt-6 flex items-center justify-center gap-3"
      >
        <NButton
          @click="handlePageChange(page - 1)"
          :disabled="page === 1 || isLoading"
          size="large"
          class="min-w-[100px]"
        >
          이전
        </NButton>

        <div class="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <span class="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {{ page }} / {{ totalPages }}
          </span>
        </div>

        <NButton
          @click="handlePageChange(page + 1)"
          :disabled="page === totalPages || isLoading"
          size="large"
          class="min-w-[100px]"
        >
          다음
        </NButton>
      </div>

      <!-- Initial State -->
      <div
        v-if="!searchRequest && !isLoading"
        class="p-10 text-center bg-white dark:bg-gray-800 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
      >
        <NIcon :component="SearchIcon" class="text-6xl text-gray-300 dark:text-gray-600 mb-4" />
        <p class="text-gray-600 dark:text-gray-400 text-lg">
          검색어를 입력하고 검색 버튼을 눌러주세요
        </p>
      </div>
    </div>
  </div>
</template>
