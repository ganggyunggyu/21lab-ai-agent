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
  isPublished?: boolean; // 발행원고 여부
  resultSample?: string; // 결과 원고 3줄 샘플
  memo?: string; // 메모 (수정 내역, 발행 일정 등)
  
  // 노출 관리
  isVisible?: boolean; // 노출 여부 (기본값: false)
  exposureRank?: number; // 노출 순위 (낮을수록 우선 순위 높음)
  
  // 채팅 데이터 (발행원고용)
  userMessageId?: string; // 사용자 메시지 ID
  botMessageId?: string; // 봇 메시지 ID
  botContent?: string; // 봇 응답 전체 내용
  service?: string; // 사용된 AI 서비스
  originalTimestamp?: number; // 원본 메시지 타임스탬프
}

export const getFavoriteSearches = (): FavoriteSearch[] =>
  getStoredValue(STORAGE_KEYS.FAVORITE_SEARCHES, []);

export const addFavoriteSearch = (keyword: string, refMsg?: string, title?: string, isPublished?: boolean): void => {
  const favorites = getFavoriteSearches();
  const newFavorite: FavoriteSearch = {
    id: Date.now().toString(),
    keyword,
    refMsg,
    title: title || keyword,
    createdAt: new Date(),
    isPublished: isPublished || false
  };
  
  favorites.unshift(newFavorite);
  
  // 최대 20개까지 유지
  const top20 = favorites.slice(0, 20);
  setStoredValue(STORAGE_KEYS.FAVORITE_SEARCHES, top20);
};

// 발행원고로 등록하는 전용 함수 (채팅 데이터 포함)
export const addPublishedSearch = (
  keyword: string,
  refMsg?: string,
  title?: string,
  resultSample?: string,
  userMessageId?: string,
  botMessageId?: string,
  botContent?: string,
  service?: string,
  originalTimestamp?: number,
  memo?: string
): void => {
  const favorites = getFavoriteSearches();
  const newFavorite: FavoriteSearch = {
    id: Date.now().toString(),
    keyword,
    refMsg,
    title: title || keyword,
    createdAt: new Date(),
    isPublished: true,
    resultSample,
    userMessageId,
    botMessageId,
    botContent,
    service,
    originalTimestamp,
    memo,
  };

  favorites.unshift(newFavorite);
  const top20 = favorites.slice(0, 20);
  setStoredValue(STORAGE_KEYS.FAVORITE_SEARCHES, top20);
};

// 발행원고 메모 업데이트 전용 함수
export const updatePublishedMemo = (id: string, memo: string): void => {
  const favorites = getFavoriteSearches();
  const targetIndex = favorites.findIndex(f => f.id === id);
  
  if (targetIndex !== -1) {
    favorites[targetIndex].memo = memo;
    setStoredValue(STORAGE_KEYS.FAVORITE_SEARCHES, favorites);
  }
};

// 발행원고 노출 설정 업데이트 함수
export const updatePublishedExposure = (id: string, isVisible: boolean, exposureRank?: number): void => {
  const favorites = getFavoriteSearches();
  const targetIndex = favorites.findIndex(f => f.id === id);
  
  if (targetIndex !== -1) {
    favorites[targetIndex].isVisible = isVisible;
    if (exposureRank !== undefined) {
      favorites[targetIndex].exposureRank = exposureRank;
    }
    setStoredValue(STORAGE_KEYS.FAVORITE_SEARCHES, favorites);
  }
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
