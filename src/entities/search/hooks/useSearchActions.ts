import { computed, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useQuery } from '@tanstack/vue-query';
import { useSearchStore } from '../stores/searchStore';
import { searchManuscripts } from '../api/searchApi';

export const useSearchActions = () => {
  const searchStore = useSearchStore();
  const { searchRequest, lastSearchResult } = storeToRefs(searchStore);
  const { setSearchResult, resetPage } = searchStore;

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['search', searchRequest],
    queryFn: () => {
      if (!searchRequest.value) {
        return Promise.reject(new Error('검색어를 입력해주세요.'));
      }
      return searchManuscripts(searchRequest.value);
    },
    enabled: false,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  watch(data, (newData) => {
    if (newData) {
      setSearchResult(newData);
    }
  });

  const searchData = computed(() => data.value ?? lastSearchResult.value);

  const executeSearch = () => {
    if (!searchRequest.value) return false;
    resetPage();
    refetch();
    return true;
  };

  const changePage = (newPage: number) => {
    const { totalPages, updatePage } = searchStore;
    if (newPage < 1 || newPage > totalPages) return;
    updatePage(newPage);
  };

  return {
    searchData,
    isLoading,
    isError,
    error,
    refetch,
    executeSearch,
    changePage,
  };
};
