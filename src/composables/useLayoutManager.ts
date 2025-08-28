import { ref, onMounted, onBeforeUnmount, type Ref } from 'vue';

export const useLayoutManager = () => {
  const appRef = ref<HTMLElement | null>(null);
  const headerRef = ref<HTMLElement | null>(null);
  const footerRef = ref<HTMLElement | null>(null);

  const updateLayoutVars = () => {
    const headerH = headerRef.value?.getBoundingClientRect().height ?? 84;
    const footerH = footerRef.value?.getBoundingClientRect().height ?? 140;
    appRef.value?.style.setProperty('--header-h', `${Math.round(headerH)}px`);
    appRef.value?.style.setProperty('--footer-h', `${Math.round(footerH)}px`);
  };

  onMounted(() => {
    updateLayoutVars();
    window.addEventListener('resize', updateLayoutVars);
  });

  onBeforeUnmount(() => {
    window.removeEventListener('resize', updateLayoutVars);
  });

  return {
    appRef,
    headerRef,
    footerRef,
    updateLayoutVars,
  };
};