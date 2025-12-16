<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useDebounceFn } from '@vueuse/core';
import {
  SearchOutline as SearchIcon,
  TimeOutline as HistoryIcon,
  TrendingUpOutline as TrendingIcon,
  CloseCircle as ClearIcon,
} from '@vicons/ionicons5';
import { Button, Input, Select, Skeleton } from '@/components/ui';
import { CATEGORY_OPTIONS } from '@/constants';
import {
  useSearchStore,
  useSearchActions,
  useAutocomplete,
  usePopular,
} from '@/entities/search';
import { ManuscriptCard } from '@/features/search';
import { toast } from '@/utils';
import type { SearchDocument } from '@/entities/search';

const router = useRouter();

const searchStore = useSearchStore();
const { query, category, page, searchRequest, totalPages } = storeToRefs(searchStore);

const { searchData, isLoading, isError, error, refetch, executeSearch, changePage } = useSearchActions();

// 자동완성
const showSuggestions = ref(false);
const autocompleteEnabled = computed(() => showSuggestions.value);
const { data: autocompleteData } = useAutocomplete(query, autocompleteEnabled);

// 인기 검색어
const popularPeriod = ref<'today' | 'week' | 'month'>('week');
const { data: popularData, isLoading: isPopularLoading } = usePopular(popularPeriod);

// 디바운스된 자동완성 표시
const debouncedShowSuggestions = useDebounceFn(() => {
  if (query.value.length >= 2) {
    showSuggestions.value = true;
  }
}, 300);

const handleInputChange = () => {
  if (query.value.length < 2) {
    showSuggestions.value = false;
  } else {
    debouncedShowSuggestions();
  }
};

const handleSearch = () => {
  if (!query.value.trim()) {
    toast.warning('검색어를 입력해주세요.');
    return;
  }
  showSuggestions.value = false;
  executeSearch();
};

const handleSuggestionClick = (keyword: string) => {
  query.value = keyword;
  showSuggestions.value = false;
  executeSearch();
};

const handlePopularClick = (keyword: string) => {
  query.value = keyword;
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
  if (e.isComposing || (e as unknown as { keyCode?: number }).keyCode === 229) {
    return;
  }
  if (e.key === 'Enter') {
    handleSearch();
  }
  if (e.key === 'Escape') {
    showSuggestions.value = false;
  }
};

const handleCardClick = (doc: SearchDocument) => {
  router.push({
    name: 'ManuscriptDetail',
    params: { id: doc._id },
    query: {
      category: doc.__category || category.value || undefined,
    },
  });
};

const clearQuery = () => {
  query.value = '';
  showSuggestions.value = false;
};

// 검색 결과 여부
const hasResults = computed(() => searchData.value && searchData.value.documents.length > 0);
const hasNoResults = computed(() => searchData.value && searchData.value.documents.length === 0);
const showInitialState = computed(() => !searchRequest.value && !isLoading.value);
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
          <!-- Search Input with Autocomplete -->
          <div class="flex-1 relative">
            <div class="relative">
              <Input
                v-model="query"
                type="text"
                placeholder="검색어를 입력하세요 (예: 위고비, 다이어트)"
                @keydown="handleKeyPress"
                @input="handleInputChange"
                @focus="handleInputChange"
                @blur="() => setTimeout(() => showSuggestions = false, 200)"
                class="w-full pr-10"
              />
              <button
                v-if="query"
                @click="clearQuery"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <ClearIcon class="w-5 h-5" />
              </button>
            </div>

            <!-- Autocomplete Dropdown -->
            <div
              v-if="showSuggestions && autocompleteData?.suggestions?.length"
              class="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 overflow-hidden"
            >
              <ul class="py-2">
                <li
                  v-for="item in autocompleteData.suggestions"
                  :key="item.keyword"
                  @mousedown.prevent="handleSuggestionClick(item.keyword)"
                  class="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center justify-between"
                >
                  <span class="text-gray-900 dark:text-gray-100">{{ item.keyword }}</span>
                  <span class="text-xs text-gray-500">{{ item.count }}건</span>
                </li>
              </ul>
            </div>
          </div>

          <!-- Category Select -->
          <div class="w-full md:w-[200px]">
            <Select
              v-model="category"
              :options="CATEGORY_OPTIONS"
              placeholder="전체 카테고리"
              size="md"
              searchable
              :max-height="350"
            />
          </div>

          <!-- Search Button -->
          <Button
            color="primary"
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

      <!-- Popular Keywords (Initial State) -->
      <div
        v-if="showInitialState"
        class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-black/30 border border-gray-200 dark:border-gray-700 p-6"
      >
        <div class="flex items-center gap-2 mb-4">
          <TrendingIcon class="w-5 h-5 text-brand" />
          <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">인기 검색어</h2>
          <div class="flex gap-1 ml-auto">
            <button
              v-for="p in (['today', 'week', 'month'] as const)"
              :key="p"
              @click="popularPeriod = p"
              :class="[
                'px-3 py-1 text-sm rounded-lg transition-colors',
                popularPeriod === p
                  ? 'bg-brand text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              ]"
            >
              {{ p === 'today' ? '오늘' : p === 'week' ? '이번주' : '이번달' }}
            </button>
          </div>
        </div>

        <div v-if="isPopularLoading" class="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Skeleton v-for="i in 10" :key="i" variant="rectangular" height="40px" />
        </div>

        <div v-else-if="popularData?.keywords?.length" class="grid grid-cols-2 md:grid-cols-5 gap-3">
          <button
            v-for="item in popularData.keywords"
            :key="item.rank"
            @click="handlePopularClick(item.keyword)"
            class="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-left"
          >
            <span
              :class="[
                'w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold',
                item.rank <= 3 ? 'bg-brand text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
              ]"
            >
              {{ item.rank }}
            </span>
            <span class="text-sm text-gray-900 dark:text-gray-100 truncate flex-1">{{ item.keyword }}</span>
            <span class="text-xs text-gray-500">{{ item.count }}</span>
          </button>
        </div>

        <div v-else class="text-center py-8">
          <SearchIcon class="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p class="text-gray-500 dark:text-gray-400">검색어를 입력하고 검색 버튼을 눌러주세요</p>
        </div>
      </div>

      <!-- Search Results Summary -->
      <div
        v-if="hasResults"
        class="mb-4 text-sm text-gray-600 dark:text-gray-400"
      >
        총 <strong class="text-gray-900 dark:text-gray-100">{{ searchData!.total }}</strong>개 결과 중
        <strong class="text-gray-900 dark:text-gray-100">{{ searchData!.skip + 1 }}</strong>~<strong class="text-gray-900 dark:text-gray-100">{{ searchData!.skip + searchData!.documents.length }}</strong>번 표시
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
        <article
          v-for="i in 6"
          :key="i"
          class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          <!-- 카테고리 바 스켈레톤 -->
          <div class="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
            <Skeleton variant="text" width="80px" height="16px" />
          </div>
          <!-- 메인 컨텐츠 스켈레톤 -->
          <div class="p-4">
            <Skeleton variant="text" width="70%" height="20px" class="mb-2" />
            <Skeleton variant="text" :lines="2" class="mb-4" />
            <!-- 메타 정보 스켈레톤 -->
            <div class="flex items-center gap-3">
              <Skeleton variant="rectangular" width="70px" height="16px" rounded />
              <Skeleton variant="rectangular" width="50px" height="16px" rounded />
              <div class="ml-auto">
                <Skeleton variant="rectangular" width="90px" height="16px" rounded />
              </div>
            </div>
          </div>
        </article>
      </div>

      <!-- Search Results -->
      <div
        v-if="hasResults && !isLoading"
        class="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <ManuscriptCard
          v-for="doc in searchData!.documents"
          :key="doc._id"
          :document="doc"
          @click="handleCardClick"
        />
      </div>

      <!-- Empty State -->
      <div
        v-if="hasNoResults"
        class="p-10 text-center bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-black/30 border border-gray-200 dark:border-gray-700"
      >
        <p class="text-gray-600 dark:text-gray-400 text-lg">
          검색 결과가 없습니다.
        </p>
      </div>

      <!-- Pagination -->
      <div
        v-if="hasResults && totalPages > 1"
        class="mt-6 flex items-center justify-center gap-3"
      >
        <Button
          color="light"
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
          color="light"
          size="md"
          @click="handlePageChange(page + 1)"
          :disabled="page === totalPages || isLoading"
          class="min-w-[100px]"
        >
          다음
        </Button>
      </div>
    </div>
  </div>
</template>
