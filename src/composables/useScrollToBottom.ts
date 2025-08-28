import { ref, type Ref } from 'vue';
import type { NScrollbar } from 'naive-ui';

export const useScrollToBottom = (scrollbarRef: Ref<InstanceType<typeof NScrollbar> | null>) => {
  const showScrollToBottom = ref(false);

  const hardScrollToBottom = (isSmooth: boolean = true) => {
    try {
      if (isSmooth) {
        scrollbarRef.value?.scrollTo({ top: 1e9, left: 0, behavior: 'smooth' });
      } else {
        scrollbarRef.value?.scrollTo({ top: 1e9, left: 0 });
      }
    } catch {}
  };

  const checkScrollPosition = (e: Event) => {
    const target = e.target as HTMLElement;
    if (!target) return;

    const { scrollTop, scrollHeight, clientHeight } = target;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    showScrollToBottom.value = distanceFromBottom > 50;
  };

  const handleScrollToBottom = () => {
    hardScrollToBottom(true);
  };

  return {
    showScrollToBottom,
    hardScrollToBottom,
    checkScrollPosition,
    handleScrollToBottom,
  };
};