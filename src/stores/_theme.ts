import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export type Theme = 'light' | 'dark';

export const useThemeStore = defineStore(
  'theme',
  () => {
    const theme = ref<Theme>('light');

    const isDark = computed(() => theme.value === 'dark');
    const isLight = computed(() => theme.value === 'light');

    const applyTheme = () => {
      if (typeof document === 'undefined') return;
      const root = document.documentElement;
      const body = document.body;
      const isDarkTheme = theme.value === 'dark';

      root.classList.toggle('dark-theme', isDarkTheme);
      root.classList.toggle('light-theme', !isDarkTheme);
      body.classList.toggle('dark-theme', isDarkTheme);
      body.classList.toggle('light-theme', !isDarkTheme);
      root.setAttribute('data-theme', theme.value);
    };

    const toggleTheme = () => {
      theme.value = isLight.value ? 'dark' : 'light';
      applyTheme();
    };

    const setTheme = (newTheme: Theme) => {
      theme.value = newTheme;
      applyTheme();
    };

    const resolveInitialTheme = (): Theme => {
      if (typeof window === 'undefined') {
        return 'light';
      }

      const stored = window.localStorage.getItem('theme-store');
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as { state?: { theme?: Theme } };
          if (parsed?.state?.theme) {
            return parsed.state.theme;
          }
        } catch (error) {
          window.localStorage.removeItem('theme-store');
        }
      }

      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    };

    const handleSystemThemeChange = (event: MediaQueryListEvent) => {
      const stored = typeof window !== 'undefined'
        ? window.localStorage.getItem('theme-store')
        : null;

      if (!stored) {
        theme.value = event.matches ? 'dark' : 'light';
        applyTheme();
      }
    };

    const initTheme = () => {
      theme.value = resolveInitialTheme();
      applyTheme();

      if (typeof window !== 'undefined') {
        const matcher = window.matchMedia('(prefers-color-scheme: dark)');
        if (typeof matcher.addEventListener === 'function') {
          matcher.addEventListener('change', handleSystemThemeChange);
        } else if (typeof matcher.addListener === 'function') {
          matcher.addListener(handleSystemThemeChange);
        }
      }
    };

    return {
      theme,
      isDark,
      isLight,
      toggleTheme,
      setTheme,
      initTheme,
    };
  },
  {
    persist: {
      key: 'theme-store',
      storage: localStorage,
    },
  }
);
