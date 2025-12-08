import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { SearchRequest, SearchResponse } from '../model/types';

export const useSearchStore = defineStore(
  'search',
  () => {
    const query = ref('');
    const category = ref('');
    const page = ref(1);
    const limit = ref(20);

    const lastSearchResult = ref<SearchResponse | null>(null);

    const searchRequest = computed<SearchRequest | null>(() => {
      if (!query.value.trim()) return null;

      return {
        query: query.value.trim(),
        category: category.value || undefined,
        page: page.value,
        limit: limit.value,
      };
    });

    const totalPages = computed(() => {
      if (!lastSearchResult.value) return 0;
      return Math.ceil(lastSearchResult.value.total / lastSearchResult.value.limit);
    });

    const updateQuery = (value: string) => {
      query.value = value;
    };

    const updateCategory = (value: string) => {
      category.value = value;
    };

    const updatePage = (value: number) => {
      page.value = value;
    };

    const setSearchResult = (result: SearchResponse | null) => {
      lastSearchResult.value = result;
    };

    const resetPage = () => {
      page.value = 1;
    };

    const clearSearch = () => {
      query.value = '';
      category.value = '';
      page.value = 1;
      lastSearchResult.value = null;
    };

    return {
      query,
      category,
      page,
      limit,
      lastSearchResult,
      searchRequest,
      totalPages,
      updateQuery,
      updateCategory,
      updatePage,
      setSearchResult,
      resetPage,
      clearSearch,
    };
  },
  {
    persist: {
      pick: ['query', 'category', 'page', 'lastSearchResult'],
    },
  }
);
