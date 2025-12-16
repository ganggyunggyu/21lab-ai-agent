import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import {
  getSearchHistory,
  addSearchHistory,
  deleteSearchHistory,
  clearSearchHistory,
} from '../api/searchApi';

export const useSearchHistory = (limit: number = 10) => {
  const queryClient = useQueryClient();

  const historyQuery = useQuery({
    queryKey: ['searchHistory', limit],
    queryFn: () => getSearchHistory(limit),
    staleTime: 1000 * 60, // 1분
  });

  const addMutation = useMutation({
    mutationFn: ({ keyword, category }: { keyword: string; category?: string }) =>
      addSearchHistory(keyword, category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['searchHistory'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteSearchHistory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['searchHistory'] });
    },
  });

  const clearMutation = useMutation({
    mutationFn: clearSearchHistory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['searchHistory'] });
    },
  });

  return {
    ...historyQuery,
    addHistory: addMutation.mutate,
    deleteHistory: deleteMutation.mutate,
    clearHistory: clearMutation.mutate,
    isAdding: addMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isClearing: clearMutation.isPending,
  };
};
