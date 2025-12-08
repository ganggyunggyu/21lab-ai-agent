<script setup lang="ts">
import { watch } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { SearchOutline as SearchIcon } from '@vicons/ionicons5';
import { Button, Input, Select } from '@/components/ui';
import { CATEGORY_OPTIONS } from '@/constants';
import { useSearchStore, useSearchActions } from '@/entities/search';
import { ManuscriptCard } from '@/features/search';
import type { SearchDocument } from '@/entities/search';

const router = useRouter();

const searchStore = useSearchStore();
const { query, category, page, searchRequest, totalPages } = storeToRefs(searchStore);
const { updateQuery, updateCategory } = searchStore;

const { searchData, isLoading, isError, error, refetch, executeSearch, changePage } = useSearchActions();

const showToast = (text: string, type: 'success' | 'error' | 'warning' = 'success') => {
  const toast = document.createElement('div');
  const bgColor = type === 'success' ? 'bg-emerald-500' : type === 'error' ? 'bg-red-500' : 'bg-amber-500';
  toast.className = `fixed top-4 left-1/2 -translate-x-1/2 ${bgColor} text-white px-6 py-3 rounded-xl shadow-lg z-[9999] animate-[slideDown_0.3s_ease-out]`;
  toast.textContent = text;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
};

const handleSearch = () => {
  if (!query.value.trim()) {
    showToast('검색어를 입력해주세요.', 'warning');
    return;
  }
  executeSearch();
};

const handlePageChange = (newPage: number) => {
  changePage(newPage);
};

watch(page, () => {
  if (searchRequest.value) {
    refetch();
  }
});

const handleKeyPress = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    handleSearch();
  }
};

const handleCardClick = (doc: SearchDocument) => {
  router.push({
    name: 'ManuscriptDetail',
    params: { id: doc._id },
    query: {
      category: category.value || undefined,
    },
  });
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
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
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-black/30 border border-gray-200 dark:border-gray-700 mb-6 p-6">
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
            <Select
              v-model="category"
              :options="CATEGORY_OPTIONS"
              placeholder="카테고리"
              size="md"
              searchable
              :max-height="350"
            />
          </div>

          <!-- Search Button -->
          <Button
            variant="primary"
            size="md"
            @click="handleSearch"
            :disabled="!query.trim() || isLoading"
            class="w-full md:w-auto min-w-[120px]"
          >
            <SearchIcon class="w-5 h-5" />
            {{ isLoading ? '검색중...' : '검색' }}
          </Button>
        </div>
      </div>

      <!-- Search Results Summary -->
      <div
        v-if="searchData && searchData.documents.length > 0"
        class="mb-4 text-sm text-gray-600 dark:text-gray-400"
      >
        총 <strong class="text-gray-900 dark:text-gray-100">{{ searchData.total }}</strong>개 결과 중
        <strong class="text-gray-900 dark:text-gray-100">{{ searchData.skip + 1 }}</strong>~<strong class="text-gray-900 dark:text-gray-100">{{ searchData.skip + searchData.documents.length }}</strong>번 표시
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
        v-if="searchData && searchData.documents.length > 0"
        class="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <ManuscriptCard
          v-for="doc in searchData.documents"
          :key="doc._id"
          :document="doc"
          @click="handleCardClick"
        />
      </div>

      <!-- Empty State -->
      <div
        v-if="searchData && searchData.documents.length === 0"
        class="p-10 text-center bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-black/30 border border-gray-200 dark:border-gray-700"
      >
        <p class="text-gray-600 dark:text-gray-400 text-lg">
          검색 결과가 없습니다.
        </p>
      </div>

      <!-- Pagination -->
      <div
        v-if="searchData && searchData.documents.length > 0 && totalPages > 1"
        class="mt-6 flex items-center justify-center gap-3"
      >
        <Button
          variant="secondary"
          size="md"
          @click="handlePageChange(page - 1)"
          :disabled="page === 1 || isLoading"
          class="min-w-[100px]"
        >
          이전
        </Button>

        <div class="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <span class="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {{ page }} / {{ totalPages }}
          </span>
        </div>

        <Button
          variant="secondary"
          size="md"
          @click="handlePageChange(page + 1)"
          :disabled="page === totalPages || isLoading"
          class="min-w-[100px]"
        >
          다음
        </Button>
      </div>

      <!-- Initial State -->
      <div
        v-if="!searchRequest && !isLoading"
        class="p-10 text-center bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-black/30 border border-gray-200 dark:border-gray-700"
      >
        <SearchIcon class="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <p class="text-gray-600 dark:text-gray-400 text-lg">
          검색어를 입력하고 검색 버튼을 눌러주세요
        </p>
      </div>
    </div>
  </div>
</template>

<style>
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translate(-50%, -20px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}
</style>
