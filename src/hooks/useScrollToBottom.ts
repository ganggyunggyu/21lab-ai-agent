import { ref, type Ref } from 'vue';
import type { NScrollbar } from 'naive-ui';

export const useScrollToBottom = (scrollbarRef: Ref<InstanceType<typeof NScrollbar> | null>) => {
  const showScrollToBottom = ref(false);

  const hardScrollToBottom = (isSmooth: boolean = true) => {
    try {
      // NScrollbar 내부 DOM 직접 접근
      const scrollbarEl = scrollbarRef.value?.$el as HTMLElement | undefined;
      const contentEl = scrollbarEl?.querySelector('.n-scrollbar-container') as HTMLElement | null;

      if (contentEl) {
        contentEl.scrollTo({
          top: contentEl.scrollHeight,
          behavior: isSmooth ? 'smooth' : 'auto'
        });
      } else {
        // fallback
        scrollbarRef.value?.scrollTo({ top: 1e9, left: 0, behavior: isSmooth ? 'smooth' : 'auto' });
      }
    } catch (err) {
      console.warn('Scroll failed:', err);
    }
  };

  const checkScrollPosition = (e: Event) => {
    try {
      // NScrollbar의 실제 스크롤 컨테이너 찾기
      let target = e.target as HTMLElement;

      // .n-scrollbar-container 요소 찾기
      if (!target.classList.contains('n-scrollbar-container')) {
        const scrollbarEl = scrollbarRef.value?.$el as HTMLElement | undefined;
        const containerEl = scrollbarEl?.querySelector('.n-scrollbar-container') as HTMLElement | null;
        if (containerEl) {
          target = containerEl;
        }
      }

      if (!target) return;

      const { scrollTop, scrollHeight, clientHeight } = target;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

      showScrollToBottom.value = distanceFromBottom > 50;
    } catch (err) {
      console.warn('Check scroll position failed:', err);
    }
  };

  const handleScrollToBottom = () => {
    hardScrollToBottom(true);
  };

  return {
    showScrollToBottom,
    checkScrollPosition,
    handleScrollToBottom,
  };
};