import { computed, type Ref } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { searchManuscripts } from '../api/searchApi';
import type { SearchRequest } from '../model/types';

export const useSearchManuscripts = (searchRequest: Ref<SearchRequest | null>) => {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['search', searchRequest],
    queryFn: () => {
      if (!searchRequest.value) {
        return Promise.reject(new Error('검색어를 입력해주세요.'));
      }
      return searchManuscripts(searchRequest.value);
    },
    enabled: computed(() => !!searchRequest.value),
    retry: false,
  });

  const totalPages = computed(() => {
    if (!data.value) return 0;
    return Math.ceil(data.value.total / data.value.limit);
  });

  return {
    data,
    isLoading,
    isError,
    error,
    refetch,
    totalPages,
  };
};
