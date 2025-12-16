import { useQuery } from '@tanstack/vue-query';
import { computed, type Ref } from 'vue';
import { getStats } from '../api/searchApi';

export const useStats = (period: Ref<string> = computed(() => 'week')) => {
  return useQuery({
    queryKey: ['stats', period],
    queryFn: () => getStats(period.value),
    staleTime: 1000 * 60 * 5, // 5분
  });
};
