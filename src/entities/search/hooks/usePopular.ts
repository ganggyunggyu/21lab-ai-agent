import { useQuery } from '@tanstack/vue-query';
import { computed, type Ref } from 'vue';
import { getPopularKeywords } from '../api/searchApi';
import type { PopularPeriod } from '../model/types';

export const usePopular = (
  period: Ref<PopularPeriod> = computed(() => 'week'),
  limit: number = 10
) => {
  return useQuery({
    queryKey: ['popular', period, limit],
    queryFn: () => getPopularKeywords(period.value, limit),
    staleTime: 1000 * 60 * 10, // 10분
  });
};
