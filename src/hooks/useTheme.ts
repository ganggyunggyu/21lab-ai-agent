import { ref, watch } from 'vue';

export type Theme = 'light' | 'dark';

const THEME_KEY = 'theme-preference';

// 시스템 다크모드 감지
const getSystemTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

// 저장된 테마 또는 시스템 테마 가져오기
const getStoredTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem(THEME_KEY) as Theme;
  return stored || getSystemTheme();
};

const theme = ref<Theme>(getStoredTheme());

// DOM에 테마 클래스 적용
const applyTheme = (newTheme: Theme) => {
  if (typeof document === 'undefined') return;
  
  document.documentElement.classList.remove('light', 'dark');
  document.documentElement.classList.add(newTheme);
  document.documentElement.setAttribute('data-theme', newTheme);
};

// 테마 변경 감지 및 적용
watch(theme, (newTheme) => {
  applyTheme(newTheme);
  localStorage.setItem(THEME_KEY, newTheme);
}, { immediate: true });

// 시스템 테마 변경 감지
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    // 사용자가 수동으로 테마를 설정하지 않았을 때만 시스템 테마 따라가기
    if (!localStorage.getItem(THEME_KEY)) {
      theme.value = e.matches ? 'dark' : 'light';
    }
  });
}

export const useTheme = () => {
  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light';
  };

  const setTheme = (newTheme: Theme) => {
    theme.value = newTheme;
  };

  return {
    theme: theme,
    toggleTheme,
    setTheme,
    isDark: () => theme.value === 'dark',
    isLight: () => theme.value === 'light',
  };
};