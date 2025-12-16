import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { updateManuscript, deleteManuscript } from '../api/searchApi';
import type { UpdateManuscriptRequest } from '../model/types';
import { toast } from '@/utils';

export const useManuscriptMutations = () => {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdateManuscriptRequest }) =>
      updateManuscript(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manuscripts'] });
      queryClient.invalidateQueries({ queryKey: ['searchResults'] });
      toast.success('원고가 수정되었습니다.');
    },
    onError: () => {
      toast.error('원고 수정에 실패했습니다.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteManuscript(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manuscripts'] });
      queryClient.invalidateQueries({ queryKey: ['searchResults'] });
      toast.success('원고가 삭제되었습니다.');
    },
    onError: () => {
      toast.error('원고 삭제에 실패했습니다.');
    },
  });

  return {
    updateManuscript: updateMutation.mutate,
    deleteManuscript: deleteMutation.mutate,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
