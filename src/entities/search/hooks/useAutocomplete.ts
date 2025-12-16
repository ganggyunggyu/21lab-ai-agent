import { useQuery } from '@tanstack/vue-query';
import { computed, type Ref } from 'vue';
import { getAutocomplete } from '../api/searchApi';

export const useAutocomplete = (query: Ref<string>, enabled: Ref<boolean> = computed(() => true)) => {
  return useQuery({
    queryKey: ['autocomplete', query],
    queryFn: () => getAutocomplete(query.value),
    enabled: computed(() => enabled.value && query.value.length >= 2),
    staleTime: 1000 * 60 * 5, // 5분
  });
};
