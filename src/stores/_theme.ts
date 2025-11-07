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
      const isDarkTheme = theme.value === 'dark';

      root.classList.toggle('dark', isDarkTheme);
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
          const parsed = JSON.parse(stored) as { theme?: Theme };
          if (parsed?.theme) {
            return parsed.theme;
          }
        } catch (error) {
          window.localStorage.removeItem('theme-store');
        }
      }

      // 기본값은 항상 light
      return 'light';
    };

    const initTheme = () => {
      theme.value = resolveInitialTheme();
      applyTheme();
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
      paths: ['theme'],
    },
  }
);
