import { useQuery } from '@tanstack/vue-query';
import { getManuscriptById } from '../api/searchApi';
import type { Ref } from 'vue';

export const useManuscriptDetail = (
  manuscriptId: Ref<string>,
  category?: Ref<string | undefined>
) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['manuscript', manuscriptId, category],
    queryFn: () => getManuscriptById(manuscriptId.value, category?.value),
    enabled: () => !!manuscriptId.value,
    retry: 1,
  });

  return {
    manuscript: data,
    isLoading,
    isError,
    error,
  };
};
