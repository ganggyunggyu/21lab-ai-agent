const STORAGE_KEYS = {
  SELECTED_SERVICE: 'selected_service',
} as const;

export const getStoredValue = <T>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
};

export const setStoredValue = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('localStorage 저장 실패:', error);
  }
};

export const removeStoredValue = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('localStorage 삭제 실패:', error);
  }
};

export const getSelectedService = () =>
  getStoredValue(STORAGE_KEYS.SELECTED_SERVICE, 'gpt-5-v2');
export const setSelectedService = (service: string) =>
  setStoredValue(STORAGE_KEYS.SELECTED_SERVICE, service);
