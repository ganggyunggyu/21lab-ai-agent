import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { ref, type Ref } from 'vue';
import { getBookmarks, addBookmark, removeBookmark } from '../api/searchApi';

export const useBookmarks = (page: Ref<number> = ref(1), limit: number = 10) => {
  const queryClient = useQueryClient();

  const bookmarksQuery = useQuery({
    queryKey: ['bookmarks', page, limit],
    queryFn: () => getBookmarks(page.value, limit),
    staleTime: 1000 * 60, // 1분
  });

  const addMutation = useMutation({
    mutationFn: (manuscriptId: string) => addBookmark(manuscriptId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (manuscriptId: string) => removeBookmark(manuscriptId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    },
  });

  return {
    ...bookmarksQuery,
    addBookmark: addMutation.mutate,
    removeBookmark: removeMutation.mutate,
    isAdding: addMutation.isPending,
    isRemoving: removeMutation.isPending,
  };
};
