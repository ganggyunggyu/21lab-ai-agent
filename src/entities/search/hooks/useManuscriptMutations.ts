import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { updateManuscript, deleteManuscript, toggleVisibility } from '../api/searchApi';
import type { UpdateManuscriptRequest, ToggleVisibilityRequest } from '../model/types';
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

  const toggleVisibilityMutation = useMutation({
    mutationFn: (params: ToggleVisibilityRequest) => toggleVisibility(params),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['manuscripts'] });
      queryClient.invalidateQueries({ queryKey: ['searchResults'] });
      queryClient.invalidateQueries({ queryKey: ['manuscriptDetail'] });
      const message = data.isVisible ? '노출 ON' : '노출 OFF';
      toast.success(message);
    },
    onError: () => {
      toast.error('노출 설정 변경에 실패했습니다.');
    },
  });

  return {
    updateManuscript: updateMutation.mutate,
    deleteManuscript: deleteMutation.mutate,
    toggleVisibility: toggleVisibilityMutation.mutate,
    toggleVisibilityAsync: toggleVisibilityMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isTogglingVisibility: toggleVisibilityMutation.isPending,
  };
};
