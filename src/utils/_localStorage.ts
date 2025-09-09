const STORAGE_KEYS = {
  SELECTED_SERVICE: 'selected_service',
  FREQUENT_KEYWORDS: 'frequent_keywords',
  FAVORITE_SEARCHES: 'favorite_searches',
  SEARCH_HISTORY: 'search_history',
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

// 키워드 관리
export interface FrequentKeyword {
  keyword: string;
  count: number;
  lastUsed: Date;
}

export const getFrequentKeywords = (): FrequentKeyword[] =>
  getStoredValue(STORAGE_KEYS.FREQUENT_KEYWORDS, []);

export const addKeywordToFrequent = (keyword: string): void => {
  const keywords = getFrequentKeywords();
  const existing = keywords.find(k => k.keyword === keyword);
  
  if (existing) {
    existing.count++;
    existing.lastUsed = new Date();
  } else {
    keywords.push({
      keyword,
      count: 1,
      lastUsed: new Date()
    });
  }
  
  // 사용 횟수 순으로 정렬하고 상위 10개만 유지
  keywords.sort((a, b) => b.count - a.count);
  const top10 = keywords.slice(0, 10);
  
  setStoredValue(STORAGE_KEYS.FREQUENT_KEYWORDS, top10);
};

// 즐겨찾기 검색
export interface FavoriteSearch {
  id: string;
  keyword: string;
  refMsg?: string;
  title: string;
  createdAt: Date;
}

export const getFavoriteSearches = (): FavoriteSearch[] =>
  getStoredValue(STORAGE_KEYS.FAVORITE_SEARCHES, []);

export const addFavoriteSearch = (keyword: string, refMsg?: string, title?: string): void => {
  const favorites = getFavoriteSearches();
  const newFavorite: FavoriteSearch = {
    id: Date.now().toString(),
    keyword,
    refMsg,
    title: title || keyword,
    createdAt: new Date()
  };
  
  favorites.unshift(newFavorite);
  
  // 최대 20개까지 유지
  const top20 = favorites.slice(0, 20);
  setStoredValue(STORAGE_KEYS.FAVORITE_SEARCHES, top20);
};

export const removeFavoriteSearch = (id: string): void => {
  const favorites = getFavoriteSearches();
  const filtered = favorites.filter(f => f.id !== id);
  setStoredValue(STORAGE_KEYS.FAVORITE_SEARCHES, filtered);
};

// 검색 히스토리 (유저 메시지 형식)
export interface SearchHistory {
  id: string;
  keyword: string;
  ref?: string;
  service: string;
  timestamp: Date;
}

export const getSearchHistory = (): SearchHistory[] =>
  getStoredValue(STORAGE_KEYS.SEARCH_HISTORY, []);

export const addSearchHistory = (keyword: string, ref?: string, service?: string): void => {
  const history = getSearchHistory();
  
  // 중복 검색 방지 (같은 keyword, ref, service 조합)
  const isDuplicate = history.some(h => 
    h.keyword === keyword && 
    h.ref === ref && 
    h.service === service
  );
  
  if (isDuplicate) return;
  
  const newHistory: SearchHistory = {
    id: Date.now().toString(),
    keyword,
    ref,
    service: service || 'gpt-5-v2',
    timestamp: new Date()
  };
  
  history.unshift(newHistory);
  
  // 최대 15개까지 유지
  const top15 = history.slice(0, 15);
  setStoredValue(STORAGE_KEYS.SEARCH_HISTORY, top15);
};
